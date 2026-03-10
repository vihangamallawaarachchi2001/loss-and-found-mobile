export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string } | undefined;
  Home: undefined;
  AddLostItem: undefined;
  AddFoundItem: undefined;
  ItemDetails: { itemId: string; itemType: 'lost' | 'found' };
};
