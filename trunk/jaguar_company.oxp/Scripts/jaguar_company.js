/*jslint bitwise: true, es5: true, newcap: true, nomen: true, regexp: true, unparam: true, todo: true, white: true,
indent: 4, maxerr: 50, maxlen: 120 */
/*jshint boss: true, curly: true, eqeqeq: true, eqnull: true, es5: true, evil: true, forin: true, laxbreak: true,
loopfunc: true, noarg: true, noempty: true, strict: true, nonew: true, undef: true */
/*global Math, JSON, Object, System, Timer, Vector3D, expandDescription, expandMissionText, galaxyNumber, log, mission,
missionVariables, oolite, player, system, worldScripts */

/* Jaguar Company
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
 * World script to setup Jaguar Company.
 */

(function () {
    "use strict";

    /* Standard public variables for OXP scripts. */
    this.name = "Jaguar Company";
    this.copyright = "© 2012-2014 Richard Thomas Harrison (Tricky)";
    this.description = "Script to initialise the Jaguar Company.";

    /* Private variables. */
    var p_main = {},
    p_const = {};

    /* This should really be defined as a const, but Notepad++ jsLint doesn't like that.
     * Set 'configurable' so that they can be deleted by $killSelf().
     */
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
            configurable : true,
            enumerable : true
        },
        "snoopersErrorCodes" : {
            value : [
                /* Warnings. */
                "Snoopers buffer is full (max 10 news).",
                "No free storing slot available.",
                "CRC buffer is full.",
                "CRC is still active.",
                "Caller already sent a message (1 news per worldScript).",
                /* News inserted successfully. */
                "Success.",
                /* Error messages. */
                "Required properties not found (ID and Message).",
                "Unknown properties passed.",
                "To few or too much passed properties (at least 2).",
                "Request from invalid caller (no worldScript).",
                "Property 'Message' not a string (wrong type).",
                "Property 'Message' too short or too long (expected >10 and <700 chars).",
                "Property 'Message' starts with whitespace (\\f \\t \\r \\n or space).",
                "Property 'Message' - Sent message not expandable.",
                "Property 'Message' - Number of opening brackets doesn't match number of closing brackets.",
                "Property 'Message' - Expanded key (descriptions.plist) too long (limit 700 chars).",
                "Property 'Message' - Expanded key (missiontext.plist) too long (limit 700 chars).",
                "Property 'Message' - Expanded Message too long.",
                "Property 'Message' - Word with overlength detected (limit 79 chars).",
                "Property 'Message' - To many linebreaks (limit 10).",
                "Property 'Agency' - not valid (expected number in range 1 - 3).",
                "Property 'Priority' - not valid (expected number in range 1 - 3).",
                "Property 'Pic' - wrong type (expected string).",
                "Property 'Pic' - not a valid fileextension.",
                "Property 'Music' - wrong type (expected string).",
                "Property 'Music' not a valid fileextension.",
                "Property 'Model' - wrong type (expected string).",
                "Property 'Pos' - wrong type (expected array).",
                "Property 'Pos' - wrong number of arguments (expected 3 numbers).",
                "Property 'Pos' - contains NaN.",
                "Property 'Ori' - wrong type (expected number or array).",
                "Property 'Ori' - not valid (expected 1, 2, 4 or 8).",
                "Snoopers was shutdown. Requirements not fullfilled.",
                "Player not valid anymore.",
                "Player not docked while trying to display a direct mission screen.",
                "Attempt to override a missionscreen blocked."
            ],
            writable : false,
            configurable : true,
            enumerable : true
        },
        "defaultPlayerVar" : {
            /* Default player variables. */
            value : {
                attacker : false,
                delayedAward : null,
                locationsActivated : [false, false, false, false, false, false, false, false],
                newsForSnoopers : [],
                reputation : [0, 0, 0, 0, 0, 0, 0, 0],
                visitedBase : false
            },
            writable : false,
            configurable : true,
            enumerable : true
        }
    });

    /* Public constants. */
    Object.defineProperties(this, {
        /* value will be 'true' if using Oolite v1.77 and newer, false if older. */
        "$gte_v1_77" : {
            value : (0 >= oolite.compareVersion("1.77")),
            writable : false,
            configurable : true,
            enumerable : true
        },
        /* value will be 'true' if using Oolite v1.79 and newer, false if older. */
        "$gte_v1_79" : {
            value : (0 >= oolite.compareVersion("1.79")),
            writable : false,
            configurable : true,
            enumerable : true
        },
        /* Maximum number of Jaguar Company patrol ships allowed. */
        "$maxPatrolShips" : {
            value : 4,
            writable : false,
            configurable : true,
            enumerable : true
        },
        /* Seed for the pseudo random number generator.
         * Affects generation of Jaguar Company and placement of the base.
         */
        "$salt" : {
            value : 19720231,
            writable : false,
            configurable : true,
            enumerable : true
        },
        /* Minimum reputation to be considered a helper. Equivalent to 5 observed hits. */
        "$reputationHelper" : {
            value : 5,
            writable : false,
            configurable : true,
            enumerable : true
        },
        /* Minimum reputation to use the black box. Equivalent to 3 kills. */
        "$reputationBlackbox" : {
            value : 30,
            writable : false,
            configurable : true,
            enumerable : true
        },
        /* Minimum reputation to see the locations for Jaguar Company. Equivalent to 5 kills. */
        "$reputationLocations" : {
            value : 50,
            writable : false,
            configurable : true,
            enumerable : true
        },
        /* Set value to 'true' to use visual effects. */
        "$visualEffects" : {
            value : true,
            writable : false,
            configurable : true,
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

    /* OXPConfig settings. */
    this.oxpcSettings = {
        Info : {
            Name : this.name,
            Display : "Jaguar Company",
            Notify : true,
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

    /* Other public variables. */

    /* Setup player variables. */
    this.$playerVar = p_const.defaultPlayerVar;

    /* World script event handlers. */

    /* NAME
     *   startUp
     *
     * FUNCTION
     *   We only need to do this once.
     *   This will get redefined after a new game or loading of a new Commander.
     */
    this.startUp = function () {
        var cabalScript = worldScripts.Cabal_Common_Functions,
        cclVersion,
        attacker,
        delayedAward,
        locationsActivated,
        reputation,
        visitedBase,
        name,
        counter,
        length;

        if (!cabalScript || cabalScript.Cabal_Common === 'undefined') {
            this.$killSelf(" -> Cabal Common Library is missing.");

            return;
        }

        this.$ccl = new cabalScript.Cabal_Common();
        cclVersion = this.$ccl.internalVersion;

        if (cclVersion < 14) {
            this.$killSelf(" -> Cabal Common Library is too old for any Oolite version.");

            return;
        }

        if (cclVersion === 14 && this.$gte_v1_77) {
            this.$killSelf(" -> Cabal Common Library is too old for Oolite v1.77 (and newer Oolite versions).");

            return;
        }

        /* Find the shortest name length. */
        this.$shortestNameLength = -1;
        length = p_const.shipNames.length;

        for (counter = 0; counter < length; counter += 1) {
            name = p_const.shipNames[counter];

            if (this.$shortestNameLength === -1 || name.length < this.$shortestNameLength) {
                this.$shortestNameLength = name.length;
            }
        }

        if (missionVariables.jaguar_company) {
            /* Retrieve the player variable and parse it. */
            this.$playerVar = JSON.parse(missionVariables.jaguar_company);
            /* Clean the player variable. */
            this.$cleanPlayerVariable();
        } else {
            /* Convert old mission variables. */
            attacker = missionVariables.jaguar_company_attacker;
            delayedAward = missionVariables.jaguar_company_reputation_post_launch;
            locationsActivated = missionVariables.jaguar_company_locations_activated;
            reputation = missionVariables.jaguar_company_reputation;
            visitedBase = missionVariables.jaguar_company_visited_base;

            if (attacker !== null) {
                this.$playerVar.attacker = attacker;

                delete missionVariables.jaguar_company_attacker;
            }

            if (delayedAward !== null) {
                if (delayedAward) {
                    this.$playerVar.delayedAward = delayedAward;
                }

                delete missionVariables.jaguar_company_reputation_post_launch;
            }

            if (locationsActivated !== null) {
                for (counter = galaxyNumber; counter >= 0; counter -= 1) {
                    this.$playerVar.locationsActivated[counter] = locationsActivated;
                }

                delete missionVariables.jaguar_company_locations_activated;
            }

            if (reputation !== null) {
                for (counter = galaxyNumber; counter >= 0; counter -= 1) {
                    this.$playerVar.reputation[counter] = reputation;
                }

                delete missionVariables.jaguar_company_reputation;
            }

            if (visitedBase !== null) {
                this.$playerVar.visitedBase = visitedBase;

                delete missionVariables.jaguar_company_visited_base;
            }

            /* Stringify the player variable and store it. */
            missionVariables.jaguar_company = JSON.stringify(this.$playerVar);
        }

        /* Setup the private main variable + some public variables. */
        this.$setUp();
        /* Remove join navy variable. */
        p_main.joinNavy = null;
        /* Remove the closest naval ship variable. */
        p_main.closestNavyShip = null;
        /* Check if we need to create Jaguar Company in this system. Delay it. */
        this.$setUpCompanyTimerReference = new Timer(this, this.$setUpCompany, 2);
        /* Add the interface system. */
        this.$addInterface();

        log(this.name + " " + this.version + " loaded.");

        /* No longer needed after setting up. */
        delete this.startUp;
    };

    /* NAME
     *   playerWillSaveGame
     *
     * FUNCTION
     *   Player is about to save the game.
     */
    this.playerWillSaveGame = function () {
        /* Clean the player variable. */
        this.$cleanPlayerVariable();
        /* Stringify the player variable and store it. */
        missionVariables.jaguar_company = JSON.stringify(this.$playerVar);
    };

    /* NAME
     *   shipWillLaunchFromStation
     *
     * FUNCTION
     *   Player is about to launch from a station.
     */
    this.shipWillLaunchFromStation = function () {
        /* Remove the interface system. */
        this.$removeInterface();
    };

    /* NAME
     *   shipLaunchedFromStation
     *
     * FUNCTION
     *   Player launched from a station.
     *
     * INPUT
     *   station - entity of the station
     */
    this.shipLaunchedFromStation = function (station) {
        var delayedAward;

        if (station.hasRole("jaguar_company_base")) {
            /* Reset welcomed flag on launch from base. */
            p_main.playerWelcomed = false;

            delayedAward = this.$playerVar.delayedAward;

            if (typeof delayedAward === "number") {
                /* Add on any reputation awarded on docking with an escape pod. */
                this.$playerVar.reputation[galaxyNumber] += delayedAward;
                this.$playerVar.delayedAward = null;
            }
        }
    };

    /* NAME
     *   shipDockedWithStation
     *
     * FUNCTION
     *   Player docked with a station.
     */
    this.shipDockedWithStation = function () {
        var rescuedNames,
        lastName;

        if (this.$snoopersRescued.length) {
            if (this.$snoopersRescued.length === 1) {
                /* Send rescued news for the pilot the player brought in to Snoopers. */
                this.$sendNewsToSnoopers(expandDescription("[jaguar_company_rescue_news]", {
                        jaguar_company_pilot_name : this.$snoopersRescued.shift()
                    }));
            } else {
                /* Send rescued news for the multiple pilots the player brought in to Snoopers. */
                lastName = this.$snoopersRescued.pop();
                rescuedNames = this.$snoopersRescued.join(", ") + " and " + lastName;
                this.$snoopersRescued = [];
                this.$sendNewsToSnoopers(expandDescription("[jaguar_company_rescue_multiple_news]", {
                        jaguar_company_pilot_names : rescuedNames
                    }));
            }
        }

        /* Add the interface system. */
        this.$addInterface();
    };

    /* NAME
     *   shipWillExitWitchspace
     *
     * FUNCTION
     *   Player is about to exit from Witchspace.
     *   Reset everything just before exiting Witchspace.
     */
    this.shipWillExitWitchspace = function () {
        /* Stop and remove the timers. */
        this.$removeTimers();

        if (!system.shipsWithRole("jaguar_company_patrol").length) {
            /* Setup the private main variable + some public variables. */
            this.$setUp();
        } else {
            /* Followed Jaguar Company from interstellar space. */

            /* Remove the hyperspace follow co-ordinates. */
            this.$hyperspaceFollow = null;
        }

        /* Remove join navy variable. */
        p_main.joinNavy = null;
        /* Remove the closest naval ship variable. */
        p_main.closestNavyShip = null;
        /* Not visited the base. */
        this.$playerVar.visitedBase = false;
    };

    /* NAME
     *   shipExitedWitchspace
     *
     * FUNCTION
     *   Player exited Witchspace.
     */
    this.shipExitedWitchspace = function () {
        /* Check if we need to create Jaguar Company in this system. */
        this.$setUpCompany();
    };

    /* NAME
     *   playerEnteredNewGalaxy
     *
     * FUNCTION
     *   Remove some player variables if the player jumps galaxies.
     */
    this.playerEnteredNewGalaxy = function () {
        this.$playerVar.attacker = false;
    };

    /* NAME
     *   shipSpawned
     *
     * FUNCTION
     *   A ship has been born.
     *
     * INPUT
     *   whom - entity that was created
     */
    this.shipSpawned = function (whom) {
        var shipsScript = worldScripts["Jaguar Company Ships"],
        friendList;

        if (!shipsScript) {
            /* Ships world script not setup yet. */
            return;
        }

        /* Get friend roles from the ships world script. */
        friendList = shipsScript.$friendList;

        if (!friendList || friendList.indexOf(whom.entityPersonality) === -1) {
            /* Ignore non-Jaguar Company ships. */
            return;
        }

        if (this.$logAIMessages) {
            /* Turn AI reporting on for the ship. */
            whom.reportAIMessages = true;
        }
    };

    /* NAME
     *   shipDied
     *
     * FUNCTION
     *   Stop and remove the timers if the player dies.
     */
    this.shipDied = function () {
        /* Stop and remove the timers. */
        this.$removeTimers();
    };

    /* NAME
     *   missionScreenOpportunity
     *
     * FUNCTION
     *   Show a welcome message on docking as a mission screen.
     */
    this.missionScreenOpportunity = function () {
        var base = this.$jaguarCompanyBase;

        if (!base || !base.isValid) {
            /* Base not setup. */
            return;
        }

        if (player.ship.dockedStation.entityPersonality === base.entityPersonality && !p_main.playerWelcomed) {
            /* Player docked with Jaguar Company Base. */
            this.$welcomeMessage();
        }
    };

   /* NAME
     *   shipScoopedOther
     *
     * FUNCTION
     *   Player has scooped something.
     *
     * INPUT
     *   whom - entity of the scooped object
     */
    this.shipScoopedOther = function (whom) {
        if (!whom.$jaguarCompany) {
            /* Does not contain a member of Jaguar Company. */
            return;
        }

        if (this.$logging && this.$logExtra) {
            log(this.name, "shipScoopedOther::Scooped Jaguar Company member: " + whom.$pilotName);
        }

        /* Save the pilot's name that was rescued. */
        this.$pilotsRescued.push(whom.$pilotName);
        this.$snoopersRescued.push(whom.$pilotName);
    };

    /* NAME
     *   guiScreenChanged
     *
     * FUNCTION
     *   Show Jaguar Company Base locations on certain GUI screens.
     *
     * INPUTS
     *   to - GUI screen the player has gone to
     *   from - GUI screen the player has come from
     */
    this.guiScreenChanged = function (to, from) {
        var counter,
        length;

        if (player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX") !== "EQUIPMENT_OK" ||
            !this.$playerVar.locationsActivated[galaxyNumber]) {
            /* No software patch uploaded to the black box. */
            return;
        }

        if (to === "GUI_SCREEN_LONG_RANGE_CHART") {
            /* Add the marked systems to the long range chart. */
            length = this.$jaguarCompanySystemIDs.length;

            for (counter = 0; counter < length; counter += 1) {
                mission.markSystem({
                    system : this.$jaguarCompanySystemIDs[counter],
                    name : this.name,
                    markerColor : "orangeColor",
                    markerScale : 1.5,
                    markerShape : "MARKER_SQUARE"
                });
            }

            player.consoleMessage("Orange coloured squares show Jaguar Company Base locations.", 5);

            if (player.ship.docked) {
                player.consoleMessage("Press F4 for a list of Jaguar Company Base locations.", 5);
            } else {
                player.consoleMessage("Press F7 then F5 for a list of Jaguar Company Base locations.", 5);
            }
        }

        if (from === "GUI_SCREEN_LONG_RANGE_CHART") {
            /* Remove the marked systems from the long range chart. */
            length = this.$jaguarCompanySystemIDs.length;

            for (counter = 0; counter < length; counter += 1) {
                mission.unmarkSystem({
                    system : this.$jaguarCompanySystemIDs[counter],
                    name : this.name
                });
            }
        }

        if (from === "GUI_SCREEN_SYSTEM_DATA" && to === "GUI_SCREEN_STATUS") {
            if (player.ship.docked) {
                /* Ignore when docked. */
                return;
            }

            this.$showBaseLocations();
        }
    };

    /* NAME
     *   viewDirectionChanged
     *
     * FUNCTION
     *   Reset page count when the player view changes.
     */
    this.viewDirectionChanged = function () {
        this.$printIndex = 0;
    };

    /* Other global functions. */

    /* NAME
     *   oxpcNotifyOnChange
     *
     * FUNCTION
     *   This function is called by OXPConfig when settings are changed.
     *
     * INPUT
     *   n - number
     *     1 - boolean settings changed
     *     2 - short unsigned integers changed
     *     4 - unsigned 24Bit integer changed
     */
    this.oxpcNotifyOnChange = function (n) {
        if (n & 1 && this.$alwaysSpawn && !this.$jaguarCompanyBase) {
            /* $alwaysSpawn has been set in OXPConfig and the base doesn't exist.
             * Check if we need to create Jaguar Company in this system. Delay it.
             */
            this.$setUpCompanyTimerReference = new Timer(this, this.$setUpCompany, 2);
        }
    };

    /* NAME
     *   $setUp
     *
     * FUNCTION
     *   Setup the private main variable + some public variables.
     */
    this.$setUp = function () {
        var saveGalaxyNumber = null;

        if (typeof p_main.galaxyNumber === "number") {
            /* Save the internal galaxy number used by $cacheJaguarCompanySystems() */
            saveGalaxyNumber = p_main.galaxyNumber;
        }

        /* Initialise the p_main variable object.
         * Encapsulates all private global data.
         */
        p_main = {
            /* Initialise the available ship names. */
            availableShipNames : p_const.shipNames,
            /* Initial state of the black box ASC tracker. */
            blackboxASCActivated : false,
            /* Initial state of the black box holo-tracker. */
            blackboxHoloActivated : false,
            /* Internal galaxy number used by $cacheJaguarCompanySystems() */
            galaxyNumber : saveGalaxyNumber,
            /* Player welcomed. Used to control the mission screen display. */
            playerWelcomed : false,
            /* Current route index. */
            routeIndex : 0,
            /* Routes are initialised when Jaguar Company is spawned. */
            routes : [],
            /* Initialise main seed for galaxy 1. */
            seed : {
                w0 : 0x5a4a,
                w1 : 0x0248,
                w2 : 0xb753
            }
        };

        if (!this.$pilotsRescued || !this.$snoopersRescued) {
            /* Array of Jaguar Company pilot names that have been rescued.
             *
             *   $pilotsRescued - used when unloading pilots from their escape pods at a station
             *   $snoopersRescued - used when docked to send a report to Snoopers news services (if installed)
             */
            if (!this.$pilotsRescued) {
                this.$pilotsRescued = [];
            }

            if (!this.$snoopersRescued) {
                this.$snoopersRescued = [];
            }
        }

        /* Tracker object. */
        this.$tracker = null;
        /* Visual tracker object. */
        this.$visualTracker = null;
        /* Base has not been setup yet. */
        this.$jaguarCompanyBase = false;
        /* New base so clear this variable. */
        this.$swapBase = false;
        /* Remove the hyperspace follow co-ordinates. */
        this.$hyperspaceFollow = null;
        /* Create an array of Jaguar Company Base locations. */
        this.$cacheJaguarCompanySystems();
    };

    /* NAME
     *   $killSelf
     *
     * FUNCTION
     *   Removes all functions and variables.
     *
     * INPUT
     *   desc - description for the removal (optional)
     */
    this.$killSelf = function (desc) {
        var prop;

        if (desc && typeof desc === "string") {
            player.consoleMessage(this.name + " - Check your Latest.log", 10);
            log(this.name, this.name + " - Shutting down" + desc);
        }

        /* Delete public functions and variables. */
        for (prop in this) {
            if (this.hasOwnProperty(prop)) {
                if (prop !== 'name' && prop !== 'version') {
                    delete this[prop];
                }
            }
        }

        /* Set the deactivated flag for Cabal Common Library. */
        this.deactivated = true;

        return;
    };

    /* NAME
     *   $showProps
     *
     * FUNCTION
     *   For debugging only.
     */
    this.$showProps = function () {
        var result = "",
        prop,
        subProp,
        route,
        routeCounter,
        routeLength,
        news,
        counter,
        length;

        for (prop in this) {
            if (this.hasOwnProperty(prop)) {
                if (typeof this[prop] !== "function") {
                    if (prop !== "$playerVar") {
                        result += "this." + prop + ": " + this[prop] + "\n";
                    } else {
                        for (subProp in this.$playerVar) {
                            if (this.$playerVar.hasOwnProperty(subProp)) {
                                result += "this.$playerVar." + subProp + ": " + this.$playerVar[subProp] + "\n";
                            }
                        }
                    }
                } else {
                    result += "this." + prop + " = function ()\n";
                }
            }
        }

        for (prop in p_main) {
            if (p_main.hasOwnProperty(prop)) {
                result += "p_main." + prop + ": " + p_main[prop] + "\n";
            }
        }

        length = p_main.routes.length;

        if (length) {
            result += "Routes (" + length + ")\n";

            for (counter = 0; counter < length; counter += 1) {
                result += "#" + (counter + 1) + ") ";
                route = p_main.routes[counter];
                routeCounter = 1;
                routeLength = Object.keys(route).length;

                for (prop in route) {
                    if (route.hasOwnProperty(prop)) {
                        result += prop + ": " + route[prop] + (routeCounter === routeLength ? "\n" : ", ");
                        routeCounter += 1;
                    }
                }
            }
        }

        length = this.$playerVar.newsForSnoopers.length;

        if (length) {
            result += "News for Snoopers (" + length + ")\n";

            for (counter = 0; counter < length; counter += 1) {
                news = this.$playerVar.newsForSnoopers[counter];
                result += "#" + (counter + 1) + ") " +
                "ID: " + news.ID + ", " +
                "Message: " + news.Message + ", " +
                "Agency: " + news.Agency + "\n";
            }
        }

        log(this.name, "$showProps::\n" + result);
    };

    /* NAME
     *   $cleanPlayerVariable
     *
     * FUNCTION
     *   Clean up the player variable for loading or saving.
     */
    this.$cleanPlayerVariable = function () {
        var playerVarsProps,
        defaultPlayerVarProps,
        prop,
        counter,
        length;

        /* Get the properties of the player variables. */
        playerVarsProps = Object.keys(this.$playerVar);
        /* Get the properties of the default player variables. */
        defaultPlayerVarProps = Object.keys(p_const.defaultPlayerVar);

        /* Remove old properties. */
        for (prop in this.$playerVar) {
            if (this.$playerVar.hasOwnProperty(prop)) {
                if (defaultPlayerVarProps.indexOf(prop) === -1) {
                    /* Not a default property. */
                    delete this.$playerVar[prop];
                }
            }
        }

        /* Cache the length. */
        length = defaultPlayerVarProps.length;

        /* Add new properties. */
        for (counter = 0; counter < length; counter += 1) {
            prop = defaultPlayerVarProps[counter];

            if (playerVarsProps.indexOf(prop) === -1) {
                /* Missing a default property. */
                this.$playerVar[prop] = p_const.defaultPlayerVar[prop];
            }
        }
    };

    /* NAME
     *   $removeTimers
     *
     * FUNCTION
     *   Stop and remove the timers.
     */
    this.$removeTimers = function () {
        /* Stop and remove the script sanity timer. */
        if (this.$scriptSanityTimerReference) {
            if (this.$scriptSanityTimerReference.isRunning) {
                this.$scriptSanityTimerReference.stop();
            }

            this.$scriptSanityTimerReference = null;
        }

        /* Stop and remove the Black Box timer. */
        if (this.$blackBoxTimerReference) {
            if (this.$blackBoxTimerReference.isRunning) {
                this.$blackBoxTimerReference.stop();
            }

            this.$blackBoxTimerReference = null;
        }

        /* Stop and remove the base swap timer. */
        if (this.$baseSwapTimerReference) {
            if (this.$baseSwapTimerReference.isRunning) {
                this.$baseSwapTimerReference.stop();
            }

            this.$baseSwapTimerReference = null;
        }
    };

    /* NAME
     *   $addInterface
     *
     * FUNCTION
     *   Add the interface system if docked and the software patch is uploaded
     *   to the black box (which has to be present).
     */
    this.$addInterface = function () {
        if (player.ship.docked &&
            player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX") === "EQUIPMENT_OK" &&
            this.$playerVar.locationsActivated[galaxyNumber]) {
            player.ship.dockedStation.setInterface("jaguar_company_base_list", {
                title : "Jaguar Company Base locations",
                summary : "Displays a list of Jaguar Company Base locations within the current galaxy.",
                category : expandDescription("[interfaces-category-organisations]"),
                callback : this.$showBaseLocations.bind(this)
            });
        }
    };

    /* NAME
     *   $removeInterface
     *
     * FUNCTION
     *   Remove the interface system.
     */
    this.$removeInterface = function () {
        if (player.ship.docked) {
            /* Remove if docked. */
            player.ship.dockedStation.setInterface("jaguar_company_base_list", null);
        }
    };

    /* NAME
     *   $showBaseLocations
     *
     * FUNCTION
     *   Show the base locations as a 2 column list.
     */
    this.$showBaseLocations = function () {
        var choicesKey,
        locations;

        /* Initial index. */
        this.$printIndex = 0;
        /* Need to work out the first choices key before we create the list. 2 column layout. */
        choicesKey = this.$firstChoicesKey(this.$jaguarCompanySystemNames, 2);
        /* Create the list. */
        locations = this.$listNames(this.$jaguarCompanySystemNames);
        /* Display it as a mission screen. */
        mission.runScreen({
            title : "Jaguar Company Base locations",
            message : locations + "\n",
            choicesKey : choicesKey,
            exitScreen : "GUI_SCREEN_INTERFACES"
        }, this.$locationChoices, this);
    };

    /* NAME
     *   $firstChoicesKey
     *
     * FUNCTION
     *   Figure out the first choices key for the pager.
     *   Modifies the maximum amount of lines that can be used for displaying the list.
     *
     * INPUTS
     *   list - array of strings to be displayed
     *   columns - number of columns displayed
     *
     * RESULT
     *   result - choices key
     */
    this.$firstChoicesKey = function (list, columns) {
        var choicesKey;

        if (list.length <= columns * 19) {
            /* Maximum lines available for the list on the mission screen with 1 choice and a blank line. */
            this.$lines = 19;
            /* Initial choices key. */
            choicesKey = "jaguar_company_choices_1_page";
        } else if (list.length <= 2 * columns * 18) {
            /* Maximum lines available for the list on the mission screen with 2 choices and a blank line. */
            this.$lines = 18;
            /* Initial choices key. */
            choicesKey = "jaguar_company_choices_1_of_2";
        } else {
            /* Maximum lines available for the list on the mission screen with 3 choices and a blank line. */
            this.$lines = 17;
            /* Initial choices key. */
            choicesKey = "jaguar_company_choices_start_of_many";
        }

        return choicesKey;
    };

    /* NAME
     *   $nextChoicesKey
     *
     * FUNCTION
     *   Figure out the next choices key for the pager.
     *
     * INPUTS
     *   choice - choice selected
     *   list - array of strings to be displayed
     *   columns - number of columns displayed
     *
     * RESULT
     *   result - choices key
     */
    this.$nextChoicesKey = function (choice, list, columns) {
        var choicesKey;

        if (choice === "M_1_FIRST_PAGE") {
            this.$printIndex = 0;
            choicesKey = "jaguar_company_choices_start_of_many";
        } else if (choice === "2_1_NEXT_PAGE") {
            this.$printIndex = columns * this.$lines;
            choicesKey = "jaguar_company_choices_2_of_2";
        } else if (choice === "M_1_NEXT_PAGE") {
            this.$printIndex = this.$printIndex + (columns * this.$lines);

            if (this.$printIndex + (columns * this.$lines) < list.length - 1) {
                choicesKey = "jaguar_company_choices_middle_of_many";
            } else {
                choicesKey = "jaguar_company_choices_end_of_many";
            }
        } else if (choice === "2_1_PREV_PAGE") {
            this.$printIndex = 0;
            choicesKey = "jaguar_company_choices_1_of_2";
        } else if (choice === "M_2_PREV_PAGE") {
            this.$printIndex = this.$printIndex - (columns * this.$lines);

            if (this.$printIndex) {
                choicesKey = "jaguar_company_choices_middle_of_many";
            } else {
                choicesKey = "jaguar_company_choices_start_of_many";
            }
        } else if (choice === "M_2_LAST_PAGE") {
            this.$printIndex = Math.floor(list.length / (columns * this.$lines)) * (columns * this.$lines);
            choicesKey = "jaguar_company_choices_end_of_many";
        } else if (choice === "1_1_EXIT" || choice === "2_2_EXIT" || choice === "M_3_EXIT") {
            choicesKey = "EXIT";
        } else {
            player.consoleMessage("Error logged. Inform the author of Jaguar Company OXP.");
            log(this.name, "$nextChoicesKey::choice: " + choice + "\n" +
                "* list: " + list.join(", ") + " (" + list.length + ")\n" +
                "* columns: " + columns + "\n" +
                "* $printIndex: " + this.$printIndex + "\n" +
                "* $lines: " + this.$lines + "\n");
            choicesKey = "ERROR";
        }

        return choicesKey;
    };

    /* NAME
     *   $locationChoices
     *
     * FUNCTION
     *   Callback for base location lister.
     *
     * INPUT
     *   choice - key of the choice selected
     */
    this.$locationChoices = function (choice) {
        var choicesKey = this.$nextChoicesKey(choice, this.$jaguarCompanySystemNames, 2),
        locations;

        if (choicesKey === "EXIT" || choicesKey === "ERROR") {
            /* Exit selected or there was an error. */
            return;
        }

        locations = this.$listNames(this.$jaguarCompanySystemNames);
        mission.runScreen({
            title : "Jaguar Company Base locations",
            message : locations + "\n",
            choicesKey : choicesKey,
            exitScreen : "GUI_SCREEN_INTERFACES"
        }, this.$locationChoices, this);
    };

    /* NAME
     *   $listNames
     *
     * FUNCTION
     *   Build a 2 column list of Jaguar Company Base locations.
     *   Original idea from Spara's Trophy Collector OXP.
     *   Highly modified and simplified.
     *   Modified using Cabal Common Library for Oolite v1.77 and newer.
     *
     * INPUT
     *   list - array of strings to be displayed
     *
     * RESULT
     *   result - columnized list of names as a string
     */
    this.$listNames = function (list) {
        var columnized = "",
        row,
        start = this.$printIndex,
        /* Maximum number of rows. */
        lines = this.$lines,
        lname,
        rname,
        i;

        /* No Bases? */
        if (!list.length) {
            return "No bases in this sector.\n";
        }

        /* Less entries than rows? */
        if (list.length - start < lines) {
            lines = list.length - start;
        }

        for (i = 0; i < lines; i += 1) {
            if (start + i + lines < list.length) {
                /* Two column layout. */
                /* Left column. Truncated or padded with spaces. */
                lname = this.$ccl.strToWidth(list[start + i], 15, " ");
                /* Right column. Truncated. */
                rname = this.$ccl.strToWidth(list[start + i + lines], 15);
                /* Create the row. */
                row = this.$ccl.strAdd2Columns(lname, 1, rname, 17);
            } else {
                /* One column layout. */
                /* Left column. Truncated. */
                lname = this.$ccl.strToWidth(list[start + i], 31);
                /* Create the row. */
                row = this.$ccl.strAddIndentedText(lname, 1);
            }

            columnized += row + "\n";
        }

        return columnized;
    };

    /* NAME
     *   $cacheJaguarCompanySystems
     *
     * FUNCTION
     *   Keep a record of system IDs and names for the current galaxy.
     */
    this.$cacheJaguarCompanySystems = function () {
        var a,
        b,
        c,
        government,
        governmentNames = [
            "Anarchy",
            "Feudal",
            "Multi-Government"
        ],
        scrambledPRN,
        systemProbability,
        counter,
        logMsg = "$cacheJaguarCompanySystems::\n";

        /* Have the base locations for this galaxy been setup? */
        if (typeof p_main.galaxyNumber === "number" && p_main.galaxyNumber === galaxyNumber) {
            /* Already setup. */
            return;
        }

        /* Save the galaxy number. */
        p_main.galaxyNumber = galaxyNumber;
        /* Clear the base location arrays. */
        this.$jaguarCompanySystemIDs = [];
        this.$jaguarCompanySystemNames = [];
        this.$jaguarCompanyInterstellar = [];

        /* Alter the seed for the current galaxy. */
        for (counter = 0; counter < galaxyNumber; counter += 1) {
            this.$rng_nextgalaxy();
        }

        /* Reset the random seed. */
        p_main.rnd_seed = {};

        /* Check systems for Jaguar Company Base. */
        for (counter = 0; counter < 256; counter += 1) {
            /* Figure out pseudoRandomNumber, as a 24-bit integer, for the system being checked. */
            p_main.rnd_seed.a = p_main.seed.w1 & 0xff;
            p_main.rnd_seed.b = (p_main.seed.w1 >> 8) & 0xff;
            p_main.rnd_seed.c = p_main.seed.w2 & 0xff;
            p_main.rnd_seed.d = (p_main.seed.w2 >> 8) & 0xff;
            a = this.$gen_rnd_number();
            b = this.$gen_rnd_number();
            c = this.$gen_rnd_number();
            a = (a << 16) | (b << 8) | c;

            /* Re-implementation of system.scrambledPseudoRandomNumber
             * Add the salt to the pseudoRandomNumber to enable generation of different sequences.
             */
            a += this.$salt;
            /* Scramble with basic LCG psuedo-random number generator. */
            a = (214013 * a + 2531011) & 0xFFFFFFFF;
            a = (214013 * a + 2531011) & 0xFFFFFFFF;
            a = (214013 * a + 2531011) & 0xFFFFFFFF;
            /* Convert from (effectively) 32-bit signed integer to float in [0..1]. */
            scrambledPRN = a / 4294967296.0 + 0.5;

            /* Calculate the system government from the current seed. */
            government = (p_main.seed.w1 >> 3) & 7;

            /* Now we do the actual system check for Jaguar Company. */
            if (government <= 2) {
                /* We only use the first 3 government types.
                 * Therefore probabilities will be:
                 *   Anarchy:          37.5%
                 *   Feudal:           25.0%
                 *   Multi-Government: 12.5%
                 *
                 * Intestellar space will halve these probabilites.
                 */
                systemProbability = 0.125 * (3 - government);

                if (scrambledPRN <= systemProbability) {
                    if (this.$logging && this.$logExtra) {
                        logMsg += "* Name: " + System.systemNameForID(counter) +
                        ", Government type: " + governmentNames[government] + "\n";
                    }

                    /* Insert the ID into an array. */
                    this.$jaguarCompanySystemIDs.push(counter);
                    /* Insert the name with government type into an array. */
                    this.$jaguarCompanySystemNames.push(System.systemNameForID(counter) + " " +
                        "(" + governmentNames[government] + ")");
                }

                if (scrambledPRN <= systemProbability / 2) {
                    if (this.$logging && this.$logExtra) {
                        logMsg += "** Interstellar.\n";
                    }

                    this.$jaguarCompanyInterstellar.push(counter);
                }
            }

            /* Tweak the main seed for the next system. */
            this.$rng_tweakseed();
            this.$rng_tweakseed();
            this.$rng_tweakseed();
            this.$rng_tweakseed();
        }

        /* Sort the names. */
        this.$jaguarCompanySystemNames.sort();

        if (this.$logging && this.$logExtra) {
            log(this.name, logMsg);
        }
    };

    /* NAME
     *   $rng_rotatel
     *
     * FUNCTION
     *   Rotate 8-bit number leftwards.
     *
     * INPUT
     *   x - 8-bit number to rotate leftwards
     *
     * RESULT
     *   result - rotated 8-bit number
     */
    this.$rng_rotatel = function (x) {
        x = (x & 0xff) * 2;

        return (x & 0xff) | (x > 0xff);
    };

    /* NAME
     *   $rng_twist
     *
     * FUNCTION
     *   Twist 16-bit number.
     *
     * INPUT
     *   x - 16-bit number to twist
     *
     * RESULT
     *   result - twisted 16-bit number
     */
    this.$rng_twist = function (x) {
        return (this.$rng_rotatel(x >> 8) << 8) + this.$rng_rotatel(x & 0xff);
    };

    /* NAME
     *   $rng_nextgalaxy
     *
     * FUNCTION
     *   Next galaxy.
     *
     *   Apply to main seed; once for galaxy 2
     *   twice for galaxy 3, etc.
     *   Eighth application gives galaxy 1 again.
     */
    this.$rng_nextgalaxy = function () {
        p_main.seed.w0 = this.$rng_twist(p_main.seed.w0);
        p_main.seed.w1 = this.$rng_twist(p_main.seed.w1);
        p_main.seed.w2 = this.$rng_twist(p_main.seed.w2);
    };

    /* NAME
     *   $rng_tweakseed
     *
     * FUNCTION
     *   Main seed tweaker.
     */
    this.$rng_tweakseed = function () {
        var tmp;

        tmp = p_main.seed.w0 + p_main.seed.w1 + p_main.seed.w2;
        tmp &= 0xffff;

        p_main.seed.w0 = p_main.seed.w1;
        p_main.seed.w1 = p_main.seed.w2;
        p_main.seed.w2 = tmp;
    };

    /* NAME
     *   $gen_rnd_number
     *
     * FUNCTION
     *   Random number generator.
     *
     * RESULT
     *   result - random number
     */
    this.$gen_rnd_number = function () {
        var x = (p_main.rnd_seed.a * 2) & 0xFF,
        a = x + p_main.rnd_seed.c;

        if (p_main.rnd_seed.a > 127) {
            a += 1;
        }

        p_main.rnd_seed.a = a & 0xFF;
        p_main.rnd_seed.c = x;

        /* a = any carry left from above */
        a = a / 256;
        x = p_main.rnd_seed.b;
        a = (a + x + p_main.rnd_seed.d) & 0xFF;
        p_main.rnd_seed.b = a;
        p_main.rnd_seed.d = x;

        return a;
    };

    /* NAME
     *   $scriptSanityTimer
     *
     * FUNCTION
     *   Periodic function to check if Jaguar Company has spawned correctly.
     *
     *   Checks the base, asteroids, black box and tracker.
     *   Patrol ships, tug, buoy and miner are checked within the base ship script.
     *
     *   The order that this is done in is important.
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
                /* Reload the ship script. */
                base.setScript("jaguar_company_base.js");
                base.script.shipSpawned();

                if (this.$logging && this.$logExtra) {
                    log(this.name, "Script sanity check - fixed the base.");
                }
            } else {
                /* Don't re-check. */
                this.$baseOK = true;
            }
        }

        /* Check the asteroids. */
        if (!this.$asteroidsOK) {
            /* Search for asteroids around the base. */
            asteroids = system.shipsWithPrimaryRole("jaguar_company_asteroid");

            if (asteroids.length > 0) {
                /* Set the counter to all entities found. */
                p_main.asteroidsToCheck = asteroids.length;
                /* Cache the length. */
                length = asteroids.length;

                /* Iterate through each of the asteroids. */
                for (counter = 0; counter < length; counter += 1) {
                    asteroid = asteroids[counter];

                    if (asteroid.script.name !== "jaguar_company_asteroid.js") {
                        /* Reload the ship script. */
                        asteroid.setScript("jaguar_company_asteroid.js");
                        asteroid.script.shipSpawned();

                        if (this.$logging && this.$logExtra) {
                            log(this.name, "Script sanity check - fixed an asteroid.");
                        }
                    } else {
                        p_main.asteroidsToCheck -= 1;
                    }
                }

                if (!p_main.asteroidsToCheck) {
                    /* Don't re-check. */
                    this.$asteroidsOK = true;
                    p_main.asteroidsToCheck = null;
                }
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
                /* Reload the ship script. */
                blackbox.setScript("jaguar_company_blackbox.js");

                if (this.$logging && this.$logExtra) {
                    log(this.name, "Script sanity check - fixed the black box.");
                }
            } else {
                /* Don't re-check. */
                this.$blackboxOK = true;
            }
        }

        if (this.$blackboxOK && (!this.$trackerOK || !this.$visualTrackerOK)) {
            /* Black box script has been fixed. Check the trackers. */

            /* Check the ASC tracker. */
            if (!this.$trackerOK && this.$tracker && this.$tracker.isValid) {
                if (this.$tracker.script.name !== "jaguar_company_tracker.js") {
                    /* Reload the ship script. */
                    this.$tracker.setScript("jaguar_company_tracker.js");
                    this.$tracker.script.shipSpawned();

                    if (this.$logging && this.$logExtra) {
                        log(this.name, "Script sanity check - fixed the tracker.");
                    }
                } else {
                    /* Don't re-check. */
                    this.$trackerOK = true;
                }
            }

            /* Check the holo-tracker. */
            if (!this.$visualTrackerOK && this.$visualTracker && this.$visualTracker.isValid) {
                if (this.$visualTracker.script.name !== "jaguar_company_tracker.js") {
                    /* Reload the ship script. */
                    this.$visualTracker.setScript("jaguar_company_tracker.js");
                    this.$visualTracker.script.effectSpawned();

                    if (this.$logging && this.$logExtra) {
                        log(this.name, "Script sanity check - fixed the visual tracker.");
                    }
                } else {
                    /* Don't re-check. */
                    this.$visualTrackerOK = true;
                }
            }
        }
    };

    /* NAME
     *   $blackBoxTimer
     *
     * FUNCTION
     *   If the player has received the black box and then attacks Jaguar Company,
     *   this will remove it and the tracker and this timer.
     *
     *   Also checks if we are within 5km of the patrol ships, if so we remove the tracker.
     *
     *   Called every 5 seconds.
     */
    this.$blackBoxTimer = function () {
        var blackBoxStatus,
        patrolShips;

        if (this.$playerVar.attacker) {
            /* The player is an attacker of Jaguar Company. */
            blackBoxStatus = player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX");

            if (blackBoxStatus === "EQUIPMENT_OK" || blackBoxStatus === "EQUIPMENT_DAMAGED") {
                /* Remove the software patch from the black box. */
                this.$playerVar.locationsActivated[galaxyNumber] = false;
                /* Remove the black box. */
                player.ship.removeEquipment("EQ_JAGUAR_COMPANY_BLACK_BOX");
                player.commsMessage("Black Box self-destructed!");
                /* Reset the black box. */
                this.$blackboxASCReset(false);
                this.$blackboxHoloReset(false);

                /* Stop and remove the Black Box timer. */
                if (this.$blackBoxTimerReference) {
                    if (this.$blackBoxTimerReference.isRunning) {
                        this.$blackBoxTimerReference.stop();
                    }

                    this.$blackBoxTimerReference = null;
                }
            }
        } else if ((this.$tracker && this.$tracker.isValid) || (this.$visualTracker && this.$visualTracker.isValid)) {
            if (player.ship.equipmentStatus("EQ_ADVANCED_COMPASS") !== "EQUIPMENT_OK") {
                player.consoleMessage("Tracker deactivating.");
                player.consoleMessage("Advanced Space Compass damaged.");
                /* Reset the black box. */
                this.$blackboxASCReset(false);
                this.$blackboxHoloReset(false);
            } else {
                patrolShips = system.shipsWithPrimaryRole("jaguar_company_patrol", player.ship);

                if (patrolShips.length > 0 && player.ship.position.distanceTo(patrolShips[0].position) < 5000) {
                    player.consoleMessage("Tracker deactivating.");
                    player.consoleMessage("Patrol ships close by.");
                    /* Reset the black box. */
                    this.$blackboxASCReset(false);
                    this.$blackboxHoloReset(false);
                }
            }
        }
    };

    /* NAME
     *   $baseSwapTimer
     *
     * FUNCTION
     *   Swap the base role dependent on the reputation mission variable.
     *
     *   Called every 5 seconds.
     */
    this.$baseSwapTimer = function () {
        var base = this.$jaguarCompanyBase,
        position,
        orientation,
        reputation,
        displayName,
        newBase,
        newBaseRole,
        entities,
        entity,
        distance,
        direction,
        entityCounter,
        entityLength;

        if (!base || !base.isValid) {
            /* Stop and remove the base swap timer. */
            this.$baseSwapTimerReference.stop();
            this.$baseSwapTimerReference = null;

            return;
        }

        reputation = this.$playerVar.reputation[galaxyNumber];

        /* Set up the role that the base should have. */
        if (reputation < this.$reputationHelper) {
            newBaseRole = "jaguar_company_base_no_discount";
        } else if (reputation < this.$reputationBlackbox) {
            newBaseRole = "jaguar_company_base_discount";
        } else {
            newBaseRole = "jaguar_company_base_discount_and_docking";
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

        if (entities.length) {
            /* Cache the length. */
            entityLength = entities.length;

            for (entityCounter = 0; entityCounter < entityLength; entityCounter += 1) {
                entity = entities[entityCounter];
                /* Current distance of the entity from the base. */
                distance = entity.position.distanceTo(base.position);
                /* New distance to move the entity by. */
                distance = (base.collisionRadius - distance) + entity.collisionRadius + 10;
                /* Update position along the original direction vector. */
                direction = entity.position.subtract(base.position).direction();
                entity.position = entity.position.add(direction.multiply(distance));
            }
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
        /* Remove the original base quietly: don't trigger 'shipDied' in the ship script. */
        base.remove(true);
        /* Setup the new base with the original properties. */
        newBase = system.addShips(newBaseRole, 1, position, 0)[0];
        newBase.position = position;
        newBase.orientation = orientation;
        newBase.displayName = displayName;
        /* Stop any kick in velocity we may get from any nearby entity.
         * Imagine a station that you need injectors to out run.
         */
        newBase.velocity = new Vector3D(0, 0, 0);
        /* Update the base reference. */
        this.$jaguarCompanyBase = newBase;
    };

    /* NAME
     *   $blackboxToggle
     *
     * FUNCTION
     *   Toggle the activation of the black box ASC equipment.
     */
    this.$blackboxToggle = function () {
        var playerShip = player.ship,
        patrolShips = system.shipsWithPrimaryRole("jaguar_company_patrol", playerShip),
        ascStatus = playerShip.equipmentStatus("EQ_ADVANCED_COMPASS"),
        blackboxStatus = playerShip.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX");

        if (ascStatus !== "EQUIPMENT_OK") {
            player.consoleMessage("You need a working Advanced Space Compass for this equipment.");
        } else if (blackboxStatus === "EQUIPMENT_OK") {
            if (!patrolShips.length) {
                player.consoleMessage("Can not show tracker. No patrol ships found.");
            } else if (playerShip.position.distanceTo(patrolShips[0].position) < 5000) {
                player.consoleMessage("Tracker not activated. Patrol ships close by.");
            } else {
                if (p_main.blackboxASCActivated) {
                    this.$blackboxASCReset(true);
                } else {
                    this.$blackboxASCSet(true);
                }
            }

            p_main.blackboxASCActivated = !p_main.blackboxASCActivated;
        } else if (blackboxStatus === "EQUIPMENT_DAMAGED") {
            player.commsMessage("Black Box Damaged!");
            player.commsMessage("Return to the nearest Jaguar Company Base for repairs.");
        }
    };

    /* NAME
     *   $blackboxMode
     *
     * FUNCTION
     *   Toggle the activation of the black box holo equipment.
     */
    this.$blackboxMode = function () {
        var playerShip = player.ship,
        patrolShips = system.shipsWithPrimaryRole("jaguar_company_patrol", playerShip),
        ascStatus = playerShip.equipmentStatus("EQ_ADVANCED_COMPASS"),
        blackboxStatus = playerShip.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX");

        if (ascStatus !== "EQUIPMENT_OK") {
            player.consoleMessage("You need a working Advanced Space Compass for this equipment.");
        } else if (blackboxStatus === "EQUIPMENT_OK") {
            if (!patrolShips.length) {
                player.consoleMessage("Can not show holo-tracker. No patrol ships found.");
            } else if (playerShip.position.distanceTo(patrolShips[0].position) < 5000) {
                player.consoleMessage("Holo-tracker not activated. Patrol ships close by.");
            } else {
                if (p_main.blackboxHoloActivated) {
                    this.$blackboxHoloReset(true);
                } else {
                    this.$blackboxHoloSet(true);
                }
            }

            p_main.blackboxHoloActivated = !p_main.blackboxHoloActivated;
        } else if (blackboxStatus === "EQUIPMENT_DAMAGED") {
            player.commsMessage("Black Box Damaged!");
            player.commsMessage("Return to the nearest Jaguar Company Base for repairs.");
        }
    };

    /* NAME
     *   $blackboxASCSet
     *
     * FUNCTION
     *   Setup the black box ASC equipment.
     *
     * INPUT
     *   showMsg - boolean
     *     true - show console message
     *     false - do not show console message
     */
    this.$blackboxASCSet = function (showMsg) {
        var patrolShips = system.shipsWithPrimaryRole("jaguar_company_patrol", player.ship);

        if (patrolShips.length && (!this.$tracker || !this.$tracker.isValid)) {
            /* Invisible object. */
            this.$tracker = system.addShips("jaguar_company_tracker", 1, patrolShips[0].position, 10000)[0];

            if (showMsg && this.$tracker && this.$tracker.isValid) {
                player.consoleMessage("Black Box ASC tracker activated.");
                player.consoleMessage("Follow beacon code 'T' on your ASC.");
            }
        }
    };

    /* NAME
     *   $blackboxHoloSet
     *
     * FUNCTION
     *   Setup the black box holo-tracker equipment.
     *
     * INPUT
     *   showMsg - boolean
     *     true - show console message
     *     false - do not show console message
     */
    this.$blackboxHoloSet = function (showMsg) {
        var patrolShips = system.shipsWithPrimaryRole("jaguar_company_patrol", player.ship);

        if (this.$visualEffects && patrolShips.length &&
            (!this.$visualTracker || !this.$visualTracker.isValid)) {
            this.$visualTracker = system.addVisualEffect("jaguar_company_tracker", player.ship.position);

            if (showMsg && this.$visualTracker && this.$visualTracker.isValid) {
                player.consoleMessage("Black Box holo-tracker activated.");
                player.consoleMessage("Green is fore, red is aft.");
            }
        }
    };

    /* NAME
     *   $blackboxASCReset
     *
     * FUNCTION
     *   Reset the black box ASC equipment.
     *
     * INPUT
     *   showMsg - boolean
     *     true - show console message
     *     false - do not show console message
     */
    this.$blackboxASCReset = function (showMsg) {
        if (this.$tracker && this.$tracker.isValid) {
            /* Remove the tracker quietly: don't trigger 'shipDied' in the ship script. */
            this.$tracker.remove(true);
            this.$trackerOK = false;

            if (showMsg) {
                player.consoleMessage("Black Box ASC tracker deactivated.");
            }
        }
    };

    /* NAME
     *   $blackboxHoloReset
     *
     * FUNCTION
     *   Reset the black box holo-tracker equipment.
     *
     * INPUT
     *   showMsg - boolean
     *     true - show console message
     *     false - do not show console message
     */
    this.$blackboxHoloReset = function (showMsg) {
        if (this.$visualEffects && this.$visualTracker && this.$visualTracker.isValid) {
            /* Remove the visual tracker. */
            this.$visualTracker.remove();
            this.$visualTrackerOK = false;

            if (showMsg) {
                player.consoleMessage("Black Box holo-tracker deactivated.");
            }
        }
    };

    /* NAME
     *   $welcomeMessage
     *
     * FUNCTION
     *   Show a welcome message.
     */
    this.$welcomeMessage = function () {
        var reputation = this.$playerVar.reputation[galaxyNumber],
        helperLevel = this.$reputationHelper,
        blackboxLevel = this.$reputationBlackbox,
        locationsLevel = this.$reputationLocations,
        welcome,
        logMsg;

        if (typeof this.$playerVar.delayedAward === "number") {
            /* Add on the delayed award to the reputation. */
            reputation += this.$playerVar.delayedAward;
        }

        if (this.$logging && this.$logExtra) {
            logMsg = "$welcomeMessage::reputation: " + reputation + "\n" +
                "$welcomeMessage::visitedBase: " + this.$playerVar.visitedBase + "\n";
        }

        p_main.playerWelcomed = true;

        welcome = expandDescription("[jaguar_company_base_greeting] ");

        if (!this.$playerVar.visitedBase) {
            welcome += expandDescription("[jaguar_company_base_docked]");
        } else {
            welcome += expandDescription("[jaguar_company_base_visited]");
        }

        if (reputation >= helperLevel) {
            welcome += " " + expandMissionText("jaguar_company_base_thankyou");
        }

        if (reputation >= blackboxLevel) {
            if (player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX") !== "EQUIPMENT_OK") {
                /* Doesn't have the black box locator or is damaged. */
                if (player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX") === "EQUIPMENT_DAMAGED") {
                    /* Black box damaged. */
                    welcome += expandMissionText("jaguar_company_base_fix_black_box");
                    player.ship.setEquipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX", "EQUIPMENT_OK");
                } else {
                    /* No black box locator. */
                    if (this.$visualEffects) {
                        welcome += expandMissionText("jaguar_company_base_no_black_box2");
                    } else {
                        /* Visual effects off. */
                        welcome += expandMissionText("jaguar_company_base_no_black_box1");
                    }

                    player.ship.awardEquipment("EQ_JAGUAR_COMPANY_BLACK_BOX");

                    if (!this.$blackBoxTimerReference || !this.$blackBoxTimerReference.isRunning) {
                        if (!this.$blackBoxTimerReference) {
                            /* Create a new timer. Checks every 5 seconds. */
                            this.$blackBoxTimerReference = new Timer(this, this.$blackBoxTimer, 5, 5);
                        } else {
                            /* Start the timer if it exists and has stopped. */
                            this.$blackBoxTimerReference.start();
                        }
                    }

                    /* Reset the check flag. */
                    this.$blackboxOK = false;
                }
            }
        }

        if (reputation >= locationsLevel && !this.$playerVar.locationsActivated[galaxyNumber]) {
            /* Upload the software patch to the black box. */
            this.$playerVar.locationsActivated[galaxyNumber] = true;
            /* Add the interface system. */
            this.$addInterface();
            welcome += expandMissionText("jaguar_company_base_no_locator");
        }

        if (reputation >= helperLevel && !system.isInterstellarSpace) {
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

        this.$playerVar.visitedBase = true;
        mission.runScreen({
            title : this.$jaguarCompanyBase.displayName,
            message : welcome
        });
    };

    /* NAME
     *   $scanForWitchpointBuoy
     *
     * FUNCTION
     *   Scan for a witchpoint buoy.
     *
     * RESULT
     *   result - witchpoint buoy entity or a fake entity if it can't be found
     */
    this.$scanForWitchpointBuoy = function () {
        var buoys,
        buoy;

        /* Fake witchpoint buoy entity. Updated if one is found. */
        buoy = {
            isValid : true,
            position : new Vector3D(0, 0, 0),
            collisionRadius : 100
        };

        if (!system.isInterstellarSpace) {
            /* Find the witchpoint buoy. */
            buoys = system.filteredEntities(this, function (entity) {
                    if (!entity.isValid || entity.scanClass !== "CLASS_BUOY") {
                        /* Ignore all entities that have one of these conditions:
                         * 1) not valid
                         * 2) not CLASS_BUOY
                         */
                        return false;
                    }

                    return entity.hasRole("buoy-witchpoint");
                });

            if (buoys.length) {
                /* Closest one to the origin. */
                buoy = buoys[0];
            }
        }

        return buoy;
    };

    /* NAME
     *   $isNavyShip
     *
     * FUNCTION
     *   Checks for various Galactic Navy ships.
     *
     *   This only checks for medical ships, frigates and carriers.
     *
     * INPUT
     *   entity - entity of the ship to check
     *
     * RESULT
     *   result - true if entity is a Galactic Navy ship, false if not
     */
    this.$isNavyShip = function (entity) {
        if (!entity.isValid ||
            !entity.isShip ||
            !entity.isPiloted ||
            !entity.isPolice) {
            /* Ignore all entities that have one of these conditions:
             * 1) not valid
             * 2) not a ship
             * 3) not piloted
             * 4) not police (navy should be)
             */
            return false;
        }

        return (entity.hasRole("navy-medship") ||
            entity.hasRole("navy-frigate") ||
            entity.hasRole("patrol-frigate") ||
            entity.hasRole("picket-frigate") ||
            entity.hasRole("picket-behemoth") ||
            entity.hasRole("navy-behemoth") ||
            entity.hasRole("navy-behemoth-battlegroup") ||
            entity.hasRole("behemoth"));
    };

    /* NAME
     *   $scanForNavyShips
     *
     * FUNCTION
     *   Find any major Galactic Navy ships.
     *
     * INPUT
     *   near - entity of the search origin, will use the witchpoint if not specified
     *
     * RESULT
     *   result - array of ship entities
     */
    this.$scanForNavyShips = function (near) {
        var ships;

        if (!near || !near.isValid) {
            /* Defaults to the witchpoint as the origin. */
            ships = system.filteredEntities(this, this.$isNavyShip);
        } else {
            ships = system.filteredEntities(this, this.$isNavyShip, near);
        }

        return ships;
    };

    /* NAME
     *   $spawnJaguarCompany
     *
     * FUNCTION
     *   Spawn Jaguar Company
     *
     * INPUT
     *   state - number
     *     1 - general add
     *     2 - add because of Galactic Navy presence
     *     4 - add always
     */
    this.$spawnJaguarCompany = function (state) {
        var sysname,
        logMsg = "$spawnJaguarCompany::";

        if (!state || state <= 0 || state > 7) {
            log(this.name, logMsg + "This should NOT happen! Unknown state: " + state);

            return;
        }

        /* Reset the check flags. */
        this.$baseOK = false;
        this.$asteroidsOK = false;

        if (!this.$scriptSanityTimerReference || !this.$scriptSanityTimerReference.isRunning) {
            /* This timer will check all Jaguar Company entities for script sanity. */
            if (!this.$scriptSanityTimerReference) {
                /* Create a new timer. Checked every 5 seconds. */
                this.$scriptSanityTimerReference = new Timer(this, this.$scriptSanityTimer, 5, 5);
            } else {
                /* Start the timer if it exists and has stopped. */
                this.$scriptSanityTimerReference.start();
            }
        }

        if (player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX") === "EQUIPMENT_OK" ||
            player.ship.equipmentStatus("EQ_JAGUAR_COMPANY_BLACK_BOX") === "EQUIPMENT_DAMAGED") {
            /* The player has a black box.
             * This timer will de-activate the tracker if too close to the patrol ships
             * or it will self-destruct the black box if the player is not allowed it.
             */
            if (!this.$blackBoxTimerReference || !this.$blackBoxTimerReference.isRunning) {
                if (!this.$blackBoxTimerReference) {
                    /* Create a new timer. Checked every 5 seconds. */
                    this.$blackBoxTimerReference = new Timer(this, this.$blackBoxTimer, 5, 5);
                } else {
                    /* Start the timer if it exists and has stopped. */
                    this.$blackBoxTimerReference.start();
                }
            }
        }

        /* Scan for the witchpoint buoy entity. */
        this.$witchpointBuoy = this.$scanForWitchpointBuoy();

        if (this.$logging) {
            sysname = system.name;

            if (system.isInterstellarSpace) {
                sysname = "Interstellar";
            }

            if (state & 1) {
                logMsg += "\n* Adding Jaguar Company to patrol in the " + sysname + " space lane.";
            }

            if (state & 2) {
                logMsg +=
                "\n* Adding Jaguar Company to patrol with the Galactic Navy in the " + sysname + " space lane.";
            }

            if (state & 4) {
                logMsg += "\n* Always spawn set - Adding Jaguar Company to the " + sysname + " space lane.";
            }

            log(this.name, logMsg);
        }

        if (state & 2) {
            /* Create the patrol for navy work. */
            this.$spawnJaguarCompanyNavyPatrol();
        }

        if (state & 5) {
            /* Create the base. */
            this.$spawnJaguarCompanyBase();
        }
    };

    /* NAME
     *   $spawnJaguarCompanyNavyPatrol
     *
     * FUNCTION
     *   Create the patrol for navy work.
     */
    this.$spawnJaguarCompanyNavyPatrol = function () {
        var navyShips = this.$scanForNavyShips();

        if (navyShips.length) {
            p_main.joinNavy = true;
            p_main.closestNavyShip = navyShips[0];
            /* Initialise the route list with the Navy route. */
            this.$initRoute("NAVY");

            if (!system.countShipsWithRole("jaguar_company_patrol") &&
                !system.countShipsWithRole("jaguar_company_base")) {
                /* Add the patrol ships. */
                system.addShips("jaguar_company_patrol", this.$maxPatrolShips, navyShips[0].position, 7500);
            }
        }
    };

    /* NAME
     *   $spawnJaguarCompanyBase
     *
     * FUNCTION
     *   Create the base.
     */
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
            wpmpDirection = wpPosition.subtract(mainPlanet.position).direction();
            dot = wpsunDirection.dot(wpmpDirection);

            /* Some systems have the witchpoint, main planet and sun all in opposition/conjunction. */
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
                    if (dot >= 0.5) {
                        /* Witchpoint is on the opposite side of the planet to the sun. */
                        log(this.name, "$spawnJaguarCompanyBase::Conjunction! Choosing alternate base position.");
                    } else {
                        /* Witchpoint in between the planet and the sun. */
                        log(this.name, "$spawnJaguarCompanyBase::Opposition! Choosing alternate base position.");
                    }
                }

                /* The witchpoint, main planet and sun are getting close to being in opposition/conjunction. */
                /* Pick a ratio between 0.1 and 0.3 */
                ratio = 0.1 + (system.scrambledPseudoRandomNumber(this.$salt) * 0.2);
                /* Place the base on the witchpoint -> main planet route. */
                basePosition = Vector3D.interpolate(wpPosition, mainPlanet.position, ratio);
                /* Move it 6 to 8 times scanning range upwards with respect to the main planet's surface. */
                ratio = (6 + (system.scrambledPseudoRandomNumber(this.$salt + 1) * 2)) * 25600;
                mPovUp = mainPlanet.orientation.vectorUp();
                basePosition = basePosition.add(mPovUp.multiply(mainPlanet.radius + ratio));
            }
        }

        /* Set the base role dependent on the reputation mission variable. */
        if (this.$playerVar.reputation[galaxyNumber] < this.$reputationHelper) {
            baseRole = "jaguar_company_base_no_discount";
        } else if (this.$playerVar.reputation[galaxyNumber] < this.$reputationBlackbox) {
            baseRole = "jaguar_company_base_discount";
        } else {
            baseRole = "jaguar_company_base_discount_and_docking";
        }

        /* Add the base. */
        this.$jaguarCompanyBase = system.addShips(baseRole, 1, basePosition, 0)[0];

        if (!this.$baseSwapTimerReference || !this.$baseSwapTimerReference.isRunning) {
            /* This timer will swap the base role if needed. */
            if (!this.$baseSwapTimerReference) {
                /* Create a new timer. Checked every 5 seconds. */
                this.$baseSwapTimerReference = new Timer(this, this.$baseSwapTimer, 5, 5);
            } else {
                /* Start the timer if it exists and has stopped. */
                this.$baseSwapTimerReference.start();
            }
        }

        if (!p_main.joinNavy) {
            /* Initialise the route list with the default route. */
            this.$initRoute();
        }
    };

    /* NAME
     *   $setUpCompany
     *
     * FUNCTION
     *   Check to see if we need to spawn Jaguar Company.
     *
     * RESULT
     *   result - true if Jaguar Company will be spawned, false if not
     */
    this.$setUpCompany = function () {
        var scrambledPRN,
        systemID,
        navyPresent = false,
        /* 50:50 chance of joining the Galactic Navy. */
        joinNavyProbability = 0.5,
        spawnInSystem = false,
        spawnCompany = 0;

        /* Stop and remove the timer. */
        if (this.$setUpCompanyTimerReference) {
            if (this.$setUpCompanyTimerReference.isRunning) {
                this.$setUpCompanyTimerReference.stop();
            }

            this.$setUpCompanyTimerReference = null;
        }

        if (!this.$alwaysSpawn) {
            if (system.sun && (system.sun.isGoingNova || system.sun.hasGoneNova)) {
                /* Don't setup if the system sun is going nova or has already gone nova. */
                if (this.$logging && this.$logExtra) {
                    log(this.name, "$setUpCompany::\n" +
                        "system.sun.isGoingNova: " + system.sun.isGoingNova +
                        ", system.sun.hasGoneNova: " + system.sun.hasGoneNova);
                }

                return false;
            }
        }

        if (this.$jaguarCompanyBase && this.$jaguarCompanyBase.isValid) {
            /* Already setup. */
            return true;
        }

        /* Bit pattern for spawning...
         *
         * spawnInSystem    - 001
         * joinNavy         - 010
         * alwaysSpawn      - 100
         */

        /* In interstellar space, the scrambledPRN will be for the last system you were in. */
        scrambledPRN = system.scrambledPseudoRandomNumber(this.$salt);

        if (!p_main.joinNavy) {
            navyPresent = this.$scanForNavyShips().length > 0;
        } else {
            navyPresent = true;
        }

        /* Jaguar Company are part-time reservists. */
        p_main.joinNavy = (navyPresent && scrambledPRN <= joinNavyProbability);

        if (system.isInterstellarSpace) {
            /* Use the last system ID. */
            systemID = this.$lastSystemID;
        } else {
            /* Save the current system ID. */
            systemID = system.ID;
            this.$lastSystemID = systemID;
        }

        if ((system.isInterstellarSpace && this.$jaguarCompanyInterstellar.indexOf(systemID) !== -1) ||
            (!system.isInterstellarSpace && this.$jaguarCompanySystemIDs.indexOf(systemID) !== -1)) {
            spawnInSystem = true;
        }

        /* Anarchies, Feudals and Multi-Governments or systems with Galactic Naval presence */
        spawnCompany |= (spawnInSystem ? 1 : 0);
        /* Always join the navy if we would have been created in this system. */
        spawnCompany |= ((navyPresent && spawnInSystem) || p_main.joinNavy ? 2 : 0);
        /* Always spawn no matter what. */
        spawnCompany |= (this.$alwaysSpawn ? 4 : 0);

        if (this.$logging && this.$logExtra) {
            log(this.name, "$setUpCompany::\n" +
                "* navyPresent: " + navyPresent + ", joinNavy: " + p_main.joinNavy + "\n" +
                "* spawnInSystem: " + spawnInSystem + "\n" +
                "* spawnCompany (normally): " + (spawnCompany & 3 ? "Yes" : "No"));
        }

        if (spawnCompany) {
            this.$spawnJaguarCompany(spawnCompany);

            return true;
        }

        return false;
    };

    /* NAME
     *   $uniqueShipName
     *
     * FUNCTION
     *   Create a unique ship name.
     *
     * INPUTS
     *   isBase - boolean (optional)
     *     true - is a base, will generate the same name for a system
     *     false/undefined - not a base
     *   maxNameLength - maximum length of the name (optional)
     *
     * RESULT
     *   result - unique name
     */
    this.$uniqueShipName = function (isBase, maxNameLength) {
        var index,
        salt = this.$salt,
        randf,
        prefix,
        name;

        if (typeof maxNameLength !== "number") {
            /* Empty maxNameLength. */
            maxNameLength = 0;
        }

        if (!p_main.availableShipNames || !p_main.availableShipNames.length) {
            /* Initialise the available ship names with a copy of the master list. */
            p_main.availableShipNames = p_const.shipNames.concat([]);
        } else if (p_main.availableShipNames && p_main.availableShipNames.length <= 8) {
            /* Add on a copy of the master list if the available pot gets low. */
            p_main.availableShipNames = p_main.availableShipNames.concat(p_const.shipNames);
        }

        /* Random number for the index. */
        if (isBase) {
            /* Same random number for each system. */
            randf = system.scrambledPseudoRandomNumber(salt);
        } else {
            randf = Math.random();
        }

        /* Index for the name. */
        index = Math.floor(randf * p_main.availableShipNames.length);
        /* Get a name from the available list and remove it. */
        name = p_main.availableShipNames.splice(index, 1)[0];

        /* Make sure we don't try to search for a name that is shorter than what is available. */
        if (maxNameLength) {
            /* Reset the max name length if it is shorter than what is available. */
            if (maxNameLength < this.$shortestNameLength) {
                maxNameLength = this.$shortestNameLength;
            }

            /* Keep looping until we find a name short enough. */
            while (name.length > maxNameLength) {
                /* Too long. Put the name back into the available list. */
                p_main.availableShipNames.splice(index, 0, name);

                /* Pick a new random number. */
                if (isBase) {
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

        if (isBase) {
            prefix = "JC Base#" ;
        } else {
            prefix = "JC#";
        }

        /* Return the new name. */
        return prefix + Math.floor(randf * 10000).toString() + "-" + system.name.substring(0, 2) + ": " + name;
    };

    /* NAME
     *   $initRoute
     *
     * FUNCTION
     *   Alters the route list.
     *
     * INPUT
     *   route - route code (optional)
     *     WPWB - full route (base -> witchpoint -> planet -> witchpoint -> base (dock)) (default)
     *     I - interstellar space (base -> (fake) witchpoint -> base (dock))
     *     NAVY - patrol with the Galactic Navy
     *     WP - witchpoint <-> planet
     *     BP - base -> planet -> base (dock)
     */
    this.$initRoute = function (route) {
        if (system.isInterstellarSpace) {
            route = "I";
        } else if (typeof route !== "string" || route === "") {
            route = "WPWB";
        }

        /* Update the witchpoint buoy reference. */
        this.$witchpointBuoy = this.$scanForWitchpointBuoy();

        switch (route) {
        case "I":
            /* Alters the route list for Interstellar space. */
            p_main.routes = [{
                    /* Witchpoint. Will be a fake witchpoint. */
                    entity : this.$witchpointBuoy,
                    /* Range used in AI. */
                    range : 5000,
                    /* Message to be sent to the AI. */
                    aiMessage : "JAGUAR_COMPANY_INTERSTELLAR"
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
        case "NAVY":
            /* Alters the route list for navy patrol. */
            p_main.routes = [{
                    /* Navy ship to shadow. */
                    entity : p_main.closestNavyShip,
                    /* Range used in AI. */
                    range : 7500,
                    /* Message to be sent to the AI. */
                    aiMessage : "JAGUAR_COMPANY_NAVY_PATROL"
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
                    aiMessage : "JAGUAR_COMPANY_PLANET"
                }, {
                    /* Witchpoint. */
                    entity : this.$witchpointBuoy,
                    /* Range used in AI. */
                    range : 10000,
                    /* Message to be sent to the AI. */
                    aiMessage : "JAGUAR_COMPANY_WITCHPOINT"
                }
            ];

            break;
        case "BP":
            /* Alters the route list for Base->Planet and Planet->Base. */
            p_main.routes = [{
                    /* Jaguar Company Base. */
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
                    aiMessage : "JAGUAR_COMPANY_PLANET"
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
                    aiMessage : "JAGUAR_COMPANY_PLANET"
                }, {
                    /* Witchpoint. */
                    entity : this.$witchpointBuoy,
                    /* Range used in AI. */
                    range : 10000,
                    /* Message to be sent to the AI. */
                    aiMessage : "JAGUAR_COMPANY_WITCHPOINT"
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

    /* NAME
     *   $changeRoute
     *
     * FUNCTION
     *   Change the current route or set it to the routeNum index of the routes array.
     *
     * INPUT
     *   routeNum - index of the routes array (optional)
     *     < 0 - pick last index
     *     num - use index 'num'
     */
    this.$changeRoute = function (routeNum) {
        if (typeof routeNum !== "number") {
            p_main.routeIndex += 1;

            /* Out-of-bounds checking. */
            if (p_main.routeIndex >= p_main.routes.length) {
                p_main.routeIndex = 0;
            }
        } else {
            if (routeNum >= 0) {
                /* Out-of-bounds checking. */
                if (routeNum >= p_main.routes.length) {
                    routeNum = p_main.routes.length - 1;
                }

                p_main.routeIndex = routeNum;
            } else {
                p_main.routeIndex = p_main.routes.length - 1;
            }
        }
    };

    /* NAME
     *   $checkRoute
     *
     * FUNCTION
     *   Check the current route and send a message to the caller ship's AI.
     *
     * INPUT
     *   callerShip - caller ship
     */
    this.$checkRoute = function (callerShip) {
        var entity,
        distance;

        /* Out-of-bounds checking. */
        if (p_main.routeIndex < 0) {
            p_main.routeIndex = p_main.routes.length - 1;
        } else if (p_main.routeIndex >= p_main.routes.length) {
            p_main.routeIndex = 0;
        }

        if (this.$logging && this.$logExtra) {
            entity = p_main.routes[p_main.routeIndex].entity;

            /* Check for entities becoming invalid. */
            if (!entity || !entity.isValid) {
                /* Fake entity a distance of 10 x the required range in a random direction. */
                p_main.routes[p_main.routeIndex].entity = {
                    isValid : true,
                    position : Vector3D.randomDirection(p_main.routes[p_main.routeIndex].range * 10),
                    collisionRadius : 100
                };
                entity = p_main.routes[p_main.routeIndex].entity;
            }

            /* Calculate the surface to surface distance, not centre to centre. */
            distance = callerShip.position.distanceTo(entity.position);
            distance -= callerShip.collisionRadius;
            distance -= entity.collisionRadius;

            log(this.name, "$checkRoute::\n" +
                "* ship#" + callerShip.entityPersonality +
                " (" + callerShip.name + ": " + callerShip.displayName + ")\n" +
                "* Entity position: " + entity.position + "\n" +
                "* Distance: " + distance + "\n" +
                "* Desired range: " + p_main.routes[p_main.routeIndex].range + "\n" +
                "* Current route: " + p_main.routeIndex + " (" + p_main.routes[p_main.routeIndex].aiMessage + ")");
        }

        callerShip.reactToAIMessage(p_main.routes[p_main.routeIndex].aiMessage);
    };

    /* NAME
     *   $finishedRoute
     *
     * FUNCTION
     *   Finished the current route, change to the next one.
     *
     * INPUT
     *   callerShip - caller ship
     *   groupRole - role of our group
     *   aiResponse - AI response to send to all ships in groupRole
     */
    this.$finishedRoute = function (callerShip, groupRole, aiResponse) {
        var entity,
        distance,
        otherShips,
        otherShipsLength,
        otherShipsCounter;

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
            entity = p_main.routes[p_main.routeIndex].entity;
            log(this.name, "$finishedRoute::Checking...\n" +
                "* ship#" + callerShip.entityPersonality +
                " (" + callerShip.name + ": " + callerShip.displayName + ")\n" +
                "* Entity position: " + entity.position + "\n" +
                "* Saved co-ordinates: " + callerShip.savedCoordinates + "\n" +
                "* Distance: " + distance + "\n" +
                "* Desired range: " + p_main.routes[p_main.routeIndex].range + "\n" +
                "* Current route: " + p_main.routeIndex + " (" + p_main.routes[p_main.routeIndex].aiMessage + ")");
        }

        /* Change to the next route. */
        this.$changeRoute();
        /* Find other ships in 'groupRole'. Sort by distance from the caller ship. */
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

    /* NAME
     *   $sendNewsToSnoopers
     *
     * FUNCTION
     *   Send news to Snoopers (if available).
     *
     * INPUTS
     *   message - news to show
     *   agency - agency to use (optional)
     */
    this.$sendNewsToSnoopers = function (message, agency) {
        var news = {},
        result,
        index;

        if (!worldScripts.snoopers) {
            /* Snoopers not installed. */
            return;
        }

        if (!agency || typeof agency !== "number") {
            /* Random agency. [1, 2 or 3] */
            agency = Math.floor(Math.random() * 3.0) + 1;
        }

        news.ID = this.name;
        news.Message = message;
        news.Agency = agency;
        result = worldScripts.snoopers.insertNews(news);
        index = result + 5;

        if (result < 0) {
            /* Save for later. Snoopers only allows one news item at a time. */
            this.$playerVar.newsForSnoopers.push(news);

            if (this.$logging && this.$logExtra) {
                log(this.name, "$sendNewsToSnoopers::Saving news for later.\n" +
                    "* ID: '" + this.name + "'\n" +
                    "* Message: '" + message + "'\n" +
                    "* Agency: " + agency + "\n" +
                    "* result: " + result + (result >= -5 ? ") " + p_const.snoopersErrorCodes[index] : ""));
            }
        } else if (result > 0) {
            /* Problem. */
            log(this.name, "$sendNewsToSnoopers::Problem with news.\n" +
                "* ID: '" + this.name + "'\n" +
                "* Message: '" + message + "'\n" +
                "* Agency: " + agency + "\n" +
                "* result: " + result + (result <= 30 ? ") " + p_const.snoopersErrorCodes[index] : ""));
        } else {
            /* News inserted. */
            if (this.$logging && this.$logExtra) {
                log(this.name, "$sendNewsToSnoopers::News inserted.\n" +
                    "* ID: '" + this.name + "'\n" +
                    "* Message: '" + message + "'\n" +
                    "* Agency: " + agency + "\n" +
                    "* result: " + result + ") " + p_const.snoopersErrorCodes[index]);
            }
        }
    };

    /* NAME
     *   newsDisplayed
     *
     * FUNCTION
     *   Called by Snoopers when the news item has been displayed.
     *   Check for any more news available and send it.
     */
    this.newsDisplayed = function () {
        var news = this.$playerVar.newsForSnoopers.shift();

        if (news) {
            /* More news available. Send it to Snoopers. */
            this.$sendNewsToSnoopers(news.Message, news.Agency);
        }
    };
}.bind(this)());
