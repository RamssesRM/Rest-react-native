import { useTheme } from '@/hooks/use-theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type CategoriaLocal = {
    id: string;
    nombre: string;
    imagen: string | null;
};

type Producto = {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria_fk: string;
    imagen: string | null;
    estatus: number;
};

type AdminProductModalProps = {
    visible: boolean;
    onClose: () => void;
    onSave: (formData: FormData) => Promise<void>;
    producto?: Producto | null;
    categorias: CategoriaLocal[];
};

const AdminProductModal = ({
    visible,
    onClose,
    onSave,
    producto,
    categorias,
}: AdminProductModalProps) => {
    const { colors } = useTheme();
    const s = styles(colors);

    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [imagenUri, setImagenUri] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const categoriasOrdenadas = [...categorias].sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
    );

    const categoriaSeleccionada = categoriasOrdenadas.find(
        (c) => c.id === categoriaId
    );

    useEffect(() => {
        if (visible) {
            if (producto) {
                setNombre(producto.nombre);
                setDescripcion(producto.descripcion);
                setPrecio(producto.precio.toString());
                setCategoriaId((producto as any).categoria_fk || producto.categoria_id || '');
                setImagenUri(producto.imagen || null);
            } else {
                resetForm();
            }
            setShowDropdown(false);
        }
    }, [visible, producto]);

    const resetForm = () => {
        setNombre('');
        setDescripcion('');
        setPrecio('');
        setCategoriaId('');
        setImagenUri(null);
        setShowDropdown(false);
    };

    const handleSeleccionarImagen = async () => {
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permiso requerido',
                'Necesitamos acceso a tu galería para seleccionar una imagen'
            );
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
            setImagenUri(result.assets[0].uri);
        }
    };

    const handleGuardar = async () => {
        if (!nombre.trim()) {
            Alert.alert('Error', 'El nombre es requerido');
            return;
        }
        if (!descripcion.trim()) {
            Alert.alert('Error', 'La descripción es requerida');
            return;
        }
        if (!precio || parseFloat(precio) <= 0) {
            Alert.alert('Error', 'Ingresa un precio válido');
            return;
        }
        if (!categoriaId) {
            Alert.alert('Error', 'Selecciona una categoría');
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('nombre', nombre.trim());
            formData.append('descripcion', descripcion.trim());
            formData.append('precio', parseFloat(precio).toFixed(2));
            formData.append('categoria_fk', categoriaId);

            if (imagenUri && !imagenUri.startsWith('http')) {
                formData.append('imagen', {
                    uri: imagenUri,
                    type: 'image/jpeg',
                    name: 'imagen.jpg',
                } as any);
            }

            await onSave(formData);
            resetForm();
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'No se pudo guardar');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={s.modalOverlay}>
                <View style={s.modalContainer}>
                    <View style={s.modalHeader}>
                        <Text style={s.modalTitle}>
                            {producto ? 'Editar Producto' : 'Agregar Producto'}
                        </Text>
                        <TouchableOpacity onPress={handleClose} style={s.closeBtn}>
                            <Ionicons name="close" size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={s.modalLabel}>Nombre *</Text>
                        <TextInput
                            style={s.modalInput}
                            value={nombre}
                            onChangeText={setNombre}
                            placeholder="Nombre del producto"
                            placeholderTextColor={colors.textMuted}
                        />

                        <Text style={s.modalLabel}>Descripción *</Text>
                        <TextInput
                            style={[s.modalInput, s.textArea]}
                            value={descripcion}
                            onChangeText={setDescripcion}
                            placeholder="Descripción del producto"
                            placeholderTextColor={colors.textMuted}
                            multiline
                            numberOfLines={3}
                        />

                        <Text style={s.modalLabel}>Precio *</Text>
                        <TextInput
                            style={s.modalInput}
                            value={precio}
                            onChangeText={setPrecio}
                            placeholder="0.00"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="decimal-pad"
                        />

                        <Text style={s.modalLabel}>Categoría *</Text>
                        <TouchableOpacity
                            style={s.dropdownBtn}
                            onPress={() => setShowDropdown(!showDropdown)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="grid-outline"
                                size={18}
                                color={colors.textSecondary}
                            />
                            <Text
                                style={[
                                    s.dropdownText,
                                    !categoriaSeleccionada && { color: colors.textMuted },
                                ]}
                            >
                                {categoriaSeleccionada
                                    ? categoriaSeleccionada.nombre
                                    : 'Seleccionar categoría'}
                            </Text>
                            <Ionicons
                                name={showDropdown ? 'chevron-up' : 'chevron-down'}
                                size={18}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>

                        {showDropdown && (
                            <View style={s.dropdownList}>
                                <ScrollView
                                    style={{ maxHeight: 200 }}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {categoriasOrdenadas.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={[
                                                s.dropdownItem,
                                                cat.id === categoriaId && s.dropdownItemActive,
                                            ]}
                                            onPress={() => {
                                                setCategoriaId(cat.id);
                                                setShowDropdown(false);
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    s.dropdownItemText,
                                                    cat.id === categoriaId &&
                                                        s.dropdownItemTextActive,
                                                ]}
                                            >
                                                {cat.nombre}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        <Text style={s.modalLabel}>Imagen (opcional)</Text>
                        <TouchableOpacity
                            style={s.modalUploadBtn}
                            onPress={handleSeleccionarImagen}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="camera-outline"
                                size={22}
                                color={colors.textSecondary}
                            />
                            <Text style={s.modalUploadText}>
                                {imagenUri ? 'Cambiar imagen' : 'Seleccionar imagen'}
                            </Text>
                        </TouchableOpacity>

                        {imagenUri && (
                            <Image
                                source={{ uri: imagenUri }}
                                style={s.modalPreview}
                            />
                        )}

                        <TouchableOpacity
                            style={[s.modalConfirmBtn, isSaving && { opacity: 0.6 }]}
                            onPress={handleGuardar}
                            disabled={isSaving}
                            activeOpacity={0.8}
                        >
                            {isSaving ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Ionicons
                                    name="checkmark-circle"
                                    size={22}
                                    color="#fff"
                                />
                            )}
                            <Text style={s.modalConfirmText}>
                                {isSaving ? 'Guardando...' : 'Guardar'}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const TextInput = ({
    style,
    ...props
}: {
    style?: any;
    [key: string]: any;
}) => {
    const { colors } = useTheme();
    return (
        <ReactNativeTextInput
            style={[
                {
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontSize: 15,
                    color: colors.text,
                    backgroundColor: colors.card,
                    marginBottom: 16,
                },
                style,
            ]}
            placeholderTextColor={colors.textMuted}
            {...props}
        />
    );
};

import { TextInput as ReactNativeTextInput } from 'react-native';

const styles = (c: ReturnType<typeof useTheme>['colors']) =>
    StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: c.overlay,
            justifyContent: 'center',
            paddingHorizontal: 24,
        },
        modalContainer: {
            backgroundColor: c.background,
            borderRadius: 16,
            padding: 20,
            maxHeight: '85%',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: c.text,
        },
        closeBtn: {
            padding: 4,
        },
        modalLabel: {
            fontSize: 13,
            fontWeight: '600',
            color: c.text,
            marginBottom: 8,
            marginTop: 4,
        },
        modalInput: {
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 15,
            color: c.text,
            backgroundColor: c.card,
            marginBottom: 16,
        },
        textArea: {
            minHeight: 80,
            textAlignVertical: 'top',
        },
        dropdownBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            backgroundColor: c.card,
            marginBottom: 16,
        },
        dropdownText: {
            flex: 1,
            fontSize: 15,
            color: c.text,
        },
        dropdownList: {
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 10,
            backgroundColor: c.card,
            marginBottom: 16,
            overflow: 'hidden',
        },
        dropdownItem: {
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: c.border,
        },
        dropdownItemActive: {
            backgroundColor: c.goldLight,
        },
        dropdownItemText: {
            fontSize: 14,
            color: c.text,
        },
        dropdownItemTextActive: {
            color: c.goldDark,
            fontWeight: '600',
        },
        modalUploadBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: c.border,
            borderStyle: 'dashed',
            borderRadius: 10,
            paddingVertical: 16,
            justifyContent: 'center',
            backgroundColor: c.card,
            marginBottom: 16,
        },
        modalUploadText: {
            color: c.textSecondary,
            fontSize: 14,
            fontWeight: '500',
        },
        modalPreview: {
            width: '100%',
            height: 160,
            borderRadius: 10,
            marginBottom: 16,
        },
        modalConfirmBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: c.success,
            paddingVertical: 15,
            borderRadius: 12,
            gap: 8,
            marginTop: 4,
            marginBottom: 20,
        },
        modalConfirmText: {
            color: '#fff',
            fontSize: 17,
            fontWeight: 'bold',
        },
    });

export default AdminProductModal;
