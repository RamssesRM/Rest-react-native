import { getMisOrdenes } from '@/app/api/ordenesApi';
import { useTheme } from '@/hooks/use-theme';
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

const STATUS_CONFIG: Record<string, { icon: string; color: string; mensaje: string }> = {
    pidiendo: { icon: 'cart-outline', color: '#FF9800', mensaje: 'Tu orden está siendo preparada' },
    cocinando: { icon: 'flame-outline', color: '#2196F3', mensaje: 'Tu orden está cocinándose' },
    finalizado: { icon: 'checkmark-circle-outline', color: '#4CAF50', mensaje: 'Tu orden está lista para recoger' },
    delivery: { icon: 'bicycle-outline', color: '#9C27B0', mensaje: 'Tu orden está en camino' },
    pagado: { icon: 'wallet-outline', color: '#607D8B', mensaje: 'Tu orden ha sido pagada' },
};

export default function NotificacionesScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [ordenes, setOrdenes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        cargarOrdenes();
    }, []);

    const cargarOrdenes = async () => {
        try {
            setIsLoading(true);
            const data = await getMisOrdenes();
            const activas = data.filter(o => !['pagado', 'eliminado'].includes(o.estatus));
            setOrdenes(activas);
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const s = styles(colors);

    const renderNotificacion = ({ item }) => {
        const config = STATUS_CONFIG[item.estatus] || { icon: 'information-circle-outline', color: colors.textMuted, mensaje: 'Estado desconocido' };

        return (
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[s.iconContainer, { backgroundColor: config.color + '15' }]}>
                    <Ionicons name={config.icon as any} size={24} color={config.color} />
                </View>
                <View style={s.cardInfo}>
                    <Text style={s.cardTitle}>{config.mensaje}</Text>
                    <Text style={s.cardMesa}>Mesa {item.mesa_info?.numero_mesa || 'N/A'}</Text>
                    <Text style={s.cardTime}>{new Date(item.fecha_creacion).toLocaleString()}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Notificaciones</Text>
                <View style={{ width: 32 }} />
            </View>

            {isLoading ? (
                <ActivityIndicator style={{ flex: 1 }} color={colors.goldDark} size="large" />
            ) : (
                <FlatList
                    data={ordenes}
                    keyExtractor={(item) => item.id}
                    renderItem={renderNotificacion}
                    contentContainerStyle={s.listContent}
                    ListEmptyComponent={
                        <View style={s.emptyContainer}>
                            <Ionicons name="notifications-off-outline" size={48} color={colors.gray300} />
                            <Text style={s.emptyTitle}>No tienes notificaciones</Text>
                            <Text style={s.emptySubtitle}>Las actualizaciones de tus pedidos aparecerán aquí</Text>
                        </View>
                    }
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
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        gap: 14,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: c.text,
        marginBottom: 4,
    },
    cardMesa: {
        fontSize: 13,
        color: c.goldDark,
        fontWeight: '600',
        marginBottom: 2,
    },
    cardTime: {
        fontSize: 12,
        color: c.textMuted,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: c.textSecondary,
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 13,
        color: c.textMuted,
        textAlign: 'center',
        marginTop: 6,
        paddingHorizontal: 40,
    },
});
