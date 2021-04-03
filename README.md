Wave Defeance MOD
=================

Mod changes skirmish mode to wave protection mode. Supports multiplayer.
The mod is compatible with Warzone2100 version 4.0.0. Older versions of the game are not supported.

Installation
------------

Pack catalog `multiplay` into a zip archive and put them in `autoload`.
Put the map `4c-Poli-Eye-W-a.wz` in the catalog `maps` 
Read more https://github.com/Warzone2100/warzone2100/blob/master/README.md#configuration

Launch
------

It is necessary to install one "wave" bot in the room. It can occupy any slot. The bot does not need base structures. The difficulty of the bot changes the number of enemies and the pause between attacks.
You can use a preset challenge or autoplay to create fake slots.
See examples in files: `./autohost/Poli-Eye-W-a.json` and `./autohost/TestStart.json`

Only the host needs to enable the mod.
The launch of the game on the prepared map is arranged as follows:
```
$ warzone2100 --autohost=Poli-Eye-W-a.json
```

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
