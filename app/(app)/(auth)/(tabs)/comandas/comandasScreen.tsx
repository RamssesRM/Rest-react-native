import { cambiarEstadoOrden, getMisOrdenes, getOrdenesActivas, getOrdenesFinalizadas, getTodasLasOrdenes } from '@/app/api/ordenesApi';
import useUserStore from '@/hooks/use-userstore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// Colores dinámicos para los estados (UI/UX Profesional)
const getStatusColor = (status: string) => {
    switch (status) {
        case 'pidiendo': return '#FF9800'; // Naranja
        case 'cocinando': return '#F44336'; // Rojo
        case 'finalizado': return '#2196F3'; // Azul
        case 'pagado': return '#4CAF50'; // Verde
        case 'delivery': return '#9C27B0'; // Morado
        case 'entregado': return '#607D8B'; // Gris
        case 'eliminado': return '#BDBDBD'; // Gris claro
        default: return '#EFEFEF';
    }
};

export default function ComandasScreen() {
    const router = useRouter();
    const { user } = useUserStore();
    const role = user?.role;

    const [ordenes, setOrdenes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Estados para el Admin
    const [filtroAdmin, setFiltroAdmin] = useState('');
    const [busquedaAdmin, setBusquedaAdmin] = useState('');
    const [textoTemporal, setTextoTemporal] = useState('');

    // Carga de datos según el rol
    const cargarDatos = async () => {
        setIsLoading(true);
        try {
            let data = [];
            if (role === 'cliente') data = await getMisOrdenes();
            else if (role === 'mesero') data = await getOrdenesActivas();
            else if (role === 'cajero') data = await getOrdenesFinalizadas();
            else if (role === 'admin') data = await getTodasLasOrdenes(filtroAdmin, busquedaAdmin);

            setOrdenes(data);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar las comandas');
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
    React.useCallback(() => {
      const cargarDatos = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
          let data = [];
          if (role === 'cliente') data = await getMisOrdenes();
          else if (role === 'mesero') data = await getOrdenesActivas();
          else if (role === 'cajero') data = await getOrdenesFinalizadas();
          else if (role === 'admin') data = await getTodasLasOrdenes(filtroAdmin, busquedaAdmin);
          
          setOrdenes(data);
        } catch (error) {
          Alert.alert('Error', 'No se pudieron cargar las comandas');
        } finally {
          setIsLoading(false);
        }
      };

      cargarDatos();
    }, [user, role, filtroAdmin, busquedaAdmin]) // Se añade 'role' a las dependencias
  );

    const handleCambiarEstado = async (id, nuevoEstado, datosExtra = {}) => {
        try {
            await cambiarEstadoOrden(id, nuevoEstado, datosExtra);
            cargarDatos(); // Refresca la lista
        } catch (error) {
            Alert.alert('Error', 'No se pudo cambiar el estado');
        }
    };

    const handleEliminar = (id) => {
        Alert.alert('Eliminar Orden', '¿Estás seguro de cancelar esta orden?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sí, eliminar', style: 'destructive', onPress: () => handleCambiarEstado(id, 'eliminado') }
        ]);
    };

    // --- COMPONENTES POR ROL ---

    const RenderAdminHeader = () => (
    <View style={styles.adminHeader}>
        
        {/* CAJA DE BÚSQUEDA CON BOTÓN INTEGRADO */}
        <View style={styles.searchBox}>
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar por cliente o mesa..."
                value={textoTemporal}
                onChangeText={setTextoTemporal}
                placeholderTextColor="#8E8E8E"
                onSubmitEditing={() => setBusquedaAdmin(textoTemporal)}
            />
            <TouchableOpacity 
                style={styles.searchButton} 
                onPress={() => setBusquedaAdmin(textoTemporal)}
            >
                <Ionicons name="search" size={22} color="#fff" />
            </TouchableOpacity>
        </View>

        {/* FILTROS DE CHIPS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
            {['', 'pidiendo', 'cocinando', 'finalizado', 'delivery', 'entregado', 'pagado'].map((estado) => (
                <TouchableOpacity
                    key={estado || 'todos'}
                    style={[styles.chip, filtroAdmin === estado && styles.chipActive]}
                    onPress={() => setFiltroAdmin(estado)}
                >
                    <Text style={[styles.chipText, filtroAdmin === estado && styles.chipTextActive]}>
                        {estado === '' ? 'Todos' : estado.charAt(0).toUpperCase() + estado.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
    );

    const RenderClienteHeader = () => (
    <TouchableOpacity 
        style={styles.createButton} 
        onPress={() => router.push('/comandas/nuevaOrden')}
    >
        <Ionicons name="add-circle" size={24} color="#000" />
        <Text style={styles.createButtonText}>Nueva Orden</Text>
    </TouchableOpacity>
);

    const RenderCard = ({ item }) => {
        if (role === 'mesero' && (item.estatus === 'pagado' || item.estatus === 'eliminado')) return null;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.mesaText}>Mesa: {item.mesa_info?.numero_mesa || 'N/A'}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estatus) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.estatus) }]}>
                            {item.estatus.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <Text style={styles.clienteText}>
                    {role === 'cliente' ? `Atendido por: ${item.mesero_info?.first_name || 'N/A'}` : `Cliente: ${item.cliente_info?.first_name || item.cliente_info?.email || 'N/A'}`}
                </Text>
                <Text style={styles.fechaText}>{new Date(item.fecha_creacion).toLocaleString()}</Text>

                <View style={styles.cardFooter}>
                    <Text style={styles.totalText}>Total: ${item.monto_total}</Text>

                    {/* BOTONES DE ACCIÓN SEGÚN ROL */}
                    <View style={styles.actionsContainer}>
                        {role === 'mesero' && item.estatus === 'pidiendo' && (
                            <TouchableOpacity 
                            style={styles.actionBtn} 
                            onPress={() => handleCambiarEstado(item.id, 'cocinando', { mesero: user?.id })}
                            >
                                <Text style={styles.actionText}>Cocinar</Text>
                            </TouchableOpacity>
                        )}
                        {role === 'cajero' && item.estatus === 'finalizado' && (
                            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#4CAF50' }]} onPress={() => handleCambiarEstado(item.id, 'pagado')}>
                                <Text style={{ ...styles.actionText, color: '#fff' }}>Cobrar</Text>
                            </TouchableOpacity>
                        )}
                        {role === 'cliente' && item.estatus === 'pidiendo' && (
                            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleEliminar(item.id)}>
                                <Text style={styles.deleteText}>Cancelar</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    if (isLoading) return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} color="#D4AF37" size="large" />

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Centro de Comandas</Text>

            {role === 'admin' && <RenderAdminHeader />}
            {role === 'cliente' && <RenderClienteHeader />}

            <FlatList
                data={ordenes}
                keyExtractor={(item) => item.id}
                renderItem={RenderCard}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.emptyText}>No hay comandas para mostrar</Text>}
            />
        </View>
    );
}
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#FAFAFA', 
        paddingTop: 20 
    },
    headerTitle: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#262626', 
        paddingHorizontal: 20, 
        marginBottom: 15 
    },
    list: { 
        paddingHorizontal: 16, 
        paddingBottom: 20 
    },

    // Admin
    adminHeader: { 
        marginBottom: 15 
    },
    searchBox: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#FFF', 
        borderWidth: 1, 
        borderColor: '#EFEFEF', 
        borderRadius: 12, 
        marginHorizontal: 16, 
        marginBottom: 10,
        height: 46,
        overflow: 'hidden' 
    },
    searchInput: { 
        flex: 1, 
        paddingHorizontal: 15, 
        color: '#262626',
        fontSize: 15,
        height: '100%'
    },
    searchButton: { 
        backgroundColor: '#D4AF37', 
        paddingHorizontal: 16, 
        height: '100%',
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    chipsContainer: { 
        paddingHorizontal: 16, 
        marginBottom: 10,
    },
    chip: { 
        backgroundColor: '#FFF', 
        borderWidth: 1, 
        borderColor: '#EFEFEF', 
        borderRadius: 20, 
        paddingHorizontal: 15, 
        paddingVertical: 8, 
        marginRight: 10,
        alignSelf: 'center'
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

    // Cliente
    createButton: {
        backgroundColor: '#D4AF37',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        paddingVertical: 15,
        borderRadius: 12,
        marginBottom: 15
    },
    createButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8
    },

    // Cards
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    mesaText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#262626'
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6
    },
    statusText: {
        fontSize: 12,
        fontWeight: '800'
    },
    clienteText: {
        color: '#555',
        fontSize: 14,
        marginBottom: 4
    },
    fechaText: {
        color: '#8E8E8E',
        fontSize: 12,
        marginBottom: 15
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#EFEFEF',
        paddingTop: 15
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#262626'
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 10
    },
    actionBtn: {
        backgroundColor: '#EFEFEF',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8
    },
    actionText: {
        color: '#262626',
        fontWeight: '700'
    },
    deleteBtn: {
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8
    },
    deleteText: {
        color: '#F44336',
        fontWeight: '700'
    },
    emptyText: {
        textAlign: 'center',
        color: '#8E8E8E',
        marginTop: 50,
        fontSize: 16
    }
});