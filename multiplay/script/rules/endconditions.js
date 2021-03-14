function checkEndConditions() {
	if (gameTime >= 2 * 60 * 60 * 1000) {
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
			playerData[playnum].isAI == true &&
      playerData[playnum].name == "Wave"
		) {
			continue;
		}
		objects = objects.concat(enumStruct(playnum), enumDroid(playnum));
	}
	return objects;
}
