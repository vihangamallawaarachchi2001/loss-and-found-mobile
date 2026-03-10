import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';

import ReportForm from '../components/forms/ReportForm';
import { RootStackParamList } from '../navigation/types';
import { useUserStore } from '../state/useStore';

type Props = NativeStackScreenProps<RootStackParamList, 'AddFoundItem'>;

export default function AddFoundItemScreen({ navigation }: Props) {
  const addReport = useUserStore((state) => state.addReport);

  return (
    <View className="flex-1 bg-slate-50 px-5 pt-16">
      <ReportForm
        typeLabel="Found"
        submitLabel="Submit Found Report"
        onSubmit={(payload) => {
          const created = addReport('found', payload);
          if (created) {
            navigation.replace('ItemDetails', { itemId: created.id, itemType: 'found' });
          }
        }}
      />
      <Text className="mt-4 text-xs text-slate-500">
        Add clear details so potential owners can verify and claim outside the system.
      </Text>
    </View>
  );
}
