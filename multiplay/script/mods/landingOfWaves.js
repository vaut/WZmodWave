const allTemplates = includeJSON("templates.json");
include("multiplay/script/lib.js");
const settings = includeJSON("settings.json");

const research = includeJSON("research.json");
// константы типы волн
const WAVETYPE = ["NORMAL", "ROYALTANK", "ROYALVTOL"];
const AI = scavengerPlayer; //num wawe AI
var redComponents = [];

namespace("wa_");


function setWaveDifficulty()
{
	game.waveDifficulty = (scavengers + 2) / 3; //general danger of waves 1, 1.33
}

//TODO remove
game.protectTime = settings.protectTimeM * 60; //time to first attack in seconds
game.pauseTime = settings.pauseTime * 60; //pause between attacks in seconds

function setNumOil()
{
	game.playnum = 0;
	for (let playnum = 0; playnum < maxPlayers; playnum++)
	{
		if (
			(playerData[playnum].isAI == true ||
        playerData[playnum].isHuman == true) &&
      enumStruct(playnum, HQ).length != 0
		)
		{
			game.playnum++;
		}
	}
	game.numOil = enumFeature(ALL_PLAYERS).filter(function (e)
	{
		if (e.stattype == OIL_RESOURCE) {return true;}
		return false;
	}).length;
	game.numOil += enumStruct(scavengerPlayer, RESOURCE_EXTRACTOR).length;
	for (let playnum = 0; playnum < maxPlayers; playnum++)
	{
		game.numOil += enumStruct(playnum, RESOURCE_EXTRACTOR).length;
	}
	if (game.numOil > 40 * game.playnum)
	{
		game.numOil = 40 * game.playnum;
	}
	//	debug("oil on map", game.numOil, "players", game.playnum);
}

var LZs = [];
function setLZs()
{
	let LZdefoult = {
		x: Math.ceil(mapWidth / 2),
		y: Math.ceil(mapHeight / 2),
		radius: 5,
	};

	let labels = enumLabels().map(function (label)
	{
		return getObject(label);
	});
	LZs = labels.map(function (label)
	{
		LZ = {
			x: Math.ceil((label.x + label.x2) / 2),
			y: Math.ceil((label.y + label.y2) / 2),
			radius: Math.ceil(Math.abs(label.x - label.x2) / 2),
		};
		return LZ;
	});

	if (LZs.length == 0)
	{
		LZs.push(LZdefoult);
	}
	LZs.forEach(function (LZ)
	{
		LZ.tiles = LZtile(LZ);
	});
}

function LZtile(LZ)
{
	const PLACE = "O"; //landing place
	const CLIFF = "X"; //impassable tile
	const POSS = "."; //landing is possible

	function isPassable(x, y)
	{
		//TODO добавить проверку есть ли тут объект
		return (
			terrainType(x, y) !== TER_CLIFFFACE && terrainType(x, y) !== TER_WATER
		);
	}

	function markAvailableTile(tiles)
	{
		let addPOSS = false;
		tiles.forEach(function O(row, x)
		{
			row.forEach(function M(tile, y)
			{
				if (tile == CLIFF)
				{
					return;
				}
				if (tile == PLACE)
				{
					return;
				}
				if (
					tile == POSS &&
          ((tiles[x - 1] && tiles[x - 1][y] == PLACE) ||
            (tiles[x + 1] && tiles[x + 1][y] == PLACE) ||
            tiles[x][y - 1] == PLACE ||
            tiles[x][y + 1] == PLACE)
				)
				{
					tiles[x][y] = PLACE;
					addPOSS = true;
				}
			});
		});
		//	debug(JSON.stringify(tiles));
		if (addPOSS)
		{
			markAvailableTile(tiles);
		} // TODO заменить на цикл
	}

	if (!isPassable(LZ.x, LZ.y))
	{
		return false;
	} // incorrect LZ
	let tiles = [];
	for (let x = LZ.x - LZ.radius; x <= LZ.x + LZ.radius; x++)
	{
		tiles[x] = [];
		for (let y = LZ.y - LZ.radius; y <= LZ.y + LZ.radius; y++)
		{
			if (isPassable(x, y))
			{
				tiles[x][y] = POSS;
			} // TODO add check radius
			else
			{
				tiles[x][y] = CLIFF;
			}
		}
	}
	tiles[LZ.x][LZ.y] = PLACE;
	markAvailableTile(tiles);
	//	debug(JSON.stringify(tiles));

	let LZtile = [];
	for (let x = LZ.x - LZ.radius; x <= LZ.x + LZ.radius; x++)
	{
		for (let y = LZ.y - LZ.radius; y <= LZ.y + LZ.radius; y++)
		{
			if (tiles[x][y] == PLACE)
			{
				LZtile.push({ x: x, y: y });
			}
		}
	}
	sortBymDist(LZtile, LZ);
	//	debug(JSON.stringify(LZtile));
	//TODO добавить фильтр занятых объектами клеток
	return LZtile;
}

