/*jslint indent: 4, maxerr: 50, white: true, browser: false, evil: true, undef: true, nomen: true, plusplus: true, bitwise: true, regexp: true, newcap: true, sloppy: true */

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
** Based on tgGeneric_externalMissiles.js by Thargoid
**
** All I've really done is clean up the code.
** In the future it will hold ship specific code, not just missile code.
*/

this.name = "jaguar_company_ship.js";
this.author = "Tricky";
this.copyright = "(C) 2012 Tricky";
this.license = "CC BY-NC-SA 3.0";
this.description = "Ship script for the Jaguar Company.";
this.version = "1.0.1";

this.shipSpawned = function () {
    // just to ensure ship is fully loaded with selected missile type and nothing else
    var addCounter;

    if (this.ship.scriptInfo.missileRole) {
        // missileRole should be defined in shipdata.plist
        this.missileRole = this.ship.scriptInfo.missileRole;
    } else {
        // default to standard missile if not
        this.missileRole = "EQ_HARDENED_MISSILE";
    }

    if (this.ship.scriptInfo.initialMissiles) {
        this.initialMissiles = parseInt(this.ship.scriptInfo.initialMissiles, 10);
    } else {
        this.initialMissiles = this.ship.missileCapacity;
    }

    if (this.ship.missiles.length > 0) {
        this.ship.awardEquipment("EQ_MISSILE_REMOVAL"); // remove all spawning missiles and restock with selected ones.
    }

    for (addCounter = 0; addCounter < this.initialMissiles; addCounter++) {
        this.ship.awardEquipment(this.missileRole);
    }
};

this.shipFiredMissile = function (missile, target) {
    var subCounter;

    if (this.ship.subEntities.length === 0) {
        return; // if we've run out of sub-ents before we run out of missiles
    }

    subCounter = this.ship.subEntities.length - 1; // Set counter to number of sub-ents minus 1 (as entity array goes up from zero)

    for (subCounter = this.ship.subEntities.length - 1; subCounter >= 0; subCounter--) {
        if (this.ship.subEntities[subCounter].hasRole(missile.primaryRole)) {
            // if the sub-ent is the same as the missile being fired
            missile.position = this.localToGlobal(this.ship.subEntities[subCounter].position); // move the fired missile to the sub-ent position
            missile.orientation = this.ship.subEntities[subCounter].orientation.multiply(this.ship.orientation); // point the missile in the right direction
            missile.desiredSpeed = missile.maxSpeed;
            this.ship.subEntities[subCounter].remove(); // remove the sub-ent version of the missile

            break; // come out of the loop, as we've done our swap
        }
    }
};

this.localToGlobal = function (position) {
    // sub-ent position is relative to mother, but for swapping we need the absolute global position
    var orientation = this.ship.orientation;

    return this.ship.position.add(position.rotateBy(orientation));
};

this.shipTakingDamage = function (amount, fromEntity, damageType) {
    var missileCounter, removeCounter, subCounter;

    if (this.ship.missiles.length === 0 && this.ship.subEntities.length === 0) {
        // if we're all out of missiles and any sub-entities, bail out.
        return;
    }

    this.missileSubs = 0;

    // Initially set subCounter to number of sub-ents minus 1 (as entity array goes up from zero)
    for (subCounter = this.ship.subEntities.length - 1; subCounter >= 0; subCounter--) {
        if (this.ship.subEntities[subCounter].hasRole(this.missileRole)) {
            // if the sub-ent is a missile, count it
            this.missileSubs++;
        }
    }

    if (this.missileSubs === 0 && this.ship.subEntities.length === 0) {
        // if we're all out of missiles and missile sub-entities, bail out.
        return;
    }

    if (this.missileSubs < this.ship.missiles.length) {
        // if we've got more missiles than sub-entity missiles
        this.ship.awardEquipment("EQ_MISSILE_REMOVAL"); // get rid of all missiles

        if (this.missileSubs > 0) {
            for (missileCounter = 0; missileCounter < this.missileSubs; missileCounter++) {
                // restock with the correct number of selected missile
                this.ship.awardEquipment(this.missileRole);
            }
        }

        return;
    }

    if (this.missileSubs > this.ship.missiles.length) {
        // if we've got less missiles than sub-entity missiles
        this.difference = this.missileSubs - this.ship.missiles.length;

        for (removeCounter = 0; removeCounter < this.difference; removeCounter++) {
            // loop through however many subs we need to remove
            // Initially set subCounter to number of sub-ents minus 1 (as entity array goes up from zero)
            for (subCounter = this.ship.subEntities.length - 1; subCounter >= 0; subCounter--) {
                if (this.ship.subEntities[subCounter].hasRole(this.missileRole)) {
                    // if the sub-ent is a missile, remove it
                    this.ship.subEntities[subCounter].remove();

                    break;
                }
            }
        }

        return;
    }
};
