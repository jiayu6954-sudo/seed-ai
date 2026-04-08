# devai — 操作步骤记忆库
> 按时间顺序记录每次创新实现、Bug 修复的具体操作步骤、修改文件和验证结果。  
> 用于快速回溯"当时做了什么"以及"为什么这样做"。

**最后更新：2026-04-09 · v0.9.1-alpha.24 (r39) · 下次更新节点：集成测试扩展（流式/Hooks路径）**

## 版本快速索引

| 版本节点 | 日期 | 内容 |
|---------|------|------|
| alpha.24 r39  | 2026-04-09 | DOCS: GitHub 诚实度修复 — 重复表格、过时创新编号、PR模板、评估报告更新 |
| alpha.24 r38  | 2026-04-08 | TEST: 首批 Agent Loop 集成测试 (4 场景) + 叙事基调修正 + 项目定位声明 |
| alpha.24 r37  | 2026-04-08 | DOCS: README 诚实重写 — 移除 "production-grade"，扩展已知局限 |
| alpha.24 r36c | 2026-04-08 | BUG FIX: CI #32–34 失败 — 新建文件未 git add 导致 import 断裂 |
| alpha.24 r36b | 2026-04-08 | BUG FIX: git_commit `--cached` 无效语法 + 系统测试 8 项全通过 |
| alpha.24 r36  | 2026-04-08 | I024 spawn_research · I025 git_commit · I026 CHECKPOINT · I027 Hooks |
| alpha.23 r35  | 2026-04-08 | I022 web_search · I021 Plan Mode · I023 Skills 框架 |
| alpha.22 r34  | 2026-04-07 | I019 /init · I020 工业交付工作流 · Windows/CDN 知识注入 |
| alpha.20 r33  | 2026-04-06 | I018 渲染自监控 · max_tokens file_write 专用 continue · doc generation 规则 |
| alpha.16 r32  | 2026-04-05 | I017 /diag 命令 · 上下文压缩跨提供商修复 |
| alpha.15 r31  | 2026-04-05 | I015 Static/Dynamic 渲染分离 · I016 Timer 抑制 · MAX_ITERATIONS 50→200 |
| v0.9.0 r30    | 2026-04-04 | I011 本地模型自发现 · I012 语义向量检索 · I013 本地模型记忆提取 |
| v0.8.0 r20    | 2026-04-03 | I001–I010 基础创新完成 · BUG FIX · UI 修复 |
| v0.6.0        | 2026-04-02 | P001 滚动修复 · P002 Shift+Enter 换行 |

---

## 2026-04-09 · v0.9.1-r39 (GitHub 诚实度修复 + 评估报告更新)

### [DOC] GitHub 文件质量全面核查

**触发**：用户要求"检查更新 GitHub 上已上传的文件，提高诚实度和共鸣性"。  
**方法**：逐一读取所有公开的 GitHub 文件，与实际代码状态对比，找出不一致项。

**发现并修复的 4 个问题：**

| # | 问题 | 文件 | 修复 |
|---|------|------|------|
| 1 | README 存在重复的 CC 对比表 | README.md | 删除旧的不完整版本（缺 I022–I027 功能行）；保留完整的 "Seed AI leads" 表 |
| 2 | 创新编号完全过时 | .github/CONTRIBUTING.md | `I001–I013/I016 (14个)` → `I001–I027 (27个)`；删除 "I015 = 下一步 Hooks"（已交付） |
| 3 | 根目录 CONTRIBUTING.md 多处过时 | CONTRIBUTING.md | clone URL 占位符修复；`I001–I016` → `I001–I027`；测试状态行更新 |
| 4 | 无 PR 模板（贡献者不知道 PR 规范）| .github/ | 新建 `PULL_REQUEST_TEMPLATE.md` |

**验证：** `npm run test:run` — 18 passed；`npm run typecheck` — 0 errors。  
**提交：** `8ba18b7`（已推送）

---

### [DOC] 评估报告（EVALUATION_REPORT.md）局部更新

**触发**：用户询问"评估报告需要重新评估吗？"

**结论：** 不需要整体重写，但有 8 处数据过时需要手术式更新。

**修复的 8 处：**

| § | 位置 | 旧内容 | 新内容 |
|---|------|--------|--------|
| §1 | 执行摘要 | "Vitest 14/14，集成测试为零" | "Vitest 18/18（14unit+4integration），Agent Loop 有 4 场景基础覆盖" |
| §5.2 | Vitest 结果 | "1 file，14 tests" | "2 files，18 tests" + 测试文件对照表 |
| §5.4 | 覆盖率表格 | Agent Loop ❌/❌ 最大盲区 | Agent Loop ❌/✅基础（4场景）|
| §6.3 | 文档列表 | WHITEPAPER "待更新至 I027" | WHITEPAPER "27项完整（alpha.24最新）" + 新增 PR_TEMPLATE 行 |
| §7.1 | 质量评分 | 测试覆盖 2/5，综合 4.1/5 | 测试覆盖 2.5/5，综合 4.15/5 |
| §7.2 | 最大风险 | "高：集成测试缺失" | "中→高：集成测试覆盖不完整" |
| §8.2 | 技术债务表 | Agent loop ❌ 需1-2月；WHITEPAPER ❌ 待更新 | Agent loop ⚠️ 基础已建立；WHITEPAPER ✅ 已完成 |
| §12 | 综合评级表 | 测试质量 ★★☆☆☆ 无变化 | 测试质量 ★★½☆☆ ↑ |

**提交：** `（待提交）`

---

## 2026-04-08 · v0.9.1-r38 (集成测试 + 项目定位)

### [TEST] 首批 Agent Loop 集成测试 — 4 场景

**文件**：`test/agent/loop-integration.test.ts`（新建）  
**提交**：`ea23376`

**背景**：Agent Loop 此前零自动化测试，是项目最大的可信度缺口。  
用户明确要求："不要再加新功能了 (I028-I030). 立即补充集成测试（优先级最高）"。

**方案**：Mock Provider 模式 — 无需真实 API Key，CI 可直接运行。

```typescript
function mockProvider(responses: NormalizedMessage[]): AIProvider {
  let callIndex = 0;
  return {
    stream(_params): ProviderStreamHandle {
      return mockStream(responses[callIndex++]);
    },
  } as unknown as AIProvider;
}
```

**4 个测试场景**：

| # | 场景 | 验证内容 |
|---|------|---------|
| 1 | `file_write` 端到端 | 文件实际创建、`tool_result.isError=false`、事件序列完整 |
| 2 | Zod 验证失败 | `isError=true`，错误信息含 "Invalid tool input"，Loop 不崩溃 |
| 3 | `maxIterations` 上限 | 超出 2 次后抛出 `/exceeded 2 iterations/`，同时 emit `error` 事件 |
| 4 | `[[CHECKPOINT]]` 检测 | emit `checkpoint` 事件，`stopReason="checkpoint"` |

**关键 TypeScript fix**：  
`PermissionDecision` 是字符串字面量联合类型 (`"allow" | "deny" | "allow-session"`)，不是对象。  
测试中用 `async () => "allow" as const`，而非 `async () => ({ action: "allow" })`。

**测试结果**：18 tests passed（14 unit + 4 integration）

---

### [DOCS] 叙事基调修正 + 项目定位声明

**背景**：用户对以下措辞提出批评：
- "production-grade" — 无 E2E 测试，不应自称生产级
- "27 delivered innovations beyond Claude Code" — "beyond" 有竞争性误导  
- 项目定位模糊（个人研究 vs 社区替代品）

**修改范围**（全部文件）：

| 文件 | 修改内容 |
|-----|---------|
| README.md | ⚠️ 警告更新、Known Limitations 更新、Quality 表格更新、新增 Project Positioning 章节 |
| WHITEPAPER.md | 版本号、创新计数、叙事基调全面更新 |
| CONTRIBUTING.md | 项目定位补充（"early-stage"、测试覆盖现状） |

**README 新增项目定位声明**（`## Project positioning` 章节）：

> Seed AI 是一个**个人研究性工程项目** — 一名维护者，无生产 SLA，无路线图承诺。  
> 它不是组织支持的 Claude Code 替代品，而是研究如何通过研究参考实现（Claude Code、DeerFlow-2.0）  
> 并构建针对性改进，单人工程师能推进 CLI AI 助手的边界的实验。

---

## 2026-04-08 · v0.9.1-r37 (README 诚实重写)

### [DOCS] README 叙事基调修正

**提交**：`7d28013`

**触发原因**：用户提出 4 点技术批评：
1. "production-grade" 措辞与零 E2E 测试现实矛盾
2. CC 对比缺少"CC 故意不做这些"的上下文
3. 单维护者风险在 README 中完全隐形
4. Haiku 压缩成本警告埋在功能列表中，用户在成本敏感决策前可能看不到

**修改内容**：

| 位置 | 前 | 后 |
|------|----|----|
| 标题副标题 | "production-grade" | "production-ready architecture, actively seeking production validation" |
| 创新描述 | "27 delivered innovations beyond Claude Code" | "27 design improvements inspired by Claude Code's architecture" |
| 顶部警告 | 无 | ⚠️ Maturity warning（E2E 测试、单维护者） |
| Known Limitations | 无此节 | 新增：测试覆盖表、单维护者风险、CC 比较范围说明 |
| CC 比较 | 直接进入表格 | 新增前言段落（"Claude Code 选择不做这些，不是失败"） |
| Quality & Testing | 含糊声明 | 详细分类表：已测 vs 未测，含风险级别 |

---

## 2026-04-08 · v0.9.1-r36c (CI 修复)

### [CI] GitHub Actions #32–#34 连续失败 — 新建文件漏 git add

**现象**：推送 `09b8a8b`（I024–I027 主提交）后，CI `typecheck` 步骤立即报错：

```
error TS2307: Cannot find module '../../agent/research-loop.js'
error TS2307: Cannot find module '../hooks/runner.js'
error TS2307: Cannot find module './git-commit.js'
```

**根因分析**：

| 提交 | 推送内容 | 缺失文件 | CI 结果 |
|------|---------|---------|--------|
| `09b8a8b` | registry.ts + useAgentLoop.ts（含 import） | `research-loop.ts` `hooks/runner.ts` `git-commit.ts` | ❌ #32 |
| `34f4c4e` | OPERATIONS.md 文档 | 同上 | ❌ #33 |
| `8b1ca5f` | 补上 `git-commit.ts` | `research-loop.ts` `hooks/runner.ts` | ❌ #34 |
| `16d33a5` | 补上 `research-loop.ts` `hooks/runner.ts` | — | ✅ #35 |

**原因**：三个新建源文件（非 `git add -u` 可追踪）在 `git add -u` 时被跳过，因为它们是全新的 untracked 文件，必须显式 `git add <path>` 才能纳入版本控制。

**修复**：在 `16d33a5`（README 文档提交）中补 `git add src/agent/research-loop.ts src/hooks/runner.ts`，CI 恢复绿色。

**经验教训（防止复发）**：
- 新建文件后务必用 `git status` 检查 untracked 列表
- 提交前执行 `git status --short` 确认所有新文件已 staged（`A` 状态而非 `??`）
- 本地 `npx tsc --noEmit` 通过 ≠ CI 通过：本地有工作目录，CI 只有 git 追踪文件

**验证**：本地 `npx tsc --noEmit` + `npm run test:run` 14/14 通过，CI badge 已恢复。

---

## 2026-04-08 · v0.9.1-r36b (alpha.24 bugfix)

### [BUG] git_commit — `git status --porcelain --cached` 无效语法

**文件**：`src/tools/git-commit.ts`（第 52 行）

**问题**：`git status` 不接受 `--cached` 参数，导致检测暂存区是否为空时命令报错，进入 catch 分支，误判为"无法提交"。

**修复**：改用正确命令 `git diff --cached --name-only`
- 有暂存内容时：输出文件名列表（非空字符串）
- 无暂存内容时：输出空字符串 → 返回 "Nothing to commit" 提示

**发现方式**：实际测试 T2/T7 执行时捕获，测试代理 `a75579e9fa2ab400e` 自动修复并验证。

**提交**：`8b1ca5f`

---

## 2026-04-08 · v0.9.1-r36 (alpha.24)

### [I024] spawn_research — 孤立研究子智能体循环

**文件**：`src/agent/research-loop.ts` (新建), `src/tools/registry.ts`, `src/tools/definitions.ts`, `src/types/tools.ts`

**实现要点**：
- `ResearchRunner` 工厂函数类型注入 ToolRegistry — 避免循环导入
- `runResearchLoop()` 创建受限 ToolRegistry（allowedTools = web_search + web_fetch），auto-approve PermissionManager
- depth="basic" → maxIterations=6；depth="deep" → maxIterations=15
- 子循环结束标记：`[[RESEARCH_COMPLETE]]`，`extractSummary()` 从 history 最新消息逆向扫描
- `useAgentLoop.ts` 创建 `researchRunner` 闭包，注入主 ToolRegistry 构造函数

---

### [I025] git_commit — Git 工程交付闭环工具

**文件**：`src/tools/git-commit.ts` (新建), `src/tools/registry.ts`, `src/tools/definitions.ts`, `src/types/tools.ts`, `src/config/schema.ts`

**实现要点**：
- `git add -u`（或指定文件）+ `git commit -m` + `git show --stat --oneline HEAD`
- 默认权限：`ask`（需要用户确认）
- conventional commit 格式：`type(scope): description`

---

### [I026] CHECKPOINT — 人在回路检查点

**文件**：`src/agent/loop.ts`, `src/types/agent.ts`, `src/ui/hooks/useAgentLoop.ts`

**实现要点**：
- `CHECKPOINT_RE = /\[\[CHECKPOINT(?::\s*(.*?))?\]\]/s`
- `end_turn` 分支检测标记，剥离后保留 AI 文本，emit `{ type: "checkpoint", message }`
- `useAgentLoop.ts` checkpoint 事件：finalizeLastMessage + 显示 ⏸ 系统消息 + onStateChange("idle")
- 用户回复后正常 submit 恢复

---

### [I027] Hooks — PreToolUse / PostToolUse Shell 钩子

**文件**：`src/hooks/runner.ts` (新建), `src/tools/registry.ts`, `src/config/schema.ts`

**实现要点**：
- `HookDef { tool, command, failBehavior }` + `HooksConfig { preToolUse, postToolUse }`
- 模板变量：`${toolName}` `${path}` `${command}` `${query}` `${url}` `${cwd}`
- `failBehavior="warn"`：钩子失败仅注记；`failBehavior="block"`：将工具结果转为错误
- pre-hook blocked → 立即返回错误，不执行工具；post-hook 输出追加到 result
- 配置路径：`~/.seed/settings.json` → `hooks.preToolUse` / `hooks.postToolUse`

---

## 2026-04-08 · v0.9.1-r35

### [I022] web_search 工具 —— 多提供商网络搜索

