const allTemplates = includeJSON("templates.json");
include("multiplay/script/lib.js");
include("multiplay/script/mods/playersLimits.js");
const settings = includeJSON("settings.json");

const research = includeJSON("research.json");
// константы типы волн
const WAVETYPE = ["NORMAL", "ROYAL"];
var wave = {time:0, active: false };
const BORDER = 4;

const {waveDifficulty, AI} =  getWaveAI(); //num wawe AI
var redComponents = [];
var zone = {x:0, y:(mapHeight-settings.startHeight), x2:mapWidth, y2:mapHeight };

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
settings.protectTimeM * 60; //time to first attack in seconds
settings.pauseM * 60; //pause between attacks in seconds

function avalibleScavComponents(player)
{

	const SCAV_COMPONENTS = [
		"B4body-sml-trike01",
		"B3body-sml-buggy01",
		"B2JeepBody",
		"BusBody",
		"FireBody",
		"B1BaBaPerson01",
		"BaBaProp",
		"BaBaLegs",
		"bTrikeMG",
		"BuggyMG",
		"BJeepMG",
		"BusCannon",
		"BabaFlame",
		"BaBaMG",
		"B2crane1",
		"scavCrane1",
		"B2crane2",
		"scavCrane2",
		"ScavSensor",
		"Helicopter",
		"B2RKJeepBody",
		"B2tractor",
		"B3bodyRKbuggy01",
		"HeavyChopper",
		"ScavCamperBody",
		"ScavengerChopper",
		"ScavIcevanBody",
		"ScavNEXUSbody",
		"ScavNEXUStrack",
		"ScavTruckBody",
		"MG1-VTOL-SCAVS",
		"Rocket-VTOL-Pod-SCAVS",
		"ScavNEXUSlink",
		"BaBaCannon",
		"BabaPitRocket",
		"BabaPitRocketAT",
		"BabaRocket",
		"BTowerMG",
		"Mortar1Mk1",
	];

	for (var i = 0, len = SCAV_COMPONENTS.length; i < len; ++i)
	{
		makeComponentAvailable(SCAV_COMPONENTS[i], player);
	}
}

function getLZ()
{
	let limits = getScrollLimits();
	const radius = 4;
	let LZ= {
		x: syncRandom(limits.x2-2*(BORDER+radius))+BORDER+radius,
		y: limits.y + BORDER + radius,
		radius: radius,
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

function newWave()
{
	zone.y -= settings.expansion;
	if (zone.y <0)
	{
		zone.y =0;
	}
	setScrollLimits(zone.x, zone.y, zone.x2, zone.y2);
	giveResearch();
	recalcLimits();
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
		((K * timeS + A * timeS ** 2) / 2) * waveDifficulty
	);
	//Второй: опытом. При первом приближении юниты усиливаются +11% за каждый ранг.
	//Опыт ограничен 16 рангом, вероятно. По этому делаем что бы к концу юниты были максимально злые.
	let rang = Math.round((14 / (settings.totalGameTime * 60)) * timeS);
	return { budget: budget, rang: rang, experience: Math.round(2 ** rang) };
}

function wa_eventGameInit()
{
	addSpoter();
	setScrollLimits(zone.x, zone.y, zone.x2, zone.y2);
	console(
		[
			"difficulty " + waveDifficulty,
			"protectTime " + settings.protectTime,
			"PauseTime " + settings.PauseTime,
		].join("\n")
	);
	cleanUnitsAndStruct();
	queue("pushUnitsAndStruct");
	setTimer("scheduler", 6 * 1000);
	scheduler();
	setTimer("removeVtol", 11 * 1000);
	setMissionTime(settings.protectTimeM*60);
	makeComponentAvailable("MG1Mk1", AI);
	avalibleScavComponents(AI);
}

function recalcLimits()
{
//TODO
}


function removeVtol()
{
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
}

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
	}
	hackNetOn();
	if (wave.budget <= 0)
	{
		debug("units landed", wave.droids.length, wave.type);
		console("units landed", wave.droids.length, wave.type);
		setMissionTime(-1);
	}
	playSound("pcv395.ogg", wave.LZ.x, wave.LZ.y, 0);
}


function giveResearch()
{
	hackNetOff();
	completeResearchOnTime(getTotalTimeS(), AI);
	hackNetOn();
}
