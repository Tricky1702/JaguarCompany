/*jslint indent: 4, maxlen: 120, maxerr: 50, white: true, es5: true, undef: true, regexp: true, newcap: true */
/*jshint es5: true, undef: true, eqnull: true, noempty: true, eqeqeq: true, boss: true, loopfunc: true, laxbreak: true,
strict: true, curly: true */
/*global worldScripts, Vector3D */

/* Jaguar Company Miner
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
 * Ship related functions for the miner.
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "jaguar_company_miner.js";
    this.author = "Tricky";
    this.copyright = "© 2012-2013 Richard Thomas Harrison (Tricky)";
    this.license = "CC BY-NC-SA 3.0";
    this.description = "Ship script for the Jaguar Company Miner.";
    this.version = "1.1";

    /* Private variable. */
    var p_miner = {};

    /* Ship event callbacks. */

    /* Initialise various variables on ship birth. */
    this.shipSpawned = function () {
        /* No longer needed after setting up. */
        delete this.shipSpawned;

        /* Initialise the p_miner variable object.
         * Encapsulates all private global data.
         */
        p_miner = {
            /* Cache the world scripts. */
            mainScript : worldScripts["Jaguar Company"],
            attackersScript : worldScripts["Jaguar Company Attackers"],
            /* Local copies of the logging variables. */
            logging : worldScripts["Jaguar Company"].$logging,
            logExtra : worldScripts["Jaguar Company"].$logExtra,
            /* Local copy of the friendList array. */
            friendList : worldScripts["Jaguar Company Attackers"].$friendList
        };

        /* Register this miner as a friendly. */
        p_miner.attackersScript.$addFriendly(this.ship);
        /* Random name for the pilot. Used when talking about attacks and sending a report to Snoopers. */
        this.ship.$pilotName = expandDescription("%N [nom1]");
        /* Get a unique name for the miner. */
        this.ship.displayName = p_miner.mainScript.$uniqueShipName(this.ship.name);
    };

    /* The shipLaunchedEscapePod handler is called when the pilot bails out.
     *
     * INPUT
     *   escapepod - contains the main pod with the pilot.
     */
    this.shipLaunchedEscapePod = function(escapepod)
    {
        /* Identify this pod as containg a member of Jaguar Company. */
        escapepod.$jaguarCompany = true;
        /* Transfer pilot name to the escape pod. */
        escapepod.$pilotName = this.ship.$pilotName;
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

        if (p_miner.friendList.indexOf(attacker.entityPersonality) !== -1 && type === "scrape damage") {
            /* Cancel damage from collision with Jaguar Company ships. */
            this.ship.energy += amount;
        }
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
    this.$saveAIState = function (state) {
        if (typeof state !== "string" || state === "") {
            state = this.ship.AIState;
        }

        p_miner.saveAIState = state;
    };

    /* Recall the saved AI state. */
    this.$recallAIState = function () {
        this.ship.AIState = p_miner.saveAIState;
    };

    /* Set the co-ordinates to the surface of the base. */
    this.$setCoordsToJaguarCompanyBase = function () {
        var base = p_miner.mainScript.$jaguarCompanyBase;

        if (!base || !base.isValid) {
            /* If it has gone, just go to the nearest station. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_BASE_NOT_FOUND");
        } else {
            /* Set the coords to the buoy or the base. */
            this.$setCoordsToEntity(base);
            this.ship.reactToAIMessage("JAGUAR_COMPANY_BASE_FOUND");
        }
    };
}).call(this);
