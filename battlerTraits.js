//=====================================================================================
// battlerTrait.js
//=====================================================================================
/*:
* @param 克制規則
* @desc 選擇相性產生克制時的傷害疊加規則。
* @type select
* @option 總和（如1.25 & 1.25 → 1.5）。
* @value 總和
* @option 相乘（如1.25 × 1.25 → 1.5625）。
* @value 相乘
* @default 相乘
* @param 抵抗規則
* @desc 選擇相性產生抵抗時的傷害疊加規則。
* @type select
* @option 相加（如0.8 & 0.05 → 0.85）。
* @value 總和
* @option 相乘（如0.8 × 0.4 → 0.32）。
* @value 相乘
* @default 相乘
* @param 特性疊層
* @desc 令列表中特性可以疊加（請使用,隔開）。
* @type text
* @plugindesc 賦予角色之間特殊的「相性」。
* @help
*
* 與Rpg Maker MV內建的元素不同，相性是一體兩面的，有可能因為對方持有
* 不同特性而降低或提升傷害。而元素只能作為單方面接受到的克制效果（即元
* 素率）。
*
* <Trait:x(, x2, x3...)> x值為特性名稱。
* 裝備帶有特性的物品，就會獲得對應特性。
* 可使用於狀態、武器、盔甲、敵人、角色、職業。
*
* <DamageUp_Rate:x1, y1(, x2, y2...)>
* x值為克制的特性名稱，y值為克制的倍率（請使用小數，如1.2、2.25等）。
* 預設為倍率相乘。
* Example: y = 2.25, 傷害 = 100, 則最終傷害為225。
* 裝備帶有克制性質的物品，就會獲得對應克制能力。
* 可使用於狀態、武器、盔甲、敵人、角色、職業、技能。
* 用於技能的場合，會直接提升該技能的克制威力。
* ※也可以反面使用，令攻擊特定特性的傷害下降。
*
* <DamageCut_Rate:x1, y1(, x2, y2...)>
* x值為抵抗的特性名稱，y值為抵抗的倍率（請使用小數，如0.5、0.825等）。
* 預設為倍率相乘。
* Example: y = 0.5, 傷害 = 100, 則最終傷害為50。
* 裝備帶有抵抗性質的物品，就會獲得對應抵抗能力。
* 可使用於狀態、武器、盔甲、敵人、角色、職業。
* ※也可以反面使用，令特定特性攻擊自身的傷害上升。
*
* @author 零焰（jack2396）
*/

///=============================================================================
// Pharameter
///=============================================================================
    var jackBT = jackBT || {};
    var increaseRule = PluginManager.parameters('battlerTraits')['克制規則'];
    var decreaseRule = PluginManager.parameters('battlerTraits')['抵抗規則'];
    var stackingTraits = PluginManager.parameters('battlerTraits')['特性疊層'].split(",");
//=============================================================================
// Reference Area
//=============================================================================

    const jackBT_onBattleStart = Game_Battler.prototype.onBattleStart;
    const jackBT_stateTraitAdd = Game_Battler.prototype.addState;
    const jackBT_stateTraitRemove = Game_Battler.prototype.removeState;
    const jackBT_damageCalc = Game_Action.prototype.executeDamage;

//=============================================================================
// Core Area
//=============================================================================

    Game_Battler.prototype.onBattleStart = function() {
        jackBT_onBattleStart.call(this);
        this.setBattleTrait();
        this.setDamageRate();
        this.setResistanceRate();
    };

    Game_Battler.prototype.addState = function(stateId) {
        jackBT_stateTraitAdd.call(this, stateId);
        this.updateStateTrait(stateId, "add");
        this.updateDamageRate(stateId, "add");
        this.updateResistanceRate(stateId, "add");
    };

    Game_Battler.prototype.removeState = function(stateId) {
        jackBT_stateTraitRemove.call(this, stateId);
        this.updateStateTrait(stateId, "remove");
        this.updateDamageRate(stateId, "remove");
        this.updateResistanceRate(stateId, "remove");
    };

