import { Stack } from 'expo-router';
import React from 'react';

const _layout = () => {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor:'#fff' }, headerShown: false }}>
      <Stack.Screen name="index" options={{ 
        headerLargeTitle:true,
        headerTransparent : true
      }} />
    </Stack>
  );
};

export default _layout