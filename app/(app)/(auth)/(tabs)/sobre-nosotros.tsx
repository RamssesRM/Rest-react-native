import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import React from "react";
import {
    Alert,
    Image,
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
  const { colors } = useTheme();

  const openLink = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "No se puede abrir el enlace.");
    }
  };

  const s = styles(colors);

  return (
    <View style={s.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero con imagen de fondo + gradiente */}
        <View style={s.heroWrapper}>
          <Image
            source={require("../../../../assets/images/1.webp")}
            style={s.heroImage}
          />
          <LinearGradient
            colors={["transparent", colors.background]}
            style={s.heroGradient}
          />
          <View style={[s.heroContent, { paddingTop: insets.top + 20 }]}>
            <Image
              source={require("../../../../assets/images/logo2arreglado2.png")}
              style={s.logoImage}
            />
            <Text style={s.brandName}>Helus Restobar</Text>
            <Text style={s.tagline}>Sabor que conecta, ambiente que inspira</Text>
          </View>
        </View>

        {/* Contenido */}
        <View style={[s.content, { backgroundColor: colors.background }]}>
          <View style={s.card}>
            <Text style={s.sectionTitle}>Quiénes somos</Text>
            <Text style={s.description}>
              Helus Restobar es el lugar perfecto para disfrutar de una
              experiencia gastronómica única. Ofrecemos una variada carta de
              platos cuidadosamente preparados, acompañados de los mejores
              cócteles y un ambiente moderno y acogedor. Ya sea para una cena
              especial, una reunión con amigos o una celebración, Helus Restobar
              te espera.
            </Text>
          </View>

          <View style={s.card}>
            <Text style={s.sectionTitle}>Horarios</Text>
            <View style={s.hoursRow}>
              <Text style={s.hoursDay}>Lunes - Jueves</Text>
              <Text style={s.hoursTime}>11:00 - 22:00</Text>
            </View>
            <View style={s.hoursDivider} />
            <View style={s.hoursRow}>
              <Text style={s.hoursDay}>Viernes - Sábado</Text>
              <Text style={s.hoursTime}>11:00 - 23:00</Text>
            </View>
            <View style={s.hoursDivider} />
            <View style={s.hoursRow}>
              <Text style={s.hoursDay}>Domingo</Text>
              <Text style={s.hoursTime}>12:00 - 22:00</Text>
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.sectionTitle}>Visítanos</Text>

            <TouchableOpacity
              style={s.actionButton}
              onPress={() => openLink(MAPS_URL)}
              activeOpacity={0.8}
            >
              <Ionicons name="location-outline" size={22} color={colors.brandYellow} />
              <Text style={s.actionText}>Cómo llegar</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={s.actionButton}
              onPress={() => openLink(INSTAGRAM_URL)}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-instagram" size={22} color={colors.brandYellow} />
              <Text style={s.actionText}>Síguenos en Instagram</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={s.card}>
            <Text style={s.sectionTitle}>Contacto</Text>
            <View style={s.contactRow}>
              <Ionicons name="call-outline" size={18} color={colors.brandYellow} />
              <Text style={s.contactText}>+58 412-1234567</Text>
            </View>
            <View style={s.contactDivider} />
            <View style={s.contactRow}>
              <Ionicons name="mail-outline" size={18} color={colors.brandYellow} />
              <Text style={s.contactText}>contacto@helusrestobar.com</Text>
            </View>
            <View style={s.contactDivider} />
            <View style={s.contactRow}>
              <Ionicons name="location-outline" size={18} color={colors.brandYellow} />
              <Text style={s.contactText}>San Cristóbal, Venezuela</Text>
            </View>
          </View>

          <View style={s.footer}>
            <Text style={s.footerText}>
              © 2026 Helus Restobar. Todos los derechos reservados.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AboutUs;

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  heroWrapper: {
    position: "relative",
    height: 320,
    justifyContent: "flex-end",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    alignItems: "center",
    paddingBottom: 30,
    zIndex: 2,
  },
  logoImage: {
    width: 180,
    height: 180,
    resizeMode: "contain",
    marginBottom: 8,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 14,
    color: "#ddd",
    marginTop: 6,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: c.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: c.brandYellow,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: c.textSecondary,
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
    color: c.textSecondary,
  },
  hoursTime: {
    fontSize: 14,
    color: c.text,
    fontWeight: "600",
  },
  hoursDivider: {
    height: 1,
    backgroundColor: c.border,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.brandYellowLight,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: c.brandYellowBorder,
    marginBottom: 10,
    gap: 10,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: c.brandYellow,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  contactText: {
    fontSize: 14,
    color: c.textSecondary,
    flex: 1,
  },
  contactDivider: {
    height: 1,
    backgroundColor: c.border,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: c.textMuted,
  },
});