function addSpoter()
{
	let spotter = {
		x: mapWidth / 2,
		y: mapHeight / 2,
		radius: (Math.sqrt(mapWidth * mapWidth + mapHeight * mapHeight) / 2) * 128,
	};
	for (let playnum = 0; playnum < maxPlayers; playnum++)
	{
		addSpotter(spotter.x, spotter.y, playnum, spotter.radius, 0, 1000);
	}
}

function createWave()
{
	let waves = [];
	WAVETYPE.forEach(function (type)
	{
		let pauseTime = settings[type].pauseTime;
		let count = settings.totalGameTime / pauseTime;
		for (let i = 1; i <= count; i++)
		{
			let timeS = pauseTime * i * 60;
			if (timeS < settings.protectTimeM * 60)
			{
				continue;
			}
			let budget = calcBudget(timeS + getStartTime());
			if (type == "ROYALTANK")
			{
				budget.budget *= 2;
			}
			if (type == "ROYALVTOL")
			{
				budget.budget *= 1.5;
			}
			waves.push({
				time: timeS,
				type: type,
				budget: budget.budget,
				rang: budget.rang,
				experience: budget.experience,
				droids: [],
			});
		}
	});
	waves.sort((a, b) =>
	{
		return a.time - b.time;
	});
	//	debug(JSON.stringify(waves));
	return waves;
	//	return ([{time:360, type: ROYALTANK, {...}])//example output
}

function calcBudget(timeS)
{
	let K = game.numOil * settings.Kpower;
	// Игрок по мере игры получает апы на ген, что проиводит к росуту доступных ресурсов.
	// При первом приблежении вторая производная энергии по времени прямая с увеличением в два раза за 20 минут.
	// Используем два способа компенсиовать одновременно.
	// Первый: бюджет зависит от квадрата времени

	let A = K / (settings.doublePowerM * 60);
	let budget = Math.round(
		((K * timeS + A * timeS ** 2) / 2) * game.waveDifficulty
	);
	//Второй: опытом. При первом приближении юниты усиливаются +11% за каждый ранг.
	//Опыт ограничен 16 рангом, вероятно. По этому делаем что бы к концу юниты были максимально злые.
	let rang = Math.round((14 / (settings.totalGameTime * 60)) * timeS);

	return { budget: budget, rang: rang, experience: Math.round(2 ** rang) };
}
function wa_eventGameInit()
{
	addSpoter();
	setNumOil();
	setLZs();
	setWaveDifficulty();
	game.listWaves = createWave();
	console(
		[
			"difficulty " + game.wavedifficulty,
			"protectTime " + game.protectTime,
			"PauseTime " + game.PauseTime,
		].join("\n")
	);
	setTimer("giveResearch", 60 * 1000);
	setTimer("schedulerLanding", 6 * 1000);
	setTimer("removeVtol", 11 * 1000);
	updateTimer();
	setMissionTime(game.protectTime);
	makeComponentAvailable("MG1Mk1", AI);
	setAlliance(scavengerPlayer, AI, true);
}

function removeVtol()
{
	/*
	game.listWaves
		.filter((wave) => {
			return wave.budget <= 0;
		})
		.forEach((wave) => {
      			debug("прибераем втол"); //TODO
		});
*/
	enumDroid(AI, "DROID_WEAPON")
		.filter((d) =>
		{
			return d.isVTOL && d.weapons[0].armed < 1;
		})
		.forEach((v) =>
		{
			removeObject(v);
		});
}

