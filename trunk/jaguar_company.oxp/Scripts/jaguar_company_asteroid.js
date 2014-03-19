/*jslint bitwise: true, es5: true, newcap: true, nomen: true, regexp: true, unparam: true, todo: true, white: true,
indent: 4, maxerr: 50, maxlen: 120 */
/*jshint boss: true, curly: true, eqeqeq: true, eqnull: true, es5: true, evil: true, forin: true, laxbreak: true,
loopfunc: true, noarg: true, noempty: true, strict: true, nonew: true, undef: true */
/*global Math, Vector3D, log, system, worldScripts */

/* Jaguar Company Asteroid
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
 * Ship related functions for the asteroids cluttering the space around the base.
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "jaguar_company_asteroid.js";
    this.author = "Tricky";
    this.copyright = "© 2012-2013 Richard Thomas Harrison (Tricky)";
    this.license = "CC BY-NC-SA 3.0";
    this.description = "Ship script for the asteroids cluttering the space around the base.";
    this.version = "1.2";

    /* Ship script event handlers. */

    /* NAME
     *   shipSpawned
     *
     * FUNCTION
     *   Move the asteroid to a safe distance from the base launch corridor on birth.
     */
    this.shipSpawned = function () {
        var mainScript = worldScripts["Jaguar Company"],
        asteroid = this.ship,
        base = mainScript.$jaguarCompanyBase,
        /* Increased to 12km for the first try. */
        safeDistance = 11000,
        asteroidMoved = 0,
        distance,
        totalDistanceMoved = 0,
        oldDistance,
        newDistance,
        direction,
        entities,
        ok = false;

        if (!base || !base.isValid ||
            (!asteroid.hasRole("jaguar_company_asteroid") && !asteroid.hasRole("jaguar_company_boulder"))) {
            /* Not an asteroid spawned by the base. */
            return;
        }

        /* NAME
         *   $validEntity
         *
         * FUNCTION
         *   Stop warnings about anonymous local functions within loops.
         *   Used by 'system.filteredEntities'. Returns true for any valid entity.
         *
         * INPUT
         *   entity - entity to check
         */
        function $validEntity(entity) {
            return (entity.isValid);
        }

        /* Don't drift. Just leave it rotating. */
        asteroid.velocity = new Vector3D(0, 0, 0);
        /* Work out if it is near to the base during spawning. */
        distance = asteroid.position.distanceTo(base.position);

        if (distance < safeDistance) {
            direction = asteroid.position.subtract(base.position).direction();

            /* Check the launch corridor. (0.86 from src/Core/Entities/DockEntity.m) */
            if (direction.dot(base.heading) > 0.86) {
                /* Asteroids added too close to the base can block launches.
                 * Move them to a safe distance (+/- 500m) from the base.
                 * Safe distance is altered if there is another entity nearby.
                 */
                newDistance = oldDistance = distance;

                while (!ok) {
                    asteroidMoved += 1;
                    /* Increase the safe distance by 1km. */
                    safeDistance += 1000;
                    /* Work out a new distance (varied by +/- 500m). */
                    totalDistanceMoved += distance = (safeDistance - newDistance) + (500 - (Math.random() * 1000));
                    /* Move the asteroid. */
                    asteroid.position = asteroid.position.add(direction.multiply(distance));
                    /* New distance from the base launch corridor. */
                    newDistance = oldDistance + totalDistanceMoved;
                    /* Search for any entity intersecting this asteroid (plus 500m) at the new distance. */
                    entities = system.filteredEntities(this, $validEntity, asteroid, asteroid.collisionRadius + 500);
                    /* An empty array is what we are looking for. */
                    ok = !entities.length;
                }

                if (mainScript.$logging && mainScript.$logExtra) {
                    log(this.name, "shipSpawned::Moving " + asteroid.displayName + " to " + asteroid.position + "\n" +
                        "* Moved: " + asteroidMoved + " times\n" +
                        "* Safe distance: " + safeDistance + "\n" +
                        "* Old distance: " + oldDistance + "\n" +
                        "* Total distance moved: " + totalDistanceMoved + "\n" +
                        "* New distance: " + newDistance);
                }
            }
        }

        /* No longer needed after setting up. */
        delete this.shipSpawned;
    };
}.bind(this)());
