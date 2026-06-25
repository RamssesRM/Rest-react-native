import useUserStore from '@/hooks/use-userstore';
import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

const Page = () => {
  const router = useRouter();
  const { setIsGuest, setUser } = useUserStore();

  return (
    <View style={styles.container}>
      <Text>My inside Page</Text>
      <Button
        title='Inicia Sesion'
        onPress={() => {
          setIsGuest(false);
        }}
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
