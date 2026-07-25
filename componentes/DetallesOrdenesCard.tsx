import { eliminarDetalleOrden, patchDetalleOrden } from '@/app/api/detallesOrdenesApi';
import { cambiarEstadoOrden } from '@/app/api/ordenesApi';
import Ionicons from '@expo/vector-icons/Ionicons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as SecureStore from 'expo-secure-store';
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Share as RNShare, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- TYPES ---
type DetalleOrden = {
    id: string;
    producto_info?: { nombre: string; precio: number };
    producto_fk: string;
    precio: number;
    cantidad: number;
    subtotal?: number;
};

type Orden = {
    id: string;
    mesa_info?: { numero_mesa: number };
    cliente_info?: { first_name?: string; email?: string };
    mesero_info?: { first_name?: string };
    estatus: string;
    monto_total: number;
    fecha_creacion: string;
    detalles?: DetalleOrden[];
};

type DetallesOrdenesCardProps = {
    orden: Orden | null;
    role: string;
    onDismiss: () => void;
    onEstadoCambiado?: () => void;
};

// --- COMPONENTE ---
const DetallesOrdenesCard = forwardRef<BottomSheet, DetallesOrdenesCardProps>(
    ({ orden, role, onDismiss, onEstadoCambiado }, ref) => {
        const [detalles, setDetalles] = useState<DetalleOrden[]>([]);
        const [isLoading, setIsLoading] = useState(false);
        const [detallesEditados, setDetallesEditados] = useState<Map<string, number>>(new Map());
        const snapPoints = useMemo(() => ['75%'], []);

        // Cargar detalles cuando se abre
        useEffect(() => {
            if (orden?.id) {
                cargarDetalles();
            }
        }, [orden?.id]);

        const cargarDetalles = async () => {
            if (!orden) return;
            setIsLoading(true);
            try {
                const token = await SecureStore.getItemAsync('jwt_access');
                const headers = { 'Authorization': `Bearer ${token}` };

                const [detallesRes, productosRes] = await Promise.all([
                    fetch(`http://10.0.2.2:8000/api/detalles/?orden_fk=${orden.id}`, { headers }),
                    fetch(`http://10.0.2.2:8000/api/productos/`, { headers })
                ]);

                if (detallesRes.ok && productosRes.ok) {
                    const detallesData = await detallesRes.json();
                    const productosData = await productosRes.json();

                    const productosMap = new Map(productosData.map((p: any) => [p.id, p]));
                    const detallesConInfo = detallesData.map((d: any) => ({
                        ...d,
                        producto_info: productosMap.get(d.producto_fk) || { nombre: 'Producto', precio: d.precio }
                    }));

                    setDetalles(detallesConInfo);
                    setDetallesEditados(new Map());
                }
            } catch (error) {
                console.error('Error cargando detalles:', error);
            } finally {
                setIsLoading(false);
            }
        };

        // Verificar si hay cambios sin guardar
        const hayCambios = useMemo(() => {
            if (role !== 'cliente') return false;
            return detallesEditados.size > 0;
        }, [detallesEditados, role]);

        // Manejar cambio de cantidad (cliente editando)
        const handleCantidadChange = useCallback((detalleId: string, nuevaCantidad: number) => {
            if (nuevaCantidad < 1) {
                Alert.alert('Eliminar', '¿Quitar este producto del pedido?', [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Sí, quitar',
                        style: 'destructive',
                        onPress: () => {
                            setDetalles(prev => prev.filter(d => d.id !== detalleId));
                            setDetallesEditados(prev => {
                                const next = new Map(prev);
                                next.set(detalleId, 0);
                                return next;
                            });
                        }
                    }
                ]);
                return;
            }

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setDetallesEditados(prev => {
                const next = new Map(prev);
                next.set(detalleId, nuevaCantidad);
                return next;
            });
        }, []);

        // Enviar modificaciones del cliente
        const handleEnviarModificaciones = async () => {
            setIsLoading(true);
            try {
                const promises: Promise<any>[] = [];

                for (const [detalleId, nuevaCantidad] of detallesEditados) {
                    if (nuevaCantidad === 0) {
                        promises.push(eliminarDetalleOrden(detalleId));
                    } else {
                        promises.push(patchDetalleOrden(detalleId, { cantidad: nuevaCantidad }));
                    }
                }

                await Promise.all(promises);
                Alert.alert('Éxito', 'Pedido actualizado');
                setDetallesEditados(new Map());
                await cargarDetalles();
                onEstadoCambiado?.();
            } catch (error) {
                Alert.alert('Error', 'No se pudieron guardar los cambios');
            } finally {
                setIsLoading(false);
            }
        };

        // Cambiar estado (mesero)
        const handleFinalizarOrden = async () => {
            Alert.alert('Confirmar', '¿Marcar orden como finalizada?', [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sí, finalizar',
                    onPress: async () => {
                        try {
                            await cambiarEstadoOrden(orden!.id, 'finalizado');
                            Alert.alert('Éxito', 'Orden finalizada');
                            onEstadoCambiado?.();
                            onDismiss();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo cambiar el estado');
                        }
                    }
                }
            ]);
        };

        // Generar PDF / texto para impresora mini
        const handleDescargarPDF = async () => {
            const fecha = new Date(orden!.fecha_creacion).toLocaleString();
            const mesa = orden!.mesa_info?.numero_mesa || 'N/A';
            const cliente = orden!.cliente_info?.first_name || orden!.cliente_info?.email || 'N/A';

            let contenido = `
╔══════════════════════════════════╗
║        HELUS RESTOBAR           ║
║        COMANDA #${orden!.id.slice(0, 8).toUpperCase()}        ║
╚══════════════════════════════════╝

Mesa: ${mesa}
Cliente: ${cliente}
Fecha: ${fecha}
Estado: ${orden!.estatus.toUpperCase()}

──────────────────────────────────
PRODUCTOS:
──────────────────────────────────`;

            detalles.forEach(d => {
                const nombre = d.producto_info?.nombre || 'Producto';
                const subtotal = (Number(d.precio || 0) * d.cantidad).toFixed(2);
                contenido += `
${d.cantidad}x ${nombre}
   $${Number(d.precio || 0).toFixed(2)} c/u    = $${subtotal}`;
            });

            contenido += `
──────────────────────────────────
TOTAL: $${Number(orden!.monto_total || 0).toFixed(2)}
──────────────────────────────────

¡Gracias por su preferencia!`;

            try {
                await Print.printAsync({ html: `<pre style="font-family:monospace;font-size:12px;white-space:pre">${contenido}</pre>` });
            } catch (error) {
                await RNShare.share({ message: contenido });
            }
        };

        // Cerrar sheet
        const handleSheetChanges = useCallback((index: number) => {
            if (index === -1) onDismiss();
        }, [onDismiss]);

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
            ),
            []
        );

        return (
            <BottomSheet
                ref={ref}
                index={-1}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                backgroundStyle={styles.background}
                handleIndicatorStyle={styles.indicator}
            >
                <BottomSheetScrollView contentContainerStyle={styles.content}>
                    {!orden ? (
                        <Text style={styles.loadingText}>Selecciona una orden</Text>
                    ) : (
                    <>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.mesaTitle}>Mesa {orden.mesa_info?.numero_mesa || 'N/A'}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orden.estatus) + '20' }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(orden.estatus) }]}>
                                    {orden.estatus.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Info */}
                    <View style={styles.infoSection}>
                        <InfoRow label="Cliente" value={orden.cliente_info?.first_name || orden.cliente_info?.email || 'N/A'} />
                        {orden.mesero_info && (
                            <InfoRow label="Mesero" value={orden.mesero_info.first_name || 'N/A'} />
                        )}
                        <InfoRow label="Fecha" value={new Date(orden.fecha_creacion).toLocaleString()} />
                    </View>

                    {/* Productos */}
                    <Text style={styles.sectionTitle}>Productos</Text>
                    {isLoading ? (
                        <Text style={styles.loadingText}>Cargando detalles...</Text>
                    ) : (
                        detalles.map(detalle => {
                            const cantidadActual = detallesEditados.get(detalle.id) ?? detalle.cantidad;
                            const editado = detallesEditados.has(detalle.id);

                            return (
                                <View key={detalle.id} style={[styles.productCard, editado && styles.productCardEdited]}>
                                    <View style={styles.productInfo}>
                                        <Text style={styles.productName} numberOfLines={1}>
                                            {detalle.producto_info?.nombre || 'Producto'}
                                        </Text>
                                        <Text style={styles.productPrice}>${Number(detalle.precio || 0).toFixed(2)} c/u</Text>
                                    </View>

                                    {role === 'cliente' && orden.estatus === 'pidiendo' ? (
                                        <View style={styles.quantityControls}>
                                            <TouchableOpacity
                                                style={styles.qtyBtn}
                                                onPress={() => handleCantidadChange(detalle.id, detalle.cantidad - 1)}
                                            >
                                                <Ionicons name="remove-circle" size={28} color="#F44336" />
                                            </TouchableOpacity>
                                            <Text style={[styles.qtyText, editado && styles.qtyTextEdited]}>
                                                {cantidadActual}
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.qtyBtn}
                                                onPress={() => handleCantidadChange(detalle.id, detalle.cantidad + 1)}
                                            >
                                                <Ionicons name="add-circle" size={28} color="#4CAF50" />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <Text style={styles.qtyText}>x{detalle.cantidad}</Text>
                                    )}

                                    <Text style={styles.subtotal}>
                                        ${(Number(detalle.precio || 0) * cantidadActual).toFixed(2)}
                                    </Text>
                                </View>
                            );
                        })
                    )}

                    {/* Total */}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalAmount}>${Number(orden.monto_total || 0).toFixed(2)}</Text>
                    </View>

                    {/* Acciones por Rol */}
                    <View style={styles.actionsSection}>
                        {/* CAJERO: Descargar PDF si está cocinando */}
                        {role === 'cajero' && (orden.estatus === 'cocinando' || orden.estatus === 'finalizado') && (
                            <TouchableOpacity style={styles.actionBtnPrimary} onPress={handleDescargarPDF}>
                                <Ionicons name="print-outline" size={20} color="#fff" />
                                <Text style={styles.actionBtnText}>Imprimir Comanda</Text>
                            </TouchableOpacity>
                        )}

                        {/* MESERO: Finalizar si está cocinando */}
                        {role === 'mesero' && orden.estatus === 'cocinando' && (
                            <TouchableOpacity style={styles.actionBtnSuccess} onPress={handleFinalizarOrden}>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                <Text style={styles.actionBtnText}>Finalizado</Text>
                            </TouchableOpacity>
                        )}

                        {/* CLIENTE: Enviar modificaciones */}
                        {role === 'cliente' && hayCambios && (
                            <TouchableOpacity
                                style={[styles.actionBtnPrimary, isLoading && styles.actionBtnDisabled]}
                                onPress={handleEnviarModificaciones}
                                disabled={isLoading}
                            >
                                <Ionicons name="save-outline" size={20} color="#fff" />
                                <Text style={styles.actionBtnText}>
                                    {isLoading ? 'Guardando...' : 'Enviar Modificaciones'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    </>
                    )}
                </BottomSheetScrollView>
            </BottomSheet>
        );
    }
);

