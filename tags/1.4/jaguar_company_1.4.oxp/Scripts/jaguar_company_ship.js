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
** Missile subentity loading based on tgGeneric_externalMissiles.js by Thargoid
*/

"use strict";

this.name = "jaguar_company_ship.js";
this.author = "Tricky";
this.copyright = "(C) 2012 Tricky";
this.license = "CC BY-NC-SA 3.0";
this.description = "Ship script for the Jaguar Company.";
this.version = "1.1";

this.shipSpawned = function () {
    var shipNames, addCounter;

    /* OU's, GOU's, LOU's and (d)ROU's. Also some names I really like. */
    shipNames = ["Profit Margin", "Trade Surplus", "Limiting Factor", "Gunboat Diplomat", "Zealot", "Xenophobe", "God Told Me To Do It", "Just Another Victim Of The Ambient Morality", "Synchronize Your Dogmas", "Thank you And Goodnight", "Well I Was In The Neighbourhood", "You'll Thank Me Later", "Shoot Them Later", "Attitude Adjuster", "Killing Time", "I Blame Your Mother", "I Blame My Mother", "Heavy Messing", "Frank Exchange Of Views", "Nuisance Value", "All Through With This Niceness And Negotiation Stuff", "I Said, I've Got A Big Stick", "Hand Me The Gun And Ask Me Again", "But Who's Counting?", "Germane Riposte", "We Haven't Met But You're A Great Fan Of Mine", "All The Same, I Saw It First", "Ravished By The Sheer Implausibility Of That Last Statement", "Zero Credibility", "Charming But Irrational", "Demented But Determined", "You May Not Be The Coolest Person Here", "Lucid Nonsense", "Awkward Customer", "Conventional Wisdom", "Fine Till You Came Along", "I Blame The Parents", "Inappropriate Response", "A Momentary Lapse Of Sanity", "Lapsed Pacifist", "Reformed Nice Guy", "Pride Comes Before A Fall", "Injury Time", "Now Look What You've Made Me Do", "Kiss This Then", "Eight Rounds Rapid", "You'll Clean That Up Before You Leave", "Me, I'm Counting", "The Usual But Etymologically Unsatisfactory", "Falling Outside The Normal Moral Constraints", "Hylozoist", "No One Knows What The Dead Think", "Flick to Kick", "Your Egg's Broken But Mine Is Ok", "Shall I Be Mummy?", "Is This Galaxy Taken?", "Famous Last Words", "Road Rage", "Live A Little", "Not in My Back Yard", "Playing A Sweeper", "You're Going Home In A Fracking Ambulance", "Rear Entry", "Open Wide, Say Aaaarrgghhh", "Hope You Like Explosions", "I Haven't Seen One Of Those For Years", "Are You Religious?", "Not Now Dear", "Something Had To Be Done", "Hideously Indefensible Sense Of Humour", "Camouflage", "Come And Have A Go If You Think You're Hard Enough", "Throwing Toys Out The Crib", "Podex Perfectus Es", "Stercorem Pro Cerebro Habes", "Futue Te Ipsum Et Caballum Tuum", "Remember To Wash Your Hands", "One Out All Out", "Looking At Me, Pal?", "You Showed Me Yours, Now I'll Show You Mine", "Salt In Your Vaseline", "Cracking My Knuckles", "Break Glass In Case Of War", "My Turn", "No Pun Intended", "Look No Hands", "Very Sharp Stick", "Weapons Of Mass Deception", "...And Another Thing", "Clerical Error", "Silly Mid On", "You And Whose Army?", "This Sector Ain't Big Enough For The Both Of Us", "Diplomacy Was Never My Strong Suite", "Such A Pretty Big Red Button", "Synthetic Paragon Rubber Company", "Forget And Fire", "I Was Just Following Orders", "Weapon of Mass Distraction", "Forgive and Forget", "Innocence Is No Excuse", "Psychosis Is Only One State Of Mind", "Lets Dance", "AI Avenger", "Dead Man Walking", "A Little Less Conversation", "Here One Minute, Gone The Next", "Here, Let Me Escort You", "Killed With Superior Skill", "External Agitation", "Catch Me If You Can", "But What About The Children?", "Single Fingered Hand Gestures", "A World Of Hurt", "Looking Down The Gun Barrel", "Terminal Atomic Headache", "Know Thy Enemy", "Cold Steel For An Iron Age", "The Malevolent Creation", "Gamma Ray Goggles", "End Of Green", "Terrorwheel", "Sickening Sense Of Humour", "Mines Bigger", "Friendly Fire Isn't", "No Need For Stealth", "All Guns Blazin!", "Harmony Dies", "The Controlled Psychopath", "It Ends Now", "Forced To Be Nice", "Axis of Advance", "Acts of God", "The Feeling's Mutual", "The Beautiful Nightmare", "If You Can Read This...", "Are You Saved?", "Cunning Linguist", "Gay Abandon", "My Finger", "Got Legs", "Hose Job", "Protect And Sever", "Rebuttal", "Not In The Face", "I Have Right Of Way", "It Ran Into My Missile", "Have A Nice Rest Of Your Life", "Nose Job", "Get My Point?", "Grid Worker", "Eraserhead", "What Star?", "All This (And Brains)", "Random Acts Of Senseless Violence", "God Will Recognize His Own", "Would You Like A Quick Suppository With That?", "Pop Me A Couple More Of Those Happy Pills (Eccentric)", "Trouble Maker?", "Talk Is Cheap", "Tightly Strung", "Have You Kept The Receipt?", "It Was Broke When I Got Here", "Insanity Plea Rejected", "Thora Hird", "Barbara Cartland", "Freddy Starr Ate My Hamster", "And You Thought You Knew What Terror Means", "I'm A 'Shoot First, Ask Questions Later' Kinda Guy", "Duck You Suckers", "Trumpton Riots", "Dodgy Transformer"];

    if (worldScripts["Jaguar Company"].logAIMessages) {
        this.ship.reportAIMessages = true;
    }

    this.ship.displayName = "Jaguar Company: " + shipNames[Math.floor(Math.random() * shipNames.length)];

    // just to ensure ship is fully loaded with selected missile type and nothing else
    if (this.ship.scriptInfo.missileRole) {
        // missileRole should be defined in shipdata.plist
        this.missileRole = this.ship.scriptInfo.missileRole;
    } else {
        // default to standard missile if not
        this.missileRole = "EQ_HARDENED_MISSILE";
    }

    if (this.ship.scriptInfo.initialMissiles) {
        this.initialMissiles = parseInt(this.ship.scriptInfo.initialMissiles, 10);
    } else {
        this.initialMissiles = this.ship.missileCapacity;
    }

    if (this.ship.missiles.length > 0) {
        this.ship.awardEquipment("EQ_MISSILE_REMOVAL"); // remove all spawning missiles and restock with selected ones.
    }

    for (addCounter = 0; addCounter < this.initialMissiles; addCounter++) {
        this.ship.awardEquipment(this.missileRole);
    }
};

