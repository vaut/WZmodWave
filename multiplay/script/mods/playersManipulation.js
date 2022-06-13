include("multiplay/script/lib.js");
const defoultUnitsLimits =
{
	[DROID_ANY]: 150,
	[DROID_COMMAND]: 10,
	[DROID_CONSTRUCT]: 15
};

const defoultsStructLimit =
{
	"A0LightFactory": 5,
	"A0PowerGenerator": 10,
	"A0ResearchFacility": 5,
	"A0ComDroidControl": 1,
	"A0CyborgFactory": 5,
	"A0VTolFactory1": 5,
	"A0LasSatCommand": 1,
	"A0Sat-linkCentre": 1,
	"A0RepairCentre3": 5,
	"A0VtolPad": 50
};

const defoultSTRUCTS = ["A0PowerGenerator","A0ResearchFacility","A0LightFactory"];
const defoultNumConstruct = 4;
const defoultNumOil = 40;

namespace("wa_players_");

function wa_players_eventGameInit()
{
	addSpoter();
	cleanUnitsAndStruct();
	queue("recalcLimits",100);
	queue("pushUnitsAndStruct",200);
	setTimer("recalcLimits", 30*1000);
}

function addSpoter()
{
	const x = mapWidth / 2;
	const y = mapHeight / 2;
	const radius = (Math.sqrt(mapWidth * mapWidth + mapHeight * mapHeight) / 2) * 128;
	for (let playnum = 0; playnum < maxPlayers; playnum++)
	{
		addSpotter(x, y, playnum, radius, 0, 1000);
	}
}


function cleanUnitsAndStruct()
{
	for (var playnum = 0; playnum < maxPlayers; playnum++)
	{
		enumStruct(playnum).forEach((s) =>
		{
			removeObject(s);
		});

		enumDroid(playnum).forEach((d) =>
		{
			removeObject(d);
		});

	}
}

function pushUnitsAndStruct()
{
	let players = [];
	for (var playnum = 0; playnum < maxPlayers; playnum++)
	{
		if (playnum == AI){continue;}
		if (isSpectator(playnum))
		{
			continue; // skip slots that start as spectators
		}
		if (!playerData[playnum].isHuman && !playerData[playnum].isAI)
		{
			// not an allocated slot (is closed or no player / AI)
			continue;
		}
		players.push(playnum);
	}
	players.sort((a,b)=> {return (playerData[a].position - playerData[b].position);});
	const scrollLimits = getScrollLimits();
	const y = mapWidth/2;
	const x = mapHeight/2;
	const ConstructorDroid = {
		"body": "Body1REC",
		"turrets": "Spade1Mk1",
		"id": "ConstructorDroid",
		"name": "Truck",
		"propulsion": "wheeled01"
	};
	const numOil = getNumOil();
	const K=(numOil)/players.length/defoultNumOil;
	const NumConstruct = Math.ceil(K*defoultNumConstruct);
	const NumStruct =  Math.ceil(K*5);
	const R=(scrollLimits.x2-scrollLimits.x)/3;
	players.forEach((p, index) =>
	{
		let constructor;
		const A = 2*Math.PI*index/players.length;
		const XP = (Math.sin(A)*R)+x;
		const YP = (Math.cos(A)*R)+y;
		const HQ = {x:XP,y:YP};
		if (me == p) {centreView(HQ.x, HQ.y);}
		for (let i = 0; i < NumConstruct; i++)
		{
			constructor = addDroid(p, HQ.x, HQ.y, ConstructorDroid.name, ConstructorDroid.body, ConstructorDroid.propulsion,"","", ConstructorDroid.turrets);
		}
		for (let i = 0; i < NumStruct; i++)
		{
			defoultSTRUCTS.forEach((s) =>
			{
				const tile = pickStructLocation(constructor, s, HQ.x, HQ.y);
				addStructure(s, p, tile.x*128, tile.y*128);
			});
		}
	});
	if (!isSpectator(-1))
	{


		queue("reticuleManufactureCheck");
		queue("reticuleResearchCheck");
		queue("reticuleBuildCheck");
		queue("reticuleDesignCheck");
	}
}

function recalcLimits()
{
	let players = [];
	for (var playnum = 0; playnum < maxPlayers; playnum++)
	{
		if (playnum == AI){continue;}
		if (isSpectator(playnum))
		{
			continue; // skip slots that start as spectators
		}
		if (!playerData[playnum].isHuman && !playerData[playnum].isAI)
		{
			// not an allocated slot (is closed or no player / AI)
			continue;
		}
		players.push(playnum);
	}
	const numOil = getNumOil();
	let K = (numOil+20)*1.1/players.length/defoultNumOil;
	if (K < 0.5) {K =0.5;}
	players.forEach((p, index) =>
	{

		for (var droidType in defoultUnitsLimits)
		{
			setDroidLimit(p, Math.ceil(defoultUnitsLimits[droidType]*K), droidType);
		}
		for (var struct in defoultsStructLimit)
		{
			setStructureLimits(struct, Math.ceil(defoultsStructLimit[struct]*K), p);
		}
	});
}
