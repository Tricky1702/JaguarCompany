/*jslint bitwise: true, es5: true, newcap: true, nomen: true, regexp: true, unparam: true, todo: true, white: true,
indent: 4, maxerr: 50, maxlen: 120 */
/*jshint boss: true, curly: true, eqeqeq: true, eqnull: true, es5: true, evil: true, forin: true, laxbreak: true,
loopfunc: true, noarg: true, noempty: true, strict: true, nonew: true, undef: true */
/*global Array, Math, Timer, Vector3D, clock, expandDescription, galaxyNumber, log, missionVariables, player, system,
worldScripts */

/* Jaguar Company Ships
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
 * World script to setup Jaguar Company ships.
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "Jaguar Company Ships";
    this.author = "Tricky";
    this.copyright = "© 2012-2013 Richard Thomas Harrison (Tricky)";
    this.license = "CC BY-NC-SA 3.0";
    this.description = "Script to initialise the Jaguar Company ships.";
    this.version = "1.4";

    /* Private variable. */
    var p_ships = {};

    /* World script event handlers. */

    /* NAME
     *   startUp
     *
     * FUNCTION
     *   We only need to do this once.
     *   This will get redefined after a new game or loading of a new Commander.
     */
    this.startUp = function () {
        var mainScript = worldScripts["Jaguar Company"],
        cabalScript = worldScripts.Cabal_Common_Functions,
        ccl,
        cclVersion;

        if (!cabalScript || cabalScript.Cabal_Common === 'undefined') {
            this.$killSelf(" -> Cabal Common Library is missing.");

            return;
        }

        ccl = new cabalScript.Cabal_Common();
        cclVersion = ccl.internalVersion;

        if (cclVersion < 14) {
            this.$killSelf(" -> Cabal Common Library is too old for any Oolite version.");

            return;
        }

        if (cclVersion === 14 && mainScript.$gte_v1_77) {
            /* Oolite v1.77 and newer. */
            this.$killSelf(" -> Cabal Common Library is too old for Oolite v1.77 (and newer Oolite versions).");

            return;
        }

        if (cclVersion > 14 && !mainScript.$gte_v1_77) {
            /* Oolite v1.76.1 and older. */
            this.$killSelf(" -> Cabal Common Library is too new for Oolite v1.76.1 (and older Oolite versions).");

            return;
        }

        /* Setup the private ships variable + some public variables. Delay it. */
        this.$setUpTimerReference = new Timer(this, this.$setUp, 0.5, 0.5);

        log(this.name + " " + this.version + " loaded.");

        /* No longer needed after setting up. */
        delete this.startUp;
    };

    /* NAME
     *   shipWillExitWitchspace
     *
     * FUNCTION
     *   Reset everything just before exiting Witchspace.
     */
    this.shipWillExitWitchspace = function () {
        /* Setup the private ships variable + some public variables. */
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
        var victimKey,
        victimsIndex,
        jaguarCompany,
        attackerIndex,
        observer,
        pilotName,
        reputation,
        helperLevel,
        blackboxLevel,
        locationsLevel,
        blackboxStatus;

        if (!this.$isHostile(victim)) {
            /* Ignore victims that are not hostile to Jaguar Company. */
            return;
        }

        if (Math.random() < 0.9) {
            /* Jaguar Company is too busy to see you helping. */
            return;
        }

        /* Unique key (entityPersonality) for the victim. */
        victimKey = victim.entityPersonality;

        /* Search for any members of Jaguar Company within maximum scanner range of the player ship. */
        jaguarCompany = system.filteredEntities(this, function (entity) {
                /* Unique key (entityPersonality) for the entity. */
                var entityKey = entity.entityPersonality;

                /* Only interested in entities that aren't the victim. */
                return (victimKey !== entityKey && this.$friendList.indexOf(entityKey) !== -1);
            }, player.ship, player.ship.scannerRange);

        if (!jaguarCompany.length) {
            /* Nobody around. */
            return;
        }

        /* Skip the next bit if the victim is a thargoid/tharglet. */
        if (!victim.isThargoid) {
            /* Find the index of the victim in the attackers index array. */
            attackerIndex = p_ships.attackersIndex.indexOf(victimKey);
            /* Get the victims index array. */
            victimsIndex = p_ships.attackers[attackerIndex].victimsIndex;
            /* Re-filter to find out if any of Jaguar Company found so far
             * are victims of the ship the player is attacking.
             */
            jaguarCompany = jaguarCompany.filter(function (entity) {
                    return (victimsIndex.indexOf(entity.entityPersonality) !== -1);
                });

            if (!jaguarCompany.length) {
                /* Nobody around. */
                return;
            }
        }

        /* Increase the reputation of the player with Jaguar Company. */
        reputation = p_ships.mainScript.$playerVar.reputation[galaxyNumber] + 1;
        p_ships.mainScript.$playerVar.reputation[galaxyNumber] = reputation;
        /* Pick a random member of Jaguar Company as the observer. */
        observer = jaguarCompany[Math.floor(Math.random() * jaguarCompany.length)];

        if (observer.isPiloted || observer.isStation) {
            if (observer.$pilotName) {
                /* Get the observer's name. */
                pilotName = observer.$pilotName;
            } else {
                /* Use displayName as the name of the observer. */
                pilotName = observer.name + ": " + observer.displayName;
            }

            /* Send a thank you message to the player. */
            player.commsMessage(pilotName + ": " + expandDescription("[jaguar_company_player_help]"));
            /* Equipment status of the black box. */
            blackboxStatus = player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX");

            helperLevel = p_ships.mainScript.$reputationHelper;
            blackboxLevel = p_ships.mainScript.$reputationBlackbox;
            locationsLevel = p_ships.mainScript.$reputationLocations;

            if (reputation === helperLevel) {
                player.commsMessage(pilotName + ": " + expandDescription("[jaguar_company_player_help_buoy]"));
            } else if (reputation === blackboxLevel && blackboxStatus !== "EQUIPMENT_OK") {
                player.commsMessage(pilotName + ": " + expandDescription("[jaguar_company_player_help_blackbox]"));
            } else if (reputation === locationsLevel && blackboxStatus === "EQUIPMENT_OK") {
                player.commsMessage(pilotName + ": " + expandDescription("[jaguar_company_player_help_locations]"));
            }
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
        var victimsIndex,
        victimKey,
        jaguarCompany,
        attackerIndex,
        observer,
        pilotName,
        newsSource,
        reputation,
        helperLevel,
        blackboxLevel,
        locationsLevel,
        blackboxStatus;

        if (!this.$isHostile(victim)) {
            /* Ignore victims that are not hostile to Jaguar Company. */
            return;
        }

        /* Unique key (entityPersonality) for the victim. */
        victimKey = victim.entityPersonality;

        /* Search for any members of Jaguar Company within maximum scanner range of the player ship. */
        jaguarCompany = system.filteredEntities(this, function (entity) {
                /* Unique key (entityPersonality) for the entity. */
                var entityKey = entity.entityPersonality;

                /* Only interested in entities that aren't the victim. */
                return (victimKey !== entityKey && this.$friendList.indexOf(entityKey) !== -1);
            }, player.ship, player.ship.scannerRange);

        if (!jaguarCompany.length) {
            /* Nobody around. */
            return;
        }

        /* Skip the next bit if the victim is a thargoid/tharglet. */
        if (!victim.isThargoid) {
            /* Find the index of the victim in the attackers index array. */
            attackerIndex = p_ships.attackersIndex.indexOf(victimKey);
            /* Get the victims index array. */
            victimsIndex = p_ships.attackers[attackerIndex].victimsIndex;
            /* Re-filter to find out if any of Jaguar Company found so far
             * are victims of the ship the player has killed.
             */
            jaguarCompany = jaguarCompany.filter(function (entity) {
                    return (victimsIndex.indexOf(entity.entityPersonality) !== -1);
                });

            if (!jaguarCompany.length) {
                /* Nobody around. */
                return;
            }
        }

        /* Increase the reputation of the player with Jaguar Company. */
        reputation = p_ships.mainScript.$playerVar.reputation[galaxyNumber] + 10;
        p_ships.mainScript.$playerVar.reputation[galaxyNumber] = reputation;
        /* Pick a random member of Jaguar Company as the observer. */
        observer = jaguarCompany[Math.floor(Math.random() * jaguarCompany.length)];

        if (observer.isPiloted || observer.isStation) {
            if (observer.$pilotName) {
                /* News source is the observer. */
                newsSource = observer.$pilotName;
                pilotName = observer.$pilotName;
            } else {
                /* Random name for the news source. */
                newsSource = expandDescription("%N [nom1]");
                /* Use displayName as the name of the observer. */
                pilotName = observer.name + ": " + observer.displayName;
            }

            /* Send a thank you message to the player. */
            player.commsMessage(pilotName + ": " + expandDescription("[jaguar_company_player_help]"));
            /* Equipment status of the black box. */
            blackboxStatus = player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX");

            helperLevel = p_ships.mainScript.$reputationHelper;
            blackboxLevel = p_ships.mainScript.$reputationBlackbox;
            locationsLevel = p_ships.mainScript.$reputationLocations;

            if (reputation >= helperLevel && reputation < helperLevel + 10) {
                player.commsMessage(pilotName + ": " + expandDescription("[jaguar_company_player_help_buoy]"));
            } else if (reputation >= blackboxLevel && reputation < blackboxLevel + 10 &&
                blackboxStatus !== "EQUIPMENT_OK") {
                player.commsMessage(pilotName + ": " + expandDescription("[jaguar_company_player_help_blackbox]"));
            } else if (reputation >= locationsLevel && reputation < locationsLevel + 10 &&
                blackboxStatus === "EQUIPMENT_OK") {
                player.commsMessage(pilotName + ": " + expandDescription("[jaguar_company_player_help_locations]"));
            }

            if (!p_ships.newsSent || clock.seconds - p_ships.newsSent > 30 * 60) {
                /* First kill in the current system or more than 30 minutes since the last kill. */
                p_ships.newsSent = clock.seconds;
                /* Send news to Snoopers. */
                p_ships.mainScript.$sendNewsToSnoopers(expandDescription("[jaguar_company_help_news]", {
                        jaguar_company_pilot_name : newsSource
                    }));
            }
        }
    };

    /* Other global public functions. */

    /* NAME
     *   $setUp
     *
     * FUNCTION
     *   Setup the private ships variable and clear the public friend list array.
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

            this.$setUpTimerReference = null;
        }

        /* Initialise the p_ships variable object.
         * Encapsulates all private global data.
         */
        p_ships = {
            /* Cache the main world script. */
            mainScript : worldScripts["Jaguar Company"],
            /* Local copies of the logging variables. */
            logging : worldScripts["Jaguar Company"].$logging,
            logExtra : worldScripts["Jaguar Company"].$logExtra,
            /* Initialise the attackers and attackers index array. */
            attackers : [],
            attackersIndex : [],
            /* 5% probability of a message being transmitted. */
            messageProbability : 0.95
        };
        /* A list of all ship entities that are considered friendly to each other. */
        this.$friendList = [];
    };

    /* NAME
     *   $killSelf
     *
     * FUNCTION
     *   Removes all functions and variables.
     *
     * INPUT
     *   desc - description for the removal (optional)
     */
    this.$killSelf = function (desc) {
        var prop;

        if (desc && typeof desc === "string") {
            player.consoleMessage(this.name + " - Check your Latest.log", 10);
            log(this.name, this.name + " - Shutting down" + desc);
        }

        /* Delete public functions and variables. */
        for (prop in this) {
            if (this.hasOwnProperty(prop)) {
                if (prop !== 'name' && prop !== 'version') {
                    delete this[prop];
                }
            }
        }

        /* Set the deactivated flag for Cabal Common Library. */
        this.deactivated = true;

        return;
    };

    /* NAME
     *   $showProps
     *
     * FUNCTION
     *   For debugging only.
     */
    this.$showProps = function () {
        var result = "",
        prop,
        attacker,
        attackerCounter,
        attackerLength,
        victim,
        victimCounter,
        victimLength,
        counter,
        length;

        for (prop in this) {
            if (this.hasOwnProperty(prop)) {
                if (typeof this[prop] !== "function") {
                    result += "this." + prop + ": " + this[prop] + "\n";
                } else {
                    result += "this." + prop + " = function ()\n";
                }
            }
        }

        for (prop in p_ships) {
            if (p_ships.hasOwnProperty(prop)) {
                result += "p_ships." + prop + ": " + p_ships[prop] + "\n";
            }
        }

        attackerLength = p_ships.attackers.length;

        if (attackerLength) {
            result += "Attackers (" + attackerLength + ")\n";

            for (attackerCounter = 0; attackerCounter < attackerLength; attackerCounter += 1) {
                result += "#" + (attackerCounter + 1) + ") ";
                attacker = p_ships.attackers[attackerCounter];
                counter = 1;
                length = Object.keys(attacker).length;

                for (prop in attacker) {
                    if (attacker.hasOwnProperty(prop)) {
                        result += prop + ": " + attacker[prop] + (counter === length ? "\n" : ", ");
                        counter += 1;
                    }
                }

                victimLength = attacker.victims.length;

                if (victimLength) {
                    result += "* Victims (" + victimLength + ")\n";

                    for (victimCounter = 0; victimCounter < victimLength; victimCounter += 1) {
                        result += "* #" + (victimCounter + 1) + ") ";
                        victim = attacker.victims[victimCounter];
                        counter = 1;
                        length = Object.keys(victim).length;

                        for (prop in victim) {
                            if (victim.hasOwnProperty(prop)) {
                                result += prop + ": " + victim[prop] + (counter === length ? "\n" : ", ");
                                counter += 1;
                            }
                        }
                    }
                }
            }
        }

        log(this.name, "$showProps::\n" + result);
    };

    /* NAME
     *   $startAttackersTimer
     *
     * FUNCTION
     *   Start the attackers timer.
     */
    this.$startAttackersTimer = function () {
        if (!this.$attackersCleanupTimerReference || !this.$attackersCleanupTimerReference.isRunning) {
            /* Start the attack cleanup timer. */
            if (!this.$attackersCleanupTimerReference) {
                /* New timer. */
                this.$attackersCleanupTimerReference = new Timer(this, this.$attackersCleanupTimer, 60, 60);
            } else {
                /* Restart current timer. */
                this.$attackersCleanupTimerReference.start();
            }

            if (p_ships.logging && p_ships.logExtra) {
                log(this.name, "$startAttackersTimer::Started the attack cleanup timer.");
            }
        }
    };

    /* NAME
     *   $stopAttackersTimer
     *
     * FUNCTION
     *   Stop and remove the attackers timer.
     */
    this.$stopAttackersTimer = function () {
        if (this.$attackersCleanupTimerReference) {
            if (this.$attackersCleanupTimerReference.isRunning) {
                this.$attackersCleanupTimerReference.stop();
            }

            this.$attackersCleanupTimerReference = null;

            if (p_ships.logging && p_ships.logExtra) {
                log(this.name, "$stopAttackersTimer::Removed the attack cleanup timer.");
            }
        }
    };

    /* NAME
     *   $removeFriendly
     *
     * FUNCTION
     *   Remove the unique key (entityPersonality) of a ship from the friend list array.
     *
     * INPUT
     *   key - unique key (entityPersonality) of the ship
     */
    this.$removeFriendly = function (key) {
        var index = this.$friendList.indexOf(key);

        if (index !== -1) {
            /* Remove the ship from the friend list. */
            this.$friendList.splice(index, 1);
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
     *   args - object
     *     .ship - entity of the ship
     *     .pilotName - name of the pilot (optional)
     *     .shipName - display name of the ship (optional)
     */
    this.$addFriendly = function (args) {
        var ship,
        shipKey;

        if (!args || !args.ship || !args.ship.isValid) {
            /* Need a valid ship as a property of args. */
            return;
        }

        ship = args.ship;
        /* Unique key (entityPersonality) for the ship. */
        shipKey = ship.entityPersonality;

        if (this.$friendList.indexOf(shipKey) !== -1) {
            /* Already setup. */
            return;
        }

        /* Save the ship key. */
        ship.script.$shipKey = shipKey;

        if (typeof args.pilotName === "string") {
            ship.$pilotName = args.pilotName;

            /* Save the original ship script event handler hook. */
            ship.script.$ships_shipLaunchedEscapePod = ship.script.shipLaunchedEscapePod;

            /* NAME
             *   shipLaunchedEscapePod
             *
             * FUNCTION
             *   The shipLaunchedEscapePod handler is called when the pilot bails out.
             *
             *   Inlined this function because it is small.
             *
             * INPUT
             *   escapepod - contains the main pod with the pilot
             */
            ship.script.shipLaunchedEscapePod = function (escapepod) {
                /* Identify this pod as containing a member of Jaguar Company. */
                escapepod.$jaguarCompany = true;
                /* Transfer pilot name to the escape pod. */
                escapepod.$pilotName = this.ship.$pilotName;

                if (this.$ships_shipLaunchedEscapePod) {
                    /* Call the original. */
                    this.$ships_shipLaunchedEscapePod.apply(this, arguments);
                }
            };
        }

        if (typeof args.shipName === "string") {
            ship.displayName = args.shipName;
        }

        /* Add the ship key to the friend list. */
        this.$friendList.push(shipKey);

        /* Save the original ship script event handler hooks. */
        ship.script.$ships_entityDestroyed = ship.script.entityDestroyed;
        ship.script.$ships_shipAttackedWithMissile = ship.script.shipAttackedWithMissile;
        ship.script.$ships_shipBeingAttacked = ship.script.shipBeingAttacked;
        ship.script.$ships_shipDied = ship.script.shipDied;
        ship.script.$ships_shipTakingDamage = ship.script.shipTakingDamage;
        ship.script.$ships_shipTargetDestroyed = ship.script.shipTargetDestroyed;

        /* New ship script event handler hooks. */

        /* NAME
         *   entityDestroyed
         *
         * FUNCTION
         *   Friendly ship has just become invalid.
         */
        ship.script.entityDestroyed = function () {
            worldScripts["Jaguar Company Ships"].$removeFriendly(this.$shipKey);

            if (this.$ships_entityDestroyed) {
                /* Call the original. */
                this.$ships_entityDestroyed.apply(this, arguments);
            }
        };

        /* NAME
         *   shipAttackedWithMissile
         *
         * FUNCTION
         *   Friendly ship is being attacked with a missile.
         *
         * INPUTS
         *   missile - entity of the missile (not used)
         *   attacker - entity of the attacker
         */
        ship.script.shipAttackedWithMissile = function (missile, attacker) {
            worldScripts["Jaguar Company Ships"].$shipIsBeingAttackedWithMissile(this.ship, attacker);

            if (this.$ships_shipAttackedWithMissile) {
                /* Call the original. */
                this.$ships_shipAttackedWithMissile.apply(this, arguments);
            }
        };

        /* NAME
         *   shipBeingAttacked
         *
         * FUNCTION
         *   Friendly ship is being attacked.
         *
         * INPUT
         *   attacker - entity of the attacker
         */
        ship.script.shipBeingAttacked = function (attacker) {
            worldScripts["Jaguar Company Ships"].$shipIsBeingAttacked(this.ship, attacker);

            if (this.$ships_shipBeingAttacked) {
                /* Call the original. */
                this.$ships_shipBeingAttacked.apply(this, arguments);
            }
        };

        /* NAME
         *   shipDied
         *
         * FUNCTION
         *   Friendly ship has died.
         *
         * INPUTS
         *   attacker - entity of the attacker
         *   why - cause as a string
         */
        ship.script.shipDied = function (attacker, why) {
            worldScripts["Jaguar Company Ships"].$shipDied(this.ship, attacker, why);

            if (this.$ships_shipDied) {
                /* Call the original. */
                this.$ships_shipDied.apply(this, arguments);
            }
        };

        /* NAME
         *   shipTakingDamage
         *
         * FUNCTION
         *   Friendly ship is taking damage.
         *
         * INPUTS
         *   amount - amount of damage
         *   attacker - entity that caused the damage
         *   type - type of damage as a string
         */
        ship.script.shipTakingDamage = function (amount, attacker, type) {
            worldScripts["Jaguar Company Ships"].$shipTakingDamage(this.ship, amount, attacker, type);

            if (this.$ships_shipTakingDamage) {
                /* Call the original. */
                this.$ships_shipTakingDamage.apply(this, arguments);
            }
        };

        /* NAME
         *   shipTargetDestroyed
         *
         * FUNCTION
         *   Friendly ship killed someone.
         *
         *   Inlined this function because it doesn't call functions within the OXP.
         *
         * INPUT
         *   target - entity of the target
         */
        ship.script.shipTargetDestroyed = function (target) {
            var conhunt = missionVariables.conhunt,
            pilotName;

            if (target.primaryRole === "constrictor" && conhunt && conhunt === "STAGE_1") {
                if (this.ship.$pilotName) {
                    /* Get the pilot's name. */
                    pilotName = this.ship.$pilotName;
                } else {
                    /* Use displayName as the name of the pilot. */
                    pilotName = this.ship.displayName;
                }

                /* Just in case the ship kills the constrictor, let's not break the mission for the player... */
                missionVariables.conhunt = "CONSTRICTOR_DESTROYED";
                player.score += 1;
                player.credits += target.bounty;
                player.consoleMessage(pilotName + " assisted in the death of " + target.name);
                player.consoleMessage(
                    pilotName + ": Commander " + player.name +
                    ", you have the kill and bounty of " + target.bounty + "₢.");

                if (p_ships.logging && p_ships.logExtra) {
                    log(this.name, "shipTargetDestroyed::" +
                        pilotName + " flying '" + this.ship.name + ": " + this.ship.displayName + "'" +
                        " killed - " + target.name + " : " + target.bounty);
                }
            }

            if (this.$ships_shipTargetDestroyed) {
                /* Call the original. */
                this.$ships_shipTargetDestroyed.apply(this, arguments);
            }
        };

        /* Common ship script functions. */

        /* NAME
         *   $setCoordsToEntity
         *
         * FUNCTION
         *   Set the co-ordinates to the surface of the entity.
         *   This borrows some code from 'src/Core/Entities/ShipEntityAI.m - setCourseToPlanet'
         *
         * INPUT
         *   entity - entity to set co-ordinates to
         */
        ship.script.$setCoordsToEntity = function (entity) {
            var position = entity.position,
            distance,
            ratio,
            variation;

            /* Calculate a vector position between the entity's surface and the ship. */
            distance = this.ship.position.distanceTo(position);
            ratio = (entity.collisionRadius + this.ship.collisionRadius + 100) / distance;
            position = Vector3D.interpolate(position, this.ship.position, ratio);

            /* Higher variation if further away. */
            variation = (distance > 51200 ? 0.5 : 0.2);

            /* Move the vector a random amount. */
            position.x += variation * (Math.random() - variation);
            position.y += variation * (Math.random() - variation);
            position.z += variation * (Math.random() - variation);

            /* Save this position for 'setDestinationFromCoordinates' in the AI. */
            this.ship.savedCoordinates = position;
        };

        /* Common AI sendScriptMessage functions. */

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
            worldScripts["Jaguar Company Ships"].$performAttackTarget(this.ship);
        };

        /* NAME
         *   $recallAIState
         *
         * FUNCTION
         *   Recall the saved AI state.
         *
         *   Inlined this function because it is small.
         */
        ship.script.$recallAIState = function () {
            var mainScript = worldScripts["Jaguar Company"];

            if (mainScript.$logging && mainScript.$logExtra) {
                log(this.name,
                    "[" + this.ship.AI + "::" + this.ship.AIState + "] $recallAIState::" +
                    this.ship.name + ": " + this.ship.displayName + " - state: " + this.$savedAIState);
            }

            this.ship.AIState = this.$savedAIState;
        };

        /* NAME
         *   $saveAIState
         *
         * FUNCTION
         *   Save the current AI state.
         *
         * INPUT
         *   arr - alternative AI state (as an array) (optional) (just uses the first element in the array)
         *
         *   Inlined this function because it is small.
         */
        ship.script.$saveAIState = function (arr) {
            var mainScript = worldScripts["Jaguar Company"],
            state;

            if (!Array.isArray(arr)) {
                /* Default. */
                state = this.ship.AIState;
            } else {
                state = arr[0];
            }

            this.$savedAIState = state;

            if (mainScript.$logging && mainScript.$logExtra) {
                log(this.name,
                    "[" + this.ship.AI + "::" + this.ship.AIState + "] $saveAIState::" +
                    this.ship.name + ": " + this.ship.displayName + " - state: " + this.$savedAIState);
            }
        };

        /* NAME
         *   $scanForAttackers
         *
         * FUNCTION
         *   Scan for current ships or players from the past that have attacked us.
         *   Also scan for potential attackers.
         */
        ship.script.$scanForAttackers = function () {
            worldScripts["Jaguar Company Ships"].$scanForAttackers(this.ship);
        };

        if (p_ships.mainScript.$gte_v1_77) {
            /* Oolite v1.77 and newer. */

            /* NAME
             *   $scanForCascadeWeapon
             *
             * FUNCTION
             *   Do nothing. The real magic is done in the 'cascadeWeaponDetected' ship event function.
             */
            ship.script.$scanForCascadeWeapon = function () {
                return;
            };

            /* Save the original ship event hooks. */
            ship.script.$ships_cascadeWeaponDetected = ship.script.cascadeWeaponDetected;
            ship.script.$ships_shipBeingAttackedUnsuccessfully = ship.script.shipBeingAttackedUnsuccessfully;

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

                if (this.$ships_cascadeWeaponDetected) {
                    /* Call the original. */
                    this.$ships_cascadeWeaponDetected.apply(this, arguments);
                }
            };

            /* NAME
             *   shipBeingAttackedUnsuccessfully
             *
             * FUNCTION
             *   A ship is being unsuccessfully attacked.
             *
             * INPUT
             *   attacker - entity of the attacker
             */
            ship.script.shipBeingAttackedUnsuccessfully = function (attacker) {
                worldScripts["Jaguar Company Ships"].$shipIsBeingAttackedUnsuccessfully(this.ship, attacker);

                if (this.$ships_shipBeingAttackedUnsuccessfully) {
                    /* Call the original. */
                    this.$ships_shipBeingAttackedUnsuccessfully.apply(this, arguments);
                }
            };
        } else {
            /* Oolite v1.76.1 and older. */

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

                if (cascadeWeapons.length) {
                    /* Found at least one. First one in the cascadeWeapons array is the closest.
                     * Set the target and send a CASCADE_WEAPON_FOUND message to the AI.
                     */
                    this.ship.target = cascadeWeapons[0];
                    this.ship.reactToAIMessage("CASCADE_WEAPON_FOUND");
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
     *   victim - entity of the victim (optional)
     *
     * RESULT
     *   result - object containing attacker and victim indexes, -1 if not added.
     */
    this.$addAttacker = function (attacker, victim) {
        var attackerKey,
        attackerIndex,
        victimKey,
        victimIndex,
        logMsg = "";

        if (!attacker || !attacker.isValid) {
            /* The attacker is no longer valid. */
            return -1;
        }

        if (this.$friendList.indexOf(attacker.entityPersonality) !== -1) {
            /* Don't add members of Jaguar Company. */
            return -1;
        }

        if (attacker.isPolice) {
            /* Don't add police ships. */
            return -1;
        }

        /* Start the attackers timer if not started already. */
        this.$startAttackersTimer();
        /* Get the attacker's key. */
        attackerKey = attacker.entityPersonality;
        /* Get the attacker's index. */
        attackerIndex = p_ships.attackersIndex.indexOf(attackerKey);

        if (attackerIndex === -1) {
            if (p_ships.logging && p_ships.logExtra) {
                logMsg += "\nAdding attacker#" + attackerKey + " (" + attacker.displayName + ")";
            }

            /* Create an entry for the attacker if it doesn't exist.
             * push() returns the new length. The attacker index will be 1 less than this.
             */
            attackerIndex = p_ships.attackers.push({
                    hostile : false,
                    ship : attacker,
                    shipKey : attackerKey,
                    victims : [],
                    victimsIndex : []
                }) - 1;
            /* Create the index entry for the attacker. */
            p_ships.attackersIndex[attackerIndex] = attackerKey;
        }

        if (!victim || !victim.isValid) {
            victimIndex = -1;
        } else {
            /* Get the victim's key. */
            victimKey = victim.entityPersonality;
            /* Get the victim's index. */
            victimIndex = p_ships.attackers[attackerIndex].victimsIndex.indexOf(victimKey);

            if (victimIndex === -1) {
                if (p_ships.logging && p_ships.logExtra) {
                    logMsg += "\nAdding victim#" + victimKey + " (" + victim.name + ": " + victim.displayName + ")" +
                    " attacked by attacker#" + attackerKey + " (" + attacker.displayName + ")";
                }

                /* Create an entry for the victim if it doesn't exist.
                 * push() returns the new length. The victim index will be 1 less than this.
                 */
                victimIndex = p_ships.attackers[attackerIndex].victims.push({
                        attackCounter : 0,
                        attackTime : clock.seconds,
                        missCounter : 0,
                        missTime : clock.seconds,
                        ship : victim,
                        shipKey : victimKey
                    }) - 1;
                /* Create the index entry for the victim. */
                p_ships.attackers[attackerIndex].victimsIndex[victimIndex] = victimKey;
            }
        }

        if (p_ships.logging && p_ships.logExtra && logMsg.length) {
            log(this.name, "$addAttacker::" + logMsg);
        }

        return {
            attackerIndex : attackerIndex,
            victimIndex : victimIndex
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
        var attackersIndex,
        attackerIndex;

        attackersIndex = p_ships.attackersIndex;
        /* Get the attacker's index. */
        attackerIndex = attackersIndex.indexOf(attackerKey);

        if (!attackersIndex.length || attackerIndex === -1) {
            /* No such attacker. */
            return;
        }

        /* Remove the attacker from the attackers array. */
        p_ships.attackers.splice(attackerIndex, 1);
        /* Remove the attacker from the attackers index array. */
        p_ships.attackersIndex.splice(attackerIndex, 1);
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
        var attackersIndex,
        attackerIndex,
        victimsIndex,
        victimIndex;

        attackersIndex = p_ships.attackersIndex;
        /* Get the attacker's index. */
        attackerIndex = attackersIndex.indexOf(attackerKey);

        if (!attackersIndex.length || attackerIndex === -1) {
            /* No such attacker. */
            return;
        }

        victimsIndex = p_ships.attackers[attackerIndex].victimsIndex;
        /* Get the victim's index. */
        victimIndex = victimsIndex.indexOf(victimKey);

        if (!victimsIndex.length || victimIndex === -1) {
            /* No such victim. */
            return;
        }

        /* Remove the victim from the victims array. */
        p_ships.attackers[attackerIndex].victims.splice(victimIndex, 1);
        /* Remove the victim from the victims index array. */
        p_ships.attackers[attackerIndex].victimsIndex.splice(victimIndex, 1);
    };

    /* NAME
     *   $attackersCleanupTimer
     *
     * FUNCTION
     *   Periodic timer to clean up the attackers array.
     *
     *   Called every 1 minute.
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
        mainScript,
        logMsg;

        if (!p_ships.attackers.length) {
            /* No attackers, stop and remove this timer. */
            this.$stopAttackersTimer();

            /* Reset the attackers and index array. Pointless, but done for potential error avoidance. */
            p_ships.attackersIndex = [];
            p_ships.attackers = [];

            return;
        }

        if (p_ships.logging && p_ships.logExtra) {
            logMsg = "$attackersCleanupTimer::Checking attackers...";
        }

        /* Cache the length. */
        attackersLength = p_ships.attackers.length;
        /* Empty array to copy the attackers into. */
        attackers = [];

        /* Create a copy of the attackers array. The index should follow the original */
        for (attackersCounter = 0; attackersCounter < attackersLength; attackersCounter += 1) {
            /* Iterate over each attacker. */
            attacker = p_ships.attackers[attackersCounter];
            /* No need to copy the victimsIndex property as we don't use it in the cleanup. */
            attackers.push({
                hostile : attacker.hostile,
                ship : attacker.ship,
                shipKey : attacker.shipKey,
                /* Empty array to copy the victims into. */
                victims : []
            });

            /* Cache the length. */
            victimsLength = attacker.victims.length;

            /* Create a copy of the victims array for the attacker. The index should follow the original. */
            for (victimsCounter = 0; victimsCounter < victimsLength; victimsCounter += 1) {
                /* Iterate over each victim. */
                victim = attacker.victims[victimsCounter];
                /* No need to copy the attackCounter and missCounter properties as we don't use them in the cleanup. */
                attackers[attackersCounter].victims.push({
                    attackTime : victim.attackTime,
                    missTime : victim.missTime,
                    ship : victim.ship,
                    shipKey : victim.shipKey
                });
            }
        }

        mainScript = p_ships.mainScript;

        /* attackersLength already set-up. */
        for (attackersCounter = 0; attackersCounter < attackersLength; attackersCounter += 1) {
            /* Iterate over each attacker. */
            attacker = attackers[attackersCounter];
            attackerKey = attacker.shipKey;

            if (p_ships.logging && p_ships.logExtra) {
                logMsg += "\n* attacker#" + attackerKey;

                if (attacker.ship.displayName !== undefined) {
                    logMsg += " (" + attacker.ship.displayName + ")";
                }

                logMsg += ", " + attacker.victims.length + " victims";
            }

            if (!attacker.ship.isValid) {
                if (p_ships.logging && p_ships.logExtra) {
                    logMsg += ", removing (dead/not valid)";
                }

                /* Remove the invalid attacker from the real attackers array. */
                this.$removeAttacker(attackerKey);
            } else if (attacker.ship.hasRole("tharglet") && attacker.ship.isCargo) {
                if (p_ships.logging && p_ships.logExtra) {
                    logMsg += ", removing (inactive tharglet)";
                }

                /* Remove the inactive tharglet from the real attackers array. */
                this.$removeAttacker(attackerKey);
            } else if (attacker.ship.isDerelict) {
                if (p_ships.logging && p_ships.logExtra) {
                    logMsg += ", removing (derelict)";
                }

                /* Remove the derelict attacker from the real attackers array. */
                this.$removeAttacker(attackerKey);
            } else if (attacker.ship.isPlayer &&
                mainScript.$playerVar.reputation[galaxyNumber] >= mainScript.$reputationHelper) {
                if (p_ships.logging && p_ships.logExtra) {
                    logMsg += ", removing (player turned from the dark side)";
                }

                /* Remove the player from the real attackers array. */
                this.$removeAttacker(attackerKey);
            } else if (attacker.victims.length) {
                if (p_ships.logging && p_ships.logExtra) {
                    logMsg += ", checking victims...";
                }

                /* Cache the length. */
                victimsLength = attacker.victims.length;

                for (victimsCounter = 0; victimsCounter < victimsLength; victimsCounter += 1) {
                    /* Iterate over each victim. */
                    victim = attacker.victims[victimsCounter];
                    victimKey = victim.shipKey;

                    if (p_ships.logging && p_ships.logExtra) {
                        logMsg += "\n** victim#" + victimKey;

                        if (victim.ship.displayName !== undefined) {
                            logMsg += " (" + victim.ship.name + ": " + victim.ship.displayName + ")";
                        }
                    }

                    if (!victim.ship.isValid) {
                        if (p_ships.logging && p_ships.logExtra) {
                            logMsg += ", removing (dead/not valid)";
                        }

                        /* Remove the invalid victim from the real victims array. */
                        this.$removeVictimFromAttacker(victimKey, attackerKey);
                    } else if (victim.ship.isDerelict) {
                        if (p_ships.logging && p_ships.logExtra) {
                            logMsg += ", removing (derelict)";
                        }

                        /* Remove the derelict victim from the real victims array. */
                        this.$removeVictimFromAttacker(victimKey, attackerKey);
                    } else if (!attacker.hostile &&
                        (clock.seconds - victim.attackTime > 5 || clock.seconds - victim.missTime > 5)) {
                        if (p_ships.logging && p_ships.logExtra) {
                            logMsg += ", removing (no longer attacked)";
                        }

                        /* More than 5 seconds have passed since the first attack.
                         * Remove the old victim from the real victims array.
                         */
                        this.$removeVictimFromAttacker(victimKey, attackerKey);
                    }
                }

                if (p_ships.logging && p_ships.logExtra) {
                    logMsg += "\n" + "$attackersCleanupTimer::Finished checking victims.";
                }
            }

            if (!attacker.hostile) {
                /* Find the real index of the attacker. May have changed. */
                attackerIndex = p_ships.attackersIndex.indexOf(attackerKey);

                if (attackerIndex !== -1 && !p_ships.attackers[attackerIndex].victims.length) {
                    if (p_ships.logging && p_ships.logExtra) {
                        logMsg += "\n** attacker#" + attackerKey + " (" + attacker.ship.displayName + ")" +
                        ", removing (no victims)";
                    }

                    /* Has no victims so no longer an attacker.
                     * Remove the attacker from the real attackers array.
                     */
                    this.$removeAttacker(attackerKey);
                }
            }
        }

        if (p_ships.logging && p_ships.logExtra) {
            logMsg += "\n" + "$attackersCleanupTimer::Finished checking attackers.";
            log(this.name, logMsg);
        }

        if (!p_ships.attackers.length) {
            /* No attackers, stop and remove this timer. */
            this.$stopAttackersTimer();

            /* Reset the attackers and index array. Pointless, but done for potential error avoidance. */
            p_ships.attackersIndex = [];
            p_ships.attackers = [];
        }
    };

    /* NAME
     *   $makeHostile
     *
     * FUNCTION
     *   Makes the attacking ship hostile to the victim's group.
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

        if (this.$friendList.indexOf(attacker.entityPersonality) !== -1) {
            /* The attacker is a member of Jaguar Company. */
            return;
        }

        if (this.$isHostile(attacker)) {
            /* Already hostile. */
            return;
        }

        if (p_ships.logging && p_ships.logExtra) {
            log(this.name, "$makeHostile::Make hostile:" +
                " attacker#" + attacker.entityPersonality + " (" + attacker.displayName + ")" +
                ", bounty: " + attacker.bounty +
                ", victim#" + victim.entityPersonality + " (" + victim.name + ": " + victim.displayName + ")");
        }

        /* Add the attacker (if needed) and get the attacker and victim index. */
        index = this.$addAttacker(attacker, victim);

        if (index !== -1) {
            /* Set the hostile property. */
            p_ships.attackers[index.attackerIndex].hostile = true;
        }
    };

    /* NAME
     *   $isHostile
     *
     * FUNCTION
     *   Check if the ship is hostile.
     *
     * INPUT
     *   ship - entity of the ship to check
     *
     * RESULT
     *   result - return true if ship is hostile, otherwise return false
     */
    this.$isHostile = function (ship) {
        var index,
        attackerIndex,
        counter,
        length;

        if (!ship || !ship.isValid || this.$friendList.indexOf(ship.entityPersonality) !== -1) {
            /* The ship is no longer valid or is a member of Jaguar Company. */
            return false;
        }

        if (ship.isThargoid) {
            /* Cache the length. */
            length = ship.escortGroup.length;

            for (counter = 0; counter < length; counter += 1) {
                /* Add the thargoid and tharglets (if needed) and get the attacker index. */
                index = this.$addAttacker(ship.escortGroup[counter]);

                if (index !== -1) {
                    /* Set the hostile property. */
                    p_ships.attackers[index.attackerIndex].hostile = true;
                }
            }

            /* Always true for Thargoids/tharglets. */
            return true;
        }

        if (!p_ships.attackers.length) {
            /* No attackers. */
            return false;
        }

        /* Find the index of the ship in the attackers index. */
        attackerIndex = p_ships.attackersIndex.indexOf(ship.entityPersonality);

        if (attackerIndex === -1) {
            /* No such attacker. */
            return false;
        }

        /* Return hostile status. */
        return p_ships.attackers[attackerIndex].hostile;
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
            p_ships.attackers[index.attackerIndex].victims[index.victimIndex].attackCounter += 1;
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

        if (!p_ships.attackers.length) {
            /* No attackers. */
            return -1;
        }

        /* Find the index of the attacker. */
        attackerIndex = p_ships.attackersIndex.indexOf(attacker.entityPersonality);

        if (attackerIndex === -1 || !p_ships.attackers[attackerIndex].victims.length) {
            /* No such attacker or victims. */
            return -1;
        }

        /* Find the index of the victim. */
        victimIndex = p_ships.attackers[attackerIndex].victimsIndex.indexOf(victim.entityPersonality);

        if (victimIndex === -1) {
            /* No such victim. */
            return -1;
        }

        /* Return attack counter. */
        return p_ships.attackers[attackerIndex].victims[victimIndex].attackCounter;
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

        if (!p_ships.attackers.length) {
            /* No attackers. */
            return;
        }

        /* Find the index of the attacker. */
        attackerIndex = p_ships.attackersIndex.indexOf(attacker.entityPersonality);

        if (attackerIndex === -1 || !p_ships.attackers[attackerIndex].victims.length) {
            /* No such attacker or victims. */
            return;
        }

        /* Find the index of the victim. */
        victimIndex = p_ships.attackers[attackerIndex].victimsIndex.indexOf(victim.entityPersonality);

        if (victimIndex === -1) {
            /* No such victim. */
            return;
        }

        /* Reset the attack counter to 1. */
        p_ships.attackers[attackerIndex].victims[victimIndex].attackCounter = 1;
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

        if (!p_ships.attackers.length) {
            /* No attackers. */
            return clock.seconds;
        }

        /* Find the index of the attacker. */
        attackerIndex = p_ships.attackersIndex.indexOf(attacker.entityPersonality);

        if (attackerIndex === -1 || !p_ships.attackers[attackerIndex].victims.length) {
            /* No such attacker or victims. */
            return clock.seconds;
        }

        /* Find the index of the victim. */
        victimIndex = p_ships.attackers[attackerIndex].victimsIndex.indexOf(victim.entityPersonality);

        if (victimIndex === -1) {
            /* No such victim. */
            return clock.seconds;
        }

        /* Return attack time. */
        return p_ships.attackers[attackerIndex].victims[victimIndex].attackTime;
    };

    /* NAME
     *   $increaseMissCounter
     *
     * FUNCTION
     *   Increase the ship's miss counter for the victim.
     *
     * INPUTS
     *   attacker - entity of the attacker
     *   victim - entity of the attacked ship
     */
    this.$increaseMissCounter = function (attacker, victim) {
        var index;

        if (!attacker || !attacker.isValid || !victim || !victim.isValid) {
            /* The attacker and/or victim is no longer valid. */
            return;
        }

        /* Setup the attacker and victim. */
        index = this.$addAttacker(attacker, victim);

        if (index !== -1) {
            /* Increase the miss counter for the victim. */
            p_ships.attackers[index.attackerIndex].victims[index.victimIndex].missCounter += 1;
        }
    };

    /* NAME
     *   $missCounter
     *
     * FUNCTION
     *   Return the miss counter for the victim.
     *
     * INPUTS
     *   attacker - entity of the attacker
     *   victim - entity of the attacked ship
     *
     * RESULT
     *   result - return missCounter if available, otherwise return -1
     */
    this.$missCounter = function (attacker, victim) {
        var attackerIndex,
        victimIndex;

        if (!attacker || !attacker.isValid || !victim || !victim.isValid) {
            /* The attacker and/or victim is no longer valid. */
            return -1;
        }

        if (!p_ships.attackers.length) {
            /* No attackers. */
            return -1;
        }

        /* Find the index of the attacker. */
        attackerIndex = p_ships.attackersIndex.indexOf(attacker.entityPersonality);

        if (attackerIndex === -1 || !p_ships.attackers[attackerIndex].victims.length) {
            /* No such attacker or victims. */
            return -1;
        }

        /* Find the index of the victim. */
        victimIndex = p_ships.attackers[attackerIndex].victimsIndex.indexOf(victim.entityPersonality);

        if (victimIndex === -1) {
            /* No such victim. */
            return -1;
        }

        /* Return miss counter. */
        return p_ships.attackers[attackerIndex].victims[victimIndex].missCounter;
    };

    /* NAME
     *   $resetMissCounter
     *
     * FUNCTION
     *   Reset the miss counter to 1.
     *
     * INPUTS
     *   attacker - entity of the attacker
     *   victim - entity of the attacked ship
     */
    this.$resetMissCounter = function (attacker, victim) {
        var attackerIndex,
        victimIndex;

        if (!attacker || !attacker.isValid || !victim || !victim.isValid) {
            /* The attacker and/or victim is no longer valid. */
            return;
        }

        if (!p_ships.attackers.length) {
            /* No attackers. */
            return;
        }

        /* Find the index of the attacker. */
        attackerIndex = p_ships.attackersIndex.indexOf(attacker.entityPersonality);

        if (attackerIndex === -1 || !p_ships.attackers[attackerIndex].victims.length) {
            /* No such attacker or victims. */
            return;
        }

        /* Find the index of the victim. */
        victimIndex = p_ships.attackers[attackerIndex].victimsIndex.indexOf(victim.entityPersonality);

        if (victimIndex === -1) {
            /* No such victim. */
            return;
        }

        /* Reset the miss counter to 1. */
        p_ships.attackers[attackerIndex].victims[victimIndex].missCounter = 1;
    };

    /* NAME
     *   $missTime
     *
     * FUNCTION
     *   Return the miss time for the victim or 'clock.seconds' if not available.
     *
     * INPUTS
     *   attacker - entity of the attacker
     *   victim - entity of the attacked ship
     *
     * RESULT
     *   result - return missTime if available, otherwise return 'clock.seconds'
     */
    this.$missTime = function (attacker, victim) {
        var attackerIndex,
        victimIndex;

        if (!attacker || !attacker.isValid || !victim || !victim.isValid) {
            /* The attacker and/or victim is no longer valid. */
            return clock.seconds;
        }

        if (!p_ships.attackers.length) {
            /* No attackers. */
            return clock.seconds;
        }

        /* Find the index of the attacker. */
        attackerIndex = p_ships.attackersIndex.indexOf(attacker.entityPersonality);

        if (attackerIndex === -1 || !p_ships.attackers[attackerIndex].victims.length) {
            /* No such attacker or victims. */
            return clock.seconds;
        }

        /* Find the index of the victim. */
        victimIndex = p_ships.attackers[attackerIndex].victimsIndex.indexOf(victim.entityPersonality);

        if (victimIndex === -1) {
            /* No such victim. */
            return clock.seconds;
        }

        /* Return miss time. */
        return p_ships.attackers[attackerIndex].victims[victimIndex].missTime;
    };

    /* New ship script event handler hooks. */

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
                        p_ships.mainScript.$playerVar.attacker = true;
                        /* Clear the reputation of the player. */
                        p_ships.mainScript.$playerVar.reputation[galaxyNumber] = 0;
                    }
                }
            }

            if ((victim.isPiloted || victim.isStation) && Math.random() > p_ships.messageProbability) {
                if (victim.$pilotName) {
                    /* Get the victims's name. */
                    pilotName = victim.$pilotName;
                } else {
                    /* Use displayName as the name of the victim. */
                    pilotName = victim.name + ": " + victim.displayName;
                }

                if (player.ship && player.ship.isValid &&
                    victim.position.distanceTo(player.ship.position) < victim.scannerRange) {
                    /* Death message. */
                    player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_death]"));
                }
            }
        }

        if (p_ships.logging && p_ships.logExtra) {
            log(this.name,
                "$shipDied::" +
                "ship#" + victim.entityPersonality + " (" + victim.name + ": " + victim.displayName + ")" +
                " was destroyed by " + destroyedBy +
                ", reason: " + why);
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
        piloted,
        pilotName,
        psInRange;

        if (!attacker || !attacker.isValid ||
            !victim || !victim.isValid ||
            victim.isDerelict) {
            /* The attacker is no longer valid
             * or the victim is no longer valid
             * or the victim is a derelict
             */
            return;
        }

        piloted = (victim.isPiloted || victim.isStation);
        psInRange = (player.ship && player.ship.isValid &&
            victim.position.distanceTo(player.ship.position) < victim.scannerRange);

        if (victim.$pilotName) {
            /* Get the victims's name. */
            pilotName = victim.$pilotName;
        } else {
            /* Use displayName as the name of the victim. */
            pilotName = victim.name + ": " + victim.displayName;
        }

        /* Check if the attacker is a friend of the victim. */
        if (this.$friendList.indexOf(attacker.entityPersonality) !== -1) {
            if (piloted && Math.random() > p_ships.messageProbability && psInRange) {
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
            if (piloted && Math.random() > p_ships.messageProbability) {
                /* Show hostile message. */
                if (attacker.isPlayer) {
                    /* Player hostile message. */
                    player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_player_hostile_fire]"));
                } else if (psInRange) {
                    /* Other ship hostile message. */
                    player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_hostile_fire]"));
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
                        p_ships.mainScript.$playerVar.reputation[galaxyNumber] -= 1;

                        if (piloted) {
                            /* Player warning. */
                            player.consoleMessage(pilotName + ": " +
                                expandDescription("[jaguar_company_player_friendly_fire]"));
                        }
                    } else if (piloted && psInRange) {
                        /* Other ship warning. */
                        player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_friendly_fire]"));
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
            p_ships.mainScript.$playerVar.attacker = true;
            /* Clear the reputation of the player. */
            p_ships.mainScript.$playerVar.reputation[galaxyNumber] = 0;

            if (piloted) {
                /* Player hostile message. */
                player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_player_hostile_fire]"));
            }
        } else if (piloted && psInRange) {
            /* Other ship hostile message. */
            player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_hostile_fire]"));
        }

        /* Send back a custom AI message. */
        victim.reactToAIMessage("HOSTILE_FIRE");
    };

    /* NAME
     *   $shipIsBeingAttackedUnsuccessfully
     *
     * FUNCTION
     *   Oolite v1.77 and newer.
     *
     *   A ship is being unsuccessfully attacked.
     *
     *   The AI will send an ATTACKER_MISSED message to this ship.
     *   Since we check for occurences of "friendly fire" we can not use or respond to that message,
     *   so we send out a new message of HOSTILE_FIRE if it really is an attack.
     *
     *   Not to be confused with the world script event function 'shipBeingAttackedUnsuccessfully',
     *   although it should be called from the ship script event function 'shipBeingAttackedUnsuccessfully'.
     *
     * INPUTS
     *   victim - caller ship
     *   attacker - entity of the unsuccessful attacker
     */
    this.$shipIsBeingAttackedUnsuccessfully = function (victim, attacker) {
        var missCounter,
        piloted,
        pilotName,
        psInRange;

        if (!attacker || !attacker.isValid ||
            !victim || !victim.isValid ||
            victim.isDerelict) {
            /* The attacker is no longer valid
             * or the victim is no longer valid
             * or the victim is a derelict
             */
            return;
        }

        /* Check if the attacker is a friend of the victim. */
        if (this.$friendList.indexOf(attacker.entityPersonality) !== -1) {
            /* Tell the attacker that we are a friend. */
            attacker.reactToAIMessage("FRIENDLY_FIRE");

            return;
        }

        /* Setup the attacker and victim if needed and increase the miss counter. */
        this.$increaseMissCounter(attacker, victim);

        if (this.$isHostile(attacker)) {
            /* Already been marked as hostile. Treat it as though the attacker hit. */
            victim.reactToAIMessage("HOSTILE_FIRE");

            return;
        }

        /* Thargoids/tharglets and pirates don't get warnings. */
        if (!attacker.isThargoid && !attacker.isPirate) {
            if (clock.seconds - this.$missTime(attacker, victim) > 5) {
                /* More than 5 seconds since the last "friendly fire" miss. */
                this.$resetMissCounter(attacker, victim);
            }

            missCounter = this.$missCounter(attacker, victim);

            if (missCounter === -1) {
                /* Not an attacker or there are no victims. */
                return;
            }

            if (missCounter < 5) {
                /* We've only missed this ship less than 5 times. Assume ineptitude. */
                return;
            }
        }

        /* Everybody has had all the chances they are going to get once we have reached this point.
         * This section is only executed once. Hostiles are caught above after this.
         */

        /* Make the attacker a hostile for future checking. */
        this.$makeHostile(attacker, victim);

        piloted = (victim.isPiloted || victim.isStation);
        psInRange = (player.ship && player.ship.isValid &&
            victim.position.distanceTo(player.ship.position) < victim.scannerRange);

        if (victim.$pilotName) {
            /* Get the victims's name. */
            pilotName = victim.$pilotName;
        } else {
            /* Use displayName as the name of the victim. */
            pilotName = victim.name + ": " + victim.displayName;
        }

        if (attacker.isPlayer) {
            /* Remember the player, even if they jump system. */
            p_ships.mainScript.$playerVar.attacker = true;
            /* Clear the reputation of the player. */
            p_ships.mainScript.$playerVar.reputation[galaxyNumber] = 0;

            if (piloted) {
                /* Player hostile message. */
                player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_player_hostile_fire]"));
            }
        } else if (piloted && psInRange) {
            /* Other ship hostile message. */
            player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_hostile_fire]"));
        }

        /* Send back a custom AI message. */
        victim.reactToAIMessage("HOSTILE_FIRE");
    };

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
        var piloted,
        pilotName;

        if (!attacker || !attacker.isValid ||
            !victim || !victim.isValid ||
            victim.isDerelict) {
            /* The attacker is no longer valid
             * or the victim is no longer valid
             * or the victim is a derelict
             */
            return;
        }

        /* Setup the attacker and victim if needed and increase the attack counter. */
        this.$increaseAttackCounter(attacker, victim);
        /* Make the attacker a hostile for future checking. */
        this.$makeHostile(attacker, victim);

        piloted = (victim.isPiloted || victim.isStation);

        if (victim.$pilotName) {
            /* Get the victims's name. */
            pilotName = victim.$pilotName;
        } else {
            /* Use displayName as the name of the victim. */
            pilotName = victim.name + ": " + victim.displayName;
        }

        if (attacker.isPlayer) {
            /* Remember the player, even if they jump system. */
            p_ships.mainScript.$playerVar.attacker = true;
            /* Clear the reputation of the player. */
            p_ships.mainScript.$playerVar.reputation[galaxyNumber] = 0;

            if (piloted) {
                /* Player hostile message. */
                player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_player_hostile_fire]"));
            }
        } else if (piloted && player.ship && player.ship.isValid &&
            victim.position.distanceTo(player.ship.position) < victim.scannerRange) {
            /* Other ship hostile message. */
            player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_hostile_fire]"));
        }
    };

    /* NAME
     *   $shipTakingDamage
     *
     * FUNCTION
     *   Taking damage. Check attacker and what type.
     *
     *   Not to be confused with the world script event function 'shipTakingDamage',
     *   although it should be called from the ship script event function 'shipTakingDamage'.
     *
     * INPUTS
     *   victim - entity that is being damaged
     *   amount - amount of damage
     *   attacker - entity that caused the damage
     *   type - type of damage as a string
     */
    this.$shipTakingDamage = function (victim, amount, attacker, type) {
        if (attacker && attacker.isValid && attacker.isShip && type === "scrape damage") {
            /* Make sure it is a ship dealing scrape damage. */
            if (this.$friendList.indexOf(attacker.entityPersonality) !== -1) {
                /* Cancel damage from collision with Jaguar Company ships. */
                victim.energy += amount;
                /* Target the ship we are colliding with. */
                victim.target = attacker;

                if (victim.AI === "jaguar_company_interceptAI.plist") {
                    /* Force an exit of the intercept AI. */
                    victim.lightsActive = false;
                    victim.exitAI();
                }

                /* Move away from the ship we are colliding with. */
                victim.reactToAIMessage("JAGUAR_COMPANY_TAKING_DAMAGE");
            }
        }
    };

    /* Internal AI functions. Called by ship script. */

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
            if (!entity.isValid || entity.isCloaked || entity.isDerelict) {
                /* Ignore all entities that have one of these conditions:
                 * 1) not valid
                 * 2) cloaked
                 * 3) is a derelict
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
            if (!entity.isValid || entity.isCloaked || entity.isDerelict) {
                /* Ignore all entities that have one of these conditions:
                 * 1) not valid
                 * 2) cloaked
                 * 3) is a derelict
                 */
                return false;
            }

            if (this.$isHostile(entity)) {
                /* The entity is a previous hostile for the caller ship. */
                return true;
            }

            if (entity.isPlayer && p_ships.mainScript.$playerVar.attacker) {
                /* Player has attacked us in the past. */
                return true;
            }

            if (p_ships.mainScript.$jaguarCompanyBase && p_ships.mainScript.$jaguarCompanyBase.isValid &&
                entity.position.distanceTo(p_ships.mainScript.$jaguarCompanyBase.position) < 30000) {
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

            if ((callerShip.isPiloted || callerShip.isStation) && Math.random() > p_ships.messageProbability) {
                if (callerShip.$pilotName) {
                    /* Get the callerShip's name. */
                    pilotName = callerShip.$pilotName;
                } else {
                    /* Use displayName as the name of the callerShip. */
                    pilotName = callerShip.name + ": " + callerShip.displayName;
                }

                /* Show hostile message. */
                if (target.isPlayer) {
                    /* Player hostile message. */
                    player.consoleMessage(pilotName + ": " + expandDescription("[jaguar_company_player_hostile_fire]"));
                } else {
                    if (player.ship && player.ship.isValid &&
                        callerShip.position.distanceTo(player.ship.position) < callerShip.scannerRange) {
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
}.bind(this)());
