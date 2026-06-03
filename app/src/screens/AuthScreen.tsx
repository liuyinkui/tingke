import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login');

  return mode === 'login' ? (
    <LoginScreen onSwitchToRegister={() => setMode('register')} />
  ) : (
    <RegisterScreen onSwitchToLogin={() => setMode('login')} />
  );
}
