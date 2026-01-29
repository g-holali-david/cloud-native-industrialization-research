import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';

export default function MecanicienLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}
