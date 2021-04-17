namespace("rp_");
var extendedPlayerData = [];
var attacker = [];

function dumpBattle(full = false) {
	if (playerData[selectedPlayer].position < maxPlayers - 1) {
		return;
	}
	for (let playnum = 0; playnum < maxPlayers; playnum++) {
		if (playnum === selectedPlayer || playerData[playnum].name === "") {
			continue;
		}
		playerData[playnum].droid = enumDroid(playnum).length;
		playerData[playnum].struct = enumStruct(playnum).length;
		playerData[playnum].power = playerPower(playnum);
	}
	if (full === false) {
		debug(
			"__REPORT__" +
        JSON.stringify({
        	gameTime: gameTime,
        	playerData: playerData,
        	game: game,
        }) +
        "__ENDREPORT__"
		);
	} else {
		debug(
			"__REPORT__" +
        JSON.stringify({
        	gameTime: gameTime,
        	playerData: playerData,
        	extendedPlayerData: extendedPlayerData,
        	game: game,
        }) +
        "__ENDREPORT__"
		);
	}
}
/*
function spam() {
	chat(ALLIES, "This is an automatic ranking system.");
	chat(
		ALLIES,
		"Host is not a human. Game results with research logs and in-game profiles will be published on the"
	);
	chat(ALLIES, "Autorating website: http://bruh.software/wz.");
	chat(ALLIES, "Visit the about page for detailed info about this system.");
	chat(ALLIES, "Feel free to contact us, all feedback is welcomed.");
}
*/

function rp_eventGameInit() {
	for (let playnum = 0; playnum < maxPlayers; playnum++) {
		playerData[playnum].droidLost = 0;
		playerData[playnum].droidLoss = 0;
		playerData[playnum].structureLost = 0;
		playerData[playnum].kills = 0;
		playerData[playnum].droidBuilt = 0;
		playerData[playnum].structBuilt = 0;
		playerData[playnum].droid = 0;
		playerData[playnum].struct = 0;
		playerData[playnum].researchComplite = 0;
		playerData[playnum].power = 0;
		playerData[playnum].playnum = playnum;
		extendedPlayerData[playnum] = {
			researchComplite: [],
			droidBuilt: [],
			structBuilt: [],
		};
		attacker[playnum] = [];
		attacker[playnum].droid = [];
	}
	attacker[scavengerPlayer] = [];
	attacker[scavengerPlayer].droid = [];
	setTimer("dumpBattle", 20000);
	game.version = version;
	game.mapName = mapName;
	game.baseType = baseType;
	game.alliancesType = alliancesType;
	game.powerType = powerType;
	game.scavengers = scavengers;
	game.multiTechLevel = getMultiTechLevel();
  //	spam();
  //	queue("spam", 30 * 1000);
}

function rp_eventDestroyed(victim) {
  //	console("dest:"+victim.player);
	if (victim.player == scavengerPlayer) {
		return;
	}
	if (victim.type == DROID && attacker[victim.player].droid[victim.id]) {
		if (attacker[victim.player].droid[victim.id] == scavengerPlayer) {
			playerData[victim.player].droidLoss++;
		} else {
			playerData[victim.player].droidLost++;
			playerData[attacker[victim.player].droid[victim.id]].kills++;
		}
	}
	if (victim.type == STRUCTURE) {
		playerData[victim.player].structureLost++;
	}
}

function rp_eventAttacked(victimObj, attackerObj) {
  //	console("attack:"+attackerObj.player+"->"+victimObj.player);
	if (victimObj.type == DROID) {
		{
			attacker[victimObj.player].droid[victimObj.id] = attackerObj.player;
		}
	}
}

function rp_eventDroidBuilt(droid) {
	playerData[droid.player].droidBuilt++;
	extendedPlayerData[droid.player].droidBuilt.push({
		droidType: droid.droidType,
		body: droid.body,
		propulsion: droid.propulsion,
		weapons: droid.weapons,
		time: gameTime,
		player: droid.player,
		playerName: playerData[droid.player].name,
		position: playerData[droid.player].position
	});
}

function rp_eventStructureBuilt(struct) {
	playerData[struct.player].structBuilt++;
	extendedPlayerData[struct.player].structBuilt.push({
		name: struct.name,
		time: gameTime,
		player: struct.player,
		pos: {x: struct.x, y:struct.y},
		playerName: playerData[struct.player].name,
		position: playerData[struct.player].position

	});
}

function rp_eventResearched(research, structure, player) {
	playerData[player].researchComplite++;
	extendedPlayerData[player].researchComplite.push({
		name: research.name,
		time: gameTime,
		player: player,
		playerName: playerData[player].name,
		position: playerData[player].position

	});
}
