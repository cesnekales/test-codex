# Mindset Stack Mobile (Expo + TypeScript)

A text-only Expo React Native app (no binary assets) with:
- Home dashboard
- 5 life-area tabs: **Study, Work, Sport, Relationships, Nutrition**
- Bottom-tab navigation in `src/navigation`
- Screen components in `src/screens`
- Local persistence with **AsyncStorage**
- Emoji + vector tab icons via `@expo/vector-icons`

## Requirements
- Node.js 18+
- npm 9+

## Run locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start Expo:
   ```bash
   npx expo start
   ```
3. Open app:
   - Press `i` for iOS simulator (macOS)
   - Press `a` for Android emulator
   - Press `w` for web
   - Or scan the QR code with Expo Go

## Scripts
```bash
npm run start
npm run android
npm run ios
npm run web
npm run typecheck
```

## Project structure
- `App.tsx` – app bootstrap + persisted state hydration.
- `src/navigation/AppTabs.tsx` – bottom tab navigation (Home + 5 areas).
- `src/screens/HomeScreen.tsx` – dashboard with UDP progress and daily actions.
- `src/screens/AreaScreen.tsx` – per-area task lists and streak display.
- `src/components/TaskList.tsx` – reusable task completion list UI.
- `src/storage/appData.ts` – AsyncStorage data model and scoring/streak logic.
- `src/constants/tasks.ts` – task definitions and area constants.

## Notes
- Data is stored on-device under AsyncStorage key `mindset-stack-data-v2`.
- Daily completion resets by date while preserving XP and streak progression.
