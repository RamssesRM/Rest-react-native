import { cambiarEstadoOrden, getMisOrdenes, getOrdenesActivas, getOrdenesCajero, getTodasLasOrdenes, tomarEstatusOrdenes } from '@/app/api/ordenesApi';
import DetallesOrdenesCard from '@/componentes/DetallesOrdenesCard';
import GuestGuard from '@/componentes/GuestGuard';
import { useTheme } from '@/hooks/use-theme';
import useUserStore from '@/hooks/use-userstore';
import Ionicons from '@expo/vector-icons/Ionicons';
import BottomSheet from '@gorhom/bottom-sheet';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const FALLBACK_COLORES: Record<string, string> = {
    pidiendo: '#FF9800',
    cocinando: '#F44336',
    finalizado: '#2196F3',
    pagado: '#4CAF50',
    delivery: '#9C27B0',
    eliminado: '#BDBDBD',
};

const getStatusColor = (status: string, colores: Record<string, string> = {}) => {
    return colores[status] || FALLBACK_COLORES[status] || '#EFEFEF';
};

type FiltroFecha = 'hoy' | 'ayer' | 'semana' | 'mes' | 'todo';

const getRangoFecha = (filtro: FiltroFecha): { inicio: Date; fin: Date } => {
    const ahora = new Date();
    const inicio = new Date();
    const fin = new Date();

    switch (filtro) {
        case 'hoy':
            inicio.setHours(0, 0, 0, 0);
            fin.setHours(23, 59, 59, 999);
            break;
        case 'ayer':
            inicio.setDate(ahora.getDate() - 1);
            inicio.setHours(0, 0, 0, 0);
            fin.setDate(ahora.getDate() - 1);
            fin.setHours(23, 59, 59, 999);
            break;
        case 'semana':
            inicio.setDate(ahora.getDate() - ahora.getDay());
            inicio.setHours(0, 0, 0, 0);
            fin.setHours(23, 59, 59, 999);
            break;
        case 'mes':
            inicio.setDate(1);
            inicio.setHours(0, 0, 0, 0);
            fin.setHours(23, 59, 59, 999);
            break;
        case 'todo':
        default:
            inicio.setFullYear(2000);
            fin.setHours(23, 59, 59, 999);
            break;
    }
    return { inicio, fin };
};

const FILTROS_FECHA: { key: FiltroFecha; label: string; icon: string }[] = [
    { key: 'hoy', label: 'Hoy', icon: 'today-outline' },
    { key: 'ayer', label: 'Ayer', icon: 'calendar-outline' },
    { key: 'semana', label: 'Semana', icon: 'time-outline' },
    { key: 'mes', label: 'Mes', icon: 'calendar' },
    { key: 'todo', label: 'Todo', icon: 'apps-outline' },
];

