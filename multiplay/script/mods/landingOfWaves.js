const allTemplates = includeJSON("templates.json");
include("multiplay/script/lib.js");
include("multiplay/script/mods/report.js");
const settings = includeJSON("settings.json");

const research = includeJSON("research.json");

namespace("wa_");

// Defining script variables
var AI; //num wawe AI
for (var playnum = 0; playnum < maxPlayers; playnum++) {
	if (playerData[playnum].isAI == true && playerData[playnum].name == "Wave") {
		AI = playnum;
	}
}
if (!AI) {
	console("ERROR \n not found WaveAI");
}

game.waveDifficulty = (playerData[AI].difficulty + 2) / 3; //general danger of waves 0.66, 1, 1.33, 1.6

game.protectTime = Math.ceil(( settings.protectTimeM * 60)); //time to first attack in seconds
game.pauseTime = Math.ceil((settings.pauseTime * 60) / game.waveDifficulty); //pause between attacks in seconds

//debug("startTime", game.totalTimeS);

var numOil = enumFeature(ALL_PLAYERS).filter(function (e) {
	if (e.stattype == OIL_RESOURCE) return true;
	return false;
}).length;
numOil += enumStruct(scavengerPlayer, RESOURCE_EXTRACTOR).length;
for (let playnum = 0; playnum < maxPlayers; playnum++) {
	numOil += enumStruct(playnum, RESOURCE_EXTRACTOR).length;
}
debug("oil on map", numOil);

var LZs = [];
var labels = enumLabels().map(function (label) {
	return getObject(label);
});
LZs = labels.map(function (label) {
	LZ = {
		x: Math.ceil((label.x + label.x2) / 2),
		y: Math.ceil((label.y + label.y2) / 2),
		radius: Math.ceil(Math.abs(label.x - label.x2) / 2),
	};
	return LZ;
});

//TODO read
var LZdefoult = {
	x: Math.ceil(mapWidth / 2),
	y: Math.ceil(mapHeight / 2),
	radius: 5,
};

function calcBudget() {
	let K = numOil * settings.Kpower;
  //	var budget = K*totalTime*waveDifficulty;

  //этого не достаточно, игрок по мере игры получает апы на ген, что проиводит к росуту доступных ресурсов.
  //при первом приблежении вторая производная энергии по времени прямая с увеличением в два раза за 20 минут.

  // используем два подхода одновременноэто бюджет зависит от квадрата времени:

	let A = K / (settings.doublePowerM * 60);
	let budget = Math.round(
		((K * game.totalTimeS + A * game.totalTimeS ** 2) / 2) * game.waveDifficulty
	);
  //но юнитов на поздних этапах выходит слишком много, по этому вторую часть компенсируем опытом
  //опыт усливает при первом приближении +11% за каждый ранг.
  //опыт для достижения ранга требуется экспоненцициально решив уравнение 2**(k*t)=boost
  //получаем k=0.04
	let experience = Math.round(2 ** ((7 / (settings.doubleEXPM * 60)) * game.totalTimeS));
  //	debug("budget", budget, "experience", experience);
	game.lastWaveBudget = budget;
	game.lastWaveExperience = experience;
	return { budget: budget, experience: experience };
}

///further logic of landing

function wa_eventGameInit() {
	console(
		[
			"difficulty " + game.wavedifficulty,
			"protectTime " + game.protectTime,
			"PauseTime " + game.PauseTime,
		].join("\n")
	);
	setTimer("giveResearch", 60 * 1000);
	queue("landing", game.protectTime * 1000);
	setMissionTime(game.protectTime);
	makeComponentAvailable("MG1Mk1", AI);
	setAlliance(scavengerPlayer, AI, true);
	let spotter = {
		x: mapWidth / 2,
		y: mapHeight / 2,
		radius: (Math.sqrt(mapWidth * mapWidth + mapHeight * mapHeight) / 2) * 128,
	};
	for (let playnum = 0; playnum < maxPlayers; playnum++) {
		addSpotter(spotter.x, spotter.y, playnum, spotter.radius, 0, 1000);
	}
	if (LZs.length == 0) {
		LZs.push(LZdefoult);
	}
	LZs.forEach(function (LZ) {
		LZ.tiles = setLZtile(LZ);
	});
}

game.waveNum = 0;
var theLanding = {
	LZ: false,
	budget: 0,
	units: 0,
	avalibleTemplate: [],
};

function landing() {
	game.waveNum++;
	playSound("pcv381.ogg");
	if (gameTime / 1000 < game.protectTime) {
		return;
	}
	theLanding.avalibleTemplate = [];
	for (var key in allTemplates) {
		if (!allTemplates[key].weapons) {
			continue;
		}
		if (
			makeTemplate(
				AI,
				key,
				allTemplates[key].body,
				allTemplates[key].propulsion,
				"",
				allTemplates[key].weapons
			) !== null && //у makeTemplate изменен синтаксис в мастере. Не совместимо с 3.4.1
      allTemplates[key].propulsion != "wheeled01" &&
      //      allTemplates[key].propulsion != "hover01" &&
      allTemplates[key].weapons[0] != "CommandTurret1" &&
      allTemplates[key].weapons[0] != "MG1Mk1" &&
      !redComponents.includes(allTemplates[key].weapons[0])
		) {
			theLanding.avalibleTemplate.push(key);
		}
	}
	if (theLanding.avalibleTemplate.length < 1) {
		theLanding.avalibleTemplate.push("ViperMG01Wheels");
	}
	theLanding.budget = calcBudget().budget;
	theLanding.experience = calcBudget().experience;
	theLanding.units = 0;
	theLanding.LZ = LZs[syncRandom(LZs.length)];
	pushUnits();
}

