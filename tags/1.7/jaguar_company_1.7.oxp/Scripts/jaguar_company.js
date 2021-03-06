/*jslint indent: 4, maxerr: 50, white: true, browser: false, evil: true, es5: true, undef: true, nomen: true, plusplus: true, bitwise: true, regexp: true, newcap: true, sloppy: false */
/*jshint browser: false, devel: false, es5: true, node: false, bitwise: true, eqnull: true, noempty: true, eqeqeq: true, boss: true, loopfunc: true, laxbreak: true, strict: true, jquery: false */

/* Jaguar Company
 *
 * Copyright (C) 2012 Tricky
 *
 * This work is licensed under the Creative Commons
 * Attribution-Noncommercial-Share Alike 3.0 Unported License.
 *
 * To view a copy of this license, visit
 * http://creativecommons.org/licenses/by-nc-sa/3.0/ or send a letter
 * to Creative Commons, 171 Second Street, Suite 300, San Francisco,
 * California, 94105, USA.
 *
 * World script to setup Jaguar Company
 */

this.name = "Jaguar Company";
this.author = "Tricky";
this.copyright = "(C) 2012 Tricky";
this.license = "CC BY-NC-SA 3.0";
this.description = "Script to initialise the Jaguar Company.";
this.version = "1.7";

