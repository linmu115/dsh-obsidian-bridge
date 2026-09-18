import { afterEach, expect, it, vi } from "vitest";
import { BridgeActionChannel } from "../src/action-channel.ts";
import type { BridgeActionHandler } from "../src/api.ts";
const mocks = vi.hoisted(() => ({ create: vi.fn(), poll: vi.fn() }));
vi.mock("../src/transport.ts", () => ({createBridgeHttpClient:mocks.create}));
vi.mock("../src/reference/bridge/reference-polling.ts", () => ({startReferencePolling:mocks.poll}));
afterEach(()=>vi.clearAllMocks());
function fixture(role: "controller" | "surface" = "surface", embedded = true) {
 const dispose = vi.fn(), stop = vi.fn(), retry = vi.fn();
 mocks.create.mockReturnValue({dispose,nextActions:vi.fn(),acknowledgeAction:vi.fn(),acknowledgeDeepLink:vi.fn(),knowledge:vi.fn()});
 mocks.poll.mockReturnValue({stop,retry});
 let mount!:()=>()=>void;
 const lifecycle = {mountWhenReady:vi.fn((_name:string,callback:()=>()=>void)=>{mount=callback;return vi.fn();}),registerHealthSource:()=>vi.fn()};
 const channel = new BridgeActionChannel(lifecycle as never, {origin:"http://127.0.0.1:18473", role,profileId:"web",dshInstanceId:"instance", ...(embedded?{surfaceId:"surface"}:{})});
 const handler:BridgeActionHandler={accepts:()=>true,handle:vi.fn(async()=>"handled" as const)};
 channel.registerActionHandler("owner",handler);const unmount=mount();
 const receive=mocks.poll.mock.calls[0]![1] as (action:object,signal:AbortSignal)=>Promise<string>;
 return {channel,handler,unmount,stop,retry,dispose,receive:(action:object)=>receive(action,new AbortController().signal)};
}
it("keeps one runtime poller and hides cursor, ack and disposal from consumers",()=>{
 const f=fixture();f.channel.registerActionHandler("ordinary",{accepts:()=>false,handle:vi.fn()});expect(mocks.create).toHaveBeenCalledOnce();expect(mocks.poll).toHaveBeenCalledOnce();
 expect(f.channel.borrowedTransport).not.toHaveProperty("dispose");expect(f.channel.borrowedTransport).not.toHaveProperty("nextActions");expect(f.channel.borrowedTransport).not.toHaveProperty("acknowledgeAction");f.unmount();expect(f.stop).toHaveBeenCalledOnce();f.channel.dispose();expect(f.dispose).toHaveBeenCalledOnce();
});
it("ignores foreign profiles before handler matching and lets a following owned action through",async()=>{
 const f=fixture(); const deletion={type:"reference-delete-request",profileId:"foreign"};
 for(let i=0;i<501;i++)expect(await f.receive(deletion)).toBe("ignored");
 expect(f.handler.handle).not.toHaveBeenCalled();expect(await f.receive({...deletion,profileId:"web"})).toBe("handled");expect(f.handler.handle).toHaveBeenCalledOnce();f.channel.dispose();
});
it("preserves controller, viewer and instance boundaries",async()=>{
 const f=fixture("controller");expect(await f.receive({type:"reference-capture"})).toBe("ignored");expect(await f.receive({type:"deep-link"})).toBe("ignored");expect(await f.receive({type:"reference-delete-request",profileId:"web",dshInstanceId:"foreign"})).toBe("ignored");expect(f.handler.handle).not.toHaveBeenCalled();f.channel.dispose();
 const surface=fixture();expect(await surface.receive({type:"deep-link",targetSurfaceId:"other"})).toBe("ignored");expect(surface.handler.handle).not.toHaveBeenCalled();surface.channel.dispose();
 const standalone=fixture("surface",false);expect(await standalone.receive({type:"reference-capture"})).toBe("ignored");standalone.channel.dispose();
});
it("retains actions while their owner loads and rejects competing owners",async()=>{
 const f=fixture();const remove=f.channel.registerActionHandler("late",{accepts:()=>true,handle:vi.fn()});await expect(f.receive({type:"deep-link"})).rejects.toThrow("Multiple Bridge action owners");remove();
 expect(()=>f.channel.registerActionHandler("owner",f.handler)).toThrow("already registered");f.handler.accepts=()=>false;expect(await f.receive({type:"deep-link"})).toBe("retry");f.channel.dispose();
});
