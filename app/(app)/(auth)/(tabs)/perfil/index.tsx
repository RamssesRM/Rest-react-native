import { ScrollView, StyleSheet, Text } from 'react-native';
const Perfil = () => {
  return (
    <ScrollView contentInsetAdjustmentBehavior='automatic' contentContainerStyle={styles.container}>
      {/* Creamos nuestro propio Large Title que se verá igual en iOS y Android */}
      <Text style={styles.largeTitle}>Perfil</Text>
      <Text>Contenido de la cuenta...</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 40, // Espacio superior para que respire respecto a la barra de estado
    paddingHorizontal: 20,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  }
});

export default Perfil;