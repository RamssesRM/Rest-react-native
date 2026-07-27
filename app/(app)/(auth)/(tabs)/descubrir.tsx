// import useUserStore from '@/hooks/use-userstore';
// import { useRouter } from 'expo-router';
// import * as SecureStore from 'expo-secure-store';
// import React from 'react';
// import { Alert, StyleSheet, Text, View } from 'react-native';

// const Page = () => {
//   const router = useRouter();
//   const { user, setIsGuest, setUser } = useUserStore();

//   return (    
//     <View style={styles.container}>
//       <Text>My inside Page</Text>

//       <Text style={{ marginTop: 10 }}>
//         {user ? `Logueado como: ${user.name}` : 'No hay sesión activa'}
//       </Text>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container:{
//     flex:1,
//   },
// });

// export default Page;

export { default } from '@/src/db/MenuScreen';
