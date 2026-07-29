import { useTheme } from "@/hooks/use-theme";
import { getCategoriaById, getProductosByCategoria } from "@/src/db/menuService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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

type ProductoLocal = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string | null;
  categoria_id: string;
  categoria_nombre: string;
};

type CategoriaLocal = {
  id: string;
  nombre: string;
  imagen: string | null;
};

const CategoriaDetalleScreen = () => {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const [categoria, setCategoria] = useState<CategoriaLocal | null>(null);
  const [productos, setProductos] = useState<ProductoLocal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (categoryId) {
      cargarDatos();
    }
  }, [categoryId]);

  const cargarDatos = async () => {
    try {
      const [catData, prodsData] = await Promise.all([
        getCategoriaById(categoryId),
        getProductosByCategoria(categoryId),
      ]);
      setCategoria(catData);
      setProductos(prodsData);
    } catch (error) {
      console.error("Error cargando categoría:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const s = styles(colors);

  if (isLoading) {
    return (
      <View style={s.loaderContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>
          {categoria?.nombre || "Categoría"}
        </Text>
        <View style={s.backBtn} />
      </View>

      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Ionicons name="restaurant-outline" size={48} color={colors.gray300} />
            <Text style={s.emptyTitle}>No hay productos</Text>
            <Text style={s.emptySubtitle}>
              No se encontraron platillos en esta categoría.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} activeOpacity={0.8}>
            <View style={s.cardContent}>
              {item.imagen ? (
                <Image source={{ uri: item.imagen }} style={s.image} />
              ) : (
                <View style={[s.image, s.placeholderImage]}>
                  <Ionicons name="restaurant-outline" size={32} color={colors.gray300} />
                </View>
              )}
              <View style={s.info}>
                <Text style={s.name}>{item.nombre}</Text>
                <Text style={s.description} numberOfLines={2}>
                  {item.descripcion}
                </Text>
                <Text style={s.price}>${item.precio?.toFixed(2) || "0.00"}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default CategoriaDetalleScreen;

const styles = (c: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: c.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: c.card,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    backBtn: {
      padding: 4,
      width: 32,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: c.text,
      flex: 1,
      textAlign: "center",
    },
    list: {
      padding: 16,
      gap: 14,
    },
    emptyContainer: {
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginTop: 12,
      color: c.textSecondary,
    },
    emptySubtitle: {
      fontSize: 13,
      color: c.textMuted,
      textAlign: "center",
      marginTop: 6,
    },
    card: {
      borderRadius: 14,
      backgroundColor: c.card,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      overflow: "hidden",
    },
    cardContent: {
      flexDirection: "row",
      alignItems: "stretch",
    },
    image: {
      width: 110,
      height: 110,
    },
    placeholderImage: {
      backgroundColor: c.gray100,
      alignItems: "center",
      justifyContent: "center",
    },
    info: {
      flex: 1,
      padding: 12,
      justifyContent: "space-between",
    },
    name: {
      fontSize: 15,
      fontWeight: "700",
      color: c.text,
      marginBottom: 4,
    },
    description: {
      fontSize: 12,
      color: c.textMuted,
      lineHeight: 17,
      marginBottom: 6,
    },
    price: {
      fontSize: 16,
      fontWeight: "800",
      color: c.goldDark,
    },
  });
