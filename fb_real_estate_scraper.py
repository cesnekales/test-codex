import asyncio
import json
import os
import re
from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from playwright.async_api import BrowserContext, Page, async_playwright
from playwright_stealth import stealth_async


@dataclass
class Listing:
    id: str
    title: str
    price_raw: float
    location: str
    url: str
    seller_name: str
    is_private: bool
    source: str


class FacebookRealEstateScraper:
    GRAPHQL_HINTS = (
        "marketplace",
        "group",
        "real estate",
        "graphql",
        "feed",
    )

    def __init__(self, headless: bool = True) -> None:
        self.headless = headless
        self._captured: List[Dict[str, Any]] = []

    async def _inject_session(self, context: BrowserContext) -> None:
        cookies_json = os.getenv("FB_SESSION_COOKIES_JSON", "[]")
        cookies = json.loads(cookies_json)
        if not isinstance(cookies, list) or not cookies:
            raise ValueError("FB_SESSION_COOKIES_JSON must be a non-empty JSON array of Playwright cookies")

        normalized = []
        for c in cookies:
            normalized.append(
                {
                    "name": c["name"],
                    "value": c["value"],
                    "domain": c.get("domain", ".facebook.com"),
                    "path": c.get("path", "/"),
                    "httpOnly": bool(c.get("httpOnly", True)),
                    "secure": bool(c.get("secure", True)),
                    "sameSite": c.get("sameSite", "Lax"),
                }
            )
        await context.add_cookies(normalized)

    async def _intercept_graphql(self, page: Page) -> None:
        async def handle_response(response) -> None:
            url = response.url.lower()
            if "graphql" not in url:
                return

            req = response.request
            post_data = req.post_data or ""
            body = post_data.lower()
            if not any(hint in body for hint in self.GRAPHQL_HINTS):
                return

            try:
                payload = await response.json()
            except Exception:
                return

            self._captured.append({"url": response.url, "payload": payload, "post_data": post_data})

        page.on("response", handle_response)

    @staticmethod
    def _pick_text(node: Dict[str, Any], *paths: str) -> str:
        for path in paths:
            cursor: Any = node
            ok = True
            for part in path.split("."):
                if isinstance(cursor, dict) and part in cursor:
                    cursor = cursor[part]
                else:
                    ok = False
                    break
            if ok and cursor is not None:
                return str(cursor).strip()
        return ""

    @staticmethod
    def _extract_price(raw: str) -> float:
        cleaned = re.sub(r"[^\d,.]", "", raw).replace(" ", "")
        if cleaned.count(",") == 1 and cleaned.count(".") == 0:
            cleaned = cleaned.replace(",", ".")
        cleaned = cleaned.replace(",", "")
        try:
            return float(cleaned)
        except ValueError:
            return 0.0

    def _parse_listing_node(self, node: Dict[str, Any], source: str) -> Optional[Listing]:
        listing_id = self._pick_text(node, "id", "listing.id", "story.id")
        title = self._pick_text(node, "title", "listing.title", "marketplace_listing_title.text", "message.text")
        price_text = self._pick_text(node, "price", "listing.price.formatted_amount", "listing_price.text", "price_text.text")
        location = self._pick_text(node, "location.reverse_geocode.city", "location_text.text", "location.name")
        seller_name = self._pick_text(node, "seller.name", "listing.seller.name", "actors.0.name")
        seller_history = self._pick_text(node, "seller.joined_text", "seller.profile_url", "seller.id")
        url = self._pick_text(node, "url", "listing.url", "story.url")

        if not listing_id or not title:
            return None

        return Listing(
            id=listing_id,
            title=title,
            price_raw=self._extract_price(price_text),
            location=location,
            url=url,
            seller_name=seller_name,
            is_private=("private" in seller_history.lower() or "new" in seller_history.lower()),
            source=source,
        )

    def _walk(self, obj: Any, source: str, out: List[Listing]) -> None:
        if isinstance(obj, dict):
            maybe = self._parse_listing_node(obj, source)
            if maybe:
                out.append(maybe)
            for v in obj.values():
                self._walk(v, source, out)
        elif isinstance(obj, list):
            for v in obj:
                self._walk(v, source, out)

    def _parse_payloads(self) -> List[Dict[str, Any]]:
        results: List[Listing] = []
        for item in self._captured:
            post_data = (item.get("post_data") or "").lower()
            source = "Marketplace" if "marketplace" in post_data else "Group"
            self._walk(item.get("payload"), source, results)

        dedup: Dict[str, Listing] = {}
        for listing in results:
            dedup[listing.id] = listing
        return [asdict(v) for v in dedup.values()]

    async def scrape(self, marketplace_url: str, group_url: str) -> List[Dict[str, Any]]:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=self.headless)
            context = await browser.new_context()
            await self._inject_session(context)
            page = await context.new_page()
            await stealth_async(page)
            await self._intercept_graphql(page)

            await page.goto("https://www.facebook.com/", wait_until="domcontentloaded")
            await page.goto(marketplace_url, wait_until="networkidle")
            await page.wait_for_timeout(3000)
            await page.goto(group_url, wait_until="networkidle")
            await page.wait_for_timeout(3000)

            parsed = self._parse_payloads()
            await context.close()
            await browser.close()
            return parsed


def validate_schema(rows: List[Dict[str, Any]]) -> None:
    required = {
        "id": str,
        "title": str,
        "price_raw": (int, float),
        "location": str,
        "url": str,
        "seller_name": str,
        "is_private": bool,
        "source": str,
    }
    for row in rows:
        for key, t in required.items():
            if key not in row:
                raise AssertionError(f"Missing key: {key}")
            if not isinstance(row[key], t):
                raise AssertionError(f"{key} has invalid type: {type(row[key])}")
        if row["source"] not in {"Marketplace", "Group"}:
            raise AssertionError(f"Invalid source value: {row['source']}")


async def main() -> None:
    load_dotenv()

    marketplace_url = os.getenv(
        "FB_MARKETPLACE_URL",
        "https://www.facebook.com/marketplace/prague/propertyrentals",
    )
    group_url = os.getenv("FB_GROUP_URL", "https://www.facebook.com/groups/"
    )

    scraper = FacebookRealEstateScraper(headless=os.getenv("HEADLESS", "true").lower() == "true")
    data = await scraper.scrape(marketplace_url=marketplace_url, group_url=group_url)
    validate_schema(data)
    print(json.dumps(data, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