// --- SUB-COMPONENTES ---
const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

// --- HELPERS ---
const getStatusColor = (status: string) => {
    switch (status) {
        case 'pidiendo': return '#FF9800';
        case 'cocinando': return '#F44336';
        case 'finalizado': return '#2196F3';
        case 'pagado': return '#4CAF50';
        case 'delivery': return '#9C27B0';
        case 'entregado': return '#607D8B';
        case 'eliminado': return '#BDBDBD';
        default: return '#EFEFEF';
    }
};

// --- STYLES ---
const styles = StyleSheet.create({
    background: {
        backgroundColor: '#FAFAFA',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    indicator: {
        backgroundColor: '#D4AF37',
        width: 40,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    headerLeft: {
        flex: 1,
    },
    mesaTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#262626',
        marginBottom: 6,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '800',
    },
    closeBtn: {
        padding: 4,
    },
    infoSection: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    infoLabel: {
        fontSize: 13,
        color: '#8E8E8E',
    },
    infoValue: {
        fontSize: 13,
        color: '#262626',
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#262626',
        marginBottom: 10,
    },
    loadingText: {
        textAlign: 'center',
        color: '#8E8E8E',
        paddingVertical: 20,
    },
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    productCardEdited: {
        borderColor: '#D4AF37',
        backgroundColor: '#FFFDF5',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#262626',
        marginBottom: 2,
    },
    productPrice: {
        fontSize: 12,
        color: '#8E8E8E',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    qtyBtn: {
        padding: 2,
    },
    qtyText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#262626',
        minWidth: 24,
        textAlign: 'center',
    },
    qtyTextEdited: {
        color: '#D4AF37',
    },
    subtotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#262626',
        marginLeft: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#EFEFEF',
        paddingTop: 16,
        marginTop: 8,
        marginBottom: 20,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#262626',
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#D4AF37',
    },
    actionsSection: {
        gap: 10,
    },
    actionBtnPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2196F3',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    actionBtnSuccess: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    actionBtnDisabled: {
        opacity: 0.5,
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default DetallesOrdenesCard;
