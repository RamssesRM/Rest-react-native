import { useTheme } from "@/hooks/use-theme";
import { getLocalCategorias } from "@/src/db/menuService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
  const { colors } = useTheme();
  const router = useRouter();

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

  const s = styles(colors);

  const renderCategory = ({ item }: { item: CategoriaLocal }) => {
    return (
      <TouchableOpacity
        style={s.categoryCard}
        onPress={() => router.push(`/(app)/(auth)/(tabs)/comidas/${item.id}`)}
      >
        <View style={s.categoryImageContainer}>
          {item.imagen ? (
            <Image source={{ uri: item.imagen }} style={s.categoryImage} />
          ) : (
            <View style={[s.categoryImage, s.placeholderImage]} />
          )}
        </View>
        <View style={s.categoryInfo}>
          <Text style={s.categoryName}>
            {item.nombre}
          </Text>
          <View style={s.categoryLink}>
            <Text style={s.categoryLinkText}>Ver menú</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.goldDark} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={s.categoriesSection}>
        <ActivityIndicator size="small" color={colors.secondary} />
      </View>
    );
  }

  return (
    <View style={s.categoriesSection}>
      <View style={s.categoriesHeader}>
        <Text style={s.categoriesTitle}>Categorías</Text>
      </View>
      <FlatList
        horizontal
        data={categorias}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.categoriesList}
      />
    </View>
  );
};

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
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
    color: c.text,
  },
  categoriesList: {
    gap: 12,
    paddingHorizontal: 16,
  },
  categoryCard: {
    width: 130,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: c.card,
    marginVertical: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryImageContainer: {
    padding: 12,
    backgroundColor: c.gray100,
    alignItems: "center",
  },
  categoryImage: {
    width: 106,
    height: 106,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: c.gray200,
  },
  categoryInfo: {
    backgroundColor: c.card,
    padding: 12,
    paddingTop: 4,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: c.text,
  },
  categoryLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  categoryLinkText: {
    fontSize: 12,
    color: c.goldDark,
    fontWeight: "500",
  },
});

export default CategoriasList;
