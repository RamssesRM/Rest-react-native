import { Colors } from "@/constants/theme";
import { getLocalCategorias } from "@/src/db/menuService";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type CategoriaLocal = {
  id: string;
  nombre: string;
  imagen: string | null;
};

export const CategoriasList = () => {
  const [categorias, setCategorias] = useState<CategoriaLocal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargamos categorías desde SQLite
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await getLocalCategorias();
        setCategorias(data || []);
      } catch (error) {
        console.error("Error al cargar categorías locales:", error);
      } finally {
        setIsLoading(false);
      }
    };
    cargarCategorias();
  }, []);

  const renderCategory = ({ item }: { item: CategoriaLocal }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <View style={styles.categoryImageContainer}>
        {item.imagen ? (
          <Image source={{ uri: item.imagen }} style={styles.categoryImage} />
        ) : (
          <View style={[styles.categoryImage, styles.placeholderImage]} />
        )}
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.nombre}</Text>
        <Text style={styles.categoryPlaces}>Ver menú</Text>
      </View>
    </TouchableOpacity>
  );

  // Loader mientras carga
  if (isLoading) {
    return (
      <View style={styles.categoriesSection}>
        <ActivityIndicator size="small" color={Colors.secondary || "#000"} />
      </View>
    );
  }

  return (
    <View style={styles.categoriesSection}>
      <View style={styles.categoriesHeader}>
        <Text style={styles.categoriesTitle}>Categorías</Text>
      </View>
      <FlatList
        horizontal
        data={categorias}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  categoriesSection: {
    marginBottom: 24,
  },
  categoriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 6,
    color: "#333",
  },
  categoriesList: {
    gap: 12,
    paddingHorizontal: 16,
  },
  categoryCard: {
    width: 130,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginVertical: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryImageContainer: {
    padding: 12,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  categoryImage: {
    width: 106,
    height: 106,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: "#e0e0e0",
  },
  categoryInfo: {
    backgroundColor: "#fff",
    padding: 12,
    paddingTop: 4,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
    color: "#111",
  },
  categoryPlaces: {
    fontSize: 12,
    color: "#666",
  },
});

export default CategoriasList;