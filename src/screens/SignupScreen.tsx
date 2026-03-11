import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { RootStackParamList } from '../navigation/types';
import { postWithFeatureFlag } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setMessage('Please fill all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      await postWithFeatureFlag('/api/v1/auth/signup', {
        fullName: name,
        email,
        password,
      });
      navigation.replace('Login');
    } catch {
      setMessage('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-slate-50 px-6">
      <View className="rounded-3xl bg-white p-6">
        <Text className="text-3xl font-bold text-slate-900">Create Account</Text>
        <Text className="mt-2 text-base text-slate-500">
          Join SLIIT Lost &amp; Found community.
        </Text>

        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#94a3b8"
          value={name}
          onChangeText={setName}
          className="mt-6 rounded-xl border border-slate-200 px-4 py-3"
        />
        <TextInput
          placeholder="University Email"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          className="mt-4 rounded-xl border border-slate-200 px-4 py-3"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          className="mt-4 rounded-xl border border-slate-200 px-4 py-3"
        />
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          className="mt-4 rounded-xl border border-slate-200 px-4 py-3"
        />

        {message ? <Text className="mt-4 text-sm text-red-500">{message}</Text> : null}

        <Pressable
          onPress={handleSignup}
          disabled={loading}
          className="mt-6 h-12 items-center justify-center rounded-xl bg-blue-600"
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-base font-semibold text-white">Sign Up</Text>
          )}
        </Pressable>

        <View className="mt-6 flex-row items-center justify-center gap-1">
          <Text className="text-sm text-slate-500">Already have an account?</Text>
          <Pressable onPress={() => navigation.replace('Login')}>
            <Text className="text-sm font-semibold text-blue-600">Login</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
