# Wave Defense MOD

Mod changes skirmish mode to wave protection mode. Supports multiplayer.
The mod is compatible with Warzone2100 version 4.2.0. Older versions of the game are not supported.

You start in the South frontier of the map. You only have a tiny stip of land available, everything else
is blocked (but will be revealed as you go). You have 4 minutes to prepare for the first attack.
When the timer goes off, the map grows by 10 tiles, and the enemy reinforcements arrive immediately.
Once you clean up the map, the timer starts again, but now you will only have 2 minutes to prepare, and so on.

In order to win, you have to survive untill the whole map is revealed.

## Good to know

- Enemy waves are always technologically ahead of you. Theoretically, you could research as fast as your enemy, but practically your units will always lag behind.
- Number of enemies per wave grows quadratically with time, and linearly with number of oil wells on the map.
- Enemy does have VTOL.
- Structure limits depend on number of oil wells on the map, and increases with each wave.
- Structure limits do not depend on number of players.
- You can't save/load.

## How to launch

- Pack catalog `multiplay` into a zip archive and put them in `autoload`.
- Put the maps `10c-ntw_trail10pro2.wz` in the catalog `maps` 
Read more https://github.com/Warzone2100/warzone2100/blob/master/README.md#configuration
- Add one `waveAI` to any slot. AI difficulty level will affect the number of enemy units.
- Only the host needs to enable the mod.

## Tuning and maps
### Choosing a map

You can use any map, but `10c-ntw_trail10pro2.wz` is recommended.
When choosing another map, note that there is a chance that enemies could be stuck
in some difficult-to-access areas, so choose accordingly.
Also, all North side of the map should be suitable for construction.
The map must not contain any sharp cliffs.

If there are no marked areas in the map, landings are made to the center of the map.
The script considers any marked zones as drop-off points.
NOTE The game accepts zones only in the `json` format. The FLAME card editor saves them in `ini` format.
You can change some parameters in this file: `/multiplay/script/rules/settings.json`

### Tuning
All parameters are in `multiplay/script/rules/settings.json`:

```
{
	"protectTimeM": 4, # minutes untill first wave
	"totalGameTime": 90, # time in minutes untill enemies reach the rank 16
	"expansion": 10, # tile growth after each wave
	"startHeight": 35, # initial map height (first wave)
	"Kpower" : 0.25, # linear wave growth factor, depends on time
	"doublePowerM": 20, # quadratic wave growth factor, depends on time
	"pauseM": 2, # delay in minutes between waves
	"timeHandicapM": 0.5 # slight lag in research for AI
}
``` 

## Tricks & hints
- Enemies don't make any difference between a structure or a droid. You could use 
cheap  structures to distract them, and get some time
- Enemy's droid templates do vary with time, but do not depend on your templates. Try to find more effective propulsion/body combinations.
- Enemy only has Bombards and Mortars, no Howitzers, nor Ground Shakers.
- In about an hour of game, number of enemies will start growing huge. You 
should try to win before that time mark.
- Don't forget to add more structures, as your limits increase.
- About a half of enemy units will have fragile propulsion, so use heavy artillery to your advantage.