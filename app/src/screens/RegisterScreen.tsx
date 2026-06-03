import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onSwitchToLogin: () => void;
}

export default function RegisterScreen({ onSwitchToLogin }: Props) {
  const { register } = useAuth();
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      Alert.alert('提示', '请输入昵称');
      return;
    }
    if (trimmed.length > 20) {
      Alert.alert('提示', '昵称不能超过20个字符');
      return;
    }
    setSubmitting(true);
    try {
      await register(trimmed);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || '注册失败，请重试';
      Alert.alert('注册失败', msg);
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
        <Text style={styles.tagline}>你的专属精听教练</Text>

        {/* Input */}
        <TextInput
          style={styles.input}
          placeholder="给自己起个昵称"
          placeholderTextColor="#b2bec3"
          value={nickname}
          onChangeText={setNickname}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={handleRegister}
          maxLength={20}
        />

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={submitting}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {submitting ? '注册中...' : '注册并开始练习'}
          </Text>
        </TouchableOpacity>

        {/* Switch to Login */}
        <TouchableOpacity onPress={onSwitchToLogin} style={styles.switchButton}>
          <Text style={styles.switchText}>
            已有账号？
            <Text style={styles.switchHighlight}> 登录</Text>
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
