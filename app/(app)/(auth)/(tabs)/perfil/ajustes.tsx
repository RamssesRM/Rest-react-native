import { useTheme } from '@/hooks/use-theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const SECCIONES = [
    {
        titulo: 'Legal',
        items: [
            { id: 'terminos', icon: 'document-text-outline', label: 'Términos y Condiciones' },
            { id: 'privacidad', icon: 'shield-checkmark-outline', label: 'Política de Privacidad' },
        ],
    },
    {
        titulo: 'Acerca de',
        items: [
            { id: 'version', icon: 'information-circle-outline', label: 'Versión de la App', valor: '1.0.0' },
            { id: 'desarrollado', icon: 'code-outline', label: 'Desarrollado por', valor: 'Helus Restobar' },
        ],
    },
    {
        titulo: 'Contacto',
        items: [
            { id: 'email', icon: 'mail-outline', label: 'Correo', valor: 'helusrestobar@gmail.com' },
            { id: 'telefono', icon: 'call-outline', label: 'Teléfono', valor: '+58 414-4567890' },
        ],
    },
];

const TEXTOS = {
    terminos: `Términos y Condiciones de Helus Restobar

1. Aceptación de Términos
Al utilizar la aplicación de Helus Restobar, aceptas estos términos y condiciones en su totalidad.

2. Uso de la Aplicación
La aplicación está diseñada para facilitar pedidos, pagos y consultas del menú del restaurante.

3. Cuentas de Usuario
Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.

4. Pedidos y Pagos
Todos los precios están en dólares (USD). Los métodos de pago disponibles son los mostrados en la sección de Pagos.

5. Cancelaciones
Puedes cancelar un pedido mientras esté en estado "Pidiendo". Una vez en "Cocinando", no se permite la cancelación.

6. Privacidad
Tu información personal será tratada conforme a nuestra Política de Privacidad.`,
    privacidad: `Política de Privacidad de Helus Restobar

1. Información Recopilamos
- Nombre y apellidos
- Correo electrónico
- Nombre de usuario
- Foto de perfil (opcional)
- Historial de pedidos

2. Uso de la Información
Utilizamos tu información para:
- Procesar y gestionar tus pedidos
- Enviar notificaciones sobre el estado de tus órdenes
- Mejorar nuestros servicios

3. Compartir Información
No vendemos ni compartimos tu información personal con terceros, excepto cuando sea necesario para procesar pagos.

4. Seguridad
Implementamos medidas de seguridad para proteger tu información personal.

5. Tus Derechos
Puedes acceder, actualizar o eliminar tu información personal desde la sección de Editar Perfil.`,
};

export default function AjustesScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const s = styles(colors);

    return (
        <View style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Ajustes y Privacidad</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={s.scrollContent}>
                {SECCIONES.map((seccion, sIdx) => (
                    <View key={sIdx} style={s.section}>
                        <Text style={s.sectionTitle}>{seccion.titulo}</Text>
                        <View style={[s.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {seccion.items.map((item, iIdx) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        s.menuItem,
                                        iIdx < seccion.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                                    ]}
                                    onPress={() => {
                                        if (TEXTOS[item.id]) {
                                            toggleExpand(item.id);
                                        }
                                    }}
                                    activeOpacity={TEXTOS[item.id] ? 0.7 : 1}
                                >
                                    <View style={s.menuItemLeft}>
                                        <Ionicons name={item.icon as any} size={22} color={colors.goldDark} />
                                        <Text style={s.menuLabel}>{item.label}</Text>
                                    </View>
                                    {item.valor ? (
                                        <Text style={s.menuValue}>{item.valor}</Text>
                                    ) : (
                                        <Ionicons
                                            name={expandedId === item.id ? 'chevron-up' : 'chevron-forward'}
                                            size={20}
                                            color={colors.textMuted}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {expandedId && TEXTOS[expandedId] && (
                            <View style={[s.textCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Text style={s.textContent}>{TEXTOS[expandedId]}</Text>
                            </View>
                        )}
                    </View>
                ))}
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
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        color: c.textMuted,
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    sectionCard: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuLabel: {
        fontSize: 15,
        color: c.text,
    },
    menuValue: {
        fontSize: 14,
        color: c.textMuted,
    },
    textCard: {
        marginTop: 8,
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
    },
    textContent: {
        fontSize: 13,
        color: c.textSecondary,
        lineHeight: 20,
    },
});
