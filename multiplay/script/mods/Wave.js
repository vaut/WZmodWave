class Wave
{
	static type = {
		"NORMAL": 0,
		"ROYAL": 1,
		"FINAL": 2,
	};

	// 0 = before any wave (setup time)
	// 1 = Wave 1
	// 2 = Wave 2
	// 3 = ...
	static number = 0;

	// The current Wave
	static current;

	// Wave player number
	static AI = (() => {
		for (let player = 0; player < maxPlayers; player++)
		{
			if (Wave.is(player))
			{
				return player;
			}
		}
		return scavengers === NO_SCAVENGERS ? null : scavengerPlayer;
	})();

	// How many Wave AI bots
	static countWaveAI = (() => {
		let count = 0;
		for (let player = 0; player < maxPlayers; player++)
		{
			if (Wave.is(player))
			{
				count++;
			}
		}
		return count;
	})();

	// Wave difficulty modifier
	static difficulty = (() => {
		if (Wave.AI == null)
		{
			return null;
		}
		else if (Wave.AI === scavengerPlayer)
		{
			switch (scavengers)
			{
				case NO_SCAVENGERS       : return 0.66;
				case SCAVENGERS          : return 1.00;
				case ULTIMATE_SCAVENGERS : return 1.33;
			}
		}
		else
		{
			switch (playerData[Wave.AI].difficulty)
			{
				case SUPEREASY : return 0.33;
				case EASY      : return 0.66;
				case MEDIUM    : return 1.00;
				case HARD      : return 1.33;
				case INSANE    : return 1.66;
			}
		}
	})();

	static is(player)
	{
		return playerData[player].isAI && playerData[player].name === "Wave";
	}

	constructor(config)
	{
		// Save the current snapshot of the config, in case it changes
		this.config = config;

		// Set the transport HP
		Upgrades[Wave.AI].Body["Transport Body"].HitPoints = this.config.transportHP;
		Upgrades[Wave.AI].Body["Super Transport Body"].HitPoints = this.config.transportHP;

		this.type = !this.config.infinite && Scrim.isMax ? Wave.type.FINAL : Wave.type.NORMAL;
		this.timeS = getResearchTimeS();
		this.waveNumber = Wave.number;
		this.droidBudget = this.isFinal
			? this.config.waveFinalMultiplier * this.config.wavePower
			: this.config.wavePower;
		this.borderFilter = this.isFinal
			? mapExpander.key.split(",")
			: mapExpander.getExpansionDirection(this.waveNumber);

		// Add structures
		this.pushStructs();

		// Create transports but do not spawn them yet
		this.maxFlightDistance = this.isFinal ? Infinity : this.config.transportFlyDistance;
		this.transports = this.generateTransports();
		this.totalDroidCount = Wave.getTotalDroidCount(this.transports);
	}

	get isSendingTransports()
	{
		return this.transports.some(t => !t.isSpawned);
	}

	get isDoneLanding()
	{
		return this.transports.every(t => t.isDone);
	}

	get isMostlyDefeated()
	{
		return this.currentDroidCount <= Math.ceil(this.totalDroidCount * this.config.waveResidual);
	}

	get isDefeated()
	{
		return this.currentDroidCount == 0;
	}

	get currentDroidCount()
	{
		return enumDroid(Wave.AI, DROID_WEAPON).filter(d => !d.isVTOL && d.canHitGround).length;
	}

	get isFinal()
	{
		return this.type == Wave.type.FINAL;
	}

	get isNotFinal()
	{
		return this.type != Wave.type.FINAL;
	}

	generateTransports()
	{
		const { landFactory, waterFactory } = this.buildFactories(this.timeS);
		WaveTransport.tiles = Array.from(Scrim.iterate(Scrim.droidArea));
		WaveTransport.totalPower = this.droidBudget;
		WaveTransport.factory.land = landFactory;
		WaveTransport.factory.water = waterFactory;
		WaveTransport.borderFilter = this.borderFilter;

		return WaveTransport.makeTransports(
			this.maxFlightDistance,
			getExperienceNow(this.config.waveRankTimeM.zero, this.config.waveRankTimeM.hero),
			this.config.transportCapacity,
			this.config.cyborgTransport,
			this.config.waterLanding
		);
	}

	sendTransport()
	{
		for (const transport of this.transports)
		{
			if (!transport.isSpawned)
			{
				transport.spawn();
				return;
			}
		}
	}

	/**
	 * @param {number} timeS - time in seconds
	 * @returns {object} landFactory, waterFactory
	 */
	buildFactories(timeS)
	{
		if (this.config.crazyWaves)
		{
			return {
				landFactory: new TemplateFactory(TemplateFactory.allComponents, [
					...TemplateFactory.RULESETS.VTOL,
					...TemplateFactory.RULESETS.CYBORG,
					...TemplateFactory.RULESETS.BABA,
					{
						assert: ({propulsion}) => !propulsion.toUpperCase().includes("NAVAL"),
					},
					...Object.keys(this.config.waveUnits).filter(k => this.config.waveUnits[k]).map(r => TemplateFactory.RULES[r])
				]),
				waterFactory: null
			};
		}

		const landFactory = TemplateFactory.from({
			RESEARCH            : allResearch,
			componentWeights    : componentWeights,
			startingComponents  : startingComponents,
			redundantComponents : redundantComponents,
			minimumResearchTime : minimumResearchTime,
			rules: this.config.waveUnits,
			gameTime: timeS
		});

		const waterFactory = this.config.waterLanding ? TemplateFactory.from({
			RESEARCH            : allResearch,
			componentWeights    : {
				...componentWeights,
				"BaBaProp": 0,
				"wheeled01": 0,
				"CyborgLegs": 0,
				"HalfTrack": 0,
				"tracked01": 0,
				"CyborgLightBody": 0,
				"CyborgHeavyBody": 0
			},
			startingComponents  : startingComponents,
			redundantComponents : redundantComponents,
			minimumResearchTime : minimumResearchTime,
			rules: this.config.waveUnits,
			gameTime: timeS
		}) : null;

		return { landFactory, waterFactory };
	}

	/**
	 * @param {WaveTransport[]} transports
	 * @returns {number}
	 */
	static getTotalDroidCount(transports)
	{
		return transports.reduce(
			(sum, transport) => sum + transport.numDroids(),
			0,
		);
	}

	getStructures(timeS)
	{
		const redComponents = new Set();
		for (const [tech, seconds] of Object.entries(minimumResearchTime))
		{
			if (seconds <= timeS)
			{
				const red = redundantComponents[tech] || allResearch[tech].redComponents || [];
				for (const componentID of red)
				{
					redComponents.add(componentID);
				}
			}
		}

		const allowedTypes = Object.keys(this.config.structPower);

		let availableStructs = [];
		for (const [id, struct] of Object.entries(allStructs))
		{
			if (!allowedTypes.includes(struct.type))
			{
				continue;
			}
			if (!isStructureAvailable(id, Wave.AI))
			{
				continue;
			}
			if (struct.weapons && redComponents.has(struct.weapons?.[0]))
			{
				continue;
			}
			availableStructs.push(id);
		}
		return availableStructs;
	}

	pushStructs()
	{
		let availableStructs = this.getStructures(this.timeS);
		let availableTiles = shuffle(this.getStructTiles());

		for (const [type, multiplier] of Object.entries(this.config.structPower))
		{
			let structureBudget = Math.round(this.droidBudget * multiplier);
			let structs = availableStructs.filter(id => allStructs[id].type == type);
			while (structureBudget > 0 && availableTiles.length > 0 && structs.length > 0)
			{
				const [x, y] = availableTiles.pop();
				const i = syncRandom(structs.length);
				const key = structs[i];

				if (enumStruct(Wave.AI, key).length >= getStructureLimit(key, Wave.AI))
				{
					structs.splice(i, 1); // remove
					continue;
				}

				hackNetOff();
				addStructure(key, Wave.AI, x*128, y*128);
				hackNetOn();
				structureBudget -= allStructs[key].buildPower;
			}
		}
	}

	/**
	 * @returns {object[]} array of [x, y]
	 */
	getStructTiles()
	{
		const structTiles = [];
		for (const { x, y } of Scrim.iterate(Scrim.structArea))
		{
			if (this.canBuildAt(x, y))
			{
				structTiles.push([x, y]);
			}
		}
		return structTiles;
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @returns {boolean}
	 */
	canBuildAt(x, y)
	{
		if (terrainType(x, y) == TER_CLIFFFACE)
		{
			return false;
		}
		if (this.config.waterStructure === false && terrainType(x, y) === TER_WATER)
		{
			return false;
		}
		if (getObject(x, y))
		{
			return false;
		}
		if (Scrim.distToNearestBorder(x, y, Scrim.structArea, this.borderFilter) > this.config.structDistance)
		{
			return false;
		}
		return true;
	}
}
