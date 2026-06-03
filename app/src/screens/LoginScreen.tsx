import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onSwitchToRegister: () => void;
}

export default function LoginScreen({ onSwitchToRegister }: Props) {
  const { login } = useAuth();
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      Alert.alert('提示', '请输入昵称');
      return;
    }
    setSubmitting(true);
    try {
      await login(trimmed);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || '登录失败，请重试';
      Alert.alert('登录失败', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <View style={styles.content}>
        {/* Brand */}
        <Text style={styles.brand}>听刻</Text>
        <Text style={styles.tagline}>把声音刻进脑子里</Text>

        {/* Input */}
        <TextInput
          style={styles.input}
          placeholder="输入昵称登录"
          placeholderTextColor="#b2bec3"
          value={nickname}
          onChangeText={setNickname}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={handleLogin}
        />

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={submitting}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {submitting ? '登录中...' : '登录'}
          </Text>
        </TouchableOpacity>

        {/* Switch to Register */}
        <TouchableOpacity onPress={onSwitchToRegister} style={styles.switchButton}>
          <Text style={styles.switchText}>
            还没有账号？
            <Text style={styles.switchHighlight}> 注册</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  brand: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 48,
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2D3436',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#1E3A5F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    paddingVertical: 8,
  },
  switchText: {
    fontSize: 14,
    color: '#636e72',
  },
  switchHighlight: {
    color: '#1E3A5F',
    fontWeight: '600',
  },
});
