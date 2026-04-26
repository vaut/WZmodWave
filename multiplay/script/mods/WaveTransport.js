/**
 * Requires Scrim, Dropship
 */
class WaveTransport
{
	static tiles = [];
	static totalPower = 0;
	static borderFilter = null; // control which borders transports spawn/depart
	static factory = {
		land: null,
		water: null,
	};

	/**
	 * Spend all totalPower
	 * @param {number} maxFlightDistance
	 * @param {number} droidExperience
	 * @param {number} transportCapacity
	 * @param {boolean} cyborgTransport
	 * @param {boolean} canLandOnWater
	 * @returns {WaveTransport[]}
	 */
	static makeTransports(maxFlightDistance, droidExperience, transportCapacity, cyborgTransport, canLandOnWater)
	{
		const transports = [];
		while (WaveTransport.totalPower > 0)
		{
			const t = new WaveTransport(maxFlightDistance, droidExperience, transportCapacity, cyborgTransport, canLandOnWater);
			if (t.isFailed)
			{
				console("Enemy transport can't land");
				return transports; // early exit
			}
			transports.push(t);
		}
		return transports;
	}

	/**
	 * @param {number} maxFlightDistance
	 * @param {number} droidExperience
	 * @param {number} transportCapacity
	 * @param {boolean} cyborgTransport
	 * @param {boolean} canLandOnWater
	 */
	constructor(maxFlightDistance, droidExperience, transportCapacity, cyborgTransport, canLandOnWater)
	{
		this.LZ = WaveTransport.DEFAULT_LZ;
		this.cargo = WaveTransport.DEFAULT_CARGO;

		this.maxFlightDistance = maxFlightDistance;
		this.droidExperience = droidExperience;
		this.transportCapacity = transportCapacity;
		this.cyborgTransport = cyborgTransport;
		this.canLandOnWater = canLandOnWater;

		this.isSpawned = false;
		this.isDone = false;
		this.isFailed = false; // failed to pick landing tile

		this.recalculate();
	}

	spawn()
	{
		const border = Scrim.nearestBorder(this.LZ.x, this.LZ.y, "droid", WaveTransport.borderFilter);
		const spawnLocation = Dropship.snap({ x: this.LZ.x, y: this.LZ.y, margin: -10, border });

		new Dropship(Wave.AI, spawnLocation.x, spawnLocation.y, {
			cyborgTransport: this.cyborgTransport,
			onDeath: () => this.isDone = true,
			objectives: [
				{
					getLocation : (dropship) => this.LZ,
					isBlocked   : (dropship) => !this.canLand(),
					onBlocked   : (dropship) => this.recalculate(),
					isComplete  : (dropship) => dropship.isAt(this.LZ.x, this.LZ.y),
					onComplete  : (dropship) => dropship.stop(),
				},
				Dropship.objective.pause(),
				{
					getLocation : null,
					isComplete  : (dropship) => true,
					onComplete  : (dropship) =>
					{
						this.unload();
						this.isDone = true;
					},
				},
				Dropship.objective.depart(border),
			],
		});

		this.isSpawned = true;
	}

	recalculate()
	{
		this.LZ = this.pickLandingTile();
		if (this.LZ === null)
		{
			this.LZ = WaveTransport.DEFAULT_LZ;
			this.isFailed = true;
		}

		WaveTransport.freeCargo(this.cargo);
		this.cargo = this.generateCargo(this.LZ.x, this.LZ.y);
	}

	unload()
	{
		const droids = WaveTransport.unloadCargo(this.cargo);
		droids.forEach(droid => setDroidExperience(droid, this.droidExperience));
	}

	/**
	 * @returns {boolean}
	 */
	canLand()
	{
		return this.canLandAt(this.LZ.x, this.LZ.y);
	}

	/**
	 * @returns {number} how many droids are in this transporter's cargo
	 */
	numDroids()
	{
		return this.cargo.crates.length;
	}