(function () {
    "use strict";

    /* Private variables. */
    var $jaguarCompanyShipNames,
    $availableShipNames,
    $currentRoute,
    $systemName,
    $maxShips;

    /* Public variables. */
    /* Turn logging on or off */
    this.$logging = false;
    /* Report AI messages for Jaguar Company if true */
    this.$logAIMessages = false;
    /* Log extra debug info. Only useful during testing. */
    this.$logExtra = false;
    /* Spawn Jaguar Company always if true */
    this.$alwaysSpawn = false;

    /* OU's, GOU's, LOU's and (d)ROU's. Also some names I really like. */
    $jaguarCompanyShipNames = ["Profit Margin", "Trade Surplus", "Limiting Factor", "Gunboat Diplomat", "Zealot", "Xenophobe", "God Told Me To Do It", "Just Another Victim Of The Ambient Morality", "Synchronize Your Dogmas", "Thank you And Goodnight", "Well I Was In The Neighbourhood", "You'll Thank Me Later", "Shoot Them Later", "Attitude Adjuster", "Killing Time", "I Blame Your Mother", "I Blame My Mother", "Heavy Messing", "Frank Exchange Of Views", "Nuisance Value", "All Through With This Niceness And Negotiation Stuff", "I Said, I've Got A Big Stick", "Hand Me The Gun And Ask Me Again", "But Who's Counting?", "Germane Riposte", "We Haven't Met But You're A Great Fan Of Mine", "All The Same, I Saw It First", "Ravished By The Sheer Implausibility Of That Last Statement", "Zero Credibility", "Charming But Irrational", "Demented But Determined", "You May Not Be The Coolest Person Here", "Lucid Nonsense", "Awkward Customer", "Conventional Wisdom", "Fine Till You Came Along", "I Blame The Parents", "Inappropriate Response", "A Momentary Lapse Of Sanity", "Lapsed Pacifist", "Reformed Nice Guy", "Pride Comes Before A Fall", "Injury Time", "Now Look What You've Made Me Do", "Kiss This Then", "Eight Rounds Rapid", "You'll Clean That Up Before You Leave", "Me, I'm Counting", "The Usual But Etymologically Unsatisfactory", "Falling Outside The Normal Moral Constraints", "Hylozoist", "No One Knows What The Dead Think", "Flick to Kick", "Your Egg's Broken But Mine Is Ok", "Shall I Be Mummy?", "Is This Galaxy Taken?", "Famous Last Words", "Road Rage", "Live A Little", "Not in My Back Yard", "Playing A Sweeper", "You're Going Home In A Fracking Ambulance", "Rear Entry", "Open Wide, Say Aaaarrgghhh", "Hope You Like Explosions", "I Haven't Seen One Of Those For Years", "Are You Religious?", "Not Now Dear", "Something Had To Be Done", "Hideously Indefensible Sense Of Humour", "Camouflage", "Come And Have A Go If You Think You're Hard Enough", "Throwing Toys Out The Crib", "Podex Perfectus Es", "Stercorem Pro Cerebro Habes", "Futue Te Ipsum Et Caballum Tuum", "Remember To Wash Your Hands", "One Out All Out", "Looking At Me, Pal?", "You Showed Me Yours, Now I'll Show You Mine", "Salt In Your Vaseline", "Cracking My Knuckles", "Break Glass In Case Of War", "My Turn", "No Pun Intended", "Look No Hands", "Very Sharp Stick", "Weapons Of Mass Deception", "...And Another Thing", "Clerical Error", "Silly Mid On", "You And Whose Army?", "This Sector Ain't Big Enough For The Both Of Us", "Diplomacy Was Never My Strong Suite", "Such A Pretty Big Red Button", "Synthetic Paragon Rubber Company", "Forget And Fire", "I Was Just Following Orders", "Weapon of Mass Distraction", "Forgive and Forget", "Innocence Is No Excuse", "Psychosis Is Only One State Of Mind", "Lets Dance", "AI Avenger", "Dead Man Walking", "A Little Less Conversation", "Here One Minute, Gone The Next", "Here, Let Me Escort You", "Killed With Superior Skill", "External Agitation", "Catch Me If You Can", "But What About The Children?", "Single Fingered Hand Gestures", "A World Of Hurt", "Looking Down The Gun Barrel", "Terminal Atomic Headache", "Know Thy Enemy", "Cold Steel For An Iron Age", "The Malevolent Creation", "Gamma Ray Goggles", "End Of Green", "Terrorwheel", "Sickening Sense Of Humour", "Mines Bigger", "Friendly Fire Isn't", "No Need For Stealth", "All Guns Blazin!", "Harmony Dies", "The Controlled Psychopath", "It Ends Now", "Forced To Be Nice", "Axis of Advance", "Acts of God", "The Feeling's Mutual", "The Beautiful Nightmare", "If You Can Read This...", "Are You Saved?", "Cunning Linguist", "Gay Abandon", "My Finger", "Got Legs", "Hose Job", "Protect And Sever", "Rebuttal", "Not In The Face", "I Have Right Of Way", "It Ran Into My Missile", "Have A Nice Rest Of Your Life", "Nose Job", "Get My Point?", "Grid Worker", "Eraserhead", "What Star?", "All This (And Brains)", "Random Acts Of Senseless Violence", "God Will Recognize His Own", "Would You Like A Quick Suppository With That?", "Pop Me A Couple More Of Those Happy Pills (Eccentric)", "Trouble Maker?", "Talk Is Cheap", "Tightly Strung", "Have You Kept The Receipt?", "It Was Broke When I Got Here", "Insanity Plea Rejected", "Thora Hird", "Barbara Cartland", "Freddy Starr Ate My Hamster", "And You Thought You Knew What Terror Means", "I'm A 'Shoot First, Ask Questions Later' Kinda Guy", "Duck You Suckers", "Trumpton Riots", "Dodgy Transformer"];

    /* Initialise the available ship names with a copy of the master list. */
    $availableShipNames = $jaguarCompanyShipNames.concat([]);

    /* Initial route. */
    $currentRoute = "JAGUAR_COMPANY_BASE_TO_WP";

    /* The name of the system we are in. So we don't spawn more than one set. */
    $systemName = "";

    /* Maximum number of ships. */
    $maxShips = 4;

    this.startUp = function () {
        log(this.name + " " + this.version + " loaded.");
        this.$setUpCompany();
        delete this.startUp;
    };

    this.shipWillLaunchFromStation = function () {
        this.$setUpCompany();
        delete this.shipWillLaunchFromStation;
    };

    this.shipWillExitWitchspace = function () {
        this.$setUpCompany();
    };

    /* OXPConfig2 settings. */
    this.oxpcLookup = function () {
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
                Desc : "Turn logging on."
            },
            Bool1 : {
                Name : "$logAIMessages",
                Def : false,
                Desc : "Log AI messages."
            },
            Bool2 : {
                Name : "$logExtra",
                Def : false,
                Desc : "Log extra debug info."
            },
            Bool3 : {
                Name : "$alwaysSpawn",
                Def : false,
                Desc : "Always spawn Jaguar Company."
            }
        };

        delete this.oxpcLookup;
    };

    /* Create a unique ship name. */
    this.$uniqueShipName = function () {
        var index;

        if ($availableShipNames.length === 0) {
            $availableShipNames = $jaguarCompanyShipNames.concat([]);
        }

        index = Math.floor(Math.random() * $availableShipNames.length);

        return "Jaguar Company: " + $availableShipNames.splice(index, 1).pop();
    };

    /* Get the current route. */
    this.$getCurrentRoute = function () {
        return $currentRoute;
    };

    /* Change the current route. */
    this.$changeCurrentRoute = function () {
        switch ($currentRoute) {
        case "JAGUAR_COMPANY_BASE_TO_WP":
            $currentRoute = "JAGUAR_COMPANY_WP_TO_PLANET";
            break;
        case "JAGUAR_COMPANY_WP_TO_PLANET":
            $currentRoute = "JAGUAR_COMPANY_PLANET_TO_WP";
            break;
        case "JAGUAR_COMPANY_PLANET_TO_WP":
            $currentRoute = "JAGUAR_COMPANY_WP_TO_BASE";
            break;
        case "JAGUAR_COMPANY_WP_TO_BASE":
            $currentRoute = "JAGUAR_COMPANY_BASE_TO_WP";
            break;
        default:
            /* Should never trigger. Better safe than sorry though. */
            $currentRoute = "JAGUAR_COMPANY_BASE_TO_WP";
        }
    };

    this.$spawnJaguarCompany = function (state) {
        var num,
        radius,
        basePosition,
        base,
        clutter;

        if (this.$logging) {
            if (state === 1) {
                log(this.name, "Adding Jaguar Company to the " + system.name + " space lane.");
            } else if (state === 2) {
                log(this.name, "Adding Jaguar Company to patrol with the Galactic Navy in the " + system.name + " space lane.");
            } else if (state === 3) {
                log(this.name, "Adding Jaguar Company to patrol in the " + system.name + " space lane.");
            } else {
                log(this.name, "This should NOT happen! Unknown state: " + state);
            }
        }

        this.$numShips = 0;

        if (system.isInterstellarSpace) {
            /* If we are in interstellar space then the base is somewhere within 1.5 times scanner
             * range of the centre point.
             */
            basePosition = Vector3D.random(38400.0);
        } else {
            /* Place the base 0.1 to 0.2 units along the witchpoint -> sun route. */
            radius = 0.1 + (Math.random() * 0.1);
            basePosition = Vector3D.interpolate([0, 0, 0], system.sun.position, radius);
        }

        /* Move the base in a random direction a distance of 2 x scanning range. */
        basePosition = basePosition.add(Vector3D.randomDirection(51200.0));

        /* Add the base. */
        base = system.addShips("jaguar_company_base", 1, basePosition);

        /* Add some clutter within 25km around the base. 9 to 14 items. */
        num = Math.floor(Math.random() * 6) + 9;
        clutter = system.addShips("asteroid", num, basePosition, 25000);

        /* Add Jaguar Company around the base. */
        radius = 15000.0 * Math.ceil($maxShips / 32.0);
        system.addShips("jaguar_company_patrol", $maxShips, basePosition, radius);
    };

    this.$setUpCompany = function () {
        /* Make sure we don't setup Jaguar Company more than once */
        if ($systemName === system.name) {
            return;
        }

        $systemName = system.name;

        if (this.$alwaysSpawn) {
            this.$spawnJaguarCompany(1);
        } else {
            var PRN,
            navyPresent,
            joinNavyProbability,
            joinNavy,
            systemProbability,
            spawnInSystem,
            spawnCompany;

            PRN = system.scrambledPseudoRandomNumber(19720231);
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
             *   Feudal:           25%
             *   Multi-Government: 12.5%
             */
            systemProbability = 0.125 * (3 - system.government);
            spawnInSystem = (system.government <= 2 && PRN <= systemProbability);
            spawnCompany = (joinNavy || spawnInSystem);

            if (this.$logging && this.$logExtra) {
                log(this.name, "PRN: " + PRN);
                log(this.name, "navyPresent: " + navyPresent + ", joinNavy: " + joinNavy);
                log(this.name, "systemProbability: " + systemProbability + ", spawnInSystem: " + spawnInSystem);
                log(this.name, "spawnCompany: " + spawnCompany);
            }

            /* Anarchies, Feudals and Multi-Governments or systems with Galactic Naval presence */
            if (spawnCompany) {
                this.$spawnJaguarCompany(joinNavy ? 2 : (spawnInSystem ? 3 : 0));
            }
        }
    };
}).call(this);
