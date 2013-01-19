/*jslint indent: 4, maxlen: 120, maxerr: 50, white: true, es5: true, undef: true, regexp: true, newcap: true */
/*jshint es5: true, undef: true, eqnull: true, noempty: true, eqeqeq: true, boss: true, loopfunc: true, laxbreak: true,
strict: true, curly: true */
/*global oolite, system, log, Timer, Vector3D, missionVariables, player, expandMissionText, mission */

/* Jaguar Company
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
 * World script to setup Jaguar Company.
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "Jaguar Company";
    this.author = "Tricky";
    this.copyright = "© 2012 Richard Thomas Harrison (Tricky)";
    this.license = "CC BY-NC-SA 3.0";
    this.description = "Script to initialise the Jaguar Company.";
    this.version = "2.1";

    /* Private variables. */
    var p_main = {},
    p_const = {};

    /* This should really be defined as a const, but Notepad++ jsLint doesn't like that. */
    Object.defineProperties(p_const, {
        "shipNames" : {
            value : [
                /* OU's, GOU's, LOU's and (d)ROU's. Also some names I really like. */
                "Profit Margin", "Trade Surplus", "Limiting Factor", "Gunboat Diplomat", "Zealot", "Xenophobe",
                "God Told Me To Do It", "Just Another Victim Of The Ambient Morality", "Synchronize Your Dogmas",
                "Thank you And Goodnight", "Well I Was In The Neighbourhood", "You'll Thank Me Later",
                "Shoot Them Later", "Attitude Adjuster", "Killing Time", "I Blame Your Mother", "I Blame My Mother",
                "Heavy Messing", "Frank Exchange Of Views", "Nuisance Value",
                "All Through With This Niceness And Negotiation Stuff", "I Said, I've Got A Big Stick",
                "Hand Me The Gun And Ask Me Again", "But Who's Counting?", "Germane Riposte",
                "We Haven't Met But You're A Great Fan Of Mine", "All The Same, I Saw It First",
                "Ravished By The Sheer Implausibility Of That Last Statement", "Zero Credibility",
                "Charming But Irrational", "Demented But Determined", "You May Not Be The Coolest Person Here",
                "Lucid Nonsense", "Awkward Customer", "Conventional Wisdom", "Fine Till You Came Along",
                "I Blame The Parents", "Inappropriate Response", "A Momentary Lapse Of Sanity", "Lapsed Pacifist",
                "Reformed Nice Guy", "Pride Comes Before A Fall", "Injury Time", "Now Look What You've Made Me Do",
                "Kiss This Then", "Eight Rounds Rapid", "You'll Clean That Up Before You Leave", "Me, I'm Counting",
                "The Usual But Etymologically Unsatisfactory", "Falling Outside The Normal Moral Constraints",
                "Hylozoist", "No One Knows What The Dead Think", "Flick to Kick", "Your Egg's Broken But Mine Is Ok",
                "Shall I Be Mummy?", "Is This Galaxy Taken?", "Famous Last Words", "Road Rage", "Live A Little",
                "Not in My Back Yard", "Playing A Sweeper", "You're Going Home In A Fracking Ambulance", "Rear Entry",
                "Open Wide, Say Aaaarrgghhh", "Hope You Like Explosions", "I Haven't Seen One Of Those For Years",
                "Are You Religious?", "Not Now Dear", "Something Had To Be Done",
                "Hideously Indefensible Sense Of Humour", "Camouflage",
                "Come And Have A Go If You Think You're Hard Enough", "Throwing Toys Out The Crib",
                "Podex Perfectus Es", "Stercorem Pro Cerebro Habes", "Futue Te Ipsum Et Caballum Tuum",
                "Remember To Wash Your Hands", "One Out All Out", "Looking At Me, Pal?",
                "You Showed Me Yours, Now I'll Show You Mine", "Salt In Your Vaseline", "Cracking My Knuckles",
                "Break Glass In Case Of War", "My Turn", "No Pun Intended", "Look No Hands", "Very Sharp Stick",
                "Weapons Of Mass Deception", "...And Another Thing", "Clerical Error", "Silly Mid On",
                "You And Whose Army?", "This Sector Ain't Big Enough For The Both Of Us",
                "Diplomacy Was Never My Strong Suite", "Such A Pretty Big Red Button",
                "Synthetic Paragon Rubber Company", "Forget And Fire", "I Was Just Following Orders",
                "Weapon of Mass Distraction", "Forgive and Forget", "Innocence Is No Excuse",
                "Psychosis Is Only One State Of Mind", "Lets Dance", "AI Avenger", "Dead Man Walking",
                "A Little Less Conversation", "Here One Minute, Gone The Next", "Here, Let Me Escort You",
                "Killed With Superior Skill", "External Agitation", "Catch Me If You Can",
                "But What About The Children?", "Single Fingered Hand Gestures", "A World Of Hurt",
                "Looking Down The Gun Barrel", "Terminal Atomic Headache", "Know Thy Enemy",
                "Cold Steel For An Iron Age", "The Malevolent Creation", "Gamma Ray Goggles", "End Of Green",
                "Terrorwheel", "Sickening Sense Of Humour", "Mines Bigger", "Friendly Fire Isn't",
                "No Need For Stealth", "All Guns Blazin!", "Harmony Dies", "The Controlled Psychopath", "It Ends Now",
                "Forced To Be Nice", "Axis of Advance", "Acts of God", "The Feeling's Mutual",
                "The Beautiful Nightmare", "If You Can Read This...", "Are You Saved?", "Cunning Linguist",
                "Gay Abandon", "My Finger", "Got Legs", "Hose Job", "Protect And Sever", "Rebuttal", "Not In The Face",
                "I Have Right Of Way", "It Ran Into My Missile", "Have A Nice Rest Of Your Life", "Nose Job",
                "Get My Point?", "Grid Worker", "Eraserhead", "What Star?", "All This (And Brains)",
                "Random Acts Of Senseless Violence", "God Will Recognize His Own",
                "Would You Like A Quick Suppository With That?",
                "Pop Me A Couple More Of Those Happy Pills (Eccentric)", "Trouble Maker?", "Talk Is Cheap",
                "Tightly Strung", "Have You Kept The Receipt?", "It Was Broke When I Got Here",
                "Insanity Plea Rejected", "Thora Hird", "Barbara Cartland", "Freddy Starr Ate My Hamster",
                "And You Thought You Knew What Terror Means", "I'm A 'Shoot First, Ask Questions Later' Kinda Guy",
                "Duck You Suckers", "Trumpton Riots", "Dodgy Transformer"
            ],
            writable : false,
            configurable : false,
            enumerable : true
        }
    });

    /* Public variables used by OXP Config. */
    /* Turn logging on or off */
    this.$logging = false;
    /* Report AI messages for Jaguar Company if true */
    this.$logAIMessages = false;
    /* Log extra debug info. Only useful during testing. */
    this.$logExtra = false;
    /* Spawn Jaguar Company always if true */
    this.$alwaysSpawn = false;

    /* Other public variables. */

    /* Seed for the pseudo random number generator. Affects generation of Jaguar Company and placement of the base. */
    this.$salt = 19720231;
    /* Maximum number of Jaguar Company patrol ships allowed. */
    this.$maxPatrolShips = 4;
    /* Minimum reputation to be considered a helper. Equivalent to 5 observed hits. */
    this.$reputationHelper = 5;
    /* Minimum reputation to use the black box. Equivalent to 3 kills. */
    this.$reputationBlackbox = 30;
    /* Set to 'true' to use visual effects. Ignored if using Oolite v1.76.1 or older. */
    this.$visualEffects = true;

    /* World event handlers. */

    /* We only need to do this once.
     * This will get redefined after a new game or loading of a new Commander.
     *
     * Just show on the debug console to confirm it has loaded.
     */
    this.startUp = function () {
        /* No longer needed after setting up. */
        delete this.startUp;

        log(this.name + " " + this.version + " loaded.");
    };

    /* We only need to do this once.
     * This will get redefined after a new game or loading of a new Commander.
     */
    this.shipWillLaunchFromStation = function () {
        /* No longer needed after setting up. */
        delete this.shipWillLaunchFromStation;

        /* Setup. */
        this.$setUp();
        /* Check if we need to create Jaguar Company in this system. */
        this.$setUpCompany();
    };

    /* Player launching from a station.
     *
     * INPUT
     *   station - entity of the station.
     */
    this.shipLaunchedFromStation = function (station) {
        if (station === this.$jaguarCompanyBase) {
            /* Reset welcomed flag on launch from base. */
            p_main.playerWelcomed = false;
            /* Add on any reputation awarded on docking. */
            missionVariables.jaguar_company_reputation += missionVariables.jaguar_company_reputation_post_launch;
            missionVariables.jaguar_company_reputation_post_launch = 0;
        }
    };

    /* Reset everything just before exiting Witchspace. */
    this.shipWillExitWitchspace = function () {
        /* Stop and remove the timers. */
        this.$removeTimers();

        if (!system.shipsWithRole("jaguar_company_patrol").length) {
            /* Setup. */
            this.$setUp();
            /* Check if we need to create Jaguar Company in this system. */
            this.$setUpCompany();
        } else {
            /* Followed Jaguar Company from interstellar space. */

            /* Remove the hyperspace follow co-ordinates. */
            delete this.$hyperspaceFollow;
            /* Not visited the base. */
            delete missionVariables.jaguar_company_visited_base;
        }
    };

    /* A ship has been born.
     *
     * INPUT
     *   whom - entity that was created.
     */
    this.shipSpawned = function (whom) {
        var friendRoles;

        if (!worldScripts["Jaguar Company Attackers"]) {
            /* Attackers world script not setup yet. */
            return;
        }

        /* Get friend roles from the attackers world script. */
        friendRoles = worldScripts["Jaguar Company Attackers"].$friendRoles;

        if (!friendRoles || friendRoles.indexOf(whom.entityPersonality) === -1) {
            /* Ignore non-Jaguar Company ships. */
            return;
        }

        if (this.$logAIMessages) {
            /* Turn AI reporting on for the ship. */
            whom.reportAIMessages = true;
        }
    };

    /* Stop and remove the timers if the player dies. */
    this.shipDied = function () {
        /* Stop and remove the timers. */
        this.$removeTimers();
    };

    /* Show a welcome message on docking as a mission screen. */
    this.missionScreenOpportunity = function () {
        if (!this.$jaguarCompanyBase || !this.$jaguarCompanyBase.isValid) {
            /* Base not setup. */
            return;
        }

        if (player.ship.dockedStation.entityPersonality === this.$jaguarCompanyBase.entityPersonality &&
            !p_main.playerWelcomed) {
            /* Player docked with Jaguar Company Base and not welcomed yet. */
            this.$welcomeMessage();
        }
    };

    /* Equipment has become damaged. */
    this.equipmentDamaged = function (equipment) {
        if (equipment === "EQ_JAGUAR_COMPANY_BLACK_BOX") {
            player.consoleMessage("Black Box Damaged!", 3);
            player.consoleMessage("Return to a local Jaguar Company base for repairs.", 3);
        }
    };

    /* OXPConfig2 settings. */
    this.oxpcLookup = function () {
        delete this.oxpcLookup;

        this.oxpcSettings = {
            Info : {
                Name : this.name,
                Display : "Jaguar Company",
                EarlyCall : true,
                EarlySet : true,
                InfoB : "Development frontend for the Jaguar Company OXP."
            },
            Bool0 : {
                Name : "$logging",
                Def : false,
                Desc : "Turn logging on or off."
            },
            Bool1 : {
                Name : "$logAIMessages",
                Def : false,
                Desc : "Log AI messages if true."
            },
            Bool2 : {
                Name : "$logExtra",
                Def : false,
                Desc : "Log extra debug info if true."
            },
            Bool3 : {
                Name : "$alwaysSpawn",
                Def : false,
                Desc : "Always spawn Jaguar Company if true."
            }
        };
    };

    /* Other global functions. */

    /* Setup the private main variable + some public variables. */
    this.$setUp = function () {
        /* Initialise the p_main variable object.
         * Encapsulates all private global data.
         */
        p_main = {
            /* Player welcomed. Used to control the mission screen display. */
            playerWelcomed : false,
            /* Initialised on first call to $uniqueShipName() */
            availableShipNames : [],
            /* Current route index. */
            routeIndex : 0,
            /* Entities are initialised when Jaguar Company is spawned. */
            routes : [{
                    /* Witchpoint. */
                    entity : null,
                    /* Range used in AI. */
                    range : 10000,
                    /* Message to be sent to the AI. */
                    aiMessage : "JAGUAR_COMPANY_WITCHPOINT_FROM_BASE"
                }, {
                    /* Main planet. */
                    entity : null,
                    range : 50000,
                    aiMessage : "JAGUAR_COMPANY_PLANET",
                }, {
                    /* Witchpoint. */
                    entity : null,
                    range : 10000,
                    aiMessage : "JAGUAR_COMPANY_WITCHPOINT",
                }, {
                    /* Jaguar Company Base. */
                    entity : null,
                    range : 8000,
                    aiMessage : "JAGUAR_COMPANY_BASE"
                }
            ]
        };

        /* Buoy object. */
        this.$buoy = null;
        /* Tracker object. */
        this.$tracker = null;
        /* Base has not been setup yet. */
        this.$jaguarCompanyBase = false;
        /* New base so clear this variable. */
        this.$swapBase = false;
        /* Remove the hyperspace follow co-ordinates. */
        delete this.$hyperspaceFollow;
        /* Not visited the base. */
        delete missionVariables.jaguar_company_visited_base;
    };

    /* Stop and remove the timers. */
    this.$removeTimers = function () {
        /* Stop and remove the script sanity timer. */
        if (this.$scriptSanityTimerReference) {
            if (this.$scriptSanityTimerReference.isRunning) {
                this.$scriptSanityTimerReference.stop();
            }

            delete this.$scriptSanityTimerReference;
        }

        /* Stop and remove the Black Box timer. */
        if (this.$blackBoxTimerReference) {
            if (this.$blackBoxTimerReference.isRunning) {
                this.$blackBoxTimerReference.stop();
            }

            delete this.$blackBoxTimerReference;
        }

        /* Stop and remove the base swap timer. */
        if (this.$baseSwapTimerReference) {
            if (this.$baseSwapTimerReference.isRunning) {
                this.$baseSwapTimerReference.stop();
            }

            delete this.$baseSwapTimerReference;
        }
    };

    /* Periodic function to check if Jaguar Company has spawned correctly.
     *
     * Checks the base, asteroids, buoy, black box and tracker.
     * Patrol ships, tug and miner are checked within the base ship script.
     *
     * The order that this is done in is important.
     */
    this.$scriptSanityTimer = function () {
        var base = this.$jaguarCompanyBase,
        asteroids,
        asteroid,
        equipment,
        blackbox,
        counter,
        length;

        if (!base || !base.isValid) {
            /* Not setup yet. */
            return;
        }

        /* Check the base. */
        if (!this.$baseOK) {
            if (base.script.name !== "jaguar_company_base.js") {
                /* Remove the base. */
                base.remove();
                /* Now we re-populate. */
                this.$spawnJaguarCompanyBase();

                if (this.$logging && this.$logExtra) {
                    log(this.name, "Script sanity check - fixed the base.");
                }

                return;
            }

            /* Don't re-check. */
            this.$baseOK = true;
        }

        /* Check the asteroids. */
        if (!this.$asteroidsOK) {
            /* Search for asteroids around the base. */
            asteroids = system.shipsWithPrimaryRole("jaguar_company_asteroid");
            /* Set the counter to all entities found. */
            p_main.asteroids = asteroids.length;

            if (p_main.asteroids > 0) {
                /* Cache the length. */
                length = asteroids.length;

                /* Iterate through each of the asteroids. */
                for (counter = 0; counter < length; counter += 1) {
                    asteroid = asteroids[counter];

                    if (asteroid.script.name !== "jaguar_company_asteroid.js") {
                        /* Re-create the asteroid in it's original position. */
                        asteroid.spawnOne("jaguar_company_asteroid");
                        /* Remove the asteroid. */
                        asteroid.remove();

                        if (this.$logging && this.$logExtra) {
                            log(this.name, "Script sanity check - fixed an asteroid.");
                        }
                    } else {
                        p_main.asteroids -= 1;
                    }
                }

                if (!p_main.asteroids) {
                    /* Don't re-check. */
                    this.$asteroidsOK = true;
                }
            }
        }

        /* Check the buoy. */
        if (this.$buoy && this.$buoy.isValid && !this.$buoyOK) {
            if (this.$buoy.script.name !== "jaguar_company_base_buoy.js") {
                /* Remove the buoy. */
                this.$buoy.remove();

                if (this.$logging && this.$logExtra) {
                    log(this.name, "Script sanity check - fixed the buoy.");
                }
            } else {
                /* Don't re-check. */
                this.$buoyOK = true;
            }
        }

        if (player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX") !== "EQUIPMENT_OK") {
            /* Doesn't have the black box locator or is damaged. */
            return;
        }

        /* Check the black box. */
        if (!this.$blackboxOK) {
            equipment = player.ship.equipment;
            length = equipment.length;

            /* Find the black box in the player's equipment list. */
            for (counter = 0; counter < length; counter += 1) {
                if (equipment[counter].equipmentKey === "EQ_JAGUAR_COMPANY_BLACK_BOX") {
                    blackbox = equipment[counter];

                    break;
                }
            }

            if (blackbox.scriptName !== "jaguar_company_blackbox.js") {
                /* Remove the black box. */
                player.ship.removeEquipment("EQ_JAGUAR_COMPANY_BLACK_BOX");
                /* Re-award the black box. */
                player.ship.awardEquipment("EQ_JAGUAR_COMPANY_BLACK_BOX");

                if (this.$logging && this.$logExtra) {
                    log(this.name, "Script sanity check - fixed the black box.");
                }
            } else {
                /* Don't re-check. */
                this.$blackboxOK = true;
            }
        }

        /* Check the tracker. */
        if (this.$tracker && this.$tracker.isValid && !this.$trackerOK) {
            if (this.$tracker.script.name !== "jaguar_company_tracker.js") {
                /* Remove the tracker. */
                this.$tracker.remove();

                if (this.$logging && this.$logExtra) {
                    log(this.name, "Script sanity check - fixed the tracker.");
                }
            } else {
                /* Don't re-check. */
                this.$trackerOK = true;
            }
        }
    };

    /* If the player has received the black box and then attacks Jaguar Company,
     * this will remove it and the tracker and this timer.
     *
     * Also checks if we are within 10km of the patrol ships, if so we remove the tracker.
     *
     * Called every 5 seconds.
     */
    this.$blackBoxTimer = function () {
        var blackBoxStatus,
        patrolShips;

        if (missionVariables.jaguar_company_attacker) {
            blackBoxStatus = player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX");

            if (blackBoxStatus === "EQUIPMENT_OK" || blackBoxStatus === "EQUIPMENT_DAMAGED") {
                /* Remove the black box from players that have attacked Jaguar Company. */
                player.ship.removeEquipment("EQ_JAGUAR_COMPANY_BLACK_BOX");
                player.consoleMessage("Black Box self-destructed!", 3);

                if (this.$tracker && this.$tracker.isValid) {
                    /* Remove the tracker quietly: don't trigger 'shipDied' in the ship script. */
                    this.$tracker.remove(true);
                    this.$trackerOK = false;
                }

                /* Stop and remove the Black Box timer. */
                if (this.$blackBoxTimerReference) {
                    if (this.$blackBoxTimerReference.isRunning) {
                        this.$blackBoxTimerReference.stop();
                    }

                    delete this.$blackBoxTimerReference;
                }
            }
        } else if (this.$tracker && this.$tracker.isValid) {
            patrolShips = system.shipsWithPrimaryRole("jaguar_company_patrol", player.ship);

            if (patrolShips.length > 0 && player.ship.position.distanceTo(patrolShips[0].position) < 5000) {
                player.consoleMessage("Tracker deactivating.", 3);
                player.consoleMessage("Patrol ships close by.", 3);

                if (this.$tracker && this.$tracker.isValid) {
                    /* Remove the tracker quietly: don't trigger 'shipDied' in the ship script. */
                    this.$tracker.remove(true);
                    this.$trackerOK = false;
               }
            }
        }
    };

    /* Swap the base role dependent on the reputation mission variable.
     *
     * Called every 5 seconds.
     */
    this.$baseSwapTimer = function () {
        var base = this.$jaguarCompanyBase,
        position,
        orientation,
        displayName,
        newBase,
        newBaseRole,
        entities,
        entity,
        distance,
        direction;

        if (!base || !base.isValid) {
            /* Stop and remove the base swap timer. */
            this.$baseSwapTimerReference.stop();
            delete this.$baseSwapTimerReference;

            return;
        }

        /* Set up the role that the base should have. */
        if (missionVariables.jaguar_company_reputation < this.$reputationHelper) {
            newBaseRole = "jaguar_company_base_no_discount";
        } else {
            newBaseRole = "jaguar_company_base_discount";
        }

        if (base.hasRole(newBaseRole)) {
            /* The base already has this new role. No need to swap. */
            return;
        }

        /* Shift any entities that are launching. Hopefully there should only be 1 ship in the launch tube (if any).
         * There really shouldn't be anything close by to the new position as we are only placing the
         * entity a small distance outside the docking port.
         */
        entities = system.filteredEntities(this, function (entity) {
                return (entity && entity.isValid);
            }, base, base.collisionRadius);

        if (entities.length > 0) {
            /* Assuming there is only 1 ship launching. */
            entity = entities[0];
            distance = entity.position.distanceTo(base.position);
            direction = entity.position.subtract(base.position).direction();
            /* New distance to move the entity by. */
            distance = (base.collisionRadius - distance) + entity.collisionRadius + 10;
            /* Update position along the original direction vector. */
            entity.position = entity.position.add(direction.multiply(distance));
        }

        /* Copy some properties. */
        position = base.position;
        orientation = base.orientation;
        displayName = base.displayName;
        /* This is checked in the base ship script. If set, it will not set up various properties in
         * the 'shipSpawned' base ship script event as we will be copying over the originals here.
         * $swapBase will be reset in the 'shipSpawned' base ship script once the base has fully spawned.
         */
        this.$swapBase = true;
        /* Create a new base. */
        newBase = base.spawnOne(newBaseRole);
        /* Remove the original base quietly: don't trigger 'shipDied' in the ship script. */
        base.remove(true);
        /* Setup the new base with the original properties. */
        newBase.position = position;
        newBase.orientation = orientation;
        newBase.displayName = displayName;
        /* Stop any kick in velocity we may get from any nearby entity.
         * Imagine a station that you need injectors to out run.
         */
        newBase.velocity = new Vector3D(0, 0, 0);
        /* Update the public variable. */
        this.$jaguarCompanyBase = newBase;
    };

    /* Activate the black box. */
    this.$activateJaguarCompanyBlackbox = function () {
        var patrolShips = system.shipsWithPrimaryRole("jaguar_company_patrol", player.ship),
        ok = false;

        if (player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX") === "EQUIPMENT_OK") {
            if (!system.shipsWithPrimaryRole("jaguar_company_patrol").length) {
                player.consoleMessage("Can not show tracker.", 3);
                player.consoleMessage("No patrol ships found.", 3);
            } else if (player.ship.position.distanceTo(patrolShips[0].position) < 5000) {
                player.consoleMessage("Tracker not activated.", 3);
                player.consoleMessage("Patrol ships close by.", 3);
            } else {
                player.consoleMessage("Black Box activated.", 3);
                /* Player has a functioning black box locator
                 * and there is at least 1 patrol ship in the system.
                 */
                if (!this.$tracker || !this.$tracker.isValid) {
                    /* Spawn the tracker if there are no trackers in the system. */
                    if (this.$visualEffects) {
                        if (0 < oolite.compareVersion("1.77")) {
                            /* Invisible object for Oolite v1.76.1 and older. */
                            this.$tracker = this.$jaguarCompanyBase.spawnOne("jaguar_company_tracker");
                        } else {
                            /* Visual effect for Oolite v1.77 and newer. */
                            this.$tracker = system.addVisualEffect("jaguar_company_tracker", player.ship.position);
                        }
                    } else {
                        player.consoleMessage("Follow beacon code 'T' on your ASC.", 3);
                        this.$tracker = this.$jaguarCompanyBase.spawnOne("jaguar_company_tracker");
                    }
                }

                ok = true;
            }
        } else if (player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX") === "EQUIPMENT_DAMAGED") {
            player.consoleMessage("Black Box Damaged!", 3);
            player.consoleMessage("Return to a local Jaguar Company base for repairs.", 3);
        }

        return ok;
    };

    /* Deactivate the black box. */
    this.$deactivateJaguarCompanyBlackbox = function () {
        var ok = false;

        if (player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX") === "EQUIPMENT_OK") {
            player.consoleMessage("Black Box deactivated.", 3);

            if (this.$tracker && this.$tracker.isValid) {
                /* Remove the tracker quietly: don't trigger 'shipDied' in the ship script. */
                this.$tracker.remove(true);
                this.$trackerOK = false;
            }

            ok = true;
        } else if (player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX") === "EQUIPMENT_DAMAGED") {
            player.consoleMessage("Black Box Damaged!", 3);
            player.consoleMessage("Return to a local Jaguar Company base for repairs.", 3);
        }

        return ok;
    };

    /* Show a welcome message. */
    this.$welcomeMessage = function () {
        var welcome,
        logMsg;

        if (this.$logging && this.$logExtra) {
            logMsg = "$welcomeMessage::reputation: " + missionVariables.jaguar_company_reputation + "\n" +
                "$welcomeMessage::visited_base: " + missionVariables.jaguar_company_visited_base + "\n";
        }

        p_main.playerWelcomed = true;

        if (missionVariables.jaguar_company_reputation < this.$reputationHelper) {
            if (missionVariables.jaguar_company_visited_base) {
                welcome = expandMissionText("jaguar_company_base_visited");
            } else {
                welcome = expandMissionText("jaguar_company_base_docked");
            }
        } else if (missionVariables.jaguar_company_reputation < this.$reputationBlackbox) {
            if (missionVariables.jaguar_company_visited_base) {
                welcome = expandMissionText("jaguar_company_base_visited_thanks");
            } else {
                welcome = expandMissionText("jaguar_company_base_docked_thanks");
            }
        } else {
            if (player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX") !== "EQUIPMENT_OK") {
                /* Doesn't have the black box locator or is damaged. */
                if (player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX") === "EQUIPMENT_DAMAGED") {
                    /* Black box damaged. */
                    welcome = expandMissionText("jaguar_company_base_thanks_black_box_damaged");
                    player.ship.setEquipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX", "EQUIPMENT_OK");
                } else {
                    /* No black box locator. */
                    if (this.$visualEffects) {
                        if (0 < oolite.compareVersion("1.77")) {
                            welcome = expandMissionText("jaguar_company_base_thanks_no_black_box1");
                        } else {
                            welcome = expandMissionText("jaguar_company_base_thanks_no_black_box2");
                        }
                    } else {
                        welcome = expandMissionText("jaguar_company_base_thanks_no_black_box1");
                    }

                    player.ship.awardEquipment("EQ_JAGUAR_COMPANY_BLACK_BOX");
                    this.$blackBoxTimerReference = new Timer(this, this.$blackBoxTimer, 5, 5);
                    /* Reset the check flag. */
                    this.$blackboxOK = false;
                }
            } else {
                if (missionVariables.jaguar_company_visited_base) {
                    welcome = expandMissionText("jaguar_company_base_visited_thanks");
                } else {
                    welcome = expandMissionText("jaguar_company_base_docked_thanks");
                }
            }
        }

        if (missionVariables.jaguar_company_reputation >= this.$reputationHelper && !system.isInterstellarSpace) {
            /* Add on a market message if reputation is high enough and not in interstellar space. */
            welcome += expandMissionText("jaguar_company_base_market");

            if (player.ship.manifest.food ||
                player.ship.manifest.textiles ||
                player.ship.manifest.liquorWines ||
                player.ship.manifest.luxuries ||
                player.ship.manifest.furs ||
                player.ship.manifest.alienItems) {
                /* Add a message for some wanted items in the player's hold. */
                welcome += expandMissionText("jaguar_company_base_market_want");

                if (player.ship.manifest.food) {
                    welcome += expandMissionText("jaguar_company_base_market_want_a", {
                        jaguar_company_commodity : "food"
                    });
                }

                if (player.ship.manifest.textiles || player.ship.manifest.furs) {
                    welcome += expandMissionText("jaguar_company_base_market_want_a", {
                        jaguar_company_commodity : "clothing"
                    });
                }

                if (player.ship.manifest.liquorWines) {
                    welcome += expandMissionText("jaguar_company_base_market_want_a", {
                        jaguar_company_commodity : "alcohol"
                    });
                }

                if (player.ship.manifest.luxuries) {
                    welcome += expandMissionText("jaguar_company_base_market_want_a", {
                        jaguar_company_commodity : "luxuries"
                    });
                }

                if (player.ship.manifest.alienItems) {
                    welcome += expandMissionText("jaguar_company_base_market_want_a", {
                        jaguar_company_commodity : "alien technology"
                    });
                }
            }
        }

        if (this.$logging && this.$logExtra) {
            logMsg += "$welcomeMessage::welcome: " + welcome;
            log(this.name, "\n" + logMsg);
        }

        missionVariables.jaguar_company_visited_base = true;
        mission.runScreen({
            title : this.$jaguarCompanyBase.displayName,
            message : welcome
        });
    };

    /* Spawn Jaguar Company
     *
     * INPUT
     *   state - 1. Add always.
     *           2. Add because of Galactic Navy presence.
     *           3. General add.
     */
    this.$spawnJaguarCompany = function (state) {
        var sysname,
        counter,
        length,
        entity,
        logMsg = "$spawnJaguarCompany::";

        /* Reset the check flags. */
        this.$baseOK = false;
        this.$asteroidsOK = false;
        this.$buoyOK = false;

        if (typeof missionVariables.jaguar_company_reputation !== "number") {
            missionVariables.jaguar_company_reputation = 0;
        }

        if (typeof missionVariables.jaguar_company_reputation_post_launch !== "number") {
            missionVariables.jaguar_company_reputation_post_launch = 0;
        }

        /* Check all Jaguar Company entities every 5 seconds for script sanity. */
        this.$scriptSanityTimerReference = new Timer(this, this.$scriptSanityTimer, 5, 5);
        /* Swap the base role if needed. Checked every 5 seconds. */
        this.$baseSwapTimerReference = new Timer(this, this.$baseSwapTimer, 5, 5);

        if (player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX") === "EQUIPMENT_OK" ||
            player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX") === "EQUIPMENT_DAMAGED") {
            /* Check if the player is allowed the black box. Checked every 5 seconds. */
            this.$blackBoxTimerReference = new Timer(this, this.$blackBoxTimer, 5, 5);
        }

        /* For logging. */
        sysname = system.name;

        /* Fake witchpoint buoy entity. Updated if one is found. */
        this.$witchpointBuoy = {
            isValid : true,
            position : new Vector3D(0, 0, 0),
            collisionRadius : 100
        };

        if (system.isInterstellarSpace) {
            sysname = "Interstellar";
        } else {
            /* Find the witchpoint buoy. */
            length = system.allShips.length;

            for (counter = 0; counter < length; counter += 1) {
                entity = system.allShips[counter];

                if (entity.scanClass === "CLASS_BUOY" && entity.hasRole("buoy-witchpoint")) {
                    this.$witchpointBuoy = entity;

                    break;
                }
            }
        }

        if (this.$logging) {
            if (state & 1) {
                logMsg += "Adding Jaguar Company to patrol in the " + sysname + " space lane.\n";
            }

            if (state & 2) {
                logMsg += "Adding Jaguar Company to patrol with the Galactic Navy in the " + sysname + " space lane.\n";
            }

            if (state & 4) {
                logMsg += "Always spawn set - Adding Jaguar Company to the " + sysname + " space lane.\n";
            }

            if (state > 7) {
                logMsg += "This should NOT happen! Unknown state: " + state;
            }

            log(this.name, logMsg);
        }

        if (state === 2) {
            /* Create the patrol without the base. */
            this.$spawnJaguarCompanyPatrol();
        } else if (state <= 7) {
            /* Create the base. */
            this.$spawnJaguarCompanyBase();
        }
    };

    /* Create the patrol without the base. */
    this.$spawnJaguarCompanyPatrol = function () {
        var startPosition = this.$witchpointBuoy.position.subtract(new Vector3D(0, 0, 51200));

        /* Add the patrol ships. */
        system.addShips("jaguar_company_patrol", this.$maxPatrolShips, startPosition, 0);
        /* Initialise the route list with the Witchpoint->Planet route. */
        this.$initRoute("WP");
        this.$changeRoute(1);
    };

    /* Create the base. */
    this.$spawnJaguarCompanyBase = function () {
        var ratio,
        basePosition,
        baseRole,
        dot,
        mainPlanet,
        mPovUp,
        wpPosition,
        wpsunDirection,
        wpmpDirection;

        if (this.$jaguarCompanyBase && this.$jaguarCompanyBase.isValid) {
            /* Already setup. */
            return;
        }

        if (system.isInterstellarSpace) {
            /* If we are in interstellar space then the base is somewhere within
             * 7 times standard scanner range of the centre point.
             */
            basePosition = Vector3D.randomDirectionAndLength(7 * 25600);
            /* Move the base in a random direction a distance of 3 times standard scanner range. */
            basePosition = basePosition.add(Vector3D.randomDirection(3 * 25600));
        } else {
            /* Shorten some of the property names and calculations. */
            mainPlanet = system.mainPlanet;
            wpPosition = this.$witchpointBuoy.position;
            wpsunDirection = wpPosition.subtract(system.sun.position).direction();
            wpmpDirection  = wpPosition.subtract(mainPlanet.position).direction();
            dot = wpsunDirection.dot(wpmpDirection);

            /* Some systems have the witchpoint, main planet and sun all in conjunction. */
            if (dot > -0.5 && dot < 0.5) {
                /* The sun is somewhere out to the right or left.
                 *  - or up or down or any variety of directions that isn't infront or behind.
                 */
                /* Pick a ratio between 0.3 and 0.5 */
                ratio = 0.3 + (system.scrambledPseudoRandomNumber(this.$salt) * 0.2);
                /* Place the base on the witchpoint -> sun route. */
                basePosition = Vector3D.interpolate(wpPosition, system.sun.position, ratio);
                /* Move it 4 to 6 times scanning range towards the main planet. */
                ratio = (4 + (system.scrambledPseudoRandomNumber(this.$salt) * 2)) * 25600;
                ratio /= basePosition.distanceTo(mainPlanet.position);
                basePosition = Vector3D.interpolate(basePosition, mainPlanet.position, ratio);
            } else {
                if (this.$logging && this.$logExtra) {
                    log(this.name, "$spawnJaguarCompanyBase::" +
                        "Conjunction! Choosing alternate base position.");
                }

                /* The witchpoint, main planet and sun are getting close to being in conjunction. */
                /* Pick a ratio between 0.1 and 0.3 */
                ratio = 0.1 + (system.scrambledPseudoRandomNumber(this.$salt) * 0.2);
                /* Place the base on the witchpoint -> main planet route. */
                basePosition = Vector3D.interpolate(wpPosition, mainPlanet.position, ratio);
                /* Move it 4 to 6 times scanning range upwards with respect to the main planet's surface. */
                ratio = (4 + (system.scrambledPseudoRandomNumber(this.$salt) * 2)) * 25600;
                mPovUp = mainPlanet.orientation.vectorUp();
                basePosition = basePosition.add(mPovUp.multiply(mainPlanet.radius + ratio)); 
            }
        }

        /* Set the base role dependent on the reputation mission variable. */
        baseRole = (
            missionVariables.jaguar_company_reputation >= this.$reputationHelper ?
            "jaguar_company_base_discount" :
            "jaguar_company_base_no_discount");
        /* Add the base. */
        this.$jaguarCompanyBase = system.addShips(baseRole, 1, basePosition, 0)[0];
        /* Initialise the route list with the default route. */
        this.$initRoute();
    };

    /* Check to see if we need to spawn Jaguar Company. */
    this.$setUpCompany = function () {
        var PRN,
        navyPresent,
        joinNavyProbability,
        joinNavy,
        systemProbability,
        spawnInSystem,
        spawnCompany = 0;

        /* Bit pattern for spawning...
         *
         * spawnInSystem    - 001
         * joinNavy         - 010
         * alwaysSpawn      - 100
         */

        if (this.$jaguarCompanyBase && this.$jaguarCompanyBase.isValid) {
            /* Already setup. */
            return true;
        }

        PRN = system.scrambledPseudoRandomNumber(this.$salt);
        /* Jaguar Company are part-time reservists */
        navyPresent = (system.countShipsWithRole("navy-frigate") > 0 ||
            system.countShipsWithRole("patrol-frigate") > 0 ||
            system.countShipsWithRole("picket-frigate") > 0 ||
            system.countShipsWithRole("intercept-frigate") > 0 ||
            system.countShipsWithRole("navy-medship") > 0 ||
            system.countShipsWithRole("navy-behemoth-battlegroup") > 0);
        joinNavyProbability = 0.5;
        joinNavy = (navyPresent && PRN <= joinNavyProbability);
        /* We only use the first 3 government types.
         * Therefore probabilities will be:
         *   Anarchy:          37.5%
         *   Feudal:           25.0%
         *   Multi-Government: 12.5%
         *
         * Intestellar space will halve these probabilites.
         */
        systemProbability = 0.125 * (3 - system.government);

        if (system.isInterstellarSpace) {
            systemProbability /= 2;
        }

        spawnInSystem = (system.government <= 2 && PRN <= systemProbability);

        /* Anarchies, Feudals and Multi-Governments or systems with Galactic Naval presence */
        spawnCompany |= (spawnInSystem ? 1 : 0);
        spawnCompany |= (joinNavy ? 2 : 0);
        spawnCompany |= (this.$alwaysSpawn ? 4 : 0);

        if (this.$logging && this.$logExtra) {
            log(this.name, "$setUpCompany::\n" +
                "PRN: " + PRN + "\n" +
                "navyPresent: " + navyPresent + ", joinNavy: " + joinNavy + "\n" +
                "systemProbability: " + systemProbability + ", spawnInSystem: " + spawnInSystem + "\n" +
                "spawnCompany (normally): " + (spawnCompany > 0 && spawnCompany < 4 ? "Yes" : "No"));
        }

        if (!this.$alwaysSpawn) {
            if (system.sun && (system.sun.isGoingNova || system.sun.hasGoneNova)) {
                if (this.$logging && this.$logExtra) {
                    log(this.name, "$setUpCompany::\n" +
                        "system.sun.isGoingNova: " + system.sun.isGoingNova +
                        ", system.sun.hasGoneNova: " + system.sun.hasGoneNova);
                }

                return false;
            }
        }

        this.$spawnJaguarCompany(spawnCompany);

        return (spawnCompany !== 0);
    };

    /* Create a unique ship name.
     *
     * INPUT
     *   prefix - Add a prefix to the name. (optional)
     *   maxNameLength - maximum length (not including prefix) of the name.
     *
     * RESULT
     *   result - return a unique name.
     */
    this.$uniqueShipName = function (prefix, maxNameLength) {
        var index,
        salt = this.$salt,
        randf,
        shortestNameLength,
        name,
        counter,
        length;

        if (typeof prefix === "string" && prefix !== "") {
            prefix += ": ";
        } else {
            /* Empty prefix. */
            prefix = "";
        }

        if (typeof maxNameLength !== "number" || maxNameLength < p_main.shortestNameLength) {
            /* Empty maxNameLength. */
            maxNameLength = 0;
        }

        if (!p_main.availableShipNames || p_main.availableShipNames.length <= 8) {
            /* Initialise the available ship names with a copy of the master list if the available pot gets low. */
            p_main.availableShipNames = p_const.shipNames.concat([]);
        }

        /* Make sure we don't try to search for a name that is shorter than what is available. */
        if (maxNameLength > 0) {
            /* Find the shortest name length. */
            shortestNameLength = -1;
            length = p_main.availableShipNames.length;

            for (counter = 0; counter < length; counter += 1) {
                name = p_main.availableShipNames[counter];

                if (shortestNameLength === -1 || name.length < shortestNameLength) {
                    shortestNameLength = name.length;
                }
            }

            /* Reset the max name length if it is shorter than what is available. */
            if (maxNameLength < shortestNameLength) {
                maxNameLength = shortestNameLength;
            }
        }

        /* Random number for the index. */
        if (prefix === this.$jaguarCompanyBase.name + ": ") {
            randf = system.scrambledPseudoRandomNumber(salt);
        } else {
            randf = Math.random();
        }

        /* Index for the name. */
        index = Math.floor(randf * p_main.availableShipNames.length);
        /* Get a name from the available list and remove it. */
        name = p_main.availableShipNames.splice(index, 1)[0];

        if (maxNameLength !== 0) {
            /* Keep looping until we find a name short enough. */
            while (name.length > maxNameLength) {
                /* Too long. Put the name back into the available list. */
                p_main.availableShipNames.splice(index, 0, name);

                /* Pick a new random number. */
                if (prefix === this.$jaguarCompanyBase.name + ": ") {
                    salt += 1;
                    randf = system.scrambledPseudoRandomNumber(salt);
                } else {
                    randf = Math.random();
                }

                /* Index for the new name. */
                index = Math.floor(randf * p_main.availableShipNames.length);
                /* Get a new name from the available list and remove it. */
                name = p_main.availableShipNames.splice(index, 1)[0];
            }
        }

        /* Return the new name. */
        return prefix + name;
    };

    /* Alters the route list.
     *
     * INPUT
     *   route - route code (optional).
     *     WPWB - Full route. Base -> Witchpoint -> Planet -> Witchpoint -> Base (dock).
     *     I - Interstellar space. Base -> (Fake) Witchpoint -> Base (dock).
     *     WP - Witchpoint <-> Planet.
     *     BP - Base -> Planet -> Base (dock).
     */
    this.$initRoute = function (route) {
        if (system.isInterstellarSpace) {
            route = "I";
        } else if (typeof route !== "string" || route === "") {
            route = "WPWB";
        }

        if (!this.$witchpointBuoy || !this.$witchpointBuoy.isValid) {
            /* Fake witchpoint buoy entity. */
            this.$witchpointBuoy = {
                isValid : true,
                position : new Vector3D(0, 0, 0),
                collisionRadius : 100
            };
        }

        switch (route) {
        case "I":
            /* Alters the route list for Interstellar space. */
            p_main.routes = [{
                    /* Witchpoint. Will be a fake witchpoint. */
                    entity : this.$witchpointBuoy,
                    /* Range used in AI. */
                    range : 5000,
                    /* Message to be sent to the AI. */
                    aiMessage : "JAGUAR_COMPANY_INTERSTELLAR",
                }, {
                    /* Jaguar Company Base. */
                    entity : this.$jaguarCompanyBase,
                    /* Range used in AI. */
                    range : 8000,
                    /* Message to be sent to the AI. */
                    aiMessage : "JAGUAR_COMPANY_BASE"
                }
            ];

            break;
        case "WP":
            /* Alters the route list for WP->Planet and Planet->WP. */
            p_main.routes = [{
                    /* Main planet. */
                    entity : system.mainPlanet,
                    /* Range used in AI. */
                    range : 50000,
                    /* Message to be sent to the AI. */
                    aiMessage : "JAGUAR_COMPANY_PLANET",
                }, {
                    /* Witchpoint. */
                    entity : this.$witchpointBuoy,
                    /* Range used in AI. */
                    range : 10000,
                    /* Message to be sent to the AI. */
                    aiMessage : "JAGUAR_COMPANY_WITCHPOINT",
                }
            ];

            break;
        case "BP":
            /* Alters the route list for Base->Planet and Planet->Base. */
            p_main.routes = [{
                    /* Jaguar Company base. */
                    entity : this.$jaguarCompanyBase,
                    /* Range used in AI. */
                    range : 8000,
                    /* Message to be sent to the AI. */
                    aiMessage : "JAGUAR_COMPANY_BASE"
                }, {
                    /* Main planet. */
                    entity : system.mainPlanet,
                    /* Range used in AI. */
                    range : 50000,
                    /* Message to be sent to the AI. */
                    aiMessage : "JAGUAR_COMPANY_PLANET",
                }
            ];

            break;
        default:
            /* Full route list. */
            p_main.routes = [{
                    /* Witchpoint. */
                    entity : this.$witchpointBuoy,
                    /* Range used in AI. */
                    range : 10000,
                    /* Message to be sent to the AI. */
                    aiMessage : "JAGUAR_COMPANY_WITCHPOINT_FROM_BASE"
                }, {
                    /* Main planet. */
                    entity : system.mainPlanet,
                    /* Range used in AI. */
                    range : 50000,
                    /* Message to be sent to the AI. */
                    aiMessage : "JAGUAR_COMPANY_PLANET",
                }, {
                    /* Witchpoint. */
                    entity : this.$witchpointBuoy,
                    /* Range used in AI. */
                    range : 10000,
                    /* Message to be sent to the AI. */
                    aiMessage : "JAGUAR_COMPANY_WITCHPOINT",
                }, {
                    /* Jaguar Company Base. */
                    entity : this.$jaguarCompanyBase,
                    /* Range used in AI. */
                    range : 8000,
                    /* Message to be sent to the AI. */
                    aiMessage : "JAGUAR_COMPANY_BASE"
                }
            ];

            break;
        }

        /* Reset the current route index. */
        p_main.routeIndex = 0;
    };

    /* Change the current route. */
    this.$changeRoute = function (routeNum) {
        if (typeof routeNum !== "number") {
            p_main.routeIndex += 1;
        } else {
            if (routeNum >= 0) {
                p_main.routeIndex = routeNum;
            } else {
                p_main.routeIndex = p_main.routes.length - 1;
            }
        }

        /* Out-of-bounds checking. */
        if (p_main.routeIndex < 0 || p_main.routeIndex >= p_main.routes.length) {
            p_main.routeIndex = 0;
        }
    };

    /* Check the current route and return a message for the ship's AI.
     *
     * INPUT
     *   callerShip - caller ship.
     */
    this.$checkRoute = function (callerShip) {
        var entity,
        distance;

        /* Out-of-bounds checking. */
        if (p_main.routeIndex < 0 || p_main.routeIndex >= p_main.routes.length) {
            p_main.routeIndex = 0;
        }

        /* Check for entities becoming invalid. */
        if (!p_main.routes[p_main.routeIndex].entity || !p_main.routes[p_main.routeIndex].entity.isValid) {
            /* Fake entity a distance of 10 x the required range in a random direction. */
            p_main.routes[p_main.routeIndex].entity = {
                isValid : true,
                position : Vector3D.randomDirection(p_main.routes[p_main.routeIndex].range * 10),
                collisionRadius : 100
            };
        }

        if (this.$logging && this.$logExtra) {
            entity = p_main.routes[p_main.routeIndex].entity;

            /* Calculate the surface to surface distance, not centre to centre. */
            distance = callerShip.position.distanceTo(entity.position);
            distance -= callerShip.collisionRadius;
            distance -= entity.collisionRadius;

            log(this.name, "$checkRoute::\n" +
                "* ship#" + callerShip.entityPersonality + " (" + callerShip.displayName + ")\n" +
                "* Entity position: " + entity.position + "\n" +
                "* Distance: " + distance + "\n" +
                "* Desired range: " + p_main.routes[p_main.routeIndex].range + "\n" +
                "* Current route: " + p_main.routeIndex + " (" + p_main.routes[p_main.routeIndex].aiMessage + ")");
        }

        callerShip.reactToAIMessage(p_main.routes[p_main.routeIndex].aiMessage);
    };

    /* Finished the current route, change to the next one.
     *
     * INPUT
     *   callerShip - caller ship.
     *   groupRole - role of our group.
     *   aiResponse - AI response.
     */
    this.$finishedRoute = function (callerShip, groupRole, aiResponse) {
        var entity,
        distance,
        otherShips,
        otherShipsLength,
        otherShipsCounter;

        entity = p_main.routes[p_main.routeIndex].entity;

        /* Calculate the surface to saved co-ordinates distance, not centre to centre. */
        distance = callerShip.position.distanceTo(callerShip.savedCoordinates);
        distance -= callerShip.collisionRadius;
        /* Take off a small fudge factor. */
        distance -= 100;

        if (distance > p_main.routes[p_main.routeIndex].range) {
            /* Don't change route if we are no where near our target. */
            return;
        }

        if (this.$logging && this.$logExtra) {
            log(this.name, "$finishedRoute::Checking...\n" +
                "* ship#" + callerShip.entityPersonality + " (" + callerShip.displayName + ")\n" +
                "* Entity position: " + entity.position + "\n" +
                "* Saved co-ordinates: " + callerShip.savedCoordinates + "\n" +
                "* Distance: " + distance + "\n" +
                "* Desired range: " + p_main.routes[p_main.routeIndex].range + "\n" +
                "* Current route: " + p_main.routeIndex + " (" + p_main.routes[p_main.routeIndex].aiMessage + ")");
        }

        /* Change to the next route. */
        this.$changeRoute();

        otherShips = system.shipsWithRole(groupRole, callerShip);

        if (!otherShips.length) {
            /* Return immediately if we are on our own. */
            return;
        }

        /* Cache the length. */
        otherShipsLength = otherShips.length;

        for (otherShipsCounter = 0; otherShipsCounter < otherShipsLength; otherShipsCounter += 1) {
            /* Force all other ships to regroup. The ship that called this is already regrouping. */
            otherShips[otherShipsCounter].reactToAIMessage(aiResponse);
        }
    };
}).call(this);
