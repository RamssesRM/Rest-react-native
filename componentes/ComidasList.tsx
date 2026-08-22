import { editarProducto, eliminarProducto, restaurarProducto } from '@/app/api/productosApi';
import AdminProductModal from '@/componentes/AdminProductModal';
import ProductDetailModal from '@/componentes/ProductDetailModal';
import { useTheme } from '@/hooks/use-theme';
import { useFilterStore } from '@/hooks/use-filterstore';
import useUserStore from '@/hooks/use-userstore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getLocalCategorias, getLocalProductos, getLocalProductosInactivos, saveSingleProducto, deleteSingleProducto, reactivarProducto as reactivarLocal } from '@/src/db/menuService';
import NetInfo from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { encolarPeticion } from '@/utils/offlineQueue';

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

type CategoriaLocal = {
    id: string;
    nombre: string;
    imagen: string | null;
};

type ComidasListProps = {
    refreshKey?: number;
};

const ComidasList = ({ refreshKey }: ComidasListProps) => {
    const [productos, setProductos] = useState<ProductoLocal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoLocal | null>(null);
    const [categorias, setCategorias] = useState<CategoriaLocal[]>([]);
    const [showInactivos, setShowInactivos] = useState(false);
    const { categories, sort } = useFilterStore();
    const { colors } = useTheme();
    const { user } = useUserStore();
    const isAdmin = user?.role === 'admin';

    const [productoDetalle, setProductoDetalle] = useState<ProductoLocal | null>(null);
    const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
    const router = useRouter();

    const handleVerDetalle = (producto: ProductoLocal) => {
        if (user?.role === 'cliente') {
            setProductoDetalle(producto);
            setModalDetalleVisible(true);
        }
    };

    const handleEnviarAOrden = (producto: ProductoLocal) => {
        setModalDetalleVisible(false);
        setProductoDetalle(null);
        router.push({
            pathname: '/comandas/nuevaOrden',
            params: {
                productoId: producto.id,
                productoNombre: producto.nombre,
                productoPrecio: String(producto.precio),
                productoImagen: producto.imagen || '',
            }
        });
    };

    const cargarDatos = async () => {
        try {
            const loader = showInactivos ? getLocalProductosInactivos : getLocalProductos;
            const [prods, cats] = await Promise.all([
                loader(),
                getLocalCategorias(),
            ]);
            console.log(`📦 SQLite productos: ${prods.length} (${showInactivos ? 'inactivos' : 'activos'}), categorías: ${cats?.length || 0}`);
            setProductos(prods);
            setCategorias(cats || []);
        } catch (error) {
            console.error("Error cargando productos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [refreshKey, showInactivos]);

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

    const handleEditar = (producto: ProductoLocal) => {
        setProductoSeleccionado(producto);
        setModalVisible(true);
    };

    const handleEliminar = (producto: ProductoLocal) => {
        Alert.alert(
            'Eliminar producto',
            `¿Estás seguro de eliminar "${producto.nombre}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const netInfo = await NetInfo.fetch();
                            if (!netInfo.isConnected) {
                                await encolarPeticion(
                                    'DELETE',
                                    `/productos/${producto.id}/`
                                );
                                Toast.show({
                                    type: 'info',
                                    text1: 'Sin conexión',
                                    text2: 'Petición encolada, se enviará cuando haya conexión',
                                });
                                return;
                            }

                            await eliminarProducto(producto.id);
                            await deleteSingleProducto(producto.id);
                            Toast.show({
                                type: 'success',
                                text1: 'Producto eliminado',
                            });
                            cargarDatos();
                        } catch (error: any) {
                            Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: error.message || 'No se pudo eliminar',
                            });
                        }
                    },
                },
            ]
        );
    };

    const handleReactivar = async (producto: ProductoLocal) => {
        try {
            const netInfo = await NetInfo.fetch();
            if (!netInfo.isConnected) {
                await encolarPeticion('PATCH', `/productos/${producto.id}/restaurar/`);
                Toast.show({
                    type: 'info',
                    text1: 'Sin conexión',
                    text2: 'Petición encolada, se enviará cuando haya conexión',
                });
                return;
            }

            await restaurarProducto(producto.id);
            await reactivarLocal(producto.id);
            Toast.show({
                type: 'success',
                text1: 'Producto reactivado',
            });
            cargarDatos();
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'No se pudo reactivar',
            });
        }
    };

    const handleSave = async (formData: FormData) => {
        const netInfo = await NetInfo.fetch();
        const isEdit = !!productoSeleccionado;

        if (!netInfo.isConnected) {
            const endpoint = isEdit
                ? `/productos/${productoSeleccionado.id}/`
                : '/productos/';
            const method = isEdit ? 'PATCH' : 'POST';

            const body: Record<string, any> = {};
            let imageUri: string | undefined;
            formData.forEach((value, key) => {
                if (key === 'imagen' && typeof value === 'object' && 'uri' in value) {
                    imageUri = (value as any).uri;
                } else {
                    body[key] = value;
                }
            });
            await encolarPeticion(method, endpoint, body, imageUri);
            Toast.show({
                type: 'info',
                text1: 'Sin conexión',
                text2: 'Petición encolada, se enviará cuando haya conexión',
            });
            return;
        }

        try {
            if (isEdit) {
                const actualizado = await editarProducto(productoSeleccionado.id, formData);
                await saveSingleProducto(actualizado);
                Toast.show({ type: 'success', text1: 'Producto actualizado' });
            } else {
                const creado = await import('@/app/api/productosApi').then((m) =>
                    m.crearProducto(formData)
                );
                creado.estatus = true;
                await saveSingleProducto(creado);
                Toast.show({ type: 'success', text1: 'Producto creado' });
            }

            cargarDatos();
        } catch (error: any) {
            const isAbort = error?.message?.includes('Aborted') || error?.name === 'AbortError';
            if (isAbort) {
                const endpoint = isEdit
                    ? `/productos/${productoSeleccionado.id}/`
                    : '/productos/';
                const method = isEdit ? 'PATCH' : 'POST';
                const body: Record<string, any> = {};
                let imageUri: string | undefined;
                formData.forEach((value, key) => {
                    if (key === 'imagen' && typeof value === 'object' && 'uri' in value) {
                        imageUri = (value as any).uri;
                    } else {
                        body[key] = value;
                    }
                });
                await encolarPeticion(method, endpoint, body, imageUri);
                Toast.show({
                    type: 'info',
                    text1: 'Servidor no responde',
                    text2: 'Petición encolada, se enviará cuando haya conexión',
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: error.message || 'No se pudo guardar',
                });
            }
        }
    };

    const s = styles(colors);

    if (isLoading) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color={colors.secondary} />
            </View>
        );
    }

    return (
        <View style={s.container}>
            {isAdmin && (
                <TouchableOpacity
                    style={[s.toggleBtn, showInactivos && { backgroundColor: colors.goldLight }]}
                    onPress={() => setShowInactivos(!showInactivos)}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={showInactivos ? "eye-off-outline" : "eye-outline"}
                        size={18}
                        color={showInactivos ? colors.goldDark : colors.textSecondary}
                    />
                    <Text style={[s.toggleText, showInactivos && { color: colors.goldDark }]}>
                        {showInactivos ? 'Ver activos' : 'Ver inactivos'}
                    </Text>
                </TouchableOpacity>
            )}

            {sortedProducts.length === 0 && (
                <View style={s.emptyContainer}>
                    <Ionicons name="restaurant-outline" size={48} color={colors.gray300} />
                    <Text style={s.emptyTitle}>
                        {showInactivos ? 'No hay productos inactivos' : 'No hay productos disponibles'}
                    </Text>
                    {!showInactivos && (
                        <Text style={s.emptySubtitle}>
                            Conéctate a internet la primera vez para sincronizar el menú.
                        </Text>
                    )}
                </View>
            )}

            {sortedProducts.map((item) => (
                <TouchableOpacity key={item.id} style={[s.card, showInactivos && { opacity: 0.7 }]} activeOpacity={0.8}
                    onPress={!isAdmin ? () => handleVerDetalle(item) : undefined}
                >
                    {isAdmin && (
                        <View style={s.adminActions}>
                            {showInactivos ? (
                                <TouchableOpacity
                                    style={[s.adminBtn, { backgroundColor: '#E8F5E9' }]}
                                    onPress={() => handleReactivar(item)}
                                >
                                    <Ionicons name="refresh" size={18} color="#4CAF50" />
                                </TouchableOpacity>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={[s.adminBtn, { backgroundColor: colors.goldLight }]}
                                        onPress={() => handleEditar(item)}
                                    >
                                        <Ionicons name="create-outline" size={18} color={colors.goldDark} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[s.adminBtn, { backgroundColor: '#FFEBEE' }]}
                                        onPress={() => handleEliminar(item)}
                                    >
                                        <Ionicons name="trash-outline" size={18} color="#E53935" />
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}
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

            <AdminProductModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setProductoSeleccionado(null);
                }}
                onSave={handleSave}
                producto={productoSeleccionado}
                categorias={categorias}
            />

            <ProductDetailModal
                visible={modalDetalleVisible}
                producto={productoDetalle}
                onClose={() => { setModalDetalleVisible(false); setProductoDetalle(null); }}
                onEnviarAOrden={handleEnviarAOrden}
                role={user?.role}
            />
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
    adminActions: {
        flexDirection: "row",
        gap: 8,
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 10,
    },
    adminBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
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
    toggleBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-end",
        marginRight: 16,
        marginBottom: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.card,
    },
    toggleText: {
        fontSize: 12,
        fontWeight: "600",
        color: c.textSecondary,
    },
});

export default ComidasList;
