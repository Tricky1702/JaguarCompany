/*jslint indent: 4, maxlen: 120, maxerr: 50, white: true, es5: true, undef: true, regexp: true, newcap: true */
/*jshint es5: true, undef: true, eqnull: true, noempty: true, eqeqeq: true, boss: true, loopfunc: true, laxbreak: true,
strict: true, curly: true */
/*global system, log, worldScripts, Timer */

/* Jaguar Company Patrol
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
 * Ship related functions for the patrol and intercept AIs.
 * Missile subentity code based on tgGeneric_externalMissiles.js by Thargoid (modified)
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "jaguar_company_patrol.js";
    this.author = "Tricky";
    this.copyright = "© 2012 Richard Thomas Harrison (Tricky)";
    this.license = "CC BY-NC-SA 3.0";
    this.description = "Ship script for the Jaguar Company Patrol ships.";
    this.version = "1.8";

    /* Private variable. */
    var p_patrol = {};

    /* Ship event callbacks. */

    /* Initialise various variables on ship birth. */
    this.shipSpawned = function () {
        var counter;

        /* No longer needed after setting up. */
        delete this.shipSpawned;

        /* Initialise the p_patrol variable object.
         * Encapsulates all private global data.
         */
        p_patrol = {
            /* Cache the world scripts. */
            mainScript : worldScripts["Jaguar Company"],
            attackersScript : worldScripts["Jaguar Company Attackers"],
            /* Local copies of the logging variables. */
            logging : worldScripts["Jaguar Company"].$logging,
            logExtra : worldScripts["Jaguar Company"].$logExtra,
            /* Local copy of the friendRoles array. */
            friendRoles : worldScripts["Jaguar Company Attackers"].$friendRoles,
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
        p_patrol.attackersScript.$addFriendly(this.ship);
        /* Get a unique name for the patrol ship. */
        this.ship.displayName = p_patrol.mainScript.$uniqueShipName(this.ship.name);
        /* Increase the number of patrol ships in the system. */
        p_patrol.mainScript.$numPatrolShips += 1;
        /* Timer reference. */
        this.$addFuelTimerReference = new Timer(this, this.$addFuelTimer, 1, 1);

        /* Thargoid's missile code. */
        /* Just to ensure ship is fully loaded with selected missile type and nothing else. */
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
    };

    /* Thargoid's missile code. (Simplified - taken out the local function.)
     *
     * INPUT
     *   missile - missile entity.
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

    /* Patrol ship was removed by script. */
    this.shipRemoved = function (suppressDeathEvent) {
        if (suppressDeathEvent) {
            return;
        }

        /* Decrease the number of patrol ships in the system. */
        worldScripts["Jaguar Company"].$numPatrolShips -= 1;
    };

    /* The patrol ship has just become invalid. */
    this.entityDestroyed = function () {
        /* Decrease the number of patrol ships in the system. */
        worldScripts["Jaguar Company"].$numPatrolShips -= 1;
        /* Stop and remove the timer. */
        this.$removeAddFuelTimer();
    };

    /* Taking damage. Check attacker and what type.
     *
     * INPUTS
     *   amount - amount of damage.
     *   attacker - entity that caused the damage.
     *   type - type of damage as a string.
     */
    this.shipTakingDamage = function (amount, attacker, type) {
        if (!attacker || !attacker.isValid || !attacker.isShip) {
            /* If it isn't a ship dealing damage then carry on with the damage. */
            return;
        }

        if (p_patrol.friendRoles.indexOf(attacker.entityPersonality) > -1 && type === "scrape damage") {
            /* Cancel damage from collision with Jaguar Company ships. */
            this.ship.energy += amount;

            /* Target the ship we are colliding with. */
            this.ship.target = attacker;

            if (this.ship.AI === "jaguar_company_interceptAI.plist") {
                /* Force an exit of the intercept AI. */
                this.ship.lightsActive = false;
                this.ship.exitAI();
            }

            /* Move away from the ship we are colliding with. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_TOO_CLOSE");
        }
    };

    /* Stop and remove the timer. */
    this.$removeAddFuelTimer = function () {
        if (this.$addFuelTimerReference) {
            if (this.$addFuelTimerReference.isRunning) {
                this.$addFuelTimerReference.stop();
            }

            delete this.$addFuelTimerReference;
        }
    };

    /* addFuel in the AI doesn't allow small increases.
     *
     * This function allow us to increment the amount of fuel in tinier amounts.
     * Called every second.
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

    /* Find the average distance to all the other ships.
     *
     * INPUT
     *   otherShips - array of ships.
     *
     * RESULT
     *   result - average distance to all the other ships.
     */
    this.$queryAverageDistance = function (otherShips) {
        var averageDistance = 0,
        otherShipsLength,
        otherShipsCounter,
        otherShip,
        distance;

        if (!otherShips.length) {
            return 0;
        }

        /* Cache the length. */
        otherShipsLength = otherShips.length;

        for (otherShipsCounter = 0; otherShipsCounter < otherShipsLength; otherShipsCounter += 1) {
            otherShip = otherShips[otherShipsCounter];
            /* Centre to centre distance. */
            distance = this.ship.position.distanceTo(otherShip.position);
            /* Take off the collision radius of this ship. */
            distance -= this.ship.collisionRadius;
            /* Take off the collision radius of the other ship. */
            distance -= otherShip.collisionRadius;
            /* Add this distance to all the other distances. */
            averageDistance += distance;
        }

        /* Average all the distances and return it. */
        return (averageDistance /= otherShipsLength);
    };

    /* Set the co-ordinates to the surface of the entity.
     * This borrows some code from 'src/Core/Entities/ShipEntityAI.m - setCourseToPlanet'
     *
     * INPUT
     *   entity - entity to set co-ordinates to.
     */
    this.$setCoordsToEntity = function (entity) {
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

    /* AI functions. */

    /* Save the current AI state. */
    this.$saveAIState = function () {
        p_patrol.saveAIState = this.ship.AIState;
    };

    /* Recall the saved AI state. */
    this.$recallAIState = function () {
        this.ship.AIState = p_patrol.saveAIState;
    };

    /* Set the co-ordinates to the surface of the main planet. */
    this.$setCoordsToMainPlanet = function () {
        this.$setCoordsToEntity(system.mainPlanet);
    };

    /* Set the co-ordinates to the fake interstellar witchpoint buoy. */
    this.$setCoordsToInterstellarWitchpoint = function () {
        this.$setCoordsToEntity(p_patrol.mainScript.$witchpointBuoy);
    };

    /* Set the co-ordinates to the surface of the witchpoint buoy. */
    this.$setCoordsToWitchpoint = function () {
        var witchpointBuoy = p_patrol.mainScript.$witchpointBuoy;

        if (!witchpointBuoy || !witchpointBuoy.isValid) {
            /* No witchpoint buoy. Patrol the base to the planet lane. */
            p_patrol.mainScript.$initRoute("BP");
            this.ship.reactToAIMessage("JAGUAR_COMPANY_WITCHPOINT_NOT_FOUND");
        } else {
            this.$setCoordsToEntity(p_patrol.mainScript.$witchpointBuoy);
            this.ship.reactToAIMessage("JAGUAR_COMPANY_WITCHPOINT_FOUND");
        }
    };

    /* Set the co-ordinates to the surface of the base. */
    this.$setCoordsToJaguarCompanyBase = function () {
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
            if (p_patrol.mainScript.$buoy && p_patrol.mainScript.$buoy.isValid) {
                /* Set the coords to the buoy. */
                this.$setCoordsToEntity(p_patrol.mainScript.$buoy);
            } else {
                /* Set the coords to the base. */
                this.$setCoordsToEntity(base);
            }

            this.ship.reactToAIMessage("JAGUAR_COMPANY_BASE_FOUND");
        }
    };

    /* Jaguar Company were forced out of interstellar space as there was no base.
     * Create a new base in the new system.
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

    /* Check to see if the patrol ship is the initiator of the wormhole or is following. */
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

    /* Check current patrol route. */
    this.$checkRoute = function () {
        /* Call common code used by all of Jaguar Company. */
        p_patrol.mainScript.$checkRoute(this.ship);
    };

    /* Finished the current patrol route, change to the next one. */
    this.$finishedRoute = function () {
        /* Call common code used by all of Jaguar Company. */
        p_patrol.mainScript.$finishedRoute(this.ship, "jaguar_company_patrol", "JAGUAR_COMPANY_REGROUP");
    };

    /* Scan for the other ships to see if the full group is present. */
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
            base = system.shipsWithRole("jaguar_company_base");

            if (base.length > 0) {
                /* There can only really be 1 base. */
                lurkPosition = base[0].position;
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

    /* Scan for the other ships and find the midpoint position of the group. */
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

    /* Check how close we are to other ships.
     *
     * INPUT
     *   minimumDistance - closest distance allowed.
     */
    this.$checkJaguarCompanyClosestDistance = function (minimumDistance) {
        var actualDistance,
        otherShips;

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

    /* Check our average distance to all other ships. */
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

    /* Tell everyone to regroup if the average distance to all the other ships is too great.
     *
     * INPUT
     *   maxDistance - furthest distance allowed before a regroup message is sent out.
     */
    this.$checkJaguarCompanyRegroup = function (maxDistance) {
        var otherShips,
        otherShipsLength,
        otherShipsCounter;

        otherShips = system.shipsWithPrimaryRole("jaguar_company_patrol", this.ship);

        if (!otherShips.length) {
            /* Return immediately if we are on our own. */
            return;
        }

        /* Find the average distance to all the other ships. */
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
}).call(this);
