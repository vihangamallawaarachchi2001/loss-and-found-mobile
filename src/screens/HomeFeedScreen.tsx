import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { BellRing } from 'lucide-react-native';
import { useEffect, useMemo, useRef } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';

import EmptyState from '../components/common/EmptyState';
import SectionTitle from '../components/common/SectionTitle';
import ItemCard from '../components/items/ItemCard';
import { RootStackParamList } from '../navigation/types';
import { getProfile, listItems, listOwnerAlerts } from '../services/backend';
import { sendInAppNotification, registerForNotifications } from '../services/notifications';
import { useUserStore } from '../state/useStore';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeFeedScreen() {
  const navigation = useNavigation<NavProp>();
  const isFocused = useIsFocused();
  const currentUser = useUserStore((state) => state.currentUser);
  const lostItems = useUserStore((state) => state.lostItems);
  const foundItems = useUserStore((state) => state.foundItems);
  const getOwnerAlerts = useUserStore((state) => state.getOwnerAlerts);
  const setReports = useUserStore((state) => state.setReports);
  const setBackendAlerts = useUserStore((state) => state.setBackendAlerts);
  const setSessionUser = useUserStore((state) => state.setSessionUser);

  const recentLost = useMemo(() => lostItems.filter((item) => item.status === 'active').slice(0, 8), [lostItems]);
  const recentFound = useMemo(() => foundItems.filter((item) => item.status === 'active').slice(0, 8), [foundItems]);
  const alerts = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return getOwnerAlerts(currentUser.email, 0.55);
  }, [currentUser, getOwnerAlerts, lostItems, foundItems]);

  const seenAlertIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    registerForNotifications().catch(() => undefined);
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadRemoteData = async () => {
      if (!currentUser?.id) {
        return;
      }

      try {
        const [lost, found, alertRows, profile] = await Promise.all([
          listItems('lost'),
          listItems('found'),
          listOwnerAlerts(currentUser.id),
          getProfile(currentUser.id),
        ]);

        if (!isActive) {
          return;
        }

        setSessionUser({ ...currentUser, ...profile });
        setReports(lost, found);
        setBackendAlerts(alertRows);
      } catch {
      }
    };

    loadRemoteData();

    return () => {
      isActive = false;
    };
  }, [currentUser?.id, isFocused]);

  useEffect(() => {
    alerts.forEach((alert) => {
      const id = `${alert.lostItem.id}:${alert.foundItem.id}`;
      if (!seenAlertIds.current.has(id)) {
        seenAlertIds.current.add(id);
        sendInAppNotification(
          'Your item may have been found',
          `${alert.foundItem.title} matches your report (${(alert.confidence * 100).toFixed(0)}% confidence).`,
        );
      }
    });
  }, [alerts]);

  const title = useMemo(() => {
    if (!currentUser) {
      return 'Home';
    }

    return `Hi, ${currentUser.fullName}`;
  }, [currentUser]);

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingTop: 62, paddingBottom: 24 }}>
      <View className="px-5">
        <SectionTitle
          title={title}
          subtitle="Recent lost and found items, like a marketplace feed"
        />
      </View>

      <View className="mt-5 px-5">
        <View className="rounded-2xl bg-blue-600 p-4">
          <View className="flex-row items-center">
            <BellRing color="#fff" size={18} />
            <Text className="ml-2 text-base font-semibold text-white">Owner Alerts</Text>
          </View>
          {alerts.length === 0 ? (
            <Text className="mt-2 text-blue-100">
              No match alerts right now. We notify you when confidence is high.
            </Text>
          ) : (
            alerts.slice(0, 3).map((alert) => (
              <Pressable
                key={`${alert.lostItem.id}:${alert.foundItem.id}`}
                onPress={() =>
                  navigation.navigate('ItemDetails', {
                    itemId: alert.foundItem.id,
                    itemType: 'found',
                  })
                }
                className="mt-3 rounded-xl bg-white/15 p-3"
              >
                <Text className="font-semibold text-white">Your item has likely been found</Text>
                <Text className="mt-1 text-blue-100">
                  {alert.foundItem.title} • {(alert.confidence * 100).toFixed(0)}% confidence
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </View>

      <View className="mt-6">
        <View className="mb-3 px-5">
          <Text className="text-lg font-semibold text-slate-900">Recent Lost Items</Text>
        </View>
        {recentLost.length === 0 ? (
          <View className="px-5">
            <EmptyState
              title="No lost items yet"
              subtitle="Submitted lost items appear here like recent products."
            />
          </View>
        ) : (
          <FlatList
            horizontal
            data={recentLost}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <ItemCard
                item={item}
                onPress={() => navigation.navigate('ItemDetails', { itemId: item.id, itemType: 'lost' })}
              />
            )}
          />
        )}
      </View>

      <View className="mt-7">
        <View className="mb-3 px-5">
          <Text className="text-lg font-semibold text-slate-900">Recent Found Items</Text>
        </View>
        {recentFound.length === 0 ? (
          <View className="px-5">
            <EmptyState
              title="No found items yet"
              subtitle="Submitted found items appear here like recent products."
            />
          </View>
        ) : (
          <FlatList
            horizontal
            data={recentFound}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <ItemCard
                item={item}
                onPress={() => navigation.navigate('ItemDetails', { itemId: item.id, itemType: 'found' })}
              />
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}
