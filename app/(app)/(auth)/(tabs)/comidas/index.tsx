import { crearProducto } from '@/app/api/productosApi';
import { CategoriasList } from '@/componentes/CategoriasList';
import ComidasHeader from '@/componentes/ComidasHeader';
import ComidasList from '@/componentes/ComidasList';
import AdminProductModal from '@/componentes/AdminProductModal';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOfflineQueue } from '@/hooks/use-offline-sync';
import useUserStore from '@/hooks/use-userstore';
import { openDatabase } from '@/src/db/database';
import { getLocalCategorias, saveCategorias, saveProductos, saveSingleProducto } from '@/src/db/menuService';
import NetInfo from '@react-native-community/netinfo';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { encolarPeticion } from '@/utils/offlineQueue';
import { apiClient } from '@/app/api/apiClient';

type CategoriaLocal = {
    id: string;
    nombre: string;
    imagen: string | null;
};

const ComidasListPage = () => {
    const { colors } = useTheme();
    const { user } = useUserStore();
    const isAdmin = user?.role === 'admin';
    const s = styles(colors);
    const [synced, setSynced] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [categorias, setCategorias] = useState<CategoriaLocal[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const { syncPending, isSyncing } = useOfflineQueue();

    const syncMenu = useCallback(async () => {
        try {
            await openDatabase();

            const resCats = await apiClient('/categorias/');
            if (resCats.ok) {
                const catsData = await resCats.json();
                const cats = catsData.results || catsData;
                console.log(`📡 API categorías: ${Array.isArray(cats) ? cats.length : 'not array'}`);
                if (cats.length > 0) await saveCategorias(cats);
            } else {
                console.log(`❌ API categorías error: ${resCats.status}`);
            }

            const resProds = await apiClient('/productos/');
            if (resProds.ok) {
                const prodsData = await resProds.json();
                const prods = prodsData.results || prodsData;
                console.log(`📡 API productos: ${Array.isArray(prods) ? prods.length : 'not array'}`);
                if (prods.length > 0) await saveProductos(prods);
            } else {
                console.log(`❌ API productos error: ${resProds.status}`);
            }
        } catch (e: any) {
            console.log("Sync menu offline:", e.message);
        } finally {
            setSynced(true);
        }
    }, []);

    useEffect(() => {
        syncMenu();
    }, [syncMenu]);

    useEffect(() => {
        const cargarCategorias = async () => {
            const cats = await getLocalCategorias();
            setCategorias(cats || []);
        };
        if (synced) cargarCategorias();
    }, [synced, refreshKey]);

    const handleOpenAddModal = () => {
        setModalVisible(true);
    };

    const handleSave = async (formData: FormData) => {
        const netInfo = await NetInfo.fetch();

        if (!netInfo.isConnected) {
            const body: Record<string, any> = {};
            let imageUri: string | undefined;
            formData.forEach((value, key) => {
                if (key === 'imagen' && typeof value === 'object' && 'uri' in value) {
                    imageUri = (value as any).uri;
                } else {
                    body[key] = value;
                }
            });
            await encolarPeticion('POST', '/productos/', body, imageUri);
            Toast.show({
                type: 'info',
                text1: 'Sin conexión',
                text2: 'Petición encolada, se enviará cuando haya conexión',
            });
            return;
        }

        try {
            const nuevoProducto = await crearProducto(formData);
            nuevoProducto.estatus = true;
            console.log('✅ Producto creado API:', JSON.stringify({
                id: nuevoProducto?.id,
                nombre: nuevoProducto?.nombre,
                estatus: nuevoProducto?.estatus,
            }));

            await saveSingleProducto(nuevoProducto);
            console.log('✅ Producto guardado en SQLite OK');
            Toast.show({ type: 'success', text1: 'Producto creado' });
            setRefreshKey((k) => k + 1);
        } catch (error: any) {
            const isAbort = error?.message?.includes('Aborted') || error?.name === 'AbortError';
            if (isAbort) {
                const body: Record<string, any> = {};
                let imageUri: string | undefined;
                formData.forEach((value, key) => {
                    if (key === 'imagen' && typeof value === 'object' && 'uri' in value) {
                        imageUri = (value as any).uri;
                    } else {
                        body[key] = value;
                    }
                });
                await encolarPeticion('POST', '/productos/', body, imageUri);
                Toast.show({
                    type: 'info',
                    text1: 'Servidor no responde',
                    text2: 'Petición encolada, se enviará cuando haya conexión',
                });
            } else {
                console.error('❌ Error en handleSave:', error.message);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: error.message || 'No se pudo guardar',
                });
            }
        }
    };

    return (
        <View style={s.container}>
            <ComidasHeader title="Menús" onSync={syncPending} isSyncing={isSyncing} />
            {!synced ? (
                <View style={s.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.secondary} />
                    <Text style={s.loadingText}>Sincronizando menú...</Text>
                </View>
            ) : (
                <ScrollView
                    key={`menu-synced-${refreshKey}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: 8 }}
                >
                    <View style={s.titleRow}>
                        <Text style={s.pageTitle}>Menus</Text>
                        {isAdmin && (
                            <TouchableOpacity
                                style={s.addBtn}
                                onPress={handleOpenAddModal}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="add-circle" size={22} color="#fff" />
                                <Text style={s.addBtnText}>Agregar</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <CategoriasList />

                    <Text style={s.allComidasTitle}>Todos los platillos</Text>
                    <ComidasList refreshKey={refreshKey} />
                </ScrollView>
            )}

            <AdminProductModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSave}
                categorias={categorias}
            />
        </View>
    );
};

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: c.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: c.textMuted,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    pageTitle: {
        fontFamily: Fonts.brandBlack,
        fontSize: 25,
        color: c.text,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    addBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    allComidasTitle: {
        fontFamily: Fonts.brandBold,
        fontSize: 30,
        marginBottom: 16,
        paddingHorizontal: 16,
        color: c.text,
    },
});

export default ComidasListPage;
