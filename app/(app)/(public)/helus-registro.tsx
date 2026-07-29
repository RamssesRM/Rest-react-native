import { registerUser } from "@/app/api/authApi";
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

export default function HelusRegister() {
  const [name, setName] = useState("");
  const [first_name, setFirstName] = useState('');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { setUser } = useUserStore();
  const { colors } = useTheme();
  const s = styles(colors);

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
      router.replace('/comentarios');

    } catch (error) {
      Alert.alert("Error al registrarse", (error as any).message);
    } finally {
      setIsLoading(false);
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
              <Ionicons name="person-add" size={32} color={colors.brandDark} />
            </View>
            <Text style={s.title}>Crear Cuenta</Text>
            <Text style={s.subtitle}>Regístrate como empleado Helus</Text>
          </View>

          <View style={s.formContainer}>
            <View style={s.inputContainer}>
              <Ionicons name="person-outline" size={22} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Nombre de usuario"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={s.inputContainer}>
              <Ionicons name="person-outline" size={22} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Nombre y apellido"
                placeholderTextColor={colors.textMuted}
                value={first_name}
                onChangeText={setFirstName}
              />
            </View>

            <View style={s.inputContainer}>
              <Ionicons name="mail-outline" size={22} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Correo electrónico"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={s.inputContainer}>
              <Ionicons name="lock-closed-outline" size={22} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Contraseña"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeButton}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={s.inputContainer}>
              <Ionicons name="lock-closed-outline" size={22} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor={colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            <TouchableOpacity
              style={[s.registerButton, isLoading && s.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={s.registerButtonText}>Creando cuenta...</Text>
              ) : (
                <Text style={s.registerButtonText}>Crear Cuenta</Text>
              )}
            </TouchableOpacity>

            <View style={s.loginLinkContainer}>
              <Text style={s.loginLinkText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={s.loginLink}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
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
  registerButton: {
    backgroundColor: c.brandYellow,
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
    color: c.brandDark,
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginLinkText: {
    color: c.textMuted,
    fontSize: 14,
  },
  loginLink: {
    color: c.brandYellow,
    fontSize: 14,
    fontWeight: "600",
  },
});
