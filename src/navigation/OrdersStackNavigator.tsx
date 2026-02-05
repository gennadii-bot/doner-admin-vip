import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OrderDetailsScreen } from '../screens/OrderDetailsScreen';
import { OrdersScreen } from '../screens/OrdersScreen';

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetails: { orderId: number };
};

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export const OrdersStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="OrdersList" component={OrdersScreen} options={{ title: 'Список заказов' }} />
    <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: 'Детали заказа' }} />
  </Stack.Navigator>
);
