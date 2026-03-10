import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import { RootStackParamList } from '../navigation/types';
import { useUserStore } from '../state/useStore';

type Props = NativeStackScreenProps<RootStackParamList, 'ItemDetails'>;

export default function ItemDetailsScreen({ route }: Props) {
  const { itemId, itemType } = route.params;
  const lostItems = useUserStore((state) => state.lostItems);
  const foundItems = useUserStore((state) => state.foundItems);
  const item = useMemo(
    () => (itemType === 'lost' ? lostItems.find((entry) => entry.id === itemId) : foundItems.find((entry) => entry.id === itemId)),
    [foundItems, itemId, itemType, lostItems],
  );
  const currentUser = useUserStore((state) => state.currentUser);
  const getOwnerAlerts = useUserStore((state) => state.getOwnerAlerts);
  const alerts = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return getOwnerAlerts(currentUser.email, 0.55);
  }, [currentUser, foundItems, getOwnerAlerts, lostItems]);
  const acceptMatch = useUserStore((state) => state.acceptMatch);
  const rejectMatch = useUserStore((state) => state.rejectMatch);
  const markClaimed = useUserStore((state) => state.markClaimed);
  const getDecisionForPair = useUserStore((state) => state.getDecisionForPair);

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Text className="text-lg font-semibold text-slate-900">Item not found</Text>
      </View>
    );
  }

  const activeAlert = currentUser
    ? alerts.find(
        (entry) => entry.foundItem.id === (itemType === 'found' ? item.id : '') || entry.lostItem.id === (itemType === 'lost' ? item.id : ''),
      )
    : undefined;

  const decision = activeAlert && currentUser
    ? getDecisionForPair(activeAlert.lostItem.id, activeAlert.foundItem.id, currentUser.email)
    : undefined;

  const canShowDecisionActions = Boolean(activeAlert && currentUser && item.status === 'active');
  const alertLostId = activeAlert?.lostItem.id;
  const alertFoundId = activeAlert?.foundItem.id;

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 20, paddingTop: 24 }}>
      <View className="h-64 w-full overflow-hidden rounded-2xl bg-slate-100">
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Text className="text-slate-500">No image uploaded</Text>
          </View>
        )}
      </View>

      <Text className="mt-4 text-2xl font-bold text-slate-900">{item.title}</Text>
      <Text className="mt-2 text-slate-700">{item.description}</Text>

      <View className="mt-4 rounded-xl bg-white p-4">
        <Text className="text-sm text-slate-500">Type: {item.type.toUpperCase()}</Text>
        <Text className="mt-1 text-sm text-slate-500">Location: {item.location}</Text>
        <Text className="mt-1 text-sm text-slate-500">Date/Time: {item.eventAt}</Text>
        <Text className="mt-1 text-sm text-slate-500">Status: {item.status.toUpperCase()}</Text>
      </View>

      <View className="mt-4 rounded-xl bg-white p-4">
        <Text className="text-base font-semibold text-slate-900">Reporter Contact</Text>
        <Text className="mt-2 text-slate-600">{item.reporter.fullName}</Text>
        <Text className="mt-1 text-slate-600">{item.reporter.email}</Text>
        <Text className="mt-1 text-slate-600">{item.reporter.phone || 'No phone provided'}</Text>
      </View>

      {canShowDecisionActions && alertLostId && alertFoundId ? (
        <View className="mt-5 rounded-xl bg-blue-50 p-4">
          <Text className="font-semibold text-blue-900">Possible ownership match</Text>
          <Text className="mt-2 text-blue-800">
            If this is your item, accept to view finder contact and claim outside the system.
          </Text>

          {!decision || decision.status === 'pending' ? (
            <View className="mt-4 flex-row gap-3">
              <Pressable
                onPress={() => acceptMatch(alertLostId, alertFoundId)}
                className="flex-1 rounded-xl bg-blue-600 py-3"
              >
                <Text className="text-center font-semibold text-white">Accept</Text>
              </Pressable>
              <Pressable
                onPress={() => rejectMatch(alertLostId, alertFoundId)}
                className="flex-1 rounded-xl border border-slate-300 bg-white py-3"
              >
                <Text className="text-center font-semibold text-slate-700">Reject</Text>
              </Pressable>
            </View>
          ) : null}

          {decision?.status === 'accepted' ? (
            <View className="mt-4">
              <Text className="text-blue-900">
                Finder contact shared above. Claiming is outside the app.
              </Text>
              <Pressable
                onPress={() => markClaimed(alertLostId, alertFoundId)}
                className="mt-3 rounded-xl bg-emerald-600 py-3"
              >
                <Text className="text-center font-semibold text-white">Mark as Claimed</Text>
              </Pressable>
            </View>
          ) : null}

          {decision?.status === 'rejected' ? (
            <Text className="mt-3 text-slate-600">
              You rejected this match. The next most confident owner will be notified.
            </Text>
          ) : null}

          {decision?.status === 'claimed' ? (
            <Text className="mt-3 font-semibold text-emerald-700">This match is marked as claimed.</Text>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
}
