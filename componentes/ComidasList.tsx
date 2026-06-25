import { Colors } from "@/constants/theme";
import { useRestaurants } from "@/hooks/useRestaurants";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const ComidasList = () => {
  const { data: restaurants, isLoading, error } = useRestaurants();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size={"large"} color={Colors.secondary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {restaurants?.map((item) => (
        <View key={item.id}>
          <TouchableOpacity style={styles.card} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    // Aquí irán los estilos de tus tarjetas de comida
  },
});

export default ComidasList;
