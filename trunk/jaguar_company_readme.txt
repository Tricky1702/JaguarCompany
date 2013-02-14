Jaguar Company 2.5 (2013-??-??)

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
Credits
    Griff
    Thargoid
    Little Bear
    Eric Walch
    Spara
Copyright

Overview
--------
Adds in an Elite group of pilots to patrol the space lanes in Anarchy, Feudal and Multi-Government systems.

The members of Jaguar Company are part-time reservists so there is a chance that they will appear if there is a major
Galactic Naval convoy in the system.

Requirements
------------
    Oolite 1.75+
    Cabal Common Library

Optional OXPs
-------------
    OXPConfig - For log control.
    Snoopers OXP - For news alerts from various sources.
    Galactic Navy.

This is highly recommended.
    Talkative Space Compass - Easy identification of the beacon codes. (Or a HUD that does similar reporting.)

Install
-------
After unzipping, move or copy the folder, "jaguar_company_2.5.oxp", into your AddOns directory.

Uninstall
---------
Delete the directory, "jaguar_company_2.5.oxp", from your AddOns directory.

Oolite v1.77 and newer
----------------------
Use visual effect code for Oolite v1.77 and newer by setting 'this.$visualEffects' to true in 'jaguar_company.js' found
in the Scripts directory.

Version History
---------------
v2.5 (2013-??-??)
    *** This OXP now requires Cabal Common Library. ***
    Proper integration for Oolite v1.77 and newer with the interface screen for base locations.
    Added check for blackbox + software patch for base locations in the $addInterface() function.
    Renamed the vertex and fragment shaders.
    Rewritten $listNames() to use Cabal Common Library for truncating, padding and creating columns.
        Oolite v1.76.1 and older use the original method of padding rows. (Spaces)
        Oolite v1.77 and newer use Cabal Common Library v1.7 strAdd2Columns() and strAddIndentedText() to create the
          rows.
    Removed some dead/unused code.
    Fixed ghost messages appearing on the player's console. I forgot player.consoleMessage() isn't distance dependant.
      It obviously isn't, however these minor bugettes happen from time to time. ;)
    Multiple rescue news implementation.
    Clean up of code in guiScreenChanged().
    Changed key combination to show list of base locations to F7, F5.
        Oolite v1.77 and newer use the interface API when docked.
    Lowered max cargo space to 10TC to explain extra speed.

For a full version history see jaguar_company_changelog.txt in the directory you loaded this readme file from.

Future Versions
---------------
    Torus drive sync for the boring bits.

Credits
-------
Griff
    Models, textures and shaders for the Cobra MkIII, ECM proof missile and Transporter.
        Both regular and scuffed versions of the multi-decal Cobra MkIII are used.

Thargoid
    External missile code found in Griff's example for missile sub-entities on a Cobra MkIII.
    Code example to stop Jaguar Company from breaking a core mission for the player if they 'accidently' help out.
        Various OXPs.
    Inspiration for the invisible tracker from Tracker OXP.
    AI inspiration from Hired Guns OXP.

Little Bear
    Examples of messages for 'friendly fire' and 'hostile fire' from Random Hits OXP.

Eric Walch
    Buoy positioning code examples from Buoy Repair OXP.

Spara
    Inspiration for multi-column lists from Trophy Collector OXP.

Copyright
---------
Copyright © 2012-2013 Richard Thomas Harrison (Tricky)

This work is licensed under the Creative Commons
Attribution-Noncommercial-Share Alike 3.0 Unported License.

To view a copy of this license, visit
http://creativecommons.org/licenses/by-nc-sa/3.0/ or send a letter
to Creative Commons, 171 Second Street, Suite 300, San Francisco,
California, 94105, USA.
