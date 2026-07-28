import { useTheme } from '@/hooks/use-theme';
import useUserStore from '@/hooks/use-userstore';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GuestGuardProps {
    children: React.ReactNode;
    feature?: string;
}

export default function GuestGuard({ children, feature = 'este apartado' }: GuestGuardProps) {
    const { user, isGuest, setIsGuest } = useUserStore();
    const { colors } = useTheme();

    if (user && !isGuest) {
        return <>{children}</>;
    }

    const handleLogin = () => {
        setIsGuest(false);
    };

    const handleRegister = () => {
        setIsGuest(false);
    };

    const s = styles(colors);

    return (
        <View style={s.container}>
            <View style={s.card}>
                <View style={s.iconContainer}>
                    <Ionicons name="lock-closed-outline" size={48} color={colors.goldDark} />
                </View>
                <Text style={s.title}>Inicia sesión para continuar</Text>
                <Text style={s.subtitle}>
                    Necesitas tener una cuenta para acceder a {feature}.
                </Text>
                <TouchableOpacity
                    style={s.loginButton}
                    onPress={handleLogin}
                    activeOpacity={0.8}
                >
                    <Ionicons name="log-in-outline" size={20} color={colors.textInverse} />
                    <Text style={s.loginButtonText}>Iniciar Sesión</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={s.registerButton}
                    onPress={handleRegister}
                    activeOpacity={0.8}
                >
                    <Text style={s.registerButtonText}>Crear Cuenta</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: c.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    card: {
        backgroundColor: c.card,
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        maxWidth: 340,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: c.goldLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: c.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: c.textMuted,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: c.goldDark,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        justifyContent: 'center',
        marginBottom: 12,
    },
    loginButtonText: {
        color: c.textInverse,
        fontSize: 16,
        fontWeight: '600',
    },
    registerButton: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerButtonText: {
        color: c.goldDark,
        fontSize: 14,
        fontWeight: '600',
    },
});
