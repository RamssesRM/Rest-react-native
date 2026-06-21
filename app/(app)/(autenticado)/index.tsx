import React from 'react'
import { Button, Text, View } from 'react-native'
import { useRouter } from 'expo-router'

const Page = () => {
  const router = useRouter()

  return (
    <View>
      <Text>My inside Page</Text>
      <Button title='Inicia Sesion' onPress={() => router.push('/(app)/(publico)')} />
    </View>
  )
}

export default Page