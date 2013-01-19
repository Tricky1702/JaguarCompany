Jaguar Company 2.1 (2012-12-02)

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
    https://www.box.com/s/xqun8pfj2qotdsx0xq11 (box.com)
    https://dl.dropbox.com/u/31706855/Oolite/OXPs/jaguar_company_2.1.zip (dropbox.com)
    rsync://ebspso.dnsalias.org/jaguar_company_2.1 or ebspso.dnsalias.org::jaguar_company_2.1 (rsync)

Install
-------
After unzipping, move or copy the folder, "jaguar_company_2.1.oxp", into your AddOns directory.

Uninstall
---------
Delete the directory, "jaguar_company_2.1.oxp", from your AddOns directory.

Oolite v1.77 and newer
----------------------
Use visual effect code for Oolite v1.77 and newer by setting 'this.$visualEffects' to true in 'jaguar_company.js' found
in the Scripts directory.

Version History
---------------
v2.1 (2012-12-02)
    Thargoids and tharglets always returns true in $isHostile check.
    There is a safe zone of 30km around the base.
        NB: The safe zone does not extend to known attackers.
    Took out some ship script event handlers and AI sendScriptMessage functions from the base, buoy, miner and tug ship
      scripts that is inserted by $addFriendly.
    Fixed colour bug with the tracker. Didn't start off red if the target was behind the player.
    Fixed name error for $performJaguarCompanyAttackTarget in $addFriendly.
    Fixed sun check error if no sun exists.

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
