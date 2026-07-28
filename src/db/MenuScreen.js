import { useTheme } from '@/hooks/use-theme';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { openDatabase } from './database';
import { getLocalProductos, saveCategorias, saveProductos } from './menuService';
import { BASE_URL } from '../../app/api/apiConfig';

const MenuScreen = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [debugMsg, setDebugMsg] = useState('Iniciando...');
    const { colors } = useTheme();

    useEffect(() => {
        const initData = async () => {
            try {
                setDebugMsg('Abriendo base de datos...');
                await openDatabase();
                setDebugMsg('✅ Base de datos abierta');

                try {
                    setDebugMsg('Conectando a la Base de Datos...');
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);

                    // --- PASO A: Traer las Categorías primero ---
                    const resCategorias = await fetch(`${BASE_URL}/categorias/`, {
                        signal: controller.signal
                    });
                    if (resCategorias.ok) {
                        const cats = await resCategorias.json();
                        if (cats.length > 0) {
                            await saveCategorias(cats);
                        }
                    }
                    clearTimeout(timeoutId);

                    setDebugMsg('Descargando productos...');
                    const controller2 = new AbortController();
                    const timeoutId2 = setTimeout(() => controller2.abort(), 10000);

                    const response = await fetch(`${BASE_URL}/productos/`, {
                        signal: controller2.signal
                    });
                    clearTimeout(timeoutId2);

                    if (response.ok) {
                        const data = await response.json();
                        const productosToSave = data || [];
                        
                        if (productosToSave.length > 0) {
                            await saveProductos(productosToSave);
                        }
                        
                        setDebugMsg('✅ Datos sincronizados desde Django');
                    } else {
                        setDebugMsg(`⚠️ Error al traer productos: ${response.status}`);
                    }

                } catch (fetchError) {
                    if (fetchError.name === 'AbortError') {
                        console.log('⏱️ Servidor tardó demasiado');
                        setDebugMsg('📡 Servidor lento/offline - usando datos locales');
                    } else {
                        console.log('No hay conexión con Django:', fetchError.message);
                        setDebugMsg('📡 Modo offline - usando datos locales');
                    }
                }

                setDebugMsg('Cargando productos locales...');
                const localData = await getLocalProductos();
                setProductos(localData);
                setDebugMsg(`✅ ${localData.length} productos cargados`);
            } catch (error) {
                console.error('❌ Error general:', error);
                setDebugMsg(`❌ Error: ${error.message}`);
                Alert.alert('Error', error.message);
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, []);

    const s = styles(colors);

    if (loading) {
        return (
            <View style={s.loadingContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={s.debugText}>{debugMsg}</Text>
            </View>
        );
    }

    if (productos.length === 0) {
        return (
            <View style={s.emptyContainer}>
                <Text style={s.emptyTitle}>No hay productos disponibles</Text>
                <Text style={s.emptySubtitle}>Asegúrate de estar conectado a internet la primera vez.</Text>
                <Text style={s.debugText}>{debugMsg}</Text>
            </View>
        );
    }

    return (
        <View style={s.container}>
            <Text style={s.header}>Menú ({productos.length} productos)</Text>
            <FlatList
                data={productos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={s.card}>
                        <Text style={s.nombre}>{item.nombre}</Text>
                        <Text style={s.desc}>{item.descripcion}</Text>
                        <Text style={s.precio}>${item.precio?.toFixed(2) || '0.00'}</Text>
                        <Text style={s.cat}>Categoría: {item.categoria_nombre}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = (c) => StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: c.background
    },
    debugText: {
        marginTop: 20,
        color: c.textMuted,
        fontSize: 12,
        textAlign: 'center'
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: c.background
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: c.text
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: c.background
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: c.text
    },
    emptySubtitle: {
        fontSize: 14,
        color: c.textMuted,
        textAlign: 'center',
        marginBottom: 20
    },
    card: {
        padding: 16,
        marginBottom: 12,
        backgroundColor: c.surface,
        borderRadius: 10,
        elevation: 2
    },
    nombre: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        color: c.text
    },
    desc: {
        fontSize: 14,
        color: c.textSecondary,
        marginBottom: 8
    },
    precio: {
        fontSize: 16,
        fontWeight: 'bold',
        color: c.success
    },
    cat: {
        fontSize: 12,
        color: c.textMuted,
        marginTop: 4,
        fontStyle: 'italic'
    }
});

export default MenuScreen;
