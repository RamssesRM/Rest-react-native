import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type StarRatingProps = {
  rating: number;
  onRate?: (rating: number) => void;
  size?: number;
  interactive?: boolean;
  color?: string;
  inactiveColor?: string;
};

const StarRating = ({
  rating,
  onRate,
  size = 24,
  interactive = false,
  color = "#f4d642",
  inactiveColor = "#555",
}: StarRatingProps) => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => interactive && onRate?.(star)}
          disabled={!interactive}
          activeOpacity={interactive ? 0.6 : 1}
          style={styles.star}
        >
          <Ionicons
            name={star <= rating ? "star" : "star-outline"}
            size={size}
            color={star <= rating ? color : inactiveColor}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 4,
  },
  star: {
    padding: 2,
  },
});

export default StarRating;
