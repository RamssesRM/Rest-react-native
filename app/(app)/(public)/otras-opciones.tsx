import GoogleAutenBoton from "@/componentes/auten/GoogleAutenBoton";
import { useTheme } from "@/hooks/use-theme";
import useUserStore from "@/hooks/use-userstore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const Page = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { setIsGuest } = useUserStore();
  const continueAsGuest = () => {
    setIsGuest(true);
  };

  const s = styles(colors);

  return (
    <View style={s.container}>
      <TouchableOpacity
        style={s.closeBtn}
        onPress={() => router.dismiss()}
      >
        <Ionicons name="close" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={s.title}>Inicia Sesión o crea una cuenta Helus</Text>
      <View style={s.buttonContainer}>
        <Animated.View entering={FadeInDown.delay(100)}>
          <GoogleAutenBoton />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200)}>
          <TouchableOpacity
            style={s.guestButton}
            onPress={continueAsGuest}
          >
            <Text style={s.guestButtonText}>Continuar como invitado</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: c.background,
  },
  closeBtn: {
    backgroundColor: c.surface,
    borderRadius: 40,
    padding: 8,
    alignSelf: "flex-end",
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: c.text,
    marginVertical: 22,
    textAlign: "center",
  },
  buttonContainer: {
    gap: 16,
    width: "100%",
    alignItems: "center",
  },
  guestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    borderRadius: 12,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  guestButtonText: {
    color: c.secondary,
    fontSize: 18,
    fontWeight: "600",
  },
});

export default Page;
