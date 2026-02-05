import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { deleteProduct, getProducts } from '../api/api';
import { useAuth } from '../auth/AuthContext';
import { ProductsStackParamList } from '../navigation/ProductsStackNavigator';
import { Product } from '../types';

type Props = NativeStackScreenProps<ProductsStackParamList, 'ProductsList'>;

export const ProductsScreen: React.FC<Props> = ({ navigation }) => {
  const { logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setError(null);
    try {
      const list = await getProducts(logout);
      setProducts(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить товары');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout]);

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      await deleteProduct(id, logout);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить товар');
    }
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
      <TouchableOpacity style={styles.primary} onPress={() => navigation.navigate('ProductEdit', {})}>
        <Text style={styles.primaryText}>+ Создать товар</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProducts(); }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <Text>Цена: {item.price}</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.secondary} onPress={() => navigation.navigate('ProductEdit', { productId: item.id })}>
                <Text style={styles.secondaryText}>Редактировать</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.danger} onPress={() => handleDelete(item.id)}>
                <Text style={styles.dangerText}>Удалить</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>Товары отсутствуют</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, padding: 12 },
  primary: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryText: { color: '#fff', fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  title: { fontWeight: '700', marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  secondary: { backgroundColor: '#2563eb', padding: 8, borderRadius: 6 },
  secondaryText: { color: '#fff' },
  danger: { backgroundColor: '#dc2626', padding: 8, borderRadius: 6 },
  dangerText: { color: '#fff' },
  error: { color: '#dc2626', marginBottom: 8 },
});
