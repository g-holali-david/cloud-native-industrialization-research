import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="diagnostic" options={{ presentation: 'modal' }} />
        <Stack.Screen name="location" />
        <Stack.Screen name="advice" />
        <Stack.Screen name="broadcasting" />
        <Stack.Screen name="contact" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="mecanicien" />
      </Stack>
    </>
  );
}