	/**
	 * May mutate the original array by removing some tiles where canLandAt == false
	 *
	 * @returns {object|null} { x, y } or null if no tiles are available
	 */
	pickLandingTile()
	{
		while (WaveTransport.tiles.length > 0)
		{
			const i = syncRandom(WaveTransport.tiles.length);
			const { x, y } = WaveTransport.tiles[i];
			if (this.canLandAt(x, y))
			{
				return { x, y };
			}
			else
			{
				WaveTransport.deleteTile(i);
			}
		}
		return null;
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @returns {boolean}
	 */
	canLandAt(x, y)
	{
		if (terrainType(x, y) === TER_CLIFFFACE)
		{
			return false;
		}
		if (this.canLandOnWater === false && terrainType(x, y) === TER_WATER)
		{
			return false;
		}
		if (getObject(x, y))
		{
			return false;
		}
		if (this.isTooFar(x, y))
		{
			return false;
		}
		return true;
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @returns {boolean}
	 */
	canUnloadAt(x, y)
	{
		if (terrainType(x, y) === TER_CLIFFFACE)
		{
			return false;
		}
		if (this.canLandOnWater === false && terrainType(x, y) === TER_WATER)
		{
			return false;
		}
		if (getObject(x, y))
		{
			return false;
		}
		if (!Scrim.contains(x, y, "droid"))
		{
			return false;
		}
		return true;
	}

	/**
	 * Regain the power spent on cargo
	 */
	static freeCargo(cargo)
	{
		WaveTransport.totalPower += cargo.power;
	}

	/**
	 * @param {number} x - x coordinate of the transporter landing tile
	 * @param {number} y - y coordinate of the transporter landing tile
	 * @returns {object} an array of "crates" and the total power cost of all the crates
	 */
	generateCargo(x, y)
	{
		const crates = [];
		let power = 0;

		BFS(x, y, {
			canVisit: (x, y) => this.canUnloadAt(x, y),
			onVisit: (x, y) =>
			{
				const crate = this.getCrate(x, y);
				if (crate)
				{
					crates.push(crate);
					power += crate.template.power;
				}
			},
			maxVisits: this.transportCapacity,
			shape: 25,
			stop: () => power >= WaveTransport.totalPower,
		});

		WaveTransport.totalPower -= power;

		return { crates, power };
	}

	/**
	 * @returns {object[]} an array of the landed droids
	 */
	static unloadCargo(cargo)
	{
		const droids = [];

		for (const { x, y, template } of cargo.crates)
		{
			hackNetOff();
			const droid = addDroid(
				Wave.AI, x, y,
				template.fullname, template.body, template.propulsion,
				"", "",
				...template.weapons
			);
			if (droid)
			{
				droids.push(droid);
			}
			hackNetOn();
		}

		return droids;
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @returns {object|null} a "crate", which contains a template and an x, y
	 */
	getCrate(x, y)
	{
		const template = this.pickTemplateToLandAt(
			x, y,
			WaveTransport.factory.land, WaveTransport.factory.water
		);

		if (!template)
		{
			return null;
		}

		return { template, x, y };
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @returns {boolean}
	 */
	isTooFar(x, y)
	{
		return Scrim.distToNearestBorder(x, y, Scrim.droidArea, WaveTransport.borderFilter) > this.maxFlightDistance;
	}

	/**
	 * Get a droid to land at x, y. For example, only hovers can land on water.
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {TemplateFactory} landFactory
	 * @param {TemplateFactory} waterFactory
	 * @returns {template|null}
	 */
	pickTemplateToLandAt(x, y, landFactory, waterFactory)
	{
		const virtualDroid = terrainType(x, y) === TER_WATER
			? waterFactory.produce()
			: landFactory.produce();

		if (!virtualDroid)
		{
			return null;
		}

		const template = makeTemplate(
			Wave.AI, virtualDroid.name, virtualDroid.body,
			virtualDroid.propulsion, "", ...virtualDroid.weapons
		);

		if (!template)
		{
			return null;
		}

		return template;
	}

	/**
	 * Delete tile using swap and pop method
	 * Faster than splice(i, 1)
	 */
	static deleteTile(i)
	{
		WaveTransport.tiles[i] = WaveTransport.tiles.at(-1);
		WaveTransport.tiles.pop();
	}

	static DEFAULT_LZ = { x: 1, y: 1 };
	static DEFAULT_CARGO = { crates: [], power: 0 };
}
