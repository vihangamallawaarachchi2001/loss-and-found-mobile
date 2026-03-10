import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import LoadingScreen from '../screens/LoadingScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import SignupScreen from '../screens/SignupScreen';
import AddFoundItemScreen from '../screens/AddFoundItemScreen';
import AddLostItemScreen from '../screens/AddLostItemScreen';
import ItemDetailsScreen from '../screens/ItemDetailsScreen';
import { RootStackParamList } from './types';

const ONBOARDING_SEEN_KEY = 'hasSeenOnboarding';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const onboardingSeen = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
        setHasSeenOnboarding(onboardingSeen === 'true');
      } finally {
        setTimeout(() => setIsBootstrapping(false), 700);
      }
    };

    initialize();
  }, []);

  const handleOnboardingFinish = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    } catch {
    } finally {
      setHasSeenOnboarding(true);
    }
  }, []);

  if (isBootstrapping) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={hasSeenOnboarding ? 'Login' : 'Onboarding'}
        screenOptions={{ headerShown: false }}
      >
        {!hasSeenOnboarding && (
          <Stack.Screen name="Onboarding">
            {(props) => (
              <OnboardingScreen {...props} onFinish={handleOnboardingFinish} />
            )}
          </Stack.Screen>
        )}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="AddLostItem"
          component={AddLostItemScreen}
          options={{ headerShown: true, title: 'List Lost Item' }}
        />
        <Stack.Screen
          name="AddFoundItem"
          component={AddFoundItemScreen}
          options={{ headerShown: true, title: 'List Found Item' }}
        />
        <Stack.Screen
          name="ItemDetails"
          component={ItemDetailsScreen}
          options={{ headerShown: true, title: 'Item Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}