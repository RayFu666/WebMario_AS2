# Web Mario

## 遊戲操作

| 操作   | 按鍵              |
| ---- | --------------- |
| 向左移動 | A 或 Left Arrow  |
| 向右移動 | D 或 Right Arrow |
| 跳躍   | Space           |

玩家操作 Mario 通過 Level 1，途中可以跳躍、踩敵人、撞擊問號方塊、取得金幣或蘑菇，最後抵達旗子完成關卡。

---

## 遊戲流程

1. 進入 Start 畫面
2. 按下 START 進入 Level Select
3. 選擇 Level 1
4. 進入 Game Start 提示畫面
5. 自動進入 Level 1
6. 抵達旗子後進入 Level Clear 結算
7. 顯示剩餘時間加分
8. 回到 Level Select，並保留目前的 score、coin、life

如果玩家死亡但 life 尚未歸零，會回到 Game Start 後重新進入 Level 1。
如果 life 歸零，會進入 Game Over 畫面。

---

## UI 顯示

遊戲中會顯示以下資訊：

| UI    | 說明      |
| ----- | ------- |
| Life  | 玩家剩餘生命  |
| Score | 目前累積分數  |
| Timer | 關卡剩餘時間  |
| Coin  | 目前取得金幣數 |
| World | 目前關卡    |

通關後會依照剩餘時間計算加分：

```text
remaining time × 50 = bonus score
```

加分會加入目前的 Score。

---

## 關卡元素

### Player

玩家可以左右移動與跳躍。
Small Mario 碰到敵人會扣 life。
Big Mario 碰到敵人時會變回 Small Mario，不會立刻扣 life。

### Goomba

Goomba 會在設定範圍內左右巡邏。
玩家可以從上方踩死 Goomba，踩死後會增加 score。
如果從側面碰到 Goomba，會依照 Mario 狀態觸發受傷或死亡流程。

### Question Block

問號方塊會循環播放動畫。
玩家從下方撞擊後，方塊會變成 used block，且只能觸發一次。

目前有兩種問號方塊：

| 類型            | 效果                   |
| ------------- | -------------------- |
| MushroomBlock | 產生蘑菇                 |
| CoinBlock     | 跳出金幣，增加 coin 與 score |

### Mushroom

蘑菇會從問號方塊後方冒出，接著往右移動並落到地面。
玩家吃到蘑菇後會變成 Big Mario，並增加 score。

### Coin

金幣會從 CoinBlock 中跳出，播放旋轉動畫後消失。
撞擊 CoinBlock 時會立即增加 coin 與 score。
金幣消失後會出現 `100` 分數提示文字。

### One-way Platform

部分黃色平台是單向平台。
玩家可以從下方跳上去穿過平台，從上方落下時可以站在平台上。

### Flag

玩家抵達旗子後會觸發 Level Clear。
此時會停止玩家操作，顯示通關結算，播放通關音效，最後回到 Level Select。

---

## 音效與音樂

| 音效            | 使用時機                     |
| ------------- | ------------------------ |
| bgm_1         | Start 與 Level Select     |
| bgm_2         | Level 1                  |
| jump          | 玩家跳躍                     |
| loseOneLife   | 玩家扣 life                 |
| powerUpAppear | 問號方塊產生物品                 |
| PowerUp       | 吃到蘑菇                     |
| powerDown     | Big Mario 變回 Small Mario |
| kick          | 踩死 Goomba                |
| levelClear    | 通關                       |
| Game Over     | life 歸零                  |

Start 到 Level Select 期間會持續播放 bgm_1。
按下 Level 1 後 bgm_1 會停止，進入 Level 1 後播放 bgm_2。

---

## 地圖與碰撞

Level 1 地圖使用 Tiled 製作。
地板、平台、水管等碰撞區域使用 Tiled Object Layer 設定，再由 Cocos 生成對應的碰撞物件。

使用的碰撞層包含：

| Layer           | 說明              |
| --------------- | --------------- |
| Collisions      | 一般地板、水管、平台等實體碰撞 |
| OneWayPlatforms | 只能從上方站立的單向平台    |

---

## 目前完成內容

* Start 畫面
* Level Select 畫面
* Game Start 畫面
* Level 1 關卡
* Game Over 畫面
* Player 移動與跳躍
* Small / Big Mario 狀態
* Mario 動畫與死亡動畫
* Goomba 敵人
* 問號方塊
* 蘑菇
* 金幣方塊
* Tiled 地圖碰撞
* One-way platform
* HUD 顯示
* Level Clear 結算
* 音效與背景音樂

## Web Link

Firebase Hosting URL:

https://assignment2-f9b46.web.app

## Repository

GitHub  URL:https://github.com/RayFu666/WebMario_AS2/tree/main