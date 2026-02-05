import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { AdminTabs } from './AdminTabs';
import { AuthStack } from './AuthStack';

export const AppNavigator = () => {
  const { authState } = useAuth();

  if (authState.loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <NavigationContainer>{authState.token ? <AdminTabs /> : <AuthStack />}</NavigationContainer>;
};
