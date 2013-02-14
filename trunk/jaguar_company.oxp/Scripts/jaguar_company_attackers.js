/*jslint indent: 4, maxlen: 120, maxerr: 50, white: true, es5: true, undef: true, regexp: true, newcap: true */
/*jshint es5: true, undef: true, eqnull: true, noempty: true, eqeqeq: true, boss: true, loopfunc: true, laxbreak: true,
strict: true, curly: true */
/*global system, log, worldScripts, missionVariables, Timer, clock, player, expandDescription */

/* Jaguar Company Attackers
 *
 * Copyright © 2012-2013 Richard Thomas Harrison (Tricky)
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
    this.copyright = "© 2012-2013 Richard Thomas Harrison (Tricky)";
    this.license = "CC BY-NC-SA 3.0";
    this.description = "Script to initialise the Jaguar Company attackers.";
    this.version = "1.5";

    /* Private variable. */
    var p_attackers = {};

    /* World script event handlers. */

    /* NAME
     *   startUp
     *
     * FUNCTION
     *   We only need to do this once.
     *   This will get redefined after a new game or loading of a new Commander.
     */
    this.startUp = function () {
        /* No longer needed after setting up. */
        delete this.startUp;

        log(this.name + " " + this.version + " loaded.");

        /* Setup the private attackers variable + some public variables. Delay it. */
        this.$setUpTimerReference = new Timer(this, this.$setUp, 0.5, 0.5);
    };

    /* NAME
     *   shipWillExitWitchspace
     *
     * FUNCTION
     *   Reset everything just before exiting Witchspace.
     */
    this.shipWillExitWitchspace = function () {
        /* Setup the private attackers variable + some public variables. */
        this.$setUp();
    };

    /* NAME
     *   shipAttackedOther
     *
     * FUNCTION
     *   Player fired a laser at someone and hit.
     *
     * INPUT
     *   victim - entity of the ship the player is attacking.
     */
    this.shipAttackedOther = function (victim) {
        var jaguarCompany,
        attackerIndex,
        observer,
        pilotName,
        reputation,
        helperLevel = p_attackers.mainScript.$reputationHelper,
        blackboxLevel = p_attackers.mainScript.$reputationBlackbox,
        locationsLevel = p_attackers.mainScript.$reputationLocations;

        if (!this.$isHostile(victim)) {
            /* Ignore victims that are not hostile to Jaguar Company. */
            return;
        }

        /* Search for any members of Jaguar Company within maximum scanner range of the player ship. */
        jaguarCompany = system.filteredEntities(this, function (entity) {
                /* Only interested in entities that aren't the victim. */
                return (victim.entityPersonality !== entity.entityPersonality &&
                    this.$friendList.indexOf(entity.entityPersonality) !== -1);
            }, player.ship, player.ship.scannerRange);

        /* Skip the next bit if the victim is a thargoid/tharglet. */
        if (!victim.isThargoid) {
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
                    return (p_attackers.attackers[attackerIndex].victimsIndex.indexOf(ship.entityPersonality) !== -1);
                });
        }

        if (!jaguarCompany.length || Math.random() < 0.9) {
            /* Nobody around or Jaguar Company is too busy to see you helping. */
            return;
        }

        /* Increase the reputation of the player with Jaguar Company. */
        reputation = missionVariables.jaguar_company_reputation += 1;
        /* Pick a random member of Jaguar Company as the observer. */
        observer = jaguarCompany[Math.floor(Math.random() * jaguarCompany.length)];

        if (observer.$pilotName) {
            /* Get the observer's name. */
            pilotName = observer.$pilotName;
        } else {
            /* Use displayName as the name of the observer. */
            pilotName = observer.displayName;
        }

        /* Send a thank you message to the player. */
        player.commsMessage(pilotName + ": " + expandDescription("[jaguar_company_player_help]"));

        if (reputation === helperLevel) {
            player.commsMessage(pilotName + ": " + expandDescription("[jaguar_company_player_help_buoy]"));
        } else if (reputation === blackboxLevel) {
            player.commsMessage(pilotName + ": " + expandDescription("[jaguar_company_player_help_blackbox]"));
        } else if (reputation === locationsLevel) {
            player.commsMessage(pilotName + ": " + expandDescription("[jaguar_company_player_help_locations]"));
        }
    };

    /* NAME
     *   shipKilledOther
     *
     * FUNCTION
     *   Player killed something.
     *
     * INPUT
     *   victim - entity of the ship the player killed
     */
    this.shipKilledOther = function (victim) {
        var jaguarCompany,
        attackerIndex,
        observer,
        pilotName,
        newsSource,
        reputation,
        helperLevel = p_attackers.mainScript.$reputationHelper,
        blackboxLevel = p_attackers.mainScript.$reputationBlackbox,
        locationsLevel = p_attackers.mainScript.$reputationLocations;

        if (!this.$isHostile(victim)) {
            /* Ignore victims that are not hostile to Jaguar Company. */
            return;
        }

        /* Search for any members of Jaguar Company within maximum scanner range of the player ship. */
        jaguarCompany = system.filteredEntities(this, function (entity) {
                /* Only interested in entities that aren't the victim. */
                return (victim.entityPersonality !== entity.entityPersonality &&
                    this.$friendList.indexOf(entity.entityPersonality) !== -1);
            }, player.ship, player.ship.scannerRange);

        /* Skip the next bit if the victim is a thargoid/tharglet. */
        if (!victim.isThargoid) {
            if (!jaguarCompany.length) {
                /* Nobody around. */
                return;
            }

            /* Find the index of the victim. */
            attackerIndex = p_attackers.attackersIndex.indexOf(victim.entityPersonality);
            /* Re-filter to find out if any of Jaguar Company found so far
             * are victims of the ship the player has killed.
             */
            jaguarCompany = jaguarCompany.filter(function (ship) {
                    return (p_attackers.attackers[attackerIndex].victimsIndex.indexOf(ship.entityPersonality) !== -1);
                });
        }

        if (!jaguarCompany.length) {
            /* Nobody around. */
            return;
        }

        /* Increase the reputation of the player with Jaguar Company. */
        reputation = missionVariables.jaguar_company_reputation += 10;
        /* Pick a random member of Jaguar Company as the observer. */
        observer = jaguarCompany[Math.floor(Math.random() * jaguarCompany.length)];

        if (observer.$pilotName) {
            /* News source is the observer. */
            newsSource = pilotName = observer.$pilotName;
        } else {
            /* Random name for the news source. */
            newsSource = expandDescription("%N [nom1]");
            /* Use displayName as the name of the observer. */
            pilotName = observer.displayName;
        }

        /* Send a thank you message to the player. */
        player.commsMessage(pilotName + ": " + expandDescription("[jaguar_company_player_help]"));

        if (reputation >= helperLevel && reputation < helperLevel + 10) {
            player.commsMessage(pilotName + ": " + expandDescription("[jaguar_company_player_help_buoy]"));
        } else if (reputation >= blackboxLevel && reputation < blackboxLevel + 10 &&
            player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX") !== "EQUIPMENT_OK") {
            player.commsMessage(pilotName + ": " + expandDescription("[jaguar_company_player_help_blackbox]"));
        } else if (reputation >= locationsLevel && reputation < locationsLevel + 10 &&
            player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX") === "EQUIPMENT_OK") {
            player.commsMessage(pilotName + ": " + expandDescription("[jaguar_company_player_help_locations]"));
        }

        if (!p_attackers.newsSent || clock.seconds - p_attackers.newsSent > 10 * 60) {
            /* First kill in the current system or more than 10 minutes since the last kill. */
            p_attackers.newsSent = clock.seconds;
            /* Send news to Snoopers. */
            p_attackers.mainScript.$sendNewsToSnoopers(expandDescription("[jaguar_company_help_news]", {
                    jaguar_company_pilot_name : newsSource
                }));
        }
    };

    /* Other global public functions. */

    /* NAME
     *   $setUp
     *
     * FUNCTION
     *   Setup the private attackers variable and clear the public friend list array.
     */
    this.$setUp = function () {
        if (!worldScripts["Jaguar Company"]) {
            /* Main script not loaded yet. */
            return;
        }

        /* Stop and remove the timer. */
        if (this.$setUpTimerReference) {
            if (this.$setUpTimerReference.isRunning) {
                this.$setUpTimerReference.stop();
            }

            delete this.$setUpTimerReference;
        }

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
            /* 5% probability of a message being transmitted. */
            messageProbability : 0.95
        };
        /* A list of all ship entities that are considered friendly to each other. */
        this.$friendList = [];
    };

    /* NAME
     *   $startAttackersTimer
     *
     * FUNCTION
     *   Start the attacker's timer.
     */
    this.$startAttackersTimer = function () {
        if (!this.$attackersCleanupTimerReference || !this.$attackersCleanupTimerReference.isRunning) {
            /* Start the attack cleanup timer. */
            if (!this.$attackersCleanupTimerReference) {
                /* New timer. */
                this.$attackersCleanupTimerReference = new Timer(this, this.$attackersCleanupTimer, 30, 30);
            } else {
                /* Restart current timer. */
                this.$attackersCleanupTimerReference.start();
            }

            if (p_attackers.logging && p_attackers.logExtra) {
                log(this.name, "$startAttackersTimer::Started the attack cleanup timer.");
            }
        }
    };

    /* NAME
     *   $stopAttackersTimer
     *
     * FUNCTION
     *   Stop and remove the attacker's timer.
     */
    this.$stopAttackersTimer = function () {
        if (this.$attackersCleanupTimerReference) {
            if (this.$attackersCleanupTimerReference.isRunning) {
                this.$attackersCleanupTimerReference.stop();
            }

            delete this.$attackersCleanupTimerReference;

            if (p_attackers.logging && p_attackers.logExtra) {
                log(this.name, "$stopAttackersTimer::Removed the attack cleanup timer.");
            }
        }
    };

    /* NAME
     *   $addFriendly
     *
     * FUNCTION
     *   Add the unique key (entityPersonality) of a ship to the friend list array.
     *   Chains some new ship script event handler hooks to the originals.
     *
     * INPUT
     *   ship - entity of the ship
     */
    this.$addFriendly = function (ship) {
        if (this.$friendList.indexOf(ship.entityPersonality) !== -1) {
            /* Already setup. */
            return;
        }

        /* Add the ship to the friend list. */
        this.$friendList.push(ship.entityPersonality);

        /* Save the original ship script event handler hooks. */
        ship.script.$attackers_shipAttackedWithMissile = ship.script.shipAttackedWithMissile;
        ship.script.$attackers_shipBeingAttacked = ship.script.shipBeingAttacked;
        ship.script.$attackers_shipDied = ship.script.shipDied;
        ship.script.$attackers_shipTargetDestroyed = ship.script.shipTargetDestroyed;

        /* New ship script event handler hooks. */

        /* NAME
         *   shipAttackedWithMissile
         *
         * FUNCTION
         *   A ship is being attacked with a missile.
         *
         * INPUTS
         *   missile - entity of the missile
         *   attacker - entity of the attacker
         */
        ship.script.shipAttackedWithMissile = function (missile, attacker) {
            worldScripts["Jaguar Company Attackers"].$shipIsBeingAttackedWithMissile(this.ship, attacker);

            if (this.$attackers_shipAttackedWithMissile) {
                /* Call the original. */
                this.$attackers_shipAttackedWithMissile.apply(this, arguments);
            }
        };

        /* NAME
         *   shipBeingAttacked
         *
         * FUNCTION
         *   A ship is being attacked.
         *
         * INPUT
         *   attacker - entity of the attacker
         */
        ship.script.shipBeingAttacked = function (attacker) {
            worldScripts["Jaguar Company Attackers"].$shipIsBeingAttacked(this.ship, attacker);

            if (this.$attackers_shipBeingAttacked) {
                /* Call the original. */
                this.$attackers_shipBeingAttacked.apply(this, arguments);
            }
        };

        /* NAME
         *   shipDied
         *
         * FUNCTION
         *   A ship has died.
         *
         * INPUTS
         *   attacker - entity of the attacker
         *   why - cause as a string
         */
        ship.script.shipDied = function (attacker, why) {
            worldScripts["Jaguar Company Attackers"].$shipDied(this.ship, attacker, why);

            if (this.$attackers_shipDied) {
                /* Call the original. */
                this.$attackers_shipDied.apply(this, arguments);
            }
        };

        /* NAME
         *   shipTargetDestroyed
         *
         * FUNCTION
         *   We killed someone.
         *
         *   Inlined this function because it doesn't call functions within the OXP.
         *
         * INPUT
         *   target - entity of the target
         */
        ship.script.shipTargetDestroyed = function (target) {
            if (target.primaryRole === "constrictor" &&
                missionVariables.conhunt &&
                missionVariables.conhunt === "STAGE_1") {
                /* Just in case the ship kills the constrictor, let's not break the mission for the player... */
                missionVariables.conhunt = "CONSTRICTOR_DESTROYED";
                player.score += 1;
                player.credits += target.bounty;
                player.consoleMessage(this.ship.displayName + " assisted in the death of " + target.name);
                player.consoleMessage(
                    this.ship.displayName + ": Commander " + player.name +
                    ", you have the kill and bounty of " + target.bounty + "₢.");

                if (p_attackers.logging && p_attackers.logExtra) {
                    log(this.name, "shipTargetDestroyed::" + this.ship.displayName +
                        " killed - " + target.name + " : " + target.bounty);
                }
            }

            if (this.$attackers_shipTargetDestroyed) {
                /* Call the original. */
                this.$attackers_shipTargetDestroyed.apply(this, arguments);
            }
        };

        /* AI sendScriptMessage functions. */

        /* NAME
         *   $checkTargetIsValid
         *
         * FUNCTION
         *   Checks the current target to make sure it is still valid.
         *
         *   Responds to the caller ship with a 'TARGET_LOST' AI message.
         *
         *   Inlined this function because it is small.
         */
        ship.script.$checkTargetIsValid = function () {
            if (!this.ship.target || !this.ship.target.isValid) {
                /* Target was lost or became invalid. */
                this.ship.reactToAIMessage("TARGET_LOST");
            }
        };

        /* NAME
         *   $performJaguarCompanyAttackTarget
         *
         * FUNCTION
         *   This does something similar to a mix between the deployEscorts and groupAttackTarget AI commands.
         */
        ship.script.$performJaguarCompanyAttackTarget = function () {
            worldScripts["Jaguar Company Attackers"].$performAttackTarget(this.ship);
        };

        /* NAME
         *   $scanForAttackers
         *
         * FUNCTION
         *   Scan for current ships or players from the past that have attacked us.
         *   Also scan for potential attackers.
         *
         * INPUT
         *   callerShip - entity of the caller ship
         */
        ship.script.$scanForAttackers = function () {
            worldScripts["Jaguar Company Attackers"].$scanForAttackers(this.ship);
        };

        if (0 < oolite.compareVersion("1.77")) {
            /* NAME
             *   $scanForCascadeWeapon
             *
             * FUNCTION
             *   Scan for cascade weapons. Won't be needed when v1.78 comes out.
             *   Reacts with a 'CASCADE_WEAPON_FOUND' AI message rather than 'CASCADE_WEAPON_DETECTED'
             *   used by Oolite v1.77 and newer.
             *
             *   Inlined this function because it doesn't call functions within the OXP.
             */
            ship.script.$scanForCascadeWeapon = function () {
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
                        return (cascadeWeaponRoles.indexOf(entity.primaryRole) !== -1);
                    }, this.ship, this.ship.scannerRange);

                if (cascadeWeapons.length > 0) {
                    /* Found at least one. First one in the cascadeWeapons array is the closest.
                     * Set the target and send a CASCADE_WEAPON_FOUND message to the AI.
                     */
                    this.ship.target = cascadeWeapons[0];
                    this.ship.reactToAIMessage("CASCADE_WEAPON_FOUND");
                }
            };
        } else {
            /* Oolite v1.77 and newer. */
            ship.script.$scanForCascadeWeapon = function () {
                /* Do nothing. The real magic is done in the next ship event function. */
                return;
            };

            /* Save the original ship event hook. */
            ship.script.$attackers_cascadeWeaponDetected = ship.script.cascadeWeaponDetected;

            /* NAME
             *   cascadeWeaponDetected
             *
             * FUNCTION
             *   The cascadeWeaponDetected handler fires when a Q-bomb (or equivalent device) detonates within
             *   scanner range of the player. The stock Q-mine (and potentially OXP equivalents) will also send
             *   this handler at the start of the countdown, giving ships more time to react.
             *
             *   Reacts with a 'CASCADE_WEAPON_FOUND' AI message rather than 'CASCADE_WEAPON_DETECTED'
             *   used by Oolite v1.77 and newer.
             *
             *   Inlined this function because it doesn't call functions within the OXP.
             *
             * INPUT
             *   weapon - entity of the cascade weapon
             */
            ship.script.cascadeWeaponDetected = function (weapon) {
                /* Set the target and send a CASCADE_WEAPON_FOUND message to the AI. */
                this.ship.target = weapon;
                this.ship.reactToAIMessage("CASCADE_WEAPON_FOUND");

                if (this.$attackers_cascadeWeaponDetected) {
                    /* Call the original. */
                    this.$attackers_cascadeWeaponDetected.apply(this, arguments);
                }
            };
        }
    };

    /* NAME
     *   $addAttacker
     *
     * FUNCTION
     *   Add an attacker and victim to the attackers array.
     *
     * INPUTS
     *   attacker - entity of the attacker
     *
     *   Optional argument
     *     victim - entity of the victim
     *
     * RESULT
     *   result - object containing attacker and victim indexes, -1 on error.
     */
    this.$addAttacker = function (attacker, victim) {
        var attackerKey,
        attackerIndex,
        victimKey,
        victimIndex;

        if (!attacker || !attacker.isValid) {
            /* The attacker is no longer valid. */
            return -1;
        }

        /* Start the attackers timer if not started already. */
        this.$startAttackersTimer();
        /* Get the attacker's key. */
        attackerKey = attacker.entityPersonality;
        /* Get the attacker's index. */
        attackerIndex = p_attackers.attackersIndex.indexOf(attackerKey);

        if (attackerIndex === -1) {
            /* Attacker not known. Setup a new entry. */
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
        }

        if (!victim || !victim.isValid) {
            victimIndex = -1;
        } else {
            /* Get the victim's key. */
            victimKey = victim.entityPersonality;
            /* Get the victim's index. */
            victimIndex = p_attackers.attackers[attackerIndex].victimsIndex.indexOf(victimKey);

            if (victimIndex === -1) {
                /* Victim not known. Setup a new entry. */
                if (p_attackers.logging && p_attackers.logExtra) {
                    log(this.name, "$addAttacker::Adding victim#" + victimKey +
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
                        attackTime : clock.seconds,
                        missCounter : 0,
                        missTime : clock.seconds
                    }) - 1;
                /* Create the index entry for the victim. */
                p_attackers.attackers[attackerIndex].victimsIndex[victimIndex] = victimKey;
            }
        }

        return {
            attacker : attackerIndex,
            victim : victimIndex
        };
    };

    /* NAME
     *   $removeAttacker
     *
     * FUNCTION
     *   Remove an attacker from the attackers array.
     *
     * INPUT
     *   attackerKey - unique key (entityPersonality) of the attacker
     */
    this.$removeAttacker = function (attackerKey) {
        var attackerIndex;

        if (!p_attackers.attackersIndex.length || p_attackers.attackersIndex.indexOf(attackerKey) === -1) {
            /* No such attacker. */
            return;
        }

        /* Get the attacker's index. */
        attackerIndex = p_attackers.attackersIndex.indexOf(attackerKey);
        /* Remove the attacker from the attackers array. */
        p_attackers.attackers.splice(attackerIndex, 1);
        /* Remove the attacker from the index array. */
        p_attackers.attackersIndex.splice(attackerIndex, 1);
    };

    /* NAME
     *   $removeVictimFromAttacker
     *
     * FUNCTION
     *   Remove a victim from the victims array of the attacker.
     *
     * INPUTS
     *   victimKey - unique key (entityPersonality) of the victim
     *   attackerKey - unique key (entityPersonality) of the attacker
     */
    this.$removeVictimFromAttacker = function (victimKey, attackerKey) {
        var attackerIndex,
        victimIndex;

        if (!p_attackers.attackersIndex.length || p_attackers.attackersIndex.indexOf(attackerKey) === -1) {
            /* No such attacker. */
            return;
        }

        /* Get the attacker's index. */
        attackerIndex = p_attackers.attackersIndex.indexOf(attackerKey);

        if (!p_attackers.attackers[attackerIndex].victimsIndex.length ||
            p_attackers.attackers[attackerIndex].victimsIndex.indexOf(victimKey) === -1) {
            /* No such victim. */
            return;
        }

        /* Get the victim's index. */
        victimIndex = p_attackers.attackers[attackerIndex].victimsIndex.indexOf(victimKey);
        /* Remove the victim from the victims array. */
        p_attackers.attackers[attackerIndex].victims.splice(victimIndex, 1);
        /* Remove the victim from the index array. */
        p_attackers.attackers[attackerIndex].victimsIndex.splice(victimIndex, 1);
    };

    /* NAME
     *   $attackersCleanupTimer
     *
     * FUNCTION
     *   Periodic timer to clean up the attackers array.
     *
     *   Called every 30 seconds.
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
            this.$stopAttackersTimer();

            /* Reset the attackers and index array. Pointless, but done for potential error avoidance. */
            p_attackers.attackersIndex = [];
            p_attackers.attackers = [];

            return;
        }

        if (p_attackers.logging && p_attackers.logExtra) {
            logMsg = "$attackersCleanupTimer::Checking attackers...";
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

                logMsg += ", " + attacker.victims.length + " victims";
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
            } else if (attacker.hostile && attacker.victims.length) {
                if (p_attackers.logging && p_attackers.logExtra) {
                    logMsg += ", hostile - checking victims...";
                }

                /* Cache the length. */
                victimsLength = attacker.victims.length;

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
                    }
                }

                if (p_attackers.logging && p_attackers.logExtra) {
                    logMsg += "\n" + "$attackersCleanupTimer::Finished checking victims.";
                }
            } else if (!attacker.hostile) {
                if (p_attackers.logging && p_attackers.logExtra) {
                    logMsg += ", not hostile - checking victims...";
                }

                /* Cache the length. */
                victimsLength = attacker.victims.length;

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
                    } else if (clock.seconds - victim.attackTime > 5) {
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
            this.$stopAttackersTimer();

            /* Reset the attackers and index array. Pointless, but done for potential error avoidance. */
            p_attackers.attackersIndex = [];
            p_attackers.attackers = [];
        }

        if (p_attackers.logging && p_attackers.logExtra) {
            log(this.name, logMsg);
        }
    };

    /* NAME
     *   $makeHostile
     *
     * FUNCTION
     *   Makes the ship hostile to the victim's group.
     *
     * INPUTS
     *   attacker - entity of the attacker
     *   victim - entity of the victim
     */
    this.$makeHostile = function (attacker, victim) {
        var index;

        if (!attacker || !attacker.isValid || !victim || !victim.isValid) {
            /* The attacker and/or victim is no longer valid. */
            return;
        }

        if (this.$isHostile(attacker)) {
            /* Already hostile. */
            return;
        }

        if (p_attackers.logging && p_attackers.logExtra) {
            log(this.name, "$makeHostile::Make hostile:" +
                " attacker#" + attacker.entityPersonality + " (" + attacker.displayName + ")" +
                ", bounty: " + attacker.bounty +
                ", victim#" + victim.entityPersonality + " (" + victim.displayName + ")");
        }

        /* Add the attacker (if needed) and get the attacker and victim index. */
        index = this.$addAttacker(attacker, victim);

        if (index !== -1) {
            /* Set the hostile property. */
            p_attackers.attackers[index.attacker].hostile = true;
        }
    };

    /* NAME
     *   $isHostile
     *
     * FUNCTION
     *   Check if the ship is hostile.
     *
     * INPUT
     *   attacker - entity of the attacker
     *
     * RESULT
     *   result - return true if ship is hostile, otherwise return false
     */
    this.$isHostile = function (attacker) {
        var index,
        attackerIndex,
        counter,
        length;

        if (!attacker || !attacker.isValid) {
            /* The attacker is no longer valid. */
            return false;
        }

        if (attacker.isThargoid) {
            /* Cache the length. */
            length = attacker.escortGroup.length;

            for (counter = 0; counter < length; counter += 1) {
                /* Add the thargoid and tharglets (if needed) and get the attacker index. */
                index = this.$addAttacker(attacker.escortGroup[counter]);

                if (index !== -1) {
                    /* Set the hostile property. */
                    p_attackers.attackers[index.attacker].hostile = true;
                }
            }

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

    /* NAME
     *   $increaseAttackCounter
     *
     * FUNCTION
     *   Increase the ship's attack counter for the victim.
     *
     * INPUTS
     *   attacker - entity of the attacker
     *   victim - entity of the attacked ship
     */
    this.$increaseAttackCounter = function (attacker, victim) {
        var index;

        if (!attacker || !attacker.isValid || !victim || !victim.isValid) {
            /* The attacker and/or victim is no longer valid. */
            return;
        }

        /* Setup the attacker and victim. */
        index = this.$addAttacker(attacker, victim);

        if (index !== -1) {
            /* Increase the attack counter for the victim. */
            p_attackers.attackers[index.attacker].victims[index.victim].attackCounter += 1;
        }
    };

    /* NAME
     *   $attackCounter
     *
     * FUNCTION
     *   Return the attack counter for the victim.
     *
     * INPUTS
     *   attacker - entity of the attacker
     *   victim - entity of the attacked ship
     *
     * RESULT
     *   result - return attackCounter if available, otherwise return -1
     */
    this.$attackCounter = function (attacker, victim) {
        var attackerIndex,
        victimIndex;

        if (!attacker || !attacker.isValid || !victim || !victim.isValid) {
            /* The attacker and/or victim is no longer valid. */
            return -1;
        }

        if (!p_attackers.attackers.length) {
            /* No attackers. */
            return -1;
        }

        /* Find the index of the attacker. */
        attackerIndex = p_attackers.attackersIndex.indexOf(attacker.entityPersonality);

        if (attackerIndex === -1 || !p_attackers.attackers[attackerIndex].victims.length) {
            /* No such attacker or victims. */
            return -1;
        }

        /* Find the index of the victim. */
        victimIndex = p_attackers.attackers[attackerIndex].victimsIndex.indexOf(victim.entityPersonality);

        if (victimIndex === -1) {
            /* No such victim. */
            return -1;
        }

        /* Return attack counter. */
        return p_attackers.attackers[attackerIndex].victims[victimIndex].attackCounter;
    };

    /* NAME
     *   $resetAttackCounter
     *
     * FUNCTION
     *   Reset the attack counter to 1.
     *
     * INPUTS
     *   attacker - entity of the attacker
     *   victim - entity of the attacked ship
     */
    this.$resetAttackCounter = function (attacker, victim) {
        var attackerIndex,
        victimIndex;

        if (!attacker || !attacker.isValid || !victim || !victim.isValid) {
            /* The attacker and/or victim is no longer valid. */
            return;
        }

        if (!p_attackers.attackers.length) {
            /* No attackers. */
            return;
        }

        /* Find the index of the attacker. */
        attackerIndex = p_attackers.attackersIndex.indexOf(attacker.entityPersonality);

        if (attackerIndex === -1 || !p_attackers.attackers[attackerIndex].victims.length) {
            /* No such attacker or victims. */
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

    /* NAME
     *   $attackTime
     *
     * FUNCTION
     *   Return the attack time for the victim or 'clock.seconds' if not available.
     *
     * INPUTS
     *   attacker - entity of the attacker
     *   victim - entity of the attacked ship
     *
     * RESULT
     *   result - return attackTime if available, otherwise return 'clock.seconds'
     */
    this.$attackTime = function (attacker, victim) {
        var attackerIndex,
        victimIndex;

        if (!attacker || !attacker.isValid || !victim || !victim.isValid) {
            /* The attacker and/or victim is no longer valid. */
            return clock.seconds;
        }

        if (!p_attackers.attackers.length) {
            /* No attackers. */
            return clock.seconds;
        }

        /* Find the index of the attacker. */
        attackerIndex = p_attackers.attackersIndex.indexOf(attacker.entityPersonality);

        if (attackerIndex === -1 || !p_attackers.attackers[attackerIndex].victims.length) {
            /* No such attacker or victims. */
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

    /* New ship script event handler hooks. */

    /* NAME
     *   $shipIsBeingAttackedWithMissile
     *
     * FUNCTION
     *   The AI will automatically send an INCOMING_MISSILE message to this ship.
     *   Since we don't have to do anything fancy that would confuse the AI state system
     *   we don't have to send a special message like the general attack system below.
     *
     *   No such thing as "friendly fire" with a missile.
     *
     *   Not to be confused with the world script event function 'shipAttackedWithMissile',
     *   although it should be called from the ship script event function 'shipAttackedWithMissile'.
     *
     * INPUTS
     *   victim - caller ship
     *   attacker - entity of the attacker
     */
    this.$shipIsBeingAttackedWithMissile = function (victim, attacker) {
        var pilotName;

        if (!attacker || !attacker.isValid || !victim || !victim.isValid || victim.isDerelict || !victim.isPiloted) {
            /* The attacker and/or victim is no longer valid
             * or the victim is a derelict
             * or the victim is not piloted.
             */
            return;
        }

        /* Setup the attacker and victim if needed and increase the attack counter. */
        this.$increaseAttackCounter(attacker, victim);
        /* Make the attacker a hostile for future checking. */
        this.$makeHostile(attacker, victim);

        if (victim.$pilotName) {
            /* Get the victims's name. */
            pilotName = victim.$pilotName;
        } else {
            /* Use displayName as the name of the victim. */
            pilotName = victim.displayName;
        }

        if (attacker.isPlayer) {
            /* Remember the player, even if they jump system. */
            missionVariables.jaguar_company_attacker = true;
            /* Clear the reputation of the player. */
            delete missionVariables.jaguar_company_reputation;
            /* Player hostile message. */
            player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_player_hostile_fire]"));
        } else {
            if (victim.position.distanceTo(player.ship.position) < victim.scannerRange) {
                /* Other ship hostile message. */
                player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_hostile_fire]"));
            }
        }
    };

    /* NAME
     *   $shipIsBeingAttacked
     *
     * FUNCTION
     *   Remember who is attacking us. Pay particular attention to players.
     *
     *   The AI will send an ATTACKED message to this ship.
     *   Since we check for occurences of "friendly fire" we can not use or respond to that message,
     *   so we send out a new message of HOSTILE_FIRE if it really is an attack.
     *
     *   Not to be confused with the world script event function 'shipBeingAttacked',
     *   although it should be called from the ship script event function 'shipBeingAttacked'.
     *
     * INPUTS
     *   victim - caller ship
     *   attacker - entity of the attacker
     */
    this.$shipIsBeingAttacked = function (victim, attacker) {
        var attackCounter,
        pilotName,
        psInRange;

        if (!attacker || !attacker.isValid || !victim || !victim.isValid || victim.isDerelict || !victim.isPiloted) {
            /* The attacker and/or victim is no longer valid
             * or the victim is a derelict
             * or the victim is not piloted.
             */
            return;
        }

        psInRange = (victim.position.distanceTo(player.ship.position) < victim.scannerRange);

        if (victim.$pilotName) {
            /* Get the victims's name. */
            pilotName = victim.$pilotName;
        } else {
            /* Use displayName as the name of the victim. */
            pilotName = victim.displayName;
        }

        /* Check if the attacker is a friend of the victim. */
        if (this.$friendList.indexOf(attacker.entityPersonality) !== -1) {
            if (Math.random() > p_attackers.messageProbability && psInRange) {
                /* Broadcast a "friendly fire" message. */
                player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_friendly_fire]"));
            }

            /* Tell the attacker that we are a friend. */
            attacker.reactToAIMessage("FRIENDLY_FIRE");

            return;
        }

        /* Setup the attacker and victim if needed and increase the attack counter. */
        this.$increaseAttackCounter(attacker, victim);

        if (this.$isHostile(attacker)) {
            /* Already been marked as hostile. */
            if (Math.random() > p_attackers.messageProbability) {
                /* Show hostile message. */
                if (attacker.isPlayer) {
                    /* Player hostile message. */
                    player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_player_hostile_fire]"));
                } else {
                    if (psInRange) {
                        /* Other ship hostile message. */
                        player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_hostile_fire]"));
                    }
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

            if (attackCounter === -1) {
                /* Not an attacker or there are no victims. */
                return;
            }

            if (attackCounter < 5) {
                /* We've only hit this ship less than 5 times. Assume "friendly fire". */
                if (attackCounter === 1) {
                    /* Only show "friendly fire" message on the first hit. */
                    if (attacker.isPlayer) {
                        /* Decrease reputation. */
                        missionVariables.jaguar_company_reputation -= 1;
                        /* Player warning. */
                        player.consoleMessage(pilotName + ": " +
                            expandDescription("[jaguar_company_player_friendly_fire]"));
                    } else {
                        if (psInRange) {
                            /* Other ship warning. */
                            player.consoleMessage(pilotName + ": " +
                                expandDescription("[jaguar_company_friendly_fire]"));
                        }
                    }
                }

                return;
            }
        }

        /* Everybody has had all the warnings they are going to get once we have reached this point.
         * This section is only executed once. Hostiles are caught above after this.
         */

        /* Make the attacker a hostile for future checking. */
        this.$makeHostile(attacker, victim);

        if (attacker.isPlayer) {
            /* Remember the player, even if they jump system. */
            missionVariables.jaguar_company_attacker = true;
            /* Clear the reputation of the player. */
            delete missionVariables.jaguar_company_reputation;
            /* Player hostile message. */
            player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_player_hostile_fire]"));
        } else {
            if (psInRange) {
                /* Other ship hostile message. */
                player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_hostile_fire]"));
            }
        }

        /* Send back a custom AI message. */
        victim.reactToAIMessage("HOSTILE_FIRE");
    };

    /* NAME
     *   $shipDied
     *
     * FUNCTION
     *   A ship has died.
     *
     *   Not to be confused with the world script event function 'shipDied',
     *   although it should be called from the ship script event function 'shipDied'.
     *
     * INPUTS
     *   victim - entity that died
     *   attacker - entity that caused the death
     *   why - cause as a string
     */
    this.$shipDied = function (victim, attacker, why) {
        var destroyedBy = attacker,
        pilotName;

        if (attacker && attacker.isValid && !victim.isDerelict) {
            destroyedBy = "ship#" + attacker.entityPersonality + " (" + attacker.displayName + ")";

            if (why === "energy damage" || why === "cascade weapon") {
                /* Check for piloted ships that aren't hostile.
                 * Generally this will pick up death by a surprise/instant kill, i.e. cascade weapon.
                 */
                if (attacker.isPiloted && !this.$isHostile(attacker)) {
                    /* Make the attacker a hostile for future checking. */
                    this.$makeHostile(attacker, victim);

                    if (attacker.isPlayer) {
                        /* Remember the player, even if they jump system. */
                        missionVariables.jaguar_company_attacker = true;
                        /* Clear the reputation of the player. */
                        delete missionVariables.jaguar_company_reputation;
                    }
                }
            }

            if (Math.random() > p_attackers.messageProbability && victim.isPiloted) {
                if (victim.$pilotName) {
                    /* Get the victims's name. */
                    pilotName = victim.$pilotName;
                } else {
                    /* Use displayName as the name of the victim. */
                    pilotName = victim.displayName;
                }

                if (victim.position.distanceTo(player.ship.position) < victim.scannerRange) {
                    /* Death message. */
                    player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_death]"));
                }
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

    /* AI sendScriptMessage functions. */

    /* NAME
     *   $performAttackTarget
     *
     * FUNCTION
     *   This does something similar to a mix between the deployEscorts and groupAttackTarget AI commands.
     *
     * INPUT
     *   callerShip - entity of the caller ship
     */
    this.$performAttackTarget = function (callerShip) {
        var target = callerShip.target,
        otherShips,
        idleShips = [],
        idleShip,
        counter,
        length;

        if (this.$friendList.indexOf(callerShip.entityPersonality) === -1) {
            /* Caller ship is not a friend of Jaguar Company. */
            return;
        }

        if (target === null) {
            /* Return immediately if we have no target. */
            return;
        }

        if (this.$friendList.indexOf(target.entityPersonality) !== -1 || !this.$isHostile(target)) {
            /* Clear the target and return for one of the following 2 states...
             * 1. Target is a friend.
             * 2. Target is not a hostile.
             */
            callerShip.target = null;

            return;
        }

        /* Force attacker to hostile status. */
        this.$makeHostile(target, callerShip);
        /* React to our own attack call. */
        callerShip.reactToAIMessage("JAGUAR_COMPANY_ATTACK_TARGET");

        /* NAME
         *   $identifyFriends
         *
         * FUNCTION
         *   Stop warnings about anonymous local functions within loops.
         *   Used by 'system.filteredEntities'. Returns true for any friend of the caller ship.
         *
         * INPUT
         *   entity - entity to check
         */
        function $identifyFriends(entity) {
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

            /* Is a friend of the caller ship. */
            return (this.$friendList.indexOf(entity.entityPersonality) !== -1);
        }

        /* Limit range of check to scanner range of caller ship. */
        otherShips = system.filteredEntities(this, $identifyFriends, callerShip, callerShip.scannerRange);

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

            /* The idle ship is not currently in attack mode. Give it a target. */
            idleShip.target = target;
            idleShip.reactToAIMessage("JAGUAR_COMPANY_ATTACK_TARGET");
        }
    };

    /* NAME
     *   $scanForAttackers
     *
     * FUNCTION
     *   Scan for ships from the past that have attacked the caller ship.
     *   Also scan for potential attackers.
     *
     * INPUT
     *   callerShip - entity of the caller ship
     */
    this.$scanForAttackers = function (callerShip) {
        var target = null,
        attackersWithinRange,
        pilotName,
        counter,
        length;

        if (this.$friendList.indexOf(callerShip.entityPersonality) === -1) {
            /* Caller ship is not a friend of Jaguar Company. */
            return;
        }

        /* NAME
         *   $identifyAttacker
         *
         * FUNCTION
         *   Stop warnings about anonymous local functions within loops.
         *   Used by 'system.filteredEntities'. Returns true for attackers or potential attackers.
         *
         * INPUT
         *   entity - entity to check
         */
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
                /* The entity is a previous hostile for the caller ship. */
                return true;
            }

            if (entity.isPlayer && missionVariables.jaguar_company_attacker) {
                /* Player has attacked us in the past. */
                return true;
            }

            if (p_attackers.mainScript.$jaguarCompanyBase && p_attackers.mainScript.$jaguarCompanyBase.isValid &&
                entity.position.distanceTo(p_attackers.mainScript.$jaguarCompanyBase.position) < 30000) {
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

        /* Find past attackers and potential attackers within range of the caller ship. */
        attackersWithinRange = system.filteredEntities(this, $identifyAttacker, callerShip, callerShip.scannerRange);

        if (!attackersWithinRange.length) {
            /* No attackers. */
            callerShip.reactToAIMessage("ATTACKERS_NOT_FOUND");
        } else {
            /* Cache the length. */
            length = attackersWithinRange.length;

            for (counter = 0; counter < length; counter += 1) {
                /* Force all attackers within range to hostile status. */
                this.$makeHostile(attackersWithinRange[counter], callerShip);
            }

            /* Set target to the closest attacker. */
            target = attackersWithinRange[0];

            if (Math.random() > p_attackers.messageProbability && callerShip.isPiloted) {
                if (callerShip.$pilotName) {
                    /* Get the callerShip's name. */
                    pilotName = callerShip.$pilotName;
                } else {
                    /* Use displayName as the name of the callerShip. */
                    pilotName = callerShip.displayName;
                }

                /* Show hostile message. */
                if (target.isPlayer) {
                    /* Player hostile message. */
                    player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_player_hostile_fire]"));
                } else {
                    if (callerShip.position.distanceTo(player.ship.position) < callerShip.scannerRange) {
                        /* Other ship hostile message. */
                        player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_hostile_fire]"));
                    }
                }
            }

            /* Set the target. */
            callerShip.target = target;
            callerShip.reactToAIMessage("ATTACKERS_FOUND");
        }
    };
}).call(this);
