---
{
  "id": "SRC-source-inventory",
  "kind": "note",
  "title": "源码入口与依赖",
  "status": "current",
  "generated_by": "project-map-source",
  "summary": "绑定 Git 工作区的入口、静态依赖、待补登记与待复核说明；供人和 LLM 按需查阅。"
}
---
# 源码入口与依赖

这里是绑定工作区的静态扫描结果。用于补查入口、依赖和说明缺口；未登记不代表架构错误，静态引用不等于运行时调用。

LLM 阅读入口：`project_map.py source <地图> --kind entrypoint|dependency|call|symbol|gap|review --query <名称或路径>`。结果支持分页，不必加载全量源码。

## 工作区 source

分支 `codex/independent-plugins-20260920`，提交 `9d21bf1d7028b3ddb3bc8b31f5cad259c9e291f8`；扫描 65 个文件。内容指纹 `94b79c974f5e4301`。

### 入口

- `package.json` #/main：package_entry → `dist/index.js`
- `package.json` #/exports/./types：package_entry → `./dist/index.d.ts`
- `package.json` #/exports/./default：package_entry → `./dist/index.js`
- `package.json` #/exports/.~1client/types：package_entry → `./dist/client.d.ts`
- `package.json` #/exports/.~1client/default：package_entry → `./dist/client.js`
- `package.json` #/exports/.~1api/types：package_entry → `./dist/api.d.ts`
- `package.json` #/exports/.~1api/default：package_entry → `./dist/api.js`
- `package.json` #/exports/.~1package.json：package_entry → `package.json`
- `package.json` #/exports/.~1transport/types：package_entry → `./dist/transport.d.ts`
- `package.json` #/exports/.~1transport/default：package_entry → `./dist/transport.js`
- `package.json` #/exports/.~1typert/types：package_entry → `./dist/typert.d.ts`
- `package.json` #/exports/.~1typert/default：package_entry → `./dist/typert.js`
- `package.json` #/exports/.~1protocol/types：package_entry → `./dist/protocol.d.ts`
- `package.json` #/exports/.~1protocol/default：package_entry → `./dist/protocol.js`
- `package.json` #/exports/.~1protocol~1data/types：package_entry → `./dist/protocol/data.d.ts`
- `package.json` #/exports/.~1protocol~1data/default：package_entry → `./dist/protocol/data.js`

### 依赖与待补登记

提取 263 项导入、3718 条静态调用/继承线索；待核对登记缺口 44 项。
- `src/action-channel.ts:1` → `src/api.ts`
- `src/action-channel.ts:2` → `src/transport.ts`
- `src/action-channel.ts:3` → `src/reference/bridge/reference-polling.ts`
- `src/api.ts:2` → `src/transport.ts`
- `src/api.ts:86` → `src/session-availability.ts`
- `src/binding-settings.tsx:2` → `src/binding-settings-style.ts`
- `src/binding-settings.tsx:3` → `src/api.ts`
- `src/business-page.ts:3` → `src/api.ts`
- `src/client-config.ts:2` → `src/api.ts`
- `src/client-config.ts:3` → `src/typert.ts`
- `src/client-config.ts:4` → `src/control-client.ts`
- `src/client.ts:1` → `src/vault-runtime.ts`

### 待复核说明

本次没有发现相对既有基线的变化；尚无人工核对基线的说明不因此视为有效。

### 覆盖范围

排除或不支持的文件 187 项，解析限制 3 项。仅扫描当前 Git 工作区，包含未忽略的新文件；不进入子仓库、依赖包或默认排除目录。动态调用、反射、路径别名及未支持语言需另行核对。完整清单通过 `--kind coverage` 查询。
