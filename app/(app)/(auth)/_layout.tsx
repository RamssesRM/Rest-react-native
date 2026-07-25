import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import React from "react";

const Layout = () => {
  const router = useRouter();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Cambiado de 'index' a '(tabs)' */}
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(modal)/map" options={{ presentation: "modal" }} />
      <Stack.Screen
        name="(modal)/location"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          headerShown: true,
          title: "Ubicacion",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'white' },
          headerTitleStyle: { color: '#000', fontWeight: 'bold' },
          headerRight: () => (
            <TouchableOpacity
              style={{
                padding: 6,
                borderRadius: 20,
                backgroundColor: Colors.light,
              }}
              onPress={() => router.dismiss()}
            >
              <Ionicons name="close-sharp" size={24} color={Colors.dark} />
            </TouchableOpacity>
          ),
        }}
      />
       <Stack.Screen
        name="(modal)/filter"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          headerShown: true,
          title: "Ubicacion",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'white' },
          headerTitleStyle: { color: '#000', fontWeight: 'bold' },
          contentStyle: { backgroundColor: 'white' },
          headerRight: () => (
            <TouchableOpacity
              style={{
                padding: 6,
                borderRadius: 20,
                backgroundColor: Colors.light,
              }}
              onPress={() => router.dismiss()}
            >
              <Ionicons name="close-sharp" size={24} color={Colors.dark} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
};

export default Layout;
