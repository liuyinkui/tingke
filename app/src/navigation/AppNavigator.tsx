import React, { useState, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import AuthScreen from '../screens/AuthScreen';
import StartScreen from '../screens/StartScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WordBookScreen from '../screens/WordBookScreen';
import LearningFlowContainer from '../components/LearningFlowContainer';

const Tab = createBottomTabNavigator();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' }}>
      <ActivityIndicator size="large" color="#1E3A5F" />
    </View>
  );
}

/**
 * Profile container
 */
function ProfileContainer() {
  const [showSettings, setShowSettings] = useState(false);
  const [showWordBook, setShowWordBook] = useState(false);

  if (showSettings) {
    return <SettingsScreen onBack={() => setShowSettings(false)} />;
  }

  if (showWordBook) {
    return <WordBookScreen onBack={() => setShowWordBook(false)} />;
  }

  return (
    <ProfileScreen
      onNavigateToSettings={() => setShowSettings(true)}
      onNavigateToWordBook={() => setShowWordBook(true)}
    />
  );
}

/**
 * Main content with tab navigation
 */
function MainTabs({ onStartLearning }: { onStartLearning: (materialId?: string) => void }) {
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
        children={() => <StartScreen onStartLearning={onStartLearning} />}
        options={{
          tabBarLabel: '首页',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Library"
        options={{
          tabBarLabel: '素材库',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📚</Text>
          ),
        }}
      >
        {() => <LibraryScreen onSelectMaterial={onStartLearning} />}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        component={ProfileContainer}
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

/**
 * AppNavigator — 3 个一级页面 + 认证流程 + 学习流
 */
export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [inLearningFlow, setInLearningFlow] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | undefined>(undefined);

  const handleStartLearning = useCallback((materialId?: string) => {
    setSelectedMaterialId(materialId);
    setInLearningFlow(true);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (inLearningFlow) {
    return (
      <LearningFlowContainer
        onExit={() => setInLearningFlow(false)}
        materialId={selectedMaterialId}
      />
    );
  }

  return <MainTabs onStartLearning={() => handleStartLearning()} />;
}
