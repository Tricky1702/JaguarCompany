/*jslint indent: 4, maxerr: 50, white: true, browser: false, undef: true, nomen: true, plusplus: true, bitwise: true, regexp: true, newcap: true, sloppy: false */

/* Jaguar Company
**
** Copyright (C) 2012 Tricky
**
** This work is licensed under the Creative Commons
** Attribution-Noncommercial-Share Alike 3.0 Unported License.
**
** To view a copy of this license, visit
** http://creativecommons.org/licenses/by-nc-sa/3.0/ or send a letter
** to Creative Commons, 171 Second Street, Suite 300, San Francisco,
** California, 94105, USA.
**
** Ship related functions for the patrol AI.
** Missile subentity loading based on tgGeneric_externalMissiles.js by Thargoid
*/

this.name = "jaguar_company_ship.js";
this.author = "Tricky";
this.copyright = "© 2012 Tricky";
this.license = "CC BY-NC-SA 3.0";
this.description = "Ship script for the Jaguar Company.";
this.version = "1.3";

(function () {
    "use strict";

    this.$jaguarCompanyScript = worldScripts["Jaguar Company"];

    if (this.$jaguarCompanyScript.$logAIMessages) {
        this.ship.reportAIMessages = true;
    }

    this.$currentRoute = "JAGUAR_COMPANY_BASE_TO_WP";
    this.$attacking = false;

    /* Thargoid's missile code. */
    this.shipSpawned = function shipSpawned() {
        var initialMissiles,
        addCounter;

        this.ship.displayName = this.$jaguarCompanyScript.$uniqueShipName();

        /* just to ensure ship is fully loaded with selected missile type and nothing else. */
        if (this.ship.scriptInfo.missileRole) {
            /* missileRole should be defined in shipdata.plist */
            this.$missileRole = this.ship.scriptInfo.missileRole;
        } else {
            /* default to standard missile if not. */
            this.$missileRole = "EQ_HARDENED_MISSILE";
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
            this.ship.awardEquipment(this.$missileRole);
        }
    };

    /* Thargoid's missile code. */
    this.shipFiredMissile = function shipFiredMissile(missile, target) {
        var subCounter,
        subEntities,
        subEntity;

        function $localToGlobal(thisShip, position) {
            /* sub-ent position is relative to mother, but for swapping we need the absolute global position. */
            var orientation = thisShip.orientation;

            return thisShip.position.add(position.rotateBy(orientation));
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
    this.shipTakingDamage = function shipTakingDamage(amount, fromEntity, damageType) {
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
            if (subEntities[subCounter].hasRole(this.$missileRole)) {
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
                    this.ship.awardEquipment(this.$missileRole);
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

                    if (subEntity.hasRole(this.$missileRole)) {
                        /* if the sub-ent is a missile, remove it. */
                        subEntity.remove();

                        break;
                    }
                }
            }

            return;
        }
    };

    this.shipDied = function shipDied(whom, why) {
        this.$jaguarCompanyScript.$numShips--;

        if (this.$jaguarCompanyScript.$logging) {
            log(this.name, "Ship: " + this.ship.displayName + " was destroyed by " + whom + ", reason: " + why);
        }
    };

    /* Not doing any exotic routes for now. */
    /* route: Base->WP, WP->PLANET, PLANET->WP, WP->Base */
    this.$checkRoute = function $checkRoute() {
        switch (this.$currentRoute) {
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

    /* Change our current route. */
    this.$changeRoute = function $changeRoute() {
        switch (this.$currentRoute) {
        case "JAGUAR_COMPANY_BASE_TO_WP":
            this.$currentRoute = "JAGUAR_COMPANY_WP_TO_PLANET";
            break;
        case "JAGUAR_COMPANY_WP_TO_PLANET":
            this.$currentRoute = "JAGUAR_COMPANY_PLANET_TO_WP";
            break;
        case "JAGUAR_COMPANY_PLANET_TO_WP":
            this.$currentRoute = "JAGUAR_COMPANY_WP_TO_BASE";
            break;
        case "JAGUAR_COMPANY_WP_TO_BASE":
            this.$currentRoute = "JAGUAR_COMPANY_BASE_TO_WP";
            break;
        default:
            /* Should never trigger. Better safe than sorry though. */
            this.$currentRoute = "JAGUAR_COMPANY_BASE_TO_WP";
        }
    };

    /* Finished the current route, change to the next one and tell other ships to change. */
    this.$finishedRoute = function $finishedRoute() {
        var otherShips = system.shipsWithRole("jaguar_company_patrol", this.ship),
        otherShipCounter;

        this.$changeRoute();

        /* Tell all other ships to change route. */
        for (otherShipCounter = 0; otherShipCounter < otherShips.length; otherShipCounter++) {
            otherShips[otherShipCounter].AIState = "CHANGE_ROUTE";
        }
    };

    /* Find the average distance to all the other ships. */
    this.$queryAverageDistance = function $queryAverageDistance(ships) {
        var averageDistance = 0.0,
        logStr,
        shipCounter;

        if (this.$jaguarCompanyScript.$logging && this.$jaguarCompanyScript.$logExtra) {
            logStr = this.ship.displayName + " => ";
        }

        for (shipCounter = 0; shipCounter < ships.length; shipCounter++) {
            if (this.$jaguarCompanyScript.$logging && this.$jaguarCompanyScript.$logExtra) {
                logStr += ships[shipCounter].displayName + " = " + this.ship.position.distanceTo(ships[shipCounter].position);

                if (shipCounter !== ships.length - 1) {
                    logStr += ", ";
                }
            }

            /* Add up the distances. */
            averageDistance += this.ship.position.distanceTo(ships[shipCounter].position);
        }

        /* Average all the distances. */
        averageDistance /= ships.length;

        if (this.$jaguarCompanyScript.$logging && this.$jaguarCompanyScript.$logExtra) {
            log(this.name, "Avg: " + averageDistance + " (" + logStr + ")");
        }

        return averageDistance;
    };

    /* Find the others ships and set the target to the one furthest away. */
    this.$locateJaguarCompany = function $locateJaguarCompany() {
        var otherShips = system.shipsWithRole("jaguar_company_patrol", this.ship);

        if (otherShips.length === 0) {
            /* We are on our own. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_NOT_FOUND");

            return;
        }

        /* Even though the ships may have been added, all the ships may not have been spawned. */
        if (otherShips.length !== this.$jaguarCompanyScript.$numShips - 1) {
            return;
        }

        /* The last one in the ships array is the one furthest away. */
        this.ship.target = otherShips[otherShips.length - 1];
        this.ship.reactToAIMessage("JAGUAR_COMPANY_FOUND");
    };

    this.$checkJaguarCompanyDistance = function $checkJaguarCompanyDistance() {
        var otherShips = system.shipsWithRole("jaguar_company_patrol", this.ship),
        distance;

        if (otherShips.length === 0) {
            /* We are on our own. */
            return;
        }

        /* Even though the ships may have been added, all the ships may not have been spawned. */
        if (otherShips.length !== this.$jaguarCompanyScript.$numShips - 1) {
            return;
        }

        /* Find the average distance to all the other ships. */
        distance = this.$queryAverageDistance(otherShips);

        /* I would love to create a fuzzy logic controller for this. */
        if (distance < 7500.0) {
            /* If the average distance is less than 7.5km then we have regrouped. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_REGROUPED");
        } else if (distance >= 7500.0 && distance < 15000.0) {
            /* If the average distance is between 7.5km and 15km then we are close. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_CLOSE");
        } else if (distance >= 15000.0 && distance < 22500.0) {
            /* If the average distance is between 15km and 22.5km then we are nearby. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_NEARBY");
        } else {
            /* If the average distance is more than 22.5km then we are far away. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_FAR_AWAY");
        }
    };

    /* Tell everyone to regroup if the average distance to all the other ships is too great. */
    this.$checkJaguarCompanyRegroup = function $checkJaguarCompanyRegroup(maxDistance) {
        var ships = system.shipsWithRole("jaguar_company_patrol", this.ship),
        shipCounter;

        if (ships.length === 0) {
            /* We are on our own. */
            return;
        }

        /* Even though the ships may have been added, all the ships may not have been spawned. */
        if (ships.length !== this.$jaguarCompanyScript.$numShips - 1) {
            return;
        }

        /* Find the average distance to all the other ships. */
        if (this.$queryAverageDistance(ships) >= maxDistance) {
            /* Tell all ships, including ourself, to regroup. */
            for (shipCounter = 0; shipCounter < ships.length; shipCounter++) {
                ships[shipCounter].sendAIMessage("JAGUAR_COMPANY_REGROUP");
            }

            this.ship.reactToAIMessage("JAGUAR_COMPANY_REGROUP");
        }
    };

    /* This does something similar to the groupAttack AI command. */
    this.$jaguarCompanyAttackTarget = function $jaguarCompanyAttackTarget() {
        var otherShips = system.shipsWithRole("jaguar_company_patrol", this.ship),
        otherShip,
        otherShipCounter;

        if (otherShips.length === 0) {
            /* We are on our own. */
            return;
        }

        /* Even though the ships may have been added, all the ships may not have been spawned. */
        if (otherShips.length !== this.$jaguarCompanyScript.$numShips - 1) {
            return;
        }

        for (otherShipCounter = 0; otherShipCounter < otherShips.length; otherShipCounter++) {
            otherShip = otherShips[otherShipCounter];

            /* Other ships may be busy killing baddies. */
            if (!otherShip.$attacking) {
                otherShip.target = this.ship.target;
                otherShip.sendAIMessage("JAGUAR_COMPANY_ATTACK_TARGET");
            }
        }

        /* Respond to our own attack call. */
        this.ship.reactToAIMessage("JAGUAR_COMPANY_ATTACK_TARGET");
    };

    this.$shipAttacking = function $shipAttacking() {
        this.$attacking = true;
    }

    this.$shipStoppedAttacking = function $shipStoppedAttacking() {
        this.$attacking = false;
    }

    /* Locate the base. */
    this.$locateJaguarCompanyBase = function $locateJaguarCompanyBase() {
        var ships = system.shipsWithRole("jaguar_company_base", this.ship);

        if (ships.length === 0) {
            /* If it has gone, just patrol the witchpoint to the planet lane. */
            this.$currentRoute = "JAGUAR_COMPANY_WP_TO_PLANET";
            this.ship.reactToAIMessage("JAGUAR_COMPANY_BASE_NOT_FOUND");
        } else {
            /* Set the target to the base. */
            this.ship.target = ships[0];
            this.ship.reactToAIMessage("JAGUAR_COMPANY_BASE_FOUND");
        }
    };

    /* Won't be needed when v1.78 comes out. */
    this.$detectCascadeWeapon = function $detectCascadeWeapon() {
        var cascadeWeapon, mines, missiles;

        /* Let v1.77+ handle it. */
        if (0 >= oolite.compareVersion("1.77")) {
            return;
        }

        mines = system.shipsWithRole("EQ_QC_MINE", this.ship, 25600.0);
        missiles = system.shipsWithRole("EQ_CASCADE_MISSILE", this.ship, 25600.0);

        if (mines.length !== 0 || missiles.length !== 0) {
            /* First one is the closest. */
            if (mines.length === 0) {
                cascadeWeapon = missiles[0];
            } else if (missiles.length === 0) {
                cascadeWeapon = mines[0];
            } else if (this.ship.position.distanceTo(mines[0].position) < this.ship.position.distanceTo(missiles[0].position)) {
                cascadeWeapon = mines[0];
            } else {
                cascadeWeapon = missiles[0];
            }

            this.ship.target = cascadeWeapon;
            this.ship.reactToAIMessage("CASCADE_WEAPON_DETECTED");
        }
    };

}).call(this);
