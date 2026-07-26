import { BASE_URL } from '@/app/api/apiConfig';
import { eliminarDetalleOrden, patchDetalleOrden } from '@/app/api/detallesOrdenesApi';
import { cambiarEstadoOrden, registrarPago } from '@/app/api/ordenesApi';
import Ionicons from '@expo/vector-icons/Ionicons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as SecureStore from 'expo-secure-store';
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
};

const DetallesOrdenesCard = forwardRef<BottomSheet, DetallesOrdenesCardProps>(
    ({ orden, role, onDismiss, onEstadoCambiado }, ref) => {
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
                const token = await SecureStore.getItemAsync('jwt_access');
                const headers = { 'Authorization': `Bearer ${token}` };

                const [detallesRes, productosRes] = await Promise.all([
                    fetch(`${BASE_URL}/detalles/?orden_fk=${orden.id}`, { headers }),
                    fetch(`${BASE_URL}/productos/`, { headers })
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
                    const notasIniciales = new Map<string, string>();
                    detallesConInfo.forEach((d: DetalleOrden) => {
                        if (d.nota) notasIniciales.set(d.id, d.nota);
                    });
                    setNotasEditadas(notasIniciales);
                }
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
                            await cambiarEstadoOrden(orden!.id, 'cocinando');
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
                backgroundStyle={styles.background}
                handleIndicatorStyle={styles.indicator}
            >
                <BottomSheetScrollView contentContainerStyle={styles.content}>
                    {!orden ? (
                        <Text style={styles.loadingText}>Selecciona una orden</Text>
                    ) : (
                    <>
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

                    <View style={styles.infoSection}>
                        <InfoRow label="Cliente" value={orden.cliente_info?.first_name || orden.cliente_info?.email || 'N/A'} />
                        {orden.mesero_info && (
                            <InfoRow label="Mesero" value={orden.mesero_info.first_name || 'N/A'} />
                        )}
                        <InfoRow label="Fecha" value={new Date(orden.fecha_creacion).toLocaleString()} />
                    </View>

                    {/* Info de pago solo para admin */}
                    {role === 'admin' && (
                        <View style={styles.pagoSection}>
                            <Text style={styles.sectionTitle}>Información de Pago</Text>
                            <View style={styles.pagoInfo}>
                                {orden.metodo_pago ? (
                                    <>
                                        <InfoRow label="Método" value={orden.metodo_pago.charAt(0).toUpperCase() + orden.metodo_pago.slice(1)} />
                                        {orden.referencia_pago ? (
                                            <InfoRow label="Referencia" value={orden.referencia_pago} />
                                        ) : null}
                                        {orden.comprobante_pago ? (
                                            <View style={styles.comprobanteContainer}>
                                                <Text style={styles.infoLabel}>Comprobante</Text>
                                                <Image source={{ uri: orden.comprobante_pago }} style={styles.comprobanteImg} />
                                            </View>
                                        ) : null}
                                    </>
                                ) : (
                                    <Text style={styles.pagoVacio}>Sin información de pago</Text>
                                )}
                            </View>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>Productos</Text>
                    {isLoading ? (
                        <Text style={styles.loadingText}>Cargando detalles...</Text>
                    ) : (
                        detalles.map(detalle => {
                            const cantidadActual = detallesEditados.get(detalle.id) ?? detalle.cantidad;
                            const editado = detallesEditados.has(detalle.id);
                            const notaActual = notasEditadas.get(detalle.id) ?? detalle.nota ?? '';

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

                    {role === 'mesero' && orden.estatus === 'pidiendo' && (
                        <View style={styles.notaSection}>
                            <Text style={styles.notaSectionTitle}>Notas de productos</Text>
                            {detalles.map(detalle => (
                                <View key={detalle.id} style={styles.notaItem}>
                                    <Text style={styles.notaProductName}>
                                        {detalle.producto_info?.nombre || 'Producto'}
                                    </Text>
                                    <TextInput
                                        style={styles.notaInput}
                                        placeholder="Ej: sin cebolla, poco cocido..."
                                        placeholderTextColor="#B0B0B0"
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
                        <View style={styles.notaSection}>
                            <Text style={styles.notaSectionTitle}>Notas</Text>
                            {detalles.filter(d => d.nota).map(detalle => (
                                <View key={detalle.id} style={styles.notaDisplayItem}>
                                    <Text style={styles.notaDisplayProduct}>
                                        {detalle.producto_info?.nombre || 'Producto'}:
                                    </Text>
                                    <Text style={styles.notaDisplayText}>{detalle.nota}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalAmount}>${Number(orden.monto_total || 0).toFixed(2)}</Text>
                    </View>

                    <View style={styles.actionsSection}>
                        {role === 'cajero' && (orden.estatus === 'cocinando' || orden.estatus === 'finalizado') && (
                            <TouchableOpacity style={styles.actionBtnSuccess} onPress={handleAbrirCobro}>
                                <Ionicons name="cash-outline" size={20} color="#fff" />
                                <Text style={styles.actionBtnText}>Cobrar</Text>
                            </TouchableOpacity>
                        )}

                        {role === 'cajero' && orden.estatus === 'cocinando' && (
                            <TouchableOpacity style={styles.actionBtnPrimary} onPress={handleDescargarPDF}>
                                <Ionicons name="print-outline" size={20} color="#fff" />
                                <Text style={styles.actionBtnText}>Imprimir Comanda</Text>
                            </TouchableOpacity>
                        )}

                        {role === 'mesero' && orden.estatus === 'pidiendo' && (
                            <>
                                {hayCambiosMesero && (
                                    <TouchableOpacity
                                        style={[styles.actionBtnPrimary, isLoading && styles.actionBtnDisabled]}
                                        onPress={handleEnviarNotasMesero}
                                        disabled={isLoading}
                                    >
                                        <Ionicons name="save-outline" size={20} color="#fff" />
                                        <Text style={styles.actionBtnText}>
                                            {isLoading ? 'Guardando...' : 'Guardar Notas'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={[styles.actionBtnCook, isLoading && styles.actionBtnDisabled]}
                                    onPress={handleCocinar}
                                    disabled={isLoading}
                                >
                                    <Ionicons name="flame-outline" size={20} color="#fff" />
                                    <Text style={styles.actionBtnText}>Cocinar</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {role === 'mesero' && orden.estatus === 'cocinando' && (
                            <TouchableOpacity style={styles.actionBtnSuccess} onPress={handleFinalizarOrden}>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                <Text style={styles.actionBtnText}>Finalizado</Text>
                            </TouchableOpacity>
                        )}

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

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={cerrarModalPago}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Registrar Pago</Text>
                            <TouchableOpacity onPress={cerrarModalPago}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.modalResumen}>
                                <Text style={styles.modalResumenLabel}>Mesa {ordenModal?.mesa_info?.numero_mesa || 'N/A'}</Text>
                                <Text style={styles.modalResumenTotal}>${Number(ordenModal?.monto_total || 0).toFixed(2)}</Text>
                            </View>

                            <Text style={styles.modalLabel}>Método de pago *</Text>
                            <View style={styles.modalPaymentMethods}>
                                {[
                                    { key: 'efectivo', icon: 'cash-outline', label: 'Efectivo' },
                                    { key: 'tarjeta', icon: 'card-outline', label: 'Tarjeta' },
                                    { key: 'transferencia', icon: 'swap-horizontal-outline', label: 'Transferencia' },
                                    { key: 'otro', icon: 'ellipsis-horizontal-outline', label: 'Otro' },
                                ].map((metodo) => (
                                    <TouchableOpacity
                                        key={metodo.key}
                                        style={[styles.modalMethodBtn, metodoPago === metodo.key && styles.modalMethodActive]}
                                        onPress={() => setMetodoPago(metodo.key)}
                                    >
                                        <Ionicons
                                            name={metodo.icon as any}
                                            size={20}
                                            color={metodoPago === metodo.key ? '#D4AF37' : '#8E8E8E'}
                                        />
                                        <Text style={[styles.modalMethodText, metodoPago === metodo.key && styles.modalMethodTextActive]}>
                                            {metodo.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.modalLabel}>Referencia / No. de transacción</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Ej: 1234567890"
                                placeholderTextColor="#8E8E8E"
                                value={referenciaPago}
                                onChangeText={setReferenciaPago}
                            />

                            <Text style={styles.modalLabel}>Comprobante de pago (opcional)</Text>
                            <TouchableOpacity style={styles.modalUploadBtn} onPress={handleSeleccionarImagen}>
                                <Ionicons name="camera-outline" size={22} color="#666" />
                                <Text style={styles.modalUploadText}>
                                    {comprobanteUri ? 'Cambiar imagen' : 'Seleccionar comprobante'}
                                </Text>
                            </TouchableOpacity>
                            {comprobanteUri && (
                                <Image source={{ uri: comprobanteUri }} style={styles.modalPreview} />
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.modalConfirmBtn, isPaying && styles.actionBtnDisabled]}
                            onPress={handleCobrar}
                            disabled={isPaying}
                        >
                            {isPaying ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                                    <Text style={styles.modalConfirmText}>Confirmar Pago</Text>
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

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

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
    pagoSection: {
        marginBottom: 16,
    },
    pagoInfo: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#EFEFEF',
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
        color: '#8E8E8E',
        fontSize: 13,
        fontStyle: 'italic',
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
    actionBtnCook: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E65100',
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
        color: '#262626',
        marginBottom: 8,
    },
    notaItem: {
        marginBottom: 10,
    },
    notaProductName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#555',
        marginBottom: 4,
    },
    notaInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 13,
        color: '#262626',
        backgroundColor: '#FFF',
        minHeight: 52,
    },
    notaDisplayItem: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 10,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    notaDisplayProduct: {
        fontSize: 13,
        fontWeight: '600',
        color: '#262626',
        marginRight: 6,
    },
    notaDisplayText: {
        fontSize: 13,
        color: '#666',
        flex: 1,
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    modalContainer: {
        backgroundColor: '#FAFAFA',
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
        color: '#262626',
    },
    modalResumen: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    modalResumenLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#262626',
    },
    modalResumenTotal: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#D4AF37',
    },
    modalLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#262626',
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
        borderColor: '#EFEFEF',
        backgroundColor: '#FFF',
    },
    modalMethodActive: {
        borderColor: '#D4AF37',
        backgroundColor: '#FFF8E1',
    },
    modalMethodText: {
        color: '#8E8E8E',
        fontWeight: '600',
        fontSize: 13,
    },
    modalMethodTextActive: {
        color: '#D4AF37',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#EFEFEF',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#262626',
        backgroundColor: '#FFF',
        marginBottom: 16,
    },
    modalUploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        borderStyle: 'dashed',
        borderRadius: 10,
        paddingVertical: 16,
        justifyContent: 'center',
        backgroundColor: '#FFF',
    },
    modalUploadText: {
        color: '#666',
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
        backgroundColor: '#4CAF50',
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
