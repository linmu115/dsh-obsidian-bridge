import { mkdtemp, readFile, writeFile, appendFile, mkdir, readdir, stat, rm, rmdir, realpath } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { runInNewContext } from 'node:vm';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { cliArgs, validateCliRequest, type CliParameters, type CliTarget } from '../src/obsidian-cli.ts';
import { parseFileOperationOutput } from '../src/cli-files.ts';

let root: string;
beforeEach(async () => { root = await realpath(await mkdtemp(join(tmpdir(), 'dsh-cli-files-'))); });
afterEach(async () => { if (dirname(root) === await realpath(tmpdir()) && root.startsWith(join(await realpath(tmpdir()), 'dsh-cli-files-'))) await rm(root, {recursive:true,force:true}); });
function context() {
  const adapter = {
    read: (p:string) => readFile(join(root,p),'utf8'), write: (p:string,c:string) => writeFile(join(root,p),c),
    append: (p:string,c:string) => appendFile(join(root,p),c), mkdir: (p:string) => mkdir(join(root,p)),
    exists: (p:string) => stat(join(root,p)).then(()=>true,()=>false),
    stat: (p:string) => stat(join(root,p)).then(s=>({type:s.isDirectory()?'folder':'file',size:s.size}),()=>null),
    remove: (p:string) => rm(join(root,p)),
    rmdir: (p:string,recursive:boolean) => recursive ? rm(join(root,p),{recursive:true}) : rmdir(join(root,p)),
    list: async (p:string) => {
      const entries = await readdir(join(root,p),{withFileTypes:true});
      return {files:entries.filter(e=>e.isFile()).map(e=>`${p}/${e.name}`),folders:entries.filter(e=>e.isDirectory()).map(e=>`${p}/${e.name}`)};
    },
  };
  return {app:{vault:{configDir:'.custom-obsidian',adapter}},TextDecoder,Uint8Array,atob};
}
async function execute(command:string, parameters:CliParameters = {}) {
  const args=cliArgs({root,nativeVaultId:'test-native'} as CliTarget,command,parameters);
  expect(args.slice(0,2)).toEqual(['vault=test-native','eval']);
  const output=await runInNewContext(args[2]!.slice(5),context());
  return parseFileOperationOutput('=> '+output) as any;
}
it('deploys hidden plugin files through the Adapter, preserves exact Unicode/backslashes, pages reads and removes files', async () => {
  expect(await execute('config:dir')).toEqual({path:'.custom-obsidian'});
  await execute('fs:mkdir',{path:'.custom-obsidian/plugins/test'});
  const path='.custom-obsidian/plugins/test/main.js', content='const x = "中文😀";\nconst re = /\\n/; // $(literal) `literal`';
  await execute('fs:write',{path,content});
  await execute('fs:append',{path,content:'\n// tail'});
  expect(await readFile(join(root,path),'utf8')).toBe(content+'\n// tail');
  expect(await execute('fs:read',{path,offset:2,limit:8})).toMatchObject({content:(content+'\n// tail').slice(2,10),nextOffset:10});
  expect(await execute('fs:list',{path:'.custom-obsidian/plugins/test'})).toEqual({files:[path],folders:[]});
  expect(await execute('fs:stat',{path})).toMatchObject({type:'file'});
  expect(await execute('fs:remove',{path})).toMatchObject({removed:true});
  expect(await execute('fs:stat',{path})).toBeNull();
});
it('requires explicit recursive deletion for a populated directory', async () => {
  await execute('fs:mkdir',{path:'.obsidian/plugins/test'});
  await execute('fs:write',{path:'.obsidian/plugins/test/main.js',content:'x'});
  await expect(execute('fs:remove',{path:'.obsidian/plugins/test'})).rejects.toThrow('FILE_OPERATION_FAILED');
  expect(await execute('fs:remove',{path:'.obsidian/plugins/test',recursive:true})).toMatchObject({removed:true});
});
it('runs arbitrary JavaScript with exact source text and promise results', async () => {
  const code='(async () => { app.example = "中文\\n"; return app.example; })()';
  const args=cliArgs({nativeVaultId:'test-native'} as CliTarget,'eval',{code});
  const env=context();
  expect(await runInNewContext(args[2]!.slice(5),env)).toBe('中文\n');
  expect(validateCliRequest('eval',{code}).write).toBe(true);
});
it.each([
  ['fs:remove',{path:''}], ['fs:mkdir',{path:'.'}], ['fs:write',{path:'.obsidian/a',content:3}],
  ['fs:read',{path:'.obsidian/a',offset:-1}], ['fs:read',{path:'.obsidian/a',limit:24001}],
  ['fs:read',{path:'.obsidian/a',limit:1.2}], ['fs:read',{path:12}],
])('rejects invalid file parameters: %s %j',(command,parameters)=>{
  expect(()=>validateCliRequest(command,parameters)).toThrow();
});
it('rejects a Unicode payload that exceeds the encoded transport limit before dispatch', () => {
  expect(()=>cliArgs({nativeVaultId:'test-native'} as CliTarget,'fs:write',{path:'.obsidian/a',content:'汉'.repeat(12000)})).toThrow('INPUT_TOO_LARGE');
});
