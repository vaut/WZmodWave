configjs = (
  time,       // current game time in seconds
  wave,       // current wave number (1, 2, 3, ...) where 0 = before any wave
  oils,       // current number of oils on the map
  difficulty, // 0.66, 1.00, 1.33, 1.66
) => {
////////////////////////////////////////////////////////////////////////////////

mapSize = 35 + 4*wave
inWavePauseS = 9 - 1*wave
afterWavePauseM = 0.1*wave + 0.8
wavePower = (0.00000001*time**3.05 + 0.2*time) * oils*difficulty**2
transportHP = 0.00000015*time**3 + 0.5*time*difficulty**2 + 15*oils*difficulty
transportCapacity = oils/2 * (1 - 0.0001*time)
transportFlyDistance = mapSize*0.0000004*time**1.8
structDistance = 2

protectTimeM = 3
mapExpansionPattern = "auto"
waveResearchDelayM = 3
waveRankTimeM = { "zero": 25, "hero": 70 }
waveResidual = 0.03 // Start the next wave when < 3% enemy units remain
waveFinalMultiplier = 3
waveExpModifier = 100
playerExpModifier = 100
cyborgTransport = false
waterLanding = false
waterStructure = false
autoBase = true
updateLimits = true
infiniteWaves = true
structPower = {
  "DEFENSE":  0.21,
  "REARM PAD": 0.02,
}

waveUnits = {
  "hoverFlame": false,
  "strongHover": false,
  "lateTracks": false,
  "noT4halftracks": true,
  "noSnails": true,
  "noLongRange": false,
  "cannonsOnly": false,
  "vtolOff": false,
}

////////////////////////////////////////////////////////////////////////////////
}
