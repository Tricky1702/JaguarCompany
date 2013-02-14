/*jslint indent: 4, maxlen: 120, maxerr: 50, white: true, es5: true, undef: true, regexp: true, newcap: true */
/*jshint es5: true, undef: true, eqnull: true, noempty: true, eqeqeq: true, boss: true, loopfunc: true, laxbreak: true,
strict: true, curly: true */
/*global worldScripts, log, Timer, addFrameCallback, removeFrameCallback, isValidFrameCallback, Vector3D */

/* Jaguar Company Base Buoy
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
 * Ship related functions for the base buoy.
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "jaguar_company_base_buoy.js";
    this.author = "Tricky";
    this.copyright = "© 2012-2013 Richard Thomas Harrison (Tricky)";
    this.license = "CC BY-NC-SA 3.0";
    this.description = "Ship script for the Jaguar Company Base Buoy.";
    this.version = "1.2";

    /* Private variable. */
    var p_buoy = {};

    /* Ship script event handlers. */

    /* NAME
     *   shipSpawned
     *
     * FUNCTION
     *   Initialise various variables on ship birth.
     */
    this.shipSpawned = function () {
        /* No longer needed after setting up. */
        delete this.shipSpawned;

        /* Initialise the p_buoy variable object.
         * Encapsulates all private global data.
         */
        p_buoy = {
            /* Cache the world scripts. */
            mainScript : worldScripts["Jaguar Company"],
            attackersScript : worldScripts["Jaguar Company Attackers"],
            /* Local copies of the logging variables. */
            logging : worldScripts["Jaguar Company"].$logging,
            logExtra : worldScripts["Jaguar Company"].$logExtra
        };

        /* Register this buoy as a friendly. */
        p_buoy.attackersScript.$addFriendly(this.ship);
        /* Wait 5 seconds then find the witchpoint. */
        p_buoy.nextTarget = "WITCHPOINT";
        this.$buoyTimerReference = new Timer(this, this.$buoyTimer, 5);
    };

    /* NAME
     *   shipRemoved
     *
     * FUNCTION
     *   Base buoy was removed by script.
     *
     * INPUT
     *   suppressDeathEvent - boolean
     *     true - shipDied() will be called
     *     false - shipDied() will not be called
     */
    this.shipRemoved = function (suppressDeathEvent) {
        if (suppressDeathEvent) {
            return;
        }

        /* Reset the script check. */
        worldScripts["Jaguar Company"].$buoyOK = false;
        /* Force a launch of a new buoy. */
        worldScripts["Jaguar Company"].$buoyLaunched = false;
    };

    /* NAME
     *   entityDestroyed
     *
     * FUNCTION
     *   The base buoy has just become invalid.
     */
    this.entityDestroyed = function () {
        /* Reset the script check. */
        worldScripts["Jaguar Company"].$buoyOK = false;
        /* Force a launch of a new buoy. */
        worldScripts["Jaguar Company"].$buoyLaunched = false;
        /* Stop and remove the frame callback and timer. */
        this.$removeBuoyTimer();
        this.$removeBuoyFCB();
    };

    /* Other global public functions. */

    /* NAME
     *   $removeBuoyTimer
     *
     * FUNCTION
     *   Stop and remove the timer.
     */
    this.$removeBuoyTimer = function () {
        if (this.$buoyTimerReference) {
            if (this.$buoyTimerReference.isRunning) {
                this.$buoyTimerReference.stop();
            }

            delete this.$buoyTimerReference;
        }
    };

    /* NAME
     *   $removeBuoyFCB
     *
     * FUNCTION
     *   Stop and remove the frame callback.
     */
    this.$removeBuoyFCB = function () {
        /* Turn the flashers on. */
        this.ship.lightsActive = true;

        if (this.$buoyFCBReference) {
            if (isValidFrameCallback(this.$buoyFCBReference)) {
                removeFrameCallback(this.$buoyFCBReference);
            }

            delete this.$buoyFCBReference;
        }
    };

    /* NAME
     *   $findJaguarCompanyPatrol
     *
     * FUNCTION
     *   Point the dish at Jaguar Company Patrol.
     */
    this.$findJaguarCompanyPatrol = function () {
        var patrolShips,
        patrolShipsLength,
        patrolShipsCounter,
        midpointPosition;

        /* Search for the patrol ships. */
        patrolShips = system.shipsWithPrimaryRole("jaguar_company_patrol");

        if (!patrolShips.length) {
            /* We are on our own. Point the dish at the witchpoint. */
            return p_buoy.mainScript.$witchpointBuoy.position;
        }

        /* Cache the length. */
        patrolShipsLength = patrolShips.length;

        /* Work out the midpoint position of all the patrol ships. */
        midpointPosition = new Vector3D(0, 0, 0);

        for (patrolShipsCounter = 0; patrolShipsCounter < patrolShipsLength; patrolShipsCounter += 1) {
            midpointPosition = midpointPosition.add(patrolShips[patrolShipsCounter].position);
        }

        midpointPosition.x /= patrolShipsLength;
        midpointPosition.y /= patrolShipsLength;
        midpointPosition.z /= patrolShipsLength;

        return midpointPosition;
    };

    /* NAME
     *   $buoyTimer
     *
     * FUNCTION
     *   Start off with a 'calibration routine' by finding the witchpoint then the planet.
     *   Once 'calibrated', track Jaguar Company patrol ships every minute.
     */
    this.$buoyTimer = function () {
        var buoy = this.ship,
        position,
        vector;

        if (p_buoy.nextTarget === "JAGUAR_COMPANY_PATROL") {
            /* Find the position of then patrol ships. */
            position = this.$findJaguarCompanyPatrol();
        } else if (p_buoy.nextTarget === "PLANET") {
            this.$removeBuoyTimer();
            /* Wait 30 seconds then track Jaguar Company Patrol every 1 minute. */
            p_buoy.nextTarget = "JAGUAR_COMPANY_PATROL";
            this.$buoyTimerReference = new Timer(this, this.$buoyTimer, 30, 60);
            /* Find the position of the main planet. */
            position = system.mainPlanet.position;
        } else {
            this.$removeBuoyTimer();

            if (system.isInterstellarSpace) {
                /* Wait 30 seconds then track Jaguar Company Patrol every 1 minute. */
                p_buoy.nextTarget = "JAGUAR_COMPANY_PATROL";
                this.$buoyTimerReference = new Timer(this, this.$buoyTimer, 30, 60);
            } else {
                /* Wait 30 seconds then find the planet. */
                p_buoy.nextTarget = "PLANET";
                this.$buoyTimerReference = new Timer(this, this.$buoyTimer, 30);
            }

            /* Find the position of the witchpoint. */
            position = p_buoy.mainScript.$witchpointBuoy.position;
        }

        /* Vector pointing towards the target. */
        vector = position.subtract(buoy.position).direction();
        /* Angle to the target from current heading. */
        p_buoy.finalAngle = buoy.heading.angleTo(vector);

        if (p_buoy.finalAngle < 0.087266462599716478846184538424431) {
            /* Already pointing in the rough direction of the target.
             * Looking for a difference of greater than 5 degrees.
             */
            return;
        }

        /* Cross vector for rotate. */
        p_buoy.cross = buoy.heading.cross(vector).direction();
        /* Starting angle. */
        p_buoy.angle = 0;
        /* Should take about 5 seconds (at 60 FPS). */
        p_buoy.deltaAngle = p_buoy.finalAngle / 300;

        if (p_buoy.logging && p_buoy.logExtra) {
            log(this.name, "$buoyTimer::Buoy tracking target...");
        }

        /* Use a frame callback to do this smoothly. */
        this.$buoyFCBReference = addFrameCallback(this.$buoyFCB.bind(this));
    };

    /* NAME
     *   $buoyFCB
     *
     * FUNCTION
     *   Frame callback to slowly rotate the buoy towards Jaguar Company Patrol.
     *
     * INPUT
     *   delta - amount of game clock time past since the last frame
     */
    this.$buoyFCB = function (delta) {
        var buoy = this.ship;

        if (!buoy || !buoy.isValid) {
            /* Buoy can be invalid for 1 frame. */
            this.$removeBuoyTimer();
            this.$removeBuoyFCB();

            return;
        }

        if (delta === 0.0) {
            /* Do nothing if paused. */
            return;
        }

        if (p_buoy.angle >= p_buoy.finalAngle) {
            /* Reached the desired orientation. */
            this.$removeBuoyFCB();

            return;
        }

        /* Rotate by delta angle. */
        buoy.orientation = buoy.orientation.rotate(p_buoy.cross, -p_buoy.deltaAngle);
        /* Update the current angle. */
        p_buoy.angle += p_buoy.deltaAngle;
    };
}).call(this);
