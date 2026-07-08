import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ComidasHeaderProps {
  title: string;
}

const ComidasHeader = ({ title }: ComidasHeaderProps) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();

  const s = styles(colors);

  return (
    <View style={[s.headerContainer, { paddingTop: insets.top }]}>
      <View style={s.headerRow}>
        <TouchableOpacity
          style={s.locationButton}
          onPress={() => router.push("/(app)/(auth)/(modal)/location")}
        >
          <View style={s.locationButtonIcon}>
            <Ionicons name="business-outline" size={16} color={colors.text} />
          </View>
          <Text style={s.locationText}>Ubicación</Text>
          <Ionicons name="chevron-down" size={16} color={colors.text} />
        </TouchableOpacity>

        <Text style={s.titleCenter}>{title}</Text>

        <View style={s.rightIcons}>
          <Link href={"/(app)/(auth)/(modal)/filter"} asChild>
            <TouchableOpacity style={s.iconButton}>
              <Ionicons name="filter" size={20} color={colors.text} />
            </TouchableOpacity>
          </Link>
          <Link href={"/(app)/(auth)/(modal)/map"} asChild>
            <TouchableOpacity style={s.iconButton}>
              <Ionicons name="map-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
};

export default ComidasHeader;

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  headerContainer: {
    backgroundColor: c.gold,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    color: c.text,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    gap: 6,
  },
  locationButtonIcon: {
    borderRadius: 20,
    backgroundColor: c.gray200,
    padding: 10,
  },
  rightIcons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: c.gray200,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  titleCenter: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: c.text,
  },
});
