[Русский/Russian](README.ru.md)

[Français/French](README.fr.md)

# Wave Defense MOD

Mod changes skirmish mode to wave protection mode. Supports multiplayer.
The mod is compatible with Warzone2100 version 4.6.1. Older versions of the game are not supported.

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
- Put the maps `10c-Stone-Jungle-v3w.wz` in the catalog `maps` 
- Add one `waveAI` to the last slot. AI difficulty level will affect the number of enemy units.
- Only the host needs to enable the mod.

## Tricks & hints
- Enemies don't make any difference between a structure or a droid. You could use cheap structures to distract them, and get some time
- Enemy's droid templates do vary with time, but do not depend on your templates. Try to find more effective propulsion/body combinations.
- Enemy doesn't have Sensors units, but has artillery and sensor towers.
- In about an hour of game, number of enemies will start growing huge. You should try to win before that time mark.
- You can delay next landing by leaving some enemy units alive for some time. This doesn't include VTOL, AA guns, and fortifications.
- Don't forget to add more structures, as your limits increase.
- About a half of enemy units will have fragile propulsion, so use heavy artillery to your advantage.

## Settings and maps
### Choosing a map
You can use any map, but `10c-Stone-Jungle-v3w.wz` is recommended.
Another mode is supported, when the map is expanding to North, for that
you can use the map `10c-ntw_trail10pro2.wz` which is provided. Replace
`multiplay/script/rules/settings.json` with   `multiplay/script/rules/settings.json_ntw_trail10pro2.` to use it.


When choosing another map:
- must not contain any isolated areas, units may be stuck inside them
- must not contain large, sharp cliffs
- in the center (or in the south, with one-side expansion) must be an area suitable for your own base building. Spawn points don't depend on location of your HQ.

### Configuration
By default, the mod will use:
- `multiplay/script/rules/config/settings.json`
- `multiplay/script/rules/config/research.json`
- `multiplay/script/rules/config/structure.json`
- `multiplay/script/rules/config/startingComponents.json`
- `multiplay/script/rules/config/componentWeights.json`
- `multiplay/script/rules/config/redundantComponents.json`
or, if present:
- `multiplay/script/rules/config/<MapName>/settings.json`
- `multiplay/script/rules/config/<MapName>/research.json`
- `multiplay/script/rules/config/<MapName>/structure.json`
- `multiplay/script/rules/config/<MapName>/startingComponents.json`
- `multiplay/script/rules/config/<MapName>/componentWeights.json`
- `multiplay/script/rules/config/<MapName>/redundantComponents.json`

Explanation for `settings.json`:
```
{
	"waveUnitsExpTimeM": { "zero": 0, "hero": 60 }, # enemy units grow to Hero rank after 60 minutes. This increase starts at 0 minutes
	"transportExpTimeM": { "zero": 9, "hero": 50 }, # enemy transports grow to Hero rank after 50 minutes. This increase starts at 9 minutes
	"protectTimeM": 3,    # minutes until the first wave
	"pauseM": 0.8,        # delay in minutes between waves
	"inWavePauseS": 7,    # delay between landings within the same wave
	"INCREM_PAUSEM": 0.1, # each wave, increase the delay between waves in minutes
	"timeHandicapM": 2,   # slight lag in research for AI
	"RESIDUAL": 0.03,     # a wave is considered defeated when only 3% of units remain

	"mapExpansionPattern": "auto", # expansion pattern. ("north"/"east"/"south"/"west"/[["north","east","south","west]]/[["north"],["south"]])
	"startHeight": "auto",         # initial map height/radius, in tiles
	"expansionAmount": "auto",     # tile growth after each wave

	"powerQ": 100,         # quadratic wave growth factor, depends on time
	"powerL": 0.20,        # linear wave growth factor, depends on time
	"powerC": 200,         # constant extra power
	"Kfinal": 3,           # final wave power multiplier
	"structPower": {       # allowed structure types
		"DEFENSE": 0.31,   # amount of DEFENSE structures
		"REARM PAD": 0.02  # amount of REARM PAD structures
	},

	"flightDistanceQ": 0.0,     # quadratic wave growth factor, depends on time
	"flightDistanceL": 0.0,     # linear wave growth factor, depends on time
	"flightDistanceC": 0,       # constant extra power
	"cyborgTransport": false,   # enemy transports are cyborg transports
	"transporterUnitCount": 40, # number of units that land from each transporter
	"waterLanding": false,            # units can land in water
	"waterStructure": false,          # structures can appear on water
	
	"waveExperienceModifier": null,   # how fast enemy units gain experience (null = default)
	"playerExperienceModifier": null, # how fast your units gain experience (null = default)
	"autoBase": true,     # create a base automatically for the player
	"recalcLimits": true, # adjust limits as players quit or as more oils are available
	"forceLimits": false, # use fair limits for competitive play. only works for <= 4 players
	"infinite": true,     # never end the game
}
```
Explanation for `componentWeights.json`:
```
{
	"Rocket-Sunburst": 40,     # 60% less
	"EMP-Cannon": 50,          # 50% less
	"CyborgLegs": 100,         # default
	"V-Tol": 0,                # disable
	"Rocket-VTOL-Sunburst": 0, # disable
	"RailGun1Mk1": 300,        # 300% more
	"RailGun2Mk1": 300,        # 350% more
	"TransporterBody": 0,      # disable
	"SuperTransportBody": 0,   # disable
	"CommandTurret1": 0        # disable
}
```
Explanation for `redundantComponents.json`:
```
{
	"R-Vehicle-Prop-Halftracks": [
		"wheeled01"                # Stop using wheels after Half-Track is researched
	],
	"R-Wpn-Howitzer-Incendiary": [
		"Mortar-Incendiary"        # Stop using Incendiary Mortar after research Incendiary Howitzer
	],
	"R-Vehicle-Body11": [
		"Body1REC"                 # Stop using Viper after Python is researched
	]
}
```
Explanation for `startingComponents.json`:
```
[
	"B2JeepBody",
	"BusBody",    # Make components available to the Wave AI at start
	"BaBaMG"     
]
```

