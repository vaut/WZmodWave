namespace("wa_");

// Use `var` to persist through save-loads
var mapExpander;
var isReadyForNextWave = true;
var configError = ""; // For printsettings.js

function wa_eventGameInit()
{
	if (Wave.AI === null)
	{
		return;
	}

	const result1 = Config.use(gameTimeS(), 0, 0, Wave.difficulty);
	if (!result1.success)
	{
		Config.error(result1.error);
		configError = result1.error;
		return;
	}

	mapExpander = new MapExpander(Config.mapExpansionPattern);
	mapExpander.setStartingScrollLimits(Config.mapSize);

	const result2 = Config.use(gameTimeS(), 0, getNumOil(), Wave.difficulty);
	if (!result2.success)
	{
		Config.error(result2.error);
		configError = result2.error;
		return;
	}

	if (Config.autoBase === true)
	{
		cleanAllUnitsAndStruct();
		queue("pushAutoBase", 100);
	}
	else // Config.autoBase === false
	{
		// Check ALL players (maybe multiple Wave AI bots?)
		for (let player = 0; player < maxPlayers; player++)
		{
			if (Wave.is(player))
			{
				cleanUnitsAndStruct(player);
			}
		}
	}

	queue("updateLimits", 100);

	makeEverythingAvailable(Wave.AI);
	initExperienceModifiers();

	setTimer("updateResearch", 15 * 1000);
	setTimer("killEmptyVTOL", 6 * 1000);

	setMissionTime(Config.protectTimeM * 60);

	queue("scheduler", Config.protectTimeM * 60 * 1000); // пропускаем стартовые минуты
}

function wa_eventPlayerLeft(player)
{
	updateLimits();
}

function scheduler()
{
	// первая высадка в волне
	if (isReadyForNextWave)
	{
		isReadyForNextWave = false;
		Wave.number++;

		const oldMapSize = Wave.current?.config.mapSize ?? Config.mapSize;
		const newMapSize = Config.calculate.mapSize(gameTimeS(), Wave.number, getNumOil(), Wave.difficulty);
		const expansionAmount = newMapSize - oldMapSize;
		MapExpander.expand(mapExpander.getExpansionDirection(Wave.number), expansionAmount);
		const result = Config.use(gameTimeS(), Wave.number, getNumOil(), Wave.difficulty);
		if (!result.success)
		{
			Config.error(result.error);
			configError = result.error;
			return;
		}

		updateLimits();
		Wave.current = new Wave(Config.cache);
		Dropship.play("Incoming enemy transport");
		console(" ");
		console(_("Wave") + " " + Wave.current.waveNumber);
		console(
			Wave.current.transports.length + " " +
			(Wave.current.transports.length > 1 ? _("incoming enemy transports") : _("incoming enemy transport")) +
			" (" + Wave.current.totalDroidCount + " " + _("units") + ")"
		);
		console(" ");
		if (Wave.current.isFinal)
		{
			console(_(`Commander, we've spotted a lot of transports.
Our air defense cannot stop them. Landings are observed throughout the sector.
THEY ARE IN THE TREES, JOHNNY! FUCKING HOOKES EVERYWHERE!`
			));
		}
	}

	// следующая высадка в волне
	if (Wave.current.isSendingTransports)
	{
		Wave.current.sendTransport();
		queue("scheduler", Wave.current.config.inWavePauseS * 1000);
		return;
	}

	// отразили волну
	if (Wave.current.isDoneLanding && Wave.current.isMostlyDefeated && Wave.current.isNotFinal)
	{
		isReadyForNextWave = true;
		const secondsUntilNextWave = Wave.current.config.afterWavePauseM * 60;
		if (secondsUntilNextWave > 20)
		{
			setMissionTime(secondsUntilNextWave);
		}
		queue("scheduler", secondsUntilNextWave * 1000);
		return;
	}

	// заглушка на случай отсутсвия действия
	queue("scheduler", 3*1000);
}

function initExperienceModifiers()
{
	setExperienceModifier(Wave.AI, Config.waveExpModifier);

	for (let player = 0; player < maxPlayers; player++)
	{
		if (player !== Wave.AI)
		{
			setExperienceModifier(player, Config.playerExpModifier);
		}
	}
}

/**
 * @returns {number} current research time in seconds
 */
function getResearchTimeS()
{
	const timeS = gameTimeS() + getStartTime();
	const researchDelayS = Math.floor(Config.waveResearchDelayM * 60);
	return Math.max(0, timeS - researchDelayS);
}

/**
 * @returns {number[]}
 */
function getCurrentPlayers()
{
	return Pim.getContenders(true).filter(p => !Wave.is(p));
}

function updateResearch()
{
	const timeS = getResearchTimeS();
	giveResearch(Wave.AI, timeS);
}

function updateLimits()
{
	const players = getCurrentPlayers();
	const N = players.length; // current player count
	const M = startPositions.length - Wave.countWaveAI;

	if (Config.structLimits === "auto")
	{
		players.forEach(player =>
		{
			const slims = getStructureLimits(N, M);
			for (const [name, limit] of Object.entries(slims))
			{
				setStructureLimits(name, limit, player);
			}
		});
	}
	else // Config.structLimits !== "auto"
	{
		for (let player = 0; player < maxPlayers; player++)
		{
			for (const [name, limit] of Object.entries(Config.structLimits))
			{
				setStructureLimits(name, limit, player);
			}
		}
	}

	if (Config.droidLimits === "auto")
	{
		players.forEach(player =>
		{
			const dlims = getDroidLimits(N, M);
			for (const [type, limit] of Object.entries(slims))
			{
				setDroidLimit(player, limit, type);
			}
		});
	}
	else // Config.droidLimits !== "auto"
	{
		for (let player = 0; player < maxPlayers; player++)
		{
			for (const [type, limit] of Object.entries(Config.droidLimits))
			{
				setDroidLimit(player, limit, type);
			}
		}
	}
}

/**
 * @returns {number} The number of oil derricks currently within scroll limits
 */
function getNumOil()
{
	let numOil = enumFeature(ALL_PLAYERS).filter(f =>
		f.stattype === OIL_RESOURCE && Scrim.containsObject(f, "struct")
	).length;
	numOil += enumStruct(scavengerPlayer, RESOURCE_EXTRACTOR).length;
	for (let player = 0; player < maxPlayers; player++)
	{
		numOil += enumStruct(player, RESOURCE_EXTRACTOR).length;
	}
	return numOil;
}

/**
 * Increase unit experience over time. For example, to begin increasing at
 * 5:00 and achieve Hero rank at 1:30:00, do getExperienceNow(5, 90);
 *
 * @param {number} startM - Begin increasing at this time (minutes)
 * @param {number} endM - Achieve the highest rank at this time (minutes)
 * @returns {number} experience at current time
 */
function getExperienceNow(startM = 0, endM = 90)
{
	const startS = startM * 60;
	const endS = endM * 60;

	const timeS = Math.max(0, gameTimeS() - startS);
	const timeRangeS = endS - startS;

	const totalNumRanks = Stats.Brain["Z NULL BRAIN"].RankThresholds.length;
	const rankIncrementIntervalS = timeRangeS / (totalNumRanks - 1);
	const rankIndex = Math.min(totalNumRanks-1, Math.round(timeS / rankIncrementIntervalS));
	const experience = Stats.Brain["Z NULL BRAIN"].RankThresholds[rankIndex];

	return experience;
}

