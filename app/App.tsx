import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * 听刻 — 把声音刻进脑子里
 *
 * 基于精听法的英语训练 App
 * 每日学习流：盲听 → 听写 → 跟读
 *
 * @see PRD: docs/PRD.md
 */
export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}
