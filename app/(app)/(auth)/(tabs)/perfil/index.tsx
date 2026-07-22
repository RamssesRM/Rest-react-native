import { tomarStatsConUsuario } from '@/app/api/usuariosApi';
import useUserStore from '@/hooks/use-userstore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
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
  const { user, setIsGuest, setUser } = useUserStore();
  
  // Estados para las estadísticas que vienen de Django
  const [stats, setStats] = useState({
    pedidos: 0,
    favoritos: 0,
    reseñas: 0
  });

  // Petición a Django para obtener los contadores
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return; // Si no hay usuario logueado, no hace nada
      
      try {
        // ✅ Se añadió el await. Ya no necesitamos hacer .json() aquí porque la API lo hizo
        const data = await tomarStatsConUsuario(user.id); 
        
        // Actualizamos el estado con los números que vinieron de Django
        setStats(data); 
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      }
    };

    fetchStats();
}, [user]); // Se ejecuta cada vez que 'user' cambie

  const nombre = user?.name || 'Invitado';
  const email = user?.email || 'Sin correo';
  const inicialNombre = nombre.charAt(0).toUpperCase();

  // Menú de opciones (fácil de agregar o quitar elementos)
  const menuOptions = [
    { icon: 'time-outline', text: 'Historial de Órdenes', target: 'historial' },
    { icon: 'heart-outline', text: 'Mis Favoritos', target: 'favoritos' },
    { icon: 'card-outline', text: 'Métodos de Pago', target: 'pagos' },
    { icon: 'settings-outline', text: 'Ajustes y Privacidad', target: 'ajustes' },
    { icon: 'notifications-outline', text: 'Notificaciones', target: 'notificaciones' },
    { icon: 'help-circle-outline', text: 'Ayuda y Soporte', target: 'ayuda' },
  ];

  const handleLogout = async () => {
    try{
      // Hay que borrar los tokens del zustand
      await SecureStore.deleteItemAsync('jwt_access')
      await SecureStore.deleteItemAsync('jwt_refresh')

      setUser(null);
      setIsGuest(false)

      // router.replace('/') No es necesario cambiar la ruta, al quitar los tokens de inicio de sesion en el zustan lo envia predeterminadamente a /

    }catch(error){
      Alert.alert('Error', 'No se pudo cerrar la sesión')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* --- 1. CABECERA: Foto y Estadísticas --- */}
        <View style={styles.headerContainer}>
          
          {user?.imagen ? (
            <Image source={{ uri: user.imagen }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{inicialNombre}</Text>
            </View>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.pedidos}</Text>
              <Text style={styles.statLabel}>Pedidos</Text>
            </View>
            <View style={[styles.statBox, styles.statBorder]}>
              <Text style={styles.statNumber}>{stats.favoritos}</Text>
              <Text style={styles.statLabel}>Favoritos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.reseñas}</Text>
              <Text style={styles.statLabel}>Reseñas</Text>
            </View>
          </View>
        </View>

        {/* --- 2. INFORMACIÓN DEL USUARIO --- */}
        <View style={styles.infoContainer}>
          <Text style={styles.username}>{nombre}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* --- 3. BOTONES PRINCIPALES --- */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#D4AF37" />
            <Text style={styles.secondaryButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* --- 4. MENÚ VERTICAL (Uno debajo del otro) --- */}
        <View style={styles.menuContainer}>
          {menuOptions.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem}
              // Cuando crees esas pantallas, descomenta router.push:
              // onPress={() => router.push(`/${item.target}`)}
              onPress={() => alert(`Ir a: ${item.text}`)}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={24} color="#D4AF37" />
                <Text style={styles.menuText}>{item.text}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#555" />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- ESTILOS CLAROS (Instagram Light Mode) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#FFFFFF',
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
    borderColor: '#D4AF37',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  statsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    backgroundColor: '#FAFAFA',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#EFEFEF',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#262626',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#8E8E8E',
    fontSize: 12,
    marginTop: 4,
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  username: {
    color: '#262626',
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    color: '#D4AF37',
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
    backgroundColor: '#D4AF37',
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
    backgroundColor: '#EFEFEF',
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  secondaryButtonText: {
    color: '#D4AF37',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // --- MENÚ VERTICAL ---
  menuContainer: {
    marginTop: 25,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  menuText: {
    color: '#262626',
    fontSize: 16,
  },
});