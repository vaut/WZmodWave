Wave Defeance MOD
=================

Mod changes skirmish mode to wave protection mode. Supports multiplayer.
The mod is compatible with Warzone2100 version 4.2.0. Older versions of the game are not supported.

Installation
------------

Pack catalog `multiplay` into a zip archive and put them in `autoload`.
Put the maps `4c-Poli-Eye-W-a.wz` in the catalog `maps` 
Read more https://github.com/Warzone2100/warzone2100/blob/master/README.md#configuration

Launch
------

Waves replace standard scavengers.
Ultimate ones are more dangerous than normal ones.
With scavengers turned off, waves will appear, but the AI does not control these units. 

Only the host needs to enable the mod.

The fight
---------

The enemy lands in one of the landing zones every few minutes. The bot sends the entire army to destroy your base or resources.
At the beginning of the battle, a preparation pause is given.
The number of opponents is calculated based on the number of resources on the map.
After 2 hours of play, you will see a victory screen. The waves never stop.

Tuning
------

If there are no marked areas in the map, landings are made to the center of the map.
The script considers any marked zones as drop-off points.
NOTE The game accepts zones only in the jcion format. The FLAME card editor saves them in ini.
You can change some parameters in this file: `/multiplay/script/rules/settings.json`
