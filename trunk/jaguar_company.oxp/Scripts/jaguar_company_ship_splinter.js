/*jslint bitwise: true, es5: true, newcap: true, nomen: true, regexp: true, unparam: true, todo: true, white: true,
indent: 4, maxerr: 50, maxlen: 120 */
/*jshint boss: true, curly: true, eqeqeq: true, eqnull: true, es5: true, evil: true, forin: true, laxbreak: true,
loopfunc: true, noarg: true, noempty: true, strict: true, nonew: true, undef: true */
/*global Math, Timer, Vector3D, expandDescription, galaxyNumber, log, parseInt, worldScripts */

/* Jaguar Company Splinter Ship
 *
 * Copyright © 2012-2014 Richard Thomas Harrison (Tricky)
 *
 * This work is licensed under the Creative Commons
 * Attribution-Noncommercial-Share Alike 4.0 International (CC BY-NC-SA 4.0)
 *
 * To view a copy of this license, visit
 * http://creativecommons.org/licenses/by-nc-sa/4.0/ or send an email
 * to info@creativecommons.org
 *
 * Ship related functions for the splinter ship AI.
 * Missile subentity code based on tgGeneric_externalMissiles.js by Thargoid (modified)
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "jaguar_company_ship_splinter.js";
    this.author = "Tricky";
    this.copyright = "© 2013 Richard Thomas Harrison (Tricky)";
    this.license = "CC BY-NC-SA 3.0";
    this.description = "Ship script for the Jaguar Company Splinter ships.";
    this.version = "1.0";

    /* Private variable. */
    var p_splinter = {};

    /* Ship script event handlers. */

    /* NAME
     *   shipSpawned
     *
     * FUNCTION
     *   Initialise various variables on ship birth.
     */
    this.shipSpawned = function () {
        var counter;

        /* Initialise the p_splinter variable object.
         * Encapsulates all private global data.
         */
        p_splinter = {
            /* Cache the world scripts. */
            mainScript : worldScripts["Jaguar Company"],
            shipsScript : worldScripts["Jaguar Company Ships"],
            /* Local copies of the logging variables. */
            logging : worldScripts["Jaguar Company"].$logging,
            logExtra : worldScripts["Jaguar Company"].$logExtra,
            /* Local copy of the friendList array. */
            friendList : worldScripts["Jaguar Company Ships"].$friendList,
            /* Default missile. */
            missileRole : "EQ_HARDENED_MISSILE",
            /* Default number of missiles. */
            initialMissiles : this.ship.missileCapacity,
        };

        /* Register this ship as a friendly. */
        p_splinter.shipsScript.$addFriendly({
            ship : this.ship,
            /* Random name for the pilot. Used when talking about attacks and sending a report to Snoopers. */
            pilotName : expandDescription("%N [nom1]"),
            /* Get a unique name for the patrol ship. */
            shipName : p_splinter.mainScript.$uniqueShipName()
        });
        /* Move the lurk position 15km out in a random direction from the base. */
        this.$lurkPosition = p_splinter.mainScript.$jaguarCompanyBase.position.add(Vector3D.randomDirection(15000));
        /* Reset the lurk timer. */
        this.$lurkTimerReference = null;
        /* Set the just launched flag. */
        this.$justLaunched = true;
        /* Set the timer to fire every 5 seconds. */
        this.$splinterShipTimerReference = new Timer(this, this.$splinterShipTimer, 5, 5);

        /* Thargoid's missile code.
         *
         * Just to ensure ship is fully loaded with selected missile type and nothing else.
         */
        if (this.ship.scriptInfo.missileRole) {
            /* missileRole should be defined in shipdata.plist */
            p_splinter.missileRole = this.ship.scriptInfo.missileRole;
        }

        if (this.ship.scriptInfo.initialMissiles) {
            p_splinter.initialMissiles = parseInt(this.ship.scriptInfo.initialMissiles, 10);
        }

        if (this.ship.missiles.length > 0) {
            /* Remove all spawning missiles. */
            this.ship.awardEquipment("EQ_MISSILE_REMOVAL");
        }

        /* Restock with selected ones. */
        for (counter = 0; counter < p_splinter.initialMissiles; counter += 1) {
            this.ship.awardEquipment(p_splinter.missileRole);
        }

        /* No longer needed after setting up. */
        delete this.shipSpawned;
    };

    /* NAME
     *   shipFiredMissile
     *
     * FUNCTION
     *   Thargoid's missile code. (Simplified - taken out the local function.)
     *
     * INPUT
     *   missile - missile entity
     */
    this.shipFiredMissile = function (missile) {
        var counter,
        subEntities,
        subEntity;

        subEntities = this.ship.subEntities;

        if (!subEntities || !subEntities.length) {
            /* If we've run out of sub-ents before we run out of missiles. */
            return;
        }

        /* Set counter to number of sub-ents minus 1 (as entity array goes up from zero). */
        for (counter = subEntities.length - 1; counter >= 0; counter -= 1) {
            subEntity = subEntities[counter];

            if (subEntity.hasRole(missile.primaryRole)) {
                /* If the sub-ent is the same as the missile being fired. */
                /* Move the fired missile to the sub-ent position and convert to real-world co-ordinates. */
                missile.position = this.ship.position.add(subEntity.position.rotateBy(this.ship.orientation));
                /* Point the missile in the right direction. */
                missile.orientation = subEntity.orientation.multiply(this.ship.orientation);
                /* Desired speed of missile is it's maximum speed. */
                missile.desiredSpeed = missile.maxSpeed;
                /* Remove the sub-ent version of the missile. */
                subEntity.remove();

                /* Come out of the loop, as we've done our swap. */
                break;
            }
        }
    };

    /* NAME
     *   entityDestroyed
     *
     * FUNCTION
     *   The splinter ship has just become invalid.
     */
    this.entityDestroyed = function () {
        /* Stop and remove the timers. */
        this.$removeLurkTimer();
        this.$removeSplinterShipTimer();
    };

    /* Other global public functions. */

    /* NAME
     *   $removeLurkTimer
     *
     * FUNCTION
     *   Stop and remove the timer.
     */
    this.$removeLurkTimer = function () {
        if (this.$lurkTimerReference) {
            if (this.$lurkTimerReference.isRunning) {
                this.$lurkTimerReference.stop();
            }

            this.$lurkTimerReference = null;
        }
    };

    /* NAME
     *   $removeSplinterShipTimer
     *
     * FUNCTION
     *   Stop and remove the timer.
     */
    this.$removeSplinterShipTimer = function () {
        if (this.$splinterShipTimerReference) {
            if (this.$splinterShipTimerReference.isRunning) {
                this.$splinterShipTimerReference.stop();
            }

            this.$splinterShipTimerReference = null;
        }
    };

    /* NAME
     *   $splinterShipTimer
     *
     * FUNCTION
     *   Hide the splinter ships on the scanner as rocks.
     */
    this.$splinterShipTimer = function () {
        if (p_splinter.mainScript.$playerVar.reputation[galaxyNumber] < p_splinter.mainScript.$reputationHelper) {
            /* This will set the splinter ship's scanner colour to white if the player
             * has not helped out in combat with Jaguar Company.
             */
            this.ship.scannerDisplayColor1 = "whiteColor";
            this.ship.scannerDisplayColor2 = "whiteColor";
        } else {
            /* Reset the splinter ship scanner colour. */
            this.ship.scannerDisplayColor1 = null;
            this.ship.scannerDisplayColor2 = null;
        }
    };

    /* AI functions. */

    /* NAME
     *   $setCoordsToWitchpoint
     *
     * FUNCTION
     *   Set the co-ordinates to the surface of the witchpoint buoy.
     */
    this.$setCoordsToWitchpoint = function () {
        this.$setCoordsToEntity(p_splinter.mainScript.$witchpointBuoy);
        this.ship.reactToAIMessage("JAGUAR_COMPANY_WITCHPOINT_SET");
    };

    /* NAME
     *   $setCoordsToJaguarCompanyBuoy
     *
     * FUNCTION
     *   Set the co-ordinates to the surface of the buoy.
     */
    this.$setCoordsToJaguarCompanyBuoy = function () {
        var base = p_splinter.mainScript.$jaguarCompanyBase;

        if (!base || !base.isValid) {
            /* If the base has gone, EXPLODE!. */
            this.ship.switchAI("timebombAI.plist");

            if (p_splinter.logging && p_splinter.logExtra) {
                log(this.name, "$setCoordsToJaguarCompanyBuoy::BANG!!!");
            }
        } else {
            if (base.script.$buoy && base.script.$buoy.isValid) {
                /* Set the coords to the buoy. */
                this.$setCoordsToEntity(base.script.$buoy);
                this.ship.reactToAIMessage("JAGUAR_COMPANY_BUOY_FOUND");
            } else {
                /* Set the coords to the base. */
                this.$setCoordsToEntity(base);
                this.ship.reactToAIMessage("JAGUAR_COMPANY_BASE_FOUND");
            }
        }
    };

    /* NAME
     *   $findLurkCoordinates
     *
     * FUNCTION
     *   Returns co-ordinates to lurk about.
     */
    this.$findLurkCoordinates = function () {
        var base = p_splinter.mainScript.$jaguarCompanyBase;

        if (!base || !base.isValid) {
            /* If the base has gone, EXPLODE!. */
            this.ship.switchAI("timebombAI.plist");

            if (p_splinter.logging && p_splinter.logExtra) {
                log(this.name, "$findLurkCoordinates::BANG!!!");
            }
        } else {
            /* Save the co-ordinates for the AI. */
            this.ship.savedCoordinates = this.$lurkPosition;
            this.ship.reactToAIMessage("LURK");
        }
    };

    /* NAME
     *   $addLurkTimer
     *
     * FUNCTION
     *   Restarts the lurk timer and returns co-ordinates to lurk about.
     */
    this.$addLurkTimer = function () {
        var base = p_splinter.mainScript.$jaguarCompanyBase;

        if (!base || !base.isValid) {
            /* If the base has gone, EXPLODE!. */
            this.ship.switchAI("timebombAI.plist");

            if (p_splinter.logging && p_splinter.logExtra) {
                log(this.name, "$addLurkTimer::BANG!!!");
            }
        } else {
            /* Set the timer to fire in 5-10 minutes. */
            this.$lurkTimerReference = new Timer(this, this.$addLurkTimer, ((Math.random() * 5) + 5) * 60);

            if (!this.$justLaunched && Math.random() <= 0.05) {
                /* 1 in 20 chance of docking. */
                this.ship.reactToAIMessage("JAGUAR_COMPANY_DOCK");
                this.$removeLurkTimer();
            } else {
                /* Reset the just launched flag. */
                this.$justLaunched = false;
                /* Move the lurk position 15km out in a random direction from the base. */
                this.$lurkPosition = base.position.add(Vector3D.randomDirection(15000));
            }
        }
    };
}.bind(this)());
