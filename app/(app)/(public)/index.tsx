import FacebookAutenBoton from "@/componentes/auten/FacebookAutenButon";
import GoogleAutenBoton from "@/componentes/auten/GoogleAutenBoton";
import ScrollInfinitoSuave from "@/componentes/ScrollinfinitoSuave"; // O la ruta exacta donde guardaste el componente
import { Fonts } from "@/constants/theme";
import useUserStore from "@/hooks/use-userstore";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useRef } from "react";
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

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%"], []);

  const handleOpenBottomSheet = () => {
    bottomSheetRef.current?.expand(); // Esto lo levanta de forma fluida
  };

  const router = useRouter(); // <-- AGREGA ESTA LÍNEA

  const { setIsGuest, setUser } = useUserStore();
  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null)
    router.replace('/descubrir')
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
          colors={["transparent", "#fff"]}
          style={{
            position: "absolute",
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
            {/* Quitamos el <Link> y le pasamos el trigger directo al botón */}
            <TouchableOpacity
              style={styles.otherButton}
              onPress={handleOpenBottomSheet}
            >
              <Text style={styles.otherButtonText}>
                Otro método de autenticación
              </Text>
            </TouchableOpacity>
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
      {/* 4. EL COMPONENTE BOTTOM SHEET (Metido correctamente dentro del contenedor padre) */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={{ backgroundColor: "#fff" }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>
            Inicia Sesión o crea una cuenta Helus
          </Text>

          <GoogleAutenBoton />
          <FacebookAutenBoton />
          
          <TouchableOpacity
            style={styles.guestButton}
            onPress={continueAsGuest}
          >
            <Text style={styles.guestButtonText}>Continuar como invitado</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
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

  sheetBackground: {
    backgroundColor: "#f0f0f0", // Fondo oscuro que tenías en el modal
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetContent: {
    flex: 1,
    alignItems: "stretch",
    paddingHorizontal: 30, // Usa 30 para mantener la misma simetría de la pantalla de atrás
    paddingTop: 10,
    gap: 16,
  },

  sheetTitle: {
    color: "#1c1c1e",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },
  guestButton: {
    marginTop: 10,
  },
  guestButtonText: {
    color: "#007AFF",
    fontSize: 18,
    fontWeight: "600",
    alignItems: "center",
    textAlign: "center",
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
