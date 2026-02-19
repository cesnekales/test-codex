import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { AREA_ORDER, Area, Task } from '../constants/tasks';
import { AreaScreen } from '../screens/AreaScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { AppData } from '../storage/appData';

type AppTabsProps = {
  appData: AppData;
  onCompleteTask: (task: Task) => void;
};

const Tab = createBottomTabNavigator();

const areaIcons: Record<Area, keyof typeof Ionicons.glyphMap> = {
  Study: 'book-outline',
  Work: 'briefcase-outline',
  Sport: 'barbell-outline',
  Relationships: 'people-outline',
  Nutrition: 'nutrition-outline',
};

export function AppTabs({ appData, onCompleteTask }: AppTabsProps) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1a73e8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const iconName = route.name === 'Home' ? 'home-outline' : areaIcons[route.name as Area];
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home">{() => <HomeScreen appData={appData} onComplete={onCompleteTask} />}</Tab.Screen>
      {AREA_ORDER.map((area) => (
        <Tab.Screen key={area} name={area}>
          {() => <AreaScreen area={area} appData={appData} onComplete={onCompleteTask} />}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
}
