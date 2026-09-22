/** Fixed Adapter operations, sent through the official CLI. No other plugin API. */
export function fileOperationCode(command: string, parameters: Record<string, string | number | boolean>): string {
  // Base64 preserves Unicode, quotes and literal backslashes through the CLI parser.
  const payload = Buffer.from(JSON.stringify({ command, parameters }), 'utf8').toString('base64');
  return `(async () => {
    const {command, parameters:p} = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob('${payload}'), c => c.charCodeAt(0))));
    const a = app.vault.adapter;
    try {
      let result;
      if (command === 'config:dir') result = {path:app.vault.configDir};
      else if (command === 'fs:list') result = await a.list(p.path);
      else if (command === 'fs:stat') result = await a.stat(p.path);
      else if (command === 'fs:read') {
        const text = await a.read(p.path), offset = p.offset ?? 0, limit = p.limit ?? 12000;
        const end = Math.min(text.length, offset + limit);
        result = {content:text.slice(offset, end), offset, total:text.length, nextOffset:end < text.length ? end : null};
      } else if (command === 'fs:mkdir') {
        let parent = '';
        for (const part of p.path.split('/')) {
          parent = parent ? parent + '/' + part : part;
          if (!await a.exists(parent)) await a.mkdir(parent);
        }
        result = {path:p.path};
      } else if (command === 'fs:write' || command === 'fs:append') {
        if (command === 'fs:write') await a.write(p.path, p.content);
        else await a.append(p.path, p.content);
        result = {path:p.path, characters:p.content.length};
      } else if (command === 'fs:remove') {
        const stat = await a.stat(p.path);
        if (!stat) result = {path:p.path, removed:false};
        else {
          if (stat.type === 'folder') await a.rmdir(p.path, p.recursive === true);
          else await a.remove(p.path);
          result = {path:p.path, removed:true};
        }
      } else throw new Error('Unsupported file operation');
      return 'DSH_BRIDGE_FILE_RESULT:' + JSON.stringify({ok:true, result});
    } catch (_) {
      return 'DSH_BRIDGE_FILE_RESULT:' + JSON.stringify({ok:false});
    }
  })()`;
}

export function parseFileOperationOutput(output: string): unknown {
  const marker = 'DSH_BRIDGE_FILE_RESULT:';
  const start = output.indexOf(marker);
  if (start < 0) throw new Error('FILE_RESULT_UNCONFIRMED');
  const result = JSON.parse(output.slice(start + marker.length).trim()) as { ok?: boolean; result?: unknown };
  if (result.ok !== true) throw new Error('FILE_OPERATION_FAILED');
  return result.result;
}
