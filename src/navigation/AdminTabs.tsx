import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AdminTabParamList } from '../types';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LogoutScreen } from '../screens/LogoutScreen';
import { OrdersStackNavigator } from './OrdersStackNavigator';
import { ProductsStackNavigator } from './ProductsStackNavigator';

const Tab = createBottomTabNavigator<AdminTabParamList>();

export const AdminTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
    <Tab.Screen name="Orders" component={OrdersStackNavigator} options={{ headerShown: false, title: 'Заказы' }} />
    <Tab.Screen name="Products" component={ProductsStackNavigator} options={{ headerShown: false, title: 'Товары' }} />
    <Tab.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Категории' }} />
    <Tab.Screen name="Logout" component={LogoutScreen} options={{ title: 'Выход' }} />
  </Tab.Navigator>
);
