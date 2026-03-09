import { describe, expect, it } from "vitest";
import { buildDefaultCollegiumDomainSnapshot } from "./collegium-domain.fixtures.ts";
import {
  COLLEGIUM_DOMAIN_SNAPSHOT_STORAGE_KEY,
  loadCollegiumDomainSnapshotSource,
  parseCollegiumDomainSnapshot,
  saveCollegiumDomainSnapshot,
  serializeCollegiumDomainSnapshot,
} from "./collegium-domain.snapshot.ts";

type MemoryStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  dump: () => Record<string, string>;
};

function createMemoryStorage(seed: Record<string, string> = {}): MemoryStorage {
  const data = new Map(Object.entries(seed));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    dump: () => Object.fromEntries(data.entries()),
  };
}

describe("collegium domain snapshot source", () => {
  it("serializes and parses the default snapshot", () => {
    const snapshot = buildDefaultCollegiumDomainSnapshot();
    const serialized = serializeCollegiumDomainSnapshot(snapshot);

    expect(parseCollegiumDomainSnapshot(serialized)).toEqual(snapshot);
  });

  it("falls back to fixture when storage is unavailable", () => {
    const source = loadCollegiumDomainSnapshotSource(null);

    expect(source.kind).toBe("fixture");
    expect(source.snapshot.pilots).toHaveLength(3);
  });

  it("falls back to fixture when persisted data is invalid", () => {
    const storage = createMemoryStorage({
      [COLLEGIUM_DOMAIN_SNAPSHOT_STORAGE_KEY]: "{\"generatedAt\":123}",
    });

    const source = loadCollegiumDomainSnapshotSource(storage);

    expect(source.kind).toBe("fixture");
    expect(source.snapshot.deliberations).toHaveLength(2);
  });

  it("loads a persisted snapshot when storage contains a valid serialized snapshot", () => {
    const snapshot = buildDefaultCollegiumDomainSnapshot();
    const storage = createMemoryStorage({
      [COLLEGIUM_DOMAIN_SNAPSHOT_STORAGE_KEY]: serializeCollegiumDomainSnapshot(snapshot),
    });

    const source = loadCollegiumDomainSnapshotSource(storage);

    expect(source.kind).toBe("persisted_snapshot");
    expect(source.snapshot).toEqual(snapshot);
  });

  it("saves the snapshot into storage using the stable persistence key", () => {
    const snapshot = buildDefaultCollegiumDomainSnapshot();
    const storage = createMemoryStorage();

    const saved = saveCollegiumDomainSnapshot(snapshot, storage);

    expect(saved).toBe(true);
    expect(storage.dump()[COLLEGIUM_DOMAIN_SNAPSHOT_STORAGE_KEY]).toBe(
      serializeCollegiumDomainSnapshot(snapshot),
    );
  });
});