export default function ComandasScreen() {
    const router = useRouter();
    const { user } = useUserStore();
    const role = user?.role;
    const { colors } = useTheme();

    const [ordenes, setOrdenes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const bottomSheetRef = useRef<BottomSheet>(null);
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

    const [filtroAdmin, setFiltroAdmin] = useState('');
    const [busquedaAdmin, setBusquedaAdmin] = useState('');
    const [textoTemporal, setTextoTemporal] = useState('');

    const [filtroFecha, setFiltroFecha] = useState<FiltroFecha>('hoy');

    const [estatusOrdenes, setEstatusOrdenes] = useState<{ value: string; label: string; color: string }[]>([]);
    const [coloresEstatus, setColoresEstatus] = useState<Record<string, string>>({});

    const cargarDatos = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            let data = [];
            if (role === 'cliente') data = await getMisOrdenes();
            else if (role === 'mesero') data = await getOrdenesActivas();
            else if (role === 'cajero') data = await getOrdenesCajero();
            else if (role === 'admin') data = await getTodasLasOrdenes(filtroAdmin, busquedaAdmin);
            setOrdenes(data);

            const estatus = await tomarEstatusOrdenes();
            setEstatusOrdenes(estatus);
            const mapa: Record<string, string> = {};
            estatus.forEach((e: any) => { mapa[e.value] = e.color; });
            setColoresEstatus(mapa);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar las comandas');
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            cargarDatos();
        }, [user, role, filtroAdmin, busquedaAdmin])
    );

    const ordenesFiltradas = useMemo(() => {
        if (filtroFecha === 'todo') return ordenes;
        const { inicio, fin } = getRangoFecha(filtroFecha);
        return ordenes.filter((o) => {
            const fecha = new Date(o.fecha_creacion);
            return fecha >= inicio && fecha <= fin;
        });
    }, [ordenes, filtroFecha]);

    const handleCambiarEstado = async (id, nuevoEstado, datosExtra = {}) => {
        try {
            await cambiarEstadoOrden(id, nuevoEstado, datosExtra);
            cargarDatos();
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

    const handleAbrirDetalle = useCallback((orden) => {
        setOrdenSeleccionada(orden);
        bottomSheetRef.current?.expand();
    }, []);

    const handleCerrarDetalle = useCallback(() => {
        bottomSheetRef.current?.close();
        setOrdenSeleccionada(null);
    }, []);

    const handleEstadoCambiado = useCallback(() => {
        cargarDatos();
    }, [user, role, filtroAdmin, busquedaAdmin]);

    const RenderFiltrosFecha = () => (
        <View style={s.filtrosFechaContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filtrosFechaScroll}>
                {FILTROS_FECHA.map((f) => (
                    <TouchableOpacity
                        key={f.key}
                        style={[s.filtroFechaBtn, filtroFecha === f.key && s.filtroFechaBtnActive]}
                        onPress={() => setFiltroFecha(f.key)}
                    >
                        <Ionicons
                            name={f.icon as any}
                            size={14}
                            color={filtroFecha === f.key ? colors.textInverse : colors.textMuted}
                        />
                        <Text style={[s.filtroFechaText, filtroFecha === f.key && s.filtroFechaTextActive]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const RenderAdminHeader = () => (
        <View style={s.adminHeader}>
            <View style={s.searchBox}>
                <TextInput
                    style={s.searchInput}
                    placeholder="Buscar por cliente o mesa..."
                    value={textoTemporal}
                    onChangeText={setTextoTemporal}
                    placeholderTextColor={colors.textMuted}
                    onSubmitEditing={() => setBusquedaAdmin(textoTemporal)}
                />
                <TouchableOpacity style={s.searchButton} onPress={() => setBusquedaAdmin(textoTemporal)}>
                    <Ionicons name="search" size={22} color={colors.textInverse} />
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipsContainer}>
                <TouchableOpacity
                    key="todos"
                    style={[s.chip, filtroAdmin === '' && s.chipActive]}
                    onPress={() => setFiltroAdmin('')}
                >
                    <Text style={[s.chipText, filtroAdmin === '' && s.chipTextActive]}>
                        Todos
                    </Text>
                </TouchableOpacity>
                {estatusOrdenes.map((estatus) => (
                    <TouchableOpacity
                        key={estatus.value}
                        style={[s.chip, filtroAdmin === estatus.value && s.chipActive]}
                        onPress={() => setFiltroAdmin(estatus.value)}
                    >
                        <Text style={[s.chipText, filtroAdmin === estatus.value && s.chipTextActive]}>
                            {estatus.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const RenderClienteHeader = () => (
        <TouchableOpacity style={s.createButton} onPress={() => router.push('/comandas/nuevaOrden')}>
            <Ionicons name="add-circle" size={24} color={colors.textInverse} />
            <Text style={s.createButtonText}>Nueva Orden</Text>
        </TouchableOpacity>
    );

    const RenderCard = ({ item }) => {
        if (role === 'mesero' && (item.estatus === 'pagado' || item.estatus === 'eliminado')) return null;

        return (
            <TouchableOpacity style={s.card} onPress={() => handleAbrirDetalle(item)} activeOpacity={0.7}>
                <View style={s.cardHeader}>
                    <Text style={s.mesaText}>Mesa: {item.mesa_info?.numero_mesa || 'N/A'}</Text>
                    <View style={[s.statusBadge, { backgroundColor: getStatusColor(item.estatus, coloresEstatus) + '20' }]}>
                        <Text style={[s.statusText, { color: getStatusColor(item.estatus, coloresEstatus) }]}>
                            {item.estatus.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <Text style={s.clienteText}>
                    {role === 'cliente' ? `Atendido por: ${item.mesero_info?.first_name || 'N/A'}` : `Cliente: ${item.cliente_info?.first_name || item.cliente_info?.email || 'N/A'}`}
                </Text>
                <Text style={s.fechaText}>{new Date(item.fecha_creacion).toLocaleString()}</Text>

                <View style={s.cardFooter}>
                    <Text style={s.totalText}>Total: ${item.monto_total}</Text>

                    <View style={s.actionsContainer}>
                        {role === 'mesero' && item.estatus === 'pidiendo' && (
                            <TouchableOpacity
                                style={s.actionBtn}
                                onPress={(e) => { e.stopPropagation?.(); handleCambiarEstado(item.id, 'cocinando', { mesero: user?.id }); }}
                            >
                                <Text style={s.actionText}>Cocinar</Text>
                            </TouchableOpacity>
                        )}
                        {role === 'cajero' && item.estatus === 'finalizado' && (
                            <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.success }]} onPress={(e) => { e.stopPropagation?.(); handleAbrirDetalle(item); }}>
                                <Text style={[s.actionText, { color: colors.textInverse }]}>Cobrar</Text>
                            </TouchableOpacity>
                        )}
                        {role === 'cliente' && item.estatus === 'pidiendo' && (
                            <TouchableOpacity style={s.deleteBtn} onPress={(e) => { e.stopPropagation?.(); handleEliminar(item.id); }}>
                                <Text style={s.deleteText}>Cancelar</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const s = styles(colors);

    const contenedorFiltros = useMemo(() => {
        const total = ordenesFiltradas.length;
        const label = filtroFecha === 'todo' ? 'todas las comandas' : `comandas de ${FILTROS_FECHA.find(f => f.key === filtroFecha)?.label.toLowerCase()}`;
        return (
            <View style={s.contadorResultados}>
                <Text style={s.contadorText}>{total} {label}</Text>
            </View>
        );
    }, [ordenesFiltradas, filtroFecha]);

    if (isLoading) return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} color={colors.goldDark} size="large" />;

    return (
        <GuestGuard feature="tus comandas">
        <View style={s.container}>
            <Text style={s.headerTitle}>Centro de Comandas</Text>

            <RenderFiltrosFecha />

            {role === 'admin' && <RenderAdminHeader />}
            {role === 'cliente' && <RenderClienteHeader />}

            {contenedorFiltros}

            <FlatList
                data={ordenesFiltradas}
                keyExtractor={(item) => item.id}
                renderItem={RenderCard}
                contentContainerStyle={s.list}
                ListEmptyComponent={<Text style={s.emptyText}>No hay comandas para mostrar</Text>}
            />

            <DetallesOrdenesCard
                ref={bottomSheetRef}
                orden={ordenSeleccionada}
                role={role || ''}
                onDismiss={handleCerrarDetalle}
                onEstadoCambiado={handleEstadoCambiado}
                coloresEstatus={coloresEstatus}
            />
        </View>
        </GuestGuard>
    );
}

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: c.background,
        paddingTop: 20
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: c.text,
        paddingHorizontal: 20,
        marginBottom: 12
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 20
    },

    // Filtros de fecha
    filtrosFechaContainer: {
        marginBottom: 10,
    },
    filtrosFechaScroll: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filtroFechaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: c.surface,
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    filtroFechaBtnActive: {
        backgroundColor: c.gold,
        borderColor: c.gold,
    },
    filtroFechaText: {
        color: c.textMuted,
        fontWeight: '600',
        fontSize: 13,
    },
    filtroFechaTextActive: {
        color: c.textInverse,
    },

    // Contador
    contadorResultados: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    contadorText: {
        color: c.textMuted,
        fontSize: 12,
        fontWeight: '500',
    },

    // Admin
    adminHeader: {
        marginBottom: 10
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: c.surface,
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 10,
        height: 46,
        overflow: 'hidden'
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: 15,
        color: c.text,
        fontSize: 15,
        height: '100%'
    },
    searchButton: {
        backgroundColor: c.goldDark,
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
        backgroundColor: c.surface,
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        alignSelf: 'center'
    },
    chipActive: {
        backgroundColor: c.gold,
        borderColor: c.gold
    },
    chipText: {
        color: c.textMuted,
        fontWeight: '600'
    },
    chipTextActive: {
        color: c.textInverse
    },

    // Cliente
    createButton: {
        backgroundColor: c.goldDark,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        paddingVertical: 15,
        borderRadius: 12,
        marginBottom: 15
    },
    createButtonText: {
        color: c.textInverse,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8
    },

    // Cards
    card: {
        backgroundColor: c.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: c.border,
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
        color: c.text
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
        color: c.textSecondary,
        fontSize: 14,
        marginBottom: 4
    },
    fechaText: {
        color: c.textMuted,
        fontSize: 12,
        marginBottom: 15
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: c.border,
        paddingTop: 15
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: c.text
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 10
    },
    actionBtn: {
        backgroundColor: c.chipBg,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8
    },
    actionText: {
        color: c.text,
        fontWeight: '700'
    },
    deleteBtn: {
        backgroundColor: c.dangerLight,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8
    },
    deleteText: {
        color: c.danger,
        fontWeight: '700'
    },
    emptyText: {
        textAlign: 'center',
        color: c.textMuted,
        marginTop: 50,
        fontSize: 16
    }
});
