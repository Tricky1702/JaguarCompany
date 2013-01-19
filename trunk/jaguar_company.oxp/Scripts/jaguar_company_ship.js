/*jslint indent: 4, maxerr: 50, white: true, browser: false, undef: true, nomen: true, plusplus: true, bitwise: true, regexp: true, newcap: true, sloppy: false */

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
** Ship related functions for the patrol AI.
** Missile subentity loading based on tgGeneric_externalMissiles.js by Thargoid
*/

this.name = "jaguar_company_ship.js";
this.author = "Tricky";
this.copyright = "© 2012 Tricky";
this.license = "CC BY-NC-SA 3.0";
this.description = "Ship script for the Jaguar Company.";
this.version = "1.2";

(function () {
    "use strict";

    this.shipSpawned = function shipSpawned() {
        var shipNames,
        addCounter;

        /* OU's, GOU's, LOU's and (d)ROU's. Also some names I really like. */
        shipNames = ["Profit Margin", "Trade Surplus", "Limiting Factor", "Gunboat Diplomat", "Zealot", "Xenophobe", "God Told Me To Do It", "Just Another Victim Of The Ambient Morality", "Synchronize Your Dogmas", "Thank you And Goodnight", "Well I Was In The Neighbourhood", "You'll Thank Me Later", "Shoot Them Later", "Attitude Adjuster", "Killing Time", "I Blame Your Mother", "I Blame My Mother", "Heavy Messing", "Frank Exchange Of Views", "Nuisance Value", "All Through With This Niceness And Negotiation Stuff", "I Said, I've Got A Big Stick", "Hand Me The Gun And Ask Me Again", "But Who's Counting?", "Germane Riposte", "We Haven't Met But You're A Great Fan Of Mine", "All The Same, I Saw It First", "Ravished By The Sheer Implausibility Of That Last Statement", "Zero Credibility", "Charming But Irrational", "Demented But Determined", "You May Not Be The Coolest Person Here", "Lucid Nonsense", "Awkward Customer", "Conventional Wisdom", "Fine Till You Came Along", "I Blame The Parents", "Inappropriate Response", "A Momentary Lapse Of Sanity", "Lapsed Pacifist", "Reformed Nice Guy", "Pride Comes Before A Fall", "Injury Time", "Now Look What You've Made Me Do", "Kiss This Then", "Eight Rounds Rapid", "You'll Clean That Up Before You Leave", "Me, I'm Counting", "The Usual But Etymologically Unsatisfactory", "Falling Outside The Normal Moral Constraints", "Hylozoist", "No One Knows What The Dead Think", "Flick to Kick", "Your Egg's Broken But Mine Is Ok", "Shall I Be Mummy?", "Is This Galaxy Taken?", "Famous Last Words", "Road Rage", "Live A Little", "Not in My Back Yard", "Playing A Sweeper", "You're Going Home In A Fracking Ambulance", "Rear Entry", "Open Wide, Say Aaaarrgghhh", "Hope You Like Explosions", "I Haven't Seen One Of Those For Years", "Are You Religious?", "Not Now Dear", "Something Had To Be Done", "Hideously Indefensible Sense Of Humour", "Camouflage", "Come And Have A Go If You Think You're Hard Enough", "Throwing Toys Out The Crib", "Podex Perfectus Es", "Stercorem Pro Cerebro Habes", "Futue Te Ipsum Et Caballum Tuum", "Remember To Wash Your Hands", "One Out All Out", "Looking At Me, Pal?", "You Showed Me Yours, Now I'll Show You Mine", "Salt In Your Vaseline", "Cracking My Knuckles", "Break Glass In Case Of War", "My Turn", "No Pun Intended", "Look No Hands", "Very Sharp Stick", "Weapons Of Mass Deception", "...And Another Thing", "Clerical Error", "Silly Mid On", "You And Whose Army?", "This Sector Ain't Big Enough For The Both Of Us", "Diplomacy Was Never My Strong Suite", "Such A Pretty Big Red Button", "Synthetic Paragon Rubber Company", "Forget And Fire", "I Was Just Following Orders", "Weapon of Mass Distraction", "Forgive and Forget", "Innocence Is No Excuse", "Psychosis Is Only One State Of Mind", "Lets Dance", "AI Avenger", "Dead Man Walking", "A Little Less Conversation", "Here One Minute, Gone The Next", "Here, Let Me Escort You", "Killed With Superior Skill", "External Agitation", "Catch Me If You Can", "But What About The Children?", "Single Fingered Hand Gestures", "A World Of Hurt", "Looking Down The Gun Barrel", "Terminal Atomic Headache", "Know Thy Enemy", "Cold Steel For An Iron Age", "The Malevolent Creation", "Gamma Ray Goggles", "End Of Green", "Terrorwheel", "Sickening Sense Of Humour", "Mines Bigger", "Friendly Fire Isn't", "No Need For Stealth", "All Guns Blazin!", "Harmony Dies", "The Controlled Psychopath", "It Ends Now", "Forced To Be Nice", "Axis of Advance", "Acts of God", "The Feeling's Mutual", "The Beautiful Nightmare", "If You Can Read This...", "Are You Saved?", "Cunning Linguist", "Gay Abandon", "My Finger", "Got Legs", "Hose Job", "Protect And Sever", "Rebuttal", "Not In The Face", "I Have Right Of Way", "It Ran Into My Missile", "Have A Nice Rest Of Your Life", "Nose Job", "Get My Point?", "Grid Worker", "Eraserhead", "What Star?", "All This (And Brains)", "Random Acts Of Senseless Violence", "God Will Recognize His Own", "Would You Like A Quick Suppository With That?", "Pop Me A Couple More Of Those Happy Pills (Eccentric)", "Trouble Maker?", "Talk Is Cheap", "Tightly Strung", "Have You Kept The Receipt?", "It Was Broke When I Got Here", "Insanity Plea Rejected", "Thora Hird", "Barbara Cartland", "Freddy Starr Ate My Hamster", "And You Thought You Knew What Terror Means", "I'm A 'Shoot First, Ask Questions Later' Kinda Guy", "Duck You Suckers", "Trumpton Riots", "Dodgy Transformer"];

        if (worldScripts["Jaguar Company"].logAIMessages) {
            this.ship.reportAIMessages = true;
        }

        this.ship.displayName = "Jaguar Company: " + shipNames[Math.floor(Math.random() * shipNames.length)];
        this.route = "JAGUAR_COMPANY_BASE_TO_WP";

        /* just to ensure ship is fully loaded with selected missile type and nothing else. */
        if (this.ship.scriptInfo.missileRole) {
            /* missileRole should be defined in shipdata.plist */
            this.missileRole = this.ship.scriptInfo.missileRole;
        } else {
            /* default to standard missile if not. */
            this.missileRole = "EQ_HARDENED_MISSILE";
        }

        /* Thargoid's missile code. */
        if (this.ship.scriptInfo.initialMissiles) {
            this.initialMissiles = parseInt(this.ship.scriptInfo.initialMissiles, 10);
        } else {
            this.initialMissiles = this.ship.missileCapacity;
        }

        if (this.ship.missiles.length > 0) {
            /* remove all spawning missiles and restock with selected ones. */
            this.ship.awardEquipment("EQ_MISSILE_REMOVAL");
        }

        for (addCounter = 0; addCounter < this.initialMissiles; addCounter++) {
            this.ship.awardEquipment(this.missileRole);
        }
    };

    /* Thargoid's missile code. */
    this.shipFiredMissile = function shipFiredMissile(missile, target) {
        var subCounter;

        if (this.ship.subEntities.length === 0) {
            /* if we've run out of sub-ents before we run out of missiles. */
            return;
        }

        /* Set counter to number of sub-ents minus 1 (as entity array goes up from zero). */
        subCounter = this.ship.subEntities.length - 1;

        for (subCounter = this.ship.subEntities.length - 1; subCounter >= 0; subCounter--) {
            if (this.ship.subEntities[subCounter].hasRole(missile.primaryRole)) {
                /* if the sub-ent is the same as the missile being fired. */
                /* move the fired missile to the sub-ent position. */
                missile.position = this.$localToGlobal(this.ship.subEntities[subCounter].position);
                /* point the missile in the right direction. */
                missile.orientation = this.ship.subEntities[subCounter].orientation.multiply(this.ship.orientation);
                missile.desiredSpeed = missile.maxSpeed;
                /* remove the sub-ent version of the missile. */
                this.ship.subEntities[subCounter].remove();

                /* come out of the loop, as we've done our swap. */
                break;
            }
        }
    };

    /* Thargoid's missile code. */
    this.$localToGlobal = function $localToGlobal(position) {
        /* sub-ent position is relative to mother, but for swapping we need the absolute global position. */
        var orientation = this.ship.orientation;

        return this.ship.position.add(position.rotateBy(orientation));
    };

    /* Thargoid's missile code. */
    this.shipTakingDamage = function shipTakingDamage(amount, fromEntity, damageType) {
        var missileCounter,
        removeCounter,
        subCounter;

        if (this.ship.missiles.length === 0 && this.ship.subEntities.length === 0) {
            /* if we're all out of missiles and any sub-entities, bail out. */
            return;
        }

        this.missileSubs = 0;

        /* Initially set subCounter to number of sub-ents minus 1 (as entity array goes up from zero). */
        for (subCounter = this.ship.subEntities.length - 1; subCounter >= 0; subCounter--) {
            if (this.ship.subEntities[subCounter].hasRole(this.missileRole)) {
                /* if the sub-ent is a missile, count it. */
                this.missileSubs++;
            }
        }

        if (this.missileSubs === 0 && this.ship.subEntities.length === 0) {
            /* if we're all out of missiles and missile sub-entities, bail out. */
            return;
        }

        if (this.missileSubs < this.ship.missiles.length) {
            /* if we've got more missiles than sub-entity missiles. */
            /* get rid of all missiles. */
            this.ship.awardEquipment("EQ_MISSILE_REMOVAL");

            if (this.missileSubs > 0) {
                for (missileCounter = 0; missileCounter < this.missileSubs; missileCounter++) {
                    /* restock with the correct number of selected missile. */
                    this.ship.awardEquipment(this.missileRole);
                }
            }

            return;
        }

        if (this.missileSubs > this.ship.missiles.length) {
            /* if we've got less missiles than sub-entity missiles. */
            this.difference = this.missileSubs - this.ship.missiles.length;

            for (removeCounter = 0; removeCounter < this.difference; removeCounter++) {
                /* loop through however many subs we need to remove. */
                /* Initially set subCounter to number of sub-ents minus 1 (as entity array goes up from zero). */
                for (subCounter = this.ship.subEntities.length - 1; subCounter >= 0; subCounter--) {
                    if (this.ship.subEntities[subCounter].hasRole(this.missileRole)) {
                        /* if the sub-ent is a missile, remove it. */
                        this.ship.subEntities[subCounter].remove();

                        break;
                    }
                }
            }

            return;
        }
    };

    /* Not doing any exotic routes for now. */
    /* route: Base->WP, WP->PLANET, PLANET->WP, WP->Base */
    this.$checkCurrentRoute = function $checkCurrentRoute() {
        switch (this.route) {
        case "JAGUAR_COMPANY_BASE_TO_WP":
            this.ship.reactToAIMessage("GOTO_WITCHPOINT_FROM_BASE");
            break;
        case "JAGUAR_COMPANY_WP_TO_PLANET":
            this.ship.reactToAIMessage("GOTO_PLANET");
            break;
        case "JAGUAR_COMPANY_PLANET_TO_WP":
            this.ship.reactToAIMessage("GOTO_WITCHPOINT");
            break;
        case "JAGUAR_COMPANY_WP_TO_BASE":
            this.ship.reactToAIMessage("GOTO_BASE");
            break;
        default:
            this.route = "JAGUAR_COMPANY_BASE_TO_WP";
            this.ship.reactToAIMessage("INVALID_ROUTE");
        }
    };

    /* Find out our next route. */
    this.$findNextRoute = function $findNextRoute() {
        switch (this.route) {
        case "JAGUAR_COMPANY_BASE_TO_WP":
            this.route = "JAGUAR_COMPANY_WP_TO_PLANET";
            break;
        case "JAGUAR_COMPANY_WP_TO_PLANET":
            this.route = "JAGUAR_COMPANY_PLANET_TO_WP";
            break;
        case "JAGUAR_COMPANY_PLANET_TO_WP":
            this.route = "JAGUAR_COMPANY_WP_TO_BASE";
            break;
        case "JAGUAR_COMPANY_WP_TO_BASE":
            this.route = "JAGUAR_COMPANY_BASE_TO_WP";
            break;
        default:
            this.route = "JAGUAR_COMPANY_BASE_TO_WP";
        }

        this.$checkCurrentRoute();
    };

    /* Return the ship furthest away. */
    this.$queryMaxShip = function $queryMaxShip() {
        var ships = system.shipsWithRole("jaguar_company_patrol", this.ship);

        /* If there is no other ships then return null */
        if (ships.length === 1) {
            return null;
        }

        /* Even though the ship group can be set up, all the ships may not be present. */
        if (ships.length !== worldScripts["Jaguar Company"].shipGroup.ships.length) {
            return;
        }

        /* Return the last ship in the array which is the furthest away. */
        return ships[ships.length - 1];
    };

    /* Find the average distance to all the other ships. */
    this.$queryAverageDistance = function $queryAverageDistance() {
        var ships = system.shipsWithRole("jaguar_company_patrol", this.ship),
        distance,
        averageDistance,
        logStr,
        i,
        j;

        /* If there is no other ships then return null */
        if (ships.length === 1) {
            return null;
        }

        if (worldScripts["Jaguar Company"].logging && worldScripts["Jaguar Company"].logExtra) {
            logStr = this.ship.displayName + " => ";
        }

        averageDistance = 0.0;

        for (i = 0, j = 0; i < ships.length; i++) {
            /* Don't check our own ship. */
            if (this.ship !== ships[i]) {
                distance = this.ship.position.distanceTo(ships[i].position);

                if (worldScripts["Jaguar Company"].logging && worldScripts["Jaguar Company"].logExtra) {
                    logStr += ships[i].displayName + " = " + distance;

                    if (++j !== ships.length - 1) {
                        logStr += ", ";
                    }
                }

                /* Add up the distances. */
                averageDistance += distance;
            }
        }

        /* Average all the distances. */
        averageDistance /= (ships.length - 1);

        if (worldScripts["Jaguar Company"].logging && worldScripts["Jaguar Company"].logExtra) {
            log(this.name, "Avg: " + averageDistance + " (" + logStr + ")");
        }

        return averageDistance;
    };

    /* Find the others ships and set the target to the one furthest away. */
    this.$locateJaguarCompany = function $locateJaguarCompany() {
        var ships = system.shipsWithRole("jaguar_company_patrol", this.ship),
        maxShip;

        /* Even though the ship group can be set up, all the ships may not be present. */
        if (ships.length !== worldScripts["Jaguar Company"].shipGroup.ships.length) {
            return;
        }

        maxShip = this.$queryMaxShip();

        if (maxShip === null) {
            this.ship.reactToAIMessage("JAGUAR_COMPANY_NOT_FOUND");

            return;
        }

        this.ship.target = maxShip;
        this.ship.reactToAIMessage("JAGUAR_COMPANY_FOUND");
    };

    this.$checkJaguarCompanyDistance = function $checkJaguarCompanyDistance() {
        var ships = system.shipsWithRole("jaguar_company_patrol", this.ship),
        distance;

        /* Even though the ship group can be set up, all the ships may not be present. */
        if (ships.length !== worldScripts["Jaguar Company"].shipGroup.ships.length) {
            return;
        }

        /* Find the average distance to all the other ships. */
        distance = this.$queryAverageDistance();

        /* A 'null' distance means no other ships. */
        if (distance === null) {
            return;
        }

        /* I would love to create a fuzzy logic controller for this. */
        if (distance < 7500.0) {
            /* If the average distance is less than 7.5km then we have regrouped. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_REGROUPED");
        } else if (distance >= 7500.0 && distance < 15000.0) {
            /* If the average distance is between 7.5km and 15km then we are close. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_CLOSE");
        } else if (distance >= 15000.0 && distance < 22500.0) {
            /* If the average distance is between 15km and 22.5km then we are nearby. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_NEARBY");
        } else {
            /* If the average distance is more than 22.5km then we are far away. */
            this.ship.reactToAIMessage("JAGUAR_COMPANY_FAR_AWAY");
        }
    };

    /* Tell everyone to regroup if the average distance to all the other ships is too great. */
    this.$checkJaguarCompanyRegroup = function $checkJaguarCompanyRegroup(maxDistance) {
        var ships = system.shipsWithRole("jaguar_company_patrol", this.ship),
        distance,
        i;

        /* Even though the ship group can be set up, all the ships may not be present. */
        if (ships.length !== worldScripts["Jaguar Company"].shipGroup.ships.length) {
            return;
        }

        /* Find the average distance to all the other ships. */
        distance = this.$queryAverageDistance();

        /* A 'null' distance means no other ships. */
        if (distance === null) {
            return;
        }

        if (distance >= maxDistance) {
            for (i = 0; i < ships.length; i++) {
                /* Tell all ships, including ourself, to regroup. */
                ships[i].reactToAIMessage("JAGUAR_COMPANY_REGROUP");
            }
        }
    };

    /* This does something similar to the groupAttack AI command. */
    this.$jaguarCompanyAttackTarget = function $jaguarCompanyAttackTarget() {
        var ships = system.shipsWithRole("jaguar_company_patrol", this.ship),
        i;

        /* Even though the ship group can be set up, all the ships may not be present. */
        if (ships.length !== worldScripts["Jaguar Company"].shipGroup.ships.length) {
            return;
        }

        for (i = 0; i < ships.length; i++) {
            /* Other ships may be busy killing baddies, react 25% of the time. */
            if (this.ship !== ships[i] && Math.random() < 0.25) {
                log(this.name, "ship #" + i + " responding: " + ships[i].displayName);
                ships[i].target = this.ship.target;
                ships[i].reactToAIMessage("JAGUAR_COMPANY_ATTACK_TARGET");
            }
        }

        /* Respond to our own attack call. */
        this.ship.reactToAIMessage("JAGUAR_COMPANY_ATTACK_TARGET");
    };

    /* Locate the base. */
    this.$locateJaguarCompanyBase = function $locateJaguarCompanyBase() {
        var ships = system.shipsWithRole("jaguar_company_base", this.ship);

        if (ships.length === 0) {
            /* If it has gone, just patrol the witchpoint to the planet lane. */
            this.route = "JAGUAR_COMPANY_WP_TO_PLANET";
            this.ship.reactToAIMessage("JAGUAR_COMPANY_BASE_NOT_FOUND");
        } else {
            /* Set the target to the base. */
            this.ship.target = ships[0];
            this.ship.reactToAIMessage("JAGUAR_COMPANY_BASE_FOUND");
        }
    };

    /* Won't be needed when v1.78 comes out. */
    this.$detectQBomb = function $detectQBomb() {
        var qbomb = system.shipsWithRole("EQ_QC_MINE EQ_CASCADE_MISSILE", this.ship, 25600.0);

        /* Let v1.77+ handle it. */
        if (0 >= oolite.compareVersion("1.77")) {
            return;
        }

        if (qbomb.length !== 0) {
            /* First one is the closest. */
            this.ship.target = qbomb[0];
            this.ship.reactToAIMessage("CASCADE_WEAPON_DETECTED");
        }
    };

}).call(this);
