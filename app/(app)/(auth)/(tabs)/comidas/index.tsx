import { CategoriasList } from "@/componentes/CategoriasList";
import ComidasHeader from "@/componentes/ComidasHeader";
import ComidasList from "@/componentes/ComidasList";
import { useTheme } from "@/hooks/use-theme";
import { Fonts } from "@/constants/theme";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const ComidasListPage = () => {
  const { colors } = useTheme();
  const s = styles(colors);

  return (
    <View style={s.container}>
      <ComidasHeader title="Menús" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8 }}
      >
        <Text style={s.pageTitle}>Menus</Text>
        <CategoriasList />

        <Text style={s.allComidasTitle}>Todos los platillos</Text>
        <ComidasList />
      </ScrollView>
    </View>
  );
};

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  pageTitle: {
    fontFamily: Fonts.brandBlack,
    fontSize: 25,
    marginBottom: 16,
    paddingHorizontal: 16,
    color: c.text,
  },
  allComidasTitle: {
    fontFamily: Fonts.brandBold,
    fontSize: 30,
    marginBottom: 16,
    paddingHorizontal: 16,
    color: c.text,
  },
});

export default ComidasListPage;
