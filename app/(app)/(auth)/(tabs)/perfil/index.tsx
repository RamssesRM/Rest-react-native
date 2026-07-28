import { tomarStatsConUsuario } from '@/app/api/usuariosApi';
import GuestGuard from '@/componentes/GuestGuard';
import { useTheme } from '@/hooks/use-theme';
import useUserStore from '@/hooks/use-userstore';
import { clearAuth } from '@/utils/auth';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function PerfilScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const { colors } = useTheme();
  
  // Estados para las estadísticas que vienen de Django
  const [stats, setStats] = useState({
    pedidos: 0,
    favoritos: 0,
    reseñas: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const data = await tomarStatsConUsuario(user.id);
        setStats(data);
      } catch (error) {
        // Error silenciado
      }
    };
    fetchStats();
  }, [user]);

  const nombre = user?.name || 'Invitado';
  const email = user?.email || 'Sin correo';
  const inicialNombre = nombre.charAt(0).toUpperCase();

  const menuOptions = [
    { icon: 'time-outline', text: 'Historial de Órdenes', target: 'historial' },
    { icon: 'heart-outline', text: 'Mis Favoritos', target: 'favoritos' },
    { icon: 'card-outline', text: 'Métodos de Pago', target: 'pagos' },
    { icon: 'settings-outline', text: 'Ajustes y Privacidad', target: 'ajustes' },
    { icon: 'notifications-outline', text: 'Notificaciones', target: 'notificaciones' },
    { icon: 'help-circle-outline', text: 'Ayuda y Soporte', target: 'ayuda' },
    ...(user?.role === 'admin' ? [
      { icon: 'people-outline', text: 'Gestión de Usuarios', target: 'gestion-usuarios' },
      { icon: 'document-text-outline', text: 'Auditoría', target: 'auditoria' },
    ] : []),
  ];

  const handleLogout = async () => {
    try{
      await clearAuth();
    }catch(error){
      Alert.alert('Error', 'No se pudo cerrar la sesión')
    }
  };

  const s = styles(colors);

  return (
    <GuestGuard feature="tu perfil">
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={s.headerContainer}>
          {user?.imagen ? (
            <Image source={{ uri: user.imagen }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, s.avatarPlaceholder]}>
              <Text style={s.avatarText}>{inicialNombre}</Text>
            </View>
          )}

          <View style={s.statsContainer}>
            <View style={s.statBox}>
              <Text style={s.statNumber}>{stats.pedidos}</Text>
              <Text style={s.statLabel}>Pedidos</Text>
            </View>
            <View style={[s.statBox, s.statBorder]}>
              <Text style={s.statNumber}>{stats.favoritos}</Text>
              <Text style={s.statLabel}>Favoritos</Text>
            </View>
            <View style={s.statBox}>
              <Text style={s.statNumber}>{stats.reseñas}</Text>
              <Text style={s.statLabel}>Reseñas</Text>
            </View>
          </View>
        </View>

        <View style={s.infoContainer}>
          <Text style={s.username}>{nombre}</Text>
          <Text style={s.email}>{email}</Text>
        </View>

        <View style={s.buttonsRow}>
          <TouchableOpacity style={s.primaryButton} onPress={() => router.push('./perfil/editar-perfil')}>
            <Text style={s.primaryButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secondaryButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color={colors.goldDark} />
            <Text style={s.secondaryButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={s.menuContainer}>
          {menuOptions.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={s.menuItem}
              onPress={() => {
                if (item.target === 'gestion-usuarios') {
                  router.push('/gestion-usuarios');
                } else if (item.target === 'auditoria') {
                  router.push('/auditoria');
                } else {
                  alert(`Ir a: ${item.text}`);
                }
              }}
            >
              <View style={s.menuItemLeft}>
                <Ionicons name={item.icon as any} size={24} color={colors.goldDark} />
                <Text style={s.menuText}>{item.text}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
    </GuestGuard>
  );
}

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: c.background,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    gap: 25,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: c.goldDark,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: c.gray200,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: c.goldDark,
  },
  statsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    backgroundColor: c.surface,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: c.border,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: c.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: c.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  username: {
    color: c.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    color: c.goldDark,
    fontSize: 14,
    marginTop: 2,
  },
  buttonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: c.goldDark,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: c.surface,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    borderWidth: 1,
    borderColor: c.goldDark,
  },
  secondaryButtonText: {
    color: c.goldDark,
    fontWeight: '600',
    fontSize: 14,
  },
  menuContainer: {
    marginTop: 25,
    marginHorizontal: 16,
    backgroundColor: c.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: c.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  menuText: {
    color: c.text,
    fontSize: 16,
  },
});
