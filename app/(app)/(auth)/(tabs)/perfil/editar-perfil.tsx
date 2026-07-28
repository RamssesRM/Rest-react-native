import { apiClientFormData } from '@/app/api/apiClient';
import { patchUsuario } from '@/app/api/usuariosApi';
import { BASE_URL } from '@/app/api/apiConfig';
import { useTheme } from '@/hooks/use-theme';
import useUserStore from '@/hooks/use-userstore';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function EditarPerfilScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { user, setUser } = useUserStore();

    const [nombre, setNombre] = useState(user?.first_name || '');
    const [apellido, setApellido] = useState(user?.last_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [imagen, setImagen] = useState<string | null>(user?.imagen || null);
    const [imagenLocal, setImagenLocal] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para cambiar la foto.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setImagenLocal(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!nombre.trim()) {
            Alert.alert('Error', 'El nombre es obligatorio');
            return;
        }
        if (!email.trim()) {
            Alert.alert('Error', 'El email es obligatorio');
            return;
        }
        if (password && password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }
        if (password && password.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            setIsSaving(true);

            const updates: Record<string, any> = {
                first_name: nombre.trim(),
                last_name: apellido.trim(),
                email: email.trim(),
                username: username.trim(),
            };

            if (password) {
                updates.password = password;
            }

            await patchUsuario(user.id, updates);

            if (imagenLocal) {
                const formData = new FormData();
                const filename = imagenLocal.split('/').pop() || 'photo.jpg';
                const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
                const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
                formData.append('imagen', {
                    uri: imagenLocal,
                    name: filename,
                    type: mimeType,
                } as any);

                await apiClientFormData(`/usuarios/${user.id}/`, formData);
            }

            setUser({
                ...user,
                first_name: nombre.trim(),
                last_name: apellido.trim(),
                email: email.trim(),
                username: username.trim(),
                imagen: imagenLocal ? imagenLocal : user?.imagen,
            });

            Alert.alert('Éxito', 'Perfil actualizado correctamente', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error: any) {
            const msg = error?.message || 'No se pudo actualizar el perfil';
            if (msg.includes('refresh') || msg.includes('token') || msg.includes('expired') || msg.includes('No refresh token')) {
                Alert.alert('Sesión expirada', 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', [
                    { text: 'OK', onPress: () => router.replace('/(public)/helus-login') },
                ]);
            } else {
                Alert.alert('Error', msg);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const s = styles(colors);
    const avatarUri = imagenLocal || (user?.imagen ? (user.imagen.startsWith('http') ? user.imagen : `${BASE_URL}${user.imagen}`) : null);

    return (
        <SafeAreaView style={s.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={s.header}>
                    <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>Editar Perfil</Text>
                    <View style={{ width: 32 }} />
                </View>

                <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
                    <TouchableOpacity style={s.avatarSection} onPress={pickImage}>
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={s.avatar} />
                        ) : (
                            <View style={[s.avatar, s.avatarPlaceholder]}>
                                <Text style={s.avatarText}>{nombre.charAt(0).toUpperCase() || '?'}</Text>
                            </View>
                        )}
                        <View style={[s.cameraIcon, { backgroundColor: colors.goldDark }]}>
                            <Ionicons name="camera" size={16} color="#000" />
                        </View>
                        <Text style={[s.changePhotoText, { color: colors.goldDark }]}>Cambiar foto</Text>
                    </TouchableOpacity>

                    <View style={[s.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[s.sectionLabel, { color: colors.textMuted }]}>Información personal</Text>

                        <View style={s.fieldGroup}>
                            <Text style={[s.label, { color: colors.textSecondary }]}>Nombre</Text>
                            <View style={[s.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                <Ionicons name="person-outline" size={18} color={colors.textMuted} />
                                <TextInput
                                    style={[s.input, { color: colors.text }]}
                                    value={nombre}
                                    onChangeText={setNombre}
                                    placeholder="Tu nombre"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                        </View>

                        <View style={s.fieldGroup}>
                            <Text style={[s.label, { color: colors.textSecondary }]}>Apellido</Text>
                            <View style={[s.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                <Ionicons name="person-outline" size={18} color={colors.textMuted} />
                                <TextInput
                                    style={[s.input, { color: colors.text }]}
                                    value={apellido}
                                    onChangeText={setApellido}
                                    placeholder="Tu apellido"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                        </View>

                        <View style={s.fieldGroup}>
                            <Text style={[s.label, { color: colors.textSecondary }]}>Nombre de usuario</Text>
                            <View style={[s.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                <Ionicons name="at-outline" size={18} color={colors.textMuted} />
                                <TextInput
                                    style={[s.input, { color: colors.text }]}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="username"
                                    placeholderTextColor={colors.textMuted}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={s.fieldGroup}>
                            <Text style={[s.label, { color: colors.textSecondary }]}>Correo electrónico</Text>
                            <View style={[s.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
                                <TextInput
                                    style={[s.input, { color: colors.text }]}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="correo@ejemplo.com"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>
                    </View>

                    <View style={[s.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[s.sectionLabel, { color: colors.textMuted }]}>Cambiar contraseña</Text>
                        <Text style={[s.hint, { color: colors.textMuted }]}>Déjalo vacío si no quieres cambiarla</Text>

                        <View style={s.fieldGroup}>
                            <Text style={[s.label, { color: colors.textSecondary }]}>Nueva contraseña</Text>
                            <View style={[s.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
                                <TextInput
                                    style={[s.input, { color: colors.text }]}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="••••••"
                                    placeholderTextColor={colors.textMuted}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={18}
                                        color={colors.textMuted}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={s.fieldGroup}>
                            <Text style={[s.label, { color: colors.textSecondary }]}>Confirmar contraseña</Text>
                            <View style={[s.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
                                <TextInput
                                    style={[s.input, { color: colors.text }]}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="••••••"
                                    placeholderTextColor={colors.textMuted}
                                    secureTextEntry={!showPassword}
                                />
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[s.saveBtn, { backgroundColor: colors.goldDark }, isSaving && { opacity: 0.6 }]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-outline" size={20} color="#000" />
                                <Text style={s.saveBtnText}>Guardar cambios</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
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
    scrollContent: { paddingBottom: 40 },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: c.goldDark,
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: c.gray200,
    },
    avatarText: { fontSize: 40, fontWeight: 'bold', color: c.goldDark },
    cameraIcon: {
        position: 'absolute',
        bottom: 30,
        right: '30%',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: c.card,
    },
    changePhotoText: { fontSize: 13, fontWeight: '600', marginTop: 8 },
    formCard: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
    },
    sectionLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
    hint: { fontSize: 12, marginBottom: 12 },
    fieldGroup: { marginBottom: 14 },
    label: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        gap: 8,
    },
    input: { flex: 1, paddingVertical: 12, fontSize: 15 },
    saveBtn: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 24,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },
});
