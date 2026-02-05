import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getOrderById, updateOrderStatus } from '../api/api';
import { useAuth } from '../auth/AuthContext';
import { OrdersStackParamList } from '../navigation/OrdersStackNavigator';
import { Order, OrderStatus } from '../types';

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrderDetails'>;

const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  pending: ['cooking', 'cancelled'],
  cooking: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export const OrderDetailsScreen: React.FC<Props> = ({ route }) => {
  const { orderId } = route.params;
  const { logout } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    setError(null);
    try {
      const data = await getOrderById(orderId, logout);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить заказ');
    } finally {
      setLoading(false);
    }
  }, [logout, orderId]);

  React.useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleChangeStatus = async (status: OrderStatus) => {
    if (!order) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await updateOrderStatus(order.id, status, logout);
      setOrder(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить статус');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>Заказ не найден</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Заказ #{order.id}</Text>
      <Text>Статус: {order.status}</Text>
      <Text>Клиент: {order.customer_name || '—'}</Text>
      <Text>Email: {order.customer_email || '—'}</Text>
      <Text>Сумма: {order.total ?? 0}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        {nextStatuses[order.status].map((status) => (
          <TouchableOpacity
            key={status}
            style={styles.button}
            onPress={() => handleChangeStatus(status)}
            disabled={saving}>
            <Text style={styles.buttonText}>{saving ? 'Сохранение...' : status}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, padding: 16, gap: 8 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  actions: { marginTop: 12, gap: 8 },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: '#fff',
    textTransform: 'capitalize',
    fontWeight: '700',
  },
  error: { color: '#dc2626' },
});
