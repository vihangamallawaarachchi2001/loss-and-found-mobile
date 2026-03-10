import { ActivityIndicator, Text, View } from 'react-native';

export default function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-6">
      <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-blue-500/20">
        <ActivityIndicator size="large" color="#60a5fa" />
      </View>
      <Text className="text-3xl font-bold text-white">SLIIT Lost &amp; Found</Text>
      <Text className="mt-3 text-center text-base text-slate-300">
        Preparing your campus item network...
      </Text>
    </View>
  );
}
