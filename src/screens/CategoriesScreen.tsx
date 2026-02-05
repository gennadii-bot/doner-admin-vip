import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createCategory, deleteCategory, getCategories, updateCategory } from '../api/api';
import { useAuth } from '../auth/AuthContext';
import { Category } from '../types';

export const CategoriesScreen = () => {
  const { logout } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setError(null);
    try {
      const list = await getCategories(logout);
      setCategories(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить категории');
    } finally {
      setLoading(false);
    }
  }, [logout]);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreate = async () => {
    if (!newName.trim()) {
      setError('Введите название категории');
      return;
    }

    setError(null);
    try {
      await createCategory({ name: newName.trim(), description: newDescription.trim() }, logout);
      setNewName('');
      setNewDescription('');
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать категорию');
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditingDescription(category.description || '');
  };

  const handleUpdate = async () => {
    if (!editingId) {
      return;
    }

    setError(null);
    try {
      await updateCategory(editingId, { name: editingName.trim(), description: editingDescription.trim() }, logout);
      setEditingId(null);
      setEditingName('');
      setEditingDescription('');
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить категорию');
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      await deleteCategory(id, logout);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить категорию');
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
      <Text style={styles.sectionTitle}>Новая категория</Text>
      <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="Название" />
      <TextInput style={styles.input} value={newDescription} onChangeText={setNewDescription} placeholder="Описание" />
      <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
        <Text style={styles.addButtonText}>Создать категорию</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {editingId === item.id ? (
              <>
                <TextInput style={styles.input} value={editingName} onChangeText={setEditingName} />
                <TextInput style={styles.input} value={editingDescription} onChangeText={setEditingDescription} />
                <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
                  <Text style={styles.saveButtonText}>Сохранить</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.title}>{item.name}</Text>
                <Text>{item.description || '—'}</Text>
                <View style={styles.row}>
                  <TouchableOpacity style={styles.editButton} onPress={() => startEdit(item)}>
                    <Text style={styles.editButtonText}>Изменить</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteButtonText}>Удалить</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
        ListEmptyComponent={<Text>Категории отсутствуют</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, padding: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: { color: '#fff', fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  title: { fontWeight: '700', marginBottom: 4 },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  editButton: { backgroundColor: '#2563eb', borderRadius: 6, padding: 8 },
  editButtonText: { color: '#fff' },
  deleteButton: { backgroundColor: '#dc2626', borderRadius: 6, padding: 8 },
  deleteButtonText: { color: '#fff' },
  saveButton: { backgroundColor: '#111827', borderRadius: 6, padding: 10, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: '700' },
  error: { color: '#dc2626', marginBottom: 8 },
});
