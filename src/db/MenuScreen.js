import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { openDatabase } from './database';
import { getLocalProductos, saveCategorias, saveProductos } from './menuService';

const MenuScreen = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [debugMsg, setDebugMsg] = useState('Iniciando...');

    useEffect(() => {
        const initData = async () => {
            try {
                // 1. Abrir base de datos SQLite
                setDebugMsg('Abriendo base de datos...');
                await openDatabase();
                setDebugMsg('✅ Base de datos abierta');

                // 2. Intentar conectar a Django
                try {
                    setDebugMsg('Conectando a la Base de Datos...');
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);

                    // --- PASO A: Traer las Categorías primero ---
                    const resCategorias = await fetch('http://10.0.2.2:8000/api/categorias/', {
                        signal: controller.signal
                    });
                    // console.log(resCategorias)
                    if (resCategorias.ok) {
                        const cats = await resCategorias.json();
                        if (cats.length > 0) {
                            await saveCategorias(cats); // Ahora sí, con sus nombres reales
                        }
                    }
                    // console.log(saveCategorias)
                    clearTimeout(timeoutId); // Limpiamos el tiempo

                    // --- PASO B: Traer los Productos ---
                    setDebugMsg('Descargando productos...');
                    const controller2 = new AbortController();
                    const timeoutId2 = setTimeout(() => controller2.abort(), 10000);

                    const response = await fetch('http://10.0.2.2:8000/api/productos/', {
                        signal: controller2.signal
                    });
                    // console.log(response)
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

                // 3. Leer de SQLite
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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2e7d32" />
                <Text style={styles.debugText}>{debugMsg}</Text>
            </View>
        );
    }

    if (productos.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No hay productos disponibles</Text>
                <Text style={styles.emptySubtitle}>Asegúrate de estar conectado a internet la primera vez.</Text>
                <Text style={styles.debugText}>{debugMsg}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Menú ({productos.length} productos)</Text>
            <FlatList
                data={productos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.nombre}>{item.nombre}</Text>
                        <Text style={styles.desc}>{item.descripcion}</Text>
                        <Text style={styles.precio}>${item.precio?.toFixed(2) || '0.00'}</Text>
                        <Text style={styles.cat}>Categoría: {item.categoria_nombre}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    debugText: {
        marginTop: 20,
        color: '#666',
        fontSize: 12,
        textAlign: 'center'
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20
    },
    card: {
        padding: 16,
        marginBottom: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        elevation: 2
    },
    nombre: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4
    },
    desc: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8
    },
    precio: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2e7d32'
    },
    cat: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        fontStyle: 'italic'
    }
});

export default MenuScreen;