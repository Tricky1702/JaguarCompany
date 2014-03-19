/*jslint bitwise: true, es5: true, newcap: true, nomen: true, regexp: true, unparam: true, todo: true, white: true,
indent: 4, maxerr: 50, maxlen: 120 */
/*jshint boss: true, curly: true, eqeqeq: true, eqnull: true, es5: true, evil: true, forin: true, laxbreak: true,
loopfunc: true, noarg: true, noempty: true, strict: true, nonew: true, undef: true */
/*global Vector3D, expandDescription, galaxyNumber, worldScripts */

/* Jaguar Company Tug
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
 * Ship related functions for the tug.
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "jaguar_company_tug.js";
    this.copyright = "© 2012-2014 Richard Thomas Harrison (Tricky)";
    this.description = "Ship script for the Jaguar Company Tug.";
    this.version = "1.2";

    /* Private variable. */
    var p_tug = {};

    /* Ship script event handlers. */

    /* NAME
     *   shipSpawned
     *
     * FUNCTION
     *   Initialise various variables on ship birth.
     */
    this.shipSpawned = function () {
        var base;

        /* Initialise the p_tug variable object.
         * Encapsulates all private global data.
         */
        p_tug = {
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
        p_tug.shipsScript.$addFriendly({
            ship : this.ship,
            /* Random name for the pilot. Used when talking about attacks and sending a report to Snoopers. */
            pilotName : expandDescription("%N [nom1]"),
            /* Get a unique name for the patrol ship. */
            shipName : p_tug.mainScript.$uniqueShipName()
        });

        base = p_tug.mainScript.$jaguarCompanyBase;

        if (base && base.isValid) {
            /* Update the base script tug references. */
            base.script.$tugOK = false;
            base.script.$tug = this.ship;
        }

        /* No longer needed after setting up. */
        delete this.shipSpawned;
    };

    /* NAME
     *   shipRemoved
     *
     * FUNCTION
     *   Tug was removed by script.
     *
     * INPUT
     *   suppressDeathEvent - boolean
     *     true - shipDied() will not be called
     *     false - shipDied() will be called
     */
    this.shipRemoved = function (suppressDeathEvent) {
        var base;

        if (suppressDeathEvent) {
            return;
        }

        base = worldScripts["Jaguar Company"].$jaguarCompanyBase;

        if (base && base.isValid) {
            /* Reset the script check. */
            base.script.$buoyOK = false;

            if (!base.script.$buoy || !base.script.$buoy.isValid) {
                /* Not released the buoy yet, reset the launch status of the buoy. */
                base.script.$buoyLaunched = false;
            }
        }
    };

    /* NAME
     *   entityDestroyed
     *
     * FUNCTION
     *   The tug has just become invalid.
     */
    this.entityDestroyed = function () {
        var base = worldScripts["Jaguar Company"].$jaguarCompanyBase;

        if (base && base.isValid) {
            /* Reset the script check. */
            base.script.$buoyOK = false;

            if (!base.script.$buoy || !base.script.$buoy.isValid) {
                /* Not released the buoy yet, reset the launch status of the buoy. */
                base.script.$buoyLaunched = false;
            }
        }
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
        var base = p_tug.mainScript.$jaguarCompanyBase;

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

    /* NAME
     *   $setCoordsForBuoyDropOff
     *
     * FUNCTION
     *   Set the co-ordinates for the buoy drop-off position.
     */
    this.$setCoordsForBuoyDropOff = function () {
        var base = p_tug.mainScript.$jaguarCompanyBase,
        distance = 10000;

        if (!base || !base.isValid) {
            /* If it has gone, just go to the nearest station. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_BUOY_DROP_OFF_NOT_FOUND");

            return;
        }

        /* Calculate the base surface to buoy centre distance, not centre to centre. */
        distance += base.collisionRadius;
        /* Add on desired range. */
        distance += 20;

        /* Set the ending position for the tug in front of the base. */
        this.ship.savedCoordinates = base.position.add(base.heading.multiply(distance));
        this.ship.reactToAIMessage("JAGUAR_COMPANY_BUOY_DROP_OFF_FOUND");
    };

    /* NAME
     *   $releaseBuoy
     *
     * FUNCTION
     *   Release the buoy by removing the sub-entity and replacing with a real buoy.
     */
    this.$releaseBuoy = function () {
        var tug = this.ship,
        subEntities = tug.subEntities,
        base = p_tug.mainScript.$jaguarCompanyBase,
        buoyPosition,
        buoyRole,
        buoy;

        /* We make the assumption that the buoy is the 1st sub-entity. */
        if (!subEntities.length || !subEntities[0].hasRole("jaguar_company_base_buoy_subent")) {
            /* The buoy isn't there??? */
            return;
        }

        /* Calculate the real-world position for the buoy. */
        buoyPosition = tug.position.add(subEntities[0].position.rotateBy(tug.orientation));
        /* Remove the buoy sub-entity quietly: don't trigger 'shipDied' in the ship script. */
        subEntities[0].remove(true);

        if (p_tug.mainScript.$playerVar.reputation[galaxyNumber] < p_tug.mainScript.$reputationHelper) {
            /* No beacon. Scanner colour is solid white. */
            buoyRole = "jaguar_company_base_buoy_no_beacon";
        } else {
            /* Beacon. Standard scanner colour for a buoy. */
            buoyRole = "jaguar_company_base_buoy_beacon";
        }

        /* Create the real buoy and add it to the system. */
        buoy = tug.spawnOne(buoyRole);
        buoy.position = buoyPosition;
        /* Keep the original orientation. */
        buoy.orientation = tug.orientation;

        if (base && base.isValid) {
            /* Update the base script buoy reference. */
            base.script.$buoy = buoy;
        }

        /* Stop the kick in velocity from spawning the buoy and it colliding with the tug.
         * In effect this will put the tug into reverse.
         */
        tug.velocity = new Vector3D(0, 0, 0).subtract(tug.vectorForward.multiply(tug.maxSpeed));
    };
}.bind(this)());
