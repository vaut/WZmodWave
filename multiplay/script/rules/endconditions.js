function checkEndConditions() {
	if (game.listWaves == 0 ) {
		gameOverMessage(true);
		removeTimer("checkEndConditions");
	}
	if (enumPlayerObjects().length == 0) {
		gameOverMessage(false);
		removeTimer("checkEndConditions");
	}
}

function enumPlayerObjects() {
	let objects = [];
	for (let playnum = 0; playnum < maxPlayers; playnum++) {
		if (
			playnum == AI || allianceExistsBetween(playnum, AI)
		) {
			continue;
		}
		objects = objects.concat(enumStruct(playnum), enumDroid(playnum));
	}
	return objects;
}