//=============================================================================
// Trait Area
//=============================================================================

    Game_Actor.prototype.setBattleTrait = function() {
        this.battleTraits = [] || null;
        if ($dataActors[this._actorId].meta.Trait) {
            var totalTraits = $dataActors[this._actorId].meta.Trait.split(", ");
            for (var i = 0; i < totalTraits.length; i++) {
                if (!this.battleTraits.includes(totalTraits[i]) || stackingTraits.includes(totalTraits[i])) {
                    this.battleTraits.push(totalTraits[i]);
                }
            }
        }

        for (var i = 0; i < this.armors().length; i++) {
            armor = this.armors()[i];
            if (armor && armor.meta.Trait) {
                for (var i = 0; i < armor.meta.Trait.split(", ").length; i++) {
                    if (!this.battleTraits.includes(armor.meta.Trait[i]) || stackingTraits.includes(totalTraits[i])) {    
                        this.battleTraits.push(armor.meta.Trait.split(", ")[i]);
                    }
                }
            }
        }

        for (var i = 0; i < this.weapons().length; i++) {
            weapon = this.weapons()[i];
            if (weapon && weapon.meta.Trait) {
                for (var i = 0; i < weapon.meta.Trait.split(", ").length; i++) {
                    if (!this.battleTraits.includes(weapon.meta.Trait[i]) || stackingTraits.includes(totalTraits[i])) {    
                        this.battleTraits.push(weapon.meta.Trait.split(", ")[i]);
                    }
                }
            }
        }

        if ($dataClasses[this.currentClass().id].meta.Trait) {
            var totalTraits = $dataClasses[this.currentClass().id].meta.Trait.split(", ");
            for (var i = 0; i < totalTraits.length; i++) {
                if ( !this.battleTraits.includes(totalTraits[i]) || stackingTraits.includes(totalTraits[i])) {    
                    this.battleTraits.push(totalTraits[i]);
                }
            }
        }
    };

    Game_Enemy.prototype.setBattleTrait = function() {
        this.battleTraits = [] || null;
        if ($dataEnemies[this._enemyId].meta.Trait){
            var totalTraits = $dataEnemies[this._enemyId].meta.Trait.split(", ");
            for (var i = 0; i < totalTraits.length; i++) {
                if (!this.battleTraits.includes(totalTraits[i]) || stackingTraits.includes(totalTraits[i])) {
                    this.battleTraits.push(totalTraits[i]);
                }
            }
        }
    };

    Game_Battler.prototype.updateStateTrait = function(stateId, result) {
        this.battleTraits = this.battleTraits || null;
        if ($dataStates[stateId].meta.Trait) {
            var removeList = [];
            var trait = $dataStates[stateId].meta.Trait.split(", ");
            if (result === "remove" && trait){
                for (var k = 0; k < this.battleTraits.length; k++) {
                    for (var i = 0; i < trait.length; i++) {
                        if (this.battleTraits[k] === trait[i]) {
                            this.battleTraits.splice(k, 1);
                            k = 0;
                        }
                    }
                }
            } else if (result === "add" && trait) {
                if (!this.battleTraits.includes(trait) || stackingTraits.includes(trait)) {
                    for (k = 0; k < trait.length; k++) {
                        this.battleTraits.push($dataStates[stateId].meta.Trait.split(", ")[k]);
                    }
                }
            }
        }
    };

