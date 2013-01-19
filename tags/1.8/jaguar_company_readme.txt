Jaguar Company 1.8 (2012-08-09)

A work in progress OXP.

Sometime ago I posted some images on the Screenshots thread ( http://aegidian.org/bb/viewtopic.php?f=2&t=4494 ) of the
Oolite BB ( http://aegidian.org/bb/ ), of what is possible with Griff's multi-decal Player Cobra Mk III OXP. I mentioned that I
have a lioness on the back of my Cobbie 3 hunters. Someone else suggested that jaguars might be better. This formed an idea in my
head and Jaguar Company was born.

TOC
---
Overview
Requirements
Downloads
Install
Uninstall
Version History
Furture Versions
Copyright

Overview
--------
Adds in an Elite group of pilots to patrol the space lanes in Anarchy, Feudal and Multi-Government systems.

The members of Jaguar Company are part-time reservists so there is a chance that they will appear if there is a major Galactic
Naval convoy in the system.

Requirements
------------
* Oolite 1.75+
* OXPConfig

Downloads
---------
* https://www.box.com/s/8af9aa0382c70a960885 (box.com)
* https://dl.dropbox.com/u/31706855/Oolite/OXPs/jaguar_company.zip (dropbox.com)
* rsync://ebspso.dnsalias.org/jaguar_company or ebspso.dnsalias.org::jaguar_company (rsync)

Install
-------
After unzipping, move or copy the folder, "jaguar_company_1.8.oxp", into your AddOns directory.

Uninstall
---------
Delete the directory, "jaguar_company_1.8.oxp", from your AddOns directory.

Version History
---------------
v1.8 (2012-08-09)
    Use performFlyToRangeFromDestination rather than performFlee in the MOVE_AWAY state of patrol AI.
    Patrol ships launch from base on startup.
    Patrol ships dock after returning to base.
    New AI and script for the base.
    Added turrets to the base.
    Stopped the rotation of the base.
        Found out stations stop rotating when attacking and don't start rotating after.
    Commodity pricing.
    withinStationAegis uniform binding is actually a boolean, not a float as the wiki stated.
        gave this 'OpenGL error: "invalid operation" (0x502) ...' in the test log.

For a full version history see jaguar_company_changelog.txt in the directory you loaded this readme file from.

Future Versions
---------------
Torus drive sync for the boring bits.
Currently if you attack Jaguar Company and then run away they forget about you. This will need to be changed.
Black box base and Jaguar Company locator.
Check for player helping. Can this be done?
Discount for "friends".
Welcome message on docking.
Integration with Snoopers OXP if available.

Copyright
---------
Copyright (C) 2012 Tricky

This work is licensed under the Creative Commons
Attribution-Noncommercial-Share Alike 3.0 Unported License.

To view a copy of this license, visit
http://creativecommons.org/licenses/by-nc-sa/3.0/ or send a letter
to Creative Commons, 171 Second Street, Suite 300, San Francisco,
California, 94105, USA.
