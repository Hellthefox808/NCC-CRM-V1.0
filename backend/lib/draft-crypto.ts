/**
 * Client-side encryption for locally saved form drafts.
 *
 * Design:
 * - AES-GCM 256 via WebCrypto; random 12-byte IV per write.
 * - The key is generated as a NON-EXTRACTABLE CryptoKey and stored in IndexedDB.
 *   Browsers refuse to export it, so the raw key bytes never appear in
 *   localStorage/sessionStorage/JS and can't be copied out of devtools.
 * - Payloads carry a version + expiry; stale or tampered blobs fail to open
 *   (GCM auth tag) and are discarded instead of partially trusted.
 *
 * This protects against casual inspection/exfiltration of storage contents.
 * It is not a defence against code running on the page itself.
 */

const DB_NAME = "ncc-draft-keystore";
const STORE = "keys";
const KEY_ID = "draft-aes-gcm-v1";
const PAYLOAD_VERSION = 1;

type EnvelopeV1 = {
  v: number;
  s?: string; // app-level schema version of the payload (form shape/flow)
  iv: string; // base64
  ct: string; // base64
  exp: number; // epoch ms
};

export type DraftOptions = {
  /** Bump when the form fields/steps change so stale drafts are discarded. */
  schemaVersion?: string;
  /** Lifetime of the draft; default 24h. */
  ttlMs?: number;
};

export type DraftDiscardReason = "expired" | "schema-changed";

function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGet(db: IDBDatabase, key: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(db: IDBDatabase, key: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function idbDelete(db: IDBDatabase, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

let keyPromise: Promise<CryptoKey> | null = null;

async function getDraftKey(): Promise<CryptoKey> {
  if (!keyPromise) {
    keyPromise = (async () => {
      const db = await idb();
      const existing = (await idbGet(db, KEY_ID)) as CryptoKey | undefined;
      if (existing) return existing;
      const key = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        false, // non-extractable: cannot be read back out of the browser
        ["encrypt", "decrypt"],
      );
      await idbPut(db, KEY_ID, key);
      return key;
    })().catch((err) => {
      keyPromise = null;
      throw err;
    });
  }
  return keyPromise;
}

const toB64 = (buf: ArrayBuffer) => {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i += 1) s += String.fromCharCode(bytes[i]);
  return btoa(s);
};

const fromB64 = (b64: string) => {
  const s = atob(b64);
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i += 1) bytes[i] = s.charCodeAt(i);
  return bytes;
};

export function draftCryptoAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof indexedDB !== "undefined" &&
    typeof crypto !== "undefined" &&
    !!crypto.subtle
  );
}

/** Encrypt and write a draft. Returns false when storage/crypto is unavailable. */
export async function saveEncryptedDraft(
  storageKey: string,
  data: unknown,
  options: DraftOptions = {},
): Promise<boolean> {
  if (!draftCryptoAvailable()) return false;
  const { schemaVersion, ttlMs = 24 * 60 * 60 * 1000 } = options;
  try {
    const key = await getDraftKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode(JSON.stringify(data));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
    const envelope: EnvelopeV1 = {
      v: PAYLOAD_VERSION,
      s: schemaVersion,
      iv: toB64(iv.buffer as ArrayBuffer),
      ct: toB64(ct),
      exp: Date.now() + ttlMs,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}

export type DraftLoadResult<T> = {
  data: T | null;
  /** Set when a draft existed but was intentionally thrown away. */
  discarded?: DraftDiscardReason;
  /** When the surviving draft expires (epoch ms). */
  expiresAt?: number;
};

/**
 * Read + decrypt a draft. Discards it when expired, when the schema version no
 * longer matches the current flow, or when it's tampered/corrupt.
 */
export async function loadEncryptedDraft<T>(
  storageKey: string,
  options: DraftOptions = {},
): Promise<DraftLoadResult<T>> {
  if (!draftCryptoAvailable()) return { data: null };
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return { data: null };
    const envelope = JSON.parse(raw) as Partial<EnvelopeV1>;
    if (envelope.v !== PAYLOAD_VERSION || !envelope.iv || !envelope.ct) {
      window.localStorage.removeItem(storageKey);
      return { data: null, discarded: "schema-changed" };
    }
    if (options.schemaVersion !== undefined && envelope.s !== options.schemaVersion) {
      window.localStorage.removeItem(storageKey);
      return { data: null, discarded: "schema-changed" };
    }
    if (typeof envelope.exp === "number" && envelope.exp < Date.now()) {
      window.localStorage.removeItem(storageKey);
      return { data: null, discarded: "expired" };
    }
    const key = await getDraftKey();
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromB64(envelope.iv) },
      key,
      fromB64(envelope.ct),
    );
    return {
      data: JSON.parse(new TextDecoder().decode(plaintext)) as T,
      expiresAt: envelope.exp,
    };
  } catch {
    // Wrong key, tampered ciphertext, or corrupt JSON — drop it.
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    return { data: null };
  }
}

/**
 * Fully delete a persisted draft: remove the encrypted blob from localStorage
 * AND drop the non-extractable decryption key from IndexedDB so no trace of the
 * draft remains recoverable in the browser.
 */
export async function clearEncryptedDraft(storageKey: string): Promise<void> {
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    /* ignore */
  }
  try {
    const db = await idb();
    await idbDelete(db, KEY_ID);
    keyPromise = null; // force a fresh key on the next save
  } catch {
    /* ignore */
  }
}
