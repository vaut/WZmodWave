function checkEndConditions() {
	if (game.listWaves.length === 0 && enumDroid(AI).length === 0) {
		gameOverMessage(true);
		removeTimer("checkEndConditions");
	}
	if (!playerHaveObjects()) {
		gameOverMessage(false);
		removeTimer("checkEndConditions");
	}
}

function playerHaveObjects() {
	let objects = [];
	for (let playnum = 0; playnum < maxPlayers; playnum++) {
		if (playnum == AI || allianceExistsBetween(playnum, AI)) {
			continue;
		}
		if (enumStruct(playnum).length !== 0) {
			return true;
		}
		if (enumDroid(playnum).length !== 0) {
			return true;
		}
	}
	return false;
}
