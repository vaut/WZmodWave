configjs = (
  time,       // current game time in seconds
  wave,       // current wave number (1, 2, 3, ...) where 0 = before any wave
  oils,       // current number of oils on the map
  difficulty, // 0.66, 1.00, 1.33, 1.66
) => {
////////////////////////////////////////////////////////////////////////////////

mapSize = 50 + 4*wave
inWavePauseS = 9 - 1*wave
afterWavePauseM = 0.1*wave + 0.8
wavePower = (0.11*oils*time + 0.50/10000*oils*time**2 + 100) * difficulty
transportHP = 0.012**time + 0.33*time + 2000
transportCapacity = 40
transportFlyDistance = 1*wave
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
  "DEFENSE":  0.31,
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
