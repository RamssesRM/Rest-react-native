import { useTheme } from '@/hooks/use-theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const PAYMENT_METHODS = [
    {
        id: 'pago-movil',
        title: 'Pago Móvil',
        icon: 'phone-portrait-outline' as const,
        iconColor: '#4CAF50',
        fields: [
            { label: 'Teléfono', value: '0414-4567890' },
            { label: 'Cédula', value: 'V-30.123.456' },
            { label: 'Banco', value: 'Banco de Venezuela (BDV)' },
        ],
    },
    {
        id: 'transferencia',
        title: 'Transferencia Bancaria',
        icon: 'swap-horizontal-outline' as const,
        iconColor: '#2196F3',
        fields: [
            { label: 'Banco', value: 'Banco de Venezuela (BDV)' },
            { label: 'Cuenta', value: '0134-0134-12-1234567890' },
            { label: 'Titular', value: 'Helus Restobar C.A.' },
            { label: 'Cédula', value: 'V-30.123.456' },
        ],
    },
    {
        id: 'binance',
        title: 'Binance',
        icon: 'logo-bitcoin' as const,
        iconColor: '#F0B90B',
        fields: [
            { label: 'Correo', value: 'helusrestobar@gmail.com' },
            { label: 'Red', value: 'USDT / USDC (BEP20, TRC20, ERC20)' },
        ],
    },
    {
        id: 'zelle',
        title: 'Zelle',
        icon: 'shield-checkmark-outline' as const,
        iconColor: '#6C47FF',
        fields: [
            { label: 'Correo', value: 'helusrestobar@gmail.com' },
            { label: 'Nombre', value: 'Helus Restobar' },
        ],
    },
    {
        id: 'zinli',
        title: 'Zinli',
        icon: 'globe-outline' as const,
        iconColor: '#00C4B4',
        fields: [
            { label: 'Correo', value: 'helusrestobar@gmail.com' },
            { label: 'Nombre', value: 'Helus Restobar' },
        ],
    },
    {
        id: 'paypal',
        title: 'PayPal',
        icon: 'logo-paypal' as const,
        iconColor: '#003087',
        fields: [
            { label: 'Correo', value: 'helusrestobar@gmail.com' },
        ],
    },
    {
        id: 'efectivo',
        title: 'Efectivo',
        icon: 'cash-outline' as const,
        iconColor: '#FF9800',
        copyable: false,
        fields: [
            { label: 'Divisas', value: 'Dólares (USD) y Pesos Colombianos (COP)' },
            { label: 'Tasa COP', value: '1 USD = 3.200 COP' },
        ],
    },
];

export default function PagosScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = async (value: string, fieldId: string) => {
        try {
            await Share.share({ message: value });
            setCopiedId(fieldId);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            Alert.alert('Error', 'No se pudo copiar');
        }
    };

    const s = styles(colors);

    return (
        <View style={[s.container, { paddingTop: insets.top }]}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Métodos de Pago</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={s.subtitle}>
                    Selecciona tu método de pago preferido
                </Text>

                {PAYMENT_METHODS.map((method) => (
                    <View
                        key={method.id}
                        style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                        <View style={s.cardHeader}>
                            <View style={[s.iconContainer, { backgroundColor: method.iconColor + '15' }]}>
                                <Ionicons name={method.icon} size={22} color={method.iconColor} />
                            </View>
                            <Text style={[s.cardTitle, { color: colors.text }]}>{method.title}</Text>
                        </View>

                        <View style={[s.divider, { backgroundColor: colors.border }]} />

                        {method.fields.map((field, idx) => {
                            const fieldId = `${method.id}-${idx}`;
                            const isCopied = copiedId === fieldId;
                            return (
                                <View key={idx} style={s.fieldRow}>
                                    <View style={s.fieldInfo}>
                                        <Text style={[s.fieldLabel, { color: colors.textMuted }]}>
                                            {field.label}
                                        </Text>
                                        <Text style={[s.fieldValue, { color: colors.text }]} selectable>
                                            {field.value}
                                        </Text>
                                    </View>
                                    {method.copyable !== false && (
                                        <TouchableOpacity
                                            style={[
                                                s.copyBtn,
                                                { backgroundColor: isCopied ? colors.success : colors.chipBg },
                                            ]}
                                            onPress={() => handleCopy(field.value, fieldId)}
                                    >
                                        <Ionicons
                                            name={isCopied ? 'checkmark-outline' : 'copy-outline'}
                                            size={16}
                                            color={isCopied ? '#fff' : colors.textMuted}
                                        />
                                    </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                ))}

                <View style={[s.noteCard, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
                    <Text style={[s.noteText, { color: colors.text }]}>
                        Realiza tu pago por el método que prefieras. Si requieres factura, envía el comprobante al mismo correo.
                    </Text>
                </View>
            </ScrollView>
        </View>
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
        borderBottomWidth: 1,
        borderBottomColor: c.border,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: c.text },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    subtitle: {
        fontSize: 14,
        color: c.textMuted,
        marginBottom: 16,
    },
    card: {
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    fieldInfo: {
        flex: 1,
        marginRight: 8,
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2,
    },
    fieldValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    copyBtn: {
        width: 34,
        height: 34,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noteCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        padding: 14,
        borderRadius: 12,
        marginTop: 4,
        borderWidth: 1,
    },
    noteText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
});
