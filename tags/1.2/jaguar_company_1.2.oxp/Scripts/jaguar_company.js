/*jslint indent: 4, maxerr: 50, white: true, browser: false, evil: true, undef: true, nomen: true, plusplus: true, bitwise: true, regexp: true, newcap: true, sloppy: true */

/* Jaguar Company
 **
 ** Copyright (C) 2012 Tricky
 **
 ** This work is licensed under the Creative Commons
 ** Attribution-Noncommercial-Share Alike 3.0 Unported License.
 **
 ** To view a copy of this license, visit
 ** http://creativecommons.org/licenses/by-nc-sa/3.0/ or send a letter
 ** to Creative Commons, 171 Second Street, Suite 300, San Francisco,
 ** California, 94105, USA.
 **
 ** World script to setup Jaguar Company
 */

this.name = "Jaguar Company";
this.author = "Tricky";
this.copyright = "(C) 2012 Tricky";
this.license = "CC BY-NC-SA 3.0";
this.description = "Script to initialise the Jaguar Company.";
this.version = "1.2";

this.startUp = function () {
    /* Turn logging on or off */
    this.logging = true;
    /* Report AI messages for Jaguar Company if true */
    this.logAIMessages = false;
    /* Log extra debug info. Only useful during testing. */
    this.logExtra = false;
    /* Spawn Jaguar Company always if true */
    this.alwaysSpawn = false;

    this.systemName = "";

    /* OU's, GOU's, LOU's and (d)ROU's. Also some names I really like. */
    this.shipNames = ["Profit Margin", "Trade Surplus", "Limiting Factor", "Gunboat Diplomat", "Zealot", "Xenophobe", "God Told Me To Do It", "Just Another Victim Of The Ambient Morality", "Synchronize Your Dogmas", "Thank you And Goodnight", "Well I Was In The Neighbourhood", "You'll Thank Me Later", "Shoot Them Later", "Attitude Adjuster", "Killing Time", "I Blame Your Mother", "I Blame My Mother", "Heavy Messing", "Frank Exchange Of Views", "Nuisance Value", "All Through With This Niceness And Negotiation Stuff", "I Said, I've Got A Big Stick", "Hand Me The Gun And Ask Me Again", "But Who's Counting?", "Germane Riposte", "We Haven't Met But You're A Great Fan Of Mine", "All The Same, I Saw It First", "Ravished By The Sheer Implausibility Of That Last Statement", "Zero Credibility", "Charming But Irrational", "Demented But Determined", "You May Not Be The Coolest Person Here", "Lucid Nonsense", "Awkward Customer", "Conventional Wisdom", "Fine Till You Came Along", "I Blame The Parents", "Inappropriate Response", "A Momentary Lapse Of Sanity", "Lapsed Pacifist", "Reformed Nice Guy", "Pride Comes Before A Fall", "Injury Time", "Now Look What You've Made Me Do", "Kiss This Then", "Eight Rounds Rapid", "You'll Clean That Up Before You Leave", "Me, I'm Counting", "The Usual But Etymologically Unsatisfactory", "Falling Outside The Normal Moral Constraints", "Hylozoist", "No One Knows What The Dead Think"];
    this.shipNamesLength = this.shipNames.length;
};

this.shipSpawned = function (s) {
    if (s.hasRole("jaguar_company_leader") || s.hasRole("jaguar_company_wingman")) {
        if (this.logAIMessages) {
            s.reportAIMessages = true;
        }

        s.displayName = "Jaguar Company: " + this.shipNames[Math.floor(Math.random() * this.shipNamesLength)];
    }
};

this.$spawnJaguarCompany = function (state) {
    if (this.logging) {
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

    system.addGroupToRoute("jaguar_company_leader", 1, 0.05, "wp");
};

this.$setUpCompany = function () {
    /* Make sure we don't setup Jaguar Company more than once */
    if (this.systemName === system.name) {
        return;
    }

    this.systemName = system.name;

    if (this.alwaysSpawn) {
        this.$spawnJaguarCompany(1);
    } else {
        var PRN, navyPresent, joinNavyProbability, joinNavy, systemProbability, spawnInSystem, spawnCompany;

        PRN = system.scrambledPseudoRandomNumber(19720231);
        /* Jaguar Company are part-time reservists */
        navyPresent = (system.countShipsWithRole("navy-frigate") > 0
            || system.countShipsWithRole("patrol-frigate") > 0
            || system.countShipsWithRole("picket-frigate") > 0
            || system.countShipsWithRole("intercept-frigate") > 0
            || system.countShipsWithRole("navy-medship") > 0
            || system.countShipsWithRole("navy-behemoth-battlegroup") > 0);
        joinNavyProbability = 0.5;
        joinNavy = (navyPresent && PRN <= joinNavyProbability);
        /* We only use the first 3 government types.
         ** Therefore probabilities will be:
         **   Anarchy:          37.5%
         **   Feudal:           25%
         **   Multi-Government: 12.5%
         */
        systemProbability = 0.125 * (3 - system.government);
        spawnInSystem = (system.government <= 2 && PRN <= systemProbability);
        spawnCompany = (joinNavy || spawnInSystem);

        if (this.logging && this.logExtra) {
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

this.shipExitedWitchspace = function () {
    this.$setUpCompany();
};

this.shipLaunchedFromStation = function () {
    this.shipExitedWitchspace();
    delete this.shipLaunchedFromStation;
};
