"use client";

import { useSyncExternalStore } from "react";

export type BuyingPlanRecord = {
  id: string;
  title: string;
  location: string;
  budget: string;
  status: "Searching" | "Negotiating" | "Closed";
  matchScore: number;
  summary: string;
  createdAt: string;
};

export type SellerListingRecord = {
  id: string;
  title: string;
  location: string;
  price: string;
  status: "Active" | "Pending" | "Sold";
  beds: number;
  baths: number;
  sqft: number;
  mediaChecklist: {
    photos: boolean;
    videos: boolean;
    floorplans: boolean;
  };
  strategyNotes: string;
  createdAt: string;
};

export type ChatMessageRecord = {
  role: "user" | "ai";
  content: string;
};

export type ConversationSessionRecord = {
  id: string;
  messages: ChatMessageRecord[];
  createdAt: string;
  updatedAt: string;
  title?: string;
};

type WorkspaceAiStore = {
  buyingPlans: BuyingPlanRecord[];
  listings: SellerListingRecord[];
  conversationSessions: ConversationSessionRecord[];
};

const STORAGE_KEY = "ezriya.workspace.ai.store.v1";
const UPDATE_EVENT = "ezriya:workspace-store-updated";

const emptyStore: WorkspaceAiStore = { buyingPlans: [], listings: [], conversationSessions: [] };

function safeParse(value: string | null): WorkspaceAiStore {
  if (!value) return emptyStore;
  try {
    const parsed = JSON.parse(value) as any;
    return {
      buyingPlans: Array.isArray(parsed?.buyingPlans) ? parsed.buyingPlans : [],
      listings: Array.isArray(parsed?.listings) ? parsed.listings : [],
      conversationSessions: Array.isArray(parsed?.conversationSessions) ? parsed.conversationSessions : [],
    };
  } catch {
    return emptyStore;
  }
}

let cachedStore: WorkspaceAiStore | null = null;
let cachedString: string | null = null;

export function readWorkspaceAiStore(): WorkspaceAiStore {
  if (typeof window === "undefined") return emptyStore;
  const currentString = window.localStorage.getItem(STORAGE_KEY);

  if (currentString === cachedString && cachedStore) {
    return cachedStore;
  }

  cachedString = currentString;
  cachedStore = safeParse(currentString);
  return cachedStore;
}

function writeWorkspaceAiStore(nextStore: WorkspaceAiStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

export function subscribeWorkspaceAiStore(listener: () => void) {
  if (typeof window === "undefined") return () => { };
  const handler = () => listener();
  window.addEventListener(UPDATE_EVENT, handler);
  return () => window.removeEventListener(UPDATE_EVENT, handler);
}

export function appendBuyingPlan(record: BuyingPlanRecord) {
  const current = readWorkspaceAiStore();
  writeWorkspaceAiStore({
    ...current,
    buyingPlans: [record, ...current.buyingPlans],
  });
}

export function appendSellerListing(record: SellerListingRecord) {
  const current = readWorkspaceAiStore();
  writeWorkspaceAiStore({
    ...current,
    listings: [record, ...current.listings],
  });
}

export function saveConversationSession(record: ConversationSessionRecord) {
  const current = readWorkspaceAiStore();
  const existingIdx = current.conversationSessions.findIndex(s => s.id === record.id);
  let nextSessions = [...current.conversationSessions];

  if (existingIdx >= 0) {
    nextSessions[existingIdx] = record;
  } else {
    nextSessions = [record, ...nextSessions].slice(0, 120);
  }

  writeWorkspaceAiStore({
    ...current,
    conversationSessions: nextSessions,
  });
}

export function useWorkspaceAiStore() {
  return useSyncExternalStore(
    subscribeWorkspaceAiStore,
    readWorkspaceAiStore,
    () => emptyStore
  );
}
