import React, { useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
import useUserStore from "@/hooks/use-userstore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiClient } from "@/app/api/apiClient";
import { crearComentario } from "@/app/api/comentariosApi";
import StarRating from "@/componentes/StarRating";

const CALIFICACIONES = [
  { value: 5, label: "Me gustó mucho" },
  { value: 4, label: "Me gustó" },
  { value: 3, label: "No es de mi agrado" },
  { value: 2, label: "No me gustó" },
  { value: 1, label: "No me gustó mucho" },
];

const Descubrir = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useUserStore();

  const [categorias, setCategorias] = useState<any[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalView, setModalView] = useState<"reviews" | "write">("reviews");

  const [resenas, setResenas] = useState<any[]>([]);
  const [loadingResenas, setLoadingResenas] = useState(false);
  const [promedio, setPromedio] = useState(0);
  const [totalResenas, setTotalResenas] = useState(0);

  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const response = await apiClient("/categorias/");
        if (response.ok) {
          const data = await response.json();
          setCategorias(Array.isArray(data) ? data : data.results || []);
        }
      } catch (error) {}
    };
    cargarCategorias();
  }, []);

  const buscarProductos = useCallback(async (query: string, catId: string | null) => {
    setLoading(true);
    try {
      let url = "/productos/?";
      if (query.length >= 2) url += `search=${encodeURIComponent(query)}&`;
      if (catId) url += `categoria_fk=${catId}`;
      if (url.endsWith("?") || url.endsWith("&")) url = url.slice(0, -1);

      const response = await apiClient(url);
      if (response.ok) {
        const data = await response.json();
        setProductos(Array.isArray(data) ? data : data.results || []);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      buscarProductos(search, selectedCategoria);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, selectedCategoria, buscarProductos]);

  const toggleCategoria = (id: string) => {
    setSelectedCategoria((prev) => (prev === id ? null : id));
    setSearch("");
  };

  const cargarResenas = async (productoId: string) => {
    setLoadingResenas(true);
    try {
      const response = await apiClient(`/comentarios/?producto_fk=${productoId}`);
      if (response.ok) {
        const data = await response.json();
        const lista = Array.isArray(data) ? data : data.results || [];
        setResenas(lista);

        if (lista.length > 0) {
          const suma = lista.reduce((acc: number, r: any) => acc + (r.calificacion || 0), 0);
          setPromedio(suma / lista.length);
          setTotalResenas(lista.length);
        } else {
          setPromedio(0);
          setTotalResenas(0);
        }
      }
    } catch (error) {
    } finally {
      setLoadingResenas(false);
    }
  };

  const openModal = (producto: any) => {
    setSelectedProduct(producto);
    setModalView("reviews");
    setCalificacion(5);
    setComentario("");
    setModalVisible(true);
    cargarResenas(producto.id);
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión para comentar");
      return;
    }

    setSending(true);
    try {
      await crearComentario({
        producto_fk: selectedProduct.id,
        usuario_fk: user.id,
        calificacion,
        descripcion: comentario.trim(),
      });
      setCalificacion(5);
      setComentario("");
      setModalView("reviews");
      cargarResenas(selectedProduct.id);
      Alert.alert("¡Listo!", "Tu comentario fue enviado");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo enviar el comentario");
    } finally {
      setSending(false);
    }
  };

  const s = styles(colors);

  const renderCategoria = ({ item }: { item: any }) => {
    const isActive = selectedCategoria === item.id;
    return (
      <TouchableOpacity
        style={[s.catChip, isActive && s.catChipActive]}
        onPress={() => toggleCategoria(item.id)}
      >
        <Text style={[s.catChipText, isActive && s.catChipTextActive]}>
          {item.nombre}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProducto = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={s.productCard}
      onPress={() => openModal(item)}
      activeOpacity={0.7}
    >
      <View style={s.productInfo}>
        <Text style={s.productName}>{item.nombre}</Text>
        <Text style={s.productDesc} numberOfLines={2}>
          {item.descripcion}
        </Text>
        <Text style={s.productPrice}>
          ${parseFloat(item.precio).toFixed(2)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  const renderResena = ({ item }: { item: any }) => (
    <View style={s.resenaCard}>
      <View style={s.resenaHeader}>
        <View style={s.resenaUser}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>
              {(item.usuario_nombre || "U").charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={s.resenaNombre}>{item.usuario_nombre || "Usuario"}</Text>
        </View>
        <StarRating rating={item.calificacion || 0} size={14} />
      </View>
      {item.calificacion_display ? (
        <Text style={s.resenaCalificacion}>{item.calificacion_display}</Text>
      ) : null}
      {item.descripcion ? (
        <Text style={s.resenaTexto}>{item.descripcion}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.title}>Comentarios</Text>
        <Text style={s.subtitle}>Busca un platillo y déjanos tu opinión</Text>
      </View>

      <View style={s.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="Buscar platillo..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={s.categoriesSection}>
        <FlatList
          horizontal
          data={categorias}
          renderItem={renderCategoria}
          keyExtractor={(item) => String(item.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.categoriesList}
        />
      </View>

      {loading && (
        <ActivityIndicator size="small" color={colors.brandYellow} style={s.loader} />
      )}

      {!loading && productos.length === 0 && (
        <View style={s.emptyContainer}>
          <Ionicons name="restaurant-outline" size={48} color={colors.textMuted} />
          <Text style={s.emptyText}>
            {search.length >= 2 || selectedCategoria
              ? "No se encontraron platillos"
              : "Selecciona una categoría o busca un platillo"}
          </Text>
        </View>
      )}

      <FlatList
        data={productos}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderProducto}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle} numberOfLines={1}>
                {selectedProduct?.nombre}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {modalView === "reviews" ? (
              <>
                <View style={s.productDetailRow}>
                  <Text style={s.productDetailPrice}>
                    ${selectedProduct ? parseFloat(selectedProduct.precio).toFixed(2) : "0.00"}
                  </Text>
                  <View style={s.ratingBadge}>
                    <Ionicons name="star" size={16} color={colors.brandYellow} />
                    <Text style={s.ratingBadgeText}>
                      {promedio > 0 ? promedio.toFixed(1) : "—"}
                    </Text>
                    <Text style={s.ratingBadgeCount}>({totalResenas})</Text>
                  </View>
                </View>

                {selectedProduct?.descripcion ? (
                  <Text style={s.productDetailDesc}>{selectedProduct.descripcion}</Text>
                ) : null}

                <Text style={s.sectionTitle}>Reseñas</Text>

                {loadingResenas ? (
                  <ActivityIndicator size="small" color={colors.brandYellow} style={{ marginTop: 20 }} />
                ) : resenas.length === 0 ? (
                  <View style={s.emptyResenas}>
                    <Ionicons name="chatbubble-outline" size={36} color={colors.textMuted} />
                    <Text style={s.emptyResenasText}>No hay reseñas aún</Text>
                    <Text style={s.emptyResenasSubtext}>Sé el primero en comentar</Text>
                  </View>
                ) : (
                  <FlatList
                    data={resenas}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderResena}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={s.resenasList}
                  />
                )}

                <TouchableOpacity
                  style={s.writeReviewButton}
                  onPress={() => setModalView("write")}
                >
                  <Ionicons name="pencil" size={18} color={colors.brandDark} />
                  <Text style={s.writeReviewText}>Escribir reseña</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={s.sectionLabel}>¿Qué tal estuvo?</Text>
                <StarRating
                  rating={calificacion}
                  onRate={setCalificacion}
                  interactive
                  size={32}
                />
                <Text style={s.calificacionLabel}>
                  {CALIFICACIONES.find((c) => c.value === calificacion)?.label}
                </Text>

                <Text style={s.sectionLabel}>Opciones rápidas</Text>
                <View style={s.optionsContainer}>
                  {CALIFICACIONES.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        s.optionChip,
                        calificacion === option.value && s.optionChipActive,
                      ]}
                      onPress={() => setCalificacion(option.value)}
                    >
                      <Text
                        style={[
                          s.optionText,
                          calificacion === option.value && s.optionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={s.sectionLabel}>Tu comentario (opcional)</Text>
                <TextInput
                  style={s.commentInput}
                  placeholder="Escribe tu opinión..."
                  placeholderTextColor={colors.textMuted}
                  value={comentario}
                  onChangeText={setComentario}
                  multiline
                  maxLength={200}
                  textAlignVertical="top"
                />

                <View style={s.writeButtonsRow}>
                  <TouchableOpacity
                    style={s.backButton}
                    onPress={() => setModalView("reviews")}
                  >
                    <Text style={s.backButtonText}>Volver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.submitButton, sending && s.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={sending}
                  >
                    {sending ? (
                      <ActivityIndicator color={colors.brandDark} size="small" />
                    ) : (
                      <Text style={s.submitText}>Enviar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = (c: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 12,
    },
    title: {
      fontSize: 26,
      fontWeight: "800",
      color: c.text,
    },
    subtitle: {
      fontSize: 14,
      color: c.textMuted,
      marginTop: 4,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.surface,
      borderRadius: 14,
      marginHorizontal: 20,
      paddingHorizontal: 16,
      height: 50,
      borderWidth: 1,
      borderColor: c.border,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: c.text,
    },
    categoriesSection: {
      marginTop: 12,
      marginBottom: 4,
    },
    categoriesList: {
      paddingHorizontal: 20,
      gap: 10,
    },
    catChip: {
      backgroundColor: c.chipBg,
      borderRadius: 20,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: c.border,
    },
    catChipActive: {
      backgroundColor: c.brandYellow,
      borderColor: c.brandYellow,
    },
    catChipText: {
      fontSize: 14,
      fontWeight: "600",
      color: c.textSecondary,
    },
    catChipTextActive: {
      color: c.brandDark,
    },
    loader: {
      marginTop: 20,
    },
    emptyContainer: {
      alignItems: "center",
      marginTop: 40,
      gap: 12,
    },
    emptyText: {
      fontSize: 15,
      color: c.textMuted,
      textAlign: "center",
      paddingHorizontal: 40,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 20,
    },
    productCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: c.border,
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: 16,
      fontWeight: "700",
      color: c.text,
      marginBottom: 4,
    },
    productDesc: {
      fontSize: 13,
      color: c.textSecondary,
      marginBottom: 6,
    },
    productPrice: {
      fontSize: 15,
      fontWeight: "700",
      color: c.brandYellow,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: c.overlay,
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: c.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      maxHeight: "85%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: c.text,
      flex: 1,
      marginRight: 12,
    },
    productDetailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    productDetailPrice: {
      fontSize: 18,
      fontWeight: "700",
      color: c.brandYellow,
    },
    ratingBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: c.brandYellowLight,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    ratingBadgeText: {
      fontSize: 14,
      fontWeight: "700",
      color: c.brandYellow,
    },
    ratingBadgeCount: {
      fontSize: 12,
      color: c.textMuted,
    },
    productDetailDesc: {
      fontSize: 14,
      color: c.textSecondary,
      marginBottom: 16,
      lineHeight: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: c.text,
      marginBottom: 12,
    },
    emptyResenas: {
      alignItems: "center",
      paddingVertical: 30,
      gap: 8,
    },
    emptyResenasText: {
      fontSize: 15,
      fontWeight: "600",
      color: c.textSecondary,
    },
    emptyResenasSubtext: {
      fontSize: 13,
      color: c.textMuted,
    },
    resenasList: {
      paddingBottom: 8,
    },
    resenaCard: {
      backgroundColor: c.background,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: c.border,
    },
    resenaHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    resenaUser: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    avatarCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.brandYellow,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 13,
      fontWeight: "700",
      color: c.brandDark,
    },
    resenaNombre: {
      fontSize: 14,
      fontWeight: "600",
      color: c.text,
    },
    resenaCalificacion: {
      fontSize: 12,
      color: c.brandYellow,
      fontWeight: "600",
      marginBottom: 4,
    },
    resenaTexto: {
      fontSize: 14,
      color: c.textSecondary,
      lineHeight: 20,
    },
    writeReviewButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.brandYellow,
      height: 48,
      borderRadius: 14,
      gap: 8,
      marginTop: 8,
    },
    writeReviewText: {
      fontSize: 16,
      fontWeight: "700",
      color: c.brandDark,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: c.textSecondary,
      marginBottom: 10,
      marginTop: 8,
    },
    calificacionLabel: {
      fontSize: 14,
      color: c.brandYellow,
      fontWeight: "600",
      marginTop: 8,
      textAlign: "center",
    },
    optionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 8,
    },
    optionChip: {
      backgroundColor: c.chipBg,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    optionChipActive: {
      backgroundColor: c.brandYellowLight,
      borderColor: c.brandYellowBorder,
    },
    optionText: {
      fontSize: 13,
      color: c.textSecondary,
    },
    optionTextActive: {
      color: c.brandYellow,
      fontWeight: "600",
    },
    commentInput: {
      backgroundColor: c.inputBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.inputBorder,
      padding: 14,
      fontSize: 15,
      color: c.text,
      height: 100,
      textAlignVertical: "top",
    },
    writeButtonsRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 20,
    },
    backButton: {
      flex: 1,
      height: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: c.border,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: c.textSecondary,
    },
    submitButton: {
      flex: 2,
      height: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.brandYellow,
    },
    submitButtonDisabled: {
      opacity: 0.7,
    },
    submitText: {
      fontSize: 17,
      fontWeight: "700",
      color: c.brandDark,
    },
  });

export default Descubrir;
