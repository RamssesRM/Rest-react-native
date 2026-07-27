import { useTheme } from "@/hooks/use-theme";
import { useFilterStore } from "@/hooks/use-filterstore";
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
  const [productos, setProductos] = useState<ProductoLocal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { categories, sort } = useFilterStore();
  const { colors } = useTheme();

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await getLocalProductos();
        setProductos(data);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    cargarProductos();
  }, []);

  const filteredProducts = productos.filter((item) => {
    if (categories.length > 0 && !categories.includes(item.categoria_nombre)) {
      return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "price") return a.precio - b.precio;
    if (sort === "name") return a.nombre.localeCompare(b.nombre);
    return 0;
  });

  const s = styles(colors);

  if (isLoading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  if (sortedProducts.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <Ionicons name="restaurant-outline" size={48} color={colors.gray300} />
        <Text style={s.emptyTitle}>No hay productos disponibles</Text>
        <Text style={s.emptySubtitle}>
          Conéctate a internet la primera vez para sincronizar el menú.
        </Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {sortedProducts.map((item) => (
        <TouchableOpacity key={item.id} style={s.card} activeOpacity={0.8}>
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
              <View style={s.footer}>
                <Text style={s.price}>
                  ${item.precio?.toFixed(2) || "0.00"}
                </Text>
                <View style={s.categoryBadge}>
                  <Text style={s.categoryText}>
                    {item.categoria_nombre}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingVertical: 40,
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
    marginHorizontal: 16,
    marginBottom: 14,
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
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: c.text,
  },
  categoryBadge: {
    backgroundColor: c.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
    color: c.secondary,
  },
});

export default ComidasList;
