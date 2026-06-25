import { Colors } from '@/constants/theme';
import { useRestaurants } from '@/hooks/useRestaurants';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

const ComidasList = () => {
  const { data:restaurants , isLoading, error } = useRestaurants();

  if (isLoading){
    return(
      <View>
        <ActivityIndicator size={'small'} color={Colors.secondary}/>
      </View>
    )
  }


  return (
    <View>
      {restaurants?.map((item)=>(
        <View key={item.id}>
          <TouchableOpacity style={styles.card} />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container:{
    flex: 1
  },
  card:{

  }
})

export default ComidasList