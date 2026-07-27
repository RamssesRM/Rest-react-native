import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const INSTAGRAM_URL = "https://www.instagram.com/helusrestobar/reels/";
const MAPS_URL = "https://maps.app.goo.gl/EXHqWDRfpgcMc8pc7";

const AboutUs = () => {
  const insets = useSafeAreaInsets();

  const openLink = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "No se puede abrir el enlace.");
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#382f2f", "#2a2222"]} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 10 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>HL</Text>
            </View>
            <Text style={styles.brandName}>Helus Restobar</Text>
            <Text style={styles.tagline}>
              Sabor que conecta, ambiente que inspira
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Quiénes somos</Text>
            <Text style={styles.description}>
              Helus Restobar es el lugar perfecto para disfrutar de una
              experiencia gastronómica única. Ofrecemos una variada carta de
              platos cuidadosamente preparados, acompañados de los mejores
              cócteles y un ambiente moderno y acogedor. Ya sea para una cena
              especial, una reunión con amigos o una celebración, Helus Restobar
              te espera.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Horarios</Text>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Lunes - Jueves</Text>
              <Text style={styles.hoursTime}>11:00 - 22:00</Text>
            </View>
            <View style={styles.hoursDivider} />
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Viernes - Sábado</Text>
              <Text style={styles.hoursTime}>11:00 - 23:00</Text>
            </View>
            <View style={styles.hoursDivider} />
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Domingo</Text>
              <Text style={styles.hoursTime}>12:00 - 22:00</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Visítanos</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openLink(MAPS_URL)}
              activeOpacity={0.8}
            >
              <Ionicons name="location-outline" size={22} color="#f4d642" />
              <Text style={styles.actionText}>Cómo llegar</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openLink(INSTAGRAM_URL)}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-instagram" size={22} color="#f4d642" />
              <Text style={styles.actionText}>Síguenos en Instagram</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Contacto</Text>
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={18} color="#f4d642" />
              <Text style={styles.contactText}>+58 412-1234567</Text>
            </View>
            <View style={styles.contactDivider} />
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={18} color="#f4d642" />
              <Text style={styles.contactText}>
                contacto@helusrestobar.com
              </Text>
            </View>
            <View style={styles.contactDivider} />
            <View style={styles.contactRow}>
              <Ionicons name="location-outline" size={18} color="#f4d642" />
              <Text style={styles.contactText}>
                San Cristóbal, Venezuela
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2026 Helus Restobar. Todos los derechos reservados.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

export default AboutUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: "#f4d642",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#382f2f",
  },
  brandName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: "#999",
    marginTop: 6,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f4d642",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 22,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  hoursDay: {
    fontSize: 14,
    color: "#ccc",
  },
  hoursTime: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  hoursDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(244, 214, 66, 0.1)",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: "rgba(244, 214, 66, 0.3)",
    marginBottom: 10,
    gap: 10,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#f4d642",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  contactText: {
    fontSize: 14,
    color: "#ccc",
    flex: 1,
  },
  contactDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#666",
  },
});
