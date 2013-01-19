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

"use strict";

this.name = "Jaguar Company";
this.author = "Tricky";
this.copyright = "(C) 2012 Tricky";
this.license = "CC BY-NC-SA 3.0";
this.description = "Script to initialise the Jaguar Company.";
this.version = "1.4";

// OXPConfig2 settings
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
            Name : "logging",
            Def : false,
            Desc : "Turn logging on."
        },
        Bool1 : {
            Name : "logAIMessages",
            Def : false,
            Desc : "Log AI messages."
        },
        Bool2 : {
            Name : "logExtra",
            Def : false,
            Desc : "Log extra debug info."
        },
        Bool3 : {
            Name : "alwaysSpawn",
            Def : false,
            Desc : "Always spawn Jaguar Company."
        }
    };

    delete this.oxpcLookup;
};

this.startUp = function () {
    delete this.startUp;

    /* Turn logging on or off */
    this.logging = false;
    /* Report AI messages for Jaguar Company if true */
    this.logAIMessages = false;
    /* Log extra debug info. Only useful during testing. */
    this.logExtra = false;
    /* Spawn Jaguar Company always if true */
    this.alwaysSpawn = false;

    this.systemName = "";
};

this.$spawnJaguarCompany = function (state) {
    var shipGroup,
    escortGroup,
    i;

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

    shipGroup = system.addGroup("jaguar_company_leader", 1, [0, 0, 0], 10000);
    escortGroup = shipGroup.ships[0].escortGroup;

    if (this.logging && this.logExtra) {
        log(this.name, "SG: " + shipGroup);
        log(this.name, "EG: " + escortGroup);
        log(this.name, "EG ships: " + escortGroup.ships);

        for (i = 0; i < escortGroup.ships.length; i++) {
            log(this.name, "ship #" + i + "(" + escortGroup.ships[i].displayName + "): " + escortGroup.ships[i]);
        }
    }
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
        var PRN,
        navyPresent,
        joinNavyProbability,
        joinNavy,
        systemProbability,
        spawnInSystem,
        spawnCompany;

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

this.shipLaunchedFromStation = this.shipExitedWitchspace = function () {
    this.$setUpCompany();
};
