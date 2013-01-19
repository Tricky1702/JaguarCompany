/*jslint indent: 4, maxerr: 50, white: true, browser: false, evil: true, es5: true, undef: true, nomen: true, plusplus: true, bitwise: true, regexp: true, newcap: true, sloppy: false */
/*jshint browser: false, devel: false, es5: true, node: false, bitwise: true, eqnull: true, noempty: true, eqeqeq: true, boss: true, loopfunc: true, laxbreak: true, strict: true, jquery: false */

/* Jaguar Company
 *
 * Copyright (C) 2012 Tricky
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
 * Missile subentity loading based on tgGeneric_externalMissiles.js by Thargoid
 */

this.name = "jaguar_company_patrol.js";
this.author = "Tricky";
this.copyright = "© 2012 Tricky";
this.license = "CC BY-NC-SA 3.0";
this.description = "Ship script for the Jaguar Company Patrol ships.";
this.version = "1.6.1";

(function () {
    "use strict";

    /* Private variables. */
    var $jaguarCompanyScript,
    $distanceClose,
    $distanceNearby,
    $distanceFarAway,
    $missileRole,
    $currentTarget;

    $jaguarCompanyScript = worldScripts["Jaguar Company"];

    /* Standard distances. */
    $distanceClose = 7500.0;
    $distanceNearby = 15000.0;
    $distanceFarAway = 22500.0;

    /* Default missile. */
    $missileRole = "EQ_HARDENED_MISSILE";

    /* Current target. */
    $currentTarget = null;

    this.shipSpawned = function () {
        var initialMissiles,
        addCounter;

        if ($jaguarCompanyScript.$logAIMessages) {
            this.ship.reportAIMessages = true;
        }

        /* Increase the number of ships in the system. */
        $jaguarCompanyScript.$numPatrolShips++;

        /* Get a unique name for the ship. */
        this.ship.displayName = $jaguarCompanyScript.$uniqueShipName();

        /* Thargoid's missile code. */
        /* just to ensure ship is fully loaded with selected missile type and nothing else. */
        if (this.ship.scriptInfo.missileRole) {
            /* missileRole should be defined in shipdata.plist */
            $missileRole = this.ship.scriptInfo.missileRole;
        }

        if (this.ship.scriptInfo.initialMissiles) {
            initialMissiles = parseInt(this.ship.scriptInfo.initialMissiles, 10);
        } else {
            initialMissiles = this.ship.missileCapacity;
        }

        if (this.ship.missiles.length > 0) {
            /* remove all spawning missiles and restock with selected ones. */
            this.ship.awardEquipment("EQ_MISSILE_REMOVAL");
        }

        for (addCounter = 0; addCounter < initialMissiles; addCounter++) {
            this.ship.awardEquipment($missileRole);
        }
    };

    /* Thargoid's missile code. */
    this.shipFiredMissile = function (missile, target) {
        var subCounter,
        subEntities,
        subEntity;

        function $localToGlobal(thisShip, subEntityPosition) {
            /* sub-ent position is relative to mother, but for swapping we need the absolute global position. */
            var orientation = thisShip.orientation;

            return thisShip.position.add(subEntityPosition.rotateBy(orientation));
        }

        subEntities = this.ship.subEntities;

        if (subEntities.length === 0) {
            /* if we've run out of sub-ents before we run out of missiles. */
            return;
        }

        /* Set counter to number of sub-ents minus 1 (as entity array goes up from zero). */
        for (subCounter = subEntities.length - 1; subCounter >= 0; subCounter--) {
            subEntity = subEntities[subCounter];

            if (subEntity.hasRole(missile.primaryRole)) {
                /* if the sub-ent is the same as the missile being fired. */
                /* move the fired missile to the sub-ent position. */
                missile.position = $localToGlobal(this.ship, subEntity.position);
                /* point the missile in the right direction. */
                missile.orientation = subEntity.orientation.multiply(this.ship.orientation);
                missile.desiredSpeed = missile.maxSpeed;
                /* remove the sub-ent version of the missile. */
                subEntity.remove();

                /* come out of the loop, as we've done our swap. */
                break;
            }
        }
    };

    /* Thargoid's missile code. */
    this.shipTakingDamage = function (amount, fromEntity, damageType) {
        var subEntities,
        subEntity,
        missiles,
        missileSubs,
        missileCounter,
        removeCounter,
        subCounter,
        difference;

        missiles = this.ship.missiles;
        subEntities = this.ship.subEntities;

        if (missiles.length === 0 && subEntities.length === 0) {
            /* if we're all out of missiles and any sub-entities, bail out. */
            return;
        }

        missileSubs = 0;

        /* Initially set subCounter to number of sub-ents minus 1 (as entity array goes up from zero). */
        for (subCounter = subEntities.length - 1; subCounter >= 0; subCounter--) {
            if (subEntities[subCounter].hasRole($missileRole)) {
                /* if the sub-ent is a missile, count it. */
                missileSubs++;
            }
        }

        if (missileSubs === 0 && subEntities.length === 0) {
            /* if we're all out of missiles and missile sub-entities, bail out. */
            return;
        }

        if (missileSubs < missiles.length) {
            /* if we've got more missiles than sub-entity missiles. */
            /* get rid of all missiles. */
            this.ship.awardEquipment("EQ_MISSILE_REMOVAL");

            if (missileSubs > 0) {
                for (missileCounter = 0; missileCounter < missileSubs; missileCounter++) {
                    /* restock with the correct number of selected missile. */
                    this.ship.awardEquipment($missileRole);
                }
            }

            return;
        }

        if (missileSubs > missiles.length) {
            /* if we've got less missiles than sub-entity missiles. */
            difference = missileSubs - missiles.length;

            for (removeCounter = 0; removeCounter < difference; removeCounter++) {
                /* loop through however many subs we need to remove. */
                /* Initially set subCounter to number of sub-ents minus 1 (as entity array goes up from zero). */
                for (subCounter = subEntities.length - 1; subCounter >= 0; subCounter--) {
                    subEntity = subEntities[subCounter];

                    if (subEntity.hasRole($missileRole)) {
                        /* if the sub-ent is a missile, remove it. */
                        subEntity.remove();

                        break;
                    }
                }
            }

            return;
        }
    };

    /* Decrease the number of ships in the system if we die. */
    this.shipDied = function (whom, why) {
        $jaguarCompanyScript.$numPatrolShips--;

        if ($jaguarCompanyScript.$logging && $jaguarCompanyScript.$logExtra) {
            log(this.name, "Ship: " + this.ship.displayName +
                " was destroyed by " + whom.displayName +
                ", reason: " + why);
        }
    };

    /* Not doing any exotic routes for now. */
    /* route: Base->WP, WP->PLANET, PLANET->WP, WP->Base */
    this.$checkCurrentRoute = function () {
        switch ($jaguarCompanyScript.$getCurrentPatrolRoute()) {
        case "JAGUAR_COMPANY_BASE_TO_WP":
            this.ship.reactToAIMessage("JAGUAR_COMPANY_WITCHPOINT_FROM_BASE");
            break;
        case "JAGUAR_COMPANY_WP_TO_PLANET":
            this.ship.reactToAIMessage("JAGUAR_COMPANY_PLANET");
            break;
        case "JAGUAR_COMPANY_PLANET_TO_WP":
            this.ship.reactToAIMessage("JAGUAR_COMPANY_WITCHPOINT");
            break;
        case "JAGUAR_COMPANY_WP_TO_BASE":
            this.ship.reactToAIMessage("JAGUAR_COMPANY_BASE");
            break;
        default:
            /* Should never trigger. Better safe than sorry though. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_WITCHPOINT_FROM_BASE");
        }
    };

    /* Finished the current route, change to the next one. */
    this.$finishedCurrentRoute = function () {
        var otherShips,
        otherShipsLength,
        otherShipsCounter;

        otherShips = system.shipsWithRole("jaguar_company_patrol", this.ship);
        /* Cache the length. */
        otherShipsLength = otherShips.length;

        if (otherShipsLength !== $jaguarCompanyScript.$numPatrolShips - 1) {
            /* Wait until all ships have been spawned. */
            return;
        }

        $jaguarCompanyScript.$changeCurrentPatrolRoute();

        if (otherShipsLength === 0) {
            /* Return immediately if we are on our own. */
            return;
        }

        for (otherShipsCounter = 0; otherShipsCounter < otherShipsLength; otherShipsCounter++) {
            /* Force all other ships to regroup. This ship is already regrouping. */
            otherShips[otherShipsCounter].reactToAIMessage("JAGUAR_COMPANY_REGROUP");
        }
    };

    /* Find the average distance to all the other ships. */
    this.$queryAverageDistance = function (otherShips) {
        var averageDistance,
        otherShipsLength,
        otherShipsCounter,
        otherShip,
        distance;

        averageDistance = 0.0;
        /* Cache the length. */
        otherShipsLength = otherShips.length;

        for (otherShipsCounter = 0; otherShipsCounter < otherShipsLength; otherShipsCounter++) {
            otherShip = otherShips[otherShipsCounter];
            /* Centre to centre distance. */
            distance = this.ship.position.distanceTo(otherShip.position);
            /* Take off half the collision radius of this ship. */
            distance -= (this.ship.collisionRadius / 2.0);
            /* Take off half the collision radius of the other ship. */
            distance -= (otherShip.collisionRadius / 2.0);
            /* Add this distance to all the other distances. */
            averageDistance += distance;
        }

        /* Average all the distances. */
        averageDistance /= otherShipsLength;

        return averageDistance;
    };

    /* Find the others ships and set the target to the one furthest away. */
    this.$locateJaguarCompany = function () {
        var otherShips,
        otherShipsLength;

        otherShips = system.shipsWithRole("jaguar_company_patrol", this.ship);
        /* Cache the length. */
        otherShipsLength = otherShips.length;

        if (otherShipsLength === 0) {
            /* We are on our own. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_NOT_FOUND");

            return;
        }

        if (otherShipsLength !== $jaguarCompanyScript.$numPatrolShips - 1) {
            /* Wait until all the ships have been spawned. */
            return;
        }

        /* The last one in the ships array is the one furthest away. */
        this.ship.target = otherShips[otherShipsLength - 1];
        this.ship.reactToAIMessage("JAGUAR_COMPANY_FOUND");
    };

    this.$checkJaguarCompanyClosestDistance = function (minimumDistance) {
        var actualDistance,
        otherShips;

        /* More ships will increase the distance. */
        actualDistance = minimumDistance * Math.ceil($jaguarCompanyScript.$numPatrolShips / 16.0);
        /* Take off the collision radius of this ship. */
        actualDistance -= this.ship.collisionRadius;
        otherShips = system.shipsWithRole("jaguar_company_patrol", this.ship, actualDistance);

        if (otherShips.length === 0) {
            this.ship.reactToAIMessage("JAGUAR_COMPANY_DISTANCE_OK");
        } else {
            /* If we are less than the minimum distance from the closest ship then we need to move away. */
            this.ship.target = otherShips[0];
            this.ship.reactToAIMessage("JAGUAR_COMPANY_TOO_CLOSE");
        }

        return;
    };

    this.$checkJaguarCompanyAverageDistance = function () {
        var otherShips,
        otherShipsLength,
        modifier,
        averageDistance,
        close,
        nearby,
        farAway;

        otherShips = system.shipsWithRole("jaguar_company_patrol", this.ship);
        /* Cache the length. */
        otherShipsLength = otherShips.length;

        if (otherShipsLength === 0 ||
            otherShipsLength !== $jaguarCompanyScript.$numPatrolShips - 1) {
            /* Return immediately for any one of these conditions.
             *
             * 1. We are on our own.
             * 2. Wait until all ships have been spawned.
             */
            return;
        }

        /* Find the average distance to all the other ships. */
        averageDistance = this.$queryAverageDistance(otherShips);

        /* The more ships there are the further the standard distances will need to be. */
        modifier = Math.ceil($jaguarCompanyScript.$numPatrolShips / 16.0);
        close = $distanceClose * modifier;
        nearby = $distanceNearby * modifier;
        farAway = $distanceFarAway * modifier;

        /* I would love to create a fuzzy logic controller for this. */
        if (averageDistance < close) {
            /* We have regrouped. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_REGROUPED");
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

    /* Tell everyone to regroup if the average distance to all the other ships is too great. */
    this.$checkJaguarCompanyRegroup = function (maxDistance) {
        var otherShips,
        otherShipsLength,
        otherShipsCounter,
        modifier;

        otherShips = system.shipsWithRole("jaguar_company_patrol", this.ship);
        /* Cache the length. */
        otherShipsLength = otherShips.length;

        if (otherShipsLength === 0 ||
            otherShipsLength !== $jaguarCompanyScript.$numPatrolShips - 1) {
            /* Return immediately for any one of these conditions.
             *
             * 1. We are on our own.
             * 2. Wait until all ships have been spawned.
             */
            return;
        }

        /* The more ships there are the larger the modifier will need to be. */
        modifier = Math.ceil($jaguarCompanyScript.$numPatrolShips / 16.0);

        /* Find the average distance to all the other ships. */
        if (this.$queryAverageDistance(otherShips) >= maxDistance * modifier) {
            /* Tell all ships, including ourself, to regroup. */
            if ($jaguarCompanyScript.$logging && $jaguarCompanyScript.$logExtra) {
                log(this.name, "Regroup sent by " + this.ship.displayName);
            }

            this.ship.reactToAIMessage("JAGUAR_COMPANY_REGROUP");

            for (otherShipsCounter = 0; otherShipsCounter < otherShipsLength; otherShipsCounter++) {
                otherShips[otherShipsCounter].reactToAIMessage("JAGUAR_COMPANY_REGROUP");
            }
        }
    };

    /* This does something similar to the groupAttack AI command. */
    this.$jaguarCompanyAttackTarget = function () {
        var otherShips,
        otherShip,
        otherShipsLength,
        otherShipsCounter;

        if (this.ship.target === null) {
            /* Return immediately if we have no target. */
            return;
        }

        /* Limit comms range to scanner range. */
        otherShips = system.shipsWithRole("jaguar_company_patrol", this.ship, this.ship.scannerRange);
        /* Cache the length. */
        otherShipsLength = otherShips.length;

        if (otherShipsLength === 0 ||
            otherShipsLength !== $jaguarCompanyScript.$numPatrolShips - 1) {
            /* Return immediately for any one of these conditions.
             *
             * 1. We are on our own.
             * 2. Wait until all ships have been spawned.
             */
            return;
        }

        if (this.ship.target.hasRole("jaguar_company")) {
            /* Don't attack our own ships. */
            this.ship.target = null;

            return;
        }

        /* React to our own attack call. */
        this.ship.reactToAIMessage("JAGUAR_COMPANY_ATTACK_TARGET");

        for (otherShipsCounter = 0; otherShipsCounter < otherShipsLength; otherShipsCounter++) {
            otherShip = otherShips[otherShipsCounter];

            if (!otherShip.hasHostileTarget) {
                /* The other ship is not currently in attack mode. Give it a target. */
                otherShip.target = this.ship.target;
                otherShip.reactToAIMessage("JAGUAR_COMPANY_ATTACK_TARGET");
            }
        }
    };

    /* Locate the base. */
    this.$locateJaguarCompanyBase = function () {
        var base = system.shipsWithRole("jaguar_company_base", this.ship);

        if (base.length === 0) {
            /* If it has gone, just patrol the witchpoint to the planet lane. */
            $jaguarCompanyScript.$changeCurrentPatrolRoute();
            this.ship.reactToAIMessage("JAGUAR_COMPANY_BASE_NOT_FOUND");
        } else {
            /* Set the target to the base. */
            this.ship.target = base[0];
            this.ship.reactToAIMessage("JAGUAR_COMPANY_BASE_FOUND");
        }
    };

    this.$saveTarget = function() {
        $currentTarget = this.ship.target;
    };

    this.$resetTarget = function() {
        this.ship.target = $currentTarget;
    };

    /* Check for "Friend Or Foe" attacking us. */
    this.$checkFOF = function() {
        if (this.ship.target.hasRole("jaguar_company")) {
            this.ship.reactToAIMessage("FRIENDLY_FIRE");
        } else {
            this.ship.reactToAIMessage("HOSTILE_FIRE");
        }
    };

    /* Won't be needed when v1.78 comes out. */
    this.$detectCascadeWeapon = function () {
        var cascadeWeapon,
        mines,
        minesLength,
        mineDistance,
        missiles,
        missilesLength,
        missileDistance;

        /* Let v1.77+ handle it. */
        if (0 >= oolite.compareVersion("1.77")) {
            return;
        }

        /* Find any quirium cascade mines or missiles within scanner range of this ship. */
        mines = system.shipsWithRole("EQ_QC_MINE", this.ship, this.ship.scannerRange);
        missiles = system.shipsWithRole("EQ_CASCADE_MISSILE", this.ship, this.ship.scannerRange);
        minesLength = mines.length;
        missilesLength = missiles.length;

        if (minesLength !== 0 || missilesLength !== 0) {
            /* First one in the array is the closest. */
            if (missilesLength === 0) {
                cascadeWeapon = mines[0];
            } else if (minesLength === 0) {
                cascadeWeapon = missiles[0];
            } else {
                mineDistance = this.ship.position.distanceTo(mines[0].position);
                missileDistance = this.ship.position.distanceTo(missiles[0].position);

                if (mineDistance < missileDistance) {
                    cascadeWeapon = mines[0];
                } else {
                    cascadeWeapon = missiles[0];
                }
            }

            this.ship.target = cascadeWeapon;
            this.ship.reactToAIMessage("CASCADE_WEAPON_DETECTED");
        }
    };
}).call(this);
