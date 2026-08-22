import { useTheme } from '@/hooks/use-theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Producto = {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen: string | null;
    categoria_nombre?: string;
};

type ProductDetailModalProps = {
    visible: boolean;
    producto: Producto | null;
    onClose: () => void;
    onEnviarAOrden: (producto: Producto) => void;
    role?: string;
};

const ProductDetailModal = ({
    visible,
    producto,
    onClose,
    onEnviarAOrden,
    role,
}: ProductDetailModalProps) => {
    const { colors } = useTheme();
    const s = styles(colors);

    if (!producto) return null;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={s.overlay}>
                <View style={s.content}>
                    <TouchableOpacity style={s.closeBtn} onPress={onClose}>
                        <Ionicons name="close" size={22} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {producto.imagen ? (
                        <Image source={{ uri: producto.imagen }} style={s.image} />
                    ) : (
                        <View style={[s.image, s.placeholderImage]}>
                            <Ionicons name="restaurant-outline" size={48} color={colors.gray300} />
                        </View>
                    )}

                    <View style={s.info}>
                        <Text style={s.name}>{producto.nombre}</Text>

                        {producto.categoria_nombre && (
                            <View style={s.categoryBadge}>
                                <Text style={s.categoryText}>{producto.categoria_nombre}</Text>
                            </View>
                        )}

                        <Text style={s.description}>{producto.descripcion}</Text>

                        <Text style={s.price}>${producto.precio?.toFixed(2) || '0.00'}</Text>

                        {role === 'cliente' && (
                            <TouchableOpacity
                                style={s.enviarBtn}
                                onPress={() => onEnviarAOrden(producto)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="cart-outline" size={20} color="#fff" />
                                <Text style={s.enviarBtnText}>Enviar a Nueva Orden</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ProductDetailModal;

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        backgroundColor: c.card,
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        overflow: 'hidden',
    },
    closeBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        backgroundColor: c.background,
        borderRadius: 14,
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: 200,
    },
    placeholderImage: {
        backgroundColor: c.gray100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        padding: 20,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: c.text,
        marginBottom: 8,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: c.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 12,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: c.secondary,
    },
    description: {
        fontSize: 14,
        color: c.textSecondary,
        lineHeight: 20,
        marginBottom: 16,
    },
    price: {
        fontSize: 24,
        fontWeight: '800',
        color: c.goldDark,
        marginBottom: 20,
    },
    enviarBtn: {
        backgroundColor: c.goldDark,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    enviarBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
