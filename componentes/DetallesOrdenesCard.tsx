import { eliminarDetalleOrden, patchDetalleOrden, tomarDetallesPorOrden } from '@/app/api/detallesOrdenesApi';
import { cambiarEstadoOrden, registrarPago, getProductos } from '@/app/api/ordenesApi';
import { useTheme } from '@/hooks/use-theme';
import useUserStore from '@/hooks/use-userstore';
import Ionicons from '@expo/vector-icons/Ionicons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Share as RNShare, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type DetalleOrden = {
    id: string;
    producto_info?: { nombre: string; precio: number };
    producto_fk: string;
    precio: number;
    cantidad: number;
    nota?: string;
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
    metodo_pago?: string;
    referencia_pago?: string;
    comprobante_pago?: string;
};

type DetallesOrdenesCardProps = {
    orden: Orden | null;
    role: string;
    onDismiss: () => void;
    onEstadoCambiado?: () => void;
    coloresEstatus?: Record<string, string>;
};

const DetallesOrdenesCard = forwardRef<BottomSheet, DetallesOrdenesCardProps>(
    ({ orden, role, onDismiss, onEstadoCambiado, coloresEstatus = {} }, ref) => {
        const { user } = useUserStore();
        const { colors } = useTheme();
        const s = styles(colors);
        const [detalles, setDetalles] = useState<DetalleOrden[]>([]);
        const [isLoading, setIsLoading] = useState(false);
        const [detallesEditados, setDetallesEditados] = useState<Map<string, number>>(new Map());
        const [notasEditadas, setNotasEditadas] = useState<Map<string, string>>(new Map());
        const snapPoints = useMemo(() => ['75%'], []);

        const [modalVisible, setModalVisible] = useState(false);
        const [metodoPago, setMetodoPago] = useState('');
        const [referenciaPago, setReferenciaPago] = useState('');
        const [comprobanteUri, setComprobanteUri] = useState<string | null>(null);
        const [isPaying, setIsPaying] = useState(false);

        const ordenRef = useRef<Orden | null>(null);
        const pendingCobro = useRef(false);

        useEffect(() => {
            if (orden?.id) {
                cargarDetalles();
            }
        }, [orden?.id]);

        const cargarDetalles = async () => {
            if (!orden) return;
            setIsLoading(true);
            try {
                const [detallesData, productosData] = await Promise.all([
                    tomarDetallesPorOrden(orden.id),
                    getProductos(),
                ]);

                const productosMap = new Map(productosData.map((p: any) => [p.id, p]));
                const detallesConInfo = detallesData.map((d: any) => ({
                    ...d,
                    producto_info: productosMap.get(d.producto_fk) || { nombre: 'Producto', precio: d.precio }
                }));

                setDetalles(detallesConInfo);
                setDetallesEditados(new Map());
                const notasIniciales = new Map<string, string>();
                detallesConInfo.forEach((d: DetalleOrden) => {
                    if (d.nota) notasIniciales.set(d.id, d.nota);
                });
                setNotasEditadas(notasIniciales);
            } catch (error) {
                console.error('Error cargando detalles:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const hayCambios = useMemo(() => {
            if (role !== 'cliente') return false;
            return detallesEditados.size > 0;
        }, [detallesEditados, role]);

        const handleNotaChange = useCallback((detalleId: string, nota: string) => {
            setNotasEditadas(prev => {
                const next = new Map(prev);
                if (nota.trim()) {
                    next.set(detalleId, nota);
                } else {
                    next.delete(detalleId);
                }
                return next;
            });
        }, []);

        const handleEnviarNotasMesero = async () => {
            setIsLoading(true);
            try {
                const promises: Promise<any>[] = [];
                for (const [detalleId, nota] of notasEditadas) {
                    promises.push(patchDetalleOrden(detalleId, { nota }));
                }
                await Promise.all(promises);
                Alert.alert('Éxito', 'Notas actualizadas');
                await cargarDetalles();
                onEstadoCambiado?.();
            } catch (error) {
                Alert.alert('Error', 'No se pudieron guardar las notas');
            } finally {
                setIsLoading(false);
            }
        };

        const handleCocinar = async () => {
            Alert.alert('Confirmar', '¿Enviar orden a cocina?', [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sí, cocinar',
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            if (notasEditadas.size > 0) {
                                const promises: Promise<any>[] = [];
                                for (const [detalleId, nota] of notasEditadas) {
                                    promises.push(patchDetalleOrden(detalleId, { nota }));
                                }
                                await Promise.all(promises);
                            }
                            await cambiarEstadoOrden(orden!.id, 'cocinando', { mesero: user?.id });
                            Alert.alert('Éxito', 'Orden enviada a cocina');
                            onEstadoCambiado?.();
                            onDismiss();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo enviar la orden');
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]);
        };

        const hayCambiosMesero = useMemo(() => {
            if (role !== 'mesero') return false;
            return notasEditadas.size > 0;
        }, [notasEditadas, role]);

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

        const handleDescargarPDF = async () => {
            const fecha = new Date(orden!.fecha_creacion).toLocaleString();
            const mesa = orden!.mesa_info?.numero_mesa || 'N/A';
            const cliente = orden!.cliente_info?.first_name || orden!.cliente_info?.email || 'N/A';

            let contenido = `
╔══════════════════════════════════╗
║            HELUS RESTOBAR              ║
║            COMANDA #${orden!.id.slice(0, 8).toUpperCase()}           ║
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
                if (d.nota) {
                    contenido += `
   Nota: ${d.nota}`;
                }
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

        const handleSheetChanges = useCallback((index: number) => {
            if (index === -1) {
                if (pendingCobro.current) {
                    pendingCobro.current = false;
                    setModalVisible(true);
                } else {
                    resetFormPago();
                    onDismiss();
                }
            }
        }, [onDismiss]);

        const handleAbrirCobro = () => {
            ordenRef.current = orden;
            pendingCobro.current = true;
            (ref as React.RefObject<BottomSheet>)?.current?.close();
        };

        const handleSeleccionarImagen = async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para seleccionar el comprobante');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
                setComprobanteUri(result.assets[0].uri);
            }
        };

        const handleCobrar = async () => {
            if (!metodoPago) {
                Alert.alert('Error', 'Selecciona un método de pago');
                return;
            }
            setIsPaying(true);
            try {
                const ordenCobrar = ordenRef.current || orden;
                await registrarPago(ordenCobrar!.id, {
                    metodo_pago: metodoPago,
                    referencia_pago: referenciaPago,
                    comprobante: comprobanteUri,
                });
                await cambiarEstadoOrden(ordenCobrar!.id, 'pagado');
                Alert.alert('Éxito', 'Pago registrado correctamente');
                setModalVisible(false);
                resetFormPago();
                onEstadoCambiado?.();
                onDismiss();
            } catch (error) {
                Alert.alert('Error', 'No se pudo registrar el pago');
            } finally {
                setIsPaying(false);
            }
        };

        const resetFormPago = () => {
            setMetodoPago('');
            setReferenciaPago('');
            setComprobanteUri(null);
        };

        const cerrarModalPago = () => {
            setModalVisible(false);
            resetFormPago();
            onDismiss();
        };

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
            ),
            []
        );

        const ordenModal = ordenRef.current || orden;

        return (
            <>
            <BottomSheet
                ref={ref}
                index={-1}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                backgroundStyle={s.background}
                handleIndicatorStyle={s.indicator}
            >
                <BottomSheetScrollView contentContainerStyle={s.content}>
                    {!orden ? (
                        <Text style={s.loadingText}>Selecciona una orden</Text>
                    ) : (
                    <>
                    <View style={s.header}>
                        <View style={s.headerLeft}>
                            <Text style={s.mesaTitle}>Mesa {orden.mesa_info?.numero_mesa || 'N/A'}</Text>
                            <View style={[s.statusBadge, { backgroundColor: getStatusColor(orden.estatus) + '20' }]}>
                                <Text style={[s.statusText, { color: getStatusColor(orden.estatus) }]}>
                                    {orden.estatus.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onDismiss} style={s.closeBtn}>
                            <Ionicons name="close" size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <View style={s.infoSection}>
                        <InfoRow colors={colors} label="Cliente" value={orden.cliente_info?.first_name || orden.cliente_info?.email || 'N/A'} />
                        {(role === 'admin' || orden.mesero_info) && (
                            <InfoRow colors={colors} label="Mesero" value={orden.mesero_info?.first_name || 'N/A'} />
                        )}
                        <InfoRow colors={colors} label="Fecha" value={new Date(orden.fecha_creacion).toLocaleString()} />
                    </View>

                    {role === 'admin' && (
                        <View style={s.pagoSection}>
                            <Text style={s.sectionTitle}>Información de Pago</Text>
                            <View style={s.pagoInfo}>
                                {orden.metodo_pago ? (
                                    <>
                                        <InfoRow colors={colors} label="Método" value={orden.metodo_pago.charAt(0).toUpperCase() + orden.metodo_pago.slice(1)} />
                                        {orden.referencia_pago ? (
                                            <InfoRow colors={colors} label="Referencia" value={orden.referencia_pago} />
                                        ) : null}
                                        {orden.comprobante_pago ? (
                                            <View style={s.comprobanteContainer}>
                                                <Text style={s.infoLabel}>Comprobante</Text>
                                                <Image source={{ uri: orden.comprobante_pago }} style={s.comprobanteImg} />
                                            </View>
                                        ) : null}
                                    </>
                                ) : (
                                    <Text style={s.pagoVacio}>Sin información de pago</Text>
                                )}
                            </View>
                        </View>
                    )}

                    <Text style={s.sectionTitle}>Productos</Text>
                    {isLoading ? (
                        <Text style={s.loadingText}>Cargando detalles...</Text>
                    ) : (
                        detalles.map(detalle => {
                            const cantidadActual = detallesEditados.get(detalle.id) ?? detalle.cantidad;
                            const editado = detallesEditados.has(detalle.id);
                            const notaActual = notasEditadas.get(detalle.id) ?? detalle.nota ?? '';

                            return (
                                <View key={detalle.id} style={[s.productCard, editado && s.productCardEdited]}>
                                    <View style={s.productInfo}>
                                        <Text style={s.productName} numberOfLines={1}>
                                            {detalle.producto_info?.nombre || 'Producto'}
                                        </Text>
                                        <Text style={s.productPrice}>${Number(detalle.precio || 0).toFixed(2)} c/u</Text>
                                    </View>

                                    {role === 'cliente' && orden.estatus === 'pidiendo' ? (
                                        <View style={s.quantityControls}>
                                            <TouchableOpacity
                                                style={s.qtyBtn}
                                                onPress={() => handleCantidadChange(detalle.id, detalle.cantidad - 1)}
                                            >
                                                <Ionicons name="remove-circle" size={28} color={colors.danger} />
                                            </TouchableOpacity>
                                            <Text style={[s.qtyText, editado && s.qtyTextEdited]}>
                                                {cantidadActual}
                                            </Text>
                                            <TouchableOpacity
                                                style={s.qtyBtn}
                                                onPress={() => handleCantidadChange(detalle.id, detalle.cantidad + 1)}
                                            >
                                                <Ionicons name="add-circle" size={28} color={colors.success} />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <Text style={s.qtyText}>x{detalle.cantidad}</Text>
                                    )}

                                    <Text style={s.subtotal}>
                                        ${(Number(detalle.precio || 0) * cantidadActual).toFixed(2)}
                                    </Text>
                                </View>
                            );
                        })
                    )}

                    {role === 'mesero' && orden.estatus === 'pidiendo' && (
                        <View style={s.notaSection}>
                            <Text style={s.notaSectionTitle}>Notas de productos</Text>
                            {detalles.map(detalle => (
                                <View key={detalle.id} style={s.notaItem}>
                                    <Text style={s.notaProductName}>
                                        {detalle.producto_info?.nombre || 'Producto'}
                                    </Text>
                                    <TextInput
                                        style={s.notaInput}
                                        placeholder="Ej: sin cebolla, poco cocido..."
                                        placeholderTextColor={colors.gray500}
                                        multiline
                                        numberOfLines={2}
                                        textAlignVertical="top"
                                        maxLength={500}
                                        value={notasEditadas.get(detalle.id) ?? detalle.nota ?? ''}
                                        onChangeText={(text) => handleNotaChange(detalle.id, text)}
                                    />
                                </View>
                            ))}
                        </View>
                    )}

                    {role === 'mesero' && orden.estatus !== 'pidiendo' && detalles.some(d => d.nota) && (
                        <View style={s.notaSection}>
                            <Text style={s.notaSectionTitle}>Notas</Text>
                            {detalles.filter(d => d.nota).map(detalle => (
                                <View key={detalle.id} style={s.notaDisplayItem}>
                                    <Text style={s.notaDisplayProduct}>
                                        {detalle.producto_info?.nombre || 'Producto'}:
                                    </Text>
                                    <Text style={s.notaDisplayText}>{detalle.nota}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={s.totalRow}>
                        <Text style={s.totalLabel}>Total</Text>
                        <Text style={s.totalAmount}>${Number(orden.monto_total || 0).toFixed(2)}</Text>
                    </View>

                    <View style={s.actionsSection}>
                        {role === 'cajero' && orden.estatus === 'finalizado' && (
                            <TouchableOpacity style={s.actionBtnSuccess} onPress={handleAbrirCobro}>
                                <Ionicons name="cash-outline" size={20} color="#fff" />
                                <Text style={s.actionBtnText}>Cobrar</Text>
                            </TouchableOpacity>
                        )}

                        {role === 'cajero' && orden.estatus === 'cocinando' && (
                            <TouchableOpacity style={s.actionBtnPrimary} onPress={handleDescargarPDF}>
                                <Ionicons name="print-outline" size={20} color="#fff" />
                                <Text style={s.actionBtnText}>Imprimir Comanda</Text>
                            </TouchableOpacity>
                        )}

                        {role === 'mesero' && orden.estatus === 'pidiendo' && (
                            <>
                                {hayCambiosMesero && (
                                    <TouchableOpacity
                                        style={[s.actionBtnPrimary, isLoading && s.actionBtnDisabled]}
                                        onPress={handleEnviarNotasMesero}
                                        disabled={isLoading}
                                    >
                                        <Ionicons name="save-outline" size={20} color="#fff" />
                                        <Text style={s.actionBtnText}>
                                            {isLoading ? 'Guardando...' : 'Guardar Notas'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={[s.actionBtnCook, isLoading && s.actionBtnDisabled]}
                                    onPress={handleCocinar}
                                    disabled={isLoading}
                                >
                                    <Ionicons name="flame-outline" size={20} color="#fff" />
                                    <Text style={s.actionBtnText}>Cocinar</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {role === 'mesero' && orden.estatus === 'cocinando' && (
                            <TouchableOpacity style={s.actionBtnSuccess} onPress={handleFinalizarOrden}>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                <Text style={s.actionBtnText}>Finalizado</Text>
                            </TouchableOpacity>
                        )}

                        {role === 'cliente' && hayCambios && (
                            <TouchableOpacity
                                style={[s.actionBtnPrimary, isLoading && s.actionBtnDisabled]}
                                onPress={handleEnviarModificaciones}
                                disabled={isLoading}
                            >
                                <Ionicons name="save-outline" size={20} color="#fff" />
                                <Text style={s.actionBtnText}>
                                    {isLoading ? 'Guardando...' : 'Enviar Modificaciones'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    </>
                    )}
                </BottomSheetScrollView>
            </BottomSheet>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={cerrarModalPago}
            >
                <View style={s.modalOverlay}>
                    <View style={s.modalContainer}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Registrar Pago</Text>
                            <TouchableOpacity onPress={cerrarModalPago}>
                                <Ionicons name="close" size={24} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={s.modalResumen}>
                                <Text style={s.modalResumenLabel}>Mesa {ordenModal?.mesa_info?.numero_mesa || 'N/A'}</Text>
                                <Text style={s.modalResumenTotal}>${Number(ordenModal?.monto_total || 0).toFixed(2)}</Text>
                            </View>

                            <Text style={s.modalLabel}>Método de pago *</Text>
                            <View style={s.modalPaymentMethods}>
                                {[
                                    { key: 'efectivo', icon: 'cash-outline', label: 'Efectivo' },
                                    { key: 'tarjeta', icon: 'card-outline', label: 'Tarjeta' },
                                    { key: 'transferencia', icon: 'swap-horizontal-outline', label: 'Transferencia' },
                                    { key: 'otro', icon: 'ellipsis-horizontal-outline', label: 'Otro' },
                                ].map((metodo) => (
                                    <TouchableOpacity
                                        key={metodo.key}
                                        style={[s.modalMethodBtn, metodoPago === metodo.key && s.modalMethodActive]}
                                        onPress={() => setMetodoPago(metodo.key)}
                                    >
                                        <Ionicons
                                            name={metodo.icon as any}
                                            size={20}
                                            color={metodoPago === metodo.key ? colors.goldDark : colors.textMuted}
                                        />
                                        <Text style={[s.modalMethodText, metodoPago === metodo.key && s.modalMethodTextActive]}>
                                            {metodo.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={s.modalLabel}>Referencia / No. de transacción</Text>
                            <TextInput
                                style={s.modalInput}
                                placeholder="Ej: 1234567890"
                                placeholderTextColor={colors.textMuted}
                                value={referenciaPago}
                                onChangeText={setReferenciaPago}
                            />

                            <Text style={s.modalLabel}>Comprobante de pago (opcional)</Text>
                            <TouchableOpacity style={s.modalUploadBtn} onPress={handleSeleccionarImagen}>
                                <Ionicons name="camera-outline" size={22} color={colors.textMuted} />
                                <Text style={s.modalUploadText}>
                                    {comprobanteUri ? 'Cambiar imagen' : 'Seleccionar comprobante'}
                                </Text>
                            </TouchableOpacity>
                            {comprobanteUri && (
                                <Image source={{ uri: comprobanteUri }} style={s.modalPreview} />
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            style={[s.modalConfirmBtn, isPaying && s.actionBtnDisabled]}
                            onPress={handleCobrar}
                            disabled={isPaying}
                        >
                            {isPaying ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                                    <Text style={s.modalConfirmText}>Confirmar Pago</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            </>
        );
    }
);

const InfoRow = ({ label, value, colors }: { label: string; value: string; colors: any }) => (
    <View style={styles(colors).infoRow}>
        <Text style={styles(colors).infoLabel}>{label}</Text>
        <Text style={styles(colors).infoValue}>{value}</Text>
    </View>
);

const FALLBACK_COLORES: Record<string, string> = {
    pidiendo: '#FF9800',
    cocinando: '#F44336',
    finalizado: '#2196F3',
    pagado: '#4CAF50',
    delivery: '#9C27B0',
    eliminado: '#BDBDBD',
};

const getStatusColor = (status: string, colores: Record<string, string> = {}) => {
    return colores[status] || FALLBACK_COLORES[status] || '#EFEFEF';
};

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
    background: {
        backgroundColor: c.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    indicator: {
        backgroundColor: c.goldDark,
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
        color: c.text,
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
        backgroundColor: c.card,
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: c.border,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    infoLabel: {
        fontSize: 13,
        color: c.textMuted,
    },
    infoValue: {
        fontSize: 13,
        color: c.text,
        fontWeight: '500',
    },
    pagoSection: {
        marginBottom: 16,
    },
    pagoInfo: {
        backgroundColor: c.card,
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: c.border,
    },
    comprobanteContainer: {
        marginTop: 8,
    },
    comprobanteImg: {
        width: '100%',
        height: 180,
        borderRadius: 8,
        marginTop: 6,
    },
    pagoVacio: {
        color: c.textMuted,
        fontSize: 13,
        fontStyle: 'italic',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: c.text,
        marginBottom: 10,
    },
    loadingText: {
        textAlign: 'center',
        color: c.textMuted,
        paddingVertical: 20,
    },
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: c.card,
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: c.border,
    },
    productCardEdited: {
        borderColor: c.goldDark,
        backgroundColor: c.goldLight,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: c.text,
        marginBottom: 2,
    },
    productPrice: {
        fontSize: 12,
        color: c.textMuted,
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
        color: c.text,
        minWidth: 24,
        textAlign: 'center',
    },
    qtyTextEdited: {
        color: c.goldDark,
    },
    subtotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: c.text,
        marginLeft: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: c.border,
        paddingTop: 16,
        marginTop: 8,
        marginBottom: 20,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: c.text,
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: c.goldDark,
    },
    actionsSection: {
        gap: 10,
    },
    actionBtnPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: c.info,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    actionBtnSuccess: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: c.success,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    actionBtnCook: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: c.warning,
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
    notaSection: {
        marginTop: 12,
        marginBottom: 8,
    },
    notaSectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: c.text,
        marginBottom: 8,
    },
    notaItem: {
        marginBottom: 10,
    },
    notaProductName: {
        fontSize: 13,
        fontWeight: '600',
        color: c.textSecondary,
        marginBottom: 4,
    },
    notaInput: {
        borderWidth: 1,
        borderColor: c.gray200,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 13,
        color: c.text,
        backgroundColor: c.card,
        minHeight: 52,
    },
    notaDisplayItem: {
        flexDirection: 'row',
        backgroundColor: c.card,
        borderRadius: 8,
        padding: 10,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: c.border,
    },
    notaDisplayProduct: {
        fontSize: 13,
        fontWeight: '600',
        color: c.text,
        marginRight: 6,
    },
    notaDisplayText: {
        fontSize: 13,
        color: c.textSecondary,
        flex: 1,
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: c.overlay,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    modalContainer: {
        backgroundColor: c.background,
        borderRadius: 16,
        padding: 20,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: c.text,
    },
    modalResumen: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: c.card,
        borderRadius: 10,
        padding: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: c.border,
    },
    modalResumenLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: c.text,
    },
    modalResumenTotal: {
        fontSize: 22,
        fontWeight: 'bold',
        color: c.goldDark,
    },
    modalLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: c.text,
        marginBottom: 8,
        marginTop: 4,
    },
    modalPaymentMethods: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 16,
    },
    modalMethodBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: c.border,
        backgroundColor: c.card,
    },
    modalMethodActive: {
        borderColor: c.goldDark,
        backgroundColor: c.goldLight,
    },
    modalMethodText: {
        color: c.textMuted,
        fontWeight: '600',
        fontSize: 13,
    },
    modalMethodTextActive: {
        color: c.goldDark,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: c.text,
        backgroundColor: c.card,
        marginBottom: 16,
    },
    modalUploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: c.border,
        borderStyle: 'dashed',
        borderRadius: 10,
        paddingVertical: 16,
        justifyContent: 'center',
        backgroundColor: c.card,
    },
    modalUploadText: {
        color: c.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    modalPreview: {
        width: '100%',
        height: 160,
        borderRadius: 10,
        marginTop: 10,
    },
    modalConfirmBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: c.success,
        paddingVertical: 15,
        borderRadius: 12,
        gap: 8,
        marginTop: 20,
    },
    modalConfirmText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
});

export default DetallesOrdenesCard;
