import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import StartScreen from '../screens/StartScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

/**
 * AppNavigator — 3 个一级页面
 * - 首页（StartScreen）：今日练习入口
 * - 素材库（LibraryScreen）：浏览素材
 * - 个人中心（ProfileScreen）：统计 + 设置
 *
 * Tab bar 选用文字图标，不引入额外 icon 库以保持 MVP 轻量。
 * 后续可用 @expo/vector-icons 替换。
 */
export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1E3A5F',
        tabBarInactiveTintColor: '#b2bec3',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#e9ecef',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Start"
        component={StartScreen}
        options={{
          tabBarLabel: '首页',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: '素材库',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📚</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: '我的',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
