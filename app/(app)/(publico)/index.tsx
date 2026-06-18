import GoogleAutenBoton from "@/componentes/auten/GoogleAutenBoton";
import { Fonts } from "@/constants/theme";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

// Pantalla de bienvenida con animación de fade-in para el logo y el texto

export default function Index() {
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
            <TouchableOpacity style={styles.otherButton} />
            <Text style={styles.otherButtonText}>
              Otro método de autenticación
            </Text>
          </Animated.View>
        </View>
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
  otherButton: {},
  otherButtonText: {},
  infiniteScrollContainer: {
    flex: 0.5,
  },
});
