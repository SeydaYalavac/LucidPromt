export type SupportedModels = "gemini" | "groq";

export interface ApiKeys {
  gemini?: string;
  groq?: string;
}

const ENCRYPTION_KEY_NAME = "byok_encrypted_keys";

/**
 * Saves keys to localStorage. 
 * Since this is client-side only and we want frictionless UX (no master password),
 * we use a simple Base64 encoding. It prevents casual shoulder-surfing of localStorage.
 * For true security, an extension or a user-provided password + WebCrypto AES-GCM should be used.
 */
export function saveKeys(keys: ApiKeys) {
  if (typeof window !== "undefined") {
    const serialized = JSON.stringify(keys);
    const encoded = btoa(encodeURIComponent(serialized));
    localStorage.setItem(ENCRYPTION_KEY_NAME, encoded);
  }
}

export function loadKeys(): ApiKeys {
  if (typeof window !== "undefined") {
    const encoded = localStorage.getItem(ENCRYPTION_KEY_NAME);
    if (!encoded) return {};
    try {
      const decoded = decodeURIComponent(atob(encoded));
      return JSON.parse(decoded) as ApiKeys;
    } catch {
      // If parsing fails or tampering occurred
      return {};
    }
  }
  return {};
}

export function clearKeys() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ENCRYPTION_KEY_NAME);
  }
}