//=============================================================================
// Damage Rate Area
//=============================================================================

    Game_Actor.prototype.setDamageRate = function() {
        this.damageRate = [] || null;
        if ($dataActors[this._actorId].meta.DamageUp_Rate) {
            var MatchData = $dataActors[this._actorId].meta.DamageUp_Rate.split(", ");
            for ( var i = 1; i < (MatchData.length / 2) + 1; i++ ) {
                this.damageRate[i-1] = [MatchData[ 2 * i - 2], MatchData[1 + 2 * (i - 1)]];
            }

            for (var i = 0; i < this.armors().length; i++) {
                armor = this.armors()[i];
                if (armor && armor.meta.DamageUp_Rate) {
                    var MatchData = armor.meta.DamageUp_Rate.split(", ");
                    for ( var i = 1; i < (MatchData.length / 2) + 1; i++ ) {
                        this.damageRate[i-1] = [MatchData[ 2 * i - 2], MatchData[1 + 2 * (i - 1)]];
                    }
                }
            }

            for (var i = 0; i < this.weapons().length; i++) {
                weapon = this.weapons()[i];
                if (weapon && weapon.meta.DamageUp_Rate) {
                    var MatchData = weapon.meta.DamageUp_Rate.split(", ");
                    for ( var i = 1; i < (MatchData.length / 2) + 1; i++ ) {
                        this.damageRate[i-1] = [MatchData[ 2 * i - 2], MatchData[1 + 2 * (i - 1)]];
                    }
                }
            }

            if ($dataClasses[this.currentClass().id].meta.DamageUp_Rate) {
                var totalIncrease = $dataClasses[this.currentClass.id].meta.DamageUp_Rate.split(", ");
                for ( var i = 1; i < (totalIncrease.length / 2) + 1; i++ ) {
                    this.damageRate[i-1] = [MatchData[ 2 * i - 2], MatchData[1 + 2 * (i - 1)]];
                }
            }
        }
    };

    Game_Enemy.prototype.setDamageRate = function() {
        this.damageRate = [] || null;
        if ($dataEnemies[this._enemyId].meta.DamageUp_Rate) {
            var MatchData = $dataEnemies[this._enemyId].meta.DamageUp_Rate.split(", ");
            for ( var i = 1; i < (MatchData.length / 2 ) + 1; i++ ) {
                this.damageRate[i-1] = [ MatchData[ 2 * i - 2], MatchData[1 + 2 * (i - 1)] ];
            }
        }
    };

    Game_Battler.prototype.updateDamageRate = function(stateId, result) {
        this.damageRate = this.damageRate || null;
        if (result === "remove" && $dataStates[stateId].meta.DamageUp_Rate) {
            var MatchData = $dataStates[stateId].meta.DamageUp_Rate.split(", ");
            for (var k = 0; k < this.damageRate.length; k += 2) {
                for (var i = 0; i < MatchData.length; i++) {
                    if (this.damageRate[k] && this.damageRate[k][0] === MatchData[i]) {
                        this.damageRate.splice(k, 2);
                        k = 0;
                    }
                }
            }
        } else if (result === "add" && $dataStates[stateId].meta.DamageUp_Rate){
            var MatchData = $dataStates[stateId].meta.DamageUp_Rate.split(", ");
            for ( var i = 1; i < (MatchData.length / 2) + 1; i++ ) {
                this.damageRate.push([ MatchData[ 2 * i - 2], MatchData[1 + 2 * (i - 1)] ]);
            }
        }
    };

    function damageRateClac(action, target) {
        var damageRate = 1;
        var userDamageUpList = action.subject().damageRate;
        if (userDamageUpList.length) {
            for (var k = 0; k < userDamageUpList.length; k++) {
                    for (var i = 0; i < target.battleTraits.length; i++) {
                    var traitDetect = target.battleTraits;
                    if (userDamageUpList[k][0] == traitDetect[i]) {
                        damageRate *= Number(userDamageUpList[k][1]);
                        if (increaseRule == "相乘") {
                            damageRate *= userDamageUpList[k][1];
                        } else if (increaseRule == "相加") {
                            damageRate += userDamageUpList[k][1];
                        }
                    }
                }
            }
        }
        if (action._item.itemId() && action.isSkill()) {
            var skillRate = $dataSkills[action._item.itemId()].meta.DamageUp_Rate || 0;
            action.damageRate = [] || 0;
            if (skillRate) {
                var MatchData = skillRate.split(", ");
                for ( var i = 1; i < (MatchData.length / 2) + 1; i++ ) {
                    action.damageRate.push([ MatchData[ 2 * i - 2], MatchData[1 + 2 * i - 2] ]);
                }
                for (var k = 0; k < action.damageRate.length; k++) {
                    for (var x = 0; x < target.battleTraits.length; x++) {
                        if (action.damageRate[k][0] == target.battleTraits[x]) {
                            if (increaseRule == "相乘") {
                                damageRate *= Number(action.damageRate[k][1]);
                            } else if (increaseRule == "相加") {
                                damageRate += Number(action.damageRate[k][1]);
                            }
                        }
                    }
                }
            }
        }
        return damageRate;
    };



