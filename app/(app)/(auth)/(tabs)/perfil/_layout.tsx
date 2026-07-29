import { Stack } from "expo-router";
import React from "react";
import { useTheme } from "@/hooks/use-theme";

const _layout = () => {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" options={{ 
        headerShown: false,
        headerLargeTitle: true,
        headerTransparent: true
      }} />
      <Stack.Screen
        name="editar-perfil"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="pagos"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
};

export default _layout;