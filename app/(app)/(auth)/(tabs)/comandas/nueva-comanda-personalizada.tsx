import { crearComandaPersonalizada } from '@/app/api/comandasPersonalizadasApi';
import { getProductos } from '@/app/api/ordenesApi';
import { useTheme } from '@/hooks/use-theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Producto {
    id: string;
    nombre: string;
    precio: number;
}

interface DetalleItem {
    producto_fk: string;
    nombre: string;
    cantidad: number;
    nota: string;
}

export default function NuevaComandaPersonalizadaScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const s = styles(colors);

    const [nombre, setNombre] = useState('');
    const [detalles, setDetalles] = useState<DetalleItem[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        const cargarProductos = async () => {
            try {
                const data = await getProductos();
                setProductos(data);
            } catch (error) {
                Alert.alert('Error', 'No se pudieron cargar los productos');
            } finally {
                setIsLoading(false);
            }
        };
        cargarProductos();
    }, []);

    const agregarProducto = (producto: Producto) => {
        const existe = detalles.find(d => d.producto_fk === producto.id);
        if (existe) {
            setDetalles(prev =>
                prev.map(d =>
                    d.producto_fk === producto.id
                        ? { ...d, cantidad: d.cantidad + 1 }
                        : d
                )
            );
        } else {
            setDetalles(prev => [
                ...prev,
                {
                    producto_fk: producto.id,
                    nombre: producto.nombre,
                    cantidad: 1,
                    nota: '',
                },
            ]);
        }
        setModalVisible(false);
        setBusqueda('');
    };

    const aumentarCantidad = (producto_fk: string) => {
        setDetalles(prev =>
            prev.map(d =>
                d.producto_fk === producto_fk
                    ? { ...d, cantidad: d.cantidad + 1 }
                    : d
            )
        );
    };

    const disminuirCantidad = (producto_fk: string) => {
        setDetalles(prev => {
            const item = prev.find(d => d.producto_fk === producto_fk);
            if (item && item.cantidad > 1) {
                return prev.map(d =>
                    d.producto_fk === producto_fk
                        ? { ...d, cantidad: d.cantidad - 1 }
                        : d
                );
            }
            return prev.filter(d => d.producto_fk !== producto_fk);
        });
    };

    const actualizarNota = (producto_fk: string, nota: string) => {
        setDetalles(prev =>
            prev.map(d =>
                d.producto_fk === producto_fk ? { ...d, nota } : d
            )
        );
    };

    const eliminarProducto = (producto_fk: string) => {
        setDetalles(prev => prev.filter(d => d.producto_fk !== producto_fk));
    };

    const productosFiltrados = busqueda
        ? productos.filter(p =>
              p.nombre.toLowerCase().includes(busqueda.toLowerCase())
          )
        : productos;

    const handleGuardar = async () => {
        if (!nombre.trim()) {
            return Alert.alert('Error', 'Ingresa un nombre para la comanda');
        }
        if (detalles.length === 0) {
            return Alert.alert('Error', 'Agrega al menos un producto');
        }

        setIsSaving(true);
        try {
            await crearComandaPersonalizada({
                nombre: nombre.trim(),
                detalles: detalles.map(d => ({
                    producto_fk: d.producto_fk,
                    cantidad: d.cantidad,
                    nota: d.nota || '',
                })),
            });
            Alert.alert('¡Éxito!', 'Comanda personalizada guardada');
            router.back();
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar la comanda');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <ActivityIndicator
                style={{ flex: 1 }}
                color={colors.goldDark}
                size="large"
            />
        );
    }

    return (
        <View style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Nueva Comanda</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={s.content} contentContainerStyle={s.contentContainer}>
                <View style={s.section}>
                    <Text style={s.label}>Nombre de la comanda</Text>
                    <TextInput
                        style={s.input}
                        placeholder="Ej. Mi favorita"
                        placeholderTextColor={colors.textMuted}
                        value={nombre}
                        onChangeText={setNombre}
                    />
                </View>

                <View style={s.section}>
                    <View style={s.sectionHeader}>
                        <Text style={s.label}>Productos</Text>
                        <TouchableOpacity
                            style={s.addBtn}
                            onPress={() => setModalVisible(true)}
                        >
                            <Ionicons name="add-circle" size={22} color={colors.goldDark} />
                            <Text style={s.addBtnText}>Agregar</Text>
                        </TouchableOpacity>
                    </View>

                    {detalles.length === 0 ? (
                        <View style={s.emptyState}>
                            <Ionicons name="restaurant-outline" size={40} color={colors.gray400} />
                            <Text style={s.emptyText}>Sin productos aún</Text>
                            <Text style={s.emptySubtext}>Toca "Agregar" para comenzar</Text>
                        </View>
                    ) : (
                        detalles.map(item => (
                            <View key={item.producto_fk} style={s.productItem}>
                                <View style={s.productInfo}>
                                    <Text style={s.productName} numberOfLines={1}>
                                        {item.nombre}
                                    </Text>
                                    <TextInput
                                        style={s.notaInput}
                                        placeholder="Nota (opcional)"
                                        placeholderTextColor={colors.textMuted}
                                        value={item.nota}
                                        onChangeText={text =>
                                            actualizarNota(item.producto_fk, text)
                                        }
                                    />
                                </View>

                                <View style={s.quantityControls}>
                                    <TouchableOpacity
                                        onPress={() => disminuirCantidad(item.producto_fk)}
                                    >
                                        <Ionicons
                                            name="remove-circle"
                                            size={28}
                                            color={colors.danger}
                                        />
                                    </TouchableOpacity>
                                    <Text style={s.quantityText}>{item.cantidad}</Text>
                                    <TouchableOpacity
                                        onPress={() => aumentarCantidad(item.producto_fk)}
                                    >
                                        <Ionicons
                                            name="add-circle"
                                            size={28}
                                            color={colors.success}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={s.deleteBtn}
                                    onPress={() => eliminarProducto(item.producto_fk)}
                                >
                                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={[s.saveBtn, isSaving && s.saveBtnDisabled]}
                onPress={handleGuardar}
                disabled={isSaving}
            >
                {isSaving ? (
                    <ActivityIndicator color={colors.textInverse} />
                ) : (
                    <Text style={s.saveBtnText}>Guardar</Text>
                )}
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <View style={s.modalContent}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Seleccionar producto</Text>
                            <TouchableOpacity onPress={() => { setModalVisible(false); setBusqueda(''); }}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={s.searchInput}
                            placeholder="Buscar producto..."
                            placeholderTextColor={colors.textMuted}
                            value={busqueda}
                            onChangeText={setBusqueda}
                        />

                        <FlatList
                            data={productosFiltrados}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={s.modalProductItem}
                                    onPress={() => agregarProducto(item)}
                                >
                                    <Text style={s.modalProductName} numberOfLines={1}>
                                        {item.nombre}
                                    </Text>
                                    <Text style={s.modalProductPrice}>${item.precio}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={s.modalEmpty}>No se encontraron productos</Text>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = (c: ReturnType<typeof useTheme>['colors']) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: c.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 15,
            paddingVertical: 14,
            backgroundColor: c.card,
            borderBottomWidth: 1,
            borderBottomColor: c.border,
        },
        backBtn: {
            width: 40,
            alignItems: 'center',
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: c.text,
        },
        content: {
            flex: 1,
        },
        contentContainer: {
            padding: 15,
            paddingBottom: 30,
        },
        section: {
            marginBottom: 20,
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
        },
        label: {
            fontSize: 15,
            fontWeight: '600',
            color: c.text,
            marginBottom: 8,
        },
        input: {
            backgroundColor: c.inputBg,
            borderWidth: 1,
            borderColor: c.inputBorder,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 15,
            color: c.text,
        },
        addBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        addBtnText: {
            color: c.goldDark,
            fontWeight: '600',
            fontSize: 14,
        },
        emptyState: {
            alignItems: 'center',
            paddingVertical: 40,
            backgroundColor: c.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: c.border,
            borderStyle: 'dashed',
        },
        emptyText: {
            fontSize: 16,
            fontWeight: '600',
            color: c.textMuted,
            marginTop: 10,
        },
        emptySubtext: {
            fontSize: 13,
            color: c.gray400,
            marginTop: 4,
        },
        productItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 10,
            padding: 12,
            marginBottom: 10,
            gap: 10,
        },
        productInfo: {
            flex: 1,
            gap: 6,
        },
        productName: {
            fontSize: 15,
            fontWeight: '600',
            color: c.text,
        },
        notaInput: {
            backgroundColor: c.inputBg,
            borderWidth: 1,
            borderColor: c.inputBorder,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 8,
            fontSize: 13,
            color: c.text,
        },
        quantityControls: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        quantityText: {
            fontSize: 18,
            fontWeight: 'bold',
            color: c.text,
            minWidth: 24,
            textAlign: 'center',
        },
        deleteBtn: {
            padding: 4,
        },
        saveBtn: {
            backgroundColor: c.goldDark,
            marginHorizontal: 15,
            marginBottom: 20,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
        },
        saveBtnDisabled: {
            opacity: 0.6,
        },
        saveBtnText: {
            fontSize: 17,
            fontWeight: 'bold',
            color: c.textInverse,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: c.overlay,
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: c.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '75%',
            paddingBottom: 20,
        },
        modalHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: c.border,
        },
        modalTitle: {
            fontSize: 17,
            fontWeight: 'bold',
            color: c.text,
        },
        searchInput: {
            backgroundColor: c.inputBg,
            borderWidth: 1,
            borderColor: c.inputBorder,
            borderRadius: 10,
            marginHorizontal: 20,
            marginTop: 12,
            marginBottom: 8,
            paddingHorizontal: 14,
            paddingVertical: 10,
            fontSize: 15,
            color: c.text,
        },
        modalProductItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: c.border,
        },
        modalProductName: {
            fontSize: 15,
            fontWeight: '600',
            color: c.text,
            flex: 1,
            marginRight: 10,
        },
        modalProductPrice: {
            fontSize: 15,
            fontWeight: 'bold',
            color: c.goldDark,
        },
        modalEmpty: {
            textAlign: 'center',
            color: c.textMuted,
            paddingVertical: 30,
            fontSize: 14,
        },
    });
