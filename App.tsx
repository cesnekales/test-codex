import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppTabs } from './src/navigation/AppTabs';
import { Task } from './src/constants/tasks';
import { AppData, appDataStorage, getInitialData } from './src/storage/appData';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState<AppData>(getInitialData);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const data = await appDataStorage.readData();
        setAppData(data);
      } finally {
        setLoading(false);
      }
    }; 

    hydrate();
  }, []);

  const onCompleteTask = useCallback(async (task: Task) => {
    const next = await appDataStorage.completeTask(appData, task);
    setAppData(next);
  }, [appData]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: '#f5f7fb',
        },
      }}
    >
      <StatusBar style="dark" />
      <AppTabs appData={appData} onCompleteTask={onCompleteTask} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f7fb',
  },
});
