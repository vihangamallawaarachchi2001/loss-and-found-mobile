export type ItemType = 'lost' | 'found';

export type ItemStatus = 'active' | 'claimed';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  token?: string;
}

export interface ItemReport {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  location: string;
  eventAt: string;
  imageUri?: string;
  status: ItemStatus;
  reporter: UserProfile;
  createdAt: number;
}

export type OwnerDecision = 'pending' | 'accepted' | 'rejected' | 'claimed';

export interface MatchDecision {
  id: string;
  lostItemId: string;
  foundItemId: string;
  ownerEmail: string;
  status: OwnerDecision;
  createdAt: number;
  updatedAt: number;
}

export interface OwnerAlert {
  lostItem: ItemReport;
  foundItem: ItemReport;
  confidence: number;
  textScore: number;
  imageScore: number;
  status?: OwnerDecision;
}

export interface BackendOwnerAlert {
  lostItemId: string;
  foundItemId: string;
  textScore: number;
  imageScore: number;
  confidence: number;
  status: OwnerDecision;
}

export interface CreateReportInput {
  title: string;
  description: string;
  location: string;
  eventAt: string;
  imageUri?: string;
}
