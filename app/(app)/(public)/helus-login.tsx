import { loginUser } from '@/app/api/authApi';
import { useTheme } from '@/hooks/use-theme';
import useUserStore from '@/hooks/use-userstore';
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function HelusLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useUserStore();
  const { colors } = useTheme();
  const s = styles(colors);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Ingresa correo y contraseña");
      return;
    }
    
    setIsLoading(true);

    try {
      const data = await loginUser(email, password);

      await SecureStore.setItemAsync('jwt_access', data.access);
      await SecureStore.setItemAsync('jwt_refresh', data.refresh);

      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.first_name,
        role: data.user.role
      });
      router.replace('/comentarios')

    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error de inicio de sesión", (error as any).message || "Error desconocido");
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient colors={[colors.brandDark, colors.surface]} style={s.gradient}>
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={s.backButton}
            >
              <Ionicons name="arrow-back" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={s.titleContainer}>
            <View style={s.logoContainer}>
              <Text style={s.logoText}>HL</Text>
            </View>
            <Text style={s.title}>Inicio de Sesión</Text>
            <Text style={s.subtitle}>
              Accede con tu cuenta de empleado Helus
            </Text>
          </View>

          <View style={s.formContainer}>
            <View style={s.inputContainer}>
              <Ionicons
                name="person-outline"
                size={22}
                color={colors.textMuted}
                style={s.inputIcon}
              />
              <TextInput
                style={s.input}
                placeholder="Correo o usuario"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={s.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color={colors.textMuted}
                style={s.inputIcon}
              />
              <TextInput
                style={s.input}
                placeholder="Contraseña"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={s.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={s.forgotPasswordContainer}
              onPress={() => router.push("./forgot-password")}
            >
              <Text style={s.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                s.loginButton,
                isLoading && s.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={s.loginButtonText}>Iniciando...</Text>
              ) : (
                <Text style={s.loginButtonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            <View style={s.separatorContainer}>
              <View style={s.separatorLine} />
              <Text style={s.separatorText}>o</Text>
              <View style={s.separatorLine} />
            </View>

            <TouchableOpacity
              style={s.registerButton}
              onPress={() => router.push("./helus-registro")}
            >
              <Ionicons name="person-add-outline" size={22} color={colors.brandYellow} />
              <Text style={s.registerButtonText}>
                Crear cuenta de Helus Usuario
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: c.inputBg,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: c.brandYellow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: c.brandDark,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: c.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: c.textMuted,
    textAlign: "center",
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.inputBg,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 58,
    borderWidth: 1,
    borderColor: c.inputBorder,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: c.text,
    height: "100%",
  },
  eyeButton: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginRight: 4,
  },
  forgotPasswordText: {
    color: c.brandYellow,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: c.brandYellow,
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: c.brandDark,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: c.border,
  },
  separatorText: {
    color: c.textMuted,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.brandYellowLight,
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.brandYellowBorder,
    gap: 10,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: c.brandYellow,
  },
});
