/*jslint indent: 4, maxlen: 120, maxerr: 50, white: true, es5: true, undef: true, bitwise: true, regexp: true,
newcap: true */
/*jshint es5: true, undef: true, bitwise: true, eqnull: true, noempty: true, eqeqeq: true, boss: true, loopfunc: true,
laxbreak: true, strict: true, curly: true */
/*global system, log, worldScripts, missionVariables, Timer, player */

/* Jaguar Company Base
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
 * Ship related functions for the base AI.
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "jaguar_company_base.js";
    this.author = "Tricky";
    this.copyright = "© 2012 Richard Thomas Harrison (Tricky)";
    this.license = "CC BY-NC-SA 3.0";
    this.description = "Ship script for the Jaguar Company Base.";
    this.version = "1.2";

    /* Private variable. */
    var p_base = {};

    /* Ship event callbacks. */

    /* Initialise various variables on ship birth. */
    this.shipSpawned = function () {
        var num,
        vector,
        cross,
        angle;

        /* No longer needed after setting up. */
        delete this.shipSpawned;

        /* Initialise the p_base variable object.
         * Encapsulates all private global data.
         */
        p_base = {
            /* Cache the world scripts. */
            mainScript : worldScripts["Jaguar Company"],
            attackersScript : worldScripts["Jaguar Company Attackers"],
            /* Local copies of the logging variables. */
            logging : worldScripts["Jaguar Company"].$logging,
            logExtra : worldScripts["Jaguar Company"].$logExtra
        };

        /* Register this base as a friendly. */
        p_base.attackersScript.$addFriendly(this.ship);

        if (p_base.mainScript.$swapBase) {
            /* Swapping base roles. */

            /* How many patrol ships have launched. */
            p_base.patrolShipsLaunched = system.shipsWithPrimaryRole("jaguar_company_patrol").length;
            /* Has the miner launched. */
            p_base.minerLaunched = (system.shipsWithRole("jaguar_company_miner").length !== 0);
            /* Base fully spawned and set-up so we can reset this. */
            p_base.mainScript.$swapBase = false;
        } else {
            /* Get a unique name for the base.
             * Maximum length (not including prefix) for the base's name is 16 characters.
             * Fits perfectly into the mission screen title header.
             */
            this.ship.displayName = p_base.mainScript.$uniqueShipName(this.ship.name, 16);

            if (!system.isInterstellarSpace) {
                /* Point the docking bay in the general direction of the sun. */
                vector = system.sun.position.subtract(this.ship.position).direction();
            } else {
                /* Point the docking bay in the general direction of the fake witchpoint. */
                vector = p_base.mainScript.$witchpointBuoy.position.subtract(this.ship.position).direction();
            }

            /* Angle to the vector from current heading + about 1/8th turn. */
            angle = this.ship.heading.angleTo(vector) + 0.707;
            /* Cross vector for rotate. */
            cross = this.ship.heading.cross(vector).direction();
            /* Rotate the base by angle. */
            this.ship.orientation = this.ship.orientation.rotate(cross, -angle);

            /* Add some clutter within 20km around the base.
             * 20 to 27 asteroids and 20 to 27 boulders
             * - gives the miners something to do. (Also apparently any Thargoids!)
             */
            num = Math.floor(system.scrambledPseudoRandomNumber(p_base.mainScript.$salt) * 8) + 20;
            system.addShips("jaguar_company_asteroid", num, this.ship.position, 20000);
            num = Math.floor(system.scrambledPseudoRandomNumber(p_base.mainScript.$salt / 2) * 8) + 20;
            system.addShips("jaguar_company_boulder", num, this.ship.position, 20000);

            /* Reset the launch status of the buoy. */
            p_base.mainScript.$buoyLaunched = false;
            /* Miner has not launched. */
            p_base.minerLaunched = false;

            if (!system.shipsWithPrimaryRole("jaguar_company_patrol").length) {
                /* Reset how many Jaguar Company patrol ships are in system. */
                p_base.mainScript.$numPatrolShips = 0;
                /* No patrol ships have launched. */
                p_base.patrolShipsLaunched = 0;
                /* Reset the fully launched status of the patrol ships. */
                p_base.mainScript.$patrolShipsFullyLaunched = false;
            } else {
                /* Set how many Jaguar Company patrol ships are in system. */
                p_base.mainScript.$numPatrolShips = system.shipsWithPrimaryRole("jaguar_company_patrol").length;
                /* All patrol ships have launched. */
                p_base.patrolShipsLaunched = p_base.mainScript.$numPatrolShips;
                /* Set the fully launched status of the patrol ships. */
                p_base.mainScript.$patrolShipsFullyLaunched = true;
            }
        }

        /* Start up the timer to do some house keeping. */
        this.$baseTimerReference = new Timer(this, this.$baseTimer, 5, 5);
    };

    /* Base was destroyed.
     *
     * INPUTS
     *   attacker - entity that caused the death.
     *   why - cause as a string.
     */
    this.shipDied = function (attacker, why) {
        var mainScript,
        base = this.ship,
        basePosition,
        witchpointBuoy,
        mainPlanet,
        mPovUp,
        ratio,
        entities,
        salt,
        ok;

        /* Stop warnings about anonymous local functions within loops.
         * Used by 'system.filteredEntities'. Returns true for any valid entity.
         */
        function $validEntity(entity) {
            return (entity && entity.isValid);
        }

        if (base.name === base.displayName) {
            /* Died whilst being created. The base will not have had it's display name set up. */
            mainScript = worldScripts["Jaguar Company"];
            witchpointBuoy = mainScript.$witchpointBuoy;
            mainPlanet = system.mainPlanet;
            salt = mainScript.$salt;
            ok = false;

            /* Shift the base position if it is too close to any entity.
             * If we happen to pick a new position that would collide with something already in the system
             * then the loop will pick another position and so on.
             * In practice the loop will only happen once as space is BIG.
             */
            while (!ok) {
                /* Increase the salt. */
                salt += 1;
                /* Place the base 0.1 to 0.3 units along the witchpoint -> main planet route. */
                ratio = 0.1 + (system.scrambledPseudoRandomNumber(salt) * 0.2);
                basePosition = Vector3D.interpolate(witchpointBuoy.position, mainPlanet.position, ratio);
                /* Move it 4 to 6 times scanning range upwards with respect to the main planet's surface. */
                ratio = (4 + (system.scrambledPseudoRandomNumber(salt) * 2)) * 25600;
                mPovUp = mainPlanet.orientation.vectorUp();
                base.position = basePosition.add(mPovUp.multiply(mainPlanet.radius + ratio)); 
                /* Search for any entity intersecting this base within scanner range. */
                entities = system.filteredEntities(this, $validEntity, base, 25600);
                /* An empty array is what we are looking for. */
                ok = !entities.length;
            }

            if (mainScript.$logging && mainScript.$logExtra) {
                log(this.name, "shipDied::\n" +
                    "Base respawning: " + why + " whilst being created.\n" +
                    "* WP-Sun dot WP-MP: " +
                    (witchpointBuoy.position.subtract(system.sun.position).direction()
                        .dot(witchpointBuoy.position.subtract(mainPlanet.position).direction())) + "\n" +
                    "* Moved: " + (salt - mainScript.$salt) + " times.");
            }

            /* Spawn a new base. Update the public variable in the main script. */
            mainScript.$jaguarCompanyBase = base.spawnOne("jaguar_company_base");

            return;
        }

        /* Call common code used by all of Jaguar Company. */
        worldScripts["Jaguar Company Attackers"].$shipDied(this.ship, attacker, why);
    };

    /* Base was removed by script. */
    this.shipRemoved = function (suppressDeathEvent) {
        if (suppressDeathEvent) {
            return;
        }

        /* Set this as no more ships will be launched. "Obvious cat is obvious!" */
        worldScripts["Jaguar Company"].$patrolShipsFullyLaunched = true;
    };

    /* The base has just become invalid. */
    this.entityDestroyed = function () {
        /* Set this as no more ships will be launched. "Obvious cat is obvious!" */
        worldScripts["Jaguar Company"].$patrolShipsFullyLaunched = true;

        /* Stop and remove the timer. */
        if (this.$baseTimerReference) {
            if (this.$baseTimerReference.isRunning) {
                this.$baseTimerReference.stop();
            }

            delete this.$baseTimerReference;
        }
    };

    /* Someone is pinging us with their laser.
     *
     * INPUTS
     *   attacker - entity of the ship that attacked.
     */
    this.shipBeingAttacked = function (attacker) {
        /* Call common code used by all of Jaguar Company. */
        p_base.attackersScript.$shipIsBeingAttacked(this.ship, attacker);
    };

    /* Someone has fired a missile at us.
     *
     * INPUTS
     *   missile - missile entity.
     *   attacker - entity of the ship that attacked.
     */
    this.shipAttackedWithMissile = function (missile, attacker) {
        /* Call common code used by all of Jaguar Company. */
        p_base.attackersScript.$shipIsBeingAttackedWithMissile(this.ship, attacker);
    };

    /* We killed someone.
     *
     * INPUT
     *   target - entity of the destroyed target.
     */
    this.shipTargetDestroyed = function (target) {
        if (target.primaryRole === "constrictor" &&
            missionVariables.conhunt &&
            missionVariables.conhunt === "STAGE_1") {
            /* Just in case the base kills the constrictor, let's not break the mission for the player... */
            missionVariables.conhunt = "CONSTRICTOR_DESTROYED";
            player.score += 1;
            player.credits += target.bounty;
            player.consoleMessage(this.ship.displayName + " assisted in the death of " + target.name, 3);
            player.consoleMessage(
                this.ship.displayName + ": Commander " + player.name +
                ", you have the kill and bounty of " + target.bounty + "₢.", 3);

            if (p_base.logging && p_base.logExtra) {
                log(this.name, "shipTargetDestroyed::" +
                    this.ship.displayName + " killed - " + target.name + " : " + target.bounty);
            }
        }
    };

    /* A ship has docked.
     *
     * INPUT
     *   whom - entity of the docked ship.
     */
    this.otherShipDocked = function (whom) {
        if (whom.hasRole("jaguar_company_patrol")) {
            /* Decrease the number of patrol ships that are launched. */
            p_base.patrolShipsLaunched -= 1;
        } else if (whom.hasRole("jaguar_company_miner")) {
            /* Reset the launch status of the miner. */
            p_base.mainScript.$minerLaunched = false;
        }
    };

    /* A ship has launched.
     *
     * INPUT
     *   whom - entity of the launched ship.
     */
    this.stationLaunchedShip = function (whom) {
        if (whom.hasRole("jaguar_company_patrol")) {
            if (p_base.patrolShipsLaunched === 1) {
                /* Initialise the route list with the default route. */
                p_base.mainScript.$initRoute();
            }

            if (whom.script.name !== "jaguar_company_patrol.js") {
                /* Remove the patrol ship. */
                whom.remove();
                /* Decrease the number of patrol ships that are launched. */
                p_base.patrolShipsLaunched -= 1;

                if (p_base.logging && p_base.logExtra) {
                    log(this.name, "Script sanity check - fixed a patrol ship.");
                }
            }

            if (p_base.patrolShipsLaunched !== p_base.mainScript.$maxPatrolShips) {
                /* Launch another patrol ship. */
                this.$launchJaguarCompanyPatrol();
            } else {
                /* All patrol ships are now fully launched. */
                p_base.mainScript.$patrolShipsFullyLaunched = true;
            }
        } else if (whom.hasRole("jaguar_company_tug")) {
            if (whom.script.name !== "jaguar_company_tug.js") {
                /* Remove the tug. */
                whom.remove();
                /* Reset the launch status of the buoy. */
                p_base.mainScript.$buoyLaunched = false;
                /* Launch another tug. */
                this.$launchJaguarCompanyTug();

                if (p_base.logging && p_base.logExtra) {
                    log(this.name, "Script sanity check - fixed the tug.");
                }
            }
        } else if (whom.hasRole("jaguar_company_miner")) {
            if (whom.script.name !== "jaguar_company_miner.js") {
                /* Remove the miner. */
                whom.remove();
                /* Reset the launch status of the miner. */
                p_base.mainScript.$minerLaunched = false;
                /* Launch another miner. */
                this.ship.launchShipWithRole("jaguar_company_miner");

                if (p_base.logging && p_base.logExtra) {
                    log(this.name, "Script sanity check - fixed the miner.");
                }
            }
        }
    };

    /* Timer callback. */

    /* Some OXP's dick around with the scanner colours. This will reset the base's scanner colour
     * back to the station default of solid green if the player has helped out in combat with Jaguar Company.
     *
     * Starts the launch sequence for the patrol ships if needed.
     *
     * Checks the buoy and launches a tug if there isn't one. Resets the scanner colour as per the base.
     * Swaps the buoy to 'no beacon' or 'beacon' dependent on the reputation mission variable.
     *
     * Called every 5 seconds.
     */
    this.$baseTimer = function () {
        var base = this.ship,
        position,
        orientation,
        buoy,
        newBuoy,
        newBuoyRole;

        /* Reset the base scanner colour. */
        base.scannerDisplayColor1 = null;
        base.scannerDisplayColor2 = null;

        if (!p_base.patrolShipsLaunched) {
            /* Start launching patrol ships. */
            this.$launchJaguarCompanyPatrol();
        }

        if (p_base.patrolShipsLaunched !== p_base.mainScript.$maxPatrolShips) {
            /* Reset the fully launched status of the patrol ships. */
            p_base.mainScript.$patrolShipsFullyLaunched = false;
        }

        buoy = p_base.mainScript.$buoy;

        if ((!buoy || !buoy.isValid) &&
            !p_base.mainScript.$buoyLaunched && p_base.mainScript.$patrolShipsFullyLaunched) {
            /* No buoys. Launch the tug to drop a buoy off. */
            this.$launchJaguarCompanyTug();

            return;
        }

        if (buoy && buoy.isValid) {
            /* Reset the buoy scanner colour. */
            buoy.scannerDisplayColor1 = null;
            buoy.scannerDisplayColor2 = null;

            if (missionVariables.jaguar_company_reputation < p_base.mainScript.$reputationHelper) {
                newBuoyRole = "jaguar_company_base_buoy_no_beacon";
            } else {
                newBuoyRole = "jaguar_company_base_buoy_beacon";
            }

            /* Check if the buoy already has the new role. */
            if (!buoy.hasRole(newBuoyRole)) {
                /* Copy some properties. */
                position = buoy.position;
                orientation = buoy.orientation;
                /* Create a new buoy. */
                newBuoy = buoy.spawnOne(newBuoyRole);
                /* Remove the origial buoy quietly: don't trigger 'shipDied' in the ship script. */
                buoy.remove(true);
                /* Setup the new buoy with the original properties. */
                newBuoy.position = position;
                newBuoy.orientation = orientation;
                /* Update the main script public variable. */
                p_base.mainScript.$buoy = newBuoy;
            }
        }
    };

    /* Launch a patrol ship. */
    this.$launchJaguarCompanyPatrol = function () {
        if (p_base.logging && p_base.logExtra) {
            log(this.name, "$launchJaguarCompanyPatrol::Launching patrol ship...");
        }

        p_base.patrolShipsLaunched += 1;
        this.ship.launchShipWithRole("jaguar_company_patrol");
    };

    /* Launch the tug to drag the buoy into position. */
    this.$launchJaguarCompanyTug = function () {
        if (p_base.mainScript.$patrolShipsFullyLaunched &&
            !p_base.mainScript.$buoyLaunched &&
            (!p_base.mainScript.$buoy || !p_base.mainScript.$buoy.isValid)) {
            /* Only one tug dragging a buoy at a time. Also no more than 1 buoy in system at a time.
             * Also don't launch until all patrol ships have launched.
             */
            p_base.mainScript.$buoyLaunched = true;
            this.ship.launchShipWithRole("jaguar_company_tug");

            if (p_base.logging && p_base.logExtra) {
                log(this.name, "$launchJaguarCompanyTug::Launching tug...");
            }
        }
    };

    /* AI functions. */

    /* Check if we need to launch a miner. Don't launch in interstellar space. */
    this.$launchShip = function () {
        if (!system.isInterstellarSpace &&
            Math.random() < 0.05 &&
            !p_base.minerLaunched &&
            p_base.mainScript.$patrolShipsFullyLaunched) {
            /* Only 1 miner at a time.
             * Also don't launch until all patrol ships have launched.
             */
            p_base.minerLaunched = true;
            this.ship.launchShipWithRole("jaguar_company_miner");

            if (p_base.logging && p_base.logExtra) {
                log(this.name, "$launchShip::Launching miner...");
            }
        }
    };

    /* Check for any previous attackers that have run away. */
    this.$scanForAttackers = function () {
        /* Call common code used by all of Jaguar Company. */
        p_base.attackersScript.$scanForAttackers(this.ship);
    };

    /* Checks the current target to make sure it is still valid. */
    this.$checkTargetIsValid = function () {
        /* Call common code used by all of Jaguar Company. */
        p_base.attackersScript.$checkTargetIsValid(this.ship);
    };

    /* This does something similar to the groupAttackTarget AI command. */
    this.$performJaguarCompanyAttackTarget = function () {
        /* Call common code used by all of Jaguar Company. */
        p_base.attackersScript.$performAttackTarget(this.ship);
    };
}).call(this);
