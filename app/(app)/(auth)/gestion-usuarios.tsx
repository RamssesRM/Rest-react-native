import { tomarUsuarios, patchUsuario } from '@/app/api/usuariosApi';
import { useTheme } from '@/hooks/use-theme';
import useUserStore from '@/hooks/use-userstore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const ROLES = [
    { key: 'cliente', label: 'Cliente', color: '#2196F3', icon: 'person-outline' },
    { key: 'mesero', label: 'Mesero', color: '#FF9800', icon: 'restaurant-outline' },
    { key: 'cajero', label: 'Cajero', color: '#4CAF50', icon: 'cash-outline' },
    { key: 'admin', label: 'Admin', color: '#9C27B0', icon: 'shield-outline' },
];

type Usuario = {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    is_active: boolean;
};

export default function GestionUsuariosScreen() {
    const router = useRouter();
    const { user } = useUserStore();
    const { colors } = useTheme();
    const s = styles(colors);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState('');
    const [filtroRole, setFiltroRole] = useState<string | null>(null);
    const [filtroActivo, setFiltroActivo] = useState<'all' | 'active' | 'inactive'>('all');

    const cargarUsuarios = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await tomarUsuarios();
            setUsuarios(data);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar los usuarios');
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        cargarUsuarios();
    }, [cargarUsuarios]);

    const handleChangeRole = async (usuario: Usuario, nuevoRole: string) => {
        if (usuario.id === user?.id) {
            Alert.alert('Error', 'No puedes cambiar tu propio rol');
            return;
        }
        if (nuevoRole === usuario.role) return;

        const roleInfo = ROLES.find(r => r.key === nuevoRole);
        Alert.alert(
            'Cambiar Rol',
            `¿Cambiar el rol de ${usuario.first_name || usuario.username} a ${roleInfo?.label}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            setUpdatingId(usuario.id);
                            await patchUsuario(usuario.id, { role: nuevoRole });
                            setUsuarios(prev =>
                                prev.map(u => u.id === usuario.id ? { ...u, role: nuevoRole } : u)
                            );
                            Alert.alert('Éxito', `Rol cambiado a ${roleInfo?.label}`);
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo cambiar el rol');
                        } finally {
                            setUpdatingId(null);
                        }
                    }
                }
            ]
        );
    };

    const handleToggleActive = async (usuario: Usuario) => {
        if (usuario.id === user?.id) {
            Alert.alert('Error', 'No puedes desactivar tu propia cuenta');
            return;
        }

        const accion = usuario.is_active ? 'desactivar' : 'activar';
        const accionPasado = usuario.is_active ? 'desactivado' : 'activado';
        Alert.alert(
            `${accion.charAt(0).toUpperCase() + accion.slice(1)} Usuario`,
            `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} a ${usuario.first_name || usuario.username}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    style: usuario.is_active ? 'destructive' : 'default',
                    onPress: async () => {
                        try {
                            setUpdatingId(usuario.id);
                            await patchUsuario(usuario.id, { is_active: !usuario.is_active });
                            setUsuarios(prev =>
                                prev.map(u => u.id === usuario.id ? { ...u, is_active: !u.is_active } : u)
                            );
                            Alert.alert('Éxito', `Usuario ${accionPasado}`);
                        } catch (error) {
                            Alert.alert('Error', `No se pudo ${accion} el usuario`);
                        } finally {
                            setUpdatingId(null);
                        }
                    }
                }
            ]
        );
    };

    const getRoleInfo = (role: string) => ROLES.find(r => r.key === role) || ROLES[0];

    const usuariosFiltrados = useMemo(() => {
        let resultado = usuarios;

        if (filtroActivo === 'active') {
            resultado = resultado.filter(u => u.is_active);
        } else if (filtroActivo === 'inactive') {
            resultado = resultado.filter(u => !u.is_active);
        }

        if (filtroRole) {
            resultado = resultado.filter(u => u.role === filtroRole);
        }

        if (busqueda.trim()) {
            const texto = busqueda.toLowerCase().trim();
            resultado = resultado.filter(u =>
                u.first_name?.toLowerCase().includes(texto) ||
                u.last_name?.toLowerCase().includes(texto) ||
                u.username?.toLowerCase().includes(texto) ||
                u.email?.toLowerCase().includes(texto)
            );
        }

        return resultado;
    }, [usuarios, busqueda, filtroRole, filtroActivo]);

    const renderUsuario = ({ item }: { item: Usuario }) => {
        const roleInfo = getRoleInfo(item.role);
        const isSelf = item.id === user?.id;
        const isUpdating = updatingId === item.id;

        return (
            <View style={[s.card, !item.is_active && s.cardInactive]}>
                <View style={s.cardHeader}>
                    <View style={s.userInfo}>
                        <View style={[s.roleBadge, { backgroundColor: roleInfo.color + '20' }]}>
                            <Ionicons name={roleInfo.icon as any} size={14} color={roleInfo.color} />
                            <Text style={[s.roleText, { color: roleInfo.color }]}>
                                {roleInfo.label}
                            </Text>
                        </View>
                        {isSelf && <Text style={s.selfBadge}>Tú</Text>}
                        {!item.is_active && <Text style={s.inactiveBadge}>Inactivo</Text>}
                    </View>
                </View>

                <Text style={s.userName}>
                    {item.first_name || item.username}
                    {item.last_name ? ` ${item.last_name}` : ''}
                </Text>
                <Text style={s.userEmail}>{item.email}</Text>

                <View style={s.rolesRow}>
                    {ROLES.map((r) => (
                        <TouchableOpacity
                            key={r.key}
                            style={[
                                s.roleBtn,
                                item.role === r.key && { backgroundColor: r.color, borderColor: r.color },
                                isUpdating && s.roleBtnDisabled,
                            ]}
                            onPress={() => handleChangeRole(item, r.key)}
                            disabled={isUpdating || isSelf}
                        >
                            <Text style={[
                                s.roleBtnText,
                                item.role === r.key && s.roleBtnTextActive,
                            ]}>
                                {r.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={[s.toggleBtn, !item.is_active && s.toggleBtnActivate]}
                    onPress={() => handleToggleActive(item)}
                    disabled={isUpdating || isSelf}
                >
                    {isUpdating ? (
                        <ActivityIndicator size="small" color={colors.textMuted} />
                    ) : (
                        <>
                            <Ionicons
                                name={item.is_active ? 'ban-outline' : 'checkmark-circle-outline'}
                                size={16}
                                color={item.is_active ? colors.danger : colors.success}
                            />
                            <Text style={[s.toggleText, !item.is_active && s.toggleTextActivate]}>
                                {item.is_active ? 'Desactivar' : 'Activar'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Gestión de Usuarios</Text>
                <TouchableOpacity onPress={cargarUsuarios} style={s.refreshBtn}>
                    <Ionicons name="refresh" size={22} color={colors.text} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={colors.goldDark} style={s.loader} />
            ) : (
                <>
                    <View style={s.searchContainer}>
                        <View style={s.searchBar}>
                            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
                            <TextInput
                                style={s.searchInput}
                                placeholder="Buscar por nombre, usuario o email..."
                                placeholderTextColor={colors.gray500}
                                value={busqueda}
                                onChangeText={setBusqueda}
                                autoCapitalize="none"
                            />
                            {busqueda.length > 0 && (
                                <TouchableOpacity onPress={() => setBusqueda('')}>
                                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View style={s.filtersContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filtersScroll}>
                            <TouchableOpacity
                                style={[s.filterBtn, filtroRole === null && s.filterBtnActive]}
                                onPress={() => setFiltroRole(null)}
                            >
                                <Text style={[s.filterText, filtroRole === null && s.filterTextActive]}>
                                    Todos ({usuarios.length})
                                </Text>
                            </TouchableOpacity>
                            {ROLES.map((r) => {
                                const count = usuarios.filter(u => u.role === r.key).length;
                                return (
                                    <TouchableOpacity
                                        key={r.key}
                                        style={[
                                            s.filterBtn,
                                            filtroRole === r.key && { backgroundColor: r.color, borderColor: r.color },
                                        ]}
                                        onPress={() => setFiltroRole(filtroRole === r.key ? null : r.key)}
                                    >
                                        <Text style={[
                                            s.filterText,
                                            filtroRole === r.key && s.filterTextActive,
                                        ]}>
                                            {r.label} ({count})
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    <View style={s.filtersContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filtersScroll}>
                            <TouchableOpacity
                                style={[s.filterBtn, filtroActivo === 'all' && s.filterBtnActive]}
                                onPress={() => setFiltroActivo('all')}
                            >
                                <Text style={[s.filterText, filtroActivo === 'all' && s.filterTextActive]}>
                                    Todos
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[s.filterBtn, filtroActivo === 'active' && { backgroundColor: colors.success, borderColor: colors.success }]}
                                onPress={() => setFiltroActivo(filtroActivo === 'active' ? 'all' : 'active')}
                            >
                                <Text style={[s.filterText, filtroActivo === 'active' && s.filterTextActive]}>
                                    Activos ({usuarios.filter(u => u.is_active).length})
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[s.filterBtn, filtroActivo === 'inactive' && { backgroundColor: colors.danger, borderColor: colors.danger }]}
                                onPress={() => setFiltroActivo(filtroActivo === 'inactive' ? 'all' : 'inactive')}
                            >
                                <Text style={[s.filterText, filtroActivo === 'inactive' && s.filterTextActive]}>
                                    Inactivos ({usuarios.filter(u => !u.is_active).length})
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    <FlatList
                        data={usuariosFiltrados}
                        keyExtractor={(item) => item.id}
                        renderItem={renderUsuario}
                        contentContainerStyle={s.list}
                        ListEmptyComponent={
                            <Text style={s.emptyText}>
                                {busqueda || filtroRole || filtroActivo !== 'all' ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                            </Text>
                        }
                    />
                </>
            )}
        </SafeAreaView>
    );
}

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: c.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: c.card,
        borderBottomWidth: 1,
        borderBottomColor: c.border,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: c.text,
    },
    refreshBtn: {
        padding: 4,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
        backgroundColor: c.background,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: c.card,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: c.border,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: c.text,
        padding: 0,
    },
    filtersContainer: {
        paddingVertical: 10,
        backgroundColor: c.background,
    },
    filtersScroll: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: c.gray200,
        backgroundColor: c.card,
    },
    filterBtnActive: {
        backgroundColor: c.text,
        borderColor: c.text,
    },
    filterText: {
        fontSize: 12,
        fontWeight: '600',
        color: c.textMuted,
    },
    filterTextActive: {
        color: c.card,
    },
    list: {
        padding: 16,
        gap: 12,
    },
    card: {
        backgroundColor: c.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: c.border,
    },
    cardInactive: {
        opacity: 0.6,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    roleText: {
        fontSize: 11,
        fontWeight: '700',
    },
    selfBadge: {
        fontSize: 10,
        fontWeight: '700',
        color: c.goldDark,
        backgroundColor: c.goldLight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
    },
    inactiveBadge: {
        fontSize: 10,
        fontWeight: '700',
        color: c.danger,
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: c.text,
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 13,
        color: c.textMuted,
        marginBottom: 12,
    },
    rolesRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    roleBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: c.gray200,
        alignItems: 'center',
        backgroundColor: c.card,
    },
    roleBtnDisabled: {
        opacity: 0.5,
    },
    roleBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: c.textMuted,
    },
    roleBtnTextActive: {
        color: c.card,
    },
    toggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFCDD2',
        backgroundColor: c.card,
    },
    toggleBtnActivate: {
        borderColor: '#C8E6C9',
    },
    toggleText: {
        fontSize: 13,
        fontWeight: '600',
        color: c.danger,
    },
    toggleTextActivate: {
        color: c.success,
    },
    emptyText: {
        textAlign: 'center',
        color: c.textMuted,
        marginTop: 40,
        fontSize: 15,
    },
});