//=============================================================================
// Damage Decrease Area
//=============================================================================

    Game_Actor.prototype.setResistanceRate = function() {
        this.resistanceRate = [] || null;
        if ($dataActors[this._actorId].meta.DamageCut_Rate) {
            var MatchData = $dataActors[this._actorId].meta.DamageCut_Rate.split(", ");
            for ( var i = 1; i < (MatchData.length / 2) + 1; i++ ) {
                this.resistanceRate[i-1] = [MatchData[ 2 * i - 2], MatchData[1 + 2 * (i - 1)]];
            }

            for (var i = 0; i < this.armors().length; i++) {
                armor = this.armors()[i];
                if (armor && armor.meta.DamageCut_Rate) {
                    var MatchData = armor.meta.DamageCut_Rate.split(", ");
                    for ( var i = 1; i < (MatchData.length / 2) + 1; i++ ) {
                        this.resistanceRate[i-1] = [MatchData[ 2 * i - 2], MatchData[1 + 2 * (i - 1)]];
                    }
                }
            }

            for (var i = 0; i < this.weapons().length; i++) {
                weapon = this.weapons()[i];
                if (weapon && weapon.meta.DamageCut_Rate) {
                    var MatchData = weapon.meta.DamageCut_Rate.split(", ");
                    for ( var i = 1; i < (MatchData.length / 2) + 1; i++ ) {
                        this.resistanceRate[i-1] = [MatchData[ 2 * i - 2], MatchData[1 + 2 * (i - 1)]];
                    }
                }
            }

            if ($dataClasses[this.currentClass().id].meta.DamageCut_Rate) {
                var totalIncrease = $dataClasses[this.currentClass.id].meta.DamageCut_Rate.split(", ");
                for ( var i = 1; i < (MatchData.length / 2) + 1; i++ ) {
                    this.resistanceRate.push([MatchData[ 2 * i - 2], MatchData[1 + 2 * (i - 1)]]);
                }
            }
        }
    };

    Game_Enemy.prototype.setResistanceRate = function() {
        this.resistanceRate = [] || null;
        if ($dataEnemies[this._enemyId].meta.DamageCut_Rate) {
            var MatchData = $dataEnemies[this._enemyId].meta.DamageCut_Rate.split(", ");
            for ( var i = 1; i < (MatchData.length / 2) + 1; i++ ) {
                this.resistanceRate[i-1] = [ MatchData[ 2 * i - 2], MatchData[1 + 2 * (i - 1)] ];
            }
        }
    };

    Game_Battler.prototype.updateResistanceRate = function(stateId, result) {
        this.resistanceRate = this.resistanceRate || null;
        if (result === "remove" && $dataStates[stateId].meta.DamageCut_Rate){
            var MatchData = $dataStates[stateId].meta.DamageCut_Rate.split(", ");
            for (var k = 0; k < this.resistanceRate.length; k += 2) {
                for (var i = 0; i < MatchData.length; i++) {
                    if (this.resistanceRate[k] && this.resistanceRate[k][0] === MatchData[i]) {
                        this.resistanceRate.splice(k, 2);
                        k = 0;
                    }
                }
            }
        } else if (result === "add" && $dataStates[stateId].meta.DamageCut_Rate){
            var MatchData = $dataStates[stateId].meta.DamageCut_Rate.split(", ");
            for ( var i = 1; i < (MatchData.length / 2) + 1; i++ ) {
                this.resistanceRate.push([MatchData[ 2 * i - 2 ], MatchData[ 2 * i - 1 ] ]);
                
            }
        }
    };

    function resistanceRateClac(action, target) {
        var resistanceRate = 1;
        var userDamageCutList = target.resistanceRate;
        if (userDamageCutList) {
            if (action._subjectActorId) {
                for (var k = 0; k < userDamageCutList.length; k++) {
                    for (var i = 0; i < $dataActors[action._subjectActorId].meta.Trait.split(", ").length; i++) {
                        var traitDetect = $dataActors[action._subjectActorId].meta.Trait.split(", ");
                        if (userDamageCutList[k][0] == (traitDetect[i])) {
                            if (decreaseRule == "相乘") {
                                resistanceRate *= userDamageCutList[k][1];
                            } else if (decreaseRule == "相加") {
                                resistanceRate += userDamageCutList[k][1];
                            }
                        }
                    }
                }
            } else if (action._subjectEnemyIndex != -1) {
                for (var k = 0; k < userDamageCutList.length; k++) {
                    var userEnemyId = $gameTroop._enemies[action._subjectEnemyIndex]._enemyId;
                    if ($dataEnemies[userEnemyId].meta.Trait) {
                            for (var i = 0; i < $dataEnemies[userEnemyId].meta.Trait.split(", ").length; i++) {
                            var traitDetect = $dataEnemies[userEnemyId].meta.Trait.split(", ");
                            if (userDamageCutList[k][0] == (traitDetect[i])) {
                                if (decreaseRule == "相乘") {
                                    resistanceRate *= userDamageCutList[k][1];
                                } else if (decreaseRule == "相加") {
                                    resistanceRate += userDamageCutList[k][1];
                                }
                            }
                        }
                    }
                }
            }
        }
        return resistanceRate;
    };

//=============================================================================
// Total Area
//=============================================================================

    Game_Action.prototype.executeDamage = function(target, value) {
        var rate = damageRateClac(this, target);
        value *= rate;
        var rate = resistanceRateClac(this, target);
        value *= rate;
        jackBT_damageCalc.call(this, target, value);
    };
