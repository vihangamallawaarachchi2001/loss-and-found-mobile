import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { RootStackParamList } from '../navigation/types';
import { resetPassword } from '../services/backend';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleReset = async () => {
    if (!email.trim() || !resetCode.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setMessage('Please fill all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      await resetPassword(email.trim(), resetCode.trim(), newPassword);
      navigation.replace('Login');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not reset password. Check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-slate-50 px-6">
      <View className="rounded-3xl bg-white p-6">
        <Text className="text-3xl font-bold text-slate-900">Reset Password</Text>
        <Text className="mt-2 text-base text-slate-500">
          Use the code sent to your email and set a new password.
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
        <TextInput
          placeholder="Reset Code"
          placeholderTextColor="#94a3b8"
          value={resetCode}
          onChangeText={setResetCode}
          className="mt-4 rounded-xl border border-slate-200 px-4 py-3"
        />
        <TextInput
          placeholder="New Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          className="mt-4 rounded-xl border border-slate-200 px-4 py-3"
        />
        <TextInput
          placeholder="Confirm New Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          className="mt-4 rounded-xl border border-slate-200 px-4 py-3"
        />

        {message ? <Text className="mt-4 text-sm text-red-500">{message}</Text> : null}

        <Pressable
          onPress={handleReset}
          disabled={loading}
          className="mt-6 h-12 items-center justify-center rounded-xl bg-blue-600"
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-base font-semibold text-white">Reset Password</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
