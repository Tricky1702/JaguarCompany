/*jslint bitwise: true, es5: true, newcap: true, nomen: true, regexp: true, unparam: true, todo: true, white: true,
indent: 4, maxerr: 50, maxlen: 120 */
/*jshint boss: true, curly: true, eqeqeq: true, eqnull: true, es5: true, evil: true, forin: true, laxbreak: true,
loopfunc: true, noarg: true, noempty: true, strict: true, nonew: true, undef: true */
/*global Math, expandDescription, galaxyNumber, player, randomInhabitantsDescription, worldScripts */

/* jaguar_company_pilot.js
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
 * Jaguar Company Pilot script for delivering escape-pods to a station.
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "jaguar_company_pilot.js";
    this.author = "Tricky";
    this.copyright = "© 2012-2013 Richard Thomas Harrison (Tricky)";
    this.license = "CC BY-NC-SA 3.0";
    this.description = "Jaguar Company Pilot script for delivering escape-pods to a station.";
    this.version = "1.2";

    /* NAME
     *   unloadCharacter
     *
     * FUNCTION
     *   Shows a rescue message for Jaguar Company pilots you deliver back to a station.
     *   Also increases reputation.
     */
    this.unloadCharacter = function () {
        var mainScript = worldScripts["Jaguar Company"],
        insurance,
        bonus = 0,
        message,
        pilotName;

        if (mainScript.$pilotsRescued.length) {
            /* Get the name of one of the rescued pilots. */
            pilotName = mainScript.$pilotsRescued.shift();
        } else {
            /* Random name. Shouldn't be executed. */
            pilotName = expandDescription("%N [nom1]");
        }

        /* Multiple of 5 Cr for insurance. */
        insurance = 500 + (Math.floor(Math.random() * 40) * 5);
        /* Create the message for the arrival report. */
        message = "For rescuing " + pilotName + ", a " + randomInhabitantsDescription(false) +
            " and member of Jaguar Company, their insurance pays " + insurance + " ₢.";

        if (player.ship.dockedStation.hasRole("jaguar_company_base")) {
            /* Give a bonus for bringing the pilot back to one of their base's. Multiple of 5 Cr. */
            bonus = 100 + (Math.floor(Math.random() * 20) * 5);
            message += " Jaguar Company has also added a bonus of " + bonus +
            " ₢ for bringing the pilot back to their base.";
            /* Increase the reputation of the player with Jaguar Company *after* launching.
             * You don't want to be in the base when it swaps roles.
             */
            if (mainScript.$playerVar.delayedAward !== "number") {
                mainScript.$playerVar.delayedAward = 0;
            }

            mainScript.$playerVar.delayedAward += 6;
        } else {
            /* Increase the reputation of the player with Jaguar Company. */
            mainScript.$playerVar.reputation[galaxyNumber] += 4;
        }

        /* Add on the insurance and bonus to the player's credits. */
        player.credits += (insurance + bonus);
        /* Show message on arrival. */
        player.addMessageToArrivalReport(expandDescription(message));
    };
}.bind(this)());
