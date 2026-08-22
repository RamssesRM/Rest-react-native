import { crearOrden, crearDetalle, getMesas, getCategorias, getProductos } from '@/app/api/ordenesApi';
import GuestGuard from '@/componentes/GuestGuard';
import { useTheme } from '@/hooks/use-theme';
import useUserStore from '@/hooks/use-userstore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type NuevaOrdenParams = {
    productoId?: string;
    productoNombre?: string;
    productoPrecio?: string;
    productoImagen?: string;
};

export default function NuevaOrdenScreen() {
    const router = useRouter();
    const { user } = useUserStore();
    const { colors } = useTheme();
    const s = styles(colors);
    
    const params = useLocalSearchParams<NuevaOrdenParams>();
    const [mesas, setMesas] = useState([]);
    const [selectedMesa, setSelectedMesa] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [selectedCat, setSelectedCat] = useState('');
    const [productos, setProductos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [preloaded, setPreloaded] = useState(false);
    
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

    useEffect(() => {
        if (!isLoading && params.productoId && params.productoNombre && params.productoPrecio && !preloaded) {
            const productoPreCargado = {
                id: params.productoId,
                nombre: params.productoNombre,
                precio: parseFloat(params.productoPrecio),
                imagen: params.productoImagen || null,
            };
            addToCart(productoPreCargado);
            setPreloaded(true);
        }
    }, [isLoading, params, preloaded]);

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
            return prev.filter(p => p.id !== id);
        });
    };

    const totalCarrito = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

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
            router.replace('/comandas');
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear la orden');
        } finally {
            setIsLoading(false);
        }
    };

    const productosFiltrados = selectedCat 
        ? productos.filter(p => String(p.categoria_fk).trim() === String(selectedCat).trim()) 
        : productos;

    if (isLoading) return <ActivityIndicator style={{flex:1}} color={colors.goldDark} size="large"/>;

    return (
        <GuestGuard feature="crear una orden">
        <View style={s.container}>
            
            <View style={s.section}>
                <Text style={s.sectionTitle}>Selecciona tu Mesa</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.mesaScroll}>
                    {[...mesas].sort((a, b) => a.numero_mesa - b.numero_mesa).map(mesa => {
                        const ocupada = mesa.estatus !== 'disponible';
                        const seleccionada = selectedMesa?.id === mesa.id;
                        return (
                            <TouchableOpacity
                                key={mesa.id}
                                style={[s.mesaCard, ocupada && s.mesaOcupada, seleccionada && s.mesaSeleccionada]}
                                disabled={ocupada}
                                onPress={() => setSelectedMesa(mesa)}
                            >
                                <Text style={[s.mesaNum, ocupada && s.textDisabled]}>{mesa.numero_mesa}</Text>
                                <Text style={[s.mesaStatus, ocupada && s.textDisabled]}>{mesa.estatus}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <View style={s.sectionFlex}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll}>
                    <TouchableOpacity style={[s.chip, !selectedCat && s.chipActive]} onPress={() => setSelectedCat('')}>
                        <Text style={[s.chipText, !selectedCat && s.chipTextActive]}>Todos</Text>
                    </TouchableOpacity>
                    {categorias.map(cat => (
                        <TouchableOpacity 
                            key={cat.id} 
                            style={[s.chip, selectedCat === cat.id && s.chipActive]} 
                            onPress={() => setSelectedCat(cat.id)}
                        >
                            <Text style={[s.chipText, selectedCat === cat.id && s.chipTextActive]}>{cat.nombre}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <FlatList
                    data={productosFiltrados}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    columnWrapperStyle={s.productRow}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={s.productCard} onPress={() => addToCart(item)}>
                            {item.imagen ? (
                                <Image source={{ uri: item.imagen }} style={s.productImg} />
                            ) : (
                                <View style={[s.productImg, s.productImgPlaceholder]}><Ionicons name="restaurant" size={30} color={colors.gray300} /></View>
                            )}
                            <Text style={s.productName} numberOfLines={1}>{item.nombre}</Text>
                            <Text style={s.productPrice}>${item.precio}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {carrito.length > 0 && (
                <View style={s.cartContainer}>
                    <FlatList
                        data={carrito}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <View style={s.cartItem}>
                                <Text style={s.cartItemName} numberOfLines={1}>{item.nombre}</Text>
                                <View style={s.cartItemControls}>
                                    <TouchableOpacity onPress={() => decreaseQuantity(item.id)}><Ionicons name="remove-circle" size={24} color={colors.danger} /></TouchableOpacity>
                                    <Text style={s.cartItemQty}>{item.cantidad}</Text>
                                    <TouchableOpacity onPress={() => addToCart(item)}><Ionicons name="add-circle" size={24} color={colors.success} /></TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                    <TouchableOpacity style={s.payButton} onPress={handleEnviarOrden}>
                        <Text style={s.payButtonText}>Pagar ${totalCarrito.toFixed(2)}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
        </GuestGuard>
    );
}

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: c.background 
    },
    section: { 
        paddingVertical: 10, 
        backgroundColor: c.card, 
        borderBottomWidth: 1, 
        borderBottomColor: c.border 
    },
    sectionTitle: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: c.text, 
        paddingHorizontal: 15, 
        marginBottom: 10 
    },
    mesaScroll: { 
        paddingHorizontal: 15 
    },
    mesaCard: { 
        backgroundColor: c.chipBg, 
        paddingHorizontal: 20, 
        paddingVertical: 10, 
        borderRadius: 10, 
        marginRight: 10, 
        alignItems: 'center', 
        borderWidth: 2, 
        borderColor: 'transparent' 
    },
    mesaSeleccionada: { 
        borderColor: c.goldDark, 
        backgroundColor: c.goldLight
    },
    mesaOcupada: { 
        opacity: 0.5 
    },
    mesaNum: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: c.text 
    },
    mesaStatus: { 
        fontSize: 12, 
        color: c.textMuted, 
        textTransform: 'capitalize' 
    },
    textDisabled: { 
        color: c.gray400 
    },
    sectionFlex: { flex: 1 },
    catScroll: { 
        paddingHorizontal: 15, 
        paddingVertical: 10, 
        backgroundColor: c.background 
    },
    chip: { 
        backgroundColor: c.card, 
        borderWidth: 1, 
        borderColor: c.border, 
        borderRadius: 20, 
        paddingHorizontal: 15, 
        paddingVertical: 8, 
        height: 40,
        marginRight: 10 
    },
    chipActive: { 
        backgroundColor: c.goldDark, 
        borderColor: c.goldDark 
    },
    chipText: { 
        color: c.textMuted, 
        fontWeight: '600' 
    },
    chipTextActive: { 
        color: c.textInverse 
    },
    productRow: { 
        paddingHorizontal: 10, 
        gap: 10 
    },
    productCard: { 
        flex: 1, 
        backgroundColor: c.card, 
        borderRadius: 12, 
        marginBottom: 10, 
        borderWidth: 1, 
        borderColor: c.border, 
        overflow: 'hidden' 
    },
    productImg: { 
        width: '100%', 
        height: 100 
    },
    productImgPlaceholder: { 
        backgroundColor: c.chipBg, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    productName: { 
        fontSize: 14, 
        fontWeight: '600', 
        color: c.text, 
        padding: 8, 
        paddingHorizontal: 8 
    },
    productPrice: { 
        fontSize: 14, 
        fontWeight: 'bold', 
        color: c.goldDark, 
        paddingBottom: 10, 
        paddingHorizontal: 8 
    },
    cartContainer: { 
        backgroundColor: c.card, 
        borderTopWidth: 1, 
        borderTopColor: c.border, 
        paddingVertical: 10, 
        maxHeight: 140 
    },
    cartItem: { 
        width: 140, 
        backgroundColor: c.chipBg, 
        borderRadius: 8, 
        padding: 8, 
        marginRight: 10, 
        justifyContent: 'space-between' 
    },
    cartItemName: { 
        fontSize: 13, 
        fontWeight: '600', 
        color: c.text, 
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
        color: c.text, 
        minWidth: 20, 
        textAlign: 'center' 
    },
    payButton: { 
        backgroundColor: c.goldDark, 
        marginHorizontal: 15, 
        paddingVertical: 15, 
        borderRadius: 12, 
        alignItems: 'center', 
        marginTop: 10 
    },
    payButtonText: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: c.textInverse 
    }
});
