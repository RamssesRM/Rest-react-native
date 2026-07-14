import useUserStore from '@/hooks/use-userstore';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';

const Page = () => {
  const router = useRouter();
  const { user, setIsGuest, setUser } = useUserStore();

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
    <View style={styles.container}>
      <Text>My inside Page</Text>

      <Text style={{ marginTop: 10 }}>
        {user ? `Logueado como: ${user.name}` : 'No hay sesión activa'}
      </Text>
      
      <Button
        title='Inicia Sesion'
        onPress={handleLogout}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container:{
    flex:1,
  },
});

export default Page;
