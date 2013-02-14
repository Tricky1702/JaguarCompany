/*jslint indent: 4, maxlen: 120, maxerr: 50, white: true, es5: true, undef: true, regexp: true, newcap: true */
/*jshint es5: true, undef: true, eqnull: true, noempty: true, eqeqeq: true, boss: true, loopfunc: true, laxbreak: true,
strict: true, curly: true */
/*global worldScripts */

/* jaguar_company_blackbox.js
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

    /* Private variable. */
    var jaguar_company_blackbox_activated = false;

    /* NAME
     *   activated
     *
     * FUNCTION
     *   Equipment script for the Black Box.
     */
    this.activated = function() {
        var mainScript = worldScripts["Jaguar Company"],
        activated = jaguar_company_blackbox_activated;

        if (!mainScript.$tracker || !mainScript.$tracker.isValid) {
            activated = false;
        }

        if (!activated) {
            activated = mainScript.$activateJaguarCompanyBlackbox();
        } else {
            activated = mainScript.$deactivateJaguarCompanyBlackbox();
        }

        jaguar_company_blackbox_activated = activated;
    };
}).call(this);
