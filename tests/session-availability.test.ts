import {expect,it,vi} from 'vitest';
import {assertMaintenanceSessionAvailable} from '../src/session-availability.ts';
it.each(['not-synced','offline','mapping-pending','deleted','not-found'] as const)('keeps %s explicit before accessing a managed session',async status=>{
 const fetch=vi.fn(async()=>new Response(JSON.stringify({logicalSessionId:'logical',status})));
 await expect(assertMaintenanceSessionAvailable('logical',fetch as typeof globalThis.fetch)).rejects.toMatchObject({code:status});
});
it('allows optional Maintenance absence but refuses another logical identity',async()=>{
 await expect(assertMaintenanceSessionAvailable('logical',async()=>new Response(null,{status:404}))).resolves.toBeUndefined();
 await expect(assertMaintenanceSessionAvailable('logical',async()=>new Response(JSON.stringify({logicalSessionId:'other',status:'available'})))).rejects.toThrow('identity mismatch');
});
