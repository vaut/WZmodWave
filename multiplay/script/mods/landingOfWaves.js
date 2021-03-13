include ("multiplay/script/mods/templates.js");
include ("multiplay/script/lib.js");

namespace("wa_");

// Defining script variables
var AI;	//num wawe AI
for (var playnum = 0; playnum < maxPlayers; playnum++)
{
	if (playerData[playnum].isAI == true && playerData[playnum].name == "Wave")
	{
		AI = playnum;
	}
}
if (!AI) {console("ERROR \n not found WaveAI");}


var waveDifficulty = (playerData[AI].difficulty+1)/2;	//general danger of waves 0.5, 1, 1.5, 2


var protectTime = 5/waveDifficulty;	//time to first attack in minutes
var PauseTime = 2/waveDifficulty;	//pause between attacks in minutes

var startTime = getStartTime();
debug ("startTime", startTime);

var numOil=enumFeature(ALL_PLAYERS).filter(function(e){if(e.stattype == OIL_RESOURCE)return true;return false;}).length;
numOil += enumStruct(scavengerPlayer, RESOURCE_EXTRACTOR).length;
for (let playnum = 0; playnum < maxPlayers; playnum++)
{
	numOil += enumStruct(playnum, RESOURCE_EXTRACTOR).length;
}
debug ("oil on map", numOil);

var LZs = [];
var labels = enumLabels().map(function(label) {return getObject(label); });
LZs = labels.map(function(label){
	LZ = {
		x : Math.ceil((label.x+label.x2)/2),
		y : Math.ceil((label.y+label.y2)/2),
		radius : Math.ceil(Math.abs(label.x-label.x2)/2)
	};
	return LZ;
});

//TODO read LZ from map
var LZdefoult = {
	x : Math.ceil(mapWidth/2),
	y : Math.ceil(mapHeight/2),
	radius : 5
};

function calcBudget()
{

	let K = numOil/4;
	let totalTime = (gameTime+startTime)/1000; //время игры в секудах при старте с 0 базы
//	var budget = K*totalTime*waveDifficulty;
	//этого не достаточно, игрок по мере игры получает апы на ген, что проиводит к росуту доступных ресурсов.
	//при первом приблежении вторая производная энергии по времени прямая с увеличением в два раза за 15 минут.
	//по этому вот так
	let A = K/(20*60);
	let budget = (K*totalTime + A*totalTime*totalTime/2)*waveDifficulty;

	debug("budget", budget);
//	debug ("progressive bonuce", budget - K*totalTime*waveDifficulty );
	return budget;
}

///further logic of landing



function wa_eventGameInit()
{
	console (["difficulty "+ difficulty,"protectTime "+protectTime, "PauseTime "+PauseTime].join("\n"));
	setTimer("getResearch", 60*1000);
	queue("landing", protectTime*60*1000);
	setMissionTime(protectTime*60);
	makeComponentAvailable("MG1Mk1", AI);
	setAlliance(scavengerPlayer, AI, true);
	let spotter = {
		x: mapWidth/2,
		y: mapHeight/2,
		radius: Math.sqrt(mapWidth*mapWidth + mapHeight*mapHeight)/2*128
	};
	for (let playnum = 0; playnum < maxPlayers; playnum++)
	{
		addSpotter(spotter.x, spotter.y, playnum, spotter.radius, 0, 1000);
	}
	if (LZs.length == 0){
		LZs.push(LZdefoult);
	}
	LZs.forEach(function(LZ){LZ.tiles = setLZtile(LZ);});
}



var waveNum = 0;
var theLanding = {
	"LZ" : false,
	"budget" : 0,
	"units" : 0,
	"avalibleTemplate" : []
};


function landing()
{
	waveNum++;
	playSound("pcv381.ogg");
	if (gameTime/1000 < protectTime*60 ){return;}
	theLanding.avalibleTemplate = [];
	for (var key in allTemplates)
	{
		if (!allTemplates[key].weapons){continue;}
		if (makeTemplate(AI, key, allTemplates[key].body, allTemplates[key].propulsion, "", allTemplates[key].weapons) !== null && //у makeTemplate изменен синтаксис в мастере. Не совместимо с 3.4.1
		(allTemplates[key].propulsion != "wheeled01" && allTemplates[key].propulsion != "hover01" && allTemplates[key].weapons[0] !="CommandTurret1" && allTemplates[key].weapons[0] !="MG1Mk1"))
		{
			theLanding.avalibleTemplate.push(key);
		}
	}
	if (theLanding.avalibleTemplate.length <1){theLanding.avalibleTemplate.push("ViperMG01Wheels");}
	theLanding.budget = calcBudget();
	theLanding.units = 0;
	theLanding.LZ = LZs[syncRandom(LZs.length)];
	pushUnits();
	setMissionTime(PauseTime*60);
	queue("landing", PauseTime*60*1000);
}

