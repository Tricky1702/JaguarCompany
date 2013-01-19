/*jslint indent: 4, maxerr: 50, white: true, browser: false, evil: true, es5: true, undef: true, nomen: true, plusplus: true, bitwise: true, regexp: true, newcap: true, sloppy: false */
/*jshint browser: false, devel: false, es5: true, node: false, bitwise: true, eqnull: true, noempty: true, eqeqeq: true, boss: true, loopfunc: true, laxbreak: true, strict: true, jquery: false */

/* Jaguar Company Base
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
 * Ship related functions for the base AI.
 */

this.name = "jaguar_company_base.js";
this.author = "Tricky";
this.copyright = "© 2012 Tricky";
this.license = "CC BY-NC-SA 3.0";
this.description = "Ship script for the Jaguar Company Base.";
this.version = "1.1";

(function () {
    "use strict";

    /* Private variables. */
    var $jaguarCompanyScript,
    $currentTarget;

    $jaguarCompanyScript = worldScripts["Jaguar Company"];
    $currentTarget = null;

    this.shipSpawned = function () {
        if ($jaguarCompanyScript.$logAIMessages) {
            this.ship.reportAIMessages = true;
        }
    };

    this.shipDied = function (whom, why) {
        if ($jaguarCompanyScript.$logging && $jaguarCompanyScript.$logExtra) {
            log(this.name, "Ship: " + this.ship.displayName +
                " was destroyed by " + whom.displayName +
                ", reason: " + why);
        }
    };

    this.$launchJaguarCompanyPatrol = function () {
        if ($jaguarCompanyScript.$numPatrolShips != $jaguarCompanyScript.$maxPatrolShips) {
            this.ship.launchShipWithRole("jaguar_company_patrol");
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

        if (this.ship.target.hasRole("jaguar_company")) {
            /* Don't attack our own ships. */
            this.ship.target = null;

            return;
        }

        /* Limit comms range to scanner range. */
        otherShips = system.shipsWithRole("jaguar_company", this.ship, this.ship.scannerRange);
        /* Cache the length. */
        otherShipsLength = otherShips.length;

        if (otherShipsLength === 0) {
            /* Return immediately if we are on our own. */
            return;
        }

        for (otherShipsCounter = 0; otherShipsCounter < otherShipsLength; otherShipsCounter++) {
            otherShip = otherShips[otherShipsCounter];

            if (!otherShip.hasHostileTarget) {
                /* The other ship is not currently in attack mode. Give it a target. */
                otherShip.target = this.ship.target;
                otherShip.reactToAIMessage("JAGUAR_COMPANY_ATTACK_TARGET");
            }
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
}).call(this);