**背景：** DeerFlow-2.0 学习笔记。DeerFlow 的 Researcher Sub-Agent 核心能力就是多提供商搜索。Seed AI 只有 web_fetch（需要知道 URL），无主动搜索能力，调研类任务严重受限。

**实现：** `src/tools/web-search.ts`（新文件）
- 四个提供商，自动降级：Tavily → Brave → Serper → DuckDuckGo（免费兜底）
- DuckDuckGo：抓取 `lite.duckduckgo.com/lite/`，native fetch + curl.exe fallback
- 自动选择：`settings.search.tavilyApiKey` 有则用 Tavily，否则依次尝试
- 搜索结果缓存 3 分钟（比 web_fetch 的 5 分钟更短，搜索结果变化更快）

**配置 `~/.seed/settings.json`：**
```json
{
  "search": {
    "defaultProvider": "auto",
    "tavilyApiKey": "tvly-...",
    "braveApiKey": "BSA...",
    "serperApiKey": "..."
  }
}
```
无 API key → DuckDuckGo 自动生效，零配置可用。

**权限：** `web_search` 默认 `auto`（不提示用户），等同于 web_fetch 的 ask 策略。

**工作流范式（写入系统提示）：**
```
web_search → 发现相关 URL → web_fetch 具体页面 → 综合信息
```

**修改文件：**
- `src/tools/web-search.ts` — 新建
- `src/types/tools.ts` — 新增 WebSearchInput, ToolName 扩展
- `src/tools/definitions.ts` — 新增工具定义
- `src/tools/registry.ts` — 新增 case + 构造函数 searchConfig 参数
- `src/tools/cache.ts` — 新增 web_search 到可缓存工具集
- `src/config/schema.ts` — 新增 search 配置块 + web_search 权限
- `src/config/settings.ts` — allowAll/denyAll 新增 web_search 字段
- `src/agent/system-prompt.ts` — 更新工具使用说明
- `src/ui/hooks/useAgentLoop.ts` — 传入 searchConfig 到 ToolRegistry

---

## 2026-04-08 · v0.9.1-r34

### [I021] Plan Mode —— 结构化规划先行，执行后置

**背景：** DeerFlow-2.0 Planning Module。复杂任务（构建系统、重构架构）需要先规划再执行，防止中途方向错误导致大量返工。

**实现：** `/plan <任务描述>` 斜杠命令
- 新增 SlashResult 类型：`{ type: "rewrite"; input: string }`
- `/plan <task>` → 将用户输入重写为结构化规划提示（含 "DO NOT use any tools yet" 指令）
- 重写后的提示发给 LLM，用户界面仍显示原始输入
- LLM 返回：目标重述 + 编号阶段 + 关键决策 + 验证步骤 + 确认问题
- 用户回复 "yes" / "调整X" / "stop" 决定是否执行

**规划提示模板核心指令：**
```
**[PLAN MODE]** Before writing any code or using any tools, produce a detailed execution plan.
...
DO NOT use any tools yet.
After presenting the plan, ask: 'Proceed with this plan? (reply yes / adjust X / stop)'
```

**修改文件：**
- `src/commands/slash.ts` — 新增 /plan 命令 + SlashResult "rewrite" 类型
- `src/ui/hooks/useAgentLoop.ts` — 处理 "rewrite" 类型（替换 effectiveInput）

---

## 2026-04-08 · v0.9.1-r33

### [I023] Skills 框架 —— 可复用任务工作流定义

**背景：** DeerFlow-2.0 Markdown-based Skills 系统。用户积累的最佳实践（白皮书写法、调试流程、功能开发规范）可以持久化为可复用 Skill 文件，AI 在对应场景自动遵循。

**实现：** `src/skills/loader.ts`（新文件）+ 系统提示注入

**文件结构：**
```
~/.seed/skills/
├── whitepaper.md        # 白皮书生成工作流
├── debug-workflow.md    # 调试步骤规范
└── feature-implementation.md  # 功能实现协议
```

**Skill 文件格式：**
```markdown
---
name: Whitepaper Generation
triggers: [whitepaper, 白皮书, technical report]
---
工作流内容...
```

**工作原理：**
1. `initDefaultSkills()` 首次启动时创建三个默认 skill 文件
2. `loadSkills()` 扫描 `~/.seed/skills/*.md`，解析 frontmatter
3. `matchSkills(skills, userMessage)` 按 trigger 关键词匹配
4. `formatSkillsForPrompt()` 将匹配的 skill 注入系统提示
5. 无 trigger 的 skill = 全局 skill，每次都注入

**默认 Skills（首次启动自动创建）：**
- `whitepaper.md` — 触发词：whitepaper/白皮书/technical report
- `debug-workflow.md` — 触发词：debug/fix bug/调试/报错
- `feature-implementation.md` — 触发词：implement/build/实现/开发

**新增斜杠命令：**
- `/skill` — 列出已加载的所有 skill 及其触发词

**修改文件：**
- `src/skills/loader.ts` — 新建（loader + matcher + formatter + defaultInit）
- `src/agent/system-prompt.ts` — 导入并注入匹配的 skills
- `src/commands/slash.ts` — 新增 /skill 命令
- `src/index.ts` — 启动时调用 initDefaultSkills()

---

## 2026-04-07 · v0.9.1-r32

### [战略洞察] Seed AI 智能上限分析 —— 用户揭示真实目标

**用户测试结论：** CDN 项目不是真正目标，它只是能力测试载体。
真实目标：**让 Seed AI 能像 Claude Code 一样智能**。

**三层影响因素分析（按影响权重排序）：**

| 层次 | 因素 | 对智能的影响 |
|------|------|-------------|
| 1 | **模型本身** | 70% — DeepSeek-chat vs Claude Sonnet 4.6，推理/规划/判断力天壤之别 |
| 2 | **系统提示质量** | 20% — 已通过 alpha.20–22 大幅提升（文档生成例外、工业交付意识、项目初始化协议） |
| 3 | **记忆架构** | 10% — alpha.19 修复后已工作，但模型性能是根本限制 |

**核心建议（已告知用户）：**
更换 `~/.seed/settings.json`:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "anthropicApiKey": "sk-ant-..."
}
```
使用 Anthropic Claude Sonnet 4.6 可使系统智能达到 Claude Code 同等水平。
架构（工具并行、记忆系统、系统提示）均不需要变动。

**规律（写入记忆防止重复说明）：**
> Seed AI 的架构创新（I001–I018）是基础设施，但上限取决于驱动它的模型。
> 建议用户使用 Anthropic API key 以发挥系统全部潜力。

---

## 2026-04-07 · v0.9.1-r31

### [I019] /init 命令 —— 项目上下文持久化脚手架

**用户需求：** 每次开新项目时需手动向 AI 解释项目背景，重启后失忆。

**实现：** `src/commands/slash.ts` 新增 `/init` 命令
- 扫描项目根目录前40个文件/目录
- 创建 CLAUDE.md 脚手架（仅当文件不存在时）
- 包含：项目描述、技术栈、架构、关键决策、常用命令、已知问题、交付标准
- 返回引导消息，让用户继续让 AI 填写内容

```
/init → 扫描文件 → 写 CLAUDE.md → AI 后续填写 → 持久化跨会话记忆
```

**工作原理：** CLAUDE.md 由 `buildSystemPrompt` 在每次启动时自动注入系统提示，
压缩（compact）和重启后依然保持项目上下文。

**对比 /diag（I017）：** /diag 读取运行时错误日志；/init 写入持久化项目知识。

---

### [I020] 工业交付工作流感知 —— 系统提示大升级 (alpha.21)

**来源：** 用户分享真实工作流文档（CDN 项目从零构建的完整操作记录）。

**注入 `src/agent/system-prompt.ts` 的新知识：**

#### 工业交付六阶段识别
```
1. 需求分析 → 2. 架构设计 → 3. 环境准备 → 4. 核心实现 → 5. 集成测试 → 6. 文档交付
```
AI 能识别当前阶段，主动推进到下一阶段，不等待用户逐步引导。

#### 标准报告结构意识
对白皮书/技术报告，AI 先宣布章节大纲（announce section outline），
逐章写入 file_write，整个文档完整交付。

#### Windows/容器环境操作习惯
- proxy 检查（curl.exe 测试连通）
- Docker Compose 网络名规则（`<dir>_<network>`）
- PowerShell path 需 `\` 分隔，不能混用
- 证书生成（cfssl / openssl）路径验证

#### CDN/基础设施技术栈知识
- OpenResty 缺模块需 `--add-module` 重编译（不能 apt 替代）
- Nginx DNS 在 Docker 中必须配置 `resolver 127.0.0.11 valid=30s`
- Go 交叉编译（GOOS/GOARCH 环境变量）
- Docker Compose 两阶段网络（build 阶段无 overlay）
- cfssl / openssl 证书链生成

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.21`
**GitHub：** 已推送 main

---

### [补充] alpha.20 —— maxTokens 设置修复 + 更智能的 file_write 续接

**`~/.seed/settings.json`（用户本地）：**
`"maxTokens": 16000` → `65536`（直接编辑，立即生效）

**`src/agent/loop.ts`：** max_tokens 文件写入专属续接消息
```typescript
const continueMsg = isFileWrite
  ? "The file write was cut off due to output length. Do NOT offer a simplified version. " +
    "Write the NEXT section of the document directly using file_write (append mode or a new section file). " +
    "Continue the full content without repeating what was already written."
  : `The tool call (${toolNames}) was cut off. Resume the task from where you left off.`;
```
明确禁止模型降级为精简版，直接续写下一节。

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.22`
**GitHub：** 已推送 main

---

## 2026-04-07 · v0.9.1-r30

### [严重BUG] 自进化记忆（I007）从未工作过 —— extractAndSaveMemory 硬编码 Anthropic

**用户现象：** 3~4轮对话后系统完全失忆，下次启动重新从零开始。

**日志铁证：**
```
memory.extract.failed 403  ← 每次会话结束都出现，从未成功过
```

**根因（"Anthropic硬编码"模式第三次出现）：**
`src/memory/long-term.ts` 中：
- `extractFromConversation(..., anthropicKey)` → `new Anthropic({ apiKey })`
- `extractAndSaveMemory(..., anthropicKey, enabled)` — 守卫：`!anthropicKey.startsWith("sk-ant-")`
守卫有时通过（anthropicKey="" 是 falsy，但 settings.apiKey??"" 某些路径不为空）→ 直接调 Anthropic → 403。
结果：`~/.seed/memory/projects/` 目录始终为空，自进化逻辑从未存过任何记忆。

**修复：** `src/memory/long-term.ts` + `src/ui/hooks/useAgentLoop.ts`
- `extractFromConversation(conversation, existing, provider: AIProvider, model: string)` — 改用 provider.stream()
- `extractAndSaveMemory(projectPath, messages, provider, model, enabled)` — 删除 anthropicKey 参数
- 删除 `EXTRACTION_MODEL = "claude-haiku-4-5-20251001"` 常量
- 删除所有 anthropicKey 守卫，所有 provider 均可提取记忆

**自进化现在真正激活：**
会话结束 → 提取知识写 `~/.seed/memory/projects/<指纹>/` → 下次启动注入系统提示
用户可用 `/memory` 查看已存储记忆。

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.19`
**GitHub：** 已推送 main

**全局记忆同步：** `~/.claude/projects/d--claude-devai/memory/project_devai.md` 已更新
包含：I015–I018创新、所有"Anthropic硬编码"bug修复记录、工具边界bug、当前版本状态。

**规律（第三次，必须牢记）：**
> 任何内部 LLM 调用（压缩摘要、记忆提取）必须用 AIProvider 抽象。
> 禁止在 provider 层以外直接 `new Anthropic()`。
> 已修复：compactWithSummary ✓ / extractFromConversation ✓ / 全部清零。

---

## 2026-04-07 · v0.9.1-r29

### [BUG] 白皮书/文档生成被截断，系统主动提供"精简版"

**用户测试发现：**
要求系统生成完整详尽的白皮书，系统提示"由于长度限制，创建精简版本"并输出压缩内容。

**根因：** `src/agent/system-prompt.ts` 全局 Tone 指令
```
"Your responses should be short and concise."
"Be extra concise. Keep text output brief and direct."
```
模型将此指令应用于所有输出类型，包括用户明确要求的长篇文档。
遇到白皮书任务，模型主动选择"精简"以遵守 conciseness 指令 → 用户无法获得完整文档。

**修复：** `src/agent/system-prompt.ts` —— 新增文档生成例外段落
```
# Document generation (EXCEPTION to conciseness rules)
- NEVER offer "simplified"/"condensed" version unless user asks
- Write COMPLETE document in a single file_write call
- If very long: section-by-section file_write, do NOT truncate
- Do not warn about or apologize for length
- Conciseness rules apply to conversational replies ONLY
```

**补充配置（用户可调）：** `~/.seed/config.json`
```json
{ "maxTokens": 65536 }
```
默认 32000，最大支持 128000。

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.18`
**GitHub：** 已推送 main（commit: feat(system-prompt): document generation exception）

**规律（防止再犯）：**
> 全局 conciseness 指令必须明确列出例外场景（文档、报告、白皮书、规格书）。
> 否则模型会将"简洁"理解为所有场景均适用，主动降级输出质量。

---

## 2026-04-07 · v0.9.1-r28

### [严重BUG] 2轮对话后系统无输出 —— 两个级联 400 错误

**日志铁证：**
```
loop.max_tokens_continue  iteration=14  ← max_tokens 触发自动续接
oai.stream.error deepseek-chat API 400:
  "An assistant message with 'tool_calls' must be followed by tool messages"
                                          ← 续接后立刻 400，系统静默停止
context.compact.start total=50
oai.stream.error deepseek-chat API 400:
  "Messages with role 'tool' must be a response to a preceding message"
                                          ← 压缩摘要也 400，无法恢复
```

**根因1 — max_tokens 续接 bug（新 bug，r27 引入）：**
max_tokens 触发时，模型正处于调用工具的输出过程中，content 里含有 `tool_use` 块。
直接注入 "continue" user 消息 → 消息序列：assistant(tool_calls) → user(text)。
DeepSeek/OAI 要求：assistant(tool_calls) 后必须跟 user(tool_results)。
结果：下一次 API 调用立刻 400 → 系统无输出。

**修复：** `src/agent/loop.ts`
- max_tokens 时检查 `message.content` 里是否有 `tool_use` 块
- 有则先注入 dummy `is_error=true` tool_results（每个 tool_use 一个占位结果）
- 再注入 "continue" 消息，保证消息序列合法

**根因2 — compactWithSummary 原始切片含孤立 tool 消息（既有问题）：**
`toSummarize = messages.slice(0, N)` 两端可能：
- 开头：user(tool_result) 无对应 assistant(tool_calls) → 孤立头部
- 结尾：assistant(tool_calls) 无对应 user(tool_results) → 孤立尾部
发给 DeepSeek 做摘要时 400。

**修复：** `src/agent/context.ts`
- 新增 `dropTrailingToolCalls(msgs)` 函数：从尾部向前扫，删除末尾含 tool_use 的 assistant 消息
- `compactWithSummary` 发送前：先 `dropOrphanedToolResults`（头部），再 `dropTrailingToolCalls`（尾部）
- 清理后为空则直接写占位摘要，不发 API

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.17`
**GitHub：** 已推送 main（commit: fix(context): clean tool_call boundaries）

