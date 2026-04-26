const addConstructor = (player, x, y) => {
	return addDroid(player, x, y,
		"Truck Viper Wheels",
		"Body1REC",
		"wheeled01",
		"", "",
		"Spade1Mk1"
	);
};

const defaultStructs = [
	"A0PowerGenerator",
	"A0ResearchFacility",
	"A0LightFactory",
];

const defaultNumConstruct = 4;
const defaultNumOil = 40;


function pushAutoBase()
{
	const players = getPlayers();
	const numPlayers = players.length;
	const numOil = getNumOil();
	const K = numOil / numPlayers / defaultNumOil;
	const NumConstruct = Math.max(1, Math.ceil(K * defaultNumConstruct));
	const NumStruct =  Math.ceil(K * 5);

	players.forEach((player, index) =>
	{
		const HQ = getHQ(index, numPlayers);

		if (player == me) // Center the camera
		{
			centreView(HQ.x, HQ.y);
		}

		// Find a location for constructors near HQ
		const constructorLocation = pickConstructorLocation(HQ.x, HQ.y);
		if (!constructorLocation)
		{
			return;
		}

		// Add 1 droid for pickStructLocation
		const constructor = addConstructor(player, constructorLocation.x, constructorLocation.y);
		if (!constructor)
		{
			return;
		}

		// Add a temporary structure to block structures from spawning on top of constructors
		const blocker = addStructure("A0HardcreteMk1Wall", player, constructorLocation.x * 128, constructorLocation.y * 128);
		if (!blocker)
		{
			return;
		}

		// Add base structures
		for (let i = 0; i < NumStruct; i++)
		{
			defaultStructs.forEach(s =>
			{
				const tile = pickStructLocation(constructor, s, HQ.x, HQ.y);
				if (tile)
				{
					addStructure(s, player, tile.x * 128, tile.y * 128);
				}
			});
		}

		// Remove the temporary structure
		removeObject(blocker);

		// Add the rest of the constructors
		let numAdded = 1;
		BFS(constructorLocation.x, constructorLocation.y, {
			shape: 25,
			stop: () => numAdded >= NumConstruct,
			onVisit: (x, y) =>
			{
				if (!(x == constructorLocation.x && y == constructorLocation.y) && // already 1 constructor here
					terrainType(x, y) != TER_CLIFFFACE &&
					terrainType(x, y) != TER_WATER &&
					!getObject(x, y))
				{
					addConstructor(player, x, y);
					numAdded++;
				}
			},
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

function pickConstructorLocation(X, Y)
{
	for (const [x, y] of iterateSpiral(X, Y))
	{
		if (terrainType(x, y) !== TER_CLIFFFACE &&
			terrainType(x, y) !== TER_WATER &&
			!getObject(x, y))
		{
			return { x, y };
		}
	}
	return null;
}

function getHQ(index, numPlayers)
{
	const BORDER = 4;
	const { x1, y1, x2, y2 } = Scrim.get();
	const center = Scrim.center();
	const width = Scrim.width();
	const height = Scrim.height();
	const Rscalar = numPlayers == 1 ? 0 : 0.33;
	const R = Math.min(width, height) * Rscalar;
	const HQ = {};

	if (mapExpander.startShape.length == 1)
	{
		const theta = 2*Math.PI*index/numPlayers;
		HQ.x = Math.cos(theta) * R + center.x;
		HQ.y = Math.sin(theta) * R + center.y;
	}
	else if (mapExpander.key == "y2")
	{
		HQ.x = ((mapWidth-(2*BORDER))/numPlayers) * (index+0.5) + BORDER; // horizontal
		HQ.y = y1 + height / 2;
	}
	else if (mapExpander.key == "y1")
	{
		HQ.x = ((mapWidth-(2*BORDER))/numPlayers) * (index+0.5) + BORDER; // horizontal
		HQ.y = y2 - height / 2;
	}
	else if (mapExpander.key == "x2")
	{
		HQ.x = x1 + width / 2;
		HQ.y = ((mapHeight-(2*BORDER))/numPlayers) * (index+0.5) + BORDER; // vertical
	}
	else if (mapExpander.key == "x1")
	{
		HQ.x = x2 - width / 2;
		HQ.y = ((mapHeight-(2*BORDER))/numPlayers) * (index+0.5) + BORDER; // vertical
	}
	else if (mapExpander.key == "x1,x2")
	{
		HQ.x = center.x;
		HQ.y = ((mapHeight-(2*BORDER))/numPlayers) * (index+0.5) + BORDER; // vertical
	}
	else /*if (mapExpander.key == "y1,y2")*/
	{
		HQ.x = ((mapWidth-(2*BORDER))/numPlayers) * (index+0.5) + BORDER; // horizontal
		HQ.y = center.y;
	}

	return HQ;
}

/**
 * @param {number} N - the current size of the team (how many players currently)
 * @param {number} M - the maximum size of the team (how many players when full)
 * @returns {number}
 */
function getStartPower(N, M)
{
	if (M === 1)
	{
		return 4800;
	}
	else if (M === 2)
	{
		return 2400;
	}
	else if (M === 3)
	{
		return 1600;
	}
	else if (M === 4)
	{
		return 1200;
	}
	else // M > 4
	{
		return 1200; // an advantage is gained by having more players
	}
}


/**
 * @param {number} N - the current size of the team (how many players currently)
 * @param {number} M - the maximum size of the team (how many players when full)
 * @returns {object}
 */
function getDroidLimits(N, M)
{
	if (M === 1)
	{
		return {
			[DROID_ANY]: 150,
			[DROID_COMMAND]: 10,
			[DROID_CONSTRUCT]: 15,
		};
	}
	else if (M === 2)
	{
		if (N === 1)
		{
			return {
				[DROID_ANY]: 300,
				[DROID_COMMAND]: 20,
				[DROID_CONSTRUCT]: 30,
			};
		}
		else if (N === 2)
		{
			return {
				[DROID_ANY]: 150,
				[DROID_COMMAND]: 10,
				[DROID_CONSTRUCT]: 15,
			};
		}
	}
	else if (M === 3)
	{
		if (N === 1)
		{
			return {
				[DROID_ANY]: 450,
				[DROID_COMMAND]: 30,
				[DROID_CONSTRUCT]: 42,
			};
		}
		else if (N === 2)
		{
			return {
				[DROID_ANY]: 225,
				[DROID_COMMAND]: 15,
				[DROID_CONSTRUCT]: 21,
			};
		}
		else if (N === 3)
		{
			return {
				[DROID_ANY]: 150,
				[DROID_COMMAND]: 10,
				[DROID_CONSTRUCT]: 14,
			};
		}
	}
	else if (M === 4)
	{
		if (N === 1)
		{
			return {
				[DROID_ANY]: 480,
				[DROID_COMMAND]: 24,
				[DROID_CONSTRUCT]: 48,
			};
		}
		else if (N === 2)
		{
			return {
				[DROID_ANY]: 240,
				[DROID_COMMAND]: 12,
				[DROID_CONSTRUCT]: 24,
			};
		}
		else if (N === 3)
		{
			return {
				[DROID_ANY]: 160,
				[DROID_COMMAND]: 8,
				[DROID_CONSTRUCT]: 16,
			};
		}
		else if (N === 4)
		{
			return {
				[DROID_ANY]: 120,
				[DROID_COMMAND]: 6,
				[DROID_CONSTRUCT]: 12,
			};
		}
	}
	else // M > 4
	{
		// an advantage is gained by having more players
		return {
			[DROID_ANY]: 120,
			[DROID_COMMAND]: 6,
			[DROID_CONSTRUCT]: 12,
		};
	}
}

/**
 * @param {number} N - the current size of the team (how many players currently)
 * @param {number} M - the maximum size of the team (how many players when full)
 * @returns {object}
 */
function getStructureLimits(N, M)
{
	if (M === 1)
	{
		return {
			"A0ComDroidControl":  1, // always 1
			"A0Sat-linkCentre":   1, // always 1
			"A0LasSatCommand":    1,

			"A0LightFactory":     5,
			"A0CyborgFactory":    5,
			"A0VTolFactory1":     5,
			"A0ResearchFacility": 5,
			"A0RepairCentre3":    5,

			"A0PowerGenerator":   10,

			"A0VtolPad":          50,
		};
	}
	else if (M === 2)
	{
		if (N === 1)
		{
			return {
				"A0ComDroidControl":  1, // always 1
				"A0Sat-linkCentre":   1, // always 1
				"A0LasSatCommand":    2,

				"A0LightFactory":     10,
				"A0CyborgFactory":    10,
				"A0VTolFactory1":     10,
				"A0ResearchFacility": 10,
				"A0RepairCentre3":    10,

				"A0PowerGenerator":   20,

				"A0VtolPad":          100,
			};
		}
		else if (N === 2)
		{
			return {
				"A0ComDroidControl":  1, // always 1
				"A0Sat-linkCentre":   1, // always 1
				"A0LasSatCommand":    1,

				"A0LightFactory":     5,
				"A0CyborgFactory":    5,
				"A0VTolFactory1":     5,
				"A0ResearchFacility": 5,
				"A0RepairCentre3":    5,

				"A0PowerGenerator":   10,

				"A0VtolPad":          50,
			};
		}
	}
	else if (M === 3)
	{
		if (N === 1)
		{
			return {
				"A0ComDroidControl":  1, // always 1
				"A0Sat-linkCentre":   1, // always 1
				"A0LasSatCommand":    6,

				"A0LightFactory":     12,
				"A0CyborgFactory":    12,
				"A0VTolFactory1":     12,
				"A0ResearchFacility": 12,
				"A0RepairCentre3":    12,

				"A0PowerGenerator":   30,

				"A0VtolPad":          150,
			};
		}
		else if (N === 2)
		{
			return {
				"A0ComDroidControl":  1, // always 1
				"A0Sat-linkCentre":   1, // always 1
				"A0LasSatCommand":    3,

				"A0LightFactory":     6,
				"A0CyborgFactory":    6,
				"A0VTolFactory1":     6,
				"A0ResearchFacility": 6,
				"A0RepairCentre3":    6,

				"A0PowerGenerator":   15,

				"A0VtolPad":          75,
			};
		}
		else if (N === 3)
		{
			return {
				"A0ComDroidControl":  1, // always 1
				"A0Sat-linkCentre":   1, // always 1
				"A0LasSatCommand":    2,

				"A0LightFactory":     4,
				"A0CyborgFactory":    4,
				"A0VTolFactory1":     4,
				"A0ResearchFacility": 4,
				"A0RepairCentre3":    4,

				"A0PowerGenerator":   10,

				"A0VtolPad":          50,
			};
		}
	}
	else if (M === 4)
	{
		if (N === 1)
		{
			return {
				"A0ComDroidControl":  1, // always 1
				"A0Sat-linkCentre":   1, // always 1
				"A0LasSatCommand":    12,

				"A0LightFactory":     12,
				"A0CyborgFactory":    12,
				"A0VTolFactory1":     12,
				"A0ResearchFacility": 12,
				"A0RepairCentre3":    12,

				"A0PowerGenerator":   36,

				"A0VtolPad":          192,
			};
		}
		else if (N === 2)
		{
			return {
				"A0ComDroidControl":  1, // always 1
				"A0Sat-linkCentre":   1, // always 1
				"A0LasSatCommand":    6,

				"A0LightFactory":     6,
				"A0CyborgFactory":    6,
				"A0VTolFactory1":     6,
				"A0ResearchFacility": 6,
				"A0RepairCentre3":    6,

				"A0PowerGenerator":   18,

				"A0VtolPad":          96,
			};
		}
		else if (N === 3)
		{
			return {
				"A0ComDroidControl":  1, // always 1
				"A0Sat-linkCentre":   1, // always 1
				"A0LasSatCommand":    4,

				"A0LightFactory":     4,
				"A0CyborgFactory":    4,
				"A0VTolFactory1":     4,
				"A0ResearchFacility": 4,
				"A0RepairCentre3":    4,

				"A0PowerGenerator":   12,

				"A0VtolPad":          64,
			};
		}
		else if (N === 4)
		{
			return {
				"A0ComDroidControl":  1, // always 1
				"A0Sat-linkCentre":   1, // always 1
				"A0LasSatCommand":    3,

				"A0LightFactory":     3,
				"A0CyborgFactory":    3,
				"A0VTolFactory1":     3,
				"A0ResearchFacility": 3,
				"A0RepairCentre3":    3,

				"A0PowerGenerator":   9,

				"A0VtolPad":          48,
			};
		}
	}
	else // M > 4
	{
		// an advantage is gained by having more players
		return {
			"A0ComDroidControl":  1, // always 1
			"A0Sat-linkCentre":   1, // always 1
			"A0LasSatCommand":    3,

			"A0LightFactory":     3,
			"A0CyborgFactory":    3,
			"A0VTolFactory1":     3,
			"A0ResearchFacility": 3,
			"A0RepairCentre3":    3,

			"A0PowerGenerator":   9,

			"A0VtolPad":          48,
		};
	}
}
