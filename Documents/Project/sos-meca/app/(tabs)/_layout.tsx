import { Tabs } from 'expo-router';
import { Colors } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
        tabBarActiveTintColor: Colors.primary,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
    </Tabs>
  );
}
