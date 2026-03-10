import { Clock3, Image as ImageIcon, MapPin } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';

import { ItemReport } from '../../domain/types';

type Props = {
  item: ItemReport;
  onPress: () => void;
  variant?: 'feed' | 'list';
};

export default function ItemCard({ item, onPress, variant = 'feed' }: Props) {
  const cardClassName =
    variant === 'feed'
      ? 'mr-3 w-72 rounded-2xl bg-white p-4'
      : 'w-full rounded-2xl bg-white p-4';

  return (
    <Pressable onPress={onPress} className={cardClassName}>
      <View className="h-36 w-full overflow-hidden rounded-xl bg-slate-100">
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <ImageIcon size={26} color="#64748b" />
            <Text className="mt-2 text-xs text-slate-500">No image uploaded</Text>
          </View>
        )}
      </View>

      <Text className="mt-3 text-base font-semibold text-slate-900" numberOfLines={1}>
        {item.title}
      </Text>
      <Text className="mt-1 text-sm leading-5 text-slate-600" numberOfLines={2}>
        {item.description}
      </Text>

      <View className="mt-2 flex-row items-center">
        <MapPin size={14} color="#64748b" />
        <Text className="ml-1 text-xs text-slate-500" numberOfLines={1}>{item.location}</Text>
      </View>
      <View className="mt-1 flex-row items-center">
        <Clock3 size={14} color="#64748b" />
        <Text className="ml-1 text-xs text-slate-500">{item.eventAt}</Text>
      </View>
    </Pressable>
  );
}
