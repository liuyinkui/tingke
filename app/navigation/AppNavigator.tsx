/**
 * AppNavigator — 底部 Tab 导航 + 学习流 Stack 导航
 *
 * 使用 @react-navigation 实现:
 * - 底部 Tab: 首页 | 素材库 | 统计 | 我的
 * - 学习流 Stack: 盲听 → 听写 → 跟读 → 完成页
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { ListenScreen } from '../screens/ListenScreen';
import { DictationScreen } from '../screens/DictationScreen';
import { ShadowingScreen } from '../screens/ShadowingScreen';
import { CompleteScreen } from '../screens/CompleteScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { colors, fontSize } from '../theme';

// —— 导航参数类型 ——

export type ListenFlowParams = {
  Listen: { materialId: string };
  Dictation: { materialId: string };
  Shadowing: { materialId: string };
  Complete: { materialId: string; accuracy: number; streak: number };
};

// —— Tab 图标组件 ——
const TabIcon: React.FC<{ label: string; icon: string; focused: boolean }> = ({
  label,
  icon,
  focused,
}) => (
  <View style={tabIconStyles.container}>
    <Text style={tabIconStyles.icon}>{icon}</Text>
    <Text style={[tabIconStyles.label, focused && tabIconStyles.labelActive]}>{label}</Text>
  </View>
);

const tabIconStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 1,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: fontSize.captionM,
    color: colors.textTertiary,
  },
  labelActive: {
    color: colors.brand,
  },
});

// —— 占位页面 ——
const StatsPlaceholder: React.FC = () => (
  <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ fontSize: fontSize.displayS, color: colors.textTertiary }}>📊</Text>
    <Text style={{ fontSize: fontSize.bodyS, color: colors.textSecondary, marginTop: 8 }}>统计（即将上线）</Text>
  </View>
);

const ProfilePlaceholder: React.FC = () => (
  <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ fontSize: fontSize.displayS, color: colors.textTertiary }}>👤</Text>
    <Text style={{ fontSize: fontSize.bodyS, color: colors.textSecondary, marginTop: 8 }}>我的（即将上线）</Text>
  </View>
);

// —— 首页 Stack（主页 + 学习流） ——
const HomeStack = createNativeStackNavigator();

const HomeStackNavigator: React.FC = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen
      name="Listen"
      component={ListenScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <HomeStack.Screen
      name="Dictation"
      component={DictationScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <HomeStack.Screen
      name="Shadowing"
      component={ShadowingScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <HomeStack.Screen
      name="Complete"
      component={CompleteScreen}
      options={{ animation: 'slide_from_right', gestureEnabled: false }}
    />
  </HomeStack.Navigator>
);

// —— 素材库 Stack ——
const LibraryStack = createNativeStackNavigator();

const LibraryStackNavigator: React.FC = () => (
  <LibraryStack.Navigator screenOptions={{ headerShown: false }}>
    <LibraryStack.Screen name="LibraryMain" component={LibraryScreen} />
    <LibraryStack.Screen
      name="Listen"
      component={ListenScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <LibraryStack.Screen
      name="Dictation"
      component={DictationScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <LibraryStack.Screen
      name="Shadowing"
      component={ShadowingScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <LibraryStack.Screen
      name="Complete"
      component={CompleteScreen}
      options={{ animation: 'slide_from_right', gestureEnabled: false }}
    />
  </LibraryStack.Navigator>
);

// —— 底部 Tab 导航 ——
const Tab = createBottomTabNavigator();

const TabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        height: 64,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        paddingBottom: 8,
        paddingTop: 4,
      },
      tabBarShowLabel: false,
    }}
  >
    <Tab.Screen
      name="HomeTab"
      component={HomeStackNavigator}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon label="首页" icon="🏠" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="LibraryTab"
      component={LibraryStackNavigator}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon label="素材" icon="📚" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="StatsTab"
      component={StatsPlaceholder}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon label="统计" icon="📊" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfilePlaceholder}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon label="我的" icon="👤" focused={focused} />
        ),
      }}
    />
  </Tab.Navigator>
);

// —— 根导航容器 ——
export const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <TabNavigator />
  </NavigationContainer>
);
