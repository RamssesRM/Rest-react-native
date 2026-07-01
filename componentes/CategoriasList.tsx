import { Colors } from "@/constants/theme";
import { getLocalCategorias } from "@/src/db/menuService"; // ✅ Nuevo import
import React, { useEffect, useState } from "react"; // ✅ Hooks añadidos
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Nuevo tipo TypeScript para que no te marque error rojo
type CategoriaLocal = {
  id: string;
  nombre: string;
  imagen: string | null;
};

export const CategoriasList = () => {
  const [categorias, setCategorias] = useState<CategoriaLocal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Cargamos desde SQLite
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await getLocalCategorias();
        setCategorias(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    cargarCategorias();
  }, []);

  const renderCategory = ({ item }: { item: CategoriaLocal }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <View style={[styles.categoryImageContainer]}>
        {/* ✅ Si hay imagen de la BD la pone, si no, muestra un gris */}
        {item.imagen ? (
          <Image source={{ uri: item.imagen }} style={styles.categoryImage} />
        ) : (
          <View style={[styles.categoryImage, styles.placeholderImage]} />
        )}
      </View>
      <View style={styles.categoryInfo}>
        {/* ✅ Cambiado de item.name a item.nombre */}
        <Text style={styles.categoryName}>{item.nombre}</Text>
        {/* Cambié el "placesCount" por algo más útil para un restaurante */}
        <Text style={styles.categoryPlaces}>Ver menú</Text>
      </View>
    </TouchableOpacity>
  );

  // ✅ Loader mientras carga
  if (isLoading) {
    return (
      <View style={styles.categoriesSection}>
        <ActivityIndicator size="small" color={Colors.secondary} />
      </View>
    );
  }

  return (
    <View style={styles.categoriesSection}>
      <View style={styles.categoriesHeader}>
        <Text style={styles.categoriesTitle}>Categorías</Text>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAll}>Ver todo</Text>
        </TouchableOpacity>
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
  },
  seeAll: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: "500",
  },
  seeAllButton: {
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
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
    // Sombra cross-platform mejorada
    elevation: 3, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryImageContainer: {
    padding: 12,
    // Quito el backgroundColor dinámico porque SQLite no lo tiene
    backgroundColor: "#f9f9f9", 
  },
  categoryImage: {
    width: 106,
    height: 106,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: "#e0e0e0", // Color gris si no hay imagen
  },
  categoryInfo: {
    backgroundColor: "#fff",
    padding: 12,
    paddingTop: 4,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  categoryPlaces: {
    fontSize: 12,
    color: Colors.muted,
  },
});