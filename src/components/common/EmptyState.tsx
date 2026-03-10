import { Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle: string;
};

export default function EmptyState({ title, subtitle }: Props) {
  return (
    <View className="rounded-2xl border border-dashed border-slate-300 bg-white p-5">
      <Text className="text-base font-semibold text-slate-800">{title}</Text>
      <Text className="mt-1 text-slate-500">{subtitle}</Text>
    </View>
  );
}
