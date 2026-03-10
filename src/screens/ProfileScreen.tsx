import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import EmptyState from '../components/common/EmptyState';
import SectionTitle from '../components/common/SectionTitle';
import { NATIVE_ENV } from '../services/api';
import { useUserStore } from '../state/useStore';
import { validateProfile } from '../utils/validation';

export default function ProfileScreen() {
  const user = useUserStore((state) => state.currentUser);
  const updateCurrentUserProfile = useUserStore((state) => state.updateCurrentUserProfile);
  const lostItems = useUserStore((state) => state.lostItems);
  const foundItems = useUserStore((state) => state.foundItems);

  const lostByUser = useMemo(() => {
    if (!user) {
      return [];
    }

    return lostItems.filter((item) => item.reporter.email === user.email);
  }, [lostItems, user]);

  const foundByUser = useMemo(() => {
    if (!user) {
      return [];
    }

    return foundItems.filter((item) => item.reporter.email === user.email);
  }, [foundItems, user]);

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');

  const { fullNameError, phoneError } = useMemo(() => validateProfile(fullName, phone), [fullName, phone]);

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 20, paddingTop: 62 }}>
      <SectionTitle title="Profile" subtitle="Your account and submissions" />

      <View className="mt-5 rounded-2xl bg-white p-5">
        <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</Text>
        <Text className="mt-1 text-base text-slate-900">{user?.email ?? 'Not signed in'}</Text>

        <Text className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Full Name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Your full name"
          placeholderTextColor="#94a3b8"
          className="mt-2 rounded-xl border border-slate-200 px-4 py-3"
        />
        {fullNameError ? <Text className="mt-1 text-xs text-red-500">{fullNameError}</Text> : null}

        <Text className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="07x xxx xxxx"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          className="mt-2 rounded-xl border border-slate-200 px-4 py-3"
        />
        {phoneError ? <Text className="mt-1 text-xs text-red-500">{phoneError}</Text> : null}

        <Text
          onPress={() => {
            if (!fullNameError && !phoneError) {
              updateCurrentUserProfile({ fullName, phone });
            }
          }}
          className="mt-5 rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white"
        >
          Save Profile
        </Text>
      </View>

      <View className="mt-4 rounded-2xl bg-white p-5">
        <Text className="text-base font-semibold text-slate-900">Environment</Text>
        <Text className="mt-2 text-slate-600">NATIVE_ENV = {NATIVE_ENV}</Text>
      </View>

      <View className="mt-4 rounded-2xl bg-white p-5">
        <Text className="text-base font-semibold text-slate-900">My Lost Submissions</Text>
        {lostByUser.length === 0 ? (
          <View className="mt-3">
            <EmptyState title="No lost submissions" subtitle="Your submitted lost items will appear here." />
          </View>
        ) : (
          lostByUser.map((item) => (
            <Text key={item.id} className="mt-2 text-slate-700">• {item.title} ({item.status})</Text>
          ))
        )}
      </View>

      <View className="mt-4 rounded-2xl bg-white p-5">
        <Text className="text-base font-semibold text-slate-900">My Found Submissions</Text>
        {foundByUser.length === 0 ? (
          <View className="mt-3">
            <EmptyState title="No found submissions" subtitle="Your submitted found items will appear here." />
          </View>
        ) : (
          foundByUser.map((item) => (
            <Text key={item.id} className="mt-2 text-slate-700">• {item.title} ({item.status})</Text>
          ))
        )}
      </View>
    </ScrollView>
  );
}
