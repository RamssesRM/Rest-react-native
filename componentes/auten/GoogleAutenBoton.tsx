import { googleLogin } from "@/app/api/authApi";
import useUserStore from "@/hooks/use-userstore";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
});

const GoogleAutenBoton = () => {
  const [loading, setLoading] = useState(false);
  const { setUser, setIsGuest } = useUserStore();

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (!WEB_CLIENT_ID) {
        Alert.alert(
          "Configuración pendiente",
          "Agrega EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID en el archivo .env",
        );
        return;
      }

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const signInResult = await GoogleSignin.signIn();
      if (signInResult.type !== "success") return;

      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens.accessToken;

      if (!accessToken) {
        throw new Error("No se pudo obtener el token de Google");
      }

      const data = await googleLogin(accessToken);

      await SecureStore.setItemAsync("jwt_access", data.access);
      await SecureStore.setItemAsync("jwt_refresh", data.refresh);
      setIsGuest(false);
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.first_name,
        role: data.user.role,
      });

      router.replace("/descubrir");
    } catch (error: any) {
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (error?.code === statusCodes.IN_PROGRESS) return;
      const message =
        error?.message || "Error al conectar con Google. Intenta de nuevo.";
      Alert.alert("Error de autenticación", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.googleButton, loading && styles.disabled]}
      onPress={handleGoogleSignIn}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Ionicons name="logo-google" color={"#fff"} size={24} />
      )}
      <Text style={styles.googleButtonText}>Continuar con Google</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  googleButton: {
    backgroundColor: "#4285F4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    borderRadius: 12,
    gap: 8,
  },
  disabled: {
    opacity: 0.7,
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default GoogleAutenBoton;
