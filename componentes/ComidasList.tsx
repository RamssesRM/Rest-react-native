import { Colors } from "@/constants/theme";
import { getLocalProductos } from "@/src/db/menuService";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ProductoLocal = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string | null;
  categoria_id: string;
  categoria_nombre: string;
  estatus: number;
};

const ComidasList = () => {
  // 1. Estados para manejar los datos y la carga
  const [productos, setProductos] = useState<ProductoLocal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Cargar productos desde SQLite
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await getLocalProductos();
        setProductos(data || []);
      } catch (error) {
        console.error("Error al cargar productos locales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarProductos();
  }, []);

  // 3. Estado de carga
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.secondary || "#000"} />
      </View>
    );
  }

  // 4. Estado sin datos
  if (productos.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="restaurant-outline" size={48} color="#999" />
        <Text style={styles.emptyTitle}>No hay productos disponibles</Text>
        <Text style={styles.emptySubtitle}>
          Conéctate a internet la primera vez para sincronizar el menú.
        </Text>
      </View>
    );
  }

  // 5. Renderizado de lista
  return (
    <View style={styles.container}>
      {productos.map((item) => (
        <View key={item.id} style={styles.cardWrapper}>
          <TouchableOpacity style={styles.card}>
            {item.imagen ? (
              <Image source={{ uri: item.imagen }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.placeholderImage]} />
            )}

            <View style={styles.info}>
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
    padding: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 6,
  },
  cardWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light || "#ccc",
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: "#eee",
  },
  placeholderImage: {
    backgroundColor: "#e0e0e0",
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  descripcion: {
    fontSize: 14,
    color: "#666",
  },
});

export default ComidasList;