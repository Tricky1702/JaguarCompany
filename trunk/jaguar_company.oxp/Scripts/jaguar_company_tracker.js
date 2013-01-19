/*jslint indent: 4, maxlen: 120, maxerr: 50, white: true, es5: true, undef: true, regexp: true, newcap: true */
/*jshint es5: true, undef: true, eqnull: true, noempty: true, eqeqeq: true, boss: true, loopfunc: true, laxbreak: true,
strict: true, curly: true */
/*global Timer, addFrameCallback, removeFrameCallback, isValidFrameCallback */

/* Jaguar Company Tracker
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
 * Ship/Effect related functions for the patrol tracker.
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "jaguar_company_tracker.js";
    this.author = "Tricky";
    this.copyright = "© 2012 Richard Thomas Harrison (Tricky)";
    this.license = "CC BY-NC-SA 3.0";
    this.description = "Ship script for the Jaguar Company Tracker.";
    this.version = "1.1";

    /* Private variable. */
    var p_tracker = {};

    /* Ship event callbacks. */

    /* Initialise various variables on ship birth. Oolite v1.76.1 and older. */
    this.shipSpawned = function () {
        /* No longer needed after setting up. */
        delete this.shipSpawned;

        /* Common setup. */
        this.$setUp();
        /* Use a frame callback to keep the position constant. */
        this.$trackerFCBReference = addFrameCallback(this.$invisibleTrackerFCB.bind(this));
    };

    /* Initialise various variables on effect birth. Oolite v1.77 and newer. */
    this.effectSpawned = function () {
        /* No longer needed after setting up. */
        delete this.shipSpawned;

        /* Common setup. */
        this.$setUp();
        /* Updated by the visual effect frame callback. */
        p_tracker.material = 0;
        /* Use a frame callback to keep the position constant. */
        this.$trackerFCBReference = addFrameCallback(this.$trackerFCB.bind(this));
    };

    /* Patrol tracker was destroyed.
     *
     * INPUTS
     *   whom - entity that caused the death.
     *   why - cause as a string.
     *
     * Not triggered for Oolite v1.77 and newer visual effects.
     */
    this.shipDied = function (whom, why) {
        var mainScript = worldScripts["Jaguar Company"],
        destroyedBy = whom,
        tracker = this.ship;

        if (whom && whom.isValid) {
            destroyedBy = "ship#" + whom.entityPersonality + " (" + whom.displayName + ")";

            if (system.shipsWithPrimaryRole("jaguar_company_patrol").length > 0) {
                /* Patrol still around. Re-spawn. */
                mainScript.$tracker = mainScript.$jaguarCompanyBase.spawnOne("jaguar_company_tracker");
            }
        }

        if (p_tracker.logging && p_tracker.logExtra) {
            log(this.name, "shipDied::" +
                "ship#" + tracker.entityPersonality + " (" + tracker.displayName + ")" +
                " was destroyed by " + destroyedBy +
                ", reason: " + why);
        }
    };

    /* The patrol tracker has just become invalid or was removed. */
    this.shipRemoved = this.effectRemoved = this.entityDestroyed = this.$removeTrackerRefs = function () {
        /* Stop and remove the timer. */
        if (this.$trackerTimerReference) {
            if (this.$trackerTimerReference.isRunning) {
                this.$trackerTimerReference.stop();
            }

            delete this.$trackerTimerReference;
        }

        /* Stop and remove the frame callback. */
        if (this.$trackerFCBReference) {
            if (isValidFrameCallback(this.$trackerFCBReference)) {
                removeFrameCallback(this.$trackerFCBReference);
            }

            delete this.$trackerFCBReference;
        }
    };

    /* Other global functions. */

    /* Setup the private main variable + some public variables. */
    this.$setUp = function () {
        /* Initialise the p_tracker variable object.
         * Encapsulates all private global data.
         */
        p_tracker = {
            /* Local copies of the logging variables. */
            logging : worldScripts["Jaguar Company"].$logging,
            logExtra : worldScripts["Jaguar Company"].$logExtra,
            /* Updated by the timer. */
            closestPatrolShip : null
        };

        /* Track the patrol ships every 0.25 seconds. */
        this.$trackerTimerReference = new Timer(this, this.$trackerTimer, 0.25, 0.25);
    };

    /* Tracker timer. Updates the closest patrol ship position. */
    this.$trackerTimer = function () {
        var tracker = this.ship || this.visualEffect,
        patrolShips;

        if (!tracker || !tracker.isValid) {
            /* Tracker no longer valid. */
            this.$removeTrackerRefs();

            if (p_tracker.logging && p_tracker.logExtra) {
                log(this.name, "$trackerTimer::Tracker not valid");
            }

            return;
        }

        /* Search for the patrol ships. */
        patrolShips = system.shipsWithPrimaryRole("jaguar_company_patrol", player.ship);

        if (!patrolShips.length) {
            /* We are on our own. Deactivate the black box. */
            worldScripts["Jaguar Company"].$deactivateJaguarCompanyBlackbox();

            if (p_tracker.logging && p_tracker.logExtra) {
                log(this.name, "$trackerTimer::Tracker removed - no patrol ships");
            }

            return;
        }

        /* Update the closest patrol ship. */
        p_tracker.closestPatrolShip = patrolShips[0];
    };

    /* Tracker frame callback.
     *
     * Used by Oolite v1.76.1 or older.
     *
     * INPUT
     *   delta - amount of game clock time past since the last frame.
     */
    this.$invisibleTrackerFCB = function (delta) {
        var tracker = this.ship,
        cps = p_tracker.closestPatrolShip,
        distance;

        if (!tracker || !tracker.isValid) {
            /* Tracker can be invalid for 1 frame. */
            this.$removeTrackerRefs();

            return;
        }

        if (delta === 0.0 || !cps || !cps.isValid) {
            /* Do nothing if paused or the position of the closest patrol ship has not been setup. */
            return;
        }

        /* Distance above the closest patrol ship. */
        distance = 5 + cps.collisionRadius;
        /* Keep the tracker above the closest patrol ship. */
        tracker.position = cps.position.add(cps.orientation.vectorUp().multiply(distance));
    };

    /* Tracker frame callback.
     *
     * Used for visual effects.
     *
     * INPUT
     *   delta - amount of game clock time past since the last frame.
     */
    this.$trackerFCB = function (delta) {
        var tracker = this.visualEffect,
        cps = p_tracker.closestPatrolShip,
        PS,
        distance,
        vector,
        angle,
        cross;

        if (!tracker || !tracker.isValid) {
            /* Tracker can be invalid for 1 frame. */
            this.$removeTrackerRefs();

            return;
        }

        if (delta === 0.0 || !cps || !cps.isValid) {
            /* Do nothing if paused or the closest patrol ship has not been setup. */
            return;
        }

        /* Player ship object. */
        PS = player.ship;
        /* Vector pointing towards the target. */
        vector = cps.position.subtract(PS.position).direction();

        if (vector.dot(PS.heading) >= 0) {
            p_tracker.material = 0;
        } else {
            p_tracker.material = 1;
        }

        if (!p_tracker.material) {
            /* Change the tracker colour to be green. */
            tracker.setMaterials({
                jaguar_company_tracker : {
                    diffuse_color : ["0", "0.667", "0", "1"],
                    diffuse_map : "jaguar_company_tracker_diffuse.png",
                    emission_color : ["0", "0.05", "0", "1"],
                    shininess : "5",
                    specular_color : ["0", "0.2", "0", "1"]
                }
            });
        } else if (p_tracker.material) {
            /* Change the tracker colour to be red. */
            tracker.setMaterials({
                jaguar_company_tracker : {
                    diffuse_color : ["0.667", "0", "0", "1"],
                    diffuse_map : "jaguar_company_tracker_diffuse.png",
                    emission_color : ["0.05", "0", "0", "1"],
                    shininess : "5",
                    specular_color : ["0.2", "0", "0", "1"]
                }
            });
        }

        /* Distance in front of the player. */
        distance = 100 + PS.collisionRadius;
        /* Keep the tracker in front of the player. */
        tracker.position = PS.position.add(PS.heading.multiply(distance));
        /* Angle to the target from current heading. */
        angle = PS.heading.angleTo(vector);
        /* Cross vector for rotate. */
        cross = PS.heading.cross(vector).direction();
        /* Rotate the tracker by the angle. */
        tracker.orientation = PS.orientation.rotate(cross, -angle);
    };
}).call(this);
