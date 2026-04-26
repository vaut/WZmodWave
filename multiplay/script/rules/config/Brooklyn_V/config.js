configjs = (
  time,       // current game time in seconds
  wave,       // current wave number (1, 2, 3, ...) where 0 = before any wave
  oils,       // current number of oils on the map
  difficulty, // 0.66, 1.00, 1.33, 1.66
) => {
////////////////////////////////////////////////////////////////////////////////

mapSize = wave ? 64 : 32
inWavePauseS = 0
afterWavePauseM = 2
wavePower = (0.00000001*time**3.05 + 0.2*time) * oils*difficulty**2 - 2000
transportHP = 0.0000002*time**3*difficulty**3 + 0.5*time*difficulty**3 + 15*oils*difficulty
transportCapacity = oils/2 * (1 - 0.0001*time)
transportFlyDistance = 0.000005*time**2
structDistance = 3

protectTimeM = 3
mapExpansionPattern = "north"
waveResearchDelayM = 3
waveRankTimeM = { "zero": 25, "hero": 70 }
waveResidual = Infinity
waveFinalMultiplier = 3
waveExpModifier = 0
playerExpModifier = 0
cyborgTransport = false
waterLanding = false
waterStructure = false
autoBase = true
updateLimits = true
infiniteWaves = true
structPower = {
  "REARM PAD": 0.001,
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
