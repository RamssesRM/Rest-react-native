import GoogleAutenBoton from "@/componentes/auten/GoogleAutenBoton";
import Helusboton from "@/componentes/auten/HelusAutenBoton";
import ScrollInfinitoSuave from "@/componentes/ScrollinfinitoSuave";
import { Fonts } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
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

export default function Index() {
  const { colors } = useTheme();

  const openWebBrowser = () => {
    Linking.openURL("https://galaxies.dev");
  };

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%"], []);

  const handleOpenBottomSheet = () => {
    bottomSheetRef.current?.expand();
  };

  const router = useRouter();

  const { setIsGuest, setUser } = useUserStore();
  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
    router.replace("/comentarios");
  };

  const s = styles(colors);

  return (
    <View style={s.container}>
      <View style={s.infiniteScrollContainer}>
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
          colors={["transparent", colors.loginBg]}
          style={{
            position: "absolute",
            height: 200,
            left: 0,
            bottom: 0,
            right: 0,
          }}
        />
      </View>

      <View style={s.contentContainer}>
        <Image
          source={require("../../../assets/images/Helus_restaurant4.png")}
          style={s.brandLogo}
        />
        <Animated.Text entering={FadeInDown.delay(200)} style={s.tagline}>
          {" "}
          Bienvenidos a Helus Restobar{" "}
        </Animated.Text>

        <View style={s.buttonContainer}>
          <Animated.View entering={FadeInDown.delay(300)}>
            <GoogleAutenBoton />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400)}>
            <Helusboton />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(500)}>
            <TouchableOpacity
              style={s.otherButton}
              onPress={handleOpenBottomSheet}
            >
              <Text style={s.otherButtonText}>
                Otro método de autenticación
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Animated.View
          style={s.privacyContainer}
          entering={FadeInDown.delay(500)}
        >
          <Text style={s.privacyText}>
            Por favor visita{" "}
            <Text style={s.privacyLink} onPress={openWebBrowser}>
              Términos de Servicio
            </Text>{" "}
            y <Text style={s.privacyLink}>Política de Privacidad</Text>
          </Text>
        </Animated.View>
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={s.sheetBackground}
        handleIndicatorStyle={{ backgroundColor: colors.goldDark }}
      >
        <BottomSheetView style={s.sheetContent}>
          <Text style={s.sheetTitle}>
            Inicia Sesión o crea una cuenta Helus
          </Text>

          <GoogleAutenBoton />

          <TouchableOpacity
            style={s.guestButton}
            onPress={continueAsGuest}
          >
            <Text style={s.guestButtonText}>Continuar como invitado</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.loginBg,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 40,
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
    marginBottom: 30,
    lineHeight: 30,
    color: c.text,
  },
  buttonContainer: {
    gap: 12,
    width: "100%",
  },
  otherButton: {
    backgroundColor: c.gray100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    borderRadius: 12,
    gap: 4,
  },
  otherButtonText: {
    color: c.gray600,
    fontSize: 18,
    fontWeight: "600",
  },

  privacyContainer: {
    paddingHorizontal: 20,
  },
  privacyText: {
    fontSize: 12,
    color: c.gray500,
    textAlign: "center",
    lineHeight: 16,
  },
  privacyLink: {
    color: c.primary,
    textDecorationLine: "underline",
  },

  sheetBackground: {
    backgroundColor: c.loginBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: c.border,
  },
  sheetContent: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 10,
    gap: 16,
  },

  sheetTitle: {
    color: c.text,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },
  guestButton: {
    marginTop: 10,
  },
  guestButtonText: {
    color: c.primary,
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
