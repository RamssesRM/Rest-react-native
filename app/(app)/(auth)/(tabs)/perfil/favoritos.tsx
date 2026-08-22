import { tomarFavoritos, quitarFavorito } from '@/app/api/favoritosApi';
import { BASE_URL } from '@/app/api/apiConfig';
import { useTheme } from '@/hooks/use-theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

export default function FavoritosScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [favoritos, setFavoritos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            cargarFavoritos();
        }, [])
    );

    const cargarFavoritos = async () => {
        try {
            setIsLoading(true);
            const data = await tomarFavoritos();
            setFavoritos(data);
        } catch (error) {
            console.error('Error cargando favoritos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuitarFavorito = (item) => {
        Alert.alert(
            'Quitar favorito',
            `¿Quitar "${item.producto_info?.nombre || 'este producto'}" de tus favoritos?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Quitar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await quitarFavorito(item.id);
                            setFavoritos(prev => prev.filter(f => f.id !== item.id));
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo quitar el favorito');
                        }
                    }
                }
            ]
        );
    };

    const getImagenUri = (imagen) => {
        if (!imagen) return null;
        if (imagen.startsWith('http')) return imagen;
        return `${BASE_URL}${imagen}`;
    };

    const s = styles(colors);

    const renderFavorito = ({ item }) => {
        const producto = item.producto_info || {};
        const imagenUri = getImagenUri(producto.imagen);

        return (
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {imagenUri ? (
                    <Image source={{ uri: imagenUri }} style={s.cardImage} />
                ) : (
                    <View style={[s.cardImage, s.cardImagePlaceholder]}>
                        <Ionicons name="restaurant-outline" size={32} color={colors.gray300} />
                    </View>
                )}
                <View style={s.cardInfo}>
                    <Text style={s.cardName} numberOfLines={1}>{producto.nombre || 'Producto'}</Text>
                    <Text style={s.cardCategory}>{producto.categoria_nombre || ''}</Text>
                    <Text style={s.cardPrice}>${parseFloat(producto.precio || '0').toFixed(2)}</Text>
                </View>
                <TouchableOpacity style={s.removeBtn} onPress={() => handleQuitarFavorito(item)}>
                    <Ionicons name="heart" size={22} color={colors.danger} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Mis Favoritos</Text>
                <View style={{ width: 32 }} />
            </View>

            {isLoading ? (
                <ActivityIndicator style={{ flex: 1 }} color={colors.goldDark} size="large" />
            ) : (
                <FlatList
                    data={favoritos}
                    keyExtractor={(item) => item.id}
                    renderItem={renderFavorito}
                    contentContainerStyle={s.listContent}
                    ListEmptyComponent={
                        <View style={s.emptyContainer}>
                            <Ionicons name="heart-outline" size={48} color={colors.gray300} />
                            <Text style={s.emptyTitle}>No tienes favoritos</Text>
                            <Text style={s.emptySubtitle}>Explora el menú y marca tus platos favoritos</Text>
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
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    cardImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
    },
    cardImagePlaceholder: {
        backgroundColor: c.gray100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardInfo: {
        flex: 1,
        marginLeft: 12,
    },
    cardName: {
        fontSize: 15,
        fontWeight: '700',
        color: c.text,
        marginBottom: 2,
    },
    cardCategory: {
        fontSize: 12,
        color: c.textMuted,
        marginBottom: 4,
    },
    cardPrice: {
        fontSize: 15,
        fontWeight: '800',
        color: c.goldDark,
    },
    removeBtn: {
        padding: 8,
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
