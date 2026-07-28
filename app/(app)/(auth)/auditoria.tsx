import { tomarAuditoria, MODELOS, ACCIONES } from '@/app/api/auditoriaApi';
import { useTheme } from '@/hooks/use-theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type AuditLog = {
    _id: string;
    modelo: string;
    id_objeto: string;
    accion: string;
    usuario: string;
    ip: string;
    fecha: string;
    data: Record<string, any>;
    cambios?: Record<string, { antes: any; despues: any }>;
};

export default function AuditoriaScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [busqueda, setBusqueda] = useState('');
    const [filtroModelo, setFiltroModelo] = useState<string | null>(null);
    const [filtroAccion, setFiltroAccion] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const cargarLogs = useCallback(async (pageNum: number = 1) => {
        try {
            setIsLoading(true);
            const data = await tomarAuditoria({
                modelo: filtroModelo || undefined,
                accion: filtroAccion || undefined,
                buscar: busqueda.trim() || undefined,
                page: pageNum,
                page_size: 20,
            });
            setLogs(data.results);
            setTotalPages(data.total_pages);
            setTotal(data.count);
            setPage(pageNum);
        } catch (error) {
            console.error('Error cargando auditoría:', error);
        } finally {
            setIsLoading(false);
        }
    }, [filtroModelo, filtroAccion, busqueda]);

    useEffect(() => {
        cargarLogs(1);
    }, [cargarLogs]);

    const getModeloInfo = (modelo: string) => MODELOS.find(m => m.key === modelo) || { key: modelo, label: modelo, color: '#666', icon: 'document-outline' };
    const getAccionInfo = (accion: string) => ACCIONES.find(a => a.key === accion) || { key: accion, label: accion, color: '#666' };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const toggleExpand = (id: string) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    const renderLog = ({ item }: { item: AuditLog }) => {
        const modeloInfo = getModeloInfo(item.modelo);
        const accionInfo = getAccionInfo(item.accion);
        const isExpanded = expandedId === item._id;
        const tieneCambios = item.cambios && Object.keys(item.cambios).length > 0;

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => toggleExpand(item._id)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <View style={[styles.modeloBadge, { backgroundColor: modeloInfo.color + '20' }]}>
                            <Ionicons name={modeloInfo.icon as any} size={12} color={modeloInfo.color} />
                            <Text style={[styles.modeloText, { color: modeloInfo.color }]}>
                                {modeloInfo.label}
                            </Text>
                        </View>
                        <View style={[styles.accionBadge, { backgroundColor: accionInfo.color + '20' }]}>
                            <Text style={[styles.accionText, { color: accionInfo.color }]}>
                                {accionInfo.label}
                            </Text>
                        </View>
                        {tieneCambios && (
                            <View style={[styles.cambiosBadge, { backgroundColor: colors.warning + '20' }]}>
                                <Ionicons name="git-compare-outline" size={12} color={colors.warning} />
                            </View>
                        )}
                    </View>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={colors.textMuted}
                    />
                </View>

                <Text style={[styles.fecha, { color: colors.textMuted }]}>
                    {formatDate(item.fecha)}
                </Text>

                <View style={styles.metaRow}>
                    <Ionicons name="person-outline" size={12} color={colors.textMuted} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.usuario}</Text>
                    <Ionicons name="globe-outline" size={12} color={colors.textMuted} style={{ marginLeft: 10 }} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.ip}</Text>
                </View>

                <Text style={[styles.idText, { color: colors.textMuted }]}>
                    ID: {item.id_objeto?.substring(0, 8)}...
                </Text>

                {isExpanded && (
                    <View style={[styles.detailsContainer, { borderTopColor: colors.border }]}>
                        {tieneCambios && (
                            <View style={styles.cambiosSection}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Cambios</Text>
                                {Object.entries(item.cambios!).map(([campo, vals]) => (
                                    <View key={campo} style={[styles.cambioRow, { backgroundColor: colors.gray100 }]}>
                                        <Text style={[styles.campoName, { color: colors.text }]}>{campo}</Text>
                                        <View style={styles.cambioVals}>
                                            <Text style={[styles.valOld, { color: colors.danger }]}>
                                                {String(vals.antes ?? 'vacío')}
                                            </Text>
                                            <Ionicons name="arrow-forward" size={12} color={colors.textMuted} />
                                            <Text style={[styles.valNew, { color: colors.success }]}>
                                                {String(vals.despues ?? 'vacío')}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View style={styles.dataSection}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Datos actuales</Text>
                            {Object.entries(item.data || {}).filter(([k]) => k !== '_state').map(([key, val]) => (
                                <View key={key} style={[styles.dataRow, { borderBottomColor: colors.border }]}>
                                    <Text style={[styles.dataKey, { color: colors.textSecondary }]}>{key}</Text>
                                    <Text style={[styles.dataVal, { color: colors.text }]} numberOfLines={2}>
                                        {val === null ? 'null' : String(val)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Auditoría</Text>
                <TouchableOpacity onPress={() => cargarLogs(page)} style={styles.refreshBtn}>
                    <Ionicons name="refresh" size={22} color={colors.text} />
                </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
                <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                    <Ionicons name="search-outline" size={18} color={colors.textMuted} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Buscar por usuario, ID o IP..."
                        placeholderTextColor={colors.textMuted}
                        value={busqueda}
                        onChangeText={setBusqueda}
                        autoCapitalize="none"
                        returnKeyType="search"
                        onSubmitEditing={() => cargarLogs(1)}
                    />
                    {busqueda.length > 0 && (
                        <TouchableOpacity onPress={() => { setBusqueda(''); }}>
                            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={[styles.filtersContainer, { backgroundColor: colors.card }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                    <TouchableOpacity
                        style={[styles.filterBtn, { borderColor: colors.border }, filtroModelo === null && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                        onPress={() => setFiltroModelo(null)}
                    >
                        <Text style={[styles.filterText, { color: colors.text }, filtroModelo === null && styles.filterTextActive]}>
                            Todos
                        </Text>
                    </TouchableOpacity>
                    {MODELOS.map((m) => (
                        <TouchableOpacity
                            key={m.key}
                            style={[styles.filterBtn, { borderColor: colors.border }, filtroModelo === m.key && { backgroundColor: m.color, borderColor: m.color }]}
                            onPress={() => setFiltroModelo(filtroModelo === m.key ? null : m.key)}
                        >
                            <Text style={[styles.filterText, { color: colors.text }, filtroModelo === m.key && styles.filterTextActive]}>
                                {m.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={[styles.filtersContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                    <TouchableOpacity
                        style={[styles.filterBtn, { borderColor: colors.border }, filtroAccion === null && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                        onPress={() => setFiltroAccion(null)}
                    >
                        <Text style={[styles.filterText, { color: colors.text }, filtroAccion === null && styles.filterTextActive]}>
                            Todas
                        </Text>
                    </TouchableOpacity>
                    {ACCIONES.map((a) => (
                        <TouchableOpacity
                            key={a.key}
                            style={[styles.filterBtn, { borderColor: colors.border }, filtroAccion === a.key && { backgroundColor: a.color, borderColor: a.color }]}
                            onPress={() => setFiltroAccion(filtroAccion === a.key ? null : a.key)}
                        >
                            <Text style={[styles.filterText, { color: colors.text }, filtroAccion === a.key && styles.filterTextActive]}>
                                {a.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <Text style={[styles.countText, { color: colors.textMuted }]}>
                {total} registro{total !== 1 ? 's' : ''}
            </Text>

            {isLoading ? (
                <ActivityIndicator size="large" color={colors.goldDark} style={styles.loader} />
            ) : (
                <FlatList
                    data={logs}
                    keyExtractor={(item) => item._id}
                    renderItem={renderLog}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                            No se encontraron registros
                        </Text>
                    }
                />
            )}

            {totalPages > 1 && (
                <View style={[styles.pagination, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.pageBtn, { borderColor: colors.border }, page <= 1 && styles.pageBtnDisabled]}
                        onPress={() => page > 1 && cargarLogs(page - 1)}
                        disabled={page <= 1}
                    >
                        <Ionicons name="chevron-back" size={18} color={page <= 1 ? colors.textMuted : colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.pageText, { color: colors.text }]}>
                        {page} / {totalPages}
                    </Text>
                    <TouchableOpacity
                        style={[styles.pageBtn, { borderColor: colors.border }, page >= totalPages && styles.pageBtnDisabled]}
                        onPress={() => page < totalPages && cargarLogs(page + 1)}
                        disabled={page >= totalPages}
                    >
                        <Ionicons name="chevron-forward" size={18} color={page >= totalPages ? colors.textMuted : colors.text} />
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    refreshBtn: { padding: 4 },
    searchContainer: { paddingHorizontal: 16, paddingVertical: 10 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
    filtersContainer: { paddingVertical: 8 },
    filtersScroll: { paddingHorizontal: 16, gap: 8 },
    filterBtn: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterText: { fontSize: 12, fontWeight: '500' },
    filterTextActive: { color: '#fff' },
    countText: { paddingHorizontal: 16, paddingVertical: 4, fontSize: 12 },
    loader: { flex: 1, justifyContent: 'center' },
    list: { paddingHorizontal: 16, paddingBottom: 20 },
    emptyText: { textAlign: 'center', marginTop: 40, fontSize: 14 },
    card: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 14,
        marginBottom: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    modeloBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        gap: 4,
    },
    modeloText: { fontSize: 11, fontWeight: '600' },
    accionBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    accionText: { fontSize: 11, fontWeight: '600' },
    cambiosBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fecha: { fontSize: 12, marginTop: 6 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    metaText: { fontSize: 12 },
    idText: { fontSize: 11, marginTop: 4 },
    detailsContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
    cambiosSection: { marginBottom: 14 },
    cambioRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        marginBottom: 4,
    },
    campoName: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
    cambioVals: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    valOld: { fontSize: 12, textDecorationLine: 'line-through' },
    valNew: { fontSize: 12, fontWeight: '600' },
    dataSection: {},
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        borderBottomWidth: 0.5,
    },
    dataKey: { fontSize: 11, flex: 1 },
    dataVal: { fontSize: 11, flex: 2, textAlign: 'right' },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        gap: 16,
    },
    pageBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageBtnDisabled: { opacity: 0.4 },
    pageText: { fontSize: 14, fontWeight: '500' },
});
