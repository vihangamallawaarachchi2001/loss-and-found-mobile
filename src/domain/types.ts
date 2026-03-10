export type ItemType = 'lost' | 'found';

export type ItemStatus = 'active' | 'claimed';

export interface UserProfile {
  email: string;
  fullName: string;
  phone: string;
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
}

export interface CreateReportInput {
  title: string;
  description: string;
  location: string;
  eventAt: string;
  imageUri?: string;
}
