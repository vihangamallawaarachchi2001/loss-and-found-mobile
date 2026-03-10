import { create } from 'zustand';

import {
  CreateReportInput,
  ItemReport,
  ItemType,
  MatchDecision,
  OwnerAlert,
  UserProfile,
} from '../domain/types';
import { calculateCombinedSimilarity, sortByScoreDescending } from '../utils/matching';
import { NATIVE_ENV } from '../services/api';

type StoreState = {
  currentUser: UserProfile | null;
  users: UserProfile[];
  lostItems: ItemReport[];
  foundItems: ItemReport[];
  decisions: MatchDecision[];
  setCurrentUser: (email: string) => void;
  updateCurrentUserProfile: (payload: Partial<Pick<UserProfile, 'fullName' | 'phone'>>) => void;
  addReport: (type: ItemType, payload: CreateReportInput) => ItemReport | null;
  getItemById: (itemId: string, type: ItemType) => ItemReport | undefined;
  getRecentReports: (type: ItemType, count?: number) => ItemReport[];
  getReportsByUser: (type: ItemType, userEmail: string) => ItemReport[];
  getAllPotentialMatches: (threshold?: number) => OwnerAlert[];
  getOwnerAlerts: (ownerEmail: string, threshold?: number) => OwnerAlert[];
  acceptMatch: (lostItemId: string, foundItemId: string) => void;
  rejectMatch: (lostItemId: string, foundItemId: string) => void;
  markClaimed: (lostItemId: string, foundItemId: string) => void;
  getDecisionForPair: (lostItemId: string, foundItemId: string, ownerEmail: string) => MatchDecision | undefined;
};

const createDefaultUser = (email: string): UserProfile => ({
  email,
  fullName: email.split('@')[0] || 'SLIIT User',
  phone: '',
});

const createReport = (
  type: ItemType,
  payload: CreateReportInput,
  reporter: UserProfile,
): ItemReport => ({
  id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type,
  title: payload.title.trim(),
  description: payload.description.trim(),
  location: payload.location.trim(),
  eventAt: payload.eventAt,
  imageUri: payload.imageUri,
  status: 'active',
  reporter,
  createdAt: Date.now(),
});

const pairId = (lostItemId: string, foundItemId: string, ownerEmail: string) =>
  `${lostItemId}:${foundItemId}:${ownerEmail}`;

const buildInitialState = (): Pick<StoreState, 'currentUser' | 'users' | 'lostItems' | 'foundItems' | 'decisions'> => {
  if (NATIVE_ENV !== 'ui') {
    return {
      currentUser: null,
      users: [],
      lostItems: [],
      foundItems: [],
      decisions: [],
    };
  }

  const demoOwner = createDefaultUser('owner@sliit.lk');
  const demoFinder = createDefaultUser('finder@sliit.lk');

  const now = Date.now();

  const lostItems: ItemReport[] = [
    {
      id: 'lost-demo-1',
      type: 'lost',
      title: 'Black Leather Wallet',
      description: 'Black leather wallet with SLIIT ID card inside and two bank cards.',
      location: 'SLIIT Main Canteen',
      eventAt: '2026-03-10 13:20',
      status: 'active',
      reporter: demoOwner,
      createdAt: now - 1000 * 60 * 60 * 6,
    },
    {
      id: 'lost-demo-2',
      type: 'lost',
      title: 'Blue Water Bottle',
      description: 'Metallic blue water bottle with SLIIT sticker on one side.',
      location: 'Engineering Faculty - Lab 3',
      eventAt: '2026-03-09 10:05',
      status: 'active',
      reporter: demoOwner,
      createdAt: now - 1000 * 60 * 60 * 24,
    },
  ];

  const foundItems: ItemReport[] = [
    {
      id: 'found-demo-1',
      type: 'found',
      title: 'Leather Black Wallet',
      description: 'Found a black leather wallet containing SLIIT student ID.',
      location: 'Near Library Entrance',
      eventAt: '2026-03-10 14:05',
      status: 'active',
      reporter: demoFinder,
      createdAt: now - 1000 * 60 * 60 * 5,
    },
    {
      id: 'found-demo-2',
      type: 'found',
      title: 'White Earbuds Case',
      description: 'White wireless earbuds case found near lecture hall C2.',
      location: 'Lecture Hall Complex',
      eventAt: '2026-03-10 09:10',
      status: 'active',
      reporter: demoFinder,
      createdAt: now - 1000 * 60 * 60 * 12,
    },
  ];

  return {
    currentUser: demoOwner,
    users: [demoOwner, demoFinder],
    lostItems,
    foundItems,
    decisions: [],
  };
};

