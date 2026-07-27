import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import React from "react";

const Layout = () => {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(modal)/map" options={{ presentation: "modal" }} />
      <Stack.Screen
        name="(modal)/location"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          headerShown: true,
          title: "Ubicación",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text, fontWeight: 'bold' },
          headerRight: () => (
            <TouchableOpacity
              style={{
                padding: 6,
                borderRadius: 20,
                backgroundColor: colors.gray100,
              }}
              onPress={() => router.dismiss()}
            >
              <Ionicons name="close-sharp" size={24} color={colors.text} />
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
          title: "Filtrar Menú",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text, fontWeight: 'bold' },
          contentStyle: { backgroundColor: colors.background },
          headerRight: () => (
            <TouchableOpacity
              style={{
                padding: 6,
                borderRadius: 20,
                backgroundColor: colors.gray100,
              }}
              onPress={() => router.dismiss()}
            >
              <Ionicons name="close-sharp" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
};

export default Layout;
