import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';

import ReportForm from '../components/forms/ReportForm';
import { RootStackParamList } from '../navigation/types';
import { useUserStore } from '../state/useStore';

type Props = NativeStackScreenProps<RootStackParamList, 'AddLostItem'>;

export default function AddLostItemScreen({ navigation }: Props) {
  const addReport = useUserStore((state) => state.addReport);

  return (
    <View className="flex-1 bg-slate-50 px-5 pt-16">
      <ReportForm
        typeLabel="Lost"
        submitLabel="Submit Lost Report"
        onSubmit={(payload) => {
          const created = addReport('lost', payload);
          if (created) {
            navigation.replace('ItemDetails', { itemId: created.id, itemType: 'lost' });
          }
        }}
      />
      <Text className="mt-4 text-xs text-slate-500">
        Claims are handled outside the app; use item matching flow to confirm ownership first.
      </Text>
    </View>
  );
}
