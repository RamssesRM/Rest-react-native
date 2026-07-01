import { Colors } from "@/constants/theme";
import { getLocalProductos } from "@/src/db/menuService";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ComidasList = () => {
  // 1. Creamos los estados para manejar los datos y la carga
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Usamos useEffect para llamar a la BD justo cuando el componente se monta
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await getLocalProductos(); // Esperamos la respuesta de SQLite
        setProductos(data); // Guardamos los datos en el estado
      } catch (error) {
        console.error("Error al cargar productos locales:", error);
      } finally {
        setIsLoading(false); // Termina la carga, haya error o no
      }
    };

    cargarProductos();
  }, []); // El array vacío significa que solo se ejecuta una vez

  // 3. Mientras carga, mostramos el loader
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size={"large"} color={Colors.secondary} />
      </View>
    );
  }

  // 4. Si termina de cargar y no hay productos, mostramos un mensaje
  if (productos.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No hay comidas disponibles.</Text>
      </View>
    );
  }

  // 5. Si todo sale bien, renderizamos la lista
  return (
    <View style={styles.container}>
      {productos.map((item) => (
        <View key={item.id} style={styles.cardWrapper}>
          <TouchableOpacity style={styles.card}>
            {/* Si la imagen viene de Django (URL), necesita estar envuelta en { uri: ... } */}
            {item.imagen ? (
              <Image source={{ uri: item.imagen }} style={styles.image} />
            ) : (
              // Si no hay imagen, mostramos un cuadro gris para que no se deforme el diseño
              <View style={[styles.image, styles.placeholderImage]} />
            )}

            <View style={styles.info}>
              {/* OJO: Cambié item.name a item.nombre (como lo guardaste en SQLite) */}
              <Text style={styles.name}>{item.nombre}</Text>
              <Text style={styles.descripcion} numberOfLines={2}>
                {item.descripcion}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  cardWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  card: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light,
    overflow: "hidden",
    backgroundColor: '#fff', // Fondo blanco para que se vea bien la sombra
    // En React Native, para sombras que funcionen en Android e iOS al mismo tiempo, 
    // es mejor usar elevation para Android y shadow* para iOS:
    elevation: 4, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  descripcion: {
    fontSize: 14,
    color: '#666',
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: '#eee', // Color de fondo mientras carga la imagen
  },
  placeholderImage: {
    backgroundColor: '#e0e0e0', // Un gris más oscuro si no hay imagen
  }
});

// 6. Ya está exportado correctamente abajo del todo
export default ComidasList;