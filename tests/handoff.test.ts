import { expect, it, vi } from "vitest";
import { handoffReference } from "../src/reference/handoff.ts";
const source = {} as never;
function fixture() {
 const core = { addReference: vi.fn(async () => ({ setId: "set", referenceId: "ref", created: true })), discardPendingOperation: vi.fn(async () => undefined) };
 const input = { sessionId: "session", operationId: "op", prepare: vi.fn(async () => ({referenceId: "ref", source})), commit: vi.fn(async () => {}), assertCurrent: vi.fn() };
 return {core,input};
}
it("hands off prepared identity to Core and commits its persisted result", async () => {
 const {core,input}=fixture(); await handoffReference(core as never,input);
 expect(core.addReference).toHaveBeenCalledExactlyOnceWith("session",source,{operationId:"op",referenceId:"ref"}); expect(input.commit).toHaveBeenCalledWith({setId:"set",referenceId:"ref",created:true}); expect(core.discardPendingOperation).not.toHaveBeenCalled();
});
it.each(["add", "commit"])("uses Core compensation after a lost %s response",async stage=>{
 const {core,input}=fixture(); if(stage==="add")core.addReference.mockRejectedValue(Error("lost"));else input.commit.mockRejectedValue(Error("lost"));
 await expect(handoffReference(core as never,input)).rejects.toThrow("lost"); expect(core.discardPendingOperation).toHaveBeenCalledExactlyOnceWith("session","op");
});
it("does not prepare without Core or mutate Core after session changes",async()=>{
 const {core,input}=fixture(); await expect(handoffReference(undefined,input)).rejects.toThrow("Core is unavailable"); expect(input.prepare).not.toHaveBeenCalled();
 input.assertCurrent.mockImplementationOnce(()=>{}).mockImplementationOnce(()=>{throw Error("session changed")}); await expect(handoffReference(core as never,input)).rejects.toThrow("session changed"); expect(core.addReference).not.toHaveBeenCalled();
});
it("fences an identity mismatch through Core",async()=>{
 const {core,input}=fixture(); core.addReference.mockResolvedValue({setId:"set",referenceId:"wrong",created:true}); await expect(handoffReference(core as never,input)).rejects.toThrow("different reference"); expect(input.commit).not.toHaveBeenCalled(); expect(core.discardPendingOperation).toHaveBeenCalledOnce();
});
