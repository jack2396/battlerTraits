# battlerTraits
【插件介紹】

藉由在角色、敵人等註釋欄加入標籤，給予該單位特性。

與遊戲內建的元素系統，有著一些不同。

１、如何克制

內建的元素只能透過「攻擊附帶元素」來克制「有設定元素率」的對象。

本插件則可以將「特性」設置在角色身上，即使角色沒有設定元素率，只要攻擊本身設定有「克制特定特性」，就可以產生傷害上升的效果。

２、克制的疊加方法

元素率只能以相乘的方式降低或提升受到的傷害，但特性可以在插件設定處改為倍率的相加或相乘。

３、自由控制傷害倍率

如第一點所寫，元素的克制只能由設定元素率的方式達成，特性則可以在狀態、盔甲、武器等各種層面寫上不同的克制對象與克制倍率，達成更多元的運用。

４、其他

插件設定處可以將部分特性開放為可疊加的模式，可以達成「同一特性越多，倍率越高」一類的特殊運用。

【更新紀錄】

Ver1.0 插件發布

【使用方法】

透過新增以下標籤來賦予特性與傷害的抗性與克制。

<Trait:x(, x2, x3...)> x值為特性名稱。

裝備帶有特性的物品，就會獲得對應特性。

可使用於狀態、武器、盔甲、敵人、角色、職業。


<DamageUp_Rate:x1, y1(, x2, y2...)>

x值為克制的特性名稱，y值為克制的倍率（請使用小數，如1.2、2.25等）。

預設為倍率相乘。

Example: y = 2.25, 傷害 = 100, 則最終傷害為225。

裝備帶有克制性質的物品，就會獲得對應克制能力。

可使用於狀態、武器、盔甲、敵人、角色、職業、技能。

用於技能的場合，會直接提升該技能的克制威力。

※也可以反面使用，令攻擊特定特性的傷害下降。


<DamageCut_Rate:x1, y1(, x2, y2...)>

x值為抵抗的特性名稱，y值為抵抗的倍率（請使用小數，如0.5、0.825等）。

預設為倍率相乘。

Example: y = 0.5, 傷害 = 100, 則最終傷害為50。

裝備帶有抵抗性質的物品，就會獲得對應抵抗能力。

可使用於狀態、武器、盔甲、敵人、角色、職業。

※也可以反面使用，令特定特性攻擊自身的傷害上升。


【使用規範】

１、本插件免費使用。

２、使用該插件時，修改插件內容不須告訴本人，但修改後禁止二度發布。

３、翻譯該插件前，請通知本人。

４、請勿將此插件用於販售、詐騙行為，但可以製作「使用本插件的商業營利遊戲」。

５、轉貼不須標示來源，有的話你會獲得作者的精神層面感謝。

６、禁止將此插件二度發布。
