import { describe, expect, it, vi } from "vitest";
import { mountBridgeConfig } from "../src/client-config.ts";
import { LIFECYCLE_REMOTE_DESCRIPTORS } from "../src/typert.ts";
describe("host configured Bridge origin", () => {
  it("resolves a nondefault host origin through the authenticated remote namespace", async () => {
    const dispose = vi.fn(async () => {}); const mount = vi.fn(async () => dispose);
    const config = await mountBridgeConfig({ get: (key) => key === "remote" ? { $mount: mount } : { getBridgeConfig: async () => ({ ok: true, value: { origin: "http://localhost:28473" } }) } });
    expect(config.origin).toBe("http://localhost:28473"); expect(LIFECYCLE_REMOTE_DESCRIPTORS[0]?.method).toBe("getBridgeConfig"); await config.dispose(); expect(dispose).toHaveBeenCalledOnce();
  });
  it("cleans mounted descriptors if host configuration is unavailable", async () => {
    const dispose = vi.fn(async () => {});
    await expect(mountBridgeConfig({ get: (key) => key === "remote" ? { $mount: async () => dispose } : { getBridgeConfig: async () => ({ ok: false, error: { message: "offline" } }) } })).rejects.toThrow("offline"); expect(dispose).toHaveBeenCalledOnce();
  });
});

it("propagates host instance and profile identity to all mounted clients", async () => {
  const runtimeIdentity = { dshInstanceId: "instance-rc2", profileId: "web" };
  const config = await mountBridgeConfig({ get: (key) => key === "remote" ? { $mount: async () => async () => {} } : {
    getBridgeConfig: async () => ({ ok: true, value: { origin: "http://localhost:28473", runtimeIdentity } }),
  } });
  expect(config.runtimeIdentity).toEqual(runtimeIdentity);
  await config.dispose();
});
