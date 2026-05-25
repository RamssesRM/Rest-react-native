import { StyleSheet, Text, View, Image } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.infiniteScrollContainer}></View>
      
      <View style={styles.contentContainer}>
        <Image source={require('@/assets/images/wolt-logo.png')} style={styles.brandLogo} />
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
    alignItems: 'center',
  },
  brandLogo: {},
  infiniteScrollContainer: {}
});
