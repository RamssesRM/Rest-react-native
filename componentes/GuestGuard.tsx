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

    if (user && !isGuest) {
        return <>{children}</>;
    }

    const handleLogin = () => {
        setIsGuest(false);
    };

    const handleRegister = () => {
        setIsGuest(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.iconContainer}>
                    <Ionicons name="lock-closed-outline" size={48} color="#D4AF37" />
                </View>
                <Text style={styles.title}>Inicia sesión para continuar</Text>
                <Text style={styles.subtitle}>
                    Necesitas tener una cuenta para acceder a {feature}.
                </Text>
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    activeOpacity={0.8}
                >
                    <Ionicons name="log-in-outline" size={20} color="#FFF" />
                    <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.registerButton}
                    onPress={handleRegister}
                    activeOpacity={0.8}
                >
                    <Text style={styles.registerButtonText}>Crear Cuenta</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    card: {
        backgroundColor: '#FFF',
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
        backgroundColor: '#F5F0E1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#262626',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#8E8E8E',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#D4AF37',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        justifyContent: 'center',
        marginBottom: 12,
    },
    loginButtonText: {
        color: '#FFF',
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
        color: '#D4AF37',
        fontSize: 14,
        fontWeight: '600',
    },
});
