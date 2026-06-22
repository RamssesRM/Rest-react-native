import { Colors } from "@/constants/theme";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const FacebookAutenBoton = () => {
  return (
    <TouchableOpacity style={styles.facebookButton}>
        <FontAwesome5 name="facebook" color={"#000"} size={24} />
        <Text style={styles.facebookButtonText} >Continuar con Facebook</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    facebookButton: {
      backgroundColor: Colors.light,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 17,
      borderRadius: 12,
      gap: 4,
    },
    facebookButtonText: {
      color: Colors.dark,
      fontSize: 18,
      fontWeight: "600",
    }
});
export default FacebookAutenBoton;