import { describe, expect, it } from "vitest";
import { makeTempWorkspace, writeWorkspaceFile } from "../test-helpers/workspace.js";
import {
  DEFAULT_AGENTS_FILENAME,
  DEFAULT_IDENTITY_FILENAME,
  DEFAULT_MEMORY_ALT_FILENAME,
  DEFAULT_MEMORY_FILENAME,
  DEFAULT_SOUL_FILENAME,
  DEFAULT_TOOLS_FILENAME,
  filterBootstrapFilesForSession,
  loadWorkspaceBootstrapFiles,
} from "./workspace.js";

describe("loadWorkspaceBootstrapFiles", () => {
  it("includes MEMORY.md when present", async () => {
    const tempDir = await makeTempWorkspace("openclaw-workspace-");
    await writeWorkspaceFile({ dir: tempDir, name: "MEMORY.md", content: "memory" });

    const files = await loadWorkspaceBootstrapFiles(tempDir);
    const memoryEntries = files.filter((file) =>
      [DEFAULT_MEMORY_FILENAME, DEFAULT_MEMORY_ALT_FILENAME].includes(file.name),
    );

    expect(memoryEntries).toHaveLength(1);
    expect(memoryEntries[0]?.missing).toBe(false);
    expect(memoryEntries[0]?.content).toBe("memory");
  });

  it("includes memory.md when MEMORY.md is absent", async () => {
    const tempDir = await makeTempWorkspace("openclaw-workspace-");
    await writeWorkspaceFile({ dir: tempDir, name: "memory.md", content: "alt" });

    const files = await loadWorkspaceBootstrapFiles(tempDir);
    const memoryEntries = files.filter((file) =>
      [DEFAULT_MEMORY_FILENAME, DEFAULT_MEMORY_ALT_FILENAME].includes(file.name),
    );

    expect(memoryEntries).toHaveLength(1);
    expect(memoryEntries[0]?.missing).toBe(false);
    expect(memoryEntries[0]?.content).toBe("alt");
  });

  it("omits memory entries when no memory files exist", async () => {
    const tempDir = await makeTempWorkspace("openclaw-workspace-");

    const files = await loadWorkspaceBootstrapFiles(tempDir);
    const memoryEntries = files.filter((file) =>
      [DEFAULT_MEMORY_FILENAME, DEFAULT_MEMORY_ALT_FILENAME].includes(file.name),
    );

    expect(memoryEntries).toHaveLength(0);
  });

  it("includes persona files for subagents by default", async () => {
    const files = [
      { name: DEFAULT_AGENTS_FILENAME, path: "/tmp/AGENTS.md", missing: false },
      { name: DEFAULT_TOOLS_FILENAME, path: "/tmp/TOOLS.md", missing: false },
      { name: DEFAULT_SOUL_FILENAME, path: "/tmp/SOUL.md", missing: false },
      { name: DEFAULT_IDENTITY_FILENAME, path: "/tmp/IDENTITY.md", missing: false },
    ];
    const filtered = filterBootstrapFilesForSession(files, "agent:main:subagent:abc");
    const names = filtered.map((file) => file.name).sort();
    expect(names).toEqual([
      DEFAULT_AGENTS_FILENAME,
      DEFAULT_IDENTITY_FILENAME,
      DEFAULT_SOUL_FILENAME,
      DEFAULT_TOOLS_FILENAME,
    ]);
  });

  it("can disable persona inheritance for subagents", async () => {
    const files = [
      { name: DEFAULT_AGENTS_FILENAME, path: "/tmp/AGENTS.md", missing: false },
      { name: DEFAULT_TOOLS_FILENAME, path: "/tmp/TOOLS.md", missing: false },
      { name: DEFAULT_SOUL_FILENAME, path: "/tmp/SOUL.md", missing: false },
      { name: DEFAULT_IDENTITY_FILENAME, path: "/tmp/IDENTITY.md", missing: false },
    ];
    const filtered = filterBootstrapFilesForSession(files, "agent:main:subagent:abc", {
      config: { agents: { defaults: { subagents: { inheritPersona: false } } } },
    });
    const names = filtered.map((file) => file.name).sort();
    expect(names).toEqual([DEFAULT_AGENTS_FILENAME, DEFAULT_TOOLS_FILENAME]);
  });
});
