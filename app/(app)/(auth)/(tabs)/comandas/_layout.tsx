import { Stack } from 'expo-router';
import React from 'react';

const ComandasLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      
      <Stack.Screen name="index" /> 

      <Stack.Screen 
        name="nuevaOrden" 
        options={{ 
          headerShown: true, 
          title: "Nueva Orden", 
          headerTintColor: '#262626',
          headerStyle: { backgroundColor: '#FAFAFA' }
        }} 
      />

    </Stack>
  );
};

export default ComandasLayout;