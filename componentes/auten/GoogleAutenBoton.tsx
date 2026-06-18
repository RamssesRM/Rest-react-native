//configuracion del boton de google autenticacion

import { Text, StyleSheet, TouchableOpacity } from "react-native";
const GoogleAutenBoton = () => {
  return (
    <TouchableOpacity style={styles.googleButton}>
      <Text>GoogleAutenBoton</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    googleButton: {}
});
export default GoogleAutenBoton;