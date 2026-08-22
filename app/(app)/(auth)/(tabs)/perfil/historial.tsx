import { getMisOrdenes } from '@/app/api/ordenesApi';
import { tomarFavoritos } from '@/app/api/favoritosApi';
import { tomarPlatoFavorito } from '@/app/api/usuariosApi';
import { useTheme } from '@/hooks/use-theme';
import useUserStore from '@/hooks/use-userstore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const FILTROS = [
    { key: 'todas', label: 'Todas' },
    { key: 'pagado', label: 'Pagadas' },
    { key: 'finalizado', label: 'Finalizadas' },
    { key: 'eliminado', label: 'Canceladas' },
];

const STATUS_COLORS: Record<string, string> = {
    pidiendo: '#FF9800',
    cocinando: '#2196F3',
    finalizado: '#4CAF50',
    delivery: '#9C27B0',
    pagado: '#607D8B',
    eliminado: '#E53935',
};

export default function HistorialScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { user } = useUserStore();
    const [ordenes, setOrdenes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filtro, setFiltro] = useState('todas');
    const [platoFavorito, setPlatoFavorito] = useState<{ nombre: string | null; total: number }>({ nombre: null, total: 0 });
    const [totalFavoritos, setTotalFavoritos] = useState(0);

    useEffect(() => {
        cargarOrdenes();
    }, []);

    const cargarOrdenes = async () => {
        try {
            setIsLoading(true);
            const data = await getMisOrdenes();
            setOrdenes(data);
            try {
                const plato = await tomarPlatoFavorito(user.id);
                setPlatoFavorito(plato);
            } catch (e) {}
            try {
                const favs = await tomarFavoritos();
                setTotalFavoritos(Array.isArray(favs) ? favs.length : 0);
            } catch (e) {}
        } catch (error) {
            console.error('Error cargando historial:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const ordenesFiltradas = filtro === 'todas'
        ? ordenes
        : ordenes.filter(o => o.estatus === filtro);

    const totalGastado = ordenes
        .filter(o => o.estatus === 'pagado' || o.estatus === 'finalizado')
        .reduce((sum, o) => sum + parseFloat(o.monto_total || 0), 0);

    const totalOrdenes = ordenes.filter(o => o.estatus !== 'eliminado').length;

    const s = styles(colors);

    const renderStats = () => (
        <View style={s.statsContainer}>
            <View style={s.statsRow}>
                <View style={s.statCard}>
                    <Ionicons name="receipt-outline" size={22} color={colors.goldDark} />
                    <Text style={s.statNumber}>{totalOrdenes}</Text>
                    <Text style={s.statLabel}>Órdenes</Text>
                </View>
                <View style={[s.statCard, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border }]}>
                    <Ionicons name="wallet-outline" size={22} color={colors.goldDark} />
                    <Text style={s.statNumber}>${totalGastado.toFixed(2)}</Text>
                    <Text style={s.statLabel}>Total gastado</Text>
                </View>
            </View>
            <View style={s.statsRow}>
                <View style={[s.statCard, { borderRightWidth: 1, borderColor: colors.border }]}>
                    <Ionicons name="heart-outline" size={22} color={colors.goldDark} />
                    <Text style={s.statNumber}>{totalFavoritos}</Text>
                    <Text style={s.statLabel}>Favoritos</Text>
                </View>
                <View style={s.statCard}>
                    <Ionicons name="restaurant-outline" size={22} color={colors.goldDark} />
                    <Text style={s.statNumber} numberOfLines={1}>{platoFavorito.nombre || '-'}</Text>
                    <Text style={s.statLabel}>Plato top</Text>
                </View>
            </View>
        </View>
    );

    const renderFiltros = () => (
        <View style={s.filtrosRow}>
            {FILTROS.map(f => (
                <TouchableOpacity
                    key={f.key}
                    style={[s.filtroBtn, filtro === f.key && s.filtroActive]}
                    onPress={() => setFiltro(f.key)}
                >
                    <Text style={[s.filtroText, filtro === f.key && s.filtroTextActive]}>{f.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderOrden = ({ item }) => (
        <View style={[s.ordenCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.ordenHeader}>
                <Text style={s.ordenMesa}>Mesa {item.mesa_info?.numero_mesa || 'N/A'}</Text>
                <View style={[s.badge, { backgroundColor: (STATUS_COLORS[item.estatus] || colors.gray400) + '20' }]}>
                    <Text style={[s.badgeText, { color: STATUS_COLORS[item.estatus] || colors.textMuted }]}>
                        {item.estatus?.toUpperCase()}
                    </Text>
                </View>
            </View>
            <Text style={s.ordenFecha}>{new Date(item.fecha_creacion).toLocaleDateString()} - {new Date(item.fecha_creacion).toLocaleTimeString()}</Text>
            {item.detalles && item.detalles.length > 0 && (
                <View style={s.productosContainer}>
                    {item.detalles.map((d, idx) => (
                        <Text key={idx} style={s.productoText}>
                            {d.cantidad}x {d.producto_info?.nombre || 'Producto'}
                        </Text>
                    ))}
                </View>
            )}
            <View style={s.ordenFooter}>
                <Text style={s.ordenTotal}>${item.monto_total || '0.00'}</Text>
                {item.mesero_info && (
                    <Text style={s.ordenMesero}>Mesero: {item.mesero_info.first_name || 'N/A'}</Text>
                )}
            </View>
        </View>
    );

    return (
        <View style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Historial de Órdenes</Text>
                <View style={{ width: 32 }} />
            </View>

            {isLoading ? (
                <ActivityIndicator style={{ flex: 1 }} color={colors.goldDark} size="large" />
            ) : (
                <FlatList
                    data={ordenesFiltradas}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOrden}
                    ListHeaderComponent={
                        <>
                            {renderStats()}
                            {renderFiltros()}
                        </>
                    }
                    ListEmptyComponent={
                        <View style={s.emptyContainer}>
                            <Ionicons name="receipt-outline" size={48} color={colors.gray300} />
                            <Text style={s.emptyText}>No hay órdenes en esta categoría</Text>
                        </View>
                    }
                    contentContainerStyle={s.listContent}
                />
            )}
        </View>
    );
}

const styles = (c) => StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: c.border,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: c.text },
    statsContainer: {
        marginHorizontal: 16,
        marginTop: 16,
        gap: 8,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: c.card,
        borderRadius: 12,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: c.border,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    statNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: c.text,
    },
    statLabel: {
        fontSize: 11,
        color: c.textMuted,
    },
    filtrosRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginTop: 14,
        marginBottom: 16,
        gap: 8,
    },
    filtroBtn: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 16,
        backgroundColor: c.card,
        borderWidth: 1,
        borderColor: c.border,
    },
    filtroActive: {
        backgroundColor: c.goldDark,
        borderColor: c.goldDark,
    },
    filtroText: {
        fontSize: 13,
        fontWeight: '600',
        color: c.textMuted,
    },
    filtroTextActive: {
        color: '#000',
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    ordenCard: {
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
    },
    ordenHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    ordenMesa: {
        fontSize: 16,
        fontWeight: '700',
        color: c.text,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    ordenFecha: {
        fontSize: 12,
        color: c.textMuted,
        marginBottom: 8,
    },
    productosContainer: {
        gap: 2,
        marginBottom: 8,
    },
    productoText: {
        fontSize: 13,
        color: c.textSecondary,
    },
    ordenFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: c.border,
        paddingTop: 8,
    },
    ordenTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: c.goldDark,
    },
    ordenMesero: {
        fontSize: 12,
        color: c.textMuted,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 14,
        color: c.textMuted,
        marginTop: 12,
    },
});
