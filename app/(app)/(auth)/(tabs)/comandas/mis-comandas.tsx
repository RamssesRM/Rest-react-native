import { useTheme } from '@/hooks/use-theme';
import { tomarComandasPersonalizadas, eliminarComandaPersonalizada, crearOrdenDesdePlantilla } from '@/app/api/comandasPersonalizadasApi';
import { getMesas } from '@/app/api/ordenesApi';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Detalle {
  cantidad: number;
  producto_nombre: string;
  nota?: string;
}

interface Comanda {
  id: number;
  nombre: string;
  total_productos: number;
  detalles: Detalle[];
}

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: string;
}

export default function MisComandasScreen() {
  const { colors } = useTheme();
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [selectedComandaId, setSelectedComandaId] = useState<number | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const fetchComandas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tomarComandasPersonalizadas();
      setComandas(data.results || []);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las comandas personalizadas.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchComandas();
  }, [fetchComandas]);

  const handleDelete = useCallback(
    async (id: number) => {
      Alert.alert(
        'Eliminar Comanda',
        '¿Estás seguro de que deseas eliminar esta comanda personalizada?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                await eliminarComandaPersonalizada(id);
                setComandas((prev) => prev.filter((c) => c.id !== id));
              } catch (error) {
                Alert.alert('Error', 'No se pudo eliminar la comanda.');
              }
            },
          },
        ]
      );
    },
    []
  );

  const handleOpenModal = useCallback(async (comandaId: number) => {
    setSelectedComandaId(comandaId);
    try {
      const data = await getMesas();
      const disponibles = data.filter((m: any) => m.estatus === 'disponible');
      setMesas(disponibles);
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las mesas.');
    }
  }, []);

  const handleCreateOrder = useCallback(
    async (mesaId: number) => {
      if (!selectedComandaId) return;
      setCreatingOrder(true);
      try {
        await crearOrdenDesdePlantilla(selectedComandaId, mesaId);
        setModalVisible(false);
        setSelectedComandaId(null);
        router.push('/comandas');
      } catch (error) {
        Alert.alert('Error', 'No se pudo crear la orden desde la plantilla.');
      } finally {
        setCreatingOrder(false);
      }
    },
    [selectedComandaId]
  );

  const s = styles(colors);

  const renderComanda = useCallback(
    ({ item }: { item: Comanda }) => (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardTitle}>{item.nombre}</Text>
          <Text style={s.cardBadge}>{item.total_productos} productos</Text>
        </View>
        <View style={s.detallesContainer}>
          {item.detalles.map((detalle, index) => (
            <Text key={index} style={s.detalleText}>
              {detalle.cantidad} x {detalle.producto_nombre}
              {detalle.nota ? ` (${detalle.nota})` : ''}
            </Text>
          ))}
        </View>
        <View style={s.cardActions}>
          <TouchableOpacity
            style={s.deleteButton}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.createButton}
            onPress={() => handleOpenModal(item.id)}
          >
            <Text style={s.createButtonText}>Crear Orden</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [colors, handleDelete, handleOpenModal, s]
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Mis Comandas</Text>
        <TouchableOpacity
          style={s.addButton}
          onPress={() => router.push('./nueva-comanda-personalizada')}
        >
          <Ionicons name="add" size={24} color={colors.textInverse} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brandYellow} />
        </View>
      ) : comandas.length === 0 ? (
        <View style={s.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
          <Text style={s.emptyTitle}>No hay comandas personalizadas</Text>
          <Text style={s.emptySubtitle}>
            Crea una comanda personalizada para guardar tus pedidos frecuentes.
          </Text>
        </View>
      ) : (
        <FlatList
          data={comandas}
          renderItem={renderComanda}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Seleccionar Mesa</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            {mesas.length === 0 ? (
              <Text style={s.noMesasText}>No hay mesas disponibles.</Text>
            ) : (
              <FlatList
                data={mesas}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item: mesa }) => (
                  <TouchableOpacity
                    style={s.mesaItem}
                    onPress={() => handleCreateOrder(mesa.id)}
                    disabled={creatingOrder}
                  >
                    <View style={s.mesaInfo}>
                      <Text style={s.mesaNumero}>Mesa {mesa.numero_mesa}</Text>
                    </View>
                    {creatingOrder && (
                      <ActivityIndicator size="small" color={colors.brandYellow} />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: c.text,
    },
    addButton: {
      backgroundColor: c.brandYellow,
      borderRadius: 20,
      padding: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: c.text,
      marginTop: 16,
    },
    emptySubtitle: {
      fontSize: 14,
      color: c.textSecondary,
      textAlign: 'center',
      marginTop: 8,
    },
    listContent: {
      padding: 16,
    },
    card: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: c.border,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: c.text,
      flex: 1,
    },
    cardBadge: {
      fontSize: 12,
      color: c.brandYellow,
      fontWeight: '600',
      backgroundColor: c.brandYellowLight,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      overflow: 'hidden',
    },
    detallesContainer: {
      marginBottom: 12,
    },
    detalleText: {
      fontSize: 14,
      color: c.textSecondary,
      marginBottom: 4,
    },
    cardActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 12,
    },
    deleteButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: c.dangerLight,
    },
    createButton: {
      backgroundColor: c.brandYellow,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    createButtonText: {
      color: c.brandDark,
      fontSize: 14,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: c.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: c.card,
      borderRadius: 16,
      width: '85%',
      maxHeight: '60%',
      borderWidth: 1,
      borderColor: c.border,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: c.text,
    },
    noMesasText: {
      fontSize: 14,
      color: c.textMuted,
      textAlign: 'center',
      padding: 24,
    },
    mesaItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.borderLight,
    },
    mesaInfo: {
      flex: 1,
    },
    mesaNumero: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
    },
    mesaCapacidad: {
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 2,
    },
  });
