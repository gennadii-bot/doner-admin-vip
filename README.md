# DONER Admin Mobile (Expo + React Native + TypeScript)

## Запуск

```bash
npm install
npx expo start
```

## Структура

```text
.
├── App.tsx
├── app.json
├── package.json
├── tsconfig.json
└── src
    ├── api
    │   └── api.ts
    ├── auth
    │   └── AuthContext.tsx
    ├── navigation
    │   ├── AdminTabs.tsx
    │   ├── AppNavigator.tsx
    │   ├── AuthStack.tsx
    │   ├── OrdersStackNavigator.tsx
    │   └── ProductsStackNavigator.tsx
    ├── screens
    │   ├── CategoriesScreen.tsx
    │   ├── DashboardScreen.tsx
    │   ├── LoginScreen.tsx
    │   ├── LogoutScreen.tsx
    │   ├── OrderDetailsScreen.tsx
    │   ├── OrdersScreen.tsx
    │   ├── ProductEditScreen.tsx
    │   └── ProductsScreen.tsx
    └── types
        └── index.ts
```
