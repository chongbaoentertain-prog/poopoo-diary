# 架构

## 前端和后端,一眼分清

```
frontend/   浏览器里运行的一切:React 界面、业务规则、本地存档、同步逻辑
backend/    Supabase 上运行的一切:数据库表、权限、函数。没有服务器代码
docs/       文档
```

- **后端只有数据库**。三张表加四个函数(`sync_pull`、`sync_push`、`vault_clear`、`vault_restore`),全部在 [`backend/supabase/migrations/`](../backend/supabase/migrations)。表对外不开放,前端只能调这四个函数。
- **前端调后端的唯一入口**是 `frontend/src/services/api/supabaseSyncApi.ts`。前端其余所有代码都不知道 Supabase 的存在,只认 `types/sync.ts` 里的 `SyncApi` 接口。

**debug 怎么找**
- 页面显示不对、点了没反应 → 看 `frontend/src/` 里的 `pages/`、`features/`、`components/`。
- 数据算错(经验、连续天数、合并结果)→ 看 `domain/`,都是不依赖 React 的纯函数,有单元测试。
- 同步没成功 → 先看 `services/api/`:请求有没有发出、HTTP 状态码是多少;再看 `services/sync/syncEngine.ts` 的流程;最后看后端函数。
- 后端函数行为不对 → 跑 `node backend/scripts/check-supabase.mjs`,它直接对真实数据库走一遍,不经过前端。

## 前端目录(`frontend/src/`)

```
app/                应用外壳:App.tsx(引导页 / 标签切换)、BottomTabBar.tsx
pages/              整页:HomePage、ReviewPage、CollectionPage、ProfilePage、OnboardingPage
features/<功能>/    一个功能一个目录,index.ts 是它对外的出口
  calendar  checkin  character  share  sync
components/         跨功能的通用组件
  poo/              噗的全部绘制(见 art-guide.md)
hooks/              useAppStore、useSyncStatus
stores/             zustand store:createAppStore.ts(创建)、appStore.ts(全应用共用的那一个)、selectors.ts
services/           和"外部"打交道
  api/              调后端(Supabase)
  storage/          本地存档(localStorage)
  sync/             同步引擎、存档码、同步状态
domain/             纯业务规则:经验、连续天数、进化、重算、合并、规范化、日历格子、印章
data/               静态内容:角色(characters/)、心情(moods.ts)
types/              共用类型:diary.ts、character.ts、sync.ts
```

**依赖方向**(只能往下依赖,不能反过来):

```
pages / app
   ↓
features ─→ components ─→ hooks
   ↓                        ↓
 services ───────────────→ stores
   ↓                        ↓
 domain ─→ data ─→ types
```

- `domain` 和 `data` 不依赖 React,也不依赖 `stores` / `services`,所以可以单独测试。
- `features` 之间不互相引用内部文件,要用别的功能就从它的 `index.ts` 引。
- `pages` 只负责拼装,具体逻辑放在 `features` 或 `domain`。

## 数据流

```
界面 ──调用动作──▶ store ──纯函数──▶ domain
 ▲                  │
 └──── 订阅状态 ─────┴──▶ services/storage 持久化到 localStorage
                          services/sync 在后台和云端对齐(见 sync.md)
```

- **domain**:`recordCheckIn` 生成一条签到记录;`recomputeFromCheckIns` 按全部记录重算连续天数、倍率、经验、形态,所以补签、乱序补签、跨月都与顺序无关;`evolution` 管形态和毕业;`rules` 放常量。
- **stores**:`createAppStore(repository)` 返回 zustand store,动作改完状态立刻存档。浏览器里用 `appStore`(存 localStorage),测试用内存存档。
- **services/storage**:`AppStateRepository` 只有 `load / save / clear` 三个方法。
- **services/sync**:本地优先的云端同步,叠在 store 之上,不改变页面读写本地存档的方式。

## 状态

```ts
AppState { version, profile, activeCharacterId, checkIns[], progress[], profileUpdatedAt? }
```

- `progress` 每个角色一条,含已毕业的(= 图鉴)。
- `checkIns` 每次签到一条;同一天只有第一条 `counted`,只有它计经验和连续。
- 一条签到的 `stampId` = `角色id:形态:心情`,日历和图鉴靠它还原当时的样子。**读写都走 `domain/stamp.ts`**,别处不要手动拆这个字符串。

## 心情的内部名字

界面显示的是中文,内部名字按含义取:

| 界面 | 内部 id | | 界面 | 内部 id |
|---|---|---|---|---|
| 舒畅 | `refreshed` | | 憋屈 | `sulky` |
| 淡定 | `calm` | | 泄气 | `deflated` |
| 躺平 | `lyingFlat` | | 嫌弃 | `disgusted` |
| | | | 崩溃 | `breakdown` |

早期用过别的名字(`happy`、`think`、`sleep`、`speechless`、`sad`、`nausea`、`dizzy`)。**本机存档和云端数据库里已经签的记录存的还是旧名字,永远读得到**,`domain/stamp.ts` 读取时统一转成新名字,写入一律用新名字。不要删掉这个转换。

## 读档修正(`normalizeAppState`)

每次启动读档、以及每次合并云端数据后,在 `domain/normalizeAppState.ts` 里做一次修正:

1. 丢掉角色表里已经不存在的角色(beta 期间角色表缩减过)。
2. 当前角色不存在时,切到剩下的第一只未毕业角色,头像一并修正。
3. 一只有效角色都不剩时,回到初始状态,让用户重新选角。
4. 同一天只保留最早的一条计经验记录(多设备合并时可能出现两条)。
5. 用 `recomputeFromCheckIns` 重算连续天数等派生数据。

> 已下架角色留下的签到记录会保留,日历上用第一只角色的样子兜底显示。

## 分享(`features/share`)

纯前端,不依赖后端,离线也能用:

```
shareCardData.ts    纯函数:按范围从 checkIns 算出卡片数据(每天的角色/形态/心情、统计、文案)
ShareCard.tsx       整张卡片是一个 SVG,预览和导出共用同一份
exportCardAsPng.ts  SVG → canvas → PNG;手机调起系统分享面板,不支持就下载
ShareSheet.tsx      范围选择、隐藏昵称/心情、预览、分享
```

- 卡片只含角色、心情、连续天数,**不含具体时间、次数和存档码**。
- 同一天同一角色的文案由日期哈希决定,预览多次不会变。
- 导出时读不到网页字体,卡片里用系统字体栈。

## 命名约定

- **名字写全,不用缩写**。最好的注释就是代码本身:`checkIn` 不叫 `ci`,`characterId` 不叫 `cid`,`selectedDates` 不叫 `sel`。循环变量也一样:`for (const checkIn of checkIns)`。
- 唯一例外:SVG 里的 `x`、`y`、`cx`、`cy` 等是坐标的通用写法。
- 组件、类型用 `PascalCase`;函数、变量用 `camelCase`;常量用 `UPPER_SNAKE_CASE`。
- 布尔值用 `is` / `has` / `should` 开头:`isBusy`、`hasAcknowledgedSaveCode`。
- 事件处理函数用 `handle` 开头(`handleCopyClick`),传给子组件的回调 prop 用 `on` 开头(`onSelectDate`)。
- 日期一律是本地日期字符串 `YYYY-MM-DD`(类型 `DateKey`,工具在 `domain/date.ts`),不要用 `Date` 直接比较。
- UI 文案用中文;代码注释也用中文,解释"为什么"而不是"做了什么"。
