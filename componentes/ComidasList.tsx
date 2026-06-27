import { Colors } from "@/constants/theme";
import { useRestaurants } from "@/hooks/useRestaurants";
import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
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
          {/* <Link> */}
          <TouchableOpacity style={styles.card}>
            <Image source={item.image!} style={styles.image} />
            <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.descripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
            </View>
          </TouchableOpacity>
          {/* </Link> */}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light,
    overflow: "hidden", // Border la parte superior de las cars
    boxShadow: "0px 4px 2px -2px rgba(0, 0, 0, 0.2)",
    //elevation: 2, // eso pone feo la app, pero hay que averiguar como adaptarlo a Android
  },
  info:{
    padding: 12,
  },
  name:{
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  descripcion:{
    fontSize: 14,
    color: '#666',
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 180,
  },
});

export default ComidasList;