const initialState = buildInitialState();

const computeCandidateMatches = (
  lostItems: ItemReport[],
  foundItems: ItemReport[],
  threshold = 0.55,
): OwnerAlert[] => {
  const matches: OwnerAlert[] = [];

  for (const lostItem of lostItems) {
    if (lostItem.status !== 'active') {
      continue;
    }

    for (const foundItem of foundItems) {
      if (foundItem.status !== 'active') {
        continue;
      }

      const score = calculateCombinedSimilarity(lostItem, foundItem);
      if (score.combinedScore >= threshold) {
        matches.push({
          lostItem,
          foundItem,
          confidence: score.combinedScore,
          textScore: score.textScore,
          imageScore: score.imageScore,
        });
      }
    }
  }

  return sortByScoreDescending(matches.map((item) => ({ ...item, combinedScore: item.confidence }))).map(
    (item) => ({
      lostItem: item.lostItem,
      foundItem: item.foundItem,
      confidence: item.confidence,
      textScore: item.textScore,
      imageScore: item.imageScore,
    }),
  );
};

export const useUserStore = create<StoreState>((set, get) => ({
  currentUser: initialState.currentUser,
  users: initialState.users,
  lostItems: initialState.lostItems,
  foundItems: initialState.foundItems,
  decisions: initialState.decisions,

  setCurrentUser: (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return;
    }

    set((state) => {
      const existing = state.users.find((user) => user.email === normalizedEmail);
      const user = existing ?? createDefaultUser(normalizedEmail);

      return {
        currentUser: user,
        users: existing ? state.users : [...state.users, user],
      };
    });
  },

  updateCurrentUserProfile: (payload) => {
    const state = get();
    const activeUser = state.currentUser;

    if (!activeUser) {
      return;
    }

    const updatedUser: UserProfile = {
      ...activeUser,
      fullName: payload.fullName?.trim() ?? activeUser.fullName,
      phone: payload.phone?.trim() ?? activeUser.phone,
    };

    set((draft) => ({
      currentUser: updatedUser,
      users: draft.users.map((user) => (user.email === updatedUser.email ? updatedUser : user)),
      lostItems: draft.lostItems.map((item) =>
        item.reporter.email === updatedUser.email ? { ...item, reporter: updatedUser } : item,
      ),
      foundItems: draft.foundItems.map((item) =>
        item.reporter.email === updatedUser.email ? { ...item, reporter: updatedUser } : item,
      ),
    }));
  },

  addReport: (type, payload) => {
    const state = get();
    const user = state.currentUser;

    if (!user) {
      return null;
    }

    const item = createReport(type, payload, user);

    set((draft) =>
      type === 'lost'
        ? { lostItems: [item, ...draft.lostItems] }
        : { foundItems: [item, ...draft.foundItems] },
    );

    return item;
  },

  getItemById: (itemId, type) => {
    const state = get();
    return type === 'lost'
      ? state.lostItems.find((item) => item.id === itemId)
      : state.foundItems.find((item) => item.id === itemId);
  },

  getRecentReports: (type, count = 8) => {
    const state = get();
    const source = type === 'lost' ? state.lostItems : state.foundItems;
    return source.slice(0, count);
  },

  getReportsByUser: (type, userEmail) => {
    const state = get();
    const source = type === 'lost' ? state.lostItems : state.foundItems;
    return source.filter((item) => item.reporter.email === userEmail.toLowerCase());
  },

  getAllPotentialMatches: (threshold = 0.55) => {
    const state = get();
    return computeCandidateMatches(state.lostItems, state.foundItems, threshold);
  },

  getOwnerAlerts: (ownerEmail, threshold = 0.55) => {
    const state = get();
    const normalizedEmail = ownerEmail.toLowerCase();
    const all = computeCandidateMatches(state.lostItems, state.foundItems, threshold).filter(
      (item) => item.lostItem.reporter.email === normalizedEmail,
    );

    const groupedByFoundItem = new Map<string, OwnerAlert[]>();
    for (const alert of all) {
      const group = groupedByFoundItem.get(alert.foundItem.id) ?? [];
      group.push(alert);
      groupedByFoundItem.set(alert.foundItem.id, group);
    }

    const activeAlerts: OwnerAlert[] = [];

    groupedByFoundItem.forEach((alerts) => {
      const sorted = alerts.sort((a, b) => b.confidence - a.confidence);
      const nextEligible = sorted.find((entry) => {
        const decision = state.decisions.find(
          (row) => row.id === pairId(entry.lostItem.id, entry.foundItem.id, normalizedEmail),
        );

        return !decision || decision.status === 'pending' || decision.status === 'accepted';
      });

      if (!nextEligible) {
        return;
      }

      const higherRejected = sorted
        .filter((entry) => entry.confidence > nextEligible.confidence)
        .every((entry) => {
          const owner = entry.lostItem.reporter.email;
          const decision = state.decisions.find(
            (row) => row.id === pairId(entry.lostItem.id, entry.foundItem.id, owner),
          );

          return decision?.status === 'rejected';
        });

      if (higherRejected || sorted[0].lostItem.reporter.email === normalizedEmail) {
        activeAlerts.push(nextEligible);
      }
    });

    return activeAlerts.sort((a, b) => b.confidence - a.confidence);
  },

  acceptMatch: (lostItemId, foundItemId) => {
    const state = get();
    const owner = state.currentUser?.email;

    if (!owner) {
      return;
    }

    const id = pairId(lostItemId, foundItemId, owner);

    set((draft) => {
      const existing = draft.decisions.find((item) => item.id === id);
      const now = Date.now();

      return {
        decisions: existing
          ? draft.decisions.map((item) =>
              item.id === id ? { ...item, status: 'accepted', updatedAt: now } : item,
            )
          : [
              {
                id,
                lostItemId,
                foundItemId,
                ownerEmail: owner,
                status: 'accepted',
                createdAt: now,
                updatedAt: now,
              },
              ...draft.decisions,
            ],
      };
    });
  },

  rejectMatch: (lostItemId, foundItemId) => {
    const state = get();
    const owner = state.currentUser?.email;

    if (!owner) {
      return;
    }

    const id = pairId(lostItemId, foundItemId, owner);

    set((draft) => {
      const existing = draft.decisions.find((item) => item.id === id);
      const now = Date.now();

      return {
        decisions: existing
          ? draft.decisions.map((item) =>
              item.id === id ? { ...item, status: 'rejected', updatedAt: now } : item,
            )
          : [
              {
                id,
                lostItemId,
                foundItemId,
                ownerEmail: owner,
                status: 'rejected',
                createdAt: now,
                updatedAt: now,
              },
              ...draft.decisions,
            ],
      };
    });
  },

  markClaimed: (lostItemId, foundItemId) => {
    const state = get();
    const owner = state.currentUser?.email;

    if (!owner) {
      return;
    }

    const id = pairId(lostItemId, foundItemId, owner);

    set((draft) => {
      const now = Date.now();
      const existing = draft.decisions.find((item) => item.id === id);

      return {
        decisions: existing
          ? draft.decisions.map((item) =>
              item.id === id ? { ...item, status: 'claimed', updatedAt: now } : item,
            )
          : [
              {
                id,
                lostItemId,
                foundItemId,
                ownerEmail: owner,
                status: 'claimed',
                createdAt: now,
                updatedAt: now,
              },
              ...draft.decisions,
            ],
        lostItems: draft.lostItems.map((item) =>
          item.id === lostItemId ? { ...item, status: 'claimed' } : item,
        ),
        foundItems: draft.foundItems.map((item) =>
          item.id === foundItemId ? { ...item, status: 'claimed' } : item,
        ),
      };
    });
  },

  getDecisionForPair: (lostItemId, foundItemId, ownerEmail) => {
    const state = get();
    return state.decisions.find((item) => item.id === pairId(lostItemId, foundItemId, ownerEmail));
  },
}));
