import { CategoriasList } from "@/componentes/CategoriasList";
import ComidasHeader from "@/componentes/ComidasHeader";
import ComidasList from "@/componentes/ComidasList";
import { useTheme } from "@/hooks/use-theme";
import { Fonts } from "@/constants/theme";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { BASE_URL } from "@/app/api/apiConfig";
import { openDatabase } from "@/src/db/database";
import { saveCategorias, saveProductos } from "@/src/db/menuService";

const ComidasListPage = () => {
  const { colors } = useTheme();
  const s = styles(colors);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const syncMenu = async () => {
      try {
        await openDatabase();

        const resCats = await fetch(`${BASE_URL}/categorias/`);
        if (resCats.ok) {
          const catsData = await resCats.json();
          const cats = catsData.results || catsData;
          if (cats.length > 0) await saveCategorias(cats);
        }

        const resProds = await fetch(`${BASE_URL}/productos/`);
        if (resProds.ok) {
          const prodsData = await resProds.json();
          const prods = prodsData.results || prodsData;
          if (prods.length > 0) await saveProductos(prods);
        }
      } catch (e) {
        console.log("Sync menu offline:", e.message);
      } finally {
        setSynced(true);
      }
    };
    syncMenu();
  }, []);

  return (
    <View style={s.container}>
      <ComidasHeader title="Menús" />
      {!synced ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={s.loadingText}>Sincronizando menú...</Text>
        </View>
      ) : (
        <ScrollView
          key="menu-synced"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8 }}
        >
          <Text style={s.pageTitle}>Menus</Text>
          <CategoriasList />

          <Text style={s.allComidasTitle}>Todos los platillos</Text>
          <ComidasList />
        </ScrollView>
      )}
    </View>
  );
};

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: c.textMuted,
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
