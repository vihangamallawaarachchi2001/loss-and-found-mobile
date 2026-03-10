import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CircleUserRound, House, PackageSearch, SearchX } from 'lucide-react-native';

import FoundListScreen from '../screens/FoundListScreen';
import HomeFeedScreen from '../screens/HomeFeedScreen';
import LostListScreen from '../screens/LostListScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type MainTabParamList = {
  HomeFeed: undefined;
  Lost: undefined;
  Found: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'HomeFeed') {
            return <House size={size} color={color} />;
          }

          if (route.name === 'Lost') {
            return <SearchX size={size} color={color} />;
          }

          if (route.name === 'Found') {
            return <PackageSearch size={size} color={color} />;
          }

          return <CircleUserRound size={size} color={color} />;
        },
        tabBarStyle: {
          height: 68,
          paddingTop: 6,
          paddingBottom: 10,
        },
      })}
    >
      <Tab.Screen name="HomeFeed" component={HomeFeedScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Lost" component={LostListScreen} options={{ title: 'Lost' }} />
      <Tab.Screen name="Found" component={FoundListScreen} options={{ title: 'Found' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
