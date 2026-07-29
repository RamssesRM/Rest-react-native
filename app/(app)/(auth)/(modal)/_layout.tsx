import React from "react";
import { Stack } from "expo-router";

const ModalLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="filter"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="location"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="map"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
};

export default ModalLayout;
