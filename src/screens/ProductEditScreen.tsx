import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createProduct, getProducts, updateProduct } from '../api/api';
import { useAuth } from '../auth/AuthContext';
import { ProductsStackParamList } from '../navigation/ProductsStackNavigator';

type Props = NativeStackScreenProps<ProductsStackParamList, 'ProductEdit'>;

export const ProductEditScreen: React.FC<Props> = ({ route, navigation }) => {
  const productId = route.params?.productId;
  const { logout } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState<boolean>(!!productId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    setError(null);
    try {
      const list = await getProducts(logout);
      const current = list.find((item) => item.id === productId);
      if (current) {
        setName(current.name);
        setDescription(current.description || '');
        setPrice(String(current.price));
        setCategoryId(current.category_id ? String(current.category_id) : '');
        setIsActive(current.is_active ?? true);
      } else {
        setError('Товар не найден');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить товар');
    } finally {
      setLoading(false);
    }
  }, [logout, productId]);

  React.useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const parsedPrice = Number(price);
    const parsedCategoryId = categoryId ? Number(categoryId) : undefined;

    if (!name.trim() || Number.isNaN(parsedPrice)) {
      setError('Заполните имя товара и корректную цену');
      setSaving(false);
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      category_id: parsedCategoryId,
      is_active: isActive,
    };

    try {
      if (productId) {
        await updateProduct(productId, payload, logout);
      } else {
        await createProduct(payload, logout);
      }
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить товар');
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Название</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Название товара" />

      <Text style={styles.label}>Описание</Text>
      <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} multiline />

      <Text style={styles.label}>Цена</Text>
      <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />

      <Text style={styles.label}>ID категории</Text>
      <TextInput style={styles.input} value={categoryId} onChangeText={setCategoryId} keyboardType="numeric" />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Активен</Text>
        <Switch value={isActive} onValueChange={setIsActive} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Сохранение...' : 'Сохранить'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: 16, gap: 8 },
  label: { fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700' },
  error: { color: '#dc2626', marginTop: 8 },
});
