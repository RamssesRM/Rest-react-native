// app/(auth)/helus-register.tsx
import { registerUser } from "@/app/api/authApi";
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

export default function HelusRegister() {
  const [name, setName] = useState("");
  const [first_name, setFirstName] = useState('');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { setUser } = useUserStore();

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Ingresa tu nombre completo");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Ingresa tu correo");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }
    const nombres = first_name.split(' ');
    if (nombres.length < 2) {
      Alert.alert('Error', 'Ingresa tu nombre y apellido');
      return;
    }
    setIsLoading(true);

    try {
      const data = await registerUser({
        username: name,
        email: email,
        first_name: nombres[0],
        last_name: nombres[1],
        password: password,
        role: 'cliente'
      });

      await SecureStore.setItemAsync('jwt_access', data.access);
      await SecureStore.setItemAsync('jwt_refresh', data.refresh);

      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.first_name,
        role: data.user.role
      });
      Alert.alert('¡Bienvenido!', `Hola ${data.user.first_name} te has registrado exitosamente`);
      router.replace('/descubrir');

    } catch (error) {
      Alert.alert("Error al registrarse", (error as any).message);
    } finally {
      setIsLoading(false);
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
              <Ionicons name="person-add" size={32} color="#382f2f" />
            </View>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Regístrate como empleado Helus</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={22} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre de usuario"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={22} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre y apellido"
                placeholderTextColor="#666"
                value={first_name}
                onChangeText={setFirstName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={22} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={22} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={22} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor="#666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.registerButtonText}>Creando cuenta...</Text>
              ) : (
                <Text style={styles.registerButtonText}>Crear Cuenta</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
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
  registerButton: {
    backgroundColor: "#f4d642",
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#382f2f",
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginLinkText: {
    color: "#999",
    fontSize: 14,
  },
  loginLink: {
    color: "#f4d642",
    fontSize: 14,
    fontWeight: "600",
  },
});
