/**
 * Remove all droids and structures
 */
function cleanAllUnitsAndStruct()
{
	for (let player = 0; player < maxPlayers; player++)
	{
		cleanUnitsAndStruct(player);
	}
}

/**
 * Remove all droids and structures belonging to the player
 * @param {number} player
 */
function cleanUnitsAndStruct(player)
{
	enumDroid(player).forEach(d => removeObject(d));
	enumStruct(player).forEach(s => removeObject(s));
}

/**
 * @param {number} x
 * @param {number} y
 */
function *iterateSpiral(x, y)
{
	let step = 1;
	while (true)
	{
		for (let i = 0; i < step; i++)
		{
			yield [x++, y];
			if (x >= mapWidth) return;
		}
		for (let i = 0; i < step; i++)
		{
			yield [x, y++]; // down
			if (y >= mapHeight) return;
		}
		step++;
		for (let i = 0; i < step; i++)
		{
			yield [x--, y]; // left
			if (x < 0) return;
		}
		for (let i = 0; i < step; i++)
		{
			yield [x, y--]; // up
			if (y < 0) return;
		}
		step++;
	}
}

function shuffle(array)
{
	for (let i = array.length - 1; i > 0; i--)
	{
		const j = syncRandom(i + 1);
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

function BFS(sx, sy, {
	canVisit  = null, // canVisit(x, y) -> boolean
	onVisit   = null, // onVisit(x, y)
	maxVisits = null, // maximum number of visits
	shape     = null, // [0, 100]. 25 is roughly circular
	stop      = null, // stop() -> boolean
} = {})
{
	const CARDINALS = [[0, 1], [1, 0], [0, -1], [-1, 0]];
	const ORDINALS = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

	const seen = new Set();
	const queue = [];

	const addToQueue = (x, y) =>
	{
		if (!seen.has(`${x},${y}`))
		{
			seen.add(`${x},${y}`);
			queue.push([x, y]);
		}
	}

	addToQueue(sx, sy);

	let numVisits = 0;
	while (queue.length > 0)
	{
		const [x, y] = queue.shift();
		if (canVisit == null || canVisit(x, y))
		{
			onVisit?.(x, y);
			numVisits++;
			if (numVisits == maxVisits || stop?.())
			{
				return numVisits;
			}
			for (const [dx, dy] of CARDINALS)
			{
				addToQueue(x+dx, y+dy);
			}
			if (shape)
			{
				for (const [dx, dy] of ORDINALS)
				{
					if (syncRandom(100) < shape)
					{
						addToQueue(x+dx, y+dy);
					}
				}
			}
		}
	}
	return numVisits;
}

/**
 * @returns {number} current gameTime in seconds
 */
function gameTimeS()
{
	return Math.floor(gameTime / 1000);
}

/**
 * Make every component available to the given player.
 * This means the player can actually build designs with it.
 *
 * @param {number} player
 */
function makeEverythingAvailable(player)
{
	for (const x of [ "Body", "Propulsion", "Weapon", "Sensor", "Construct", "Repair", "ECM" ])
	{
		for (const component of Object.values(Stats[x]))
		{
			makeComponentAvailable(component.Id, player);
		}
	}
}

/**
 * @param {number} player
 * @param {number} timeS
 */
function giveResearch(player, timeS)
{
	hackNetOff();
	for (const [tech, seconds] of Object.entries(minimumResearchTime))
	{
		if (seconds <= timeS)
		{
			completeResearch(tech, player);
		}
	}
	hackNetOn();
}

/**
 * @param {number} player
 */
function killEmptyVTOL(player)
{
	if (enumStruct(player, REARM_PAD).length <= 0)
	{
		enumDroid(player, DROID_WEAPON)
			.filter(d => d.isVTOL && d.weapons[0].armed <= 1)
			.forEach(v => removeObject(v, true));
	}
}

function getStartTime()
{
	let startTime = 1;
	const techLevel = getMultiTechLevel();
	if (baseType == CAMP_BASE)
	{
		startTime = timeBaseTech;
	}
	if (baseType == CAMP_WALLS)
	{
		startTime = timeAdvancedBaseTech;
	}
	if (techLevel == 2)
	{
		startTime = timeT2;
	}
	if (techLevel == 3)
	{
		startTime = timeT3;
	}
	if (techLevel == 4)
	{
		startTime = 100 * 60;
	}
	return startTime;
}
