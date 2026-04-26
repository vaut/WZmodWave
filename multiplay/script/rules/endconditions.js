namespace("conditions_");

function conditions_eventGameInit() {
    queue("checkGameOver", 3*1000);
}

function checkGameOver() {
    // Call different functions depending on alliancesType
    const getAliveOrDead = isFFA() ? getAliveOrDeadPlayers : getAliveOrDeadTeams;
    const finalize       = isFFA() ? finalizePlayer        : finalizeTeam;

    // Check game over
    const { alive, dead } = getAliveOrDead();
    if (isGameOver(alive, dead)) {
        alive.forEach(x => finalize(x, true));
        dead.forEach(x => finalize(x, false));
        if (isSpectator(-1)) {
            gameOverMessage(false);
        }
    } else {
        queue("checkGameOver", 3*1000); // Check 3 seconds later
    }
}

function getAliveOrDeadPlayers() {
    const alive = [];
    const dead = [];
    for (let player = 0; player < maxPlayers; player++) {
        if (isAlive(player)) {
            alive.push(player);
        } else {
            dead.push(player);
        }
    }
    return { alive, dead };
}

function getAliveOrDeadTeams() {
    const alive = [];
    for (const [player, data] of playerData.entries()) {
        if (!alive.includes(data.team) && isAlive(player)) {
            alive.push(data.team);
        }
    }

    const dead = [];
    for (const [player, data] of playerData.entries()) {
        if (!alive.includes(data.team) && !dead.includes(data.team)) {
            dead.push(data.team);
        }
    }

    return { alive, dead };
}

/**
 * @param {number} player
 * @param {boolean} win
 */
function finalizePlayer(player, win) {
    if (player === selectedPlayer) {
        gameOverMessage(win);
    }
    if (!win && !isSpectator(player) && playerData[player].isHuman) {
        // should come after gameOverMessage() to ensure the proper gameOverMessage is displayed
        transformPlayerToSpectator(player);
    }
}

/**
 * @param {number} team
 * @param {boolean} win
 */
function finalizeTeam(team, win) {
    for (const [player, data] of playerData.entries()) {
        if (data.team == team) {
            finalizePlayer(player, win);
        }
    }
}

function isFFA() {
    return alliancesType == NO_ALLIANCES || alliancesType == ALLIANCES;
}

function isGameExpired() {
    return gameTimeLimit > 0 && gameTime > gameTimeLimit;
}

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
// Write custom end condition logic below                                     //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

function isAlive(player) {
    if (player === Wave.AI) {
        return Wave.current == null
            || Wave.current.isNotFinal
            || !Wave.current.isDoneLanding
            || countDroid(DROID_ANY, Wave.AI) > 0;
    }

    if (countDroid(DROID_ANY, Wave.AI) === 0) {
        return countDroid(DROID_ANY, player) > 0 || hasBase(player);
    } else {
        return countDroid(DROID_ANY, player) > 0 && hasBase(player);
    }
}

function isGameOver(alive, dead) {
    return alive.length <= 1 || isGameExpired();
}

function hasBase(player) {
    return enumStruct(player, FACTORY).some(f => f.status === BUILT)
        || enumStruct(player, CYBORG_FACTORY).some(f => f.status === BUILT)
        || enumStruct(player, VTOL_FACTORY).some(f => f.status === BUILT)
        || enumStruct(player, RESEARCH_LAB).some(f => f.status === BUILT);
}
