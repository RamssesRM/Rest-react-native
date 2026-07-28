//pantalla de login de helus
import { loginUser } from '@/app/api/authApi';
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
      router.replace('/descubrir')

    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error de inicio de sesión", (error as any).message || "Error desconocido");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient colors={["#382f2f", "#2a2222"]} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.titleContainer}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>HL</Text>
            </View>
            <Text style={styles.title}>Inicio de Sesión</Text>
            <Text style={styles.subtitle}>
              Accede con tu cuenta de empleado Helus
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={22}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Correo o usuario"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => router.push("./forgot-password")}
            >
              <Text style={styles.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.loginButtonText}>Iniciando...</Text>
              ) : (
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>o</Text>
              <View style={styles.separatorLine} />
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.push("./helus-registro")}
            >
              <Ionicons name="person-add-outline" size={22} color="#f4d642" />
              <Text style={styles.registerButtonText}>
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

const styles = StyleSheet.create({
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
    backgroundColor: "rgba(255,255,255,0.1)",
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
    backgroundColor: "#f4d642",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#382f2f",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 58,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
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
    color: "#f4d642",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#f4d642",
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
    color: "#382f2f",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  separatorText: {
    color: "#666",
    paddingHorizontal: 16,
    fontSize: 14,
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(244, 214, 66, 0.1)",
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(244, 214, 66, 0.3)",
    gap: 10,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f4d642",
  },
});
