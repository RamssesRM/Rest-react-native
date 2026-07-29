import { resetPassword } from "@/app/api/authApi";
import { useTheme } from '@/hooks/use-theme';
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
  const { colors } = useTheme();
  const s = styles(colors);

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
                <Ionicons name="checkmark-circle" size={32} color={colors.brandDark} />
              </View>
              <Text style={s.title}>¡Listo!</Text>
              <Text style={s.subtitle}>
                Tu contraseña ha sido actualizada. Ya puedes iniciar sesión con
                tu nueva contraseña.
              </Text>
            </View>

            <TouchableOpacity
              style={s.loginButton}
              onPress={() => router.replace("./helus-login")}
            >
              <Text style={s.loginButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

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
              onPress={() => (step === "password" ? setStep("email") : router.back())}
              style={s.backButton}
            >
              <Ionicons name="arrow-back" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={s.titleContainer}>
            <View style={s.logoContainer}>
              <Ionicons name="key" size={32} color={colors.brandDark} />
            </View>
            <Text style={s.title}>
              {step === "email" ? "Recuperar Contraseña" : "Nueva Contraseña"}
            </Text>
            <Text style={s.subtitle}>
              {step === "email"
                ? "Ingresa tu correo electrónico para verificar tu cuenta."
                : "Ingresa tu nueva contraseña."}
            </Text>
          </View>

          <View style={s.formContainer}>
            {step === "email" ? (
              <View style={s.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color={colors.textMuted}
                  style={s.inputIcon}
                />
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
            ) : (
              <>
                <View style={s.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color={colors.textMuted}
                    style={s.inputIcon}
                  />
                  <TextInput
                    style={s.input}
                    placeholder="Nueva contraseña"
                    placeholderTextColor={colors.textMuted}
                    value={newPassword}
                    onChangeText={setNewPassword}
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

                <View style={s.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color={colors.textMuted}
                    style={s.inputIcon}
                  />
                  <TextInput
                    style={s.input}
                    placeholder="Confirmar contraseña"
                    placeholderTextColor={colors.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                  />
                </View>
              </>
            )}

            <TouchableOpacity
              style={[s.loginButton, isLoading && s.buttonDisabled]}
              onPress={step === "email" ? handleVerifyEmail : handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={s.loginButtonText}>
                  {step === "email" ? "Verificando..." : "Guardando..."}
                </Text>
              ) : (
                <Text style={s.loginButtonText}>
                  {step === "email" ? "Verificar Correo" : "Cambiar Contraseña"}
                </Text>
              )}
            </TouchableOpacity>

            <View style={s.loginLinkContainer}>
              <Text style={s.loginLinkText}>¿Recordaste tu contraseña? </Text>
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
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: c.textMuted,
    textAlign: "center",
    lineHeight: 22,
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
  loginButton: {
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
  loginButtonText: {
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
