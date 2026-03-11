import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { RootStackParamList } from '../navigation/types';
import { login } from '../services/backend';
import { useUserStore } from '../state/useStore';

const ONBOARDING_SEEN_KEY = 'hasSeenOnboarding';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const setSessionUser = useUserStore((state) => state.setSessionUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Email and password are required.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const user = await login(email.trim(), password);
      setSessionUser(user);
      await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
      navigation.replace('Home');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-slate-50 px-6">
      <View className="rounded-3xl bg-white p-6 shadow-sm">
        <Text className="text-3xl font-bold text-slate-900">Welcome Back</Text>
        <Text className="mt-2 text-base text-slate-500">
          Login to track lost items in SLIIT.
        </Text>

        <TextInput
          placeholder="University Email"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          className="mt-6 rounded-xl border border-slate-200 px-4 py-3 text-slate-900"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          className="mt-4 rounded-xl border border-slate-200 px-4 py-3 text-slate-900"
        />

        <Pressable
          onPress={() => navigation.navigate('ForgotPassword')}
          className="mt-4 self-end"
        >
          <Text className="text-sm font-semibold text-blue-600">Forgot Password?</Text>
        </Pressable>

        {errorMessage ? (
          <Text className="mt-4 text-sm font-medium text-red-500">{errorMessage}</Text>
        ) : null}

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          className="mt-6 h-12 items-center justify-center rounded-xl bg-blue-600"
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-base font-semibold text-white">Login</Text>
          )}
        </Pressable>

        <View className="mt-6 flex-row items-center justify-center gap-1">
          <Text className="text-sm text-slate-500">New to the app?</Text>
          <Pressable onPress={() => navigation.navigate('Signup')}>
            <Text className="text-sm font-semibold text-blue-600">Create Account</Text>
          </Pressable>
        </View>
      </View>

      <Text className="mt-6 text-center text-xs leading-5 text-slate-400">
        For SLIIT campus item reporting and owner claim requests.
      </Text>
    </View>
  );
}