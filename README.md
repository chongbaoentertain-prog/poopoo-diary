# 噗噗日记

养成式的排便打卡 app:每天签到攒经验,培育一只噗一步步进化;每次签到选一个今天的心情,日历和图鉴都会记住。目前是 beta,数据只存在浏览器 localStorage。

## 运行

```bash
npm install
npm run dev     # 开发
npm test        # 单元测试
npm run build   # 类型检查 + 打包
```

## 玩法速览

| | |
|---|---|
| 签到 | 每天第一次签到计经验,同一天再签只记录不计经验;可补签过去的日子,也可批量补签 |
| 连续 | 连续天数越长经验倍率越高(见 `src/domain/xp.ts`) |
| 进化 | 经验达到阈值进化,共 5 个形态;满级后可毕业进图鉴,再选一只新的 |
| 心情 | 签到时选 7 种心情之一:舒畅、淡定、躺平、憋屈、泄气、嫌弃、崩溃。日历取当天最新一次,图鉴取该角色最近一次 |
| 角色 | 7 个属性(金木水火土衰弱中毒)× 每属性 3 只,共 21 只,名册见 [docs/characters.md](docs/characters.md) |

## 目录结构

```
src/
  domain/      纯逻辑:经验、连续天数、进化、重算。不依赖 React,有单元测试
  storage/     存档接口 Repository + localStorage / 内存两种实现
  store/       zustand store(动作 + 读档修正)和 selectors
  data/
    characters/  角色数据,每个属性一个文件,index.ts 汇总
  components/  跨页面复用的组件
    art/       噗的全部绘制:身体 / 脸 / 配饰 / 每只角色的道具和场景(kits/)
  features/    按页面划分:checkin、calendar、collection、profile、review、onboarding、character
docs/          架构、角色名册、美术指南
```

依赖方向:`features → store → domain`,`features/components → data`,`domain` 不依赖任何上层。

## 文档

- [docs/architecture.md](docs/architecture.md):数据流、存档、读档修正
- [docs/characters.md](docs/characters.md):21 只角色名册,以及怎么新增/下架角色
- [docs/art-guide.md](docs/art-guide.md):噗的绘制分层、坐标约定、怎么画道具和场景