this.shipFiredMissile = function (missile, target) {
    var subCounter;

    if (this.ship.subEntities.length === 0) {
        return; // if we've run out of sub-ents before we run out of missiles
    }

    subCounter = this.ship.subEntities.length - 1; // Set counter to number of sub-ents minus 1 (as entity array goes up from zero)

    for (subCounter = this.ship.subEntities.length - 1; subCounter >= 0; subCounter--) {
        if (this.ship.subEntities[subCounter].hasRole(missile.primaryRole)) {
            // if the sub-ent is the same as the missile being fired
            missile.position = this.localToGlobal(this.ship.subEntities[subCounter].position); // move the fired missile to the sub-ent position
            missile.orientation = this.ship.subEntities[subCounter].orientation.multiply(this.ship.orientation); // point the missile in the right direction
            missile.desiredSpeed = missile.maxSpeed;
            this.ship.subEntities[subCounter].remove(); // remove the sub-ent version of the missile

            break; // come out of the loop, as we've done our swap
        }
    }
};

this.localToGlobal = function (position) {
    // sub-ent position is relative to mother, but for swapping we need the absolute global position
    var orientation = this.ship.orientation;

    return this.ship.position.add(position.rotateBy(orientation));
};

this.shipTakingDamage = function (amount, fromEntity, damageType) {
    var missileCounter, removeCounter, subCounter;

    if (this.ship.missiles.length === 0 && this.ship.subEntities.length === 0) {
        // if we're all out of missiles and any sub-entities, bail out.
        return;
    }

    this.missileSubs = 0;

    // Initially set subCounter to number of sub-ents minus 1 (as entity array goes up from zero)
    for (subCounter = this.ship.subEntities.length - 1; subCounter >= 0; subCounter--) {
        if (this.ship.subEntities[subCounter].hasRole(this.missileRole)) {
            // if the sub-ent is a missile, count it
            this.missileSubs++;
        }
    }

    if (this.missileSubs === 0 && this.ship.subEntities.length === 0) {
        // if we're all out of missiles and missile sub-entities, bail out.
        return;
    }

    if (this.missileSubs < this.ship.missiles.length) {
        // if we've got more missiles than sub-entity missiles
        this.ship.awardEquipment("EQ_MISSILE_REMOVAL"); // get rid of all missiles

        if (this.missileSubs > 0) {
            for (missileCounter = 0; missileCounter < this.missileSubs; missileCounter++) {
                // restock with the correct number of selected missile
                this.ship.awardEquipment(this.missileRole);
            }
        }

        return;
    }

    if (this.missileSubs > this.ship.missiles.length) {
        // if we've got less missiles than sub-entity missiles
        this.difference = this.missileSubs - this.ship.missiles.length;

        for (removeCounter = 0; removeCounter < this.difference; removeCounter++) {
            // loop through however many subs we need to remove
            // Initially set subCounter to number of sub-ents minus 1 (as entity array goes up from zero)
            for (subCounter = this.ship.subEntities.length - 1; subCounter >= 0; subCounter--) {
                if (this.ship.subEntities[subCounter].hasRole(this.missileRole)) {
                    // if the sub-ent is a missile, remove it
                    this.ship.subEntities[subCounter].remove();

                    break;
                }
            }
        }

        return;
    }
};