**关键规律（写入记忆防止再犯）：**
> 任何对消息历史进行切片操作（compact、summarize、max_tokens 续接）后，
> 必须同时处理两端孤立 tool 消息：
> - 头部：`dropOrphanedToolResults` — 删除无对应 tool_calls 的 tool_result
> - 尾部：`dropTrailingToolCalls` — 删除无对应 tool_results 的 tool_calls
> DeepSeek/OAI 对消息顺序严格校验，任何违规直接 400。

---

## 2026-04-07 · v0.9.1-r27

### [严重BUG] 上下文记忆彻底失效 —— compactWithSummary 调用了错误的 Provider

**日志铁证（每次对话都在重复）：**
```
context.compact.summary_failed 403 Request not allowed   ← Haiku API 被拒绝
memory.extract.failed          403 Request not allowed   ← 同一根因
```

**根因（操作记忆库未记录过，第一次发现）：**
`compactWithSummary(apiKey)` 收到的是 `settings.apiKey`，而 `settings.apiKey` 是 **Anthropic key 字段**。
用户用 DeepSeek 时，`settings.apiKey` 为 undefined，fallback 到 `process.env.ANTHROPIC_API_KEY`（也为空）→ 空字符串 key 去请求 Anthropic Haiku → 403。
`if (anthropicKey)` 的守卫错了：空字符串 `""` 是 falsy，BUT `settings.apiKey ?? ""` 返回空字符串，而 `""` 是 falsy → 守卫**有时**生效、有时不生效，取决于环境变量。
本质：用了**固定的 Anthropic SDK**，而非当前 provider。
结果：每次压缩零摘要，AI 彻底失忆，做过的事情重新做。

**修复：** `src/agent/context.ts`
- 删除 `import Anthropic from "@anthropic-ai/sdk"`
- `compactWithSummary(apiKey: string)` → `compactWithSummary(provider: AIProvider, model: string)`
- 内部改用 `provider.stream(...)` 调摘要，DeepSeek 用 DeepSeek，Anthropic 用 Anthropic，任何 provider 均可

**同步更新：** `src/ui/hooks/useAgentLoop.ts`
- `/compact` slash 命令：`compactWithSummary(anthropicKey)` → `compactWithSummary(createProvider(settings), settings.model)`
- 自动压缩：删除 `if (anthropicKey)` 分支，统一调用 `compactWithSummary(provider, settings.model)`

---

### [BUG] Max tokens (16000) 到达后系统硬停止

**根因：** `loop.ts` 遇到 `stop_reason === "max_tokens"` 时直接 throw error，任务中断。
**修复：** `src/agent/loop.ts`
- max_tokens 时自动注入 user 消息：`"Continue exactly from where you left off, without repeating anything."`
- 追加 `[output truncated — continuing…]` 文字提示，继续循环而不是抛错

**同步：** `src/config/schema.ts`
- 默认 `maxTokens`: 16000 → **32000**，减少触发频率

---

### [BUG] Shift+Enter 在 Windows Terminal 无效 —— OS 层拦截

**根因（操作记忆库未记录过）：**
Windows Terminal 将 Shift 键用作**中英文输入法切换**，在 OS 层消费掉，
转义序列 `\x1b[13;2u` / `\x1b[27;2;13~` 根本不到达应用进程。
这是 Windows Terminal 的设计，无法在应用层绕过。

**修复：** 放弃 Shift+Enter，改为无 OS 拦截的 `Ctrl+J`（已在 InputBar 实现）
- `src/ui/app.tsx`：底部提示 `Shift+Enter newline` → `Ctrl+J newline`
- `src/commands/slash.ts`：`/help` 快捷键列表同步更新

---

### [观察] streaming 状态 rps=6~24 是正常值，非抖动根因

I018 渲染监控显示：streaming 时 `render.high_frequency rps=8~24`。
80ms flush interval = 约 12.5fps，属正常范围。调高阈值从 5 → 20，
只有真正异常的额外重绘来源（如第二个 setInterval）才触发 WARN。
permission_prompt 阶段闪烁已在 r25 修复（timer 抑制）。

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.15`（tool_use 高度修复）+ `@0.9.1-alpha.16`（本批次）
**GitHub：** 已推送 main（commit: fix(memory+tokens)）

---

## 2026-04-06 · v0.9.1-r26

### [BUG] streaming 时 completed tool_use 删除导致高度跳变残影

**根因（新发现）：** `tailMessage` Pass1 直接 filter 掉 completed tool_use，
多行 → 0 行的高度突变让 Ink 算错要擦多少行 → 擦不干净 → 残影叠影。

**修复：** `src/ui/app.tsx` — tailMessage Pass1
- 不再删除 completed tool_use，改为替换为单行文字：`✓ tool_name` / `✗` / `⊘`
- 高度只减 N-1，平滑过渡，Ink cursor 不漂移

### [BUG] MAX_ITERATIONS=50 复杂任务中途停止

**修复：** `src/agent/loop.ts` — MAX_ITERATIONS: 50 → **200**

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.15`

---

## 2026-04-06 · v0.9.1-r25

### [BUG] permission_prompt 阶段闪烁抖动 + 创新 I018 渲染自监控

**根因（两个独立问题）：**

1. **Timer 未抑制（BUG）：** `StatusBar` 的 spinner interval（200ms）和 elapsed interval（1000ms）在 `permission_prompt` 状态下仍然运行，每次触发 `setState` → Ink 重绘动态区 → 屏幕抖动。此前只抑制了 `streaming` 状态，`permission_prompt` 被遗漏。

2. **渲染不可见（设计缺陷）：** 渲染层抖动问题只能靠用户肉眼观察反馈，无日志可查，无法定量分析。

**修复：** `src/ui/components/StatusBar.tsx`
- spinner effect：`|| state === "permission_prompt"` 加入提前返回条件
- elapsed effect：`|| state === "permission_prompt"` 加入提前返回条件
- permission_prompt 期间两个 interval 均不启动 → 零 repaint

**创新 I018 渲染自监控：** `src/ui/app.tsx`
- 组件体中实时统计 repaints/sec（每帧自增 renderCountRef，每秒统计）
- 当 rps > 5 时写入 `logger.warn("render.high_frequency", { state, rps, TAIL_LINES, termRows, termCols })`
- `useEffect([appState])` 记录每次状态转换：`render.state_change` 含 dynamicZoneEst + overflowRisk
- **重要定位：** I018 是"开发者（Claude）↔ 测试员（用户）"的连接工具——用户测试时系统自动将渲染行为写入日志，Claude 直接读取日志即可定量分析抖动，无需用户描述"几秒抖几次"
- 工作流：用户测试 → 出现抖动 → Claude 读 `~/.seed/debug.log` 查 `render.high_frequency` → 立即定位根因

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.14`
**GitHub：** 已推送 main（commit: fix(render): suppress permission_prompt timers; add I018）

---

## 2026-04-06 · v0.9.1-r24

### [BUG] 上下文压缩后 DeepSeek API 400：孤立 tool_result 消息

**日志发现（直接读取 ~/.seed/debug.log）：**
```
Messages with role 'tool' must be a response to a preceding message with 'tool_calls'
```

**根因：** `compact()` / `compactWithSummary()` 对历史进行 slice 后，
切割点可能落在 assistant `tool_calls` 消息之后、user `tool_result` 消息之前。
结果：保留的历史以 user(tool_result) 开头，但对应的 assistant(tool_calls) 已被删除。
OAI 兼容 API（DeepSeek）严格要求 tool_result 必须紧跟 tool_calls，否则 400。

**修复：** `src/agent/context.ts`
- 新增 `dropOrphanedToolResults(msgs)` 函数：
  检测历史开头是否有仅含 tool_result 的 user 消息，逐条跳过直到找到干净边界
- `compactWithSummary()` 和 `compact()` 在 slice 后均调用此函数清理

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.13`

**关于日志读取工作流：**
我可以直接读取 `~/.seed/debug.log`，无需用户手动贴出。
这是比 `/diag` 命令更高效的调试方式——发现问题后立即修复，无需等待用户反馈。

---

## 2026-04-06 · v0.9.1-r23

### [BUG] 每次会话大量 403 错误 + 新创新：/diag 命令

**日志诊断发现（通过读取 ~/.seed/debug.log）：**

1. **memory.extract.failed 403** — 每次会话结束时 `extractAndSaveMemory()` 调用 Haiku API，但用户使用 DeepSeek，无 Anthropic key → 403
2. **context.compact.summary_failed 403** — `compactWithSummary()` 同理，每次压缩都失败

**修复：** `src/ui/hooks/useAgentLoop.ts`
- 压缩：`if (anthropicKey)` 守卫，无 key 时降级为 `compact()`（简单截断）
- 记忆提取：`if (settings.memory.enabled && anthropicKey)` 双重守卫，无 key 时静默跳过

**创新 /diag 命令（I017）：**
- 用户建议：直接在会话内读取后台错误，无需离开终端
- `src/commands/slash.ts` 新增 `/diag` 命令
- 读取 `~/.seed/debug.log`，展示最近 30 条 WARN/ERROR（紧凑格式）
- 这是"系统自检"能力，大幅提升调试效率

