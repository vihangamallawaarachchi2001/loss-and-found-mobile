import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Text, View } from 'react-native';

import ReportForm from '../components/forms/ReportForm';
import { RootStackParamList } from '../navigation/types';
import { createItem } from '../services/backend';
import { useUserStore } from '../state/useStore';

type Props = NativeStackScreenProps<RootStackParamList, 'AddFoundItem'>;

export default function AddFoundItemScreen({ navigation }: Props) {
  const currentUser = useUserStore((state) => state.currentUser);
  const addReport = useUserStore((state) => state.addReport);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <View className="flex-1 bg-slate-50 px-5 pt-16">
      <ReportForm
        typeLabel="Found"
        submitLabel="Submit Found Report"
        submitting={submitting}
        onSubmit={async (payload) => {
          if (!currentUser?.id) {
            setMessage('Please log in again before submitting.');
            return;
          }

          try {
            setSubmitting(true);
            setMessage('');
            const created = await createItem('found', currentUser.id, payload);
            addReport('found', { ...created, reporter: currentUser });
            navigation.replace('ItemDetails', { itemId: created.id, itemType: 'found' });
          } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Could not submit found report.');
          } finally {
            setSubmitting(false);
          }
        }}
      />
      {message ? <Text className="mt-4 text-sm text-red-500">{message}</Text> : null}
      <Text className="mt-4 text-xs text-slate-500">
        Add clear details so potential owners can verify and claim outside the system.
      </Text>
    </View>
  );
}
