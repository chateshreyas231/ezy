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

export type ConversationLogRecord = {
  id: string;
  role: "user" | "ai";
  content: string;
  createdAt: string;
};

type WorkspaceAiStore = {
  buyingPlans: BuyingPlanRecord[];
  listings: SellerListingRecord[];
  conversationLogs: ConversationLogRecord[];
};

const STORAGE_KEY = "ezriya.workspace.ai.store.v1";
const UPDATE_EVENT = "ezriya:workspace-store-updated";

const emptyStore: WorkspaceAiStore = { buyingPlans: [], listings: [], conversationLogs: [] };

function safeParse(value: string | null): WorkspaceAiStore {
  if (!value) return emptyStore;
  try {
    const parsed = JSON.parse(value) as WorkspaceAiStore;
    return {
      buyingPlans: Array.isArray(parsed?.buyingPlans) ? parsed.buyingPlans : [],
      listings: Array.isArray(parsed?.listings) ? parsed.listings : [],
      conversationLogs: Array.isArray(parsed?.conversationLogs) ? parsed.conversationLogs : [],
    };
  } catch {
    return emptyStore;
  }
}

export function readWorkspaceAiStore(): WorkspaceAiStore {
  if (typeof window === "undefined") return emptyStore;
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

function writeWorkspaceAiStore(nextStore: WorkspaceAiStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

export function subscribeWorkspaceAiStore(listener: () => void) {
  if (typeof window === "undefined") return () => {};
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

export function appendConversationLog(record: ConversationLogRecord) {
  const current = readWorkspaceAiStore();
  const nextLogs = [record, ...current.conversationLogs].slice(0, 120);
  writeWorkspaceAiStore({
    ...current,
    conversationLogs: nextLogs,
  });
}

export function useWorkspaceAiStore() {
  return useSyncExternalStore(
    subscribeWorkspaceAiStore,
    readWorkspaceAiStore,
    () => emptyStore
  );
}