function pushUnits()
{
	let tiles = Object.assign([], theLanding.LZ.tiles);
//debug(JSON.stringify(tiles));
	while (theLanding.budget > 0 && tiles.length > 0)
	{
		var droidName = theLanding.avalibleTemplate[syncRandom(theLanding.avalibleTemplate.length)];
		let pos = tiles.shift();
		if (allTemplates[droidName].propulsion == "V-Tol")
		{
			let borders = [ {x:2, y:pos.y}, {x:pos.x, y: 2}, {x:mapWidth-2, y:pos.y}, {x :pos.x, y:mapHeight-2}];
			sortBymDist(borders, pos);
//			debug (pos.x, pos.y);
			pos = borders.shift();
		}

		addDroid(AI, pos.x, pos.y, droidName, allTemplates[droidName].body, allTemplates[droidName].propulsion , "", "", allTemplates[droidName].weapons );
		theLanding.budget -= makeTemplate(AI, droidName, allTemplates[droidName].body, allTemplates[droidName].propulsion , "", allTemplates[droidName].weapons).power;
		theLanding.units++;
//		debug("add", droidName);
	}
	if (theLanding.budget > 0){queue("pushUnits", 6*1000); return;}
	debug("wave number", waveNum, "units landed", theLanding.units);
	console("wave number", waveNum, "units landed", theLanding.units);
	playSound("pcv395.ogg", theLanding.LZ.x, theLanding.LZ.y, 0);

}


function getResearch()
{
	hackNetOff();
	completeResearchOnTime((gameTime)/1000+startTime, AI);
	hackNetOn();
}

function getStartTime()
{
	const cleanTech = 1;
	const timeBaseTech = 4.5*60;		// after Power Module
	const timeAdvancedBaseTech = 7.9*60;	// after Mortar and Repair Facility
	const timeT2 = 17*60;
	const timeT3 = 26*60;			// after Needle Gun and Scourge Missile
	var startTime=1;
	var techLevel = getMultiTechLevel();
	if (baseType == CAMP_BASE){startTime = timeBaseTech;}
	if (baseType == CAMP_WALLS){startTime=timeAdvancedBaseTech;}
	if (techLevel == 2){startTime=timeT2;}
	if (techLevel == 3){startTime=timeT3;}
	if (techLevel == 4){startTime=100*60;}
	return startTime;
}

const PLACE = "O";	//landing place
const CLIFF = "X";	//impassable tile
const POSS = ".";	//landing is possible

function isPassable (x,y) {
	if (terrainType(x, y) == TER_CLIFFFACE || terrainType(x, y) == TER_WATER){return false;} //TODO добавить проверку есть ли тут объект
	return true;
}

function markAvailableTile(tiles)
{
	let addPOSS = false;
	tiles.forEach(function O(row, x){
		row.forEach(function M (tile, y){
 			if (tile == CLIFF){return;}
			if (tile == PLACE){return;}
			if (tile == POSS &&
			(
			(tiles[x-1] && tiles[x-1][y] ==  PLACE) ||
			(tiles[x+1] && tiles[x+1][y] ==  PLACE) ||
			tiles[x][y-1] ==  PLACE ||
			tiles[x][y+1] ==  PLACE))
			{
				tiles[x][y] = PLACE;
				addPOSS = true;
			}
		});
	});
//	debug(JSON.stringify(tiles));
	if (addPOSS){markAvailableTile(tiles);}// TODO заменить на цикл
}

function setLZtile(LZ)
{
	if (!isPassable(LZ.x, LZ.y)){return false;} // incorrect LZ
	let tiles = [];
	for (let x = LZ.x-LZ.radius; x <=  LZ.x+LZ.radius; x++)
	{
		tiles[x] = [];
		for (let y = LZ.y-LZ.radius; y <=  LZ.y+LZ.radius; y++)
		{
			if (isPassable(x,y)) {tiles[x][y] = POSS;} // TODO add check radius
			else {tiles[x][y] = CLIFF;}
		}
	}
	tiles[LZ.x][LZ.y] = PLACE;

	markAvailableTile(tiles);
//	debug(JSON.stringify(tiles));

	let LZtile = [];
	for (let x = LZ.x-LZ.radius; x <=  LZ.x+LZ.radius; x++)
	{
		for (let y = LZ.y-LZ.radius; y <=  LZ.y+LZ.radius; y++)
		{
			if (tiles[x][y] == PLACE)
			{
				LZtile.push({"x":x,"y":y});
			}
		}
	}
	sortBymDist(LZtile, LZ);
//	debug(JSON.stringify(LZtile));
	//TODO добавить фильтр занятых объектами клеток
	return LZtile;
}


