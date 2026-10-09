# 架构

## 数据流

```
UI(features/*) ──调用动作──▶ store(appStore.ts) ──纯函数──▶ domain/*
       ▲                          │
       └────── 订阅状态 ───────────┴──▶ storage(Repository)持久化
```

- **domain**:`checkin.ts` 生成一条签到记录;`recompute.ts` 按全部记录重算连续天数、倍率、经验、形态,所以补签、乱序补签、跨月都与顺序无关;`evolution.ts` 管形态和毕业;`rules.ts` 放常量(形态阈值、最高形态)。
- **store**:`createAppStore(repo)` 返回 zustand store,动作改完状态立刻 `persist`。`useAppStore.ts` 绑定真正的 localStorage;测试用 `memoryRepo`。
- **storage**:`Repository` 只有 `load / save / clear` 三个方法,以后接后端只需要再实现一份。

## 状态

```ts
AppState { version, profile, activeCharacterId, checkIns[], progress[] }
```

- `progress` 每个角色一条,含已毕业的(= 图鉴)。
- `checkIns` 每次签到一条;同一天只有第一条 `counted`,只有它计经验和连续。
- 一条签到的 `stampId` = `角色id:形态:心情`,日历和图鉴靠它还原当时的样子。心情取自签到时用户的选择,未选默认 `happy`。

## 读档修正(`fixLoaded`)

每次启动读档后,在 `appStore.ts` 里做一次修正:

1. 丢掉角色表里已经不存在的角色(beta 期间角色表缩减过)。
2. 当前角色不存在时,切到剩下的第一只未毕业角色,头像一并修正。
3. 一只有效角色都不剩时,回到初始状态,让用户重新选角。
4. 用 `recomputeAll` 重算连续天数等派生数据。

> 已下架角色留下的签到记录会保留,日历上用第一只角色的样子兜底显示。

## 分享(features/share)

纯前端,不依赖后端,离线也能用:

```
cardData.ts   纯函数:按范围从 checkIns 算出卡片数据(每天的角色/形态/心情、统计、文案)
ShareCard.tsx 整张卡片是一个 SVG,预览和导出共用同一份
exportPng.ts  SVG → canvas → PNG;手机调起系统分享面板,不支持就下载
ShareSheet.tsx 范围选择、隐藏昵称/心情、预览、分享
```

- 卡片只含角色、心情、连续天数,**不含具体时间、次数和存档码**。
- 同一天同一角色的文案由日期哈希决定,预览多次不会变。
- 导出时读不到网页字体,卡片里用系统字体栈。

## 约定

- 日期一律是本地日期字符串 `YYYY-MM-DD`(`domain/date.ts`),不要用 `Date` 直接比较。
- UI 文案用中文;代码注释也用中文,解释"为什么"。
- 新增页面放 `features/<页面名>/`;被两个以上页面用到的组件才放 `components/`。
