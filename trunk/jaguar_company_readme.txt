Jaguar Company 2.4 (2012-12-27)

Sometime ago I posted some images on the Screenshots thread ( http://aegidian.org/bb/viewtopic.php?f=2&t=4494 ) of the
Oolite BB ( http://aegidian.org/bb/ ), of what is possible with Griff's multi-decal Player Cobra Mk III OXP.
I mentioned that I have a lioness on the back of my Cobbie 3 hunters. Someone else suggested that jaguars might be
better. This formed an idea in my head and Jaguar Company was born.

TOC
---
Overview
Requirements
Optional OXPs
Install
Uninstall
Oolite v1.77 and newer
Version History
Furture Versions
Copyright

Overview
--------
Adds in an Elite group of pilots to patrol the space lanes in Anarchy, Feudal and Multi-Government systems.

The members of Jaguar Company are part-time reservists so there is a chance that they will appear if there is a major
Galactic Naval convoy in the system.

Requirements
------------
    Oolite 1.75+

Optional OXPs
-------------
    OXPConfig - For log control.
    Snoopers OXP - For news alerts from various sources.
    Galactic Navy.

This is highly recommended.
    Talkative Space Compass - Easy identification of the beacon codes. (Or a HUD that does similar reporting.)

Install
-------
After unzipping, move or copy the folder, "jaguar_company_2.4.oxp", into your AddOns directory.

Uninstall
---------
Delete the directory, "jaguar_company_2.4.oxp", from your AddOns directory.

Oolite v1.77 and newer
----------------------
Use visual effect code for Oolite v1.77 and newer by setting 'this.$visualEffects' to true in 'jaguar_company.js' found
in the Scripts directory.

Version History
---------------
v2.4 (2012-12-27)
    Bug fix for spawning Jaguar Company. Potential to spawn the base at all times if the Galactic Navy wasn't present.
    Bug fix for checking the safe zone around the base. Wasn't checking to see if it actually existed.
    Main world script saves the last system ID that was visited for interstellar space.
    Timer on start up for the worldscripts has been added to allow each worldscript to be loaded in. Stops a potential
      dependency error happening.
    Stray commas in the route list arrays removed.
    Welcome code has been cleaned up.
    missiontext.plist and descriptions.plist cleaned up.
    Altered all player consoleMessage's to show messages for the default time limit.
    Changed all player commsMessage's to consoleMessage.
    Changed some of the player consoleMessage's back into commsMessage.
    Only insert news into Snoopers about battle help if more than 10 minutes has passed since the last news item was
      inserted.
    If you set $alwaysSpawn to true with OXPConfig the base will be spawned if it doesn't exist.
    Patrol ships follow the Galactic Navy.
        If by some freak accident, all of the Galactic Navy is destroyed, the patrol ships will go back to base if it
          exists. Otherwise they will patrol the witchpoint to planet lane.
    New reputation level. Shows the location of Jaguar Company Bases in the current galaxy.
        Re-implementation of the game random number generators for system.pseudoRandomNumber and
          system.scrambledPseudoRandomNumber, to allow checking of all the systems in the current galaxy. The system
          versions only gives back a value for the current system.
        Oolite v1.76.1 or older only show a list of system names. Go to the long range chart then select the status
          screen (F6, F6, F5). Borrowed some code from Spara's Trophy Collector OXP for this.
        Oolite v1.77 or newer display the locations on the long range chart. Uses the new object method of
          mission.markSystem so it won't intefere with other OXPs. (Hopefully)

For a full version history see jaguar_company_changelog.txt in the directory you loaded this readme file from.

Future Versions
---------------
    Torus drive sync for the boring bits.

Copyright
---------
Copyright © 2012 Richard Thomas Harrison (Tricky)

This work is licensed under the Creative Commons
Attribution-Noncommercial-Share Alike 3.0 Unported License.

To view a copy of this license, visit
http://creativecommons.org/licenses/by-nc-sa/3.0/ or send a letter
to Creative Commons, 171 Second Street, Suite 300, San Francisco,
California, 94105, USA.
