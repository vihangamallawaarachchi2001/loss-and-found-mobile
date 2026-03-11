import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import EmptyState from '../components/common/EmptyState';
import SectionTitle from '../components/common/SectionTitle';
import ItemCard from '../components/items/ItemCard';
import { RootStackParamList } from '../navigation/types';
import { useUserStore } from '../state/useStore';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function FoundListScreen() {
  const navigation = useNavigation<NavProp>();
  const items = useUserStore((state) => state.foundItems);
  const visibleItems = useMemo(() => items.filter((item) => item.status === 'active'), [items]);

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 20, paddingTop: 62 }}>
      <SectionTitle title="Found Items" subtitle="Browse submitted found reports" />

      <View className="mt-4">
        <Pressable
          onPress={() => navigation.navigate('AddFoundItem')}
          className="flex-row items-center justify-center rounded-xl bg-blue-600 px-4 py-3"
        >
          <Plus size={16} color="#fff" />
          <Text className="ml-2 font-semibold text-white">List a Found Item</Text>
        </Pressable>
      </View>

      <View className="mt-5">
        {visibleItems.length === 0 ? (
          <EmptyState title="No found items yet" subtitle="Use 'List a Found Item' to submit the first report." />
        ) : (
          visibleItems.map((item) => (
            <View key={item.id} className="mb-3">
              <ItemCard
                item={item}
                variant="list"
                onPress={() => navigation.navigate('ItemDetails', { itemId: item.id, itemType: 'found' })}
              />
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
