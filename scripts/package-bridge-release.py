"""Package this Bridge only, from freshly built dist and portable release docs."""
import argparse
import gzip
import hashlib
import io
import json
from pathlib import Path
import re
import subprocess
import tarfile

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--out', required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
out = Path(args.out).resolve()
if out == root or root in out.parents:
    raise SystemExit('Use an artifact directory outside the source checkout')
out.mkdir(parents=True, exist_ok=False)
manifest = json.loads((root / 'package.json').read_text(encoding='utf-8'))
payload = {}
for item in ['dist', 'cordis.patch.yml', 'README.md', 'LICENSE', 'CHANGELOG.md',
             'docs/cli-operations.md', 'docs/INSTALL-CLI.md', 'docs/RELEASE-20260922.md']:
    source = root / item
    if not source.exists():
        raise SystemExit(f'Missing input: {item}')
    for path in sorted(source.rglob('*')) if source.is_dir() else [source]:
        if not path.is_file() or path.suffix == '.map':
            continue
        if path.is_symlink():
            raise SystemExit(f'Unexpected symlink: {path.name}')
        data = path.read_bytes()
        if path.suffix in ('.js', '.mjs', '.cjs'):
            data = re.sub(r'^[\t ]*//(?:#(?:end)?region|# sourceMappingURL=)[^\r\n]*(?:\r?\n|$)', '',
                          data.decode('utf-8'), flags=re.M).encode('utf-8')
        payload[path.relative_to(root).as_posix()] = data
for field in ['devDependencies', 'scripts', 'packageManager']:
    manifest.pop(field, None)
for field in ['dependencies', 'optionalDependencies', 'peerDependencies']:
    for name, value in manifest.get(field, {}).items():
        if re.match(r'^(link|file|workspace):', value):
            raise SystemExit(f'Nonportable runtime dependency: {name}')
manifest['files'] = ['dist', 'cordis.patch.yml', 'README.md', 'LICENSE', 'CHANGELOG.md',
                     'docs/cli-operations.md', 'docs/INSTALL-CLI.md', 'docs/RELEASE-20260922.md']
payload['package.json'] = (json.dumps(manifest, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
for name, data in payload.items():
    if re.search(r'[A-Z]:[\\/](?:AI[\\/]|Users[\\/])', data.decode('utf-8'), re.I):
        raise SystemExit(f'Author-machine path in {name}')
buffer = io.BytesIO()
with tarfile.open(fileobj=buffer, mode='w') as archive:
    for name, data in sorted(payload.items()):
        info = tarfile.TarInfo('package/' + name)
        info.size = len(data)
        info.mode = 0o644
        info.mtime = 0
        archive.addfile(info, io.BytesIO(data))
artifact = f"{manifest['name']}-{manifest['version']}.tgz"
(out / artifact).write_bytes(gzip.compress(buffer.getvalue(), mtime=0))
for name, source in [('README.md', 'README.md'), ('INSTALL.md', 'docs/INSTALL-CLI.md'),
                     ('CLI-OPERATIONS.md', 'docs/cli-operations.md'), ('RELEASE.md', 'docs/RELEASE-20260922.md')]:
    (out / name).write_bytes(payload[source])
commit = subprocess.check_output(['git', '-C', str(root), 'rev-parse', 'HEAD'], text=True).strip()
dirty = subprocess.check_output(['git', '-C', str(root), 'status', '--porcelain'], text=True).splitlines()
hashes = {name: hashlib.sha256(data).hexdigest() for name, data in sorted(payload.items())}
(out / 'BUILD-INFO.json').write_text(json.dumps({'version': manifest['version'], 'sourceCommit': commit,
    'worktreeChanges': dirty, 'packageFiles': hashes, 'includesUserData': False,
    'includesOtherPlugins': False}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(out / 'SHA256SUMS.txt').write_text(''.join(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}\n'
    for p in sorted(out.iterdir()) if p.is_file()), encoding='utf-8')
print(json.dumps({'version': manifest['version'], 'files': len(payload), 'artifact': str(out / artifact)}))
