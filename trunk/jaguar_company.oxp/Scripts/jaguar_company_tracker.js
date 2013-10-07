/*jslint bitwise: true, es5: true, newcap: true, nomen: true, regexp: true, unparam: true, todo: true, white: true,
indent: 4, maxerr: 50, maxlen: 120 */
/*jshint boss: true, curly: true, eqeqeq: true, eqnull: true, es5: true, evil: true, forin: true, laxbreak: true,
loopfunc: true, noarg: true, noempty: true, strict: true, nonew: true, undef: true */
/*global Timer, addFrameCallback, isValidFrameCallback, log, player, removeFrameCallback, system, worldScripts */

/* Jaguar Company Tracker
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
 * Ship/Effect related functions for the patrol tracker.
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "jaguar_company_tracker.js";
    this.author = "Tricky";
    this.copyright = "© 2012-2013 Richard Thomas Harrison (Tricky)";
    this.license = "CC BY-NC-SA 3.0";
    this.description = "Ship script for the Jaguar Company Tracker.";
    this.version = "1.2";

    /* Private variable. */
    var p_tracker = {};

    /* Ship script event handlers. */

    /* NAME
     *   shipSpawned
     *
     * FUNCTION
     *   Initialise various variables on ship birth. Oolite v1.76.1 and older.
     */
    this.shipSpawned = function () {
        /* Common setup. */
        this.$setUp();
        /* Use a frame callback to keep the position constant. */
        this.$trackerFCBReference = addFrameCallback(this.$invisibleTrackerFCB.bind(this));

        /* No longer needed after setting up. */
        delete this.shipSpawned;
        delete this.effectSpawned;
        delete this.$visualTrackerFCB;
    };

    /* NAME
     *   effectSpawned
     *
     * FUNCTION
     *   Initialise various variables on effect birth. Oolite v1.77 and newer.
     */
    this.effectSpawned = function () {
        /* Common setup. */
        this.$setUp();
        /* Use a frame callback to keep the position constant. */
        this.$trackerFCBReference = addFrameCallback(this.$visualTrackerFCB.bind(this));

        /* No longer needed after setting up. */
        delete this.shipSpawned;
        delete this.effectSpawned;
        delete this.$invisibleTrackerFCB;
    };

    /* NAME
     *   shipDied
     *
     * FUNCTION
     *   Patrol tracker was destroyed.
     *
     *   Not triggered for Oolite v1.77 and newer visual effects.
     *
     * INPUTS
     *   whom - entity that caused the death
     *   why - cause as a string
     */
    this.shipDied = function (whom, why) {
        var destroyedBy = whom,
        tracker = this.ship,
        patrolShips;

        if (whom && whom.isValid) {
            destroyedBy = "ship#" + whom.entityPersonality + " (" + whom.displayName + ")";
            patrolShips = system.shipsWithPrimaryRole("jaguar_company_patrol");

            if (patrolShips.length > 0) {
                /* Patrol still around. Re-spawn. */
                worldScripts["Jaguar Company"].$tracker = patrolShips[0].spawnOne("jaguar_company_tracker");
            }
        }

        if (p_tracker.logging && p_tracker.logExtra) {
            log(this.name, "shipDied::" +
                "ship#" + tracker.entityPersonality + " (" + tracker.displayName + ")" +
                " was destroyed by " + destroyedBy +
                ", reason: " + why);
        }
    };

    /* NAME
     *   shipRemoved, effectRemoved, entityDestroyed and $removeTrackerRefs
     *
     * FUNCTION
     *   The patrol tracker has just become invalid or was removed.
     */
    this.shipRemoved = this.effectRemoved = this.entityDestroyed = this.$removeTrackerRefs = function () {
        /* Stop and remove the timer. */
        if (this.$trackerTimerReference) {
            if (this.$trackerTimerReference.isRunning) {
                this.$trackerTimerReference.stop();
            }

            this.$trackerTimerReference = null;
        }

        /* Stop and remove the frame callback. */
        if (this.$trackerFCBReference) {
            if (isValidFrameCallback(this.$trackerFCBReference)) {
                removeFrameCallback(this.$trackerFCBReference);
            }

            this.$trackerFCBReference = null;
        }
    };

    /* Other global functions. */

    /* NAME
     *   $setUp
     *
     * FUNCTION
     *   Setup the private main variable + some public variables.
     */
    this.$setUp = function () {
        /* Initialise the p_tracker variable object.
         * Encapsulates all private global data.
         */
        p_tracker = {
            /* Cache the main world script. */
            mainScript : worldScripts["Jaguar Company"],
            /* Local copies of the logging variables. */
            logging : worldScripts["Jaguar Company"].$logging,
            logExtra : worldScripts["Jaguar Company"].$logExtra,
            /* Updated by the timer. */
            closestPatrolShip : null,
            /* Material used by the visual effect. */
            material : "none"
        };

        /* Track the patrol ships every 0.25 seconds. */
        this.$trackerTimerReference = new Timer(this, this.$trackerTimer, 0.25, 0.25);
    };

    /* NAME
     *   $trackerTimer
     *
     * FUNCTION
     *   Tracker timer. Updates the closest patrol ship position.
     *
     *   Called every 0.25 seconds.
     */
    this.$trackerTimer = function () {
        var tracker = this.ship || this.visualEffect,
        playerShip,
        patrolShips;

        if (!tracker || !tracker.isValid) {
            /* Tracker no longer valid. */
            this.$removeTrackerRefs();

            if (p_tracker.logging && p_tracker.logExtra) {
                log(this.name, "$trackerTimer::Tracker not valid");
            }

            return;
        }

        /* Player ship object. */
        playerShip = player.ship;

        if (!playerShip || !playerShip.isValid) {
            /* If the player has died, reset the tracker. */
            p_tracker.mainScript.$blackboxASCReset(false);
            p_tracker.mainScript.$blackboxHoloReset(false);

            return;
        }

        /* Search for the patrol ships. Sort by distance from the player. */
        patrolShips = system.shipsWithPrimaryRole("jaguar_company_patrol", playerShip);

        if (!patrolShips.length) {
            /* We are on our own. Deactivate the black box. */
            p_tracker.mainScript.$blackboxASCReset(true);
            p_tracker.mainScript.$blackboxHoloReset(true);

            if (p_tracker.logging && p_tracker.logExtra) {
                log(this.name, "$trackerTimer::Tracker removed - no patrol ships");
            }

            return;
        }

        /* Update the closest patrol ship reference. */
        p_tracker.closestPatrolShip = patrolShips[0];
    };

    /* NAME
     *   $invisibleTrackerFCB
     *
     * FUNCTION
     *   Tracker frame callback.
     *
     *   Used by Oolite v1.76.1 and older.
     *
     * INPUT
     *   delta - amount of game clock time past since the last frame
     */
    this.$invisibleTrackerFCB = function (delta) {
        var tracker = this.ship,
        closestPatrolShip = p_tracker.closestPatrolShip,
        playerShip,
        distance;

        if (!tracker || !tracker.isValid) {
            /* Tracker can be invalid for 1 frame. */
            this.$removeTrackerRefs();

            return;
        }

        if (delta === 0.0 || !closestPatrolShip || !closestPatrolShip.isValid) {
            /* Do nothing if paused or the position of the closest patrol ship has not been setup. */
            return;
        }

        /* Player ship object. */
        playerShip = player.ship;

        if (!playerShip || !playerShip.isValid) {
            /* If the player has died, reset the tracker. */
            p_tracker.mainScript.$blackboxASCReset(false);

            return;
        }

        /* Distance above the closest patrol ship. */
        distance = 5 + closestPatrolShip.collisionRadius;
        /* Keep the tracker above the closest patrol ship. */
        tracker.position = closestPatrolShip.position.add(closestPatrolShip.orientation.vectorUp().multiply(distance));
    };

    /* NAME
     *   $visualTrackerFCB
     *
     * FUNCTION
     *   Tracker frame callback.
     *
     *   Used by Oolite v1.77 and newer for visual effects.
     *
     * INPUT
     *   delta - amount of game clock time past since the last frame
     */
    this.$visualTrackerFCB = function (delta) {
        var tracker = this.visualEffect,
        closestPatrolShip = p_tracker.closestPatrolShip,
        playerShip,
        distance,
        vector,
        angle,
        cross;

        if (!tracker || !tracker.isValid) {
            /* Tracker can be invalid for 1 frame. */
            this.$removeTrackerRefs();

            return;
        }

        if (delta === 0.0 || !closestPatrolShip || !closestPatrolShip.isValid) {
            /* Do nothing if paused or the closest patrol ship has not been setup. */
            return;
        }

        /* Player ship object. */
        playerShip = player.ship;

        if (!playerShip || !playerShip.isValid) {
            /* If the player has died, reset the tracker. */
            p_tracker.mainScript.$blackboxHoloReset(false);

            return;
        }

        if (playerShip.viewDirection !== "VIEW_FORWARD" && p_tracker.material !== "off") {
            p_tracker.material = "off";
            /* Make the tracker small. */
            tracker.scale(0.001);
            /* Move the tracker so it can't be seen. Centre of the player ship should do it. */
            tracker.position = playerShip.position;
        } else if (playerShip.viewDirection === "VIEW_FORWARD") {
            /* Scale the tracker to it's original size. */
            tracker.scale(1.0);
            /* Vector pointing towards the target. */
            vector = closestPatrolShip.position.subtract(playerShip.position).direction();

            if (vector.dot(playerShip.heading) >= 0 && p_tracker.material !== "green") {
                p_tracker.material = "green";
                /* Change the tracker colour to be green. */
                tracker.setMaterials({
                    "jaguar_company_tracker" : {
                        diffuse_color : ["0", "0.667", "0", "1"],
                        diffuse_map : "jaguar_company_tracker_diffuse.png",
                        emission_color : ["0", "0.05", "0", "1"],
                        shininess : "5",
                        specular_color : ["0", "0.2", "0", "1"]
                    }
                });
            } else if (vector.dot(playerShip.heading) < 0 && p_tracker.material !== "red") {
                p_tracker.material = "red";
                /* Change the tracker colour to be red. */
                tracker.setMaterials({
                    "jaguar_company_tracker" : {
                        diffuse_color : ["0.667", "0", "0", "1"],
                        diffuse_map : "jaguar_company_tracker_diffuse.png",
                        emission_color : ["0.05", "0", "0", "1"],
                        shininess : "5",
                        specular_color : ["0.2", "0", "0", "1"]
                    }
                });
            }

            /* Distance in front of the player. */
            distance = 100 + playerShip.collisionRadius;
            /* Keep the tracker in front of the player. */
            tracker.position = playerShip.position.add(playerShip.heading.multiply(distance));
            /* Angle to the target from current heading. */
            angle = playerShip.heading.angleTo(vector);
            /* Cross vector for rotate. */
            cross = playerShip.heading.cross(vector).direction();
            /* Rotate the tracker by the angle. */
            tracker.orientation = playerShip.orientation.rotate(cross, -angle);
        }
    };
}.bind(this)());
