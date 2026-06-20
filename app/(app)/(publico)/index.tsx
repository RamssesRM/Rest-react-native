import { Link } from "expo-router";

import GoogleAutenBoton from "@/componentes/auten/GoogleAutenBoton";
import ScrollInfinitoSuave from "@/componentes/ScrollinfinitoSuave"; // O la ruta exacta donde guardaste el componente
import { Fonts } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

// Pantalla de bienvenida con animación de fade-in para el logo y el texto

export default function Index() {
  const openWebBrowser = () => {
    Linking.openURL("https://galaxies.dev");
  };
  return (
    <View style={styles.container}>
      <View style={styles.infiniteScrollContainer}>
        <View> 
          <ScrollInfinitoSuave scrollDirection="down" iconSet="set1" />
        </View>
        <View>
          <ScrollInfinitoSuave scrollDirection="up" iconSet="set2" />
        </View>
        <View>
          <ScrollInfinitoSuave scrollDirection="down" iconSet="set3" />
        </View>
        <LinearGradient 
          colors={['transparent', '#fff']}
          style={{
            position: 'absolute',
            height: 200,
            left: 0,
            bottom: 0,
            right: 0,
          }}
        />
      </View>

      <View style={styles.contentContainer}>
        <Image
          source={require("@/assets/images/LOGO332.png")}
          style={styles.brandLogo}
        />
        <Animated.Text entering={FadeInDown.delay(200)} style={styles.tagline}>
          {" "}
          Bienvenido a Helus Resto-Bar{" "}
        </Animated.Text>

        {/* botones de logeo */}
        <View style={styles.buttonContainer}>
          <Animated.View entering={FadeInDown.delay(300)}>
            <GoogleAutenBoton />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400)}>
            <Link href={"/(app)/(publico)/otras-opciones"} asChild>
              <TouchableOpacity style={styles.otherButton}>
                <Text style={styles.otherButtonText}>
                  Otro método de autenticación
                </Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
        </View>

        <Animated.View
          style={styles.privacyContainer}
          entering={FadeInDown.delay(500)}
        >
          <Text style={styles.privacyText}>
            Por favor visita{" "}
            <Text style={styles.privacyLink} onPress={openWebBrowser}>
              Términos de Servicio
            </Text>{" "}
            y <Text style={styles.privacyLink}>Política de Privacidad</Text>
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 0,
  },
  brandLogo: {
    width: "100%",
    height: 190,
    resizeMode: "contain",
    marginBottom: 1,
  },
  tagline: {
    fontSize: 32,
    fontFamily: Fonts.brandBlack,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 50,
    lineHeight: 30,
  },
  buttonContainer: {
    gap: 12,
    width: "100%",
  },
  otherButton: {
    backgroundColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    borderRadius: 12,
    gap: 4,
  },
  otherButtonText: {
    color: "#666",
    fontSize: 18,
    fontWeight: "600",
  },

  privacyContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  privacyText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    lineHeight: 16,
  },
  privacyLink: {
    color: "#4285F4",
    textDecorationLine: "underline",
  },

  infiniteScrollContainer: {
    flex: 0.57,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    position: "relative",
    overflow: "hidden",
  },
});
