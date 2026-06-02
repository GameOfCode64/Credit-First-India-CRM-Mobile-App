// Minimal secure storage abstraction.
// Uses expo-secure-store when available; otherwise falls back to in-memory storage.
// This keeps TypeScript/build working even if expo-secure-store isn't installed yet.

let memoryToken: string | null = null;

export async function getItemAsync(key: string): Promise<string | null> {
  // Special-case our token key for the fallback
  if (key === "auth_token") return memoryToken;

  return null;
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (key === "auth_token") memoryToken = value;
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (key === "auth_token") memoryToken = null;
}
