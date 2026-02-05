import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductEditScreen } from '../screens/ProductEditScreen';
import { ProductsScreen } from '../screens/ProductsScreen';

export type ProductsStackParamList = {
  ProductsList: undefined;
  ProductEdit: { productId?: number };
};

const Stack = createNativeStackNavigator<ProductsStackParamList>();

export const ProductsStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="ProductsList" component={ProductsScreen} options={{ title: 'Товары' }} />
    <Stack.Screen name="ProductEdit" component={ProductEditScreen} options={{ title: 'Редактирование товара' }} />
  </Stack.Navigator>
);
