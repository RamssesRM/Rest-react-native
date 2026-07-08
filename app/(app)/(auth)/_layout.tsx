import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

const Layout = () => {
  const router = useRouter();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Cambiado de 'index' a '(tabs)' */}
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="(modal)/location"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          sheetAllowedDetents: [0.7],
          title: "Ubicacion",
          headerShadowVisible: false,
          sheetCornerRadius: 16,
          sheetGrabberVisible: true,
          headerRight: () => (
            <TouchableOpacity
              style={{
                padding: 6,
                borderRadius: 20,
                backgroundColor: Colors.light,
              }}
              onPress={() => router.dismiss()}
            >
              <Ionicons name="close-sharp" size={24} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
};

export default Layout;
