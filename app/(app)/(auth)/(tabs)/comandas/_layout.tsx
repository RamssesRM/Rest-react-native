import { useTheme } from '@/hooks/use-theme';
import { Stack } from 'expo-router';
import React from 'react';

const ComandasLayout = () => {
  const { colors } = useTheme();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      
      <Stack.Screen name="index" /> 

      <Stack.Screen 
        name="nuevaOrden" 
        options={{ 
          headerShown: true, 
          title: "Nueva Orden", 
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text, fontWeight: 'bold' },
        }} 
      />

    </Stack>
  );
};

export default ComandasLayout;
