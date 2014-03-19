/*jslint bitwise: true, es5: true, newcap: true, nomen: true, regexp: true, unparam: true, todo: true, white: true,
indent: 4, maxerr: 50, maxlen: 120 */
/*jshint boss: true, curly: true, eqeqeq: true, eqnull: true, es5: true, evil: true, forin: true, laxbreak: true,
loopfunc: true, noarg: true, noempty: true, strict: true, nonew: true, undef: true */
/*global expandDescription, worldScripts */

/* Jaguar Company Miner
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
 * Ship related functions for the miner.
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "jaguar_company_miner.js";
    this.copyright = "© 2012-2014 Richard Thomas Harrison (Tricky)";
    this.description = "Ship script for the Jaguar Company Miner.";
    this.version = "1.2";

    /* Private variable. */
    var p_miner = {};

    /* Ship script event handlers. */

    /* NAME
     *   shipSpawned
     *
     * FUNCTION
     *   Initialise various variables on ship birth.
     */
    this.shipSpawned = function () {
        var base;

        /* Initialise the p_miner variable object.
         * Encapsulates all private global data.
         */
        p_miner = {
            /* Cache the world scripts. */
            mainScript : worldScripts["Jaguar Company"],
            shipsScript : worldScripts["Jaguar Company Ships"],
            /* Local copies of the logging variables. */
            logging : worldScripts["Jaguar Company"].$logging,
            logExtra : worldScripts["Jaguar Company"].$logExtra,
            /* Local copy of the friendList array. */
            friendList : worldScripts["Jaguar Company Ships"].$friendList
        };

        /* Register this ship as a friendly. */
        p_miner.shipsScript.$addFriendly({
            ship : this.ship,
            /* Random name for the pilot. Used when talking about attacks and sending a report to Snoopers. */
            pilotName : expandDescription("%N [nom1]"),
            /* Get a unique name for the patrol ship. */
            shipName : p_miner.mainScript.$uniqueShipName()
        });

        base = p_miner.mainScript.$jaguarCompanyBase;

        if (base && base.isValid) {
            /* Update the base script miner references. */
            base.script.$minerOK = false;
            base.script.$miner = this.ship;
        }

        /* No longer needed after setting up. */
        delete this.shipSpawned;
    };

    /* Other global public functions. */

    /* AI functions. */

    /* NAME
     *   $setCoordsToJaguarCompanyBuoy
     *
     * FUNCTION
     *   Set the co-ordinates to the surface of the buoy or the base.
     */
    this.$setCoordsToJaguarCompanyBuoy = function () {
        var base = p_miner.mainScript.$jaguarCompanyBase;

        if (!base || !base.isValid) {
            /* If the base has gone, just go to the nearest station. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_BASE_NOT_FOUND");
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
}.bind(this)());
