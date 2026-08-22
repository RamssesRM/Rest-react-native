import { useTheme } from '@/hooks/use-theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const FAQ = [
    {
        pregunta: '¿Cómo hago un pedido?',
        respuesta: 'Ve a la sección de Centro de Comandas, presiona "Nueva Orden", selecciona una mesa, agrega los productos que deseas del menú y presiona "Enviar a Cocina".',
    },
    {
        pregunta: '¿Cómo pago mi orden?',
        respuesta: 'Una vez que tu orden esté lista, el cajero la marcará como "Finalizada". Luego puedes ver los métodos de pago disponibles en Perfil > Métodos de Pago y realizar el pago correspondiente.',
    },
    {
        pregunta: '¿Puedo cancelar mi orden?',
        respuesta: 'Sí, puedes cancelar tu orden mientras esté en estado "Pidiendo". Una vez que pase a "Cocinando", ya no será posible cancelarla desde la app.',
    },
    {
        pregunta: '¿Qué son las Comandas Personalizadas?',
        respuesta: 'Son plantillas que puedes crear con组合aciones de productos que pidas frecuentemente. Las guardas con un nombre y下次 puedes crear una nueva orden directamente desde ellas.',
    },
    {
        pregunta: '¿Cómo creo una Comanda Personalizada?',
        respuesta: 'Ve a Centro de Comandas > Mis Comandas > "+" o desde una orden existente presiona el ícono de guardar. Dale un nombre y se guardará para uso futuro.',
    },
    {
        pregunta: '¿Cómo funcionan los Favoritos?',
        respuesta: 'Desde el menú, toca un producto para ver sus detalles y presiona el corazón para marcarlo como favorito. Puedes ver todos tus favoritos en Perfil > Mis Favoritos.',
    },
    {
        pregunta: '¿Puedo cambiar mi información de perfil?',
        respuesta: 'Sí, ve a Perfil > Editar Perfil. Puedes cambiar tu nombre, apellido, usuario, correo, contraseña y foto de perfil.',
    },
];

const CONTACTO = [
    { icon: 'logo-whatsapp', label: 'WhatsApp', value: '+58 414-4567890', url: 'https://wa.me/584144567890', color: '#25D366' },
    { icon: 'mail-outline', label: 'Correo', value: 'helusrestobar@gmail.com', url: 'mailto:helusrestobar@gmail.com', color: '#EA4335' },
    { icon: 'call-outline', label: 'Teléfono', value: '+58 414-4567890', url: 'tel:+584144567890', color: '#4CAF50' },
];

export default function AyudaScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleFaq = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleContacto = async (url: string) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        }
    };

    const s = styles(colors);

    return (
        <View style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Ayuda y Soporte</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={s.scrollContent}>
                <Text style={s.sectionTitle}>PREGUNTAS FRECUENTES</Text>
                <View style={[s.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {FAQ.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                s.faqItem,
                                index < FAQ.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                            ]}
                            onPress={() => toggleFaq(index)}
                            activeOpacity={0.7}
                        >
                            <View style={s.faqQuestion}>
                                <Text style={s.faqPregunta}>{item.pregunta}</Text>
                                <Ionicons
                                    name={expandedId === index ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={colors.textMuted}
                                />
                            </View>
                            {expandedId === index && (
                                <Text style={s.faqRespuesta}>{item.respuesta}</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={s.sectionTitle}>CONTACTO</Text>
                <View style={[s.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {CONTACTO.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                s.contactItem,
                                index < CONTACTO.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                            ]}
                            onPress={() => handleContacto(item.url)}
                            activeOpacity={0.7}
                        >
                            <View style={[s.contactIcon, { backgroundColor: item.color + '15' }]}>
                                <Ionicons name={item.icon as any} size={22} color={item.color} />
                            </View>
                            <View style={s.contactInfo}>
                                <Text style={s.contactLabel}>{item.label}</Text>
                                <Text style={s.contactValue}>{item.value}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
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
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        color: c.textMuted,
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    faqCard: {
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
        overflow: 'hidden',
    },
    faqItem: {
        padding: 16,
    },
    faqQuestion: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    faqPregunta: {
        fontSize: 15,
        fontWeight: '600',
        color: c.text,
        flex: 1,
        marginRight: 8,
    },
    faqRespuesta: {
        fontSize: 13,
        color: c.textSecondary,
        lineHeight: 20,
        marginTop: 10,
    },
    contactCard: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
    },
    contactIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: c.text,
    },
    contactValue: {
        fontSize: 13,
        color: c.textMuted,
        marginTop: 2,
    },
});
