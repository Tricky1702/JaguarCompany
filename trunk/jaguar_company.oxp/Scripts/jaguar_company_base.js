/*jslint bitwise: true, es5: true, newcap: true, nomen: true, regexp: true, unparam: true, todo: true, white: true,
indent: 4, maxerr: 50, maxlen: 120 */
/*jshint boss: true, curly: true, eqeqeq: true, eqnull: true, es5: true, evil: true, forin: true, laxbreak: true,
loopfunc: true, noarg: true, noempty: true, strict: true, nonew: true, undef: true */
/*global Array, Math, Timer, Vector3D, galaxyNumber, log, system, worldScripts */

/* Jaguar Company Base
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
 * Ship related functions for the base AI.
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "jaguar_company_base.js";
    this.author = "Tricky";
    this.copyright = "© 2012-2013 Richard Thomas Harrison (Tricky)";
    this.license = "CC BY-NC-SA 3.0";
    this.description = "Ship script for the Jaguar Company Base.";
    this.version = "1.5";

    /* Private variable. */
    var p_base = {};

    /* Ship script event handlers. */

    /* NAME
     *   shipSpawned
     *
     * FUNCTION
     *   Initialise various variables on ship birth.
     */
    this.shipSpawned = function () {
        var num,
        vector,
        cross,
        angle;

        /* Initialise the p_base variable object.
         * Encapsulates all private global data.
         */
        p_base = {
            /* Cache the world scripts. */
            mainScript : worldScripts["Jaguar Company"],
            shipsScript : worldScripts["Jaguar Company Ships"],
            /* Local copies of the logging variables. */
            logging : worldScripts["Jaguar Company"].$logging,
            logExtra : worldScripts["Jaguar Company"].$logExtra,
            /* Maximum number of splinter ships around the base. */
            maxSplinterShips : 6
        };

        /* Tug object. */
        this.$tug = system.shipsWithPrimaryRole("jaguar_company_tug")[0];
        /* Buoy object. */
        this.$buoy = system.shipsWithRole("jaguar_company_base_buoy")[0];
        /* Miner object. */
        this.$miner = system.shipsWithPrimaryRole("jaguar_company_miner")[0];
        /* Reset the check flags. */
        this.$patrolShipsOK = false;
        this.$splinterShipsOK = false;
        this.$tugOK = false;
        this.$buoyOK = false;
        this.$minerOK = false;

        if (p_base.mainScript.$swapBase) {
            /* Swapping base roles. */

            /* Register this base as a friendly. */
            p_base.shipsScript.$addFriendly({
                ship : this.ship
            });
            /* How many splinter ships have launched. */
            p_base.numSplinterShips = system.shipsWithPrimaryRole("jaguar_company_ship_splinter").length;
            /* Have all splinter ships launched. */
            p_base.splinterShipsFullyLaunched = (p_base.numSplinterShips === p_base.maxSplinterShips);
            /* Has the miner launched. */
            p_base.minerLaunched = (this.$miner && this.$miner.isValid);
            /* Base fully spawned and set-up so we can reset this. */
            p_base.mainScript.$swapBase = false;
        } else {
            /* Register this base as a friendly. */
            p_base.shipsScript.$addFriendly({
                ship : this.ship,
                /* Get a unique name for the base.
                 * Maximum length for the base's name is 32 characters.
                 * Fits perfectly into the mission screen title header.
                 */
                shipName : p_base.mainScript.$uniqueShipName(true, 32)
            });

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
             * 20 to 27 asteroids and 10 to 17 boulders
             * - gives the miners something to do. (Also apparently any Thargoids!)
             */
            num = Math.floor(system.scrambledPseudoRandomNumber(p_base.mainScript.$salt) * 8) + 20;
            system.addShips("jaguar_company_asteroid", num, this.ship.position, 20000);
            num = Math.floor(system.scrambledPseudoRandomNumber(p_base.mainScript.$salt / 2) * 8) + 10;
            system.addShips("jaguar_company_boulder", num, this.ship.position, 20000);

            /* Reset the launch status of the buoy. */
            this.$buoyLaunched = false;
            /* Miner has not launched. */
            p_base.minerLaunched = false;
            /* No splinter ships have launched. */
            p_base.numSplinterShips = 0;

            if (!system.shipsWithPrimaryRole("jaguar_company_patrol").length) {
                /* No patrol ships have launched. */
                p_base.mainScript.$numPatrolShips = 0;
                /* Reset the fully launched status of the patrol ships. */
                p_base.mainScript.$patrolShipsFullyLaunched = false;
            }
        }

        /* Start up a timer to check ship script sanity. */
        this.$scriptSanityTimerReference = new Timer(this, this.$scriptSanityTimer, 5, 5);
        /* Start up a timer to do some house keeping. */
        this.$baseTimerReference = new Timer(this, this.$baseTimer, 5, 5);

        /* No longer needed after setting up. */
        delete this.shipSpawned;
    };

    /* NAME
     *   shipDied
     *
     * FUNCTION
     *   Base was destroyed.
     *   Called after the script installed by $addFriendly in jaguar_company_ships.js
     *
     * INPUTS
     *   attacker - entity that caused the death (not used)
     *   why - cause as a string
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

        /* NAME
         *   $validEntity
         *
         * FUNCTION
         *   Stop warnings about anonymous local functions within loops.
         *   Used by 'system.filteredEntities'. Returns true for any valid entity.
         *
         * INPUT
         *   entity - entity to check
         */
        function $validEntity(entity) {
            return (entity.isValid);
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
                /* Increase the salt. */
                salt += 1;
                /* Move it 6 to 8 times scanning range upwards with respect to the main planet's surface. */
                ratio = (6 + (system.scrambledPseudoRandomNumber(salt) * 2)) * 25600;
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
    };

    /* NAME
     *   shipRemoved
     *
     * FUNCTION
     *   Base was removed by script.
     *
     * INPUT
     *   suppressDeathEvent - boolean
     *     true - shipDied() will not be called
     *     false - shipDied() will be called
     */
    this.shipRemoved = function (suppressDeathEvent) {
        if (suppressDeathEvent) {
            return;
        }

        /* Set this as no more ships will be launched. "Obvious cat is obvious!" */
        worldScripts["Jaguar Company"].$patrolShipsFullyLaunched = true;
    };

    /* NAME
     *   entityDestroyed
     *
     * FUNCTION
     *   The base has just become invalid.
     */
    this.entityDestroyed = function () {
        /* Set this as no more ships will be launched. "Obvious cat is obvious!" */
        worldScripts["Jaguar Company"].$patrolShipsFullyLaunched = true;

        /* Stop and remove the timers. */
        if (this.$baseTimerReference) {
            if (this.$baseTimerReference.isRunning) {
                this.$baseTimerReference.stop();
            }

            this.$baseTimerReference = null;
        }

        if (this.$scriptSanityTimerReference) {
            if (this.$scriptSanityTimerReference.isRunning) {
                this.$scriptSanityTimerReference.stop();
            }

            this.$scriptSanityTimerReference = null;
        }
    };

    /* NAME
     *   otherShipDocked
     *
     * FUNCTION
     *   A ship has docked.
     *
     * INPUT
     *   whom - entity of the docked ship
     */
    this.otherShipDocked = function (whom) {
        if (whom.hasRole("jaguar_company_patrol")) {
            /* Reset the script check. */
            this.$patrolShipsOK = false;
        } else if (whom.hasRole("jaguar_company_ship_splinter")) {
            /* Decrease the number of splinter ships that are launched. */
            p_base.numSplinterShips -= 1;
            /* Reset the fully launched status of the splinter ships. */
            p_base.splinterShipsFullyLaunched = false;
            /* Reset the script check. */
            this.$splinterShipsOK = false;
            /* Launch another splinter ship. */
            this.$launchJaguarCompanySplinterShip();
        } else if (whom.hasRole("jaguar_company_tug")) {
            /* Reset the script check. */
            this.$tugOK = false;
        } else if (whom.hasRole("jaguar_company_miner")) {
            /* Reset the launch status of the miner. */
            p_base.minerLaunched = false;
            /* Reset the script check. */
            this.$minerOK = false;
        }
    };

    /* NAME
     *   stationLaunchedShip
     *
     * FUNCTION
     *   A ship has launched.
     *
     * INPUT
     *   whom - entity of the launched ship
     */
    this.stationLaunchedShip = function (whom) {
        if (whom.hasRole("jaguar_company_patrol")) {
            if (p_base.mainScript.$numPatrolShips === 1) {
                /* Initialise the route list with the default route. */
                p_base.mainScript.$initRoute();
            }

            if (p_base.mainScript.$numPatrolShips !== p_base.mainScript.$maxPatrolShips) {
                /* Launch another patrol ship. */
                this.$launchJaguarCompanyPatrol();
            } else {
                /* All patrol ships are now fully launched. */
                p_base.mainScript.$patrolShipsFullyLaunched = true;

                if (!p_base.splinterShipsFullyLaunched) {
                    /* Start launching splinter ships. */
                    this.$launchJaguarCompanySplinterShip();
                }
            }
        } else if (whom.hasRole("jaguar_company_ship_splinter")) {
            if (p_base.numSplinterShips !== p_base.maxSplinterShips) {
                /* Launch another splinter ship. */
                this.$launchJaguarCompanySplinterShip();
            } else {
                /* All splinter ships are now fully launched. */
                p_base.splinterShipsFullyLaunched = true;
            }
        }
    };

    /* Other global public functions. */

    /* NAME
     *   $showProps
     *
     * FUNCTION
     *   For debugging only.
     */
    this.$showProps = function () {
        var result = "",
        prop;

        for (prop in this) {
            if (this.hasOwnProperty(prop)) {
                if (typeof this[prop] !== "function") {
                    result += "this." + prop + ": " + this[prop] + "\n";
                } else {
                    result += "this." + prop + " = function ()\n";
                }
            }
        }

        for (prop in p_base) {
            if (p_base.hasOwnProperty(prop)) {
                result += "p_base." + prop + ": " + p_base[prop] + "\n";
            }
        }

        log(this.name, "$showProps::\n" + result);
    };

    /* NAME
     *   $scriptSanityTimer
     *
     * FUNCTION
     *   Periodic function to check if Jaguar Company ships have spawned correctly on launch.
     *
     *   Checks the Patrol ships, tug, buoy and miner.
     *
     *   Called every 5 seconds.
     */
    this.$scriptSanityTimer = function () {
        var patrolShips,
        patrolShip,
        patrolShipsToCheck,
        splinterShips,
        splinterShip,
        splinterShipsToCheck,
        tug,
        buoy,
        miner,
        counter,
        length;

        /* Check the patrol ships. */
        if (!this.$patrolShipsOK) {
            /* Search for the patrol ships. */
            patrolShips = system.shipsWithPrimaryRole("jaguar_company_patrol");

            if (patrolShips.length > 0) {
                /* Set the counter to all entities found. */
                patrolShipsToCheck = patrolShips.length;
                /* Cache the length. */
                length = patrolShips.length;

                /* Iterate through each of the patrol ships. */
                for (counter = 0; counter < length; counter += 1) {
                    patrolShip = patrolShips[counter];

                    if (patrolShip.script.name !== "jaguar_company_patrol.js") {
                        /* Reload the ship script. */
                        patrolShip.setScript("jaguar_company_patrol.js");

                        if (p_base.logging && p_base.logExtra) {
                            log(this.name, "Script sanity check - fixed a patrol ship.");
                        }
                    } else {
                        patrolShipsToCheck -= 1;
                    }
                }

                if (!patrolShipsToCheck &&
                    p_base.mainScript.$numPatrolShips === p_base.mainScript.$maxPatrolShips) {
                    /* Don't re-check. */
                    this.$patrolShipsOK = true;
                }
            }
        }

        /* Check the splinter ships. */
        if (!this.$splinterShipsOK) {
            /* Search for the splinter ships. */
            splinterShips = system.shipsWithPrimaryRole("jaguar_company_ship_splinter");

            if (splinterShips.length > 0) {
                /* Set the counter to all entities found. */
                splinterShipsToCheck = splinterShips.length;
                /* Cache the length. */
                length = splinterShips.length;

                /* Iterate through each of the splinter ships. */
                for (counter = 0; counter < length; counter += 1) {
                    splinterShip = splinterShips[counter];

                    if (splinterShip.script.name !== "jaguar_company_ship_splinter.js") {
                        /* Reload the ship script. */
                        splinterShip.setScript("jaguar_company_ship_splinter.js");

                        if (p_base.logging && p_base.logExtra) {
                            log(this.name, "Script sanity check - fixed a splinter ship.");
                        }
                    } else {
                        splinterShipsToCheck -= 1;
                    }
                }

                if (!splinterShipsToCheck && p_base.numSplinterShips === p_base.maxSplinterShips) {
                    /* Don't re-check. */
                    this.$splinterShipsOK = true;
                }
            }
        }

        tug = this.$tug;

        /* Check the tug. */
        if (!this.$tugOK && tug && tug.isValid) {
            if (tug.script.name !== "jaguar_company_tug.js") {
                /* Reload the ship script. */
                tug.setScript("jaguar_company_tug.js");

                if (p_base.logging && p_base.logExtra) {
                    log(this.name, "Script sanity check - fixed the tug.");
                }
            } else {
                /* Don't re-check. */
                this.$tugOK = true;
            }
        }

        buoy = this.$buoy;

        /* Check the buoy. */
        if (buoy && buoy.isValid && !this.$buoyOK) {
            if (buoy.script.name !== "jaguar_company_base_buoy.js") {
                /* Reload the ship script. */
                buoy.setScript("jaguar_company_base_buoy.js");

                if (p_base.logging && p_base.logExtra) {
                    log(this.name, "Script sanity check - fixed the buoy.");
                }
            } else {
                /* Don't re-check. */
                this.$buoyOK = true;
            }
        }

        /* Check the miner. Only check the miner ship script if not in interstellar space. */
        if (!system.isInterstellarSpace) {
            miner = this.$miner;

            if (miner && miner.isValid && !this.$minerOK) {
                if (miner.script.name !== "jaguar_company_miner.js") {
                    /* Reload the ship script. */
                    miner.setScript("jaguar_company_miner.js");

                    if (p_base.logging && p_base.logExtra) {
                        log(this.name, "Script sanity check - fixed the miner.");
                    }
                } else {
                    /* Don't re-check. */
                    this.$minerOK = true;
                }
            }
        }
    };

    /* NAME
     *   $baseTimer
     *
     * FUNCTION
     *   Some OXP's dick around with the scanner colours. This will reset the base's scanner colour
     *   back to the station default of solid green if the player has helped out in combat with Jaguar Company.
     *
     *   Starts the launch sequence for the patrol ships if needed.
     *
     *   Checks the buoy and launches a tug if there isn't one. Resets the scanner colour as per the base.
     *   Swaps the buoy to 'no beacon' or 'beacon' dependent on the reputation mission variable.
     *
     *   Called every 5 seconds.
     */
    this.$baseTimer = function () {
        var base = this.ship,
        position,
        orientation,
        newBuoy,
        newBuoyRole;

        /* Reset the base scanner colour. */
        base.scannerDisplayColor1 = null;
        base.scannerDisplayColor2 = null;

        if (!p_base.mainScript.$numPatrolShips) {
            /* Reset the fully launched status of the patrol ships. */
            p_base.mainScript.$patrolShipsFullyLaunched = false;
            /* Start launching patrol ships. */
            this.$launchJaguarCompanyPatrol();
        }

        if ((!this.$buoy || !this.$buoy.isValid) && !this.$buoyLaunched &&
            p_base.mainScript.$patrolShipsFullyLaunched &&
            p_base.splinterShipsFullyLaunched) {
            /* No buoys. Launch the tug to drop a buoy off. */
            this.$launchJaguarCompanyTug();

            return;
        }

        if (this.$buoy && this.$buoy.isValid) {
            /* Reset the buoy scanner colour. */
            this.$buoy.scannerDisplayColor1 = null;
            this.$buoy.scannerDisplayColor2 = null;

            if (p_base.mainScript.$playerVar.reputation[galaxyNumber] < p_base.mainScript.$reputationHelper) {
                newBuoyRole = "jaguar_company_base_buoy_no_beacon";
            } else {
                newBuoyRole = "jaguar_company_base_buoy_beacon";
            }

            /* Check if the buoy already has the new role. */
            if (!this.$buoy.hasRole(newBuoyRole)) {
                /* Copy some properties. */
                position = this.$buoy.position;
                orientation = this.$buoy.orientation;
                /* Create a new buoy. */
                newBuoy = this.$buoy.spawnOne(newBuoyRole);
                /* Remove the origial buoy quietly: don't trigger 'shipDied' in the ship script. */
                this.$buoy.remove(true);
                /* Setup the new buoy with the original properties. */
                newBuoy.position = position;
                newBuoy.orientation = orientation;
                /* Update the buoy reference. */
                this.$buoy = newBuoy;
            }
        }
    };

    /* NAME
     *   $launchJaguarCompanyPatrol
     *
     * FUNCTION
     *   Launch a patrol ship.
     */
    this.$launchJaguarCompanyPatrol = function () {
        if (p_base.logging && p_base.logExtra) {
            log(this.name, "$launchJaguarCompanyPatrol::Launching patrol ship...");
        }

        p_base.mainScript.$numPatrolShips += 1;
        this.ship.launchShipWithRole("jaguar_company_patrol");
    };

    /* NAME
     *   $launchJaguarCompanySplinterShip
     *
     * FUNCTION
     *   Launch a splinter ship.
     */
    this.$launchJaguarCompanySplinterShip = function () {
        if (p_base.logging && p_base.logExtra) {
            log(this.name, "$launchJaguarCompanySplinterShip::Launching splinter ship...");
        }

        p_base.numSplinterShips += 1;
        this.ship.launchShipWithRole("jaguar_company_ship_splinter");
    };

    /* NAME
     *   $launchJaguarCompanyTug
     *
     * FUNCTION
     *   Launch the tug to push the buoy into position.
     */
    this.$launchJaguarCompanyTug = function () {
        if (!this.$buoyLaunched && (!this.$buoy || !this.$buoy.isValid) &&
            p_base.mainScript.$patrolShipsFullyLaunched &&
            p_base.splinterShipsFullyLaunched) {
            /* Only one tug dragging a buoy at a time. Also no more than 1 buoy in system at a time.
             * Also don't launch until all patrol ships and splinter ships have launched.
             */
            this.$buoyLaunched = true;
            this.ship.launchShipWithRole("jaguar_company_tug");

            if (p_base.logging && p_base.logExtra) {
                log(this.name, "$launchJaguarCompanyTug::Launching tug...");
            }
        }
    };

    /* AI functions. */

    /* NAME
     *   $launchShip
     *
     * FUNCTION
     *   Launch other ships from the base.
     *
     * INPUT
     *   arr - array of ship types to launch
     */
    this.$launchShip = function (arr) {
        var shipType,
        counter,
        length;

        if (!Array.isArray(arr)) {
            /* Default array of ship types. */
            arr = ["miner"];
        }

        /* Cache the length. */
        length = arr.length;

        for (counter = 0; counter < length; counter += 1) {
            shipType = arr[counter];

            if (p_base.mainScript.$patrolShipsFullyLaunched) {
                if (p_base.splinterShipsFullyLaunched) {
                    if (shipType === "miner") {
                        if (!system.isInterstellarSpace &&
                            Math.random() < 0.05 &&
                            !p_base.minerLaunched) {
                            /* Only 1 miner at a time. */
                            p_base.minerLaunched = true;
                            this.ship.launchShipWithRole("jaguar_company_miner");

                            if (p_base.logging && p_base.logExtra) {
                                log(this.name, "$launchShip::Launching miner...");
                            }
                        }
                    }
                }
            }
        }
    };
}.bind(this)());
