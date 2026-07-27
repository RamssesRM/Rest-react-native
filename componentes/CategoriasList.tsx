import { useTheme } from "@/hooks/use-theme";
import { useFilterStore } from "@/hooks/use-filterstore";
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
  const { categories, setFilters, clearFilters } = useFilterStore();
  const { colors } = useTheme();

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

  const toggleCategory = (nombre: string) => {
    if (categories.length === 1 && categories[0] === nombre) {
      clearFilters();
    } else {
      setFilters({ categories: [nombre], price: null, sort: "recommended" });
    }
  };

  const s = styles(colors);

  const renderCategory = ({ item }: { item: CategoriaLocal }) => {
    const isActive = categories.length === 1 && categories[0] === item.nombre;
    return (
      <TouchableOpacity
        style={[s.categoryCard, isActive && s.categoryCardActive]}
        onPress={() => toggleCategory(item.nombre)}
      >
        <View style={s.categoryImageContainer}>
          {item.imagen ? (
            <Image source={{ uri: item.imagen }} style={s.categoryImage} />
          ) : (
            <View style={[s.categoryImage, s.placeholderImage]} />
          )}
        </View>
        <View style={s.categoryInfo}>
          <Text style={[s.categoryName, isActive && s.categoryNameActive]}>
            {item.nombre}
          </Text>
          <Text style={s.categoryPlaces}>Ver menú</Text>
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
        {categories.length > 0 && (
          <TouchableOpacity style={s.seeAllButton} onPress={clearFilters}>
            <Text style={s.seeAll}>Ver todo</Text>
          </TouchableOpacity>
        )}
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
  seeAll: {
    fontSize: 14,
    color: c.secondary,
    fontWeight: "500",
  },
  seeAllButton: {
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: c.primaryLight,
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
  categoryCardActive: {
    borderColor: c.gold,
    backgroundColor: c.goldLight,
  },
  categoryImageContainer: {
    padding: 12,
    backgroundColor: c.gray100,
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
    marginBottom: 2,
    color: c.text,
  },
  categoryNameActive: {
    fontWeight: "700",
  },
  categoryPlaces: {
    fontSize: 12,
    color: c.textMuted,
  },
});
