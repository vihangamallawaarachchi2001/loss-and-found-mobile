import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { RootStackParamList } from '../navigation/types';
import { postWithFeatureFlag } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      await postWithFeatureFlag('/api/v1/auth/forgot-password', { email });
      navigation.navigate('ResetPassword', { email });
    } catch {
      setMessage('Could not send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-slate-50 px-6">
      <View className="rounded-3xl bg-white p-6">
        <Text className="text-3xl font-bold text-slate-900">Forgot Password</Text>
        <Text className="mt-2 text-base text-slate-500">
          Enter your SLIIT email to receive a reset code.
        </Text>

        <TextInput
          placeholder="University Email"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          className="mt-6 rounded-xl border border-slate-200 px-4 py-3"
        />

        {message ? <Text className="mt-4 text-sm text-red-500">{message}</Text> : null}

        <Pressable
          onPress={handleSend}
          disabled={loading}
          className="mt-6 h-12 items-center justify-center rounded-xl bg-blue-600"
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-base font-semibold text-white">Send Reset Code</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.replace('Login')} className="mt-5 items-center">
          <Text className="text-sm font-semibold text-blue-600">Back to Login</Text>
        </Pressable>
      </View>
    </View>
  );
}
