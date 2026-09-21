"""Package prebuilt independent plugins without installing or starting Maintenance.

python scripts/package-independent-release.py --sources sources.json --out release
sources.json maps core, bridge, sticker, dag (its dsh directory), companion to source directories.
"""
import argparse
import gzip
import hashlib
import io
import json
from pathlib import Path
import re
import subprocess
import tarfile
import zipfile

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--sources', required=True)
parser.add_argument('--out', required=True)
args = parser.parse_args()
sources = json.loads(Path(args.sources).read_text(encoding='utf-8-sig'))
out = Path(args.out).resolve()
out.mkdir(parents=True, exist_ok=False)
layout = {'core': ['lib', 'cordis.patch.yml'], 'bridge': ['dist', 'cordis.patch.yml'],
          'sticker': ['lib', 'cordis.patch.yml'], 'dag': ['lib', 'dist-app', 'cordis.patch.yml', 'MANAGED.md'],
          'companion': ['main.js', 'styles.css', 'manifest.json', 'versions.json']}
inventory = []
for key, paths in layout.items():
    root = Path(sources[key]).resolve()
    manifest = json.loads((root/'package.json').read_text(encoding='utf-8-sig'))
    payload = {}
    for item in paths + ['README.md', 'LICENSE', 'docs/INSTALL.md', 'docs/RELEASE-20260920.md']:
        source = root/item
        if not source.exists(): raise RuntimeError(f'Missing release input: {key}/{item}')
        for path in sorted(source.rglob('*')) if source.is_dir() else [source]:
            if not path.is_file() or path.suffix == '.map': continue
            if path.is_symlink(): raise RuntimeError(f'Unexpected symlink: {path}')
            name = path.relative_to(root).as_posix()
            data = path.read_bytes()
            if path.suffix in ('.js','.mjs','.cjs'):
                text = data.decode('utf-8')
                text = re.sub(r'^[\t ]*//(?:#(?:end)?region|# sourceMappingURL=)[^\r\n]*(?:\r?\n|$)', '', text, flags=re.M)
                data = text.encode('utf-8')
            payload[name] = data
    emitted = '\n'.join(data.decode('utf-8') for name,data in payload.items() if name.endswith(('.js','.mjs','.cjs','.d.ts')))
    for field in ('dependencies','optionalDependencies','peerDependencies'):
        for name, spec in list(manifest.get(field, {}).items()):
            if re.match(r'^(link|file|workspace):', spec):
                if re.search(r'''(?:from\s*|import\s*\(|require\s*\()\s*["']''' + re.escape(name) + r'''(?:["'/])''', emitted):
                    raise RuntimeError(f'Unbundled local dependency: {key} -> {name}')
                del manifest[field][name]
    for field in ('devDependencies','scripts','packageManager'): manifest.pop(field, None)
    def clean_exports(value):
        if isinstance(value,dict):
            value.pop('development',None)
            for child in value.values(): clean_exports(child)
    clean_exports(manifest.get('exports'))
    manifest['private'] = False
    manifest['files'] = sorted(payload)
    payload['package.json'] = (json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode('utf-8')
    # A distributable must never require the author's machine or installed user data.
    for name,data in payload.items():
        if name.endswith(('.js','.mjs','.cjs','.json','.md','.yml','.ts')):
            text = data.decode('utf-8')
            if re.search(r'(?:[A-Z]:[\\/](?:AI[\\/]|Users[\\/]))', text, re.I):
                raise RuntimeError(f'Author-machine path in {key}/{name}')
    buffer = io.BytesIO()
    with tarfile.open(fileobj=buffer,mode='w') as archive:
        for name,data in sorted(payload.items()):
            info=tarfile.TarInfo('package/'+name); info.size=len(data); info.mode=0o644; info.mtime=0
            archive.addfile(info,io.BytesIO(data))
    artifact = f"{manifest['name']}-{manifest['version']}.tgz"
    (out/artifact).write_bytes(gzip.compress(buffer.getvalue(),mtime=0))
    commit=subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True).strip()
    dirty=bool(subprocess.check_output(['git','-C',str(root),'status','--porcelain'],text=True).strip())
    inventory.append({'component':key,'name':manifest['name'],'version':manifest['version'],'artifact':artifact,
                      'sourceCommit':commit,'sourceDirty':dirty,'files':len(payload)})
    if key == 'companion':
        with zipfile.ZipFile(out/f"{manifest['name']}-{manifest['version']}.zip",'w',compression=zipfile.ZIP_DEFLATED) as z:
            for name in ['main.js','styles.css','manifest.json','README.md','docs/INSTALL.md','docs/RELEASE-20260920.md']:
                z.writestr(zipfile.ZipInfo(name,(2026,9,20,0,0,0)),payload[name])
        for name in ['main.js','styles.css','manifest.json']: (out/name).write_bytes(payload[name])
    (out/f"{key}-README.md").write_bytes(payload['README.md'])
(out/'INSTALL.md').write_bytes(payload['docs/INSTALL.md'])
hashes={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(out.iterdir()) if p.is_file()}
(out/'BUILD-INFO.json').write_text(json.dumps({'schemaVersion':1,'host':'0.1.5-rc.2','packages':inventory,'files':hashes,
    'includesEngine':False,'includesUserData':False,'includesCredentials':False},indent=2)+'\n',encoding='utf-8')
hashes['BUILD-INFO.json']=hashlib.sha256((out/'BUILD-INFO.json').read_bytes()).hexdigest()
(out/'SHA256SUMS.txt').write_text(''.join(f'{digest}  {name}\n' for name,digest in sorted(hashes.items())),encoding='utf-8')
print(json.dumps({'out':str(out),'packages':inventory},ensure_ascii=False))
