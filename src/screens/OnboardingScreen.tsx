import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from 'react-native';

import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'> & {
  onFinish: () => Promise<void>;
};

type OnboardingItem = {
  id: string;
  title: string;
  description: string;
  image: string;
};

const ONBOARDING_PAGES: OnboardingItem[] = [
  {
    id: '1',
    title: 'Report Lost Items Fast',
    description:
      'Lost something within SLIIT premises? Post details instantly so your community can help locate it.',
    image:
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '2',
    title: 'Share Found Belongings',
    description:
      'Students and staff can upload found items with location and time to reconnect owners quickly.',
    image:
      'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '3',
    title: 'Claim Safely & Securely',
    description:
      'Coordinate claim confirmation through the app and keep recoveries limited to SLIIT university boundaries.',
    image:
      'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function OnboardingScreen({ navigation, onFinish }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingItem>>(null);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const screenWidth = event.nativeEvent.layoutMeasurement.width;
    const currentIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setActiveIndex(currentIndex);
  };

  const handleNext = async () => {
    const isLastScreen = activeIndex === ONBOARDING_PAGES.length - 1;

    if (isLastScreen) {
      try {
        await onFinish();
      } finally {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
      return;
    }

    flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
  };

  const handleSkip = async () => {
    try {
      await onFinish();
    } finally {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-6 pt-16">
        <Text className="text-lg font-bold text-slate-900">SLIIT Lost &amp; Found</Text>
        <Pressable onPress={handleSkip}>
          <Text className="text-base font-semibold text-blue-600">Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_PAGES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => (
          <View className="w-screen px-6 pt-8">
            <Image
              source={{ uri: item.image }}
              className="h-80 w-full rounded-3xl bg-slate-100"
              resizeMode="cover"
            />
            <Text className="mt-10 text-3xl font-bold text-slate-900">{item.title}</Text>
            <Text className="mt-4 text-base leading-6 text-slate-600">{item.description}</Text>
          </View>
        )}
      />

      <View className="mb-10 px-6">
        <View className="mb-8 flex-row items-center justify-center gap-2">
          {ONBOARDING_PAGES.map((item, index) => (
            <View
              key={item.id}
              className={`h-2 rounded-full ${activeIndex === index ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300'}`}
            />
          ))}
        </View>

        <Pressable
          onPress={handleNext}
          className="items-center rounded-xl bg-blue-600 py-4"
        >
          <Text className="text-base font-semibold text-white">
            {activeIndex === ONBOARDING_PAGES.length - 1
              ? 'Get Started'
              : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
