import { Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
};

export default function SectionTitle({ title, subtitle }: Props) {
  return (
    <View>
      <Text className="text-2xl font-bold text-slate-900">{title}</Text>
      {subtitle ? <Text className="mt-1 text-slate-600">{subtitle}</Text> : null}
    </View>
  );
}
