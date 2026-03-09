import { buildDefaultCollegiumDomainSnapshot } from "./collegium-domain.fixtures.ts";
import type { CollegiumDomainSnapshot } from "./collegium-domain.ts";

export const COLLEGIUM_DOMAIN_SNAPSHOT_STORAGE_KEY = "collegium-domain-snapshot-v1";

export type CollegiumDomainSnapshotSource =
  | {
      kind: "fixture";
      snapshot: CollegiumDomainSnapshot;
    }
  | {
      kind: "persisted_snapshot";
      snapshot: CollegiumDomainSnapshot;
    };

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function serializeCollegiumDomainSnapshot(snapshot: CollegiumDomainSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

export function parseCollegiumDomainSnapshot(raw: string): CollegiumDomainSnapshot | null {
  try {
    const candidate = JSON.parse(raw) as Partial<CollegiumDomainSnapshot> | null;
    if (!candidate || typeof candidate !== "object") {
      return null;
    }
    if (
      typeof candidate.generatedAt !== "string" ||
      !Array.isArray(candidate.pilots) ||
      !Array.isArray(candidate.passengers) ||
      !Array.isArray(candidate.mobilityEvents) ||
      !Array.isArray(candidate.productionLedger) ||
      !Array.isArray(candidate.networkNodes) ||
      !Array.isArray(candidate.deliberations)
    ) {
      return null;
    }
    return candidate as CollegiumDomainSnapshot;
  } catch {
    return null;
  }
}

export function loadCollegiumDomainSnapshotSource(
  storage: StorageLike | null = resolveBrowserStorage(),
): CollegiumDomainSnapshotSource {
  if (!storage) {
    return { kind: "fixture", snapshot: buildDefaultCollegiumDomainSnapshot() };
  }
  const raw = storage.getItem(COLLEGIUM_DOMAIN_SNAPSHOT_STORAGE_KEY);
  if (!raw) {
    return { kind: "fixture", snapshot: buildDefaultCollegiumDomainSnapshot() };
  }
  const snapshot = parseCollegiumDomainSnapshot(raw);
  if (!snapshot) {
    return { kind: "fixture", snapshot: buildDefaultCollegiumDomainSnapshot() };
  }
  return { kind: "persisted_snapshot", snapshot };
}

export function saveCollegiumDomainSnapshot(
  snapshot: CollegiumDomainSnapshot,
  storage: StorageLike | null = resolveBrowserStorage(),
): boolean {
  if (!storage) {
    return false;
  }
  storage.setItem(
    COLLEGIUM_DOMAIN_SNAPSHOT_STORAGE_KEY,
    serializeCollegiumDomainSnapshot(snapshot),
  );
  return true;
}

function resolveBrowserStorage(): StorageLike | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  return window.localStorage;
}
