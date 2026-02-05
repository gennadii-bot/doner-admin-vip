import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getOrders } from '../api/api';
import { useAuth } from '../auth/AuthContext';
import { OrdersStackParamList } from '../navigation/OrdersStackNavigator';
import { Order } from '../types';

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrdersList'>;

export const OrdersScreen: React.FC<Props> = ({ navigation }) => {
  const { logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setError(null);
    try {
      const list = await getOrders(logout);
      setOrders(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить заказы');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout]);

  React.useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}>
            <Text style={styles.title}>Заказ #{item.id}</Text>
            <Text>Статус: {item.status}</Text>
            <Text>Сумма: {item.total ?? 0}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>Нет заказов</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, padding: 12 },
  item: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  title: { fontWeight: '700', marginBottom: 4 },
  error: { color: '#dc2626', marginBottom: 8 },
});
