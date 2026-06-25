import { Fonts } from '@/constants/theme'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CategoriasList } from '../CategoriasList'
import ComidasList from '../ComidasList'

const ComidasListPage = () => {
    const insets = useSafeAreaInsets()
  return (
    <View style={styles.container}>
      <Animated.ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingTop: insets.top + 60}}
      > 
        <Text style={styles.pageTitle}>Comidas</Text>
        <CategoriasList />

        <Text style={styles.allComidasTitle}>Todas las comidas</Text>
        <ComidasList />
      </Animated.ScrollView> 
    </View>
  )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
    },
    pageTitle:{
        fontFamily: Fonts.brandBlack,
        fontSize: 25,
        marginBottom: 16,
        paddingHorizontal: 16
    },
    allComidasTitle:{
        fontFamily: Fonts.brandBold,
        fontSize: 30,
        marginBottom: 16,
        paddingHorizontal: 16
    }
})

export default ComidasListPage