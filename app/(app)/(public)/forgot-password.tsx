import { resetPassword } from "@/app/api/authApi";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "password" | "done">("email");

  const handleVerifyEmail = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Ingresa tu correo electrónico");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Ingresa un correo válido");
      return;
    }

    setIsLoading(true);

    try {
      const data = await resetPassword(email);
      if (data.email_exists) {
        setStep("password");
      } else {
        Alert.alert("Aviso", "Si el correo está registrado, podrás restablecer tu contraseña.");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo verificar el correo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert("Error", "Ingresa la nueva contraseña");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email, newPassword);
      setStep("done");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo cambiar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "done") {
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
                <Ionicons name="checkmark-circle" size={32} color="#382f2f" />
              </View>
              <Text style={styles.title}>¡Listo!</Text>
              <Text style={styles.subtitle}>
                Tu contraseña ha sido actualizada. Ya puedes iniciar sesión con
                tu nueva contraseña.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.replace("./helus-login")}
            >
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

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
              onPress={() => (step === "password" ? setStep("email") : router.back())}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.titleContainer}>
            <View style={styles.logoContainer}>
              <Ionicons name="key" size={32} color="#382f2f" />
            </View>
            <Text style={styles.title}>
              {step === "email" ? "Recuperar Contraseña" : "Nueva Contraseña"}
            </Text>
            <Text style={styles.subtitle}>
              {step === "email"
                ? "Ingresa tu correo electrónico para verificar tu cuenta."
                : "Ingresa tu nueva contraseña."}
            </Text>
          </View>

          <View style={styles.formContainer}>
            {step === "email" ? (
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color="#999"
                  style={styles.inputIcon}
                />
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
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nueva contraseña"
                    placeholderTextColor="#666"
                    value={newPassword}
                    onChangeText={setNewPassword}
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

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar contraseña"
                    placeholderTextColor="#666"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                  />
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
              onPress={step === "email" ? handleVerifyEmail : handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.loginButtonText}>
                  {step === "email" ? "Verificando..." : "Guardando..."}
                </Text>
              ) : (
                <Text style={styles.loginButtonText}>
                  {step === "email" ? "Verificar Correo" : "Cambiar Contraseña"}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>¿Recordaste tu contraseña? </Text>
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
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
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
  loginButton: {
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
  loginButtonText: {
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
