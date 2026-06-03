import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import AuthScreen from '../screens/AuthScreen';
import StartScreen from '../screens/StartScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' }}>
      <ActivityIndicator size="large" color="#1E3A5F" />
    </View>
  );
}

/**
 * AppNavigator — 3 个一级页面 + 认证流程
 *
 * 未登录时显示 AuthScreen（登录/注册）
 * 登录后显示 Bottom Tab 导航
 */
export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

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
