/**
 * 听刻 · 英语精听训练 App
 *
 * 品牌：听刻 — "把声音刻进脑子里"
 * 方法：尚雯婕精听法（盲听 → 听写 → 跟读）
 * 设计参考: base-guide.md (Design Token) + v2-minimal/*.html (UI)
 *
 * 入口文件
 */

import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './navigation/AppNavigator';

// 开发环境忽略部分非关键 warning
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F6F8" />
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App;
