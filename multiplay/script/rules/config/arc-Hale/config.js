configjs = (
  time,       // current game time in seconds
  wave,       // current wave number (1, 2, 3, ...) where 0 = before any wave
  oils,       // current number of oils on the map
  difficulty, // 0.66, 1.00, 1.33, 1.66
) => {
////////////////////////////////////////////////////////////////////////////////

mapSize = 99
inWavePauseS = 0
afterWavePauseM = 2
wavePower = (0.00000001*time**3.05 + 0.2*time) * oils*difficulty**2 + 2000
transportHP = 0.0000002*time**3*difficulty**3 + 0.5*time*difficulty**3 + 15*oils*difficulty
transportCapacity = oils/2 * (1 - 0.0001*time)
transportFlyDistance = 0.000005*time**2
structDistance = 3

protectTimeM = 2
mapExpansionPattern = "north"
waveResearchDelayM = 1
waveRankTimeM = { "zero": 25, "hero": 70 }
waveResidual = Infinity
waveFinalMultiplier = 3
waveExpModifier = 0
playerExpModifier = 0
cyborgTransport = false
waterLanding = false
waterStructure = false
autoBase = false
infiniteWaves = true
crazyWaves = true
structPower = {}

waveUnits = {
  "hoverFlame": false,
  "strongHover": false,
  "lateTracks": false,
  "noT4halftracks": false,
  "noSnails": true,
  "noLongRange": true,
  "cannonsOnly": false,
  "vtolOff": true,
}

structLimits = {
  "A0ResearchFacility": 4,
  "A0LightFactory": 4,
  "A0CyborgFactory": 4,
  "A0VTolFactory1": 4,
  "A0PowerGenerator": 5,
}

droidLimits = {
  [DROID_ANY]: 250,
  [DROID_COMMAND]: 10,
  [DROID_CONSTRUCT]: 15,
}

////////////////////////////////////////////////////////////////////////////////
}
