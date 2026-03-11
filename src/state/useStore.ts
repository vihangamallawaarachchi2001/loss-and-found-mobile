import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { BackendOwnerAlert, ItemReport, ItemType, MatchDecision, OwnerAlert, UserProfile } from '../domain/types';

type StoreState = {
  hasHydrated: boolean;
  currentUser: UserProfile | null;
  users: UserProfile[];
  lostItems: ItemReport[];
  foundItems: ItemReport[];
  decisions: MatchDecision[];
  backendAlerts: BackendOwnerAlert[];
  setCurrentUser: (email: string, userId?: string, fullName?: string, token?: string) => void;
  setSessionUser: (user: UserProfile | null) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
  updateCurrentUserProfile: (payload: Partial<Pick<UserProfile, 'fullName' | 'phone'>>) => void;
  addReport: (type: ItemType, item: ItemReport) => ItemReport;
  setReports: (lostItems: ItemReport[], foundItems: ItemReport[]) => void;
  setBackendAlerts: (alerts: BackendOwnerAlert[]) => void;
  getItemById: (itemId: string, type: ItemType) => ItemReport | undefined;
  getRecentReports: (type: ItemType, count?: number) => ItemReport[];
  getReportsByUser: (type: ItemType, userIdOrEmail: string) => ItemReport[];
  getOwnerAlerts: (_ownerEmail: string, _threshold?: number) => OwnerAlert[];
  acceptMatch: (lostItemId: string, foundItemId: string) => void;
  rejectMatch: (lostItemId: string, foundItemId: string) => void;
  markClaimed: (lostItemId: string, foundItemId: string) => void;
  getDecisionForPair: (lostItemId: string, foundItemId: string, ownerEmail: string) => MatchDecision | undefined;
};

const createDefaultUser = (email: string, userId?: string, fullName?: string, token?: string): UserProfile => ({
  id: userId ?? email.toLowerCase(),
  email: email.toLowerCase(),
  fullName: fullName ?? email.split('@')[0] ?? 'SLIIT User',
  phone: '',
  token,
});

const pairId = (lostItemId: string, foundItemId: string, ownerEmail: string) =>
  `${lostItemId}:${foundItemId}:${ownerEmail}`;

const normalizeStatus = (status: string): MatchDecision['status'] => {
  if (status === 'accepted' || status === 'rejected' || status === 'claimed') {
    return status;
  }

  return 'pending';
};

export const useUserStore = create<StoreState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      currentUser: null,
      users: [],
      lostItems: [],
      foundItems: [],
      decisions: [],
      backendAlerts: [],

      setCurrentUser: (email, userId, fullName, token) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) {
          return;
        }

        set((state) => {
          const existing = state.users.find((user) => user.email === normalizedEmail);
          const user = existing
            ? { ...existing, id: userId ?? existing.id, fullName: fullName ?? existing.fullName, token: token ?? existing.token }
            : createDefaultUser(normalizedEmail, userId, fullName, token);

          return {
            currentUser: user,
            users: existing
              ? state.users.map((entry) => (entry.email === user.email ? user : entry))
              : [...state.users, user],
          };
        });
      },

      setSessionUser: (user) => {
        set((state) => {
          if (!user) {
            return { currentUser: null, backendAlerts: [] };
          }

          const existing = state.users.find((entry) => entry.email === user.email);
          return {
            currentUser: user,
            users: existing
              ? state.users.map((entry) => (entry.email === user.email ? { ...entry, ...user } : entry))
              : [...state.users, user],
          };
        });
      },

      logout: () => {
        set({
          currentUser: null,
          users: [],
          lostItems: [],
          foundItems: [],
          decisions: [],
          backendAlerts: [],
        });
      },

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
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
            item.reporter.id === updatedUser.id ? { ...item, reporter: updatedUser } : item,
          ),
          foundItems: draft.foundItems.map((item) =>
            item.reporter.id === updatedUser.id ? { ...item, reporter: updatedUser } : item,
          ),
        }));
      },

      addReport: (type, item) => {
        set((state) =>
          type === 'lost'
            ? { lostItems: [item, ...state.lostItems] }
            : { foundItems: [item, ...state.foundItems] },
        );
        return item;
      },

      setReports: (lostItems, foundItems) => {
        set({ lostItems, foundItems });
      },

      setBackendAlerts: (alerts) => {
        const owner = get().currentUser;
        const ownerKey = owner?.email ?? owner?.id ?? 'anonymous';
        const now = Date.now();

        const decisions: MatchDecision[] = alerts.map((alert) => ({
          id: pairId(alert.lostItemId, alert.foundItemId, ownerKey),
          lostItemId: alert.lostItemId,
          foundItemId: alert.foundItemId,
          ownerEmail: ownerKey,
          status: normalizeStatus(alert.status),
          createdAt: now,
          updatedAt: now,
        }));

        set({ backendAlerts: alerts, decisions });
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

      getReportsByUser: (type, userIdOrEmail) => {
        const state = get();
        const source = type === 'lost' ? state.lostItems : state.foundItems;
        const normalized = userIdOrEmail.toLowerCase();
        return source.filter(
          (item) => item.reporter.id === userIdOrEmail || item.reporter.email.toLowerCase() === normalized,
        );
      },

      getOwnerAlerts: (_ownerEmail, _threshold = 0.55) => {
        const state = get();
        const mapped = state.backendAlerts
          .map((alert) => {
            const lostItem = state.lostItems.find((entry) => entry.id === alert.lostItemId);
            const foundItem = state.foundItems.find((entry) => entry.id === alert.foundItemId);

            if (!lostItem || !foundItem) {
              return null;
            }

            return {
              lostItem,
              foundItem,
              confidence: alert.confidence,
              textScore: alert.textScore,
              imageScore: alert.imageScore,
              status: normalizeStatus(alert.status),
            };
          });

        return mapped
          .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
          .filter((entry) => entry.lostItem.status === 'active' && entry.foundItem.status === 'active')
          .sort((left, right) => right.confidence - left.confidence);
      },

      acceptMatch: (lostItemId, foundItemId) => {
        const state = get();
        const owner = state.currentUser?.email ?? state.currentUser?.id;
        if (!owner) {
          return;
        }

        const id = pairId(lostItemId, foundItemId, owner);
        const now = Date.now();

        set((draft) => ({
          decisions: draft.decisions.some((item) => item.id === id)
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
        }));
      },

      rejectMatch: (lostItemId, foundItemId) => {
        const state = get();
        const owner = state.currentUser?.email ?? state.currentUser?.id;
        if (!owner) {
          return;
        }

        const id = pairId(lostItemId, foundItemId, owner);
        const now = Date.now();

        set((draft) => ({
          decisions: draft.decisions.some((item) => item.id === id)
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
        }));
      },

      markClaimed: (lostItemId, foundItemId) => {
        const state = get();
        const owner = state.currentUser?.email ?? state.currentUser?.id;
        if (!owner) {
          return;
        }

        const id = pairId(lostItemId, foundItemId, owner);
        const now = Date.now();

        set((draft) => ({
          decisions: draft.decisions.some((item) => item.id === id)
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
        }));
      },

      getDecisionForPair: (lostItemId, foundItemId, ownerEmail) => {
        const state = get();
        return state.decisions.find((item) => item.id === pairId(lostItemId, foundItemId, ownerEmail));
      },
    }),
    {
      name: 'lost-found-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        lostItems: state.lostItems,
        foundItems: state.foundItems,
        decisions: state.decisions,
        backendAlerts: state.backendAlerts,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