function pushUnits() {
	let tiles = Object.assign([], theLanding.LZ.tiles);
  //debug(JSON.stringify(tiles));
	while (theLanding.budget > 0 && tiles.length > 0) {
		var droidName =
      theLanding.avalibleTemplate[
      	syncRandom(theLanding.avalibleTemplate.length)
      ];
		let pos = tiles.shift();
		if (allTemplates[droidName].propulsion == "V-Tol") {
			let borders = [
				{ x: 2, y: pos.y },
				{ x: pos.x, y: 2 },
				{ x: mapWidth - 2, y: pos.y },
				{ x: pos.x, y: mapHeight - 2 },
			];
			sortBymDist(borders, pos);
      //			debug (pos.x, pos.y);
			pos = borders.shift();
		}

		let unit = addDroid(
			AI,
			pos.x,
			pos.y,
			droidName,
			allTemplates[droidName].body,
			allTemplates[droidName].propulsion,
			"",
			"",
			allTemplates[droidName].weapons
		);
		setDroidExperience(unit, Math.round(theLanding.experience));
		theLanding.budget -= makeTemplate(
			AI,
			droidName,
			allTemplates[droidName].body,
			allTemplates[droidName].propulsion,
			"",
			allTemplates[droidName].weapons
		).power;
		theLanding.units++;
    //		debug("add", droidName);
	}
	playSound("pcv395.ogg", theLanding.LZ.x, theLanding.LZ.y, 0);
	if (theLanding.budget > 0) {
		queue("pushUnits", 6 * 1000);
		return;
	}
	debug("wave number", game.waveNum, "units landed", theLanding.units);
	console("wave number", game.waveNum, "units landed", theLanding.units);
	setMissionTime(game.pauseTime);
	queue("landing", game.pauseTime * 1000);
}
var redComponents = [];

function giveResearch() {
	hackNetOff();
	completeResearchOnTime(game.totalTimeS, AI);
	hackNetOn();
	updateRedComponents();
}

function updateRedComponents() {
	redComponents = [];
	for (var tech in allRes) {
		if (allRes[tech] <= game.totalTimeS && research[tech].redComponents) {
			redComponents = redComponents.concat(research[tech].redComponents);
		}
	}
}

const PLACE = "O"; //landing place
const CLIFF = "X"; //impassable tile
const POSS = "."; //landing is possible

function isPassable(x, y) {
	if (terrainType(x, y) == TER_CLIFFFACE || terrainType(x, y) == TER_WATER) {
		return false;
	} //TODO добавить проверку есть ли тут объект
	return true;
}

function markAvailableTile(tiles) {
	let addPOSS = false;
	tiles.forEach(function O(row, x) {
		row.forEach(function M(tile, y) {
			if (tile == CLIFF) {
				return;
			}
			if (tile == PLACE) {
				return;
			}
			if (
				tile == POSS &&
        ((tiles[x - 1] && tiles[x - 1][y] == PLACE) ||
          (tiles[x + 1] && tiles[x + 1][y] == PLACE) ||
          tiles[x][y - 1] == PLACE ||
          tiles[x][y + 1] == PLACE)
			) {
				tiles[x][y] = PLACE;
				addPOSS = true;
			}
		});
	});
  //	debug(JSON.stringify(tiles));
	if (addPOSS) {
		markAvailableTile(tiles);
	} // TODO заменить на цикл
}

function setLZtile(LZ) {
	if (!isPassable(LZ.x, LZ.y)) {
		return false;
	} // incorrect LZ
	let tiles = [];
	for (let x = LZ.x - LZ.radius; x <= LZ.x + LZ.radius; x++) {
		tiles[x] = [];
		for (let y = LZ.y - LZ.radius; y <= LZ.y + LZ.radius; y++) {
			if (isPassable(x, y)) {
				tiles[x][y] = POSS;
			} // TODO add check radius
			else {
				tiles[x][y] = CLIFF;
			}
		}
	}
	tiles[LZ.x][LZ.y] = PLACE;

	markAvailableTile(tiles);
  //	debug(JSON.stringify(tiles));

	let LZtile = [];
	for (let x = LZ.x - LZ.radius; x <= LZ.x + LZ.radius; x++) {
		for (let y = LZ.y - LZ.radius; y <= LZ.y + LZ.radius; y++) {
			if (tiles[x][y] == PLACE) {
				LZtile.push({ x: x, y: y });
			}
		}
	}
	sortBymDist(LZtile, LZ);
  //	debug(JSON.stringify(LZtile));
  //TODO добавить фильтр занятых объектами клеток
	return LZtile;
}
