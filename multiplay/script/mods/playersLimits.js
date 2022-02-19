const defoultUnitsLimits =
{
	[DROID_ANY]: 150,
	[DROID_COMMAND]: 10,
	[DROID_CONSTRUCT]: 15
};

const defoultsStructLimit =
{
	"A0LightFactory": 5,
	"A0PowerGenerator": 8,
	"A0ResearchFacility": 5,
	"A0ComDroidControl": 1,
	"A0CyborgFactory": 5,
	"A0VTolFactory1": 5,
	"A0LasSatCommand": 1,
	"A0Sat-linkCentre": 1,
	"A0RepairCentre3": 3,
	"A0VtolPad": 50
};

const defoultNumOil = 40;

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
		players.push(playnum);
		if (isSpectator(playnum))
		{
			continue; // skip slots that start as spectators
		}
		if (!playerData[playnum].isHuman && !playerData[playnum].isAI)
		{
			// not an allocated slot (is closed or no player / AI)
			continue;
		}
	}
	const scrollLimits = getScrollLimits();
	const y = scrollLimits.y2-(scrollLimits.y2-scrollLimits.y)/2;
	const ConstructorDroid = {
		"body": "Body1REC",
		"turrets": "Spade1Mk1",
		"id": "ConstructorDroid",
		"name": "Truck",
		"propulsion": "wheeled01"
	};
	const numOil = getNumOil();
	const STRUCTS = ["A0CommandCentre","A0LightFactory","A0PowerGenerator","A0ResearchFacility"];
	players.forEach((p, index) =>
	{
		const x = ((mapWidth-(2*BORDER))/(players.length))*(index+0.5)+BORDER;
		const HQ = {x:x,y:y};
		const constructor = addDroid(p, HQ.x, HQ.y, ConstructorDroid.name, ConstructorDroid.body, ConstructorDroid.propulsion,"","", ConstructorDroid.turrets);
		STRUCTS.forEach((s) =>
		{
			const tile = pickStructLocation(constructor, s, HQ.x, HQ.y);
			addStructure(s, p, tile.x*128, tile.y*128);
		});
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
		players.push(playnum);
		if (isSpectator(playnum))
		{
			continue; // skip slots that start as spectators
		}
		if (!playerData[playnum].isHuman && !playerData[playnum].isAI)
		{
			// not an allocated slot (is closed or no player / AI)
			continue;
		}
	}
	const numOil = getNumOil();
	let K = (numOil+20)*1.25/players.length/defoultNumOil;
	if (K < 0.5) {K =0.5;}
	debug(K);
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
