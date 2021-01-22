include ("multiplay/script/templates.js");
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
for (var playnum = 0; playnum < maxPlayers; playnum++)
{
	numOil += enumStruct(playnum, RESOURCE_EXTRACTOR).length;
}
debug ("oil on map", numOil);

function calcBudget()
{

	let K = numOil/4;
	let totalTime = (gameTime+startTime)/1000; //время игры в секудах при старте с 0 базы
//	var budget = K*totalTime*waveDifficulty; 
	//этого не достаточно, игрок по мере игры получает апы на ген, что проиводит к росуту доступных ресурсов.
	//при первом приблежении вторая производная энергии по времени прямая с увеличением в два раза за 15 минут.
	//по этому вот так
	let A = K/(15*60);
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
	var spotter = {
		X: mapWidth/2,
		Y: mapHeight/2,
		radius: Math.sqrt(mapWidth*mapWidth + mapHeight*mapHeight)/2*128
	};
	for (var playnum = 0; playnum < maxPlayers; playnum++)
	{
		addSpotter(spotter.X, spotter.Y, playnum, spotter.radius, 0, 1000);
	}
	
}


var waveNam = 0;
function landing()
{
	waveNam++;
	playSound("pcv381.ogg");
	if (gameTime/1000 < protectTime*60 ){return;}
	var avalibleTemplate = [];
	for (var key in allTemplates)
	{
		if (!allTemplates[key].weapons){continue;}
		if (makeTemplate(AI, key, allTemplates[key].body, allTemplates[key].propulsion, "", allTemplates[key].weapons) !== null && //у makeTemplate изменен синтаксис в мастере. Не совместимо с 3.4.1
		(allTemplates[key].propulsion != "wheeled01" && allTemplates[key].propulsion != "hover01" && allTemplates[key].weapons[0] !="CommandTurret1" && allTemplates[key].weapons[0] !="MG1Mk1"))
		{
			avalibleTemplate.push(key);
		}
	}
	if (avalibleTemplate.length <1){avalibleTemplate.push("ViperMG01Wheels");}
	var budget = calcBudget();
	let units = 0; 
	while (budget >0)
	{
		var droidName = avalibleTemplate[syncRandom(avalibleTemplate.length)];
		X = mapWidth/2+syncRandom(1024)/128-4;
		Y = mapHeight/2+syncRandom(1024)/128-4;
		addDroid(AI, X, Y, droidName, allTemplates[droidName].body, allTemplates[droidName].propulsion , "", "", allTemplates[droidName].weapons );
		budget -= makeTemplate(AI, droidName, allTemplates[droidName].body, allTemplates[droidName].propulsion , "", allTemplates[droidName].weapons).power;
		units++;
//		debug("add", droidName);
	}
	debug("wave number", waveNam, "units landed", units);
	console("wave number", waveNam, "units landed", units);
	playSound("pcv395.ogg", X, Y, 0);
	setMissionTime(PauseTime*60);
	queue("landing", PauseTime*60*1000);
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
	if (baseType == CAMP_BASE){startTime = 1;}
	if (baseType == CAMP_WALLS){startTime=timeAdvancedBaseTech;}
	if (techLevel == 2){startTime=timeT2;}
	if (techLevel == 3){startTime=timeT3;}
	if (techLevel == 4){startTime=Infinity;}
	return startTime;
}
