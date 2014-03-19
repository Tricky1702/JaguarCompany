/*jslint bitwise: true, es5: true, newcap: true, nomen: true, regexp: true, unparam: true, todo: true, white: true,
indent: 4, maxerr: 50, maxlen: 120 */
/*jshint boss: true, curly: true, eqeqeq: true, eqnull: true, es5: true, evil: true, forin: true, laxbreak: true,
loopfunc: true, noarg: true, noempty: true, strict: true, nonew: true, undef: true */
/*global worldScripts */

/* jaguar_company_blackbox.js
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
 * Jaguar Company Black Box equipment activation script.
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "jaguar_company_blackbox.js";
    this.author = "Tricky";
    this.copyright = "© 2012-2013 Richard Thomas Harrison (Tricky)";
    this.license = "CC BY-NC-SA 3.0";
    this.description = "Jaguar Company Black Box equipment activation script.";
    this.version = "1.1";

    /* NAME
     *   activated
     *
     * FUNCTION
     *   Equipment activated with the 'n' key.
     */
    this.activated = function () {
        worldScripts["Jaguar Company"].$blackboxToggle();
    };

    /* NAME
     *   mode
     *
     * FUNCTION
     *   Equipment activated with the 'b' key.
     */
    this.mode = function () {
        worldScripts["Jaguar Company"].$blackboxMode();
    };

    /* NAME
     *   equipmentDamaged
     *
     * FUNCTION
     *   Equipment has become damaged.
     *
     * INPUT
     *   equipment - entity of the equipment
     */
    this.equipmentDamaged = function (equipment) {
        if (equipment === "EQ_JAGUAR_COMPANY_BLACK_BOX") {
            worldScripts["Jaguar Company"].$blackboxASCReset(true);
            worldScripts["Jaguar Company"].$blackboxHoloReset(true);
            player.commsMessage("Black Box Damaged!");
            player.commsMessage("Return to the nearest Jaguar Company Base for repairs.");
        }
    };
}.bind(this)());