**用法：** 会话中输入 `/diag` 即可看到最近错误

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.12`

---

## 2026-04-06 · v0.9.1-r22

### [BUG×2] 重启后无输出 + Shift+Enter 仍然直接发送

#### 问题1：重启后输入任何内容系统无输出（严重）

**根因：** `loop.ts` 第136行已通过 `normalizedToHistory()` 将 assistant 消息推入历史。
但在 `allDenied` 分支（L171）和正常 tool_use 分支（L177）又各自执行了一次
`messages.push({ role: "assistant", content: message.content })`，
导致历史中出现**两条连续 assistant 消息**。
API 收到此格式后静默报错，返回空响应，UI 收到 `done` 事件但无任何文本输出。

**修复：** 删除 L171、L177 两处重复的 assistant push，仅保留 L136 的 `normalizedToHistory()` 调用。

#### 问题2：Shift+Enter 依然直接发送（alpha.10 方案失效）

**根因：** `\x0e` 方案在 Windows Terminal 中失效——
部分终端会在传给 Ink 前过滤掉某些控制字符，`input === "\x0e"` 永远不触发。

**新方案：全局标志位**
- `renderer.ts`：检测到 `\x1b[13;2u` / `\x1b[27;2;13~` 时，设置 `_shiftEnterPending = true`，然后发送 `\r`（普通回车字节）
- Ink 照常触发 `key.return=true`
- `InputBar.tsx`：在 `key.return` 处理器里第一步调用 `consumeShiftEnter()`，若为 true 则插入换行，否则提交

**导出：** `renderer.ts` 新增 `consumeShiftEnter()` 导出函数

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.11`

---

## 2026-04-06 · v0.9.1-r21

### [BUG] Shift+Enter 直接发送消息，无法换行

**现象：** 输入框中按 Shift+Enter，消息被直接提交，无法插入换行。

**根因：**（操作记忆库 P002 记录的方案存在根本缺陷）
- `renderer.ts` 将 `\x1b[13;2u` / `\x1b[27;2;13~` 映射为 `\n` (0x0A)
- Ink 将 0x0A 解码为 `key.return=true, input=""`——与普通 Enter **完全相同**
- `InputBar` 中 `input === "\n"` 的判断**永远不会触发**（input 是空字符串，不是 "\n"）
- 结果：Shift+Enter = 普通 Enter，直接提交消息

**修复：**
- `renderer.ts`：Shift+Enter → `\x0e`（Ctrl+N，0x0E，未被 Ink 占用的控制字符）
- `InputBar.tsx`：在 `key.return` 检测**之前**新增 `input === "\x0e"` 检测，插入换行
- 普通 Enter（`key.return=true`）仅用于提交

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.10`

---

## 2026-04-06 · v0.9.1-r20

### [BUG×2] 权限交互逻辑缺陷：N 点击后命令继续执行 + S 后状态异常

#### 问题1：点击 N（拒绝）后命令依然在执行

**根因：** `executeToolsWithParallelism` 返回 `ToolResultParam[]`，被拒绝的工具返回
`"Permission denied. Try a different approach or ask the user."` 错误结果。
AI 收到此错误后判断"用户不允许这个方法"，自动改用其他工具继续尝试——
用户视觉上看到命令仍在执行。

**修复：** `src/agent/loop.ts`
- `executeToolsWithParallelism` 返回值改为 `{ results, allDenied }`
- 主循环检测 `allDenied === true` 时立即调用 `done` 事件并 return，不进入下一轮

#### 问题2：点击 S（session allow）后无法输入

**现象：** 点击 S/N 后，InputBar 被锁定，无法继续输入。

**根因：** `onDecide` 中 `setAppState("streaming")` 是正确的——
agent loop 在 `resolvePermission` 之后会继续处理（deny 时处理错误结果，allow 时执行工具）。
但注释缺失，行为看起来像 bug。

**修复：** 补充注释说明 streaming 状态在任何决策后都是正确的；
appState 会在 loop 完成后由 `done` 事件重置为 `idle`。

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.9`

---

## 2026-04-06 · v0.9.1-r19（待实施）

### [BUG] Max tokens (16000) reached — 系统自动暂停

**现象：** AI 执行较长任务时自行停止，显示 `Max tokens (16000) reached`。

**根因：** `src/agent/loop.ts` 中 `max_tokens` stop_reason 直接触发 error 事件并 return，不重试：
```ts
if (message.stop_reason === "max_tokens") {
  options.onEvent({ type: "error", error: new Error(`Max tokens...`) });
  return ...;
}
```

**待修复方案（用户确认后实施）：**
- 改为自动 continue：把已生成内容追加到 history，发送 "Continue from where you left off."
- 用户无感知，响应流无缝继续
- 修改文件：`src/agent/loop.ts`（3行）

**临时缓解：** `seed config set maxTokens 32000`（提高单次输出上限）

---

### [STATUS] 上下文记忆（I003）状态确认

**已完成（alpha.7）：**
- `useAgentLoop.ts` usage 事件中已调用 `updateTokenCount()`，`shouldCompact()` 可正确触发
- token > 80% context window 时自动调用 `compactWithSummary()` 进行 LLM 语义压缩
- 压缩摘要注入后续 system prompt，AI 可记住被压缩的早期对话

**注意：** `compactWithSummary()` 依赖 Anthropic API key（Haiku，~$0.0002/次）。非 Anthropic provider 用户需在 settings 中配置 `apiKey`，否则降级为简单截断。

---

## 2026-04-06 · v0.9.1-r18

### [BUG] 闪烁根本原因确认：终端自动换行 vs Ink 行数统计偏差

**现象：** 所有前序修复（r13~r17）均未能解决闪烁，在高 token 数时持续出现。

**真正根因（首次发现）：**
Ink 重绘逻辑：上移光标 N 行 → 擦除 → 重绘。N = 上次渲染的 React 逻辑行数。
**但终端会对长行自动换行**：一行 160 字符在 80 列终端中占 2 行，Ink 却只计 1 行。
- N 被低估 → 擦除不完全 → 旧内容残留 → "两层叠加"
- AI 响应越长、越复杂，长行越多，偏差越大，90K token 后持续恶化

所有前序修复（删除 useBlink、TAIL_LINES 减小、过滤 tool_use）只减少了重绘频率，但未修复 N 的计算错误。

**修复：** `src/ui/app.tsx` — `tailMessage()` Pass 2+3 重写
- 模拟终端换行（每行 / termCols-4 = 视觉行数）
- 截取最后 maxVisualLines 个**视觉行**（非逻辑行）
- 将每行硬截断至 termCols-4 字符，杜绝换行发生

**附加修复：** `src/ui/components/StatusBar.tsx`
- streaming 状态下不启动 elapsed 1s 计时器，减少独立 re-render

### [BUG] Python 路径无法找到，AI 重新安装

**现象：** 机器已安装 Python，但 AI 执行数据抓取任务时找不到 Python，在项目目录里重新安装。

**根因：** `getEnvSection()` 未检测 Python，AI 无法得知 Python 的实际路径。

**修复：** `src/agent/system-prompt.ts` — 启动时自动检测 Python
- 按优先级尝试 python/python3/py（Windows 先 python）
- 执行 `--version` + `where`/`which` 获取版本和路径
- 注入 `<env>` 块：`Python: Python 3.11.x at C:\...\python.exe (use \`python\`)`
- AI 直接使用检测到的路径，不再尝试重新安装

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.8`

---

## 2026-04-06 · v0.9.1-r17

### [BUG×2] 上下文逻辑失效 + 长对话持续闪烁

#### 问题1：上下文逻辑失效（AI 重复已完成的工作）

**现象：** AI 完成任务后，下一条指令"请直接进行抓取"时，AI 重新开始找环境、安装依赖、创建脚本。

**根因：** `shouldCompact()` 依赖 `lastInputTokens`，但 `useAgentLoop` 从未调用 `updateTokenCount()`：
- `lastInputTokens` 恒为 0 → `shouldCompact()` 恒返回 false → 自动压缩从不触发
- `ContextManager.append()` 在消息超过 `maxHistoryMessages=50` 时静默截断旧消息
- 约 8~9 轮对话（每轮 4 个工具调用 = 6 条消息/轮）后，早期上下文消失

**修复：** `src/ui/hooks/useAgentLoop.ts`
- 在 `usage` 事件处理中调用 `contextManagerRef.current.updateTokenCount()`
- 传入累计 token 数，使 `shouldCompact()` 能正确评估是否需要压缩

#### 问题2：高 token 数时持续闪烁（"90.9K $1.024 时开始抖动"）

**根因：** `TAIL_LINES = termRows - 8 = 22`，动态区总高度 ≈ 29 行，而 termRows=30
- 安全余量仅 1 行；StatusBar spinner 每 120ms 重绘一次，每次重绘都有 ±1 行漂移风险
- 长对话后漂移累积，"两层重叠" 闪烁持续加剧

**修复三件：**
1. `src/ui/app.tsx`：`TAIL_LINES = max(8, termRows-14)`，安全余量从 1 行 → 6 行
2. `src/ui/components/StatusBar.tsx`：spinner 间隔 120ms → 200ms，重绘频率降低 40%
3. 配合前序修复（v0.9.1-r13~r16）共同生效

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.7`

---

## 2026-04-06 · v0.9.1-r16

### [BUG] "每半秒闪一闪" — useBlink 600ms 计时器是根因

**现象：** 模型构建脚本或执行较长操作时，出现有节律的闪烁——"每半秒闪一次"，两个画面重叠。

**根因确认：** "每半秒" 精确对应 `useBlink` setInterval(600ms)。
- `setInterval` 每 600ms 调用 `setVisible((v) => !v)`
- 这触发 React state 变更 → Ink 对整个动态区执行全量重绘
- 重绘时 Ink 上移光标 N 行 → 擦除 → 重绘；若动态区高度估算有 1 行偏差，旧内容未完全擦除
- 并行工具执行时 3 个计时器同时触发 → 每秒 3~6 次重绘 → 闪烁加剧

**修复：** `src/ui/components/ToolCall.tsx`
- 删除整个 `useBlink` hook 及相关 `useState`/`useRef`/`useEffect` 依赖
- 改为静态金色子弹 `●`（颜色本身已传达"运行中"状态）
- 全局活动动画由 StatusBar 的 spinner 承担，不需要 ToolCall 内部计时器

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.6`

---

## 2026-04-06 · v0.9.1-r15

### [BUG] 对话时间越长、上下文越多，闪烁越严重

**现象：** 对话刚开始不闪烁；随着交互轮次增加，闪烁越来越严重，最终持续抖动。

**根因：** `tailMessage()` 只截断 `text` 块，未处理 `tool_use` 块的累积。
- 每个 AI 轮次可能调用 5~10 个工具，每个工具调用带最多 20 行 diff
- N 轮对话后，streamingMessage 的 content 包含 N×M 个已完成的 tool_use 块
- 动态区高度 = `TAIL_LINES(22) + N×M×20 diff行`，远超 termRows(30)
- Ink 光标追踪崩溃 → 每次重绘时旧内容未被完全擦除 → "两层叠加" 闪烁

**修复：** `src/ui/app.tsx` — `tailMessage()` 增加 Pass 1
- 过滤掉 `status !== "running" && status !== "pending"` 的所有 tool_use 块
- 动态区只保留：当前正在执行的工具 + 最后 TAIL_LINES 行文本
- 完整工具历史（含 diff）在消息完成后进入 Static 区正常显示，无信息丢失

**效果：** 无论对话多长，动态区高度始终 ≤ TAIL_LINES + 1 个运行中工具 ≈ 25 行，不超过 termRows

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.5`

---

## 2026-04-06 · v0.9.1-r14

### [BUG] 文件编辑时红绿 diff 面板出现后强烈闪烁

**现象：** 仅查看目录/文件不闪烁；但当 AI 修改文件时出现红绿 diff 可视面板，立刻开始激烈闪烁抖动。

**根因：两个叠加问题**
1. `DiffDisplay` 无行数上限 — 大文件 diff 可能 50~100 行，动态区高度暴增至 `TAIL_LINES(22) + N diff 行`，Ink 光标追踪偏差 ≥1 行 → 重叠闪烁
2. `useBlink` setInterval 在 `active` 每次 re-render 时重复创建 — 多个计时器并发触发 state 变更，加剧重绘频率

**修复：** `src/ui/components/ToolCall.tsx`
- `DiffDisplay`：最多显示 20 行，超出部分显示 `…N more lines`（动态区高度上限可控）
- `useBlink`：增加 `timerRef.current` 守卫，防止重复创建 interval

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.4`

---

## 2026-04-06 · v0.9.1-r13

### [BUG] 权限确认窗口强烈闪烁（"两层图像重叠抖动"）

**现象：** 运行 `seed` 后 AI 输出内容需要确认（Y/S/N）时，终端窗口激烈闪烁。滚动到顶部不闪，在底部（内容输出位置）闪烁最严重。

**根因：**
- Ink 每 80ms 对动态区执行 "上移光标 N 行 → 擦除 → 重绘" 操作
- `permission_prompt` 期间，动态区包含：流式消息（TAIL_LINES ≈ 22行）+ PermissionPrompt 边框框（5行）= 27 行
- Ink 的光标行数追踪与实际终端光标出现 ≥1 行偏差，每次重绘都在旧内容上方叠写 → "两层重叠"

**修复：** `src/ui/app.tsx`
- `permission_prompt` 状态下，隐藏 `streamingMessage`（仅删除渲染，内容保留在 state）
- 动态区高度缩减至：PermissionPrompt(5行) + StatusBar + InputBar + hints ≈ 10行
- 高度稳定 → Ink 光标追踪准确 → 闪烁消除

**关键代码：**
```tsx
// Before: 无论状态，始终渲染流式消息
{streamingMessage && <MessageList ... />}

// After: permission_prompt 时隐藏，避免动态区高度膨胀
{streamingMessage && appState !== "permission_prompt" && <MessageList ... />}
```

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.3`

---

## 2026-04-06 · v0.9.1-r12

### [BUG] 全局安装后 `seed` 启动崩溃：`Cannot find module package.json`

**根因：** `src/ui/components/Logo.tsx` 用硬编码相对路径 `../../../package.json` 读版本号。
- 开发模式（`src/ui/components/`）：3层上溯 = 项目根目录 ✓
- 打包后（`dist/index.js`）：`import.meta.url` 指向 `dist/`，3层上溯越过包目录 ✗

**修复：** 改为向上遍历目录（最多5层）寻找 `package.json`，兼容开发和全局安装两种环境。

**修改文件：** `src/ui/components/Logo.tsx`

**npm 发布：** `@jiayu6954/seed-ai@0.9.1-alpha.2`（修复版本）

**附：npm publish 须指定官方 registry**
```bash
# 国内设置了淘宝镜像后，发布必须显式指定官方 registry
npm publish --tag alpha --registry https://registry.npmjs.org
```

---

## 2026-04-06 · v0.9.1-r11

### [DOC] README 新增国内镜像安装说明 + 用户测试流程规范

**背景：**
- 中国大陆用户 `git clone github.com` 因网络封锁失败，但 npm 安装路径可完全绕开 GitHub，直连淘宝镜像
- 测试时发现首次安装无进度条（仅旋转符），需在文档中说明，避免用户误以为卡死
- 确认国内用户标准安装路径：关闭代理 + 设置 npm 镜像 + 全局安装

**修改文件：** `README.md`

**变更内容：**
- 在 Installation 部分新增 `### 国内用户（中国大陆）` 章节
- 提供两条无代理安装路径：
  1. `npx --registry=https://registry.npmmirror.com @jiayu6954/seed-ai@alpha`（临时）
  2. `npm config set registry https://registry.npmmirror.com` + 全局安装（永久）
- 首次安装提示：下载期间终端仅显示旋转符（无进度条），属正常现象，等待 1–3 分钟
- 备注：npm 安装路径不经过 GitHub，无需代理

**国内用户标准测试流程（已验证）：**
```bash
# 1. 关闭所有代理
# 2. 设置镜像（只需一次）
npm config set registry https://registry.npmmirror.com
# 3. 全局安装
npm install -g @jiayu6954/seed-ai@alpha
# 4. 验证
seed --version
# 5. 进入项目目录启动
cd <项目路径>
seed
```

**结论：** 国内用户无需代理，通过淘宝镜像可完整安装并运行，体验与国际用户一致。

---

## 2026-04-05 · v0.9.1-r10

---

### [LEGAL] CC 参考文件彻底清除 + git 历史净化（最紧急合规操作）

**目标：** 将 956 个 Claude Code 闭源参考文件从 GitHub 仓库及 git 历史中完全抹除，消除 DMCA 风险。

**根因：**
- `src/` 目录结构源自 CC 源码目录；Seed AI 自有代码直接写在其中
- git 历史 "Initial release" commit 包含 956 个 CC 文件（bridge/、assistant/、bootstrap/ 等全部目录）
- 当代码 public 到 GitHub 时，这是侵权实锤，而非技术债

**诊断过程：**
1. `git ls-files src/` 统计：956 个不属于 Seed AI 的 CC 文件
2. 逐目录确认边界：
   - **Seed AI 自有目录（完整保留）：** `agent/`、`providers/`、`config/`、`mcp/`、`memory/`（*见下方 gitignore Bug*）、`permissions/`、`sandbox/`、`ui/`
   - **混合目录（保留特定文件）：** `tools/`（10 个 .ts 文件）、`types/`（4 个文件）、`utils/`（4 个文件）、`commands/`（slash.ts）
   - **CC 独占目录（全部删除）：** assistant/、bootstrap/、bridge/、buddy/、cli/（CC 层）、components/、constants/、context/、coordinator/、entrypoints/、hooks/、ink/、keybindings/、memdir/、migrations/、moreright/、native-ts/、outputStyles/、plugins/、query/、remote/、schemas/、screens/、server/、services/、skills/、state/、storage/（CC）、tasks/、upstreamproxy/、vim/、voice/ 等

**执行操作：**

| 步骤 | 命令/操作 |
|------|---------|
| 安装工具 | `pip install git-filter-repo` |
| 净化历史 | `git filter-repo --path src/agent/ --path src/ui/ ... --force`（31 个保留路径白名单）|
| 验证结果 | `git ls-files src/` → 50 个文件，全部 Seed AI 自有 |
| 恢复 remote | git-filter-repo 自动删除 origin，手动 `git remote add origin ...` |
| force push | `GIT_CONFIG_NOSYSTEM=1 HOME=/tmp git push --force origin main` |

**结果：** GitHub 历史彻底净化，956 个 CC 文件从所有 commit 中抹除。

---

### [BUG] .gitignore MEMORY/ 在 Windows 下吞掉 src/memory/ 导致模块缺失

**根因：** `.gitignore` 中 `MEMORY/` 在 Windows 大小写不敏感文件系统下匹配了所有 `memory/` 目录（包括 `src/memory/`、`src/commands/memory/`、`src/components/memory/`、`src/utils/memory/`），导致：
- Seed AI 自有的 `src/memory/`（I007 长期记忆模块，6 个文件）从未被 git 追踪
- CC 的三个 `*/memory/` 残留目录也被忽略，但 TypeScript 仍扫描到它们

**修复：**
- `.gitignore`：`MEMORY/` → `/MEMORY/`（仅匹配根目录级别）
- 删除磁盘上残留的 CC memory 目录：`rm -rf src/commands/memory src/components src/utils/memory`
- `git add src/memory/` 将 6 个 Seed AI 记忆文件首次提交入库

**遗留教训：** Windows 大小写不敏感 + gitignore 通配是隐蔽陷阱，今后 gitignore 路径尽量加 `/` 前缀限定根目录。

---

### [BUG] filter-repo 白名单遗漏导致 CI 连续失败（4 轮排查）

**根因：** filter-repo 白名单仅保留了 Seed AI 已知模块，遗漏了 `src/index.ts` 依赖的三个 CLI 层文件和 I016 Storage Guard：

| 缺失模块 | 影响 |
|---------|------|
| `src/cli/commands/chat.ts` | 入口无法启动 Ink TUI |
| `src/cli/commands/run.ts` | 非交互模式崩溃 |
| `src/cli/commands/config.ts` | `seed config` 子命令缺失 |
| `src/cli/commands/sessions.ts` | `seed sessions` 子命令缺失 |
| `src/storage/guard.ts` | I016 Storage Guard 丢失 |
| `src/types/ui.ts` | `AppState` 类型缺失（UI 三个文件报错）|

**另发现：** `src/config/schema.ts` 缺少 `DevAISettings` 别名（只导出 `SeedSettings`），`renderer.ts` 等文件引用失败。

**修复：** 从零重建上述 6 个文件（约 300 行），在 schema.ts 添加 `export type DevAISettings = SeedSettings` 别名。

**CI 失败链：**
- CI #1 → token 缺 `workflow` scope
- CI #2 → 上述模块缺失 + `.gitignore` 吞 memory
- CI #3 → `package-lock.json` 不存在（`npm ci` 强制要求）
- CI #4 → `test/` 目录未提交（vitest 找不到测试文件）
- CI #5（推测） → 全部修复后通过（绿色）

**修复顺序：**
1. 重建缺失模块（typecheck: 0 errors）
2. 生成并提交 `package-lock.json`（`npm install --package-lock-only`）
3. 提交 `test/` 目录（`test/memory/long-term.test.ts`，14 个测试）

---

### [DOC] README.md 诚实性修正

**修改：**

| 位置 | 旧内容（有问题）| 新内容（准确）|
|------|--------------|------------|
| Why 表第 2 行 | "70–90% token reduction in typical sessions" | "Tool result cache reduces repeated reads; LLM compression prunes context; local Ollama runs at zero API cost" |
| CC 对比表 | Context compression → "Simple truncation" | "Conversation compaction via `/compact` (different approach)" |
| Installation | `git clone https://github.com/YOUR_USERNAME/...` | 正确 URL `jiayu6954-sudo/seed-ai` + npm 发布即将上线说明 |

**理由：** 无数据支撑的精确百分比损害可信度；"Simple truncation" 对 CC 的描述不准确（CC 有 /compact 命令）。

---

### [INFRA] CI/CD 基础设施上线

**文件：** `.github/workflows/ci.yml`

**配置：**
- 触发：push/PR to main
- Matrix：Node.js 20.x + 22.x
- Steps：`npm ci` → `npm run typecheck` → `npm run test:run`
- README 徽章：CI / MIT License / Node.js

**状态：** CI 最终通过（绿色对勾）

---

### [NPM] npm 发布 @jiayu6954/seed-ai@0.9.1-alpha.1

**目标：** 让用户通过 `npx @jiayu6954/seed-ai@alpha` 一行命令体验，无需 git clone。

**过程与障碍：**

| 障碍 | 原因 | 解决方案 |
|------|------|---------|
| `npm run build` 失败 | `tsup.config.ts` 和 `scripts/add-shebang.mjs` 未提交到 git | 重建两个文件 |
| tsup 报 "No input files" | 无 entry 配置 | `tsup.config.ts` 指定 `entry: ["src/index.ts"]` |
| tsup 报 `react-devtools-core` 无法解析 | `noExternal: [/.*/]` 与 `external` 冲突 | 改为标准外部依赖模式，只转译 src/ |
| `npm publish` 报 403（2FA）| npm 新账号默认需要 2FA bypass token | 生成 Granular Access Token（勾选 Skip 2FA）|
| `seed-ai` 包名被拒绝 | 与已有包 `seedai` 名称太相似 | 改用 scoped 包名 `@jiayu6954/seed-ai` |

**最终配置：**
- 包名：`@jiayu6954/seed-ai`
- 版本：`0.9.1-alpha.1`
- tag：`alpha`
- bin：`seed` 和 `seed-ai` 均指向 `dist/index.js`
- files：`dist/`、`README.md`、`LICENSE`（约 70KB 压缩包）

**新建文件：**
- `tsup.config.ts` — entry: src/index.ts, format: esm, target: node20，node_modules 保持外部
- `scripts/add-shebang.mjs` — 在 dist/index.js 头部写入 `#!/usr/bin/env node`

**npm 发布命令（一键）：**
```bash
cd d:/claude/devai
npm version patch   # 或 prerelease --preid=alpha
npm publish --tag alpha --access public
```

**用户使用命令：**
```bash
npx @jiayu6954/seed-ai@alpha          # 一键体验
npm install -g @jiayu6954/seed-ai@alpha  # 全局安装
```

**npm 页面：** https://www.npmjs.com/package/@jiayu6954/seed-ai

---

## 格式说明

每条记录包含：
- **日期 · 版本 · 类型**
- **目标**：做什么
- **根因**（Bug 类）或**设计动机**（创新类）
- **修改文件列表**（精确到函数/常量）
- **验证方式与结果**
- **遗留问题**（如有）

---

## 2026-04-05 · v0.9.1-r9

---

### [RELEASE-PREP] GitHub 开源前完整准备

**目标：** 完成开源发布前的所有文件检查与补全工作。

**检查发现的问题：**

1. **`.gitignore` 缺失（严重）** — `API.txt` 含 DeepSeek API Key，无 `.gitignore` 的情况下 `git add .` 会直接提交密钥
2. **`MEMORY/` 目录** — 运行时生成的知识库数据，不应进入版本库
3. `.github/CONTRIBUTING.md` 中 I014/I015 注释已过期（仍写"next planned"）
4. README 缺少 Demo 视频区块
5. `assets/demo/README.md` 描述视频文件"place here after recording"——视频已存在，需更新

**执行操作：**

| 操作 | 文件 | 说明 |
|------|------|------|
| 新建 | `.gitignore` | 排除 API.txt、MEMORY/、dist/、node_modules/、.env、claude-code-main/ 等 |
| 修改 | `.github/CONTRIBUTING.md` | Innovation 编号表更正：I014 已搁置；I015 Hooks 为下一优先级；新贡献从 I017+ 起 |
| 修改 | `README.md` | 标题后插入 Demo 视频区块，引用 assets/demo/seed-ai-demo.mp4 |
| 修改 | `assets/demo/README.md` | 更新视频描述，反映文件已存在 |

**开源前文件完整性核验结果（全部通过）：**

| 文件 | 状态 |
|------|------|
| `README.md` | ✓ |
| `LICENSE` | ✓ MIT |
| `CONTRIBUTING.md` | ✓ 根目录详细版 |
| `.github/CONTRIBUTING.md` | ✓ .github 版（已修正） |
| `SECURITY.md` | ✓ |
| `.gitignore` | ✓ 本次新建 |
| `.github/ISSUE_TEMPLATE/bug_report.md` | ✓ |
| `.github/ISSUE_TEMPLATE/feature_request.md` | ✓ |
| `assets/demo/seed-ai-demo.mp4` | ✓ 视频已存在 |
| `WHITEPAPER.md` | ✓ v0.9.1-r7 |

**安全确认：**
- `API.txt` 已纳入 `.gitignore`，不会进入版本库
- `MEMORY/`（运行时知识库）已纳入 `.gitignore`
- `claude-code-main/`、`claude/`、`package/`（本地参考副本）已纳入 `.gitignore`
- 源码中无 1902/1,902 精确数字遗留

**视频文件路径：** `assets/demo/seed-ai-demo.mp4`（已存在，通过 `assets/demo/README.md` 说明）

---

## 2026-04-05 · v0.9.1-r8

---

### [DOC] 白皮书 + GitHub 文档全面审校与修正

**目标：** 根据用户逐条审阅意见，修正文档中的计数错误、描述混淆、客观性不足，并补充 GitHub 必备文件。

**修正清单：**

1. **创新项计数修正（WHITEPAPER.md + README.md）**
   - 旧："16 项规划创新（I001–I013、I016）" → 实际 I001-I013 是 13 项，加 I016 共 14 项
   - 新："14 项已交付创新（I001–I013 共 13 项 + I016；I014 永久搁置；I015 路线图）"
   - 影响位置：目录条目、Section 4 标题、Section 11.1 综合结论

2. **来源表述模糊化（WHITEPAPER.md + README.md + MEMORY.md）**
   - 改为："系统分析 Claude Code 的技术架构和设计模式"
   - 原因：精确数字在公开文档中敏感，模糊表述更专业

3. **I003/I012 性能评语混淆修正（WHITEPAPER.md Section 9.4）**
   - 旧："I003 压缩因 I012 注入量固定在 ~800 tokens 而极少触发"（错误：I012 不影响 I003 触发条件）
   - 新：分开表述 I003（长对话偶发触发，Spinner 掩盖）和 I012（记忆注入量恒定，两者独立）

4. **对比表客观性增强（WHITEPAPER.md Section 8）**
   - 8.1 新增行：**开源透明性** — Claude Code 未开源 vs Seed AI MIT 开源
   - 8.2 权限行修正："路径级规则（glob 白名单）尚未支持，计划中"（而非模糊的"持续迭代"）
   - 8.2 VSCode 集成：明确为"产品定位差异"而非技术落后

**新建 GitHub 文档：**

5. `CONTRIBUTING.md` — MIT 协议下的贡献规则：
   - 开发环境搭建（build / typecheck / test / link）
   - 贡献优先级（集成测试 > Windows edge case > 本地 LLM 测试）
   - Innovation 编号约定（I017+ 起）
   - 代码规范（strict TS / Zod / 分层错误处理）
   - PR checklist（typecheck + test + build 必过）
   - 依赖许可证兼容性表（MIT + Apache 2.0，无 GPL）

6. `SECURITY.md` — 安全政策：
   - 沙箱限制说明（sandbox 关闭时 bash 在宿主执行、Prompt Injection 风险）
   - 漏洞报告渠道（GitHub Security Advisory，非 Issue）
   - API Key 存储安全（文件权限 600，不记录不上传）
   - 依赖安全（无 GPL，无已知 CVE）

**修改文件：**
- `WHITEPAPER.md` — 6 处精准修改（目录、Section 1.1、Section 4 标题、Section 8.1、Section 8.2、Section 9.4、Section 11.1）
- `README.md` — 2 处修改（标题行创新计数、Acknowledgments 段落）
- `CONTRIBUTING.md` — 新建
- `SECURITY.md` — 新建

**验证：** 所有文件直接 Edit/Write 操作，无构建步骤

---

## 2026-04-04 · v0.9.1-r7

---

### [DOC] 创建 LICENSE 文件（MIT）

**目标：** 补全 GitHub 仓库缺失的开源许可证文件。

**操作：** 创建 `LICENSE`（无扩展名，GitHub 标准格式），内容为标准 MIT License：
- Copyright 年份：2026
- Copyright 持有者：Seed AI Contributors
- 包含完整 MIT 许可证条款（授权、限制、免责声明）

**修改文件：**
- `LICENSE` — 新建，MIT License 全文

**同步更新：**
- `OPERATIONS.md` — 本条记录
- `WHITEPAPER.md` — Section 11 补充开源许可证条目

**验证：** `ls d:/claude/devai/LICENSE` 确认文件存在，内容符合 MIT 标准格式

---

## 2026-04-04 · v0.9.1-r6

---

### [UX-FIX] 流式输出窗口扩展：TAIL_LINES 从 8 扩展至 termRows-8

**目标：** 解决流式输出时内容显示区域过窄（"只能看见两行"）的体验问题。

**根因：**
- 原 `TAIL_LINES = Math.min(8, Math.max(4, termRows-22))` 在 termRows=30 时只有 8 行
- 同时 `<Box height={TAIL_LINES}>` 固定高度框在内容少时有大片空白
- 用户感受：内容在一个"管子"里滚动，无法阅读正在生成的回答

**关键洞察：**
- 原本限制 TAIL_LINES=8 是为防止 scrollbar 漂移，但漂移的真正根因是 isStreaming bug（已在 r4 修复）
- isStreaming bug 修复后，动态区自然增长是正常终端行为（scrollback 扩展），不是"抖动"
- primary buffer 中动态区增长不会导致视觉闪烁，只是 scrollbar 随内容增长向上收缩（符合预期）

**修改：**

1. `src/ui/app.tsx` — TAIL_LINES 计算公式：
   ```ts
   // 修改前
   const TAIL_LINES = Math.min(8, Math.max(4, termRows - 22));  // termRows=30 → 8行
   
   // 修改后
   const TAIL_LINES = Math.max(10, termRows - 8);  // termRows=30 → 22行
   ```
   chrome 预留：StatusBar(3) + InputBar(1) + hints(1) + margin(3) = 8 行

2. `src/ui/app.tsx` — 移除 `<Box height={TAIL_LINES}>` 固定高度框，直接渲染 MessageList：
   - 旧框在内容少时留大片空白，体验差
   - 移除后内容自然增长至 TAIL_LINES 行上限

**效果：**
- termRows=30：TAIL_LINES 从 8 → 22，用户在 streaming 期间可见 22 行内容
- termRows=40：TAIL_LINES 32 行
- 短响应：完整显示，不截断
- 长响应：显示最后 22 行（"tail"滑动），完成后全文在 scrollback 可上翻查看

**验证：** tsup build 1044ms 成功

---

## 2026-04-04 · v0.9.1-r5

---

### [BUG-FIX] 流式输出抖动根治 Round 3：动态区固定高度 + alt-screen 诊断

**目标：** 用户反馈三项问题：①scrollbar 消失 ②输出一段时间后又抖 ③闪烁。进行全局诊断，找到剩余根因并修复。

**诊断过程：**

1. 读取 OPERATIONS.md 回顾历史操作
2. 读取 useAgentLoop.ts 完整 submit 函数（lines 1–590）
3. 读取 app.tsx、StatusBar.tsx、renderer.ts 当前状态
4. 构建完整的"动态区高度"变化时序图

**根因：动态区高度随流式输出持续增长 → 终端被迫上滚 → scrollbar 下移**

详细机制：
- streaming 开始时，流式消息从 0 行增长到 TAIL_LINES 行
- 每次 80ms Ink 渲染：移动游标上移 N 行，然后写 N+1 行（内容多了 1 行）
- 写入量超过终端底部 → 终端上滚 1 行 → scrollbar 下降 1 格
- 每 80ms 重复 → scrollbar 随输出频率持续下移（用户观察到的现象）

额外根因：StatusBar hint 行在 streaming 开始时从 `null`（0 行）变成 `"…"`（1 行），导致一次额外的高度跳变。`tool_running` 状态与 `streaming` 状态之间也差 1 行（hint 有无）。

**关于 alt-screen + Static 的诊断（v0.9.1-r3 引入的错误被纠正）：**

- v0.9.1-r3：引入了 `height={termRows}` 并删除 Static，动态区包含 20 条消息，每 80ms 重绘全部 → 加剧了抖动
- v0.9.1-r4：回归 Static，但发现 alt-screen + Static 存在游标跟踪问题（Static 内容超过 termRows 后 alt-screen 内部上滚，Ink 游标计数与实际终端游标脱节，"开始不抖，跑一会抖"正好符合此症状）
- 本轮（r5）：重新审视后，发现问题的**真正根因**不是 alt-screen，而是**动态区高度不固定**。无论是否有 alt-screen，只要高度在 streaming 中增长，终端就会被迫上滚

**修法一：流式消息框固定高度**（`src/ui/app.tsx`）

```tsx
// 修改前：高度随内容从 1 行增长到 TAIL_LINES 行
{streamingMessage && (
  <MessageList messages={[tailMessage(...)]} ... />
)}

// 修改后：始终占 TAIL_LINES 行（无内容时空白占位）
<Box height={TAIL_LINES} flexDirection="column">
  {streamingMessage && (
    <MessageList messages={[tailMessage(...)]} ... />
  )}
</Box>
```

**修法二：StatusBar hint 行在 streaming 开始时立即出现**（`src/ui/components/StatusBar.tsx`）

```ts
// 修改前：等 streamingTokens > 0 才显示 hint（导致 0→1 行高度跳变）
: state === "streaming" && streamingTokens > 0 ? `  ${streamingTokens} tokens streaming…`

// 修改后：streaming 开始时立即显示 "…"，tokens > 0 后更新文字
: state === "streaming" ? (streamingTokens > 0 ? `  ${streamingTokens} tok` : "  …")
: state === "tool_running" ? "  …"   // 与 streaming 保持同高，消除切换时的 1 行跳变
```

**修改文件：**
- `src/ui/app.tsx` — 流式消息 `MessageList` 外包 `<Box height={TAIL_LINES}>`
- `src/ui/components/StatusBar.tsx` — hint 条件改为 streaming 立即显示；tool_running 补充"…"占位

**验证：**
- TypeScript 0 错误（devai 自有文件）
- tsup build 1061ms 成功
- 动态区高度计算：TAIL_LINES(8) + divider(1) + status(1) + hint(1) + input(1) + keyhints(1) = 13 行，streaming 全程固定

**isStreaming 竞争 bug（r4 修复）确认有效：** 原 `done` 事件的 `finalizeLastMessage()` 与 `finally` 中 `updateLastAssistantMessage()` 在同一 React batch 中竞争，`isStreaming: true` 覆盖 `isStreaming: false`，导致最后一条消息永久卡在流式区被反复截断重绘。已通过原子 drain+finalize 单一 setMessages 修复。

---

## 2026-04-04 · v0.9.1-r4

---

### [BUG-FIX] 流式输出抖动根治 Round 2：isStreaming 竞争 + Static 回归

**目标：** 全局诊断并彻底修复剩余抖动。

**根因 1（致命）：`isStreaming` React batch 竞争——消息永久卡在流式区**

事件时序（均在同一 React batch 中）：
1. `done` 事件 → `finalizeLastMessage()` → 入队 setMessages #1（`isStreaming: false`）
2. runAgentLoop 返回，`finally` 块执行
3. `updateLastAssistantMessage(remainingBuffer)` → 入队 setMessages #2（`isStreaming: true`，追加 buffer 内容）
4. React 按序应用两个 updater：#1 先设 false，#2 又覆盖为 true
5. 最终：最后一条消息永久 `isStreaming: true`，永远在流式区以 `tailMessage` 截断显示，**不会转入 Static 区**
6. 由于 `streamingMessage != null` 永不清空，每次有其他 setState 都会重绘截断的"流式消息"

**根因 2（重要）：上轮引入的 `height={termRows}` 使动态区包含 20 条完成消息**
- 每 80ms Ink 必须 layout 全部 20 条（含代码块）再重绘 30 行
- 比 Static 方案贵 10x 以上，加剧视觉抖动

**修法一：原子 drain + finalize**（`src/ui/hooks/useAgentLoop.ts`）

- 移除 `done` 事件中的 `finalizeLastMessage()`
- `finally` 块中将 buffer drain 与 `isStreaming: false` 合并为**一个 setMessages updater**：
  ```ts
  setMessages((prev) => {
    // append remainingChunk (if any) + always set isStreaming: false
    copy[copy.length - 1] = { ...last, content, isStreaming: false };
    return copy;
  });
  ```
- 消除两个分离 updater 在同一 React batch 中顺序竞争的可能性

**修法二：回归 Static + 小动态区**（`src/ui/app.tsx`）

- 恢复 `<Static items={completedMessages}>` 写入 alt-screen buffer（一次写入，永不重绘）
- 移除 `height={termRows}`（该属性导致动态区强制包含 20 条消息，反而加剧重绘成本）
- 动态区仅保留：流式消息（tailMessage 截断）+ StatusBar + InputBar + 提示行 ≈ 13 行

**修改文件：**
- `src/ui/hooks/useAgentLoop.ts`
  - `done` case：删除 `finalizeLastMessage()`
  - `finally` 块：替换为原子 drain+finalize 单一 setMessages 调用
- `src/ui/app.tsx`
  - 恢复 `Static` import
  - 移除 `height={termRows}` 外层 Box 属性
  - completedMessages 改回 `<Static>` 渲染

**验证：** TypeScript 0 错误（devai 自有文件），tsup build 1060ms 成功

---

## 2026-04-04 · v0.9.1-r3

---

### [BUG-FIX] 流式输出抖动根治（Static 架构重构）

**目标：** 彻底消除模型输出大量内容时底部出现的抖动/卡顿（stutter）。

**根因分析（两个独立根因叠加）：**

1. **`setStreamingTokens` per-token setState**（`useAgentLoop.ts`）
   - 每个 `text_delta` 事件调用一次 `setStreamingTokens((n) => n + event.delta.length)`
   - 绕过了 60ms 批量 flush，触发每字符一次的全组件树重渲染

2. **整屏 Ink 重绘**（`app.tsx`）
   - 自定义 `ScrollBar` + 全部消息列表 + windowing 计算都在动态区域
   - 每次 60ms flush 触发 Ink 对整个 full-screen 重新 layout + 输出 → 视觉抖动

**修法一：tokenCountBufferRef 批量化**（`src/ui/hooks/useAgentLoop.ts`）

- `text_delta` handler 改为：
  ```ts
  deltaBufferRef.current      += event.delta;
  tokenCountBufferRef.current += event.delta.length;   // 不 setState
  ```
- 60ms flush timer 统一 drain token 计数：
  ```ts
  if (tokenCount > 0) setStreamingTokens((n) => n + tokenCount);
  ```
- `finally` 块补充 drain `tokenCountBufferRef`

**修法二：`<Static>` 架构（参考 Claude Code 官方方案）**（`src/ui/app.tsx`）

- **删除：** `ScrollBar` 组件、`scrollOff`/`userScrolledRef`/`maxScrollOffRef` 状态、`estimateMsgLines`/windowing 逻辑、PgUp/PgDn 键绑定、`useMemo` 相关
- **新架构：**
  - 已完成消息 → `<Static items={completedMessages}>` — Ink 写入 scrollback 一次，永不重绘
  - 当前流式消息 → 动态区底部，仅此条每 60ms 重绘
  - 状态栏 + 输入框 + 提示 → 同在动态区底部
- 终端原生滚动替代自定义滚动条
- `<Static>` 与自定义滚动条是互斥架构（Claude Code 选择 Static）

**修改文件：**
- `src/ui/hooks/useAgentLoop.ts` — text_delta handler 去掉 setState；flush timer + finally 块 drain tokenCountBufferRef
- `src/ui/app.tsx` — 完整重构：删除 ScrollBar/windowing/scroll state；改用 `<Static>` 分离已完成消息

**用户偏好补充：**
- 记忆库只写在项目目录（`d:\claude\devai\MEMORY.md` / `OPERATIONS.md`），不写 C 盘 Claude 全局记忆目录

---

## 2026-04-04 · v0.9.1-r2

---

### [ARCH-DECISION] I014 永久搁置：Worker Threads 不值得

**目标：** 评估 I014（进程外 LLM 压缩）是否仍有必要实施。

**根因分析：**
- I003 触发条件：`lastInputTokens / contextWindow > threshold`
- I012 将 system prompt 记忆注入量固定在 ~800 tokens，context 占用极低
- 实际触发频率：长会话中偶发（远少于 v0.9.0 引入 I012 之前）
- 剩余症状：偶发 1–2s UI 冻结（Haiku API 等待）

**评估结论：**

| 方案 | 代价 | 收益 |
|------|------|------|
| I014 Worker Threads | 打破单线程 ESM 架构；新增 worker_threads + MessageChannel + 跨线程状态机；维护复杂度指数上升 | 消除偶发 1–2s 冻结 |
| UI Spinner 掩盖 | 在 StatusBar 显示 "compressing..." 文字，0 架构改动 | 用户体验上等价（有反馈即可接受等待）|

**决策：** I014 永久搁置。UI Spinner 是正确解法，不向底层架构借高利贷。

**修改文件：**
- `WHITEPAPER.md` — Section 10 将 I014 标注为"已评估，不实施"；性能评分 4/5 → 4.5/5
- `WHITEPAPER.md` — 下一阶段路线图标题改为 I015+；11.3 差距分析删除 I014
- `MEMORY.md` — 创新清单 I014 标注为"永久搁置"，"下一批"更新为 I015
- `README.md` — 路线图表格 I014 加删除线，标注 Dropped

---

### [ARCH-DECISION] I015 Hooks 系统安全约束定稿

**目标：** 在设计阶段锁定 I015 Hooks 的沙箱执行要求，防止留下安全漏洞。

**威胁模型（攻击链）：**
1. 恶意内容注入 LLM 上下文（Prompt Injection）
2. LLM 被诱导触发 `file_edit` 工具（修改 `package.json`）
3. `PostToolUse` hook 绑定了 `file_edit` → hook runner 在宿主进程执行任意 shell 命令
4. hook 修改 `package.json` 的 `preinstall` / `postinstall` 脚本
5. 用户下次 `npm install` → 获得代码执行权（供应链攻击起点）

**约束（写入白皮书和 CONTRIBUTING.md）：**
- `sandbox.enabled=true` 时，hook runner 必须通过 I005 Docker 沙箱 exec，与 bash 工具走同一路径
- hook runner 不得在宿主进程直接 `execFile` 用户定义的 command
- 默认 `sandbox.enabled=false` 时，明确在文档提示：hook 执行无隔离，仅信任本地用户配置

**修改文件：**
- `WHITEPAPER.md` — Section 10 I015 条目补充"安全约束（强制）"小节
- `MEMORY.md` — 新增"I015 Hooks 系统必须在 Docker 沙箱内执行"决策条目

---

### [DOCS] 开源前文档准备（初版）

**目标：** 准备 GitHub 开源所需的全套标准文档。

**新增文件：**

`README.md`（项目根目录）
- 8 个痛点 → devai 方案对比表（含成本优势行：cache+压缩+Ollama = 70–90% token 减少）
- 全特性列表（引擎 / 多 Provider / 本地模型 / 记忆 / 网络 / 沙箱 / 存储 / UI）
- 三条快速开始路径（Anthropic / DeepSeek / Ollama）
- 完整 CLI 用法 + 快捷键
- ASCII 架构图（含 I010 压缩触发条件标注）
- devai vs Claude Code 对比（领先维度 + 落后维度分表）
- Quality & Testing 小节（测试覆盖声明 + 集成测试缺口说明）
- Known Limitations 小节（SPA / bot 保护 / Docker / 本地 LLM）
- Contributing 小节（优先贡献方向）
- Acknowledgments 小节

`.github/ISSUE_TEMPLATE/bug_report.md`
- 复现步骤、`--verbose` debug log 引导、环境信息表格、`config show --json` 区域

`.github/ISSUE_TEMPLATE/feature_request.md`
- 问题 / 方案 / 规模评估 / I0XX 编号对齐

`.github/CONTRIBUTING.md`
- 开发环境搭建、代码规范（TypeScript strict / 错误分层 / 无投机性抽象）
- 创新编号约定（I001–I016 已完成，I015 起待交付）
- PR 前置检查清单 + "不会合并"清单

`DEMO_SCRIPT.md`
- 2:30–2:50 分钟演示脚本，6 个场景：记忆召回 → 并行执行+Diff → curl 降级 → Docker 沙箱 → 存储仪表板 + 模型切换
- 每场景含具体命令、预期输出、旁白文案、字幕时间轴

---

### [DOCS] README v2 — 用户反馈改进

**改进项（逐条落地）：**

1. **成本痛点行**：Why devai 表格新增"API costs spiral out of control → cache+compression+Ollama = 70–90% token reduction"
2. **压缩触发条件**：Features 中明确 I003 触发条件为 80% context window
3. **本地模型具体示例**：Smart Local Model Layer 补充 `ollama pull qwen2.5-coder:7b` → devai 自动识别无需配置的完整示例
4. **安装验证步骤**：From source 末尾加 `devai --version`
5. **Quick start Local**：补充 `ollama pull llama3.2:3b` 备选方案及自动发现说明
6. **SEED_DATA_DIR 说明**：Configuration 末尾说明环境变量用途（C 盘迁移）
7. **Comparison 拆表**：领先维度和落后维度分为两个独立表格，更清晰
8. **MCP 描述修正**：devai = Client，CC = Server only，明确区分
9. **Test coverage 对比行**：Comparison 落后维度表中补充 Test coverage / maturity 行
10. **Quality & Testing 小节**：新增，包含单测声明 + 集成测试缺口 + 贡献邀请
11. **Known Limitations 小节**：新增 4 条已知限制（SPA / bot / Docker 手动启动 / R1 工具调用）
12. **Contributing 小节**：补充优先贡献方向（集成测试 / Windows 边界 / 本地 LLM）
13. **Acknowledgments 小节**：感谢 Claude Code，表明开源精神
14. **Status 徽章**：Header 下方增加"Active development"声明，管理用户预期

**开源前剩余手动项：**
- `package.json` version 改为 `0.9.1`
- 创建 `LICENSE` 文件（MIT）
- README 替换 `YOUR_USERNAME` 为实际 GitHub 用户名
- 录制演示视频（按 DEMO_SCRIPT.md 操作）

---

## 2026-04-04 · v0.9.1

---

### [I016] Storage Guard + SEED_DATA_DIR（存储安全）

**目标：** 防止 Seed AI 运行时数据（vectors.json / sessions / debug.log）无限膨胀导致系统盘（C 盘）耗尽；支持将全部数据迁移到任意磁盘。

**设计动机：**
用户 C 盘占用 89%（222GB/250GB）。引入本地模型（I011）和语义向量记忆（I012）后，长期运行会持续写入数据；所有路径均硬编码为 `os.homedir()/.devai`（C 盘），无法迁移。

**新增文件：** `src/storage/guard.ts`
- `runStorageGuard()` — 启动时自动执行（非阻塞，错误不抛出），三路并行保护：
  - `guardVectors()` — vectors.json 超 200MB → 删除最旧 30% chunk
  - `guardSessions()` — sessions 超 100 个 → FIFO 删除旧会话
  - `guardLog()` — debug.log 超 10MB → 截断保留最后 5MB（读 tail → 覆写）
- `storageReport()` — 返回各目录实际占用 + 配额状态，供 `seed config show --storage` 调用

**修改文件：** `src/config/settings.ts`
- 新增 `DATA_DIR` 常量：优先读 `SEED_DATA_DIR` 环境变量，否则 fallback `~/.seed`
- `CONFIG_DIR` 改为 `DATA_DIR` 的别名（保持向后兼容）
- 新增导出 `MEMORY_DIR = DATA_DIR/memory`
- `ensureConfigDir()` 同时创建 memory 子目录

**修改文件：** `src/memory/long-term.ts`
- `MEMORY_ROOT` 改用 `MEMORY_DIR`（不再硬编码 `os.homedir()`）
- 移除冗余 `os` import

**修改文件：** `src/memory/vector-store.ts`
- `VECTOR_STORE_PATH` 改用 `MEMORY_DIR`
- 移除冗余 `os` import

**修改文件：** `src/memory/claude-md.ts`
- 全局 CLAUDE.md 路径改用 `DATA_DIR`（不再硬编码 `~/.seed`）

**修改文件：** `src/utils/logger.ts`
- `LOG_FILE` 改为读取 `SEED_DATA_DIR` 环境变量（logger 模块不能 import settings 避免循环依赖，单独实现同逻辑）

**修改文件：** `src/index.ts`
- 启动时动态 import `runStorageGuard()`（非阻塞 void，不影响启动时间）

**修改文件：** `src/cli/commands/config.ts`
- `config show` 新增 `--storage` flag：展示各目录用量 + 配额百分比（颜色区分：绿 <50% / 黄 <80% / 红 ≥80%）
- `config show` 默认输出新增 `Data Dir` 行，显示当前数据目录路径

**永久配置（已写入系统）：**
```bash
# ~/.bash_profile（Git Bash / bash 终端）
export SEED_DATA_DIR="F:/KDubaSoftDownloads/devai-data"

# Windows 用户级环境变量（PowerShell / CMD）
[System.Environment]::SetEnvironmentVariable('SEED_DATA_DIR', 'F:\KDubaSoftDownloads\devai-data', 'User')
```

**验证：**
```
SEED_DATA_DIR="F:/KDubaSoftDownloads/devai-data" seed config show
  → 数据目录: F:\KDubaSoftDownloads\devai-data  ✓

seed config show --storage
  → 向量库: 0B   0% / 200MB 上限
  → 会话文件: 0  0% / 100 个上限
  → 日志文件: 0B 0% / 10MB 上限     ✓
```

**关键决策：**
- `logger.ts` 不 import `settings.ts`：logger 在 settings 之前加载，循环依赖会导致启动崩溃。单独内联 `SEED_DATA_DIR` 读取逻辑（5 行），不引入抽象
- `guardLog()` 用 read-tail + overwrite 而非 truncate(0) + write：truncate 从头截断丢失最近日志；read-tail 保留最有价值的近期记录

---

### [I016-CLEAN] C 盘清理（一次性操作）

**目标：** 清除积累的 Seed AI 测试数据，释放 C 盘空间。

**清理内容：**
```
C:\Users\Administrator\.devai\sessions\  ← 31 个会话 JSON（~1.8MB）  已删除
C:\Users\Administrator\.devai\debug.log  ← 28KB                      已删除
C:\Users\Administrator\AppData\Local\Temp\claude\  ← 19MB Claude 缓存 已删除
```

**C 盘真实占用大户（供参考，未动）：**
```
VSCode AppData     6.1 GB   ← 建议迁移扩展目录
金山办公           2.7 GB
腾讯               2.3 GB
JetBrains          1.2 GB
```

**结论：** devai 数据量（现为 ~1.9MB）不是 C 盘满的根因；真正的问题是应用 AppData，尤其是 VSCode 扩展。SEED_DATA_DIR 是长期预防措施，不是当前问题的解法。

---

### [BUG-FIX] R1 本地模型工具调用失效 → 胡说八道

**根因（关键）：**
DeepSeek-R1 是推理（reasoning）模型，不是工具调用（tool-use）模型。走 XmlFallbackStreamHandle 路径时：
1. 收到含 `<tool_call>` schema 的 system prompt
2. 在 `<think>` 块中推理"应该调用什么工具"
3. 实际输出：叙述性文字（分析方法论、步骤计划）
4. **从未输出 `<tool_call>` XML 块**
5. `parseXmlToolCalls()` 解析到 0 个工具调用
6. agent loop 认为 LLM 已给出最终答案（其实是幻觉）

**症状：** 用户提问"分析这个项目"，R1 输出"第四步：推导潜在逻辑 / 第五步：记录发现与假设"——全是编造，从未读取任何文件。

**已实施修复：** `src/providers/local.ts` — `buildXmlToolPrompt()`
- 加入强制性语气（CRITICAL / MUST / ALWAYS）
- 加入两个 few-shot 示例：用户问文件列表 → 模型必须先输出 `<tool_call>` 而非描述计划
- 明确禁止写"步骤/计划/方法论"，要求直接调用工具

**实际效果评估：** R1 对格式强制指令的遵从性仍弱于工具原生模型。改进后有概率生效，但不保证 100% 可靠。

**根本解决方案（已执行）：** 切换至 DeepSeek 云 API（`deepseek-chat`），该模型原生支持 function calling，工具调用 100% 可靠。

**切换命令（已执行）：**
```bash
node dist/index.js config model --deepseek --set-model deepseek-chat
# ✓ Provider: deepseek / Model: deepseek-chat
```

**遗留问题：** R1 本地模型工具调用可靠性问题未完全解决。若用户坚持本地运行，考虑换用支持工具调用的本地模型（如 qwen2.5-coder:7b，在 TOOL_CAPABLE_PATTERNS 中已列入）。

---

## 2026-04-03 · v0.9.0

---

### [I013] 交互式模型切换器 `seed config model`

**目标：** 用户无需手动编辑 JSON，可通过命令行菜单或一行命令切换 AI 提供商和模型。

**设计动机：**
原 `seed config set provider ollama` 方式对普通用户不友好；切换 provider 还需同时修改 `model` 字段；Ollama 模型名不固定，需要自动探测。

**新增文件：** `src/cli/commands/model-switch.ts`
- `PROVIDERS[]` — 8 个 provider 选项（Anthropic / DeepSeek / OpenAI / Groq / Gemini / OpenRouter / Ollama / Custom）
- `hasKey(settings, p)` — 检测 API Key 是否已配置（settings 字段 + 环境变量双路检测）
- `fetchOllamaModels(url)` — GET `http://localhost:11434/api/tags`，AbortSignal 3s 超时，返回模型名列表
- `runModelSwitcher(opts)` — 主流程：展示 provider 列表 → provider 选择 → API Key 处理 → model 选择 → 写入配置
- `switchToProvider(settings, provider, forcedModel, ...)` — 分支处理：ollama（自动探测模型）/ custom（提示输入 URL）/ 云（检测/提示 API Key）
- `selectModel(models, current, label)` — 通用数字选择 UI，`← 当前` 标记已选项

**修改文件：** `src/cli/commands/config.ts`
- 新增 `config model` 子命令，8 个快速切换 flags：`--local` / `--anthropic` / `--deepseek` / `--openai` / `--groq` / `--gemini` / `--openrouter`
- 新增 `--set-model <name>` flag（非 `--model`，避免与父命令 `-m/--model` 命名冲突）
- `config show` 子命令重写为美化摘要输出（显示 Provider / Model / API Key 配置状态 / Memory / Sandbox），原 JSON 输出通过 `--json` flag 保留

**关键 Bug（命令发现并修复）：**
- `--model` flag 被父命令 `devai` 的 `-m/--model` 选项吃掉，子命令收到 `undefined` → 改名为 `--set-model`，camelCase 为 `opts.setModel`

**用法示例：**
```bash
seed config model                                         # 交互菜单
seed config model --local                                 # Ollama 菜单（显示已探测模型）
seed config model --local --set-model DeepSeek-R1:latest  # 一行无交互切换
seed config model --deepseek --set-model deepseek-chat    # 切换 DeepSeek 云
seed config show                                          # 摘要查看
seed config show --json                                   # 原始 JSON
```

**验证：**
```
seed config model --local --set-model DeepSeek-R1:latest
  ✓ Provider: ollama / Model: DeepSeek-R1:latest  ← settings.json 已更新

seed config model --deepseek --set-model deepseek-reasoner
  ✓ Provider: deepseek / Model: deepseek-reasoner

echo "7" | seed config model
  → 显示 8 provider 菜单（✓/✗ 状态），Ollama 自动探活显示已安装模型
```

---

### [BUG-FIX] probeToolSupport 误判 R1 为工具支持 → 完全无响应

**根因（关键）：**
`probeToolSupport()` 返回 `res.ok || res.status === 400`，原意是"400 = 请求被解析（工具字段合法）"。
但 Ollama 对 DeepSeek-R1 返回：
```json
HTTP 400: "DeepSeek-R1:latest does not support tools"
```
导致 `supportsToolCalls = true`（错误），`SmartLocalProvider` 将所有请求路由到 `OpenAICompatibleProvider` 并附带 `tools` 数组 → Ollama 每次返回 400 → LLM 层完全无响应，UI 显示 "● ready" 后无任何输出。

**修改文件：** `src/providers/local.ts` — `probeToolSupport()`
```typescript
// 旧版（错误）：
return res.ok || res.status === 400;

// 新版：
if (res.ok) return true;
if (res.status === 400) {
  const body = await res.text().catch(() => "");
  if (/does not support tools|tool.*not supported|not.*support.*tool/i.test(body)) return false;
  return true;  // 其他 400 = 请求被解析，视为支持
}
return false;
```

**验证：**
```
discoverLocalModel(undefined, "DeepSeek-R1:latest")
  → supportsToolCalls: false  ✓（修复前为 true）
```

---

### [BUG-FIX] LazyStreamHandle 双重 HTTP 请求 → 第一个消耗 token，第二个为空

**根因：**
```typescript
// 旧版（broken）：
async *deltas()       { yield* this.getInner().stream(this.params).deltas(); }
async finalMessage()  { return this.getInner().stream(this.params).finalMessage(); }
// 每次调用 stream() 产生独立 HTTP 请求
```
`deltas()` 一次请求消耗所有 token；`finalMessage()` 再发一次，流已空 → `NormalizedMessage` 为空内容 → agent loop 认为 LLM 无输出 → UI 无响应。

**修改文件：** `src/providers/index.ts` — `LazyStreamHandle`
```typescript
// 新版（fixed）：
private innerHandle: ProviderStreamHandle | null = null;

private getHandle(): ProviderStreamHandle {
  if (!this.innerHandle) this.innerHandle = this.getInner().stream(this.params);
  return this.innerHandle;
}
async *deltas()       { await this.initPromise; yield* this.getHandle().deltas(); }
async finalMessage()  { await this.initPromise; return this.getHandle().finalMessage(); }
```

---

### [BUG-FIX] XmlFallbackStreamHandle 使用 `stream:false` 阻塞 → 等待 R1 全量思考完毕

**根因：**
`XmlFallbackStreamHandle` 使用 `stream: false` + `fetch().json()` 阻塞等待完整响应。DeepSeek-R1 32B 在生成答案前会进行数分钟的内部思考链（thinking chain），全部完成才返回第一字节 → UI 在此期间完全冻结，显示空白。

**修改文件：** `src/providers/local.ts` — `XmlFallbackStreamHandle` 完全重写
- 改为 SSE 流式请求（`stream: true`）
- `runStream()` 读取 ReadableStream，每收到 SSE chunk 立即通过 `pushDelta()` 发送增量事件
- `<think>` 状态机实时分离 thinking/text 内容
- delta 队列 + resolver 机制（与 `OAIStreamHandle` 同构），`deltas()` 和 `finalMessage()` 共享同一流

---

### [BUG-FIX] Ollama R1 `</think>` 标签泄漏到正文输出

**根因：**
Ollama 服务通过 `/v1/chat/completions`（OAI 兼容端点）输出 DeepSeek-R1 响应时，自动剥离了 `<think>` **开标签**，但保留了 `</think>` **闭标签**。格式如下：
```
\n思考文本...(大量推理内容)\n\n</think>\n\n实际回答
```
`processChunk()` 状态机等待 `<think>` 才进入 thinking 模式，但开标签永远不出现，导致：
1. 推理内容以普通文本显示在输出中
2. `</think>` 字面量出现在用户可见的回答里

**修改文件：** `src/providers/local.ts` — `XmlFallbackStreamHandle.processChunk()`
- 新增分支：当 `!inThinkBlock` 时检测 `</think>`（早于 `<think>`）
- 遇到裸 `</think>` → 其前内容整体归类为 thinking delta，剩余内容为 text delta
- `</think>` 后的前导空白自动 trim（R1 在 `</think>` 和答案之间通常有 `\n\n`）

**验证（端到端）：**
```
node dist/index.js "你好，你是什么模型？"
  → "- Thinking..." 显示推理中
  → 推理内容在 showThinking=true 时以 dim 样式流式显示
  → </think> 不再出现在输出
  → 最终回答干净显示
```

---

### [I011] Smart Local Model Provider

**目标：** 本地模型（Ollama / LM Studio / llama.cpp / vLLM）一键接入，自动探活、能力检测、XML 工具调用降级

**设计动机：**
原 `ollama` provider 硬编码端口、无探活、不检测 tool_call 支持，模型不支持时直接报错无降级。

**新增文件：** `src/providers/local.ts`

- `LOCAL_ENDPOINTS[]` — 4 个已知本地服务端口（:11434 / :1234 / :8080 / :8000）
- `probeEndpoint(endpoint, model)` — 并行三步探测：
  1. GET `modelsPath` → 确认服务存活 + 获取模型列表
  2. POST `infoPath`（Ollama）→ 从 `model_info.llama.context_length` 读取实际 context window
  3. pattern 匹配（TOOL_CAPABLE_PATTERNS）+ dry-run `/chat/completions` 探测 tool_call 支持
- `discoverLocalModel(targetUrl?, model?)` — 并行探活所有端点，返回第一个响应的
- `SmartLocalProvider` — 有原生 tool_call → 委托 `OpenAICompatibleProvider`；无 → `XmlFallbackStreamHandle`
- `buildXmlToolPrompt(tools)` — 将工具定义格式化为 `<tool_call>` XML schema 注入 system prompt
- `parseXmlToolCalls(text)` — 从 LLM 响应解析 `<tool_call><name>...</name><input>...</input></tool_call>` 块

**修改文件：** `src/providers/index.ts`
- `ollama` 分支改为 `LazyLocalProvider`（同步创建，异步探活延迟到第一次 `stream()` 调用）
- `LazyLocalProvider` + `LazyStreamHandle` — 包装异步 `discoverLocalModel()`，使 `createProvider()` 保持同步

**修改文件：** `src/config/schema.ts`
- 新增 `localModel` 配置块：`autoDiscover` / `serviceUrl` / `useForMemory` / `memoryModel`

**验证方式：** 见配置测试指南

---

### [I012] 语义向量记忆系统

**目标：** 用向量语义检索替代全量注入，实现"无限记忆"（记忆量无限增长，context 大小恒定）

**设计动机：**
原 `formatMemoryForPrompt()` 把所有记忆全量塞入 system prompt，随会话积累线性膨胀；依赖 Anthropic key 提取，离线场景完全不可用。

**新增文件：** `src/memory/embeddings.ts`
- `OllamaEmbeddingProvider` — 调用 `http://localhost:11434/api/embeddings`，并发批处理（concurrency=4）
- `TfIdfEmbeddingProvider` — 纯算法 TF-IDF 稀疏向量降级，完全离线，支持中文（Unicode 范围保留）
- `createEmbeddingProvider()` — 工厂函数：Ollama 可用 → Ollama；否则 → TF-IDF
- `cosineSimilarity(a, b)` — 标准余弦相似度计算

**新增文件：** `src/memory/vector-store.ts`
- `VectorStore` — JSON 持久化至 `~/.seed/memory/vectors.json`，零外部依赖
- `upsertMemoryLayer(projectId, layer, text, embedder)` — 分块（段落/句子边界，MAX_CHUNK_CHARS=300）→ embed → 存储，同层旧块自动替换
- `search(queryVector, projectId, topK, threshold)` — 余弦相似度排序，项目内 + 全局 user 层
- `pruneStale(maxAgeMs=90天)` — 自动清理过期 chunk

**新增文件：** `src/memory/semantic-retrieval.ts`
- `SemanticMemoryRetriever` — 单例，会话内复用，init 只执行一次（避免重复加载向量库）
- `buildMemorySection(projectPath, userMessage)` — 对外接口：embed 用户消息 → 检索 Top-K → 格式化注入
- 降级：检索失败 → 全量注入（非致命）

**修改文件：** `src/agent/system-prompt.ts`
- `buildSystemPrompt()` 新增 `userMessage?` 参数
- 有 userMessage → `buildMemorySection()`（语义检索）；无 → `formatMemoryForPrompt()`（全量注入）

**修改文件：** `src/config/schema.ts`
- 新增 memory 子字段：`semanticRetrieval` / `embeddingModel` / `topK` / `similarityThreshold`

**效果量化：**
```
记忆量：1000 次会话 → ~5000 个 chunk → vectors.json ~50MB
注入量：固定 Top-8 chunk ≈ 800 tokens（不随历史增长）
原方案：全量注入，1000 次会话后可能 >10,000 tokens
```

**验证方式：** 见配置测试指南

---

## 2026-04-03 · v0.8.0

---

### [FIX] web_fetch curl 降级（网页浏览能力修复）

**目标：** 解决 Node.js `fetch()` 对主流网站超时问题，实现通用网页浏览能力

**根因：**
Node.js 24 内置 `fetch()`（undici）在 HTTP/2 ALPN 协商阶段对主流网站超时（BBC、Reuters 等均 15s+ 无响应），而同机 `curl.exe` 正常（默认 HTTP/1.1）。

**修改文件：**

`src/tools/web-fetch.ts` — 完全重构（v0.7.0 → v0.8.0）
- 拆分为 `tryNativeFetch()` + `tryCurlFetch()` + 共用 `buildResult()`
- `tryNativeFetch()`：原 fetch 逻辑，返回 `ToolResult | null`（null = 触发降级）
- `tryCurlFetch()`：`execFileAsync(CURL_BIN, args, { maxBuffer: 10_000_000, encoding: "binary" })`
  - `CURL_BIN = process.platform === "win32" ? "curl.exe" : "curl"`（跨平台）
  - 追加 `-w "\n__CURL_META__%{http_code} %{content_type}"` sentinel 提取元数据
  - `encoding: "binary"` 原始字节 → Uint8Array → charset-aware `TextDecoder` 解码
- 降级触发条件：AbortError（超时）+ 连接级错误（ECONNRESET / ENOTFOUND / fetch failed）
- HTTP 4xx/5xx 不降级（curl 会得到相同响应码，降级无意义）

**中途修复（同次）：**
1. 首版 `maxBuffer: maxBytes * 4 = 320KB` → BBC News 328KB 溢出 → 改为固定 `10_000_000`
2. 首版含 `--max-filesize` curl 参数 → 体积超限时中止下载导致 sentinel 丢失 → 移除该参数

**验证结果：**
```
BBC News (328KB HTML) ：native 超时 → curl 降级 → ✅ OK (12.8s)
HackerNews API (JSON) ：native ✅ OK (0.8s)
httpbin.org    (JSON) ：native ✅ OK (3.3s)
Reuters               ：curl 401 DataDome（重度 bot 保护，预期行为）
```

---

### [I009] CC Fusion — 系统提示 + 斜杠命令 + 输出截断

**目标：** 将 Claude Code 的最佳系统提示架构融入 devai，同时实现安全输出截断

**设计动机：** 原系统提示为单一字符串，无结构，无截断保护；工具输出无上限

**修改文件：**

`src/agent/system-prompt.ts` — 完全重写
- 静态部分（每次相同）：`getIntroSection()` / `getSystemSection()` / `getDoingTasksSection()` / `getToolSection()`
- 动态部分（每次重建）：`getEnvSection()` / `getWindowsSection(sandboxEnabled)` / 长期记忆 / 压缩摘要 / CLAUDE.md
- 无伪造规则：明确禁止工具失败时编造数据
- 沙箱感知：`sandboxEnabled=true` → Docker 规则；`false` → PowerShell + curl.exe 提示

`src/commands/slash.ts` — 新建
- 7 条命令：`/clear` `/compact` `/cost` `/help` `/model` `/memory`

`src/tools/bash.ts`
- `MAX_OUTPUT_CHARS = 30_000`（字符数截断，含中文更精确）
- `maxBuffer: MAX_OUTPUT_CHARS * 4`（字节缓冲 = 字符 × 4）
- 修复：常量改名后未同步 3 处引用 → 全部修正

`src/tools/registry.ts`
- `MAX_TOOL_RESULT_CHARS = 50_000`
- `capToolResult()` — 在 `cache.set()` 前调用（两层截断：bash 30K + registry 50K）
- 修复：函数声明但未插入执行链 → 补充调用位置

**验证：** `npm run build` 通过，`/cost` 命令正常返回

---

### [I010] 自然语言 Token 预算解析

**目标：** 用户在消息中直接写 "+500k"/"spend 2M" 即可覆盖 token 预算上限

**修改文件：**

`src/utils/token-budget-parser.ts` — 新建
- `parseTokenBudget(input)` — 正则匹配多种自然语言形式，返回整数或 null
- `stripTokenBudgetPhrase(input)` — 移除已解析的预算短语，防止发给 LLM
- 边界：`MIN_BUDGET = 1_000` / `MAX_BUDGET = 10_000_000`

`src/ui/hooks/useAgentLoop.ts`
- `submit()` 中解析 → `dynamicHardLimit` → 传入 `runAgentLoop`
- `effectiveInput`（去掉预算短语）替换原 `userInput` 传给 LLM
- 修复：首版声明变量但未替换下游引用 → 补全所有引用

**验证：** 输入 "帮我重构 foo.ts，+500k tokens" → LLM 收到 "帮我重构 foo.ts"，hardLimit=500_000

---

### [UI-FUSION] 终端 UI 视觉全面升级

**目标：** 消除廉价感，对齐 Claude Code 视觉标准，保留 devai 品牌标识（◆ 种子符号）

**修改文件：**

`src/ui/theme.ts` — 完全重写
- 全面改用 `rgb()` 精确色值（ANSI 命名色会被终端主题覆盖，不稳定）
- `BULLET = platform === "darwin" ? "⏺" : "●"`（平台感知，对齐 CC figures.ts）
- Diff 色彩直接来源 CC：`diffAdded: "rgb(105,219,124)"` / `diffRemoved: "rgb(255,168,180)"`
- 双主题：dark（默认暖奶油）/ light；React ThemeContext + `useTheme()` hook

`src/ui/components/ToolCall.tsx` — 完全重写
- `useBlink(active)` hook：600ms 间隔，`active=false` 立即清除定时器防内存泄漏
- 单 ● 指示器：金色+闪烁=运行中 → 绿=成功 → 红=失败（与 CC ToolUseLoader 同构）
- `DiffDisplay` 子组件：`"- "` 前缀 → diffRemoved 红；`"+ "` 前缀 → diffAdded 绿

`src/ui/components/StatusBar.tsx` — 完全重写
- `━`（U+2501）重划线 62 字符，替代原单划线
- 左列：spinner + 状态 + 耗时；右列：tokens + 费用 + 模型（去掉 "claude-" 前缀）+ sessionId

`src/ui/components/InputBar.tsx`
- 移除 `borderStyle="single"`，改为无边框设计
- `▎` 金色重音条（活跃时金色，空/禁用时灰色）
- `▸` 提示符，`━` 顶部分隔线

`src/ui/components/Logo.tsx` — 版本号更新至 v0.8.0，主文字改用 `palette.primary`

`src/ui/components/MessageList.tsx`
- `◆` sparkle 用 `palette.brand`（暖橙 rgb(200,130,80)）
- 系统消息添加 `▎` 左竖线
- ToolCall 接收 `result` prop 用于 diff 展示

---

### [DIFF-PIPELINE] file_edit diff 渲染全链路

**目标：** file_edit 执行后在终端显示红绿 diff（类似 git diff 风格）

**数据流：**
```
buildDiff() → tool_result { toolName, content: diffStr }
  → useAgentLoop 写入 tool_use block.result
  → ToolCall.tsx DiffDisplay 着色渲染
```

**修改文件：**

`src/tools/file-edit.ts`
- 新增 `buildDiff(oldStr, newStr, filePath, fileContent)`
- 计算起始行号（indexOf 前的换行数）、`"- "` / `"+ "` 前缀行、MAX_DIFF_LINES=30 截断

`src/types/agent.ts`
- `tool_result` AgentEvent 新增 `toolName: string`
- `tool_use` UIContentBlock 新增 `result?: string`

`src/agent/loop.ts`
- 两处 `tool_result` onEvent（成功路径 + catch 错误路径）均补充 `toolName`
- 修复：catch 路径漏掉 toolName → 补全

`src/ui/hooks/useAgentLoop.ts`
- `SHOW_RESULT_TOOLS = new Set(["file_edit", "file_write"])`
- tool_result 到达时查找对应 tool_use block，写入 `result` 字段

---

### [I005 FIX] Docker 沙箱优雅降级

**目标：** Docker 未运行时不崩溃，自动回落到宿主 PowerShell

**根因：** `sandbox.run()` 直接调用 `docker run`，daemon 未启动抛出 ENOENT，未捕获

**修改文件：**

`src/tools/registry.ts`
- bash 执行路径插入 `await this.sandbox.isAvailable()` 探活
- 不可用 → `executeBash(input, ctx)` + 前缀 `[Sandbox unavailable — running on host]`

`src/agent/system-prompt.ts`
- `getWindowsSection(sandboxEnabled)` 根据参数注入不同规则集

---

## 2026-04-02 · v0.6.0

---

### [P001] UI 滚动行高模型修复

**根因：** 滚动范围基于消息计数（`floor(rows/3)`），高内容消息（多行代码块）实际行数远超计数，导致 `total ≤ maxVisible` 时滚动范围归零，用户无法上滚。

**修改：** `src/ui/app.tsx`
- `scrollOff` 单位改为估算行数（`estimateMsgLines` = 内容换行数 + 2 行开销）
- `maxScrollOff = totalLines - viewportLines`
- 鼠标滚轮 = 3 行；PgUp/PgDn = 整屏
- `maxScrollOffRef` 防止 mouse callback 闭包过期

---

### [P002] Shift+Enter 换行支持

**根因：** Ink 不暴露 shift 修饰键，`key.shift` 始终 undefined，Enter 和 Shift+Enter 无法区分。

**修改：** `src/ui/renderer.ts`
- 启动写入 `\x1b[>1u`（kitty）+ `\x1b[>4;1m`（xterm modifyOtherKeys）
- stdin 过滤：`\x1b[13;2u` → `\n`；`\x1b[27;2;13~` → `\n`
- Ink 将 `\n` 解码为 Ctrl+J，InputBar 已处理为插入换行
- 退出清理：`\x1b[<u` + `\x1b[>4;0m`

---

## v0.5.0（I005 / I006 / I007）

### [I005] Docker 沙箱

`src/sandbox/manager.ts` — 新建
- `SandboxManager`：`docker run --rm` 用后即焚容器
- `buildArgs()`：三级隔离 strict（ro+no-network）/ standard / permissive
- `toDockerPath()`：Windows 路径转换（`D:\foo` → `/d/foo`）
- `isAvailable()`：`docker info` 探活，结果缓存，5s 超时

### [I006] MCP 协议客户端

`src/mcp/client.ts` + `mcp/registry.ts` + `mcp/types.ts` — 新建
- `StdioMCPClient`：stdio 子进程 MCP 协议实现
- `MCPRegistry`：多服务器聚合，命名 `{server}__{tool}`，动词前缀风险分级

### [I007] 自进化长期记忆

`src/memory/long-term.ts` — 新建
- `projectFingerprint`：`sha1(normalize(path)).slice(0, 12)`
- 3 层记忆：`user.md` / `context.md` / `decisions.md` / `learnings.md`
- Haiku 语义提取（max 1200 tokens），`mergeMemoryField` 追加合并不覆盖
- 跳过条件：消息数 < 4，非 Anthropic key

---

## v0.4.0（I001 / I002 / I003 / I004）

### [I001] 并行工具执行

`src/agent/loop.ts`
- 权限收集串行（UX 清晰）→ `Promise.allSettled()` 并行执行
- 实测：2–4 个并发工具调用，延迟从 N×T 降至约 1.2×T

### [I002] 会话级工具结果缓存

`src/tools/cache.ts` — 新建
- 可缓存工具：`file_read` / `glob` / `grep` / `web_fetch`（5分钟 TTL）
- 缓存键：`toolName + JSON.stringify(input)`
- 写前路径级失效：`file_write` / `file_edit` 执行前清除涉及该路径的所有缓存条目

### [I003] LLM 驱动上下文压缩

`src/agent/context.ts`
- `SUMMARY_MODEL = "claude-haiku-4-5-20251001"`，max 600 tokens
- 触发条件：`lastInputTokens / contextWindow > compactionThreshold/100`
- `summaryHistory[]` 累积多轮摘要，注入 system prompt 动态区

### [I004] 会话统计追踪器

`src/utils/stats.ts`
- 追踪：toolCalls / cacheHits / cacheMisses / estimatedCostUsd / sessionDuration
- StatusBar 实时展示，`/cost` 命令完整报告

---

*最后更新：2026-04-09 · v0.9.1-alpha.24 (r39) · 下次更新节点：集成测试扩展（流式中断、Hooks 错误路径）*
