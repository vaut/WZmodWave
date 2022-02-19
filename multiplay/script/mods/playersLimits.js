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

}


function recalcLimits()
{
//TODO
}

