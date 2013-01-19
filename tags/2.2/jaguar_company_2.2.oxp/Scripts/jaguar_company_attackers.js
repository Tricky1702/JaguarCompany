/*jslint indent: 4, maxlen: 120, maxerr: 50, white: true, es5: true, undef: true, regexp: true, newcap: true */
/*jshint es5: true, undef: true, eqnull: true, noempty: true, eqeqeq: true, boss: true, loopfunc: true, laxbreak: true,
strict: true, curly: true */
/*global system, log, worldScripts, missionVariables, Timer, clock, player, expandDescription */

/* Jaguar Company Attackers
 *
 * Copyright © 2012 Richard Thomas Harrison (Tricky)
 *
 * This work is licensed under the Creative Commons
 * Attribution-Noncommercial-Share Alike 3.0 Unported License.
 *
 * To view a copy of this license, visit
 * http://creativecommons.org/licenses/by-nc-sa/3.0/ or send a letter
 * to Creative Commons, 171 Second Street, Suite 300, San Francisco,
 * California, 94105, USA.
 *
 * World script to setup Jaguar Company attackers.
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "Jaguar Company Attackers";
    this.author = "Tricky";
    this.copyright = "© 2012 Richard Thomas Harrison (Tricky)";
    this.license = "CC BY-NC-SA 3.0";
    this.description = "Script to initialise the Jaguar Company attackers.";
    this.version = "1.2";

    /* Private variable. */
    var p_attackers = {};

    /* World event handlers. */

    /* Just show on the debug console to confirm it has loaded. */
    this.startUp = function () {
        /* No longer needed after setting up. */
        delete this.startUp;

        log(this.name + " " + this.version + " loaded.");
    };

    /* We only need to do this once.
     * This will get redefined after a new game or loading of a new Commander.
     */
    this.shipWillLaunchFromStation = function () {
        /* No longer needed after setting up. */
        delete this.shipWillLaunchFromStation;

        /* Setup the private attackers variable. */
        this.$setUp();
    };

    /* Reset everything just before exiting Witchspace. */
    this.shipWillExitWitchspace = function () {
        /* Setup the private attackers variable. */
        this.$setUp();
    };

    /* Remove the attacker mark and reputation mark if the player jumps galaxies. */
    this.playerEnteredNewGalaxy = function () {
        delete missionVariables.jaguar_company_attacker;
        delete missionVariables.jaguar_company_reputation;
    };

    /* Player fired a laser at someone and hit.
     * Check if they are a known hostile of Jaguar Company.
     *
     * INPUT
     *   victim - entity of the ship the player is attacking.
     */
    this.shipAttackedOther = function (victim) {
        var jaguarCompany,
        attackerIndex,
        observer;

        if (!this.$isHostile(victim)) {
            /* Ignore victims that are not hostile to Jaguar Company. */
            return;
        }

        /* Search for any members of Jaguar Company within maximum scanner range of the player ship. */
        jaguarCompany = system.filteredEntities(this, function (entity) {
                return (this.$friendRoles.indexOf(entity.entityPersonality) > -1);
            }, player.ship, player.ship.scannerRange);

        if (!jaguarCompany.length) {
            /* Nobody around. */
            return;
        }

        /* Find the index of the victim. */
        attackerIndex = p_attackers.attackersIndex.indexOf(victim.entityPersonality);
        /* Re-filter to find out if any of Jaguar Company found so far
         * are victims of the ship the player is attacking.
         */
        jaguarCompany = jaguarCompany.filter(function (ship) {
            return (p_attackers.attackers[attackerIndex].victimsIndex.indexOf(ship.entityPersonality) > -1);
        });

        if (!jaguarCompany.length || Math.random() < 0.9) {
            /* Nobody around or Jaguar Company is too busy to see you helping. */
            return;
        }

        /* Increase the reputation of the player with Jaguar Company. */
        missionVariables.jaguar_company_reputation += 1;
        /* Pick a random member of Jaguar Company as the observer. */
        observer = jaguarCompany[Math.floor(Math.random() * jaguarCompany.length)];
        /* Send a thank you message to the player. */
        observer.commsMessage(expandDescription("[jaguar_company_player_help]"), player.ship);

        if (missionVariables.jaguar_company_reputation === p_attackers.mainScript.$reputationHelper) {
            observer.commsMessage(expandDescription("[jaguar_company_player_help_buoy]"), player.ship);
        } else if (missionVariables.jaguar_company_reputation === p_attackers.mainScript.$reputationBlackbox) {
            observer.commsMessage(expandDescription("[jaguar_company_player_help_blackbox]"), player.ship);
        }
    };

    /* Player killed something.
     * Check if they are a known hostile of Jaguar Company.
     *
     * INPUT
     *   victim - entity of the ship the player killed.
     */
    this.shipKilledOther = function (victim) {
        var jaguarCompany,
        attackerIndex,
        observer,
        message;

        if (!this.$isHostile(victim)) {
            /* Ignore victims that are not hostile to Jaguar Company. */
            return;
        }

        /* Search for any members of Jaguar Company within maximum scanner range of the player ship. */
        jaguarCompany = system.filteredEntities(this, function (entity) {
                return (this.$friendRoles.indexOf(entity.entityPersonality) > -1);
            }, player.ship, player.ship.scannerRange);

        if (!jaguarCompany.length) {
            /* Nobody around. */
            return;
        }

        /* Find the index of the victim. */
        attackerIndex = p_attackers.attackersIndex.indexOf(victim.entityPersonality);
        /* Re-filter to find out if any of Jaguar Company found so far are victims of the ship the player has killed. */
        jaguarCompany = jaguarCompany.filter(function (ship) {
            return (p_attackers.attackers[attackerIndex].victimsIndex.indexOf(ship.entityPersonality) > -1);
        });

        if (!jaguarCompany.length) {
            /* Nobody around. */
            return;
        }

        /* Increase the reputation of the player with Jaguar Company. */
        missionVariables.jaguar_company_reputation += 10;
        message = "[jaguar_company_player_help]";

        if (missionVariables.jaguar_company_reputation >= p_attackers.mainScript.$reputationHelper &&
            missionVariables.jaguar_company_reputation < p_attackers.mainScript.$reputationHelper + 10) {
            message += " [jaguar_company_player_help_buoy]";
        } else if (missionVariables.jaguar_company_reputation >= p_attackers.mainScript.$reputationBlackbox &&
            missionVariables.jaguar_company_reputation < p_attackers.mainScript.$reputationBlackbox + 10 &&
            player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX") !== "EQUIPMENT_OK") {
            message += " [jaguar_company_player_help_blackbox]";
        }

        /* Pick a random member of Jaguar Company as the observer. */
        observer = jaguarCompany[Math.floor(Math.random() * jaguarCompany.length)];
        /* Send a thank you message to the player. */
        observer.commsMessage(expandDescription(message), player.ship);
    };

    /* Other global public functions. */

    /* Setup the private attackers variable and clear the public friend roles array. */
    this.$setUp = function () {
        /* Initialise the p_attackers variable object.
         * Encapsulates all private global data.
         */
        p_attackers = {
            /* Cache the main world script. */
            mainScript : worldScripts["Jaguar Company"],
            /* Local copies of the logging variables. */
            logging : worldScripts["Jaguar Company"].$logging,
            logExtra : worldScripts["Jaguar Company"].$logExtra,
            /* Initialise the attackers and index array. */
            attackersIndex : [],
            attackers : [],
            /* 95% probability of a message being transmitted. */
            messageProbability : 0.95
        };
        this.$friendRoles = [];
    };

    /* Add the primary role of a ship to the friend roles array.
     *
     * INPUT
     *   friend - entity of the friend.
     */
    this.$addFriendly = function (friend) {
        if (this.$friendRoles.indexOf(friend.entityPersonality) !== -1) {
            /* Already setup. */
            return;
        }

        this.$friendRoles.push(friend.entityPersonality);

        /* Save the original ship event hooks. */
        friend.script.$attackers_shipAttackedWithMissile = friend.script.shipAttackedWithMissile;
        friend.script.$attackers_shipBeingAttacked = friend.script.shipBeingAttacked;
        friend.script.$attackers_shipDied = friend.script.shipDied;
        friend.script.$attackers_shipTargetDestroyed = friend.script.shipTargetDestroyed;

        /* New ship event hooks. */

        /* A ship is being attacked with a missile. */
        friend.script.shipAttackedWithMissile = function (missile, attacker) {
            worldScripts["Jaguar Company Attackers"].$shipIsBeingAttackedWithMissile(this.ship, attacker);

            if (this.$attackers_shipAttackedWithMissile) {
                /* Call the original. */
                this.$attackers_shipAttackedWithMissile.apply(this, arguments);
            }
        };

        /* A ship is being attacked. */
        friend.script.shipBeingAttacked = function (attacker) {
            worldScripts["Jaguar Company Attackers"].$shipIsBeingAttacked(this.ship, attacker);

            if (this.$attackers_shipBeingAttacked) {
                /* Call the original. */
                this.$attackers_shipBeingAttacked.apply(this, arguments);
            }
        };

        /* A ship has died. */
        friend.script.shipDied = function (attacker, why) {
            worldScripts["Jaguar Company Attackers"].$shipDied(this.ship, attacker, why);

            if (this.$attackers_shipDied) {
                /* Call the original. */
                this.$attackers_shipDied.apply(this, arguments);
            }
        };

        /* We killed someone. */
        friend.script.shipTargetDestroyed = function (target) {
            worldScripts["Jaguar Company Attackers"].$shipTargetDestroyed(this.ship, target);

            if (this.$attackers_shipTargetDestroyed) {
                /* Call the original. */
                this.$attackers_shipTargetDestroyed.apply(this, arguments);
            }
        };

        /* AI functions. */

        /* Checks the current target to make sure it is still valid. */
        friend.script.$checkTargetIsValid = function () {
            worldScripts["Jaguar Company Attackers"].$checkTargetIsValid(this.ship);
        };

        /* This does something similar to a mix between the deployEscorts and groupAttackTarget AI commands. */
        friend.script.$performJaguarCompanyAttackTarget = function () {
            worldScripts["Jaguar Company Attackers"].$performAttackTarget(this.ship);
        };

        /* Check for any previous attackers that have run away. */
        friend.script.$scanForAttackers = function () {
            worldScripts["Jaguar Company Attackers"].$scanForAttackers(this.ship);
        };

        /* Scan for cascade weapons. Won't be needed when v1.78 comes out. */
        friend.script.$scanForCascadeWeapon = function () {
            worldScripts["Jaguar Company Attackers"].$scanForCascadeWeapon(this.ship);
        };
    };

    /* Add an attacker to the attackers array.
     *
     * INPUT
     *   attacker - entity of the attacker.
     *
     * RESULT
     *   return the index of the attacker.
     */
    this.$addAttacker = function (attacker) {
        var attackerKey = attacker.entityPersonality,
        attackerIndex = p_attackers.attackersIndex.indexOf(attackerKey);

        if (attackerIndex !== -1) {
            /* Already added to the attackers array. */
            return attackerIndex;
        }

        if (!this.$attackersCleanupTimerReference || !this.$attackersCleanupTimerReference.isRunning) {
            /* Start the attack cleanup timer. */
            if (!this.$attackersCleanupTimerReference) {
                /* New timer. */
                this.$attackersCleanupTimerReference = new Timer(this, this.$attackersCleanupTimer, 5, 30);
            } else {
                /* Restart current timer. */
                this.$attackersCleanupTimerReference.start();
            }

            if (p_attackers.logging && p_attackers.logExtra) {
                log(this.name, "$addAttacker::Started the attack cleanup timer.");
            }
        }

        if (p_attackers.logging && p_attackers.logExtra) {
            log(this.name, "$addAttacker::Adding attacker#" + attackerKey +
                " (" + attacker.displayName + ")");
        }

        /* Create an entry for the attacker if it doesn't exist.
         * push() returns the new length. The attacker index will be 1 less than this.
         */
        attackerIndex = p_attackers.attackers.push({
                entityPersonality : attackerKey,
                ship : attacker,
                hostile : false,
                victimsIndex : [],
                victims : []
            }) - 1;
        /* Create the index entry for the attacker. */
        p_attackers.attackersIndex[attackerIndex] = attackerKey;

        /* Return the index of the attacker. */
        return attackerIndex;
    };

    /* Add a victim to the victims array of the attacker.
     *
     * INPUT
     *   victim - entity of the victim.
     *   attacker - entity of the attacker.
     */
    this.$addVictimToAttacker = function (victim, attacker) {
        var victimKey = victim.entityPersonality,
        attackerIndex,
        victimIndex;

        /* Add the attacker (if needed) and get the attacker index. */
        attackerIndex = this.$addAttacker(attacker);
        /* Get the current victim index. */
        victimIndex = p_attackers.attackers[attackerIndex].victimsIndex.indexOf(victimKey);

        if (victimIndex !== -1) {
            /* Already added to the victims array. */
            return;
        }

        if (p_attackers.logging && p_attackers.logExtra) {
            log(this.name, "$addVictimToAttacker::Adding victim#" + victimKey +
                " (" + victim.displayName + ")" +
                " attacked by attacker#" + attacker.entityPersonality + " (" + attacker.displayName + ")");
        }

        /* Create an entry for the victim if it doesn't exist.
         * push() returns the new length. The victim index will be 1 less than this.
         */
        victimIndex = p_attackers.attackers[attackerIndex].victims.push({
                entityPersonality : victimKey,
                ship : victim,
                attackCounter : 0,
                attackTime : clock.seconds
            }) - 1;
        /* Create the index entry for the victim. */
        p_attackers.attackers[attackerIndex].victimsIndex[victimIndex] = victimKey;
    };

    /* Remove an attacker from the attackers array.
     *
     * INPUT
     *   attackerKey - unique key (entityPersonality) of the attacker.
     */
    this.$removeAttacker = function (attackerKey) {
        var attackerIndex;

        if (!p_attackers.attackersIndex.length || p_attackers.attackersIndex.indexOf(attackerKey) === -1) {
            /* No such attacker. */
            return;
        }

        /* Get the current attacker index. */
        attackerIndex = p_attackers.attackersIndex.indexOf(attackerKey);
        /* Remove the attacker from the attackers array. */
        p_attackers.attackers.splice(attackerIndex, 1);
        /* Remove the attacker from the index array. */
        p_attackers.attackersIndex.splice(attackerIndex, 1);
    };

    /* Remove a victim from the victims array of the attacker.
     *
     * INPUT
     *   victimKey - unique key (entityPersonality) of the victim.
     *   attackerKey - unique key (entityPersonality) of the attacker.
     */
    this.$removeVictimFromAttacker = function (victimKey, attackerKey) {
        var attackerIndex,
        victimIndex;

        if (!p_attackers.attackersIndex.length || p_attackers.attackersIndex.indexOf(attackerKey) === -1) {
            /* No such attacker. */
            return;
        }

        /* Get the current attacker index. */
        attackerIndex = p_attackers.attackersIndex.indexOf(attackerKey);

        if (!p_attackers.attackers[attackerIndex].victimsIndex.length ||
            p_attackers.attackers[attackerIndex].victimsIndex.indexOf(victimKey) === -1) {
            /* No such victim. */
            return;
        }

        /* Get the current victim index. */
        victimIndex = p_attackers.attackers[attackerIndex].victimsIndex.indexOf(victimKey);
        /* Remove the victim from the victims array. */
        p_attackers.attackers[attackerIndex].victims.splice(victimIndex, 1);
        /* Remove the victim from the index array. */
        p_attackers.attackers[attackerIndex].victimsIndex.splice(victimIndex, 1);
    };

    /* Periodic timer to clean up the attackers array.
     *
     * Called every 30 seconds.
     */
    this.$attackersCleanupTimer = function () {
        var attackers,
        attackerIndex,
        attackerKey,
        attackersCounter,
        attackersLength,
        attacker,
        victimKey,
        victimsCounter,
        victimsLength,
        victim,
        logMsg;

        if (!p_attackers.attackers.length) {
            /* No attackers, stop and remove this timer. */
            if (this.$attackersCleanupTimerReference) {
                if (this.$attackersCleanupTimerReference.isRunning) {
                    this.$attackersCleanupTimerReference.stop();
                }

                delete this.$attackersCleanupTimerReference;

                if (p_attackers.logging && p_attackers.logExtra) {
                    log(this.name, "$attackersCleanupTimer::Start - Removed the attack cleanup timer.");
                }
            }

            /* Reset the attackers and index array. Pointless, but done for potential error avoidance. */
            p_attackers.attackersIndex = [];
            p_attackers.attackers = [];

            return;
        }

        /* Cache the length. */
        attackersLength = p_attackers.attackers.length;
        /* Empty array to copy the attackers into. */
        attackers = [];

        /* Create a copy of the attackers array. The index should follow the original */
        for (attackersCounter = 0; attackersCounter < attackersLength; attackersCounter += 1) {
            /* Iterate over each attacker. */
            attacker = p_attackers.attackers[attackersCounter];

            /* No need to copy the victimsIndex property as we don't use it in the cleanup. */
            attackers.push({
                entityPersonality : attacker.entityPersonality,
                ship : attacker.ship,
                hostile : attacker.hostile,
                /* Empty array to copy the victims into. */
                victims : []
            });

            /* Cache the length. */
            victimsLength = attacker.victims.length;

            /* Create a copy of the victims array for the attacker. The index should follow the original. */
            for (victimsCounter = 0; victimsCounter < victimsLength; victimsCounter += 1) {
                /* Iterate over each victim. */
                victim = attacker.victims[victimsCounter];
                /* No need to copy the attackCounter property as we don't use it in the cleanup. */
                attackers[attackersCounter].victims.push({
                    entityPersonality : victim.entityPersonality,
                    ship : victim.ship,
                    attackTime : victim.attackTime
                });
            }
        }

        if (p_attackers.logging && p_attackers.logExtra) {
            logMsg = "$attackersCleanupTimer::Checking attackers...";
        }

        /* attackersLength already set-up. */
        for (attackersCounter = 0; attackersCounter < attackersLength; attackersCounter += 1) {
            /* Iterate over each attacker. */
            attacker = attackers[attackersCounter];
            attackerKey = attacker.entityPersonality;

            if (p_attackers.logging && p_attackers.logExtra) {
                logMsg += "\n* attacker#" + attackerKey;

                if (attacker.ship.displayName !== undefined) {
                    logMsg += " (" + attacker.ship.displayName + ")";
                }
            }

            if (!attacker.ship.isValid) {
                if (p_attackers.logging && p_attackers.logExtra) {
                    logMsg += ", removing (dead/not valid)";
                }

                /* Remove the invalid attacker from the real attackers array. */
                this.$removeAttacker(attackerKey);
            } else if (attacker.ship.hasRole("tharglet") && attacker.ship.isCargo) {
                if (p_attackers.logging && p_attackers.logExtra) {
                    logMsg += ", removing (inactive tharglet)";
                }

                /* Remove the inactive tharglet from the real attackers array. */
                this.$removeAttacker(attackerKey);
            } else if (attackerKey === player.ship.entityPersonality &&
                missionVariables.jaguar_company_reputation >= p_attackers.mainScript.$reputationHelper) {
                if (p_attackers.logging && p_attackers.logExtra) {
                    logMsg += ", removing (player turned from the dark side)";
                }

                /* Remove the player from the real attackers array. */
                this.$removeAttacker(attackerKey);
            } else {
                /* Cache the length. */
                victimsLength = attacker.victims.length;

                if (p_attackers.logging && p_attackers.logExtra) {
                    logMsg += ", checking victims...";
                }

                for (victimsCounter = 0; victimsCounter < victimsLength; victimsCounter += 1) {
                    /* Iterate over each victim. */
                    victim = attacker.victims[victimsCounter];
                    victimKey = victim.entityPersonality;

                    if (p_attackers.logging && p_attackers.logExtra) {
                        logMsg += "\n** victim#" + victimKey;

                        if (victim.ship.displayName !== undefined) {
                            logMsg += " (" + victim.ship.displayName + ")";
                        }
                    }

                    if (!victim.ship.isValid) {
                        if (p_attackers.logging && p_attackers.logExtra) {
                            logMsg += ", removing (dead/not valid)";
                        }

                        /* Remove the invalid victim from the real victims array. */
                        this.$removeVictimFromAttacker(victimKey, attackerKey);
                    } else if (!attacker.hostile && clock.seconds - victim.attackTime > 5) {
                        if (p_attackers.logging && p_attackers.logExtra) {
                            logMsg += ", removing (no longer attacked)";
                        }

                        /* More than 5 seconds have passed since the first attack.
                         * Remove the old victim from the real victims array.
                         */
                        this.$removeVictimFromAttacker(victimKey, attackerKey);
                    }
                }

                /* Find the real index of the attacker. May have changed. */
                attackerIndex = p_attackers.attackersIndex.indexOf(attackerKey);

                if (attackerIndex !== -1 && !p_attackers.attackers[attackerIndex].victims.length) {
                    if (p_attackers.logging && p_attackers.logExtra) {
                        logMsg += "\n** attacker#" + attackerKey + " (" + attacker.ship.displayName + ")" +
                            ", removing (no victims)";
                    }

                    /* Has no victims so no longer an attacker.
                     * Remove the attacker from the real attackers array.
                     */
                    this.$removeAttacker(attackerKey);
                }

                if (p_attackers.logging && p_attackers.logExtra) {
                    logMsg += "\n" + "$attackersCleanupTimer::Finished checking victims.";
                }
            }
        }

        if (p_attackers.logging && p_attackers.logExtra) {
            logMsg += "\n" + "$attackersCleanupTimer::Finished checking attackers.";
        }

        if (!p_attackers.attackers.length) {
            /* No attackers, stop and remove this timer. */
            if (this.$attackersCleanupTimerReference) {
                if (this.$attackersCleanupTimerReference.isRunning) {
                    this.$attackersCleanupTimerReference.stop();
                }

                delete this.$attackersCleanupTimerReference;

                if (p_attackers.logging && p_attackers.logExtra) {
                    logMsg += "\n" + "$attackersCleanupTimer::End - Removed the attack cleanup timer.";
                }
            }

            /* Reset the attackers and index array. Pointless, but done for potential error avoidance. */
            p_attackers.attackersIndex = [];
            p_attackers.attackers = [];
        }

        if (p_attackers.logging && p_attackers.logExtra) {
            log(this.name, logMsg);
        }
    };

    /* Setup the ship in the attackers array. (Do nothing if already setup)
     *
     * INPUTS
     *   attacker - entity of the attacker.
     *   victim - entity of the attacked ship.
     */
    this.$setupAttacker = function (attacker, victim) {
        var attackerIndex;

        if (!attacker || !attacker.isValid || !victim || !victim.isValid) {
            /* Attacker and/or victim no longer valid. */
            return;
        }

        attackerIndex = p_attackers.attackersIndex.indexOf(attacker.entityPersonality);

        if (attackerIndex === -1) {
            /* Create an entry for the victim and attacker. */
            this.$addVictimToAttacker(victim, attacker);
        } else {
            /* Attacker known. */
            if (p_attackers.attackers[attackerIndex].victimsIndex.indexOf(victim.entityPersonality) === -1) {
                /* Create an entry for the victim. */
                this.$addVictimToAttacker(victim, attacker);
            }
        }
    };

    /* Makes the ship hostile.
     *
     * INPUT
     *   attacker - entity of the attacker.
     */
    this.$makeHostile = function (attacker) {
        var attackerIndex;

        if (this.$isHostile(attacker)) {
            /* Already hostile. */
            return;
        }

        if (p_attackers.logging && p_attackers.logExtra) {
            log(this.name, "$makeHostile::Make hostile: attacker#" + attacker.entityPersonality +
                " (" + attacker.displayName + ")");
        }

        /* Add the attacker (if needed) and get the attacker index. */
        attackerIndex = this.$addAttacker(attacker);
        /* Set the hostile property. */
        p_attackers.attackers[attackerIndex].hostile = true;
    };

    /* Increase the ship's attack counter for the victim.
     *
     * INPUTS
     *   attacker - entity of the attacker.
     *   victim - entity of the attacked ship.
     */
    this.$increaseAttackCounter = function (attacker, victim) {
        var attackerIndex,
        victimIndex;

        attackerIndex = p_attackers.attackersIndex.indexOf(attacker.entityPersonality);

        if (attackerIndex === -1) {
            /* Setup the attacker and victim. */
            this.$setupAttacker(attacker, victim);
            /* Find the index of the attacker. */
            attackerIndex = p_attackers.attackersIndex.indexOf(attacker.entityPersonality);
            /* Find the index of the victim. */
            victimIndex = p_attackers.attackers[attackerIndex].victimsIndex.indexOf(victim.entityPersonality);
        } else {
            /* Attacker known. */
            victimIndex = p_attackers.attackers[attackerIndex].victimsIndex.indexOf(victim.entityPersonality);

            if (victimIndex === -1) {
                /* Setup the attacker and victim. */
                this.$setupAttacker(attacker, victim);
                /* Find the index of the victim. */
                victimIndex = p_attackers.attackers[attackerIndex].victimsIndex.indexOf(victim.entityPersonality);
            }
        }

        /* Increase the attack counter for the victim. */
        p_attackers.attackers[attackerIndex].victims[victimIndex].attackCounter += 1;
    };

    /* Check if the ship is hostile.
     *
     * INPUT
     *   attacker - entity of the ship that attacked.
     *
     * RESULT
     *   return true if ship is hostile, otherwise return false.
     */
    this.$isHostile = function (attacker) {
        var attackerIndex;

        if (attacker.isThargoid) {
            /* Always true for Thargoids/tharglets. */
            return true;
        }

        if (!p_attackers.attackers.length) {
            /* No attackers. */
            return false;
        }

        /* Find the index of the attacker. */
        attackerIndex = p_attackers.attackersIndex.indexOf(attacker.entityPersonality);

        if (attackerIndex === -1) {
            /* No such attacker. */
            return false;
        }

        /* Return hostile status. */
        return p_attackers.attackers[attackerIndex].hostile;
    };

    /* Return the attack counter for the victim or 0 if not available.
     *
     * INPUTS
     *   attacker - entity of the attacker.
     *   victim - entity of the attacked ship.
     *
     * RESULT
     *   return attackCounter if available, otherwise return 0.
     */
    this.$attackCounter = function (attacker, victim) {
        var attackerIndex,
        victimIndex;

        if (!p_attackers.attackers.length) {
            /* No attackers. */
            return 0;
        }

        /* Find the index of the attacker. */
        attackerIndex = p_attackers.attackersIndex.indexOf(attacker.entityPersonality);

        if (attackerIndex === -1) {
            /* No such attacker. */
            return 0;
        }

        if (!p_attackers.attackers[attackerIndex].victims.length) {
            /* No victims. */
            return 0;
        }

        /* Find the index of the victim. */
        victimIndex = p_attackers.attackers[attackerIndex].victimsIndex.indexOf(victim.entityPersonality);

        if (victimIndex === -1) {
            /* No such victim. */
            return 0;
        }

        /* Return attack counter. */
        return p_attackers.attackers[attackerIndex].victims[victimIndex].attackCounter;
    };

    /* Reset the attack counter to 1.
     *
     * INPUTS
     *   attacker - entity of the attacker.
     *   victim - entity of the attacked ship.
     */
    this.$resetAttackCounter = function (attacker, victim) {
        var attackerIndex,
        victimIndex;

        if (!p_attackers.attackers.length) {
            /* No attackers. */
            return;
        }

        /* Find the index of the attacker. */
        attackerIndex = p_attackers.attackersIndex.indexOf(attacker.entityPersonality);

        if (attackerIndex === -1) {
            /* No such attacker. */
            return;
        }

        if (!p_attackers.attackers[attackerIndex].victims.length) {
            /* No victims. */
            return;
        }

        /* Find the index of the victim. */
        victimIndex = p_attackers.attackers[attackerIndex].victimsIndex.indexOf(victim.entityPersonality);

        if (victimIndex === -1) {
            /* No such victim. */
            return;
        }

        /* Reset the attack counter to 1. */
        p_attackers.attackers[attackerIndex].victims[victimIndex].attackCounter = 1;
    };

    /* Return the attack time for the victim or 'clock.seconds' if not available.
     *
     * INPUTS
     *   attacker - entity of the attacker.
     *   victim - entity of the attacked ship.
     *
     * RESULT
     *   return attackTime if available, otherwise return 'clock.seconds'.
     */
    this.$attackTime = function (attacker, victim) {
        var attackerIndex,
        victimIndex;

        if (!p_attackers.attackers.length) {
            /* No attackers. */
            return clock.seconds;
        }

        /* Find the index of the attacker. */
        attackerIndex = p_attackers.attackersIndex.indexOf(attacker.entityPersonality);

        if (attackerIndex === -1) {
            /* No such attacker. */
            return clock.seconds;
        }

        if (!p_attackers.attackers[attackerIndex].victims.length) {
            /* No victims. */
            return clock.seconds;
        }

        /* Find the index of the victim. */
        victimIndex = p_attackers.attackers[attackerIndex].victimsIndex.indexOf(victim.entityPersonality);

        if (victimIndex === -1) {
            /* No such victim. */
            return clock.seconds;
        }

        /* Return attack time. */
        return p_attackers.attackers[attackerIndex].victims[victimIndex].attackTime;
    };

    /* The AI will automatically send an INCOMING_MISSILE message to this ship.
     * Since we don't have to do anything fancy that would confuse the AI state system
     * we don't have to send a special message like the general attack system below.
     *
     * No such thing as "friendly fire" with a missile.
     *
     * Not to be confused with the world script event function 'shipAttackedWithMissile',
     * although it should be called from the ship script event function 'shipAttackedWithMissile'.
     *
     * INPUTS
     *   victim - caller ship.
     *   attacker - entity of the attacker.
     */
    this.$shipIsBeingAttackedWithMissile = function (victim, attacker) {
        if (!attacker || !attacker.isValid || victim.isDerelict) {
            /* No longer valid. */
            return;
        }

        /* Setup the attacker and victim. */
        this.$setupAttacker(attacker, victim);
        /* Increase the attack counter. */
        this.$increaseAttackCounter(attacker, victim);
        /* Make the attacker a hostile for future checking. */
        this.$makeHostile(attacker);

        if (attacker.isPlayer) {
            /* Remember the player, even if they jump system. */
            missionVariables.jaguar_company_attacker = true;
            /* Clear the reputation of the player. */
            delete missionVariables.jaguar_company_reputation;

            if (victim.isPiloted) {
                /* Player hostile message. */
                victim.commsMessage(expandDescription("[jaguar_company_player_hostile_fire]"), player.ship);
            }
        } else {
            if (victim.isPiloted) {
                /* Other ship hostile message. */
                victim.commsMessage(expandDescription("[jaguar_company_hostile_fire]"));
            }
        }
    };

    /* Remember who is attacking us. Pay particular attention to players.
     *
     * The AI will send an ATTACKED message to this ship.
     * Since we check for occurences of "friendly fire" we can not use or respond to that message,
     * so we send out a new message of HOSTILE_FIRE if it really is an attack.
     *
     * Not to be confused with the world script event function 'shipBeingAttacked',
     * although it should be called from the ship script event function 'shipBeingAttacked'.
     *
     * INPUTS
     *   victim - caller ship.
     *   attacker - entity of the attacker.
     */
    this.$shipIsBeingAttacked = function (victim, attacker) {
        var attackCounter;

        if (!attacker || !attacker.isValid || victim.isDerelict) {
            /* No longer valid. */
            return;
        }

        if (this.$friendRoles.indexOf(attacker.entityPersonality) > -1 || attacker.isPolice) {
            if (victim.isPiloted && Math.random() > p_attackers.messageProbability) {
                /* Broadcast a "friendly fire" message. */
                victim.commsMessage(expandDescription("[jaguar_company_friendly_fire]"));
            }

            /* Tell the attacker that we are a friend. */
            attacker.reactToAIMessage("FRIENDLY_FIRE");
            /* Reset bounty. May have hit police by mistake. */
            victim.bounty = 0;

            return;
        }

        /* Setup the attacker and victim. */
        this.$setupAttacker(attacker, victim);
        /* Increase the attack counter. */
        this.$increaseAttackCounter(attacker, victim);

        if (this.$isHostile(attacker)) {
            /* Already been marked as hostile. */
            if (victim.isPiloted && Math.random() > p_attackers.messageProbability) {
                /* Show hostile message. */
                if (attacker.isPlayer) {
                    /* Player hostile message. */
                    victim.commsMessage(expandDescription("[jaguar_company_player_hostile_fire]"), player.ship);
                } else {
                    /* Other ship hostile message. */
                    victim.commsMessage(expandDescription("[jaguar_company_hostile_fire]"));
                }
            }

            /* Send back a custom AI message. */
            victim.reactToAIMessage("HOSTILE_FIRE");

            return;
        }

        /* Thargoids/tharglets and pirates don't get warnings. */
        if (!attacker.isThargoid && !attacker.isPirate) {
            if (clock.seconds - this.$attackTime(attacker, victim) > 5) {
                /* More than 5 seconds since the last "friendly fire" hit. */
                this.$resetAttackCounter(attacker, victim);
            }

            attackCounter = this.$attackCounter(attacker, victim);

            if (attackCounter < 5) {
                /* We've only hit this ship less than 5 times. Assume "friendly fire". */
                if (victim.isPiloted && attackCounter === 1) {
                    /* Only show "friendly fire" message on the first hit. */
                    if (attacker.isPlayer) {
                        /* Decrease reputation. */
                        missionVariables.jaguar_company_reputation -= 1;
                        /* Player warning. */
                        victim.commsMessage(
                            expandDescription("[jaguar_company_player_friendly_fire]"), player.ship);
                    } else {
                        /* Other ship warning. */
                        victim.commsMessage(expandDescription("[jaguar_company_friendly_fire]"));
                    }
                }

                return;
            }
        }

        /* Everybody has had all the warnings they are going to get once we have reached this point.
         * This section is only executed once. Hostiles are caught above after this.
         */

        /* Make the attacker a hostile for future checking. */
        this.$makeHostile(attacker);

        if (attacker.isPlayer) {
            /* Remember the player, even if they jump system. */
            missionVariables.jaguar_company_attacker = true;
            /* Clear the reputation of the player. */
            delete missionVariables.jaguar_company_reputation;

            if (victim.isPiloted) {
                /* Player hostile message. */
                victim.commsMessage(expandDescription("[jaguar_company_player_hostile_fire]"), player.ship);
            }
        } else {
            if (victim.isPiloted) {
                /* Other ship hostile message. */
                victim.commsMessage(expandDescription("[jaguar_company_hostile_fire]"));
            }
        }

        /* Send back a custom AI message. */
        victim.reactToAIMessage("HOSTILE_FIRE");
    };

    /* A ship has died.
     *
     * Not to be confused with the world script event function 'shipDied',
     * although it should be called from the ship script event function 'shipDied'.
     *
     * INPUTS
     *   victim - entity that died.
     *   attacker - entity that caused the death.
     *   why - cause as a string.
     */
    this.$shipDied = function (victim, attacker, why) {
        var destroyedBy = attacker;

        if (attacker && attacker.isValid && !victim.isDerelict) {
            destroyedBy = "ship#" + attacker.entityPersonality + " (" + attacker.displayName + ")";

            if (why === "energy damage" || why === "cascade weapon") {
                /* Check for piloted ships that aren't hostile.
                 * Generally this will pick up death by a surprise/instant kill, i.e. cascade weapon.
                 */
                if (attacker.isPiloted && !this.$isHostile(attacker)) {
                    /* Make the attacker a hostile for future checking. */
                    this.$makeHostile(attacker);

                    if (attacker.isPlayer) {
                        /* Remember the player, even if they jump system. */
                        missionVariables.jaguar_company_attacker = true;
                        /* Clear the reputation of the player. */
                        delete missionVariables.jaguar_company_reputation;
                    }
                }
            }

            if (victim.isPiloted && Math.random() > p_attackers.messageProbability) {
                /* Death message. */
                victim.commsMessage(expandDescription("[jaguar_company_death]"));
            }
        }

        if (p_attackers.logging && p_attackers.logExtra) {
            log(this.name,
                "$shipDied::" +
                "ship#" + victim.entityPersonality + " (" + victim.displayName + ")" +
                " was destroyed by " + destroyedBy +
                ", reason: " + why);
        }
    };

    /* We killed someone.
     *
     * INPUTS
     *   whom - entity of the killer.
     *   target - entity of the destroyed target.
     */
    this.$shipTargetDestroyed = function (whom, target) {
        if (target.primaryRole === "constrictor" &&
            missionVariables.conhunt &&
            missionVariables.conhunt === "STAGE_1") {
            /* Just in case the ship kills the constrictor, let's not break the mission for the player... */
            missionVariables.conhunt = "CONSTRICTOR_DESTROYED";
            player.score += 1;
            player.credits += target.bounty;
            player.consoleMessage(whom.ship.displayName + " assisted in the death of " + target.name, 3);
            player.consoleMessage(
                whom.ship.displayName + ": Commander " + player.name +
                ", you have the kill and bounty of " + target.bounty + "₢.", 3);

            if (p_attackers.logging && p_attackers.logExtra) {
                log(this.name, "$shipTargetDestroyed::" + this.ship.displayName +
                    " killed - " + target.name + " : " + target.bounty);
            }
        }
    };

    /* AI functions. */

    /* Checks the current target to make sure it is still valid.
     *
     * INPUT
     *   callerShip - caller ship.
     *
     * Responds to the caller ship with a 'TARGET_LOST' AI message.
     */
    this.$checkTargetIsValid = function (callerShip) {
        if (!callerShip.target) {
            /* No target. */
            return;
        }

        if (!callerShip.target.isValid) {
            /* Target is no longer valid. */
            callerShip.reactToAIMessage("TARGET_LOST");
        }
    };

    /* This does something similar to a mix between the deployEscorts and groupAttackTarget AI commands.
     *
     * INPUT
     *   callerShip - caller ship.
     */
    this.$performAttackTarget = function (callerShip) {
        var target = callerShip.target,
        otherShips,
        idleShips = [],
        idleShip,
        length,
        counter;

        if (target === null) {
            /* Return immediately if we have no target. */
            return;
        }

        if (this.$friendRoles.indexOf(target.entityPersonality) > -1 || !this.$isHostile(target)) {
            /* Clear the target and return for one of the following 2 states...
             * 1. Target is a friend.
             * 2. Target is not a hostile.
             */
            callerShip.target = null;

            return;
        }

        /* Force attacker to hostile status. */
        this.$makeHostile(target);
        /* React to our own attack call. */
        callerShip.reactToAIMessage("JAGUAR_COMPANY_ATTACK_TARGET");

        /* Limit comms range to scanner range. */
        otherShips = system.filteredEntities(this, function (entity) {
                return (this.$friendRoles.indexOf(entity.entityPersonality) > -1);
            }, callerShip, callerShip.scannerRange);

        if (!otherShips.length) {
            /* Return immediately if we are on our own. */
            return;
        }

        /* Cache the length. */
        length = otherShips.length;

        for (counter = 0; counter < length; counter += 1) {
            if (!otherShips[counter].hasHostileTarget) {
                /* Other ship not in attack mode. Put it on the idle list. */
                idleShips.push(otherShips[counter]);
            }
        }

        if (!idleShips.length) {
            /* Return immediately if there are no idle ships. */
            return;
        }

        /* Get a random number of idle ships to deploy. */
        length = Math.ceil(Math.random() * idleShips.length);

        for (counter = 0; counter < length; counter += 1) {
            idleShip = idleShips[counter];

            /* The other ship is not currently in attack mode. Give it a target. */
            idleShip.target = target;
            idleShip.reactToAIMessage("JAGUAR_COMPANY_ATTACK_TARGET");
        }
    };

    /* Scan for current ships or players from the past that have attacked us.
     * Also scan for potential attackers.
     *
     * INPUT
     *   callerShip - caller ship.
     */
    this.$scanForAttackers = function (callerShip) {
        var target = null,
        counter,
        length,
        attackersWithinRange;

        function $identifyAttacker(entity) {
            if (!entity.isValid ||
                entity.isCloaked ||
                !entity.isPiloted ||
                entity.isDerelict) {
                /* Ignore all entities that have one of these conditions:
                 * 1) not valid
                 * 2) cloaked
                 * 3) has no pilot
                 * 4) is a derelict.
                 */
                return false;
            }

            if (this.$isHostile(entity)) {
                /* The entity is a previous hostile or a Thargoid/tharglet. */
                return true;
            }

            if (entity.isPlayer && missionVariables.jaguar_company_attacker) {
                /* Player has attacked us in the past. */
                return true;
            }

            if (entity.position.distanceTo(p_attackers.mainScript.$jaguarCompanyBase.position) < 30000) {
                /* All ships not identified as hostile so far are safe within 30km of the base. */
                return false;
            }

            if (entity.isPirate) {
                /* The entity is a pirate. */
                return true;
            }

            if (entity.bounty > 20 || Math.random() < ((entity.bounty - 10) / 40)) {
                /* Entity has a bounty greater than 20Cr.
                 * o Entities with a low bounty (minimum 11Cr) have a very small chance of being picked on.
                 *   o Bounty of 11Cr: 1 in 40 chance.
                 *   o Bounty of 20Cr: 1 in 4 chance.
                 */
                return true;
            }

            /* Everything else is ignored. */
            return false;
        }

        attackersWithinRange = system.filteredEntities(this, $identifyAttacker, callerShip, callerShip.scannerRange);

        if (!attackersWithinRange.length) {
            /* No attackers. */
            callerShip.reactToAIMessage("ATTACKERS_NOT_FOUND");
        } else {
            /* Cache the length. */
            length = attackersWithinRange.length;

            for (counter = 0; counter < length; counter += 1) {
                /* Force all attackers within range to hostile status. */
                this.$makeHostile(attackersWithinRange[counter]);
            }

            /* Set target to the closest attacker. */
            target = attackersWithinRange[0];

            if (callerShip.isPiloted && Math.random() > p_attackers.messageProbability) {
                /* Show hostile message. */
                if (target.isPlayer) {
                    /* Player hostile message. */
                    callerShip.commsMessage(expandDescription("[jaguar_company_player_hostile_fire]"), player.ship);
                } else {
                    /* Other ship hostile message. */
                    callerShip.commsMessage(expandDescription("[jaguar_company_hostile_fire]"));
                }
            }

            /* Set the target. */
            callerShip.target = target;
            callerShip.reactToAIMessage("ATTACKERS_FOUND");
        }
    };

    /* Scan for cascade weapons. Won't be needed when v1.78 comes out.
     * Reacts with a 'CASCADE_WEAPON_FOUND' AI message rather than 'CASCADE_WEAPON_DETECTED'
     * used by Oolite v1.77 and newer
     *
     * INPUT
     *   callerShip - caller ship.
     */
    this.$scanForCascadeWeapon = function (callerShip) {
        /* This is modified from some code in Random Hits spacebar ship script. */
        var cascadeWeaponRoles = [
            "EQ_QC_MINE",
            "EQ_CASCADE_MISSILE",
            "EQ_LAW_MISSILE",
            "EQ_OVERRIDE_MISSILE",
            "energy-bomb",
            "RANDOM_HITS_MINE"
        ],
        cascadeWeapons;

        /* Search for any cascade weapons within maximum scanner range of the caller ship. */
        cascadeWeapons = system.filteredEntities(this, function (entity) {
                return (cascadeWeaponRoles.indexOf(entity.primaryRole) > -1);
            }, callerShip, callerShip.scannerRange);

        if (cascadeWeapons.length > 0) {
            /* Found at least one. First one in the cascadeWeapons array is the closest.
             * Set the target and send a CASCADE_WEAPON_FOUND message to the AI.
             */
            callerShip.target = cascadeWeapons[0];
            callerShip.reactToAIMessage("CASCADE_WEAPON_FOUND");
        }
    };
}).call(this);
