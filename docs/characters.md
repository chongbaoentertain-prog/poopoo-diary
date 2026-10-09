# 角色名册

7 个属性 × 每属性 3 只。设计原则:**角色名是什么,画面里就要有什么**——每只都有一个随身道具(所有形态都在)、一套形态 4 配饰、一个形态 5 的场景。

形态 1~3 的名字自动生成:`XX拉稀 → XX条条 → XX三层`;形态 4、5 写在数据里。

| 属性 | 角色 id | 名字 | 随身道具 | 形态 4 | 形态 5 场景 |
|---|---|---|---|---|---|
| 金 | `gold-ingot` | 金元宝噗 | 元宝 | 墨镜金老板(墨镜) | 金币雨 + 元宝堆 |
| 金 | `gold-fortune` | 招财噗 | 红包 | 戴帽财神(帽子) | 红灯笼 |
| 金 | `gold-tycoon` | 首富噗 | 钱袋 | 暴发户(墨镜、耳环) | 钞票山 + 漫天钞票 |
| 木 | `wood-bamboo` | 竹子噗 | 竹子 | 竹林隐士(头顶嫩叶) | 满屏竹林 |
| 木 | `wood-mushroom` | 蘑菇噗 | 小蘑菇 | 蘑菇帽噗(蘑菇帽) | 萤火虫 + 林地蘑菇 |
| 木 | `wood-flower` | 花花噗 | 小花 | 花冠噗(花冠) | 蝴蝶 + 花田 |
| 水 | `water-bubble` | 泡泡噗 | 泡泡 | 泡泡王子(环绕泡泡) | 漫天大泡泡 |
| 水 | `water-pirate` | 海盗噗 | 宝箱 | 独眼船长(海盗帽、眼罩) | 海面 + 帆船 |
| 水 | `water-ice` | 冰块噗 | 冰块 | 冰镇噗(闪光) | 冰柱 + 雪花 + 雪堆 |
| 火 | `fire-chili` | 辣椒噗 | 辣椒 | 辣度爆表(头顶火焰) | 两侧烈焰 |
| 火 | `fire-grill` | 炭烧噗 | 烤串 | 烧烤大师(厨师帽) | 烤架 + 炭火 + 烟 |
| 火 | `fire-firework` | 烟花噗 | 烟花棒 | 派对噗(派对帽) | 夜空烟花 |
| 土 | `earth-miner` | 矿工噗 | 镐子 | 挖矿达人(安全帽) | 矿洞钟乳石 + 宝石 |
| 土 | `earth-dune` | 沙丘噗 | 仙人掌 | 沙漠旅人(头巾) | 太阳 + 金字塔 + 沙丘 |
| 土 | `earth-rock` | 石头噗 | 石堆 | 磐石噗(闪光) | 雪山 + 鹅卵石 |
| 衰弱 | `weak-worker` | 社畜噗 | 公事包 | 加班噗(领带、汗) | 办公室挂钟 + 满天文件 + 文件山 |
| 衰弱 | `weak-nightowl` | 熬夜噗 | 咖啡 | 黑眼圈噗(黑眼圈) | 月亮星星 |
| 衰弱 | `weak-cold` | 感冒噗 | 纸巾盒 | 鼻塞噗(口罩) | 病菌 + 纸巾团 |
| 中毒 | `poison-snake` | 毒蛇噗 | 盘蛇 | 蛇蝎美人(红唇) | 垂蛇 + 毒雾 |
| 中毒 | `poison-potion` | 药剂噗 | 药瓶 | 炼金学徒(护目镜) | 冒泡的药剂 + 药瓶 |
| 中毒 | `poison-spider` | 蜘蛛噗 | 垂吊蜘蛛 | 暗夜蜘蛛(蜘蛛腿) | 蛛网 |

## 新增一只角色

1. 在 `frontend/src/data/characters/<属性>.ts` 的 `characters` 里加一条:`id`(`属性-英文名`,存档靠它)、`name`(以「噗」结尾)、`stage4Name`、`stage5Name`、`stage4Accessories`、`stage5ExtraAccessories`、`quotes`(分享卡片上的搞笑文案,至少 3 句,要贴合角色,例如社畜噗:“像牛马一样,在屎海中奋力前行”)。
2. 在 `frontend/src/components/poo/characterKits/<属性>Kits.tsx` 加同 id 的 `{ prop, scene, foreground? }`,画法见 [art-guide.md](art-guide.md)。
3. 需要新配饰:先在 `types/character.ts` 的 `Accessory` 里加名字,再到 `components/poo/PooGear.tsx` 画出来。
4. 跑 `npm test`:`characters.test.ts` 会检查 id 不重复、每系列 3 只、每只都有美术、至少 3 句文案。
5. 更新上面的表格。

> 想改每系列只数,同时改 `data/characters/index.ts` 里的 `BODY_SHADE_VARIANTS`(每只身体深浅不同)和那条测试。

## 下架角色

直接删数据和美术条目即可。已有用户的存档会在读档时被自动清理(见 [architecture.md](architecture.md#读档修正normalizeappstate))。**id 一旦发布就不要复用**,否则旧存档会指向别的角色。
