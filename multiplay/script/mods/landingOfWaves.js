const allTemplates = includeJSON("templates.json");
include("multiplay/script/lib.js");
const settings = includeJSON("settings.json");

const research = includeJSON("research.json");
// константы типы волн
const WAVETYPE = ["NORMAL", "ROYALTANK", "ROYALVTOL"];
var wave = {time:0, active: false };


const {waveDifficulty, AI} =  getWaveAI(); //num wawe AI
game.waveDifficulty = waveDifficulty;
var redComponents = [];
const scroll = {
	zone: {x:0 ,y:mapHeight-35 ,x2:mapWidth ,y2:mapHeight },
	incriment:10
};

namespace("wa_");

function getWaveAI()
{
	let AI = false;
	let waveDifficulty = 1;
	// Defining script variables
	if (scavengers != 0)
	{
		AI = scavengerPlayer;
		waveDifficulty = (scavengers + 2) / 3; //general danger of waves 1, 1.33

	}
	else
	{
		for (var playnum = 0; playnum < maxPlayers; playnum++)
		{
			if (
				playerData[playnum].isAI == true &&
      playerData[playnum].name == "Wave"
			)
			{
				AI = playnum;
				waveDifficulty = (playerData[AI].difficulty + 2) / 3; //general danger of waves 0.66, 1, 1.33, 1.6
			}
		}
	}
	return {AI:AI, waveDifficulty: waveDifficulty};
}

//TODO remove
game.protectTime = settings.protectTimeM * 60; //time to first attack in seconds
game.pauseTime = settings.pauseM * 60; //pause between attacks in seconds

function inScrollLimits(obj,limits)
{
	if (obj.x > limits.x+4 && obj.x < limits.x2-4 && obj.y > limits.y+4 && obj.y < limits.y2-4)
	{
		return true;
	}
	return false;
}

function getNumOil()
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
	limits =  getScrollLimits();
	numOil = enumFeature(ALL_PLAYERS).filter(function (e)
	{
		if (e.stattype == OIL_RESOURCE && inScrollLimits(e,limits)) {return true;}
		return false;
	}).length;
	numOil += enumStruct(scavengerPlayer, RESOURCE_EXTRACTOR).length;
	for (let playnum = 0; playnum < maxPlayers; playnum++)
	{
		numOil += enumStruct(playnum, RESOURCE_EXTRACTOR).length;
	}
	if (numOil > 40 * game.playnum)
	{
		numOil = 40 * game.playnum;
	}
	return numOil;
	//	debug("oil on map", game.numOil, "players", game.playnum);
}

function getLZ()
{
	let limits = getScrollLimits();
	let LZ= {
		x: syncRandom(limits.x2-16)+8,
		y: limits.y + 8,
		radius: 4,
	};
	LZ.tiles = LZtile(LZ);
	return LZ;
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
		if (addPOSS)
		{
			markAvailableTile(tiles);
		} // TODO заменить на цикл
	}

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
	if (isPassable(LZ.x, LZ.y))
	{
		tiles[LZ.x][LZ.y] = PLACE;
	}
	else
	{
		var naruto = [];
		tiles.forEach((Xs, x) =>
		{
			Xs.forEach((Ys,y) =>
			{
				if (isPassable(x, y))
				{
					let sq = {x: x, y:y};
					naruto.push(sq);
				}
			});
		});
		sortBymDist(naruto, LZ);
		const first = naruto.shift();
		tiles[first.x][first.y] = PLACE;
	}

	markAvailableTile(tiles);

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
/*
function createWaves()
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
*/

function newWave()
{
	let zone =  scroll.zone;
	zone.y -= 10; //TODO убрать константу в настройки
	setScrollLimits(zone.x, zone.y, zone.x2, zone.y2);
	giveResearch();
	let budget = calcBudget(gameTime/1000 + getStartTime());
	wave= {
		type: "NORMAL",
		budget: budget.budget,
		rang: budget.rang,
		experience: budget.experience,
		droids: [],
		active:true,
		time:0
	};

}


function calcBudget(timeS)
{
	timeS = timeS - settings.protectTimeM*60/3;
	let K = getNumOil() * settings.Kpower;
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
	const zone =  scroll.zone;
	setScrollLimits(zone.x, zone.y, zone.x2, zone.y2);
	console(
		[
			"difficulty " + game.wavedifficulty,
			"protectTime " + game.protectTime,
			"PauseTime " + game.PauseTime,
		].join("\n")
	);
	setTimer("scheduler", 6 * 1000);
	scheduler();
	setTimer("removeVtol", 11 * 1000);
	setMissionTime(game.protectTime);
	makeComponentAvailable("MG1Mk1", AI);
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

function scheduler()
{
	if (settings.protectTimeM *60 > gameTime / 1000)
	{
		return;
	}
	wave.droids = enumDroid(AI, "DROID_WEAPON");
	if (wave.droids.length == 0 && wave.active == true)
	{
		wave.time = gameTime/1000 + settings.pauseM * 60;
		setMissionTime(settings.pauseM*60);
		wave.active = false;
	}
 	if (wave.time <= gameTime/1000)
	{
		if (wave.active == false)
		{
			newWave();
		}
		landing();
	}
}

function landing()
{
	if (wave.budget <= 0)
	{
		return;
	}
	// делаем высадку
	wave.templates = getTemplates(
		gameTime / 1000 + getStartTime(),
		wave.type
	);
	wave.LZ = getLZ();
	setDroidsName();
	pushUnits();

	debug("units landed", wave.droids.length, wave.type);
	console("units landed", wave.droids.length, wave.type);

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
	function setDroidsName()
	{
		wave.droidsName = [];

		for (let i = 0; i < wave.LZ.tiles.length; i++)
		{
			let droidName =
        wave.templates[syncRandom(wave.templates.length)];
			wave.droidsName.push(droidName);
		}
	}

	function pushUnits()
	{
		//		debug(JSON.stringify(wave));
		let tiles = Object.assign([], wave.LZ.tiles);
		hackNetOff();
		while (wave.budget > 0 && tiles.length > 0)
		{
			let droidName = wave.droidsName.shift();
			let pos = tiles.shift();
			/*
			if (allTemplates[droidName].propulsion == "V-Tol")
			{
				let borders = [
					{ x: 2, y: pos.y },
					{ x: pos.x, y: 2 },
					{ x: mapWidth - 2, y: pos.y },
					{ x: pos.x, y: mapHeight - 2 },
				];
				sortBymDist(borders, pos);
				pos = borders.shift();
			}
*/
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
			setDroidExperience(unit, wave.experience);
			wave.budget -= makeTemplate(
				AI,
				droidName,
				allTemplates[droidName].body,
				allTemplates[droidName].propulsion,
				"",
				allTemplates[droidName].weapons
			).power;
			wave.droids.push(unit);
			//			debug("add", droidName);
		}
		hackNetOn();
		playSound("pcv395.ogg", wave.LZ.x, wave.LZ.y, 0);
	}
}

function giveResearch()
{
	hackNetOff();
	completeResearchOnTime(game.totalTimeS, AI);
	hackNetOn();
}
