/*jslint indent: 4, maxlen: 120, maxerr: 50, white: true, es5: true, undef: true, regexp: true, newcap: true */
/*jshint es5: true, undef: true, eqnull: true, noempty: true, eqeqeq: true, boss: true, loopfunc: true, laxbreak: true,
strict: true, curly: true */
/*global randomName, randomInhabitantsDescription, missionVariables, player */

/* jaguar_company_pilot.js
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
 * Jaguar Company Pilot script for delivering escape-pods to a station.
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "jaguar_company_pilot.js";
    this.author = "Tricky";
    this.copyright = "© 2012 Richard Thomas Harrison (Tricky)";
    this.license = "CC BY-NC-SA 3.0";
    this.description = "Jaguar Company Pilot script for delivering escape-pods to a station.";
    this.version = "1.0";

    this.unloadCharacter = function() {
        var insurance,
        bonus = 0,
        message,
        dockedPersonality = player.ship.dockedStation.entityPersonality,
        basePersonality = worldScripts["Jaguar Company"].$jaguarCompanyBase.entityPersonality;

        /* Multiple of 5 Cr for insurance. */
        insurance = 500 + (Math.floor(Math.random() * 40) * 5);
        /* Create the message for the arrival report. */
        message = "For rescuing " + randomName() + " " + randomName() +
            ", a " + randomInhabitantsDescription(false) +
            " and member of Jaguar Company, their insurance pays " + insurance + " ₢.";

        if (dockedPersonality === basePersonality) {
            /* Give a bonus for bringing the pilot back to one of their base's. Multiple of 5Cr. */
            bonus = 100 + (Math.floor(Math.random() * 20) * 5);
            message += " Jaguar Company has also added a bonus of " + bonus + " ₢ for bringing back the pilot.";
        }

        /* Add on the insurance and bonus to the player's credits. */
        player.credits += (insurance + bonus);
        /* Increase the reputation of the player with Jaguar Company *after* launching.
         * You don't want to be in the base when it swaps roles.
         */
        missionVariables.jaguar_company_reputation_post_launch += 5;

        player.addMessageToArrivalReport(expandDescription(message));
    };
}).call(this);
