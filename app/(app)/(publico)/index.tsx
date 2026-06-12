import { Fonts } from "@/constants/theme";
import { Image, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

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
    textAlign: "center",
    marginBottom: 50,
    lineHeight: 30,
  },
  infiniteScrollContainer: {
    flex: 0.5,
  },
});
