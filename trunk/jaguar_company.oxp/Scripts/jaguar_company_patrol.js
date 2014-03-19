/*jslint bitwise: true, es5: true, newcap: true, nomen: true, regexp: true, unparam: true, todo: true, white: true,
indent: 4, maxerr: 50, maxlen: 120 */
/*jshint boss: true, curly: true, eqeqeq: true, eqnull: true, es5: true, evil: true, forin: true, laxbreak: true,
loopfunc: true, noarg: true, noempty: true, strict: true, nonew: true, undef: true */
/*global Array, Math, Timer, Vector3D, expandDescription, parseInt, system, worldScripts */

/* Jaguar Company Patrol
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
 * Ship related functions for the patrol and intercept AIs.
 * Missile subentity code based on tgGeneric_externalMissiles.js by Thargoid (modified)
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "jaguar_company_patrol.js";
    this.author = "Tricky";
    this.copyright = "© 2012-2013 Richard Thomas Harrison (Tricky)";
    this.license = "CC BY-NC-SA 3.0";
    this.description = "Ship script for the Jaguar Company Patrol ships.";
    this.version = "1.10";

    /* Private variable. */
    var p_patrol = {};

    /* Ship script event handlers. */

    /* NAME
     *   shipSpawned
     *
     * FUNCTION
     *   Initialise various variables on ship birth.
     */
    this.shipSpawned = function () {
        var counter;

        /* Initialise the p_patrol variable object.
         * Encapsulates all private global data.
         */
        p_patrol = {
            /* Cache the world scripts. */
            mainScript : worldScripts["Jaguar Company"],
            shipsScript : worldScripts["Jaguar Company Ships"],
            /* Local copies of the logging variables. */
            logging : worldScripts["Jaguar Company"].$logging,
            logExtra : worldScripts["Jaguar Company"].$logExtra,
            /* Local copy of the friendList array. */
            friendList : worldScripts["Jaguar Company Ships"].$friendList,
            /* Standard distances. */
            distance : {
                close : 10000,
                nearby : 20000,
                farAway : 40000
            },
            /* Default missile. */
            missileRole : "EQ_HARDENED_MISSILE",
            /* Default number of missiles. */
            initialMissiles : this.ship.missileCapacity,
            /* Starting amount of fuel. */
            fuel : this.ship.fuel
        };

        /* Register this ship as a friendly. */
        p_patrol.shipsScript.$addFriendly({
            ship : this.ship,
            /* Random name for the pilot. Used when talking about attacks and sending a report to Snoopers. */
            pilotName : expandDescription("%N [nom1]"),
            /* Get a unique name for the patrol ship. */
            shipName : p_patrol.mainScript.$uniqueShipName()
        });
        /* Timer reference. */
        this.$addFuelTimerReference = new Timer(this, this.$addFuelTimer, 1, 1);

        /* Thargoid's missile code.
         *
         * Just to ensure ship is fully loaded with selected missile type and nothing else.
         */
        if (this.ship.scriptInfo.missileRole) {
            /* missileRole should be defined in shipdata.plist */
            p_patrol.missileRole = this.ship.scriptInfo.missileRole;
        }

        if (this.ship.scriptInfo.initialMissiles) {
            p_patrol.initialMissiles = parseInt(this.ship.scriptInfo.initialMissiles, 10);
        }

        if (this.ship.missiles.length > 0) {
            /* Remove all spawning missiles. */
            this.ship.awardEquipment("EQ_MISSILE_REMOVAL");
        }

        /* Restock with selected ones. */
        for (counter = 0; counter < p_patrol.initialMissiles; counter += 1) {
            this.ship.awardEquipment(p_patrol.missileRole);
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
     *   shipRemoved
     *
     * FUNCTION
     *   Patrol ship was removed by script.
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

        /* Decrease the number of patrol ships in the system. */
        worldScripts["Jaguar Company"].$numPatrolShips -= 1;
    };

    /* NAME
     *   entityDestroyed
     *
     * FUNCTION
     *   The patrol ship has just become invalid.
     */
    this.entityDestroyed = function () {
        /* Decrease the number of patrol ships in the system. */
        worldScripts["Jaguar Company"].$numPatrolShips -= 1;
        /* Stop and remove the timer. */
        this.$removeAddFuelTimer();
    };

    /* Other global public functions. */

    /* NAME
     *   $removeAddFuelTimer
     *
     * FUNCTION
     *   Stop and remove the timer.
     */
    this.$removeAddFuelTimer = function () {
        if (this.$addFuelTimerReference) {
            if (this.$addFuelTimerReference.isRunning) {
                this.$addFuelTimerReference.stop();
            }

            this.$addFuelTimerReference = null;
        }
    };

    /* NAME
     *   $addFuelTimer
     *
     * FUNCTION
     *   addFuel in the AI doesn't allow small increases.
     *
     *   This function allow us to increment the amount of fuel in tinier amounts.
     *   Called every second.
     */
    this.$addFuelTimer = function () {
        var actualFuel,
        internalFuel;

        if (this.ship.speed > this.ship.maxSpeed) {
            /* No fuel collection during Injection or Torus drive. */
            return;
        }

        /* Round off the actual fuel amount to the nearest lowest tenth.
         * The actual fuel amount can be something like 6.6000000000000005 even though
         * the system just uses the 1st decimal place.
         */
        actualFuel = Math.floor(this.ship.fuel * 10) / 10;
        /* The internal fuel amount is also rounded off in a similar manner for the following adjustment. */
        internalFuel = Math.floor(p_patrol.fuel * 10) / 10;

        /* Adjust the internal fuel amount if the actual fuel amount has changed.
         * Needed if the actual fuel amount has been reduced by Injection or Torus drive.
         */
        if (actualFuel !== internalFuel) {
            p_patrol.fuel = actualFuel;
        }

        if (p_patrol.fuel < 7) {
            /* 0.1 LY of fuel every 100 seconds. */
            p_patrol.fuel += 0.001;

            /* Cap the fuel level. */
            if (p_patrol.fuel > 7) {
                p_patrol.fuel = 7;
            }

            /* Set the actual fuel amount to the new fuel amount.
             * Adjust to the nearest lowest tenth.
             */
            this.ship.fuel = Math.floor(p_patrol.fuel * 10) / 10;
        } else {
            /* Make sure that the fuel tanks aren't over filled. */
            p_patrol.fuel = 7;
            this.ship.fuel = 7;
        }
    };

    /* NAME
     *   $queryAverageDistance
     *
     * FUNCTION
     *   Find the average distance to a set of ships from the patrol ship.
     *
     * INPUT
     *   ships - array of ships
     *
     * RESULT
     *   result - average distance to the set of ships
     */
    this.$queryAverageDistance = function (ships) {
        var averageDistance = 0,
        shipsLength,
        shipsCounter,
        ship,
        distance;

        if (!ships || !ships.length) {
            /* The array is empty. */
            return 0;
        }

        /* Cache the length. */
        shipsLength = ships.length;

        for (shipsCounter = 0; shipsCounter < shipsLength; shipsCounter += 1) {
            ship = ships[shipsCounter];
            /* Centre to centre distance. */
            distance = this.ship.position.distanceTo(ship.position);
            /* Take off the collision radius of this ship. */
            distance -= this.ship.collisionRadius;
            /* Take off the collision radius of the other ship. */
            distance -= ship.collisionRadius;
            /* Add this distance to all the other distances. */
            averageDistance += distance;
        }

        /* Average all the distances and return it. */
        return (averageDistance / shipsLength);
    };

    /* AI functions. */

    /* NAME
     *   $setCoordsToMainPlanet
     *
     * FUNCTION
     *   Set the co-ordinates to the surface of the main planet.
     */
    this.$setCoordsToMainPlanet = function () {
        this.$setCoordsToEntity(system.mainPlanet);
        this.ship.reactToAIMessage("JAGUAR_COMPANY_MAINPLANET_SET");
    };

    /* NAME
     *   $setCoordsToNavyShips
     *
     * FUNCTION
     *   Set the co-ordinates to the nearest navy ship.
     */
    this.$setCoordsToNavyShips = function () {
        var navyShips = p_patrol.mainScript.$scanForNavyShips(this.ship);

        if (navyShips.length) {
            /* Update the main script closest navy ship reference. */
            p_patrol.mainScript.$closestNavyShip = navyShips[0];
            p_patrol.mainScript.$initRoute("NAVY");
            /* Set the coords to the nearest navy ship. */
            this.$setCoordsToEntity(navyShips[0]);
            this.ship.reactToAIMessage("JAGUAR_COMPANY_NAVY_FOUND");
        } else {
            /* Navy has gone. Go back to base if possible. */
            p_patrol.mainScript.$initRoute();
            p_patrol.mainScript.$changeRoute(-1);
            this.ship.reactToAIMessage("JAGUAR_COMPANY_NAVY_NOT_FOUND");
        }
    };

    /* NAME
     *   $setCoordsToWitchpoint
     *
     * FUNCTION
     *   Set the co-ordinates to the surface of the witchpoint buoy.
     */
    this.$setCoordsToWitchpoint = function () {
        this.$setCoordsToEntity(p_patrol.mainScript.$witchpointBuoy);
        this.ship.reactToAIMessage("JAGUAR_COMPANY_WITCHPOINT_SET");
    };

    /* NAME
     *   $setCoordsToJaguarCompanyBuoy
     *
     * FUNCTION
     *   Set the co-ordinates to the surface of the buoy.
     */
    this.$setCoordsToJaguarCompanyBuoy = function () {
        var base = p_patrol.mainScript.$jaguarCompanyBase;

        if (!base || !base.isValid) {
            if (system.isInterstellarSpace) {
                this.ship.fuel = 7;
                this.ship.reactToAIMessage("JAGUAR_COMPANY_EXIT_INTERSTELLAR");
            } else {
                /* If it has gone, just patrol the witchpoint to the planet lane. */
                p_patrol.mainScript.$initRoute("WP");
                this.ship.reactToAIMessage("JAGUAR_COMPANY_BASE_NOT_FOUND");
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
     *   $addPatrolToNewSystem
     *
     * FUNCTION
     *   Jaguar Company were forced out of interstellar space as there was no base.
     *   Create a new base in the new system.
     */
    this.$addPatrolToNewSystem = function () {
        if (system.shipsWithPrimaryRole("jaguar_company_patrol").length === p_patrol.mainScript.$numPatrolShips) {
            /* Last ship out will create the base. */
            if (!p_patrol.mainScript.$setUpCompany()) {
                /* Base would not be created, just patrol the witchpoint to the planet lane. */
                p_patrol.mainScript.$initRoute("WP");
            } else {
                /* Base was created. Set the route. Should be a route to the base. */
                p_patrol.mainScript.$changeRoute(-1);
            }
        }
    };

    /* NAME
     *   $checkHyperspaceFollow
     *
     * FUNCTION
     *   Check to see if the patrol ship is the initiator of the wormhole or is following.
     */
    this.$checkHyperspaceFollow = function () {
        if (p_patrol.mainScript.$hyperspaceFollow) {
            /* This ship is following. */
            this.ship.savedCoordinates = p_patrol.mainScript.$hyperspaceFollow;
            this.ship.reactToAIMessage("JAGUAR_COMPANY_HYPERSPACE_FOLLOW");

            return;
        }

        /* This ship is opening the initial wormhole. */
        p_patrol.mainScript.$hyperspaceFollow = this.ship.position;
        this.ship.reactToAIMessage("JAGUAR_COMPANY_HYPERSPACE");
    };

    /* NAME
     *   $checkRoute
     *
     * FUNCTION
     *   Check current patrol route.
     */
    this.$checkRoute = function () {
        /* Call common code used by all of Jaguar Company. */
        p_patrol.mainScript.$checkRoute(this.ship);
    };

    /* NAME
     *   $finishedRoute
     *
     * FUNCTION
     *   Finished the current patrol route, change to the next one.
     */
    this.$finishedRoute = function () {
        /* Call common code used by all of Jaguar Company. */
        p_patrol.mainScript.$finishedRoute(this.ship, "jaguar_company_patrol", "JAGUAR_COMPANY_REGROUP");
    };

    /* NAME
     *   $scanForAllJaguarCompany
     *
     * FUNCTION
     *   Scan for the other ships to see if the full group is present.
     */
    this.$scanForAllJaguarCompany = function () {
        var base,
        patrolShips,
        counter,
        length,
        lurkPosition,
        variation;

        if (p_patrol.mainScript.$maxPatrolShips === 1) {
            /* We are on our own. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_NOT_FOUND");

            return;
        }

        patrolShips = system.shipsWithPrimaryRole("jaguar_company_patrol");

        if (patrolShips.length === p_patrol.mainScript.$numPatrolShips ||
            p_patrol.mainScript.$patrolShipsFullyLaunched) {
            /* Announce that we have found all of Jaguar Company to the AI. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_ALL_PRESENT");
        } else {
            base = p_patrol.mainScript.$jaguarCompanyBase;

            if (base && base.isValid) {
                /* Set the starting lurk position to the base position. */
                lurkPosition = base.position;
            } else {
                /* START OF CODE THAT SHOULD NEVER BE REACHED.
                 * This is here purely for error checking sake.
                 * If the base is destroyed it will set the patrol ships fully launched variable,
                 * therefore this code block shouldn't be reached.
                 */
                if (patrolShips.length === 1) {
                    /* We are on our own. */
                    lurkPosition = patrolShips[0].position;
                } else {
                    /* Cache the length. */
                    length = patrolShips.length;

                    /* Work out the midpoint position of all ships. */
                    lurkPosition = new Vector3D(0, 0, 0);

                    for (counter = 0; counter < length; counter += 1) {
                        lurkPosition = lurkPosition.add(patrolShips[counter].position);
                    }

                    lurkPosition.x /= length;
                    lurkPosition.y /= length;
                    lurkPosition.z /= length;

                    /* Higher variation if further away. */
                    variation = (this.ship.position.distanceTo(lurkPosition) > 51200 ? 0.5 : 0.2);

                    /* Move the vector a random amount. */
                    lurkPosition.x += variation * (Math.random() - variation);
                    lurkPosition.y += variation * (Math.random() - variation);
                    lurkPosition.z += variation * (Math.random() - variation);
                }
                /* END OF CODE THAT SHOULD NEVER BE REACHED. */
            }

            /* Move the lurk position 20km out in a random direction and save the co-ordinates for the AI. */
            this.ship.savedCoordinates = lurkPosition.add(Vector3D.randomDirection(20000));
            this.ship.reactToAIMessage("JAGUAR_COMPANY_NOT_PRESENT");
        }
    };

    /* NAME
     *   $scanForJaguarCompany
     *
     * FUNCTION
     *   Scan for the other ships and find the midpoint position of the group.
     */
    this.$scanForJaguarCompany = function () {
        var otherShips,
        otherShipsLength,
        otherShipsCounter,
        midpointPosition,
        variation;

        otherShips = system.shipsWithPrimaryRole("jaguar_company_patrol", this.ship);

        if (!otherShips.length) {
            /* We are on our own. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_NOT_FOUND");

            return;
        }

        /* Cache the length. */
        otherShipsLength = otherShips.length;

        /* Work out the midpoint position of all ships. */
        midpointPosition = this.ship.position;

        for (otherShipsCounter = 0; otherShipsCounter < otherShipsLength; otherShipsCounter += 1) {
            midpointPosition = midpointPosition.add(otherShips[otherShipsCounter].position);
        }

        midpointPosition.x /= (otherShipsLength + 1);
        midpointPosition.y /= (otherShipsLength + 1);
        midpointPosition.z /= (otherShipsLength + 1);

        /* Higher variation if further away. */
        variation = (this.ship.position.distanceTo(midpointPosition) > 51200 ? 0.5 : 0.2);

        /* Move the vector a random amount. */
        midpointPosition.x += variation * (Math.random() - variation);
        midpointPosition.y += variation * (Math.random() - variation);
        midpointPosition.z += variation * (Math.random() - variation);

        /* Save the co-ordinates for the AI. */
        this.ship.savedCoordinates = midpointPosition;
        /* Announce that we have found Jaguar Company to the AI. */
        this.ship.reactToAIMessage("JAGUAR_COMPANY_FOUND");
    };

    /* NAME
     *   $checkJaguarCompanyClosestDistance
     *
     * FUNCTION
     *   Check how close we are to other ships.
     *
     * INPUT
     *   arr - closest distance allowed (as an array) (just uses the first element in the array)
     */
    this.$checkJaguarCompanyClosestDistance = function (arr) {
        var minimumDistance,
        actualDistance,
        otherShips;

        if (!Array.isArray(arr)) {
            /* Default. */
            minimumDistance = 250.0;
        } else {
            minimumDistance = arr[0];
        }

        /* More ships will increase the minimum distance. */
        actualDistance = minimumDistance * Math.ceil(p_patrol.mainScript.$numPatrolShips / 8);
        /* Modify for surface to surface. */
        actualDistance += this.ship.collisionRadius;
        /* Check for any patrol ships within the calculated sphere. */
        otherShips = system.shipsWithPrimaryRole("jaguar_company_patrol", this.ship, actualDistance);

        if (!otherShips.length) {
            this.ship.reactToAIMessage("JAGUAR_COMPANY_DISTANCE_OK");
        } else {
            /* If we are less than the minimum distance from the closest ship then we need to move away. */
            this.ship.target = otherShips[0];
            this.ship.reactToAIMessage("JAGUAR_COMPANY_TOO_CLOSE");
        }

        return;
    };

    /* NAME
     *   $checkJaguarCompanyAverageDistance
     *
     * FUNCTION
     *   Check our average distance to all other ships.
     */
    this.$checkJaguarCompanyAverageDistance = function () {
        var otherShips,
        averageDistance,
        close,
        nearby,
        farAway;

        otherShips = system.shipsWithPrimaryRole("jaguar_company_patrol", this.ship);

        if (!otherShips.length) {
            /* Return immediately if we are on our own. */
            return;
        }

        /* Find the average distance to all the other ships. */
        averageDistance = this.$queryAverageDistance(otherShips);

        close = (p_patrol.distance.close) + ((Math.random() * 2000.0) - 1000.0);
        nearby = (p_patrol.distance.nearby) + ((Math.random() * 2000.0) - 1000.0);
        farAway = (p_patrol.distance.farAway) + ((Math.random() * 2000.0) - 1000.0);

        /* I would love to create a fuzzy logic controller for this. */
        if (averageDistance < close) {
            /* We have regrouped. */
            this.ship.sendAIMessage("JAGUAR_COMPANY_REGROUPED");
        } else if (averageDistance >= close && averageDistance < nearby) {
            /* We are close. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_CLOSE");
        } else if (averageDistance >= nearby && averageDistance < farAway) {
            /* We are nearby. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_NEARBY");
        } else {
            /* We are far away. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_FAR_AWAY");
        }
    };

    /* NAME
     *   $checkJaguarCompanyRegroup
     *
     * FUNCTION
     *   Tell everyone to regroup if the average distance to all the other ships is too great.
     *
     * INPUT
     *   arr - furthest distance allowed before a regroup message is sent out (as an array)
     *         (just uses the first element in the array)
     */
    this.$checkJaguarCompanyRegroup = function (arr) {
        var maxDistance,
        otherShips,
        otherShipsLength,
        otherShipsCounter;

        otherShips = system.shipsWithPrimaryRole("jaguar_company_patrol", this.ship);

        if (!otherShips.length) {
            /* Return immediately if we are on our own. */
            return;
        }

        if (!Array.isArray(arr)) {
            /* Default. */
            maxDistance = 15000.0;
        } else {
            maxDistance = arr[0];
        }

        /* Find the average distance to all the other ships
         * and check if this is more than the furthest distance allowed (+/- 1km).
         */
        if (this.$queryAverageDistance(otherShips) >= maxDistance + ((Math.random() * 2000.0) - 1000.0)) {
            /* Tell all ships, including ourself, to regroup. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_REGROUP");

            /* Cache the length. */
            otherShipsLength = otherShips.length;

            for (otherShipsCounter = 0; otherShipsCounter < otherShipsLength; otherShipsCounter += 1) {
                otherShips[otherShipsCounter].reactToAIMessage("JAGUAR_COMPANY_REGROUP");
            }
        }
    };
}.bind(this)());
