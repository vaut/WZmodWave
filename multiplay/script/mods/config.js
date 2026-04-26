/**
 * Requires Scrim.js
 */
class Config
{
	static #data = {
		mapSize: {
			value: () => mapSize,
			isUndefined: () => typeof mapSize === "undefined",
			isValid: x => typeof x === "number",
			transform: x => Math.max(0, Math.min(250, x)),
		},
		inWavePauseS: {
			value: () => inWavePauseS,
			isUndefined: () => typeof inWavePauseS === "undefined",
			isValid: x => typeof x === "number",
			transform: x => Math.max(0, Math.floor(x)),
		},
		afterWavePauseM: {
			value: () => afterWavePauseM,
			isUndefined: () => typeof afterWavePauseM === "undefined",
			isValid: x => typeof x === "number",
			transform: x => Math.max(0, x),
		},
		wavePower: {
			value: () => wavePower,
			isUndefined: () => typeof wavePower === "undefined",
			isValid: x => typeof x === "number",
			transform: x => Math.max(1, Math.floor(x)),
		},
		transportHP: {
			value: () => transportHP,
			isUndefined: () => typeof transportHP === "undefined",
			isValid: x => typeof x === "number",
			transform: x => Math.max(1, Math.floor(x)),
		},
		transportCapacity: {
			value: () => transportCapacity,
			isUndefined: () => typeof transportCapacity === "undefined",
			isValid: x => typeof x === "number",
			transform: x => Math.max(1, Math.floor(x)),
		},
		transportFlyDistance: {
			value: () => transportFlyDistance,
			isUndefined: () => typeof transportFlyDistance === "undefined",
			isValid: x => typeof x === "number",
			transform: x => Math.max(0, Math.floor(x)),
		},
		structDistance: {
			value: () => structDistance,
			isUndefined: () => typeof structDistance === "undefined",
			isValid: x => typeof x === "number",
			transform: x => Math.max(0, Math.floor(x)),
		},
		protectTimeM: {
			value: () => protectTimeM,
			isUndefined: () => typeof protectTimeM === "undefined",
			isValid: x => typeof x === "number",
			transform: x => Math.max(0, Math.floor(x)),
		},
		mapExpansionPattern: {
			value: () => mapExpansionPattern,
			isUndefined: () => typeof mapExpansionPattern === "undefined",
			isValid: x => true,
			transform: x => Config.#parseMapExpansionPattern(x),
		},
		waveResearchDelayM: {
			value: () => waveResearchDelayM,
			isUndefined: () => typeof waveResearchDelayM === "undefined",
			isValid: x => typeof x === "number",
			transform: x => x,
		},
		waveRankTimeM: {
			value: () => waveRankTimeM,
			isUndefined: () => typeof waveRankTimeM === "undefined",
			isValid: x => typeof x === "object" && typeof x.zero === "number" && typeof x.hero === "number",
			transform: x => x,
		},
		waveResidual: {
			value: () => waveResidual,
			isUndefined: () => typeof waveResidual === "undefined",
			isValid: x => typeof x === "number",
			transform: x => Math.max(0, x),
		},
		waveFinalMultiplier: {
			value: () => waveFinalMultiplier,
			isUndefined: () => typeof waveFinalMultiplier === "undefined",
			isValid: x => typeof x === "number",
			transform: x => Math.max(1, x),
		},
		waveExpModifier: {
			value: () => waveExpModifier,
			isUndefined: () => typeof waveExpModifier === "undefined",
			isValid: x => typeof x === "number",
			transform: x => Math.max(0, x),
		},
		playerExpModifier: {
			value: () => playerExpModifier,
			isUndefined: () => typeof playerExpModifier === "undefined",
			isValid: x => typeof x === "number",
			transform: x => Math.max(0, x),
		},
		cyborgTransport: {
			value: () => cyborgTransport,
			isUndefined: () => typeof cyborgTransport === "undefined",
			isValid: x => typeof x === "boolean",
			transform: x => x,
		},
		waterLanding: {
			value: () => waterLanding,
			isUndefined: () => typeof waterLanding === "undefined",
			isValid: x => typeof x === "boolean",
			transform: x => x,
		},
		waterStructure: {
			value: () => waterStructure,
			isUndefined: () => typeof waterStructure === "undefined",
			isValid: x => typeof x === "boolean",
			transform: x => x,
		},
		autoBase: {
			value: () => autoBase,
			isUndefined: () => typeof autoBase === "undefined",
			isValid: x => typeof x === "boolean",
			transform: x => x,
		},
		infiniteWaves: {
			value: () => infiniteWaves,
			isUndefined: () => typeof infiniteWaves === "undefined",
			isValid: x => typeof x === "boolean",
			transform: x => x,
		},
		crazyWaves: {
			value: () => crazyWaves,
			isUndefined: () => typeof crazyWaves === "undefined",
			isValid: x => typeof x === "boolean",
			transform: x => x,
		},
		structPower: {
			value: () => structPower,
			isUndefined: () => typeof structPower === "undefined",
			isValid: x => typeof x === "object" && Object.values(x).every(v => typeof v === "number"),
			transform: x => x, // TODO validate the keys (valid stattype?)
		},
		waveUnits: {
			value: () => waveUnits,
			isUndefined: () => typeof waveUnits === "undefined",
			isValid: x => typeof x === "object" && Object.values(x).every(v => typeof v === "boolean"),
			transform: x => x, // TODO validate the keys (does the rule exist?)
		},
		structLimits: {
			value: () => structLimits,
			isUndefined: () => typeof structLimits === "undefined",
			isValid: x => x === "auto" || typeof x === "object" && Object.values(x).every(v => typeof v === "number"),
			transform: x => x, // TODO validate the keys (does the structure exist?)
		},
		droidLimits: {
			value: () => droidLimits,
			isUndefined: () => typeof droidLimits === "undefined",
			isValid: x => x === "auto" || typeof x === "object" && Object.values(x).every(v => typeof v === "number"),
			transform: x => x, // TODO validate the keys (correct enum?)
		},
	};

	static cache = {};
	static calculate = {
		mapSize              : (...context) => Config.#calculateVariable("mapSize",              ...context),
		inWavePauseS         : (...context) => Config.#calculateVariable("inWavePauseS",         ...context),
		afterWavePauseM      : (...context) => Config.#calculateVariable("afterWavePauseM",      ...context),
		wavePower            : (...context) => Config.#calculateVariable("wavePower",            ...context),
		transportHP          : (...context) => Config.#calculateVariable("transportHP",          ...context),
		transportCapacity    : (...context) => Config.#calculateVariable("transportCapacity",    ...context),
		transportFlyDistance : (...context) => Config.#calculateVariable("transportFlyDistance", ...context),
		structDistance       : (...context) => Config.#calculateVariable("structDistance",       ...context),
		protectTimeM         : (...context) => Config.#calculateVariable("protectTimeM",         ...context),
		mapExpansionPattern  : (...context) => Config.#calculateVariable("mapExpansionPattern",  ...context),
		waveResearchDelayM   : (...context) => Config.#calculateVariable("waveResearchDelayM",   ...context),
		waveRankTimeM        : (...context) => Config.#calculateVariable("waveRankTimeM",        ...context),
		waveResidual         : (...context) => Config.#calculateVariable("waveResidual",         ...context),
		waveFinalMultiplier  : (...context) => Config.#calculateVariable("waveFinalMultiplier",  ...context),
		waveExpModifier      : (...context) => Config.#calculateVariable("waveExpModifier",      ...context),
		playerExpModifier    : (...context) => Config.#calculateVariable("playerExpModifier",    ...context),
		cyborgTransport      : (...context) => Config.#calculateVariable("cyborgTransport",      ...context),
		waterLanding         : (...context) => Config.#calculateVariable("waterLanding",         ...context),
		waterStructure       : (...context) => Config.#calculateVariable("waterStructure",       ...context),
		autoBase             : (...context) => Config.#calculateVariable("autoBase",             ...context),
		infiniteWaves        : (...context) => Config.#calculateVariable("infiniteWaves",        ...context),
		crazyWaves           : (...context) => Config.#calculateVariable("crazyWaves",        ...context),
		structPower          : (...context) => Config.#calculateVariable("structPower",          ...context),
		waveUnits            : (...context) => Config.#calculateVariable("waveUnits",            ...context),
		structLimits         : (...context) => Config.#calculateVariable("structLimits",         ...context),
		droidLimits          : (...context) => Config.#calculateVariable("droidLimits",          ...context),
	};

	static get mapSize              () { return Config.cache.mapSize              ; }
	static get inWavePauseS         () { return Config.cache.inWavePauseS         ; }
	static get afterWavePauseM      () { return Config.cache.afterWavePauseM      ; }
	static get wavePower            () { return Config.cache.wavePower            ; }
	static get transportHP          () { return Config.cache.transportHP          ; }
	static get transportCapacity    () { return Config.cache.transportCapacity    ; }
	static get transportFlyDistance () { return Config.cache.transportFlyDistance ; }
	static get structDistance       () { return Config.cache.structDistance       ; }
	static get protectTimeM         () { return Config.cache.protectTimeM         ; }
	static get mapExpansionPattern  () { return Config.cache.mapExpansionPattern  ; }
	static get waveResearchDelayM   () { return Config.cache.waveResearchDelayM   ; }
	static get waveRankTimeM        () { return Config.cache.waveRankTimeM        ; }
	static get waveResidual         () { return Config.cache.waveResidual         ; }
	static get waveFinalMultiplier  () { return Config.cache.waveFinalMultiplier  ; }
	static get waveExpModifier      () { return Config.cache.waveExpModifier      ; }
	static get playerExpModifier    () { return Config.cache.playerExpModifier    ; }
	static get cyborgTransport      () { return Config.cache.cyborgTransport      ; }
	static get waterLanding         () { return Config.cache.waterLanding         ; }
	static get waterStructure       () { return Config.cache.waterStructure       ; }
	static get autoBase             () { return Config.cache.autoBase             ; }
	static get infiniteWaves        () { return Config.cache.infiniteWaves        ; }
	static get crazyWaves           () { return Config.cache.crazyWaves           ; }
	static get structPower          () { return Config.cache.structPower          ; }
	static get waveUnits            () { return Config.cache.waveUnits            ; }
	static get structLimits         () { return Config.cache.structLimits         ; }
	static get droidLimits          () { return Config.cache.droidLimits          ; }

	/**
	 * Update global variables and Config.cache
	 *
	 * @param {...number} context
	 * @returns {{ success: boolean, error: string }}
	 */
	static use(...context)
	{
		configjs(...context);

		for (const label of Object.keys(Config.#data))
		{
			const result = Config.#transform(label);
			if (!result.success)
			{
				return { success: false, error: label };
			}
		}
		return { success: true, error: "" };
	}

	/**
	 * @private
	 * @param {string} label
	 * @param {...number} context
	 * @returns {*} - The transformed value if valid, which is also stored in `Config.cache[label]`
	 * @throws {Error} Throws an error if the value is invalid
	 */
	static #calculateVariable(label, ...context)
	{
		configjs(...context);
		const result = Config.#transform(label);
		if (result.success)
		{
			return result.output;
		}
		else
		{
			Config.error(label);
		}
	}

	/**
	 * Check if a config variable is valid. If it is valid, apply a processing
	 * step and then store the variable in `Config.cache[label]`
	 *
	 * @private
	 * @param {string} label
	 * @returns {{ success: boolean, output: * }}
	 */
	static #transform(label)
	{
		const { value, isUndefined, isValid, transform } = Config.#data[label];
		if (!isUndefined() && isValid(value()))
		{
			Config.cache[label] = transform(value());
			return { success: true, output: Config.cache[label] };
		}
		else
		{
			return { success: false, output: null };
		}
	}

	/**
	 * Print an error message
	 *
	 * @private
	 * @param {string} label
	 * @throws {Error}
	 */
	static error(label)
	{
		console(_("ERROR") + ": " + _("Invalid config") + ": " + label);
		throw new Error("ERROR: Invalid config: " + label);
	}

	/**
	 * @private
	 * @param {*} pattern - map expansion pattern
	 * @returns {string[][]} pattern
	 */
	static #parseMapExpansionPattern(pattern) {
		const DEFAULT_EXPANSION_PATTERN = [["x1", "y1", "x2", "y2"]];

		if (typeof pattern === "string")
		{
			const p = pattern.toLowerCase();
			if (p === "all")
			{
				return DEFAULT_EXPANSION_PATTERN;
			}
			else if (p === "auto")
			{
				if (mapHeight > (mapWidth * 1.15))
				{
					return [["y1"]];
				}
				else
				{
					return DEFAULT_EXPANSION_PATTERN
				}
			}

			const str = Scrim.translate(pattern, null);
			if (!str)
			{
				console("ERROR: Invalid mapExpansionPattern");
				return DEFAULT_EXPANSION_PATTERN;
			}
			else
			{
				return [[ str ]];
			}
		}

		if (!Array.isArray(pattern) || pattern.length == 0)
		{
			console("ERROR: Invalid mapExpansionPattern");
			return DEFAULT_EXPANSION_PATTERN;
		}

		// ---- Parse the pattern ----

		const parsedPattern = [];

		for (const subpattern of pattern)
		{
			if (!Array.isArray(subpattern) || subpattern.length == 0)
			{
				console("ERROR: Invalid mapExpansionPattern");
				return DEFAULT_EXPANSION_PATTERN;
			}

			const parsedSubpattern = new Set();

			for (const subsubpattern of subpattern)
			{
				if (typeof subsubpattern !== "string")
				{
					console("ERROR: Invalid mapExpansionPattern");
					return DEFAULT_EXPANSION_PATTERN;
				}

				const parsedSubsubpattern = Scrim.translate(subsubpattern, null);
				if (!parsedSubsubpattern)
				{
					console("ERROR: Invalid mapExpansionPattern");
					return DEFAULT_EXPANSION_PATTERN;
				}

				parsedSubpattern.add(parsedSubsubpattern);
			}

			parsedPattern.push(Array.from(parsedSubpattern));
		}

		return parsedPattern;
	}

	static loadJSON()
	{
		const map = mapName.replace(/-T[1-4]$/, "");

		const defaultStructure = includeJSON("config/structure.json");
		const defaultRedundantComponents = includeJSON("config/redundantComponents.json");
		const defaultStartingComponents = includeJSON("config/startingComponents.json");
		const defaultComponentWeights = includeJSON("config/componentWeights.json");
		const defaultMinimumResearchTime = includeJSON("config/minimumResearchTime.json");

		const customStructure = includeJSON(`config/${map}/structure.json`);
		const customRedundantComponents = includeJSON(`config/${map}/redundantComponents.json`);
		const customStartingComponents = includeJSON(`config/${map}/startingComponents.json`);
		const customComponentWeights = includeJSON(`config/${map}/componentWeights.json`);

		const allResearch = includeJSON("config/research.json");
		const allStructs = customStructure || defaultStructure;
		const redundantComponents = customRedundantComponents || defaultRedundantComponents;
		const startingComponents = customStartingComponents || defaultStartingComponents;
		const componentWeights = customComponentWeights || defaultComponentWeights;
		const minimumResearchTime = defaultMinimumResearchTime;

		if (!allResearch)
		{
			throw new Error(`Could not find ${map}/research.json in multiplay/script/rules/config`);
		}
		if (!allStructs)
		{
			throw new Error(`Could not find ${map}/structure.json or structure.json in multiplay/script/rules/config`);
		}
		if (!redundantComponents)
		{
			throw new Error(`Could not find ${map}/redundantComponents.json or redundantComponents.json in multiplay/script/rules/config`);
		}
		if (!startingComponents)
		{
			throw new Error(`Could not find ${map}/startingComponents.json or startingComponents.json in multiplay/script/rules/config`);
		}
		if (!componentWeights)
		{
			throw new Error(`Could not find ${map}/componentWeights.json or componentWeights.json in multiplay/script/rules/config`);
		}
		if (!minimumResearchTime)
		{
			throw new Error(`Could not find ${map}/minimumResearchTime.json or minimumResearchTime.json in multiplay/script/rules/config`);
		}

		return { allResearch, allStructs, redundantComponents, startingComponents, componentWeights, minimumResearchTime };
	}
}

const {
	allResearch,
	allStructs,
	redundantComponents,
	startingComponents,
	componentWeights,
	minimumResearchTime,
} = Config.loadJSON();

SaveLoad.persist(Config.cache);

if (include(`multiplay/script/rules/config/${mapName.replace(/-T[1-4]$/, "")}/config.js`) === false)
{
	include("config.js");
}
