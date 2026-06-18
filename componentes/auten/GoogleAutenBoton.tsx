//configuracion del boton de google autenticacion
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
const GoogleAutenBoton = () => {
  return (
    <TouchableOpacity style={styles.googleButton}>
      <Ionicons name="logo-google" color={"#fff"} size={24} />
      <Text style={styles.googleButtonText} >Continuar con Google</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    googleButton: {
      backgroundColor: "#4285F4",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 17,
      borderRadius: 12,
      gap: 4,
    },
    googleButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "600",
    }
});
export default GoogleAutenBoton;