function updateTimer()
{
	if (game.listWaves[0].time - gameTime / 1000 <= 0)
	{
		queue("updateTimer", 1000);
		return;
	}
	//	debug(getMissionTime(), game.listWaves[0].time - gameTime / 1000);
	setMissionTime(game.listWaves[0].time - gameTime / 1000);
	queue("updateTimer", game.listWaves[0].time * 1000 - gameTime);
	console("next wave", game.listWaves[0].type);
}

function schedulerLanding()
{
	game.notProtectedWaves = game.listWaves.length;
	if (game.listWaves.length == 0)
	{
		return;
	}
	if (
		game.listWaves[0].budget <= 0
	//&& game.listWaves[0].droids.length == 0
	)
	{
		game.listWaves.shift();
		console("waves left ", game.listWaves.length);
		debug("waves left ", game.listWaves.length);
	}
	let queueLading = game.listWaves.filter((wave) =>
	{
		return wave.time <= gameTime / 1000 && !wave.war;
	});
	if (queueLading.length == 0)
	{
		return;
	}
	// делаем высадку
	let nowLading = queueLading[0];

	let extractor = 0;
	for (let playnum = 0; playnum < maxPlayers; playnum++)
	{
		extractor += enumStruct(playnum, RESOURCE_EXTRACTOR).length;
	}
	if (extractor == 0)
	{
		nowLading.type = "ROYALVTOL";
	}

	nowLading.templates = getTemplates(
		gameTime / 1000 + getStartTime(),
		nowLading.type
	);
	nowLading.LZ = LZs[syncRandom(LZs.length)];
	setDroidsName(nowLading);
	pushUnits(nowLading);

	debug("units landed", nowLading.droids.length, nowLading.type);
	console("units landed", nowLading.droids.length, nowLading.type);

	function getTemplates(timeS, type)
	{
		avalibleTemplate = [];
		redComponents = getRedComponents(timeS);
		for (var key in allTemplates)
		{
			if (!allTemplates[key].weapons)
			{
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
        ((type == "ROYALTANK" && allTemplates[key].propulsion == "tracked01") ||
          (type == "ROYALVTOL" && allTemplates[key].propulsion == "V-Tol") ||
          type == "NORMAL") &&
        allTemplates[key].weapons[0] != "CommandTurret1" &&
        allTemplates[key].weapons[0] != "MG1Mk1" &&
        !redComponents.includes(allTemplates[key].weapons[0])
			)
			{
				avalibleTemplate.push(key);
			}
		}
		if (avalibleTemplate.length == 0)
		{
			avalibleTemplate.push("ViperMG01Wheels");
		}
		return avalibleTemplate;

		function getRedComponents(timeS)
		{
			redComponents = [];
			for (var tech in allRes)
			{
				if (allRes[tech] <= timeS && research[tech].redComponents)
				{
					redComponents = redComponents.concat(research[tech].redComponents);
				}
			}
			return redComponents;
		}
	}
	function setDroidsName(nowLanding)
	{
		nowLading.droidsName = [];

		for (let i = 0; i < nowLading.LZ.tiles.length; i++)
		{
			let droidName =
        nowLanding.templates[syncRandom(nowLanding.templates.length)];
			nowLading.droidsName.push(droidName);
		}
	}

	function pushUnits(theLanding)
	{
		//		debug(JSON.stringify(theLanding));
		let tiles = Object.assign([], theLanding.LZ.tiles);
		//debug(JSON.stringify(tiles));
		hackNetOff();
		while (theLanding.budget > 0 && tiles.length > 0)
		{
			let droidName = theLanding.droidsName.shift();
			let pos = tiles.shift();
			if (allTemplates[droidName].propulsion == "V-Tol")
			{
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
			setDroidExperience(unit, theLanding.experience);
			theLanding.budget -= makeTemplate(
				AI,
				droidName,
				allTemplates[droidName].body,
				allTemplates[droidName].propulsion,
				"",
				allTemplates[droidName].weapons
			).power;
			theLanding.droids.push(unit);
			//			debug("add", droidName);
		}
		hackNetOn();
		playSound("pcv395.ogg", theLanding.LZ.x, theLanding.LZ.y, 0);
	}
}

function giveResearch()
{
	hackNetOff();
	completeResearchOnTime(game.totalTimeS, AI);
	hackNetOn();
}
