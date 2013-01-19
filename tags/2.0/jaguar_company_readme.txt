Jaguar Company 2.0 (2012-11-30)

Sometime ago I posted some images on the Screenshots thread ( http://aegidian.org/bb/viewtopic.php?f=2&t=4494 ) of the
Oolite BB ( http://aegidian.org/bb/ ), of what is possible with Griff's multi-decal Player Cobra Mk III OXP.
I mentioned that I have a lioness on the back of my Cobbie 3 hunters. Someone else suggested that jaguars might be
better. This formed an idea in my head and Jaguar Company was born.

TOC
---
Overview
Requirements
Optional OXPs
Downloads
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
    Galactic Navy.

This is highly recommended.
    Talkative Space Compass - Easy identification of the beacon codes. (Or a HUD that does similar reporting.)

Downloads
---------
    https://www.box.com/s/sbm1grusteqwd3hsyism (box.com)
    https://dl.dropbox.com/u/31706855/Oolite/OXPs/jaguar_company_2.0.zip (dropbox.com)
    rsync://ebspso.dnsalias.org/jaguar_company_2.0 or ebspso.dnsalias.org::jaguar_company_2.0 (rsync)

Install
-------
After unzipping, move or copy the folder, "jaguar_company_2.0.oxp", into your AddOns directory.

Uninstall
---------
Delete the directory, "jaguar_company_2.0.oxp", from your AddOns directory.

Oolite v1.77 and newer
----------------------
Use visual effect code for Oolite v1.77 and newer by setting 'this.$visualEffects' to true in 'jaguar_company.js' found
in the Scripts directory.

Version History
---------------
v2.0 (2012-11-30)
    First release out of WIP.
    Moved route code fully into the main worldscript.
    New worldscript for attackers code. Remember attackers. Even players who jump system.
        Friend or Foe checks all ships in scanner range.
        The first few shots are ignored as "friendly fire". Reputation can be lost!
        You can remove the hostile mark by going to a new galaxy. This will also remove your reputation.
    Welcome screen on docking.
    Check for player helping.
      Thanks to Wildeblood for pointing out the then invisible world script event 'shipAttackedOther'.
        There's a 10% chance of being seen in the heat of battle. A kill is always seen and rewarded highly.
        If the player has enough reputation in combat then the communications buoy will transmit a beacon code of 'J'
          for the player to follow on the ASC. Wait a couple of minutes before checking, the tug pushing the
          communications buoy out has to reach the drop off point before the beacon activates.
        The market for the base will change if the player has enough reputation.
    The communications buoy will slowly rotate to point towards the patrol ships on release from the tug.
    Black Box Tracker points to the nearest patrol ship.
        Uses new visual effects code for Oolite v1.77 and newer, otherwise a simple invisible object hanging above the
          closest patrol ship that can be tracked with the Advanced Space Compass.
        Tracker deactivates if the player is close to the patrol ships.
    If Jaguar Company is forced out of interstellar space, they will all use 1 witchpoint exit even though they are all
      independent entities and not escorts or part of a group.
    Position and name of the base is now fixed. Uses 'system.scrambledPseudoRandomNumber(salt)'.
        Conjunction of the witchpoint, planet and sun is checked for so the base doesn't end up in the middle of the
          planet.

For a full version history see jaguar_company_changelog.txt in the directory you loaded this readme file from.

Future Versions
---------------
Torus drive sync for the boring bits.
Integration with Snoopers OXP if available.

Copyright
---------
Copyright © 2012 Richard Thomas Harrison (Tricky)

This work is licensed under the Creative Commons
Attribution-Noncommercial-Share Alike 3.0 Unported License.

To view a copy of this license, visit
http://creativecommons.org/licenses/by-nc-sa/3.0/ or send a letter
to Creative Commons, 171 Second Street, Suite 300, San Francisco,
California, 94105, USA.
