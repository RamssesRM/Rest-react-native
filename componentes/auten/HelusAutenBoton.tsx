//configuracion del boton de Helus autenticacion
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const Helusboton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.Helusboton}
      onPress={() => router.push("/helus-login")}
    >
      <Ionicons name="person-outline" color={"#fff"} size={24} />
      <Text style={styles.HelusbotonText}>Continuar con Helus Usuario</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  Helusboton: {
    backgroundColor: "#f4d642",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    borderRadius: 12,
    gap: 4,
  },
  HelusbotonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
export default Helusboton;
