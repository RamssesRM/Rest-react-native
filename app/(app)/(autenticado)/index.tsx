import useUserStore from '@/hooks/use-userstore';
import { useRouter } from 'expo-router';
import React from 'react';
import { Button, Text, View } from 'react-native';

const Page = () => {
  const router = useRouter();
  const { setIsGuest, setUser } = useUserStore();

  return (
    <View>
      <Text>My inside Page</Text>
      <Button
        title='Inicia Sesion'
        onPress={() => {
          setIsGuest(false);
          setUser(null);
          router.replace('/(app)/(publico)');
        }}
      />
    </View>
  )
}

export default Page