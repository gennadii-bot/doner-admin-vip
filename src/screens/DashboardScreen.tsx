import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getDashboard } from '../api/api';
import { useAuth } from '../auth/AuthContext';
import { DashboardData } from '../types';

export const DashboardScreen = () => {
  const { logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setError(null);
    try {
      const dashboardData = await getDashboard(logout);
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.card}>
        <Text style={styles.label}>Заказы сегодня</Text>
        <Text style={styles.value}>{data?.orders_today ?? 0}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Активные заказы</Text>
        <Text style={styles.value}>{data?.active_orders ?? 0}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
  },
  error: {
    color: '#dc2626',
  },
});
