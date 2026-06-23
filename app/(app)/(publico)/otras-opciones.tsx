import FacebookAutenBoton from "@/componentes/auten/FacebookAutenButon";
import GoogleAutenBoton from "@/componentes/auten/GoogleAutenBoton";
import { Colors, Fonts } from "@/constants/theme";
import useUserStore from "@/hooks/use-userstore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const Page = () => {
  const router = useRouter();
  const { setIsGuest, setUser } = useUserStore();
  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
    router.replace("/(app)/(autenticado)");
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => router.dismiss()}
      >
        <Ionicons name="close" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Inicia Sesión o crea una cuenta Helus</Text>
      <View style={styles.buttonContainer}>
        <Animated.View entering={FadeInDown.delay(100)}>
          <GoogleAutenBoton />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200)}>
          <FacebookAutenBoton />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(300)}>
          <TouchableOpacity
            style={styles.otherButton}
            onPress={continueAsGuest}
          >
            <Text style={styles.otherButtonText}>Continuar como invitado</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  closeBtn: {
    backgroundColor: Colors.light,
    borderRadius: 40,
    padding: 8,
    alignSelf: "flex-end",
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.brandBlack,
    marginVertical: 22,
  },
  buttonContainer: {
    gap: 12,
    width: "100%",
  },
  otherButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    borderRadius: 12,
    gap: 4,
  },
  otherButtonText: {
    color: Colors.secondary,
    fontSize: 18,
    fontWeight: "600",
  },
});

export default Page;
