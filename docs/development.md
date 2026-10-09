# 开发指南

## 安装与运行

需要 Node 18 以上。

```bash
npm install
npm run dev     # 开发,默认 http://localhost:5173
npm test        # 单元测试
npm run build   # 类型检查 + 打包
```

不配置任何东西也能完整使用,只是数据只在这台设备上,没有云端同步。

## 开启云端同步(可选)

1. 在 [supabase.com](https://supabase.com) 新建项目,到 **Project Settings → API** 复制 `Project URL` 和 `anon` / `publishable` key。
2. 复制 `.env.example` 为 `.env.local`,填入这两个值。**不要填 `service_role` / `secret` key。** `.env.local` 已被 `.gitignore` 排除。
3. 打开 Supabase 控制台的 **SQL Editor**,把 [`supabase/migrations/0001_sync.sql`](../supabase/migrations/0001_sync.sql) 整份贴进去执行(可重复执行)。
4. 运行联调检查,应全部 ✓:

   ```bash
   node scripts/check-supabase.mjs
   ```

5. `npm run dev`,「个人」页看到「已同步」即成功。

不配置 `.env.local` 时,同步相关界面会整体隐藏。更详细的设计和排错见 [sync.md](sync.md)。

## 测试

所有测试都放在项目根目录的 `tests/` 里,不放在 `src/` 下;`tests/fakeBackend.ts` 是测试用的内存版服务器,不是测试文件。

覆盖经验规则、存档、签到、分享卡片数据、角色表完整性,以及多设备同步的各种场景(离线、两台设备同一天签到、清空、恢复等,用内存版服务器)。

**改同步的 SQL 时**,同步修改 `tests/fakeBackend.ts`(内存版服务器,行为要和 SQL 对齐),并重新运行 `node scripts/check-supabase.mjs`。单元测试跑的不是真 SQL,联调脚本不能省。

## 约定

- 日期一律是本地日期字符串 `YYYY-MM-DD`(`domain/date.ts`),不要用 `Date` 直接比较。
- UI 文案用中文;代码注释也用中文,解释"为什么"。
- 新增页面放 `features/<页面名>/`;被两个以上页面用到的组件才放 `components/`。
- 依赖方向:`features → store → domain`,`features/components → data`,`domain` 不依赖任何上层。
- 新增角色:改 `src/data/characters/<属性>.ts` 并补 `src/components/art/kits/<属性>.tsx`,测试会检查是否齐全,步骤见 [characters.md](characters.md)。
