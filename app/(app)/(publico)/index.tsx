import GoogleAutenBoton from "@/componentes/auten/GoogleAutenBoton";
import { Fonts } from "@/constants/theme";
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

// Pantalla de bienvenida con animación de fade-in para el logo y el texto

export default function Index() {
  const openWebBrowser = () => {
    Linking.openURL('https://galaxies.dev')
  }
  return (
    <View style={styles.container}>
      <View style={styles.infiniteScrollContainer}></View>

      <View style={styles.contentContainer}>
        <Image
          source={require("@/assets/images/LOGO332.png")}
          style={styles.brandLogo}
        />
        <Animated.Text entering={FadeInDown.delay(300)} style={styles.tagline}>
          {" "}
          Bienvenido a Helus Resto-Bar{" "}
        </Animated.Text>

        {/* botones de logeo */}
        <View style={styles.buttonContainer}>
          <Animated.View entering={FadeInDown.delay(100)}>
            <GoogleAutenBoton />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200)}>
            <TouchableOpacity style={styles.otherButton} >
              <Text style={styles.otherButtonText}>
                Otro método de autenticación
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Animated.View style={styles.privacyContainer} entering={FadeInDown.delay(400)}>
          <Text style={styles.privacyText}>
            Por favor visita{" "}
            <Text style={styles.privacyLink} onPress = {openWebBrowser}>
              Términos de Servicio
            </Text> y{" "}
            <Text style={styles.privacyLink}>
              Política de Privacidad
            </Text>
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
    paddingVertical: 20,
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
    flex: 0.5,
  },
});
