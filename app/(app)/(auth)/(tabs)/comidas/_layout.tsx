import { useTheme } from '@/hooks/use-theme';
import { Stack } from 'expo-router';
import React from 'react';

const _layout = () => {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background }, headerShown: false }}>
      <Stack.Screen name="index" options={{ 
        headerShown: false,
        headerLargeTitle: true,
        headerTransparent: true
      }} />
    </Stack>
  );
};

export default _layout;
