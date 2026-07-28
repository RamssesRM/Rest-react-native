import { crearOrden, crearDetalle, getMesas, getCategorias, getProductos } from '@/app/api/ordenesApi';
import GuestGuard from '@/componentes/GuestGuard';
import useUserStore from '@/hooks/use-userstore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NuevaOrdenScreen() {
    const router = useRouter();
    const { user } = useUserStore();
    
    const [mesas, setMesas] = useState([]);
    const [selectedMesa, setSelectedMesa] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [selectedCat, setSelectedCat] = useState('');
    const [productos, setProductos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [carrito, setCarrito] = useState([]);

    useEffect(() => {
        const initData = async () => {
            try {
                const [mesasData, catsData, prodsData] = await Promise.all([
                    getMesas(),
                    getCategorias(),
                    getProductos(),
                ]);

                setMesas(mesasData);
                setCategorias(catsData);
                setProductos(prodsData);
            } catch (error) {
                Alert.alert('Error', 'No se pudo cargar la información');
            } finally {
                setIsLoading(false);
            }
        };
        if (user) initData();
    }, [user]);

    // 2. Lógica del Carrito
    const addToCart = (producto) => {
        setCarrito(prev => {
            const existe = prev.find(p => p.id === producto.id);
            if (existe) {
                return prev.map(p => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p);
            }
            return [...prev, { ...producto, cantidad: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCarrito(prev => prev.filter(p => p.id !== id));
    };

    const decreaseQuantity = (id) => {
        setCarrito(prev => {
            const item = prev.find(p => p.id === id);
            if (item && item.cantidad > 1) {
                return prev.map(p => p.id === id ? { ...p, cantidad: p.cantidad - 1 } : p);
            }
            return prev.filter(p => p.id !== id); // Si es 1, lo elimina
        });
    };

    // Calcular total localmente para mostrar en la UI
    const totalCarrito = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    // 3. Enviar Orden a Django
    const handleEnviarOrden = async () => {
        if (!selectedMesa) return Alert.alert('Error', 'Selecciona una mesa');
        if (carrito.length === 0) return Alert.alert('Error', 'Agrega productos al carrito');

        Alert.alert('Confirmar', '¿Enviar orden a cocina?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sí, enviar', style: 'destructive', onPress: enviarOrdenBackend }
        ]);
    };

    const enviarOrdenBackend = async () => {
        setIsLoading(true);
        try {
            const ordenCreada = await crearOrden({
                mesa_fk: selectedMesa.id,
                cliente: user.id,
                estatus: 'pidiendo'
            });

            for (const item of carrito) {
                await crearDetalle({
                    orden_fk: ordenCreada.id,
                    producto_fk: item.id,
                    precio: item.precio,
                    cantidad: item.cantidad
                });
            }

            Alert.alert('¡Éxito!', 'Orden enviada a cocina');
            router.back();
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear la orden');
        } finally {
            setIsLoading(false);
        }
    };

    // Filtrado de productos por categoría
    const productosFiltrados = selectedCat 
        ? productos.filter(p => String(p.categoria_fk).trim() === String(selectedCat).trim()) 
        : productos;

    if (isLoading) return <ActivityIndicator style={{flex:1}} color="#D4AF37" size="large"/>;

    return (
        <GuestGuard feature="crear una orden">
        <View style={styles.container}>
            
            {/* --- 1. SELECTOR DE MESAS --- */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Selecciona tu Mesa</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mesaScroll}>
                    {[...mesas].sort((a, b) => a.numero_mesa - b.numero_mesa).map(mesa => {
                        const ocupada = mesa.estatus !== 'disponible';
                        const seleccionada = selectedMesa?.id === mesa.id;
                        return (
                            <TouchableOpacity
                                key={mesa.id}
                                style={[styles.mesaCard, ocupada && styles.mesaOcupada, seleccionada && styles.mesaSeleccionada]}
                                disabled={ocupada}
                                onPress={() => setSelectedMesa(mesa)}
                            >
                                <Text style={[styles.mesaNum, ocupada && styles.textDisabled]}>{mesa.numero_mesa}</Text>
                                <Text style={[styles.mesaStatus, ocupada && styles.textDisabled]}>{mesa.estatus}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* --- 2. CATEGORÍAS Y PRODUCTOS --- */}
            <View style={styles.sectionFlex}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                    <TouchableOpacity style={[styles.chip, !selectedCat && styles.chipActive]} onPress={() => setSelectedCat('')}>
                        <Text style={[styles.chipText, !selectedCat && styles.chipTextActive]}>Todos</Text>
                    </TouchableOpacity>
                    {categorias.map(cat => (
                        <TouchableOpacity 
                            key={cat.id} 
                            style={[styles.chip, selectedCat === cat.id && styles.chipActive]} 
                            onPress={() => setSelectedCat(cat.id)}
                        >
                            <Text style={[styles.chipText, selectedCat === cat.id && styles.chipTextActive]}>{cat.nombre}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <FlatList
                    data={productosFiltrados}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.productRow}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.productCard} onPress={() => addToCart(item)}>
                            {item.imagen ? (
                                <Image source={{ uri: item.imagen }} style={styles.productImg} />
                            ) : (
                                <View style={[styles.productImg, styles.productImgPlaceholder]}><Ionicons name="restaurant" size={30} color="#ccc" /></View>
                            )}
                            <Text style={styles.productName} numberOfLines={1}>{item.nombre}</Text>
                            <Text style={styles.productPrice}>${item.precio}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* --- 3. CARRITO FIJO ABAJO --- */}
            {carrito.length > 0 && (
                <View style={styles.cartContainer}>
                    <FlatList
                        data={carrito}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <View style={styles.cartItem}>
                                <Text style={styles.cartItemName} numberOfLines={1}>{item.nombre}</Text>
                                <View style={styles.cartItemControls}>
                                    <TouchableOpacity onPress={() => decreaseQuantity(item.id)}><Ionicons name="remove-circle" size={24} color="#F44336" /></TouchableOpacity>
                                    <Text style={styles.cartItemQty}>{item.cantidad}</Text>
                                    <TouchableOpacity onPress={() => addToCart(item)}><Ionicons name="add-circle" size={24} color="#4CAF50" /></TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                    <TouchableOpacity style={styles.payButton} onPress={handleEnviarOrden}>
                        <Text style={styles.payButtonText}>Pagar ${totalCarrito.toFixed(2)}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
        </GuestGuard>
    );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#FAFAFA' 
    },
    
    // Mesas
    section: { 
        paddingVertical: 10, 
        backgroundColor: '#FFF', 
        borderBottomWidth: 1, 
        borderBottomColor: '#EFEFEF' 
    },
    sectionTitle: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#262626', 
        paddingHorizontal: 15, 
        marginBottom: 10 
    },
    mesaScroll: { 
        paddingHorizontal: 15 
    },
    mesaCard: { 
        backgroundColor: '#EFEFEF', 
        paddingHorizontal: 20, 
        paddingVertical: 10, 
        borderRadius: 10, 
        marginRight: 10, 
        alignItems: 'center', 
        borderWidth: 2, 
        borderColor: 'transparent' 
    },
    mesaSeleccionada: { 
        borderColor: '#D4AF37', 
        backgroundColor: '#FFF8E1'
     },
    mesaOcupada: { 
        opacity: 0.5 
    },
    mesaNum: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#262626' 
    },
    mesaStatus: { 
        fontSize: 12, 
        color: '#8E8E8E', 
        textTransform: 'capitalize' 
    },
    textDisabled: { 
        color: '#BDBDBD' 
    },

    // Categorías y Productos
    sectionFlex: { flex: 1 },
    catScroll: { 
        paddingHorizontal: 15, 
        paddingVertical: 10, 
        backgroundColor: '#FAFAFA' 
    },
    chip: { 
        backgroundColor: '#FFF', 
        borderWidth: 1, 
        borderColor: '#EFEFEF', 
        borderRadius: 20, 
        paddingHorizontal: 15, 
        paddingVertical: 8, 
        height: 40,
        marginRight: 10 
    },
    chipActive: { 
        backgroundColor: '#D4AF37', 
        borderColor: '#D4AF37' 
    },
    chipText: { 
        color: '#8E8E8E', 
        fontWeight: '600' 
    },
    chipTextActive: { 
        color: '#000' 
    },
    productRow: { 
        paddingHorizontal: 10, 
        gap: 10 
    },
    productCard: { 
        flex: 1, 
        backgroundColor: '#FFF', 
        borderRadius: 12, 
        marginBottom: 10, 
        borderWidth: 1, 
        borderColor: '#EFEFEF', 
        overflow: 'hidden' 
    },
    productImg: { 
        width: '100%', 
        height: 100 
    },
    productImgPlaceholder: { 
        backgroundColor: '#EFEFEF', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    productName: { 
        fontSize: 14, 
        fontWeight: '600', 
        color: '#262626', 
        padding: 8, 
        paddingHorizontal: 8 
    },
    productPrice: { 
        fontSize: 14, 
        fontWeight: 'bold', 
        color: '#D4AF37', 
        paddingBottom: 10, 
        paddingHorizontal: 8 
    },

    // Carrito
    cartContainer: { 
        backgroundColor: '#FFF', 
        borderTopWidth: 1, 
        borderTopColor: '#EFEFEF', 
        paddingVertical: 10, 
        maxHeight: 140 
    },
    cartItem: { 
        width: 140, 
        backgroundColor: '#F5F5F5', 
        borderRadius: 8, 
        padding: 8, 
        marginRight: 10, 
        justifyContent: 'space-between' 
    },
    cartItemName: { 
        fontSize: 13, 
        fontWeight: '600', 
        color: '#262626', 
        width: '70%' 
    },
    cartItemControls: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 5 
    },
    cartItemQty: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#262626', 
        minWidth: 20, 
        textAlign: 'center' 
    },
    payButton: { 
        backgroundColor: '#D4AF37', 
        marginHorizontal: 15, 
        paddingVertical: 15, 
        borderRadius: 12, 
        alignItems: 'center', 
        marginTop: 10 
    },
    payButtonText: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#000' 
    }
});