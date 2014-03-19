/*jslint bitwise: true, es5: true, newcap: true, nomen: true, regexp: true, unparam: true, todo: true, white: true,
indent: 4, maxerr: 50, maxlen: 120 */
/*jshint boss: true, curly: true, eqeqeq: true, eqnull: true, es5: true, evil: true, forin: true, laxbreak: true,
loopfunc: true, noarg: true, noempty: true, strict: true, nonew: true, undef: true */
/*global galaxyNumber, worldScripts */

/* Jaguar Company Equipment Conditions
 *
 * Copyright © 2013 Richard Thomas Harrison (Tricky)
 *
 * This work is licensed under the Creative Commons
 * Attribution-Noncommercial-Share Alike 3.0 Unported License.
 *
 * To view a copy of this license, visit
 * http://creativecommons.org/licenses/by-nc-sa/3.0/ or send a letter
 * to Creative Commons, 171 Second Street, Suite 300, San Francisco,
 * California, 94105, USA.
 *
 * Condition script for Jaguar Company equipment.
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "jaguar_company_eq_conditions.js";
    this.author = "Tricky";
    this.copyright = "© 2013 Richard Thomas Harrison (Tricky)";
    this.license = "CC BY-NC-SA 3.0";
    this.description = "Condition script for Jaguar Company equipment.";
    this.version = "1.0";

    /* Equipment Condition script event handlers. */

    /* NAME
     *   allowAwardEquipment
     *
     * FUNCTION
     *   This method is called when the game engine needs to know whether a particular ship can have equipment fitted.
     *   This may be because the player is looking at possible upgrades at a station, or from a call to
     *   ship.canAwardEquipment or ship.awardEquipment, or for other similar reasons. The equipment key and a reference
     *   to the ship entity are passed as parameters. If the method does not exist, or returns a value other than false,
     *   then the equipment may be added or offered for sale (subject to other conditions, of course).
     *
     * INPUTS
     *   eqKey - equipment key
     *   ship - ship entity
     *   context - string
     *     "newShip" - equipment for a ship in a station shipyard (F3 F3)
     *     "npc" - awarding equipment to NPC on ship setup
     *     "purchase" - equipment for purchase on the F3 screen
     *     "scripted" - equipment added by JS or legacy scripts
     *
     * RESULT
     *   result - true if equipment is allowed, false if not
     */
    this.allowAwardEquipment = function (eqKey, ship, context) {
        var mainScript = worldScripts["Jaguar Company"];

        if (eqKey === "EQ_JAGUAR_COMPANY_BLACK_BOX" && ship.isPlayer) {
            if (mainScript.$playerVar.reputation[galaxyNumber] >= mainScript.$reputationBlackbox) {
                /* Only allow for players with the correct reputation level. */
                return true;
            }
        }

        if (eqKey === "EQ_JAGUAR_COMPANY_HARDENED_MISSILE_SMALL" && ship.hasRole("jaguar_company")) {
            /* Only allow Jaguar Company ships to carry this. */
            return true;
        }

        return false;
    };
}.bind(this)());
