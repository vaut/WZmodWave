class TemplateFactory
{
	// Remap the provided Stats globals so they are more useful (ID -> component)
	static WZBODY = TemplateFactory.convert(Stats.Body);
	static WZPROPULSION = TemplateFactory.convert(Stats.Propulsion);
	static WZWEAPON = TemplateFactory.convert(Stats.Weapon);

	// Lazy generator for every possible combination of body, propulsion, and weapon (> 212520)
	static *SUPERSET()
	{
		for (const bodyID of Object.keys(TemplateFactory.WZBODY))
		{
			for (const propulsionID of Object.keys(TemplateFactory.WZPROPULSION))
			{
				for (const weaponID of Object.keys(TemplateFactory.WZWEAPON))
				{
					const slots = TemplateFactory.WZBODY[bodyID].WeaponSlots;
					const weaponIDs = Array(slots).fill(weaponID);
					yield [bodyID, propulsionID, weaponIDs];
				}
			}
		}
	}

	static allComponents = (() => {
		const allComponents = {};
		for (const componentID of Object.keys(TemplateFactory.WZBODY))
		{
			allComponents[componentID] = 100;
		}
		for (const componentID of Object.keys(TemplateFactory.WZPROPULSION))
		{
			allComponents[componentID] = 100;
		}
		for (const componentID of Object.keys(TemplateFactory.WZWEAPON))
		{
			allComponents[componentID] = 100;
		}
		return allComponents;
	})();

	static from({
		RESEARCH            = {},
		redundantComponents = {},
		componentWeights    = {},
		minimumResearchTime = {},
		startingComponents  = [],
		gameTime = 0,
		rules = {},
	} = {})
	{
		const components = {};
		const researches = [];
		for (const [research, seconds] of Object.entries(minimumResearchTime))
		{
			if (seconds <= gameTime)
			{
				for (const componentID of RESEARCH[research].resultComponents || [])
				{
					components[componentID] = componentWeights[componentID] ?? 100;
				}
				researches.push(research);
			}
		}
		for (const componentID of startingComponents)
		{
			components[componentID] = componentWeights[componentID] ?? 100;
		}
		for (const research of researches)
		{
			for (const componentID of redundantComponents[research] || RESEARCH[research].redComponents || [])
			{
				delete components[componentID];
			}
		}

		return new TemplateFactory(components, [
			...TemplateFactory.RULESETS.VTOL,
			...TemplateFactory.RULESETS.CYBORG,
			...TemplateFactory.RULESETS.BABA,
			...Object.keys(rules).filter(k => rules[k]).map(r => TemplateFactory.RULES[r])
		]);
	}

	constructor(
		components = TemplateFactory.allComponents,
		rules = [
			...TemplateFactory.RULESETS.VTOL,
			...TemplateFactory.RULESETS.CYBORG,
			...TemplateFactory.RULESETS.BABA,
		]
	)
	{
		this.rules = [...TemplateFactory.RULESETS.REQUIRED, ...rules].filter(r => !!r);

		const allowed = [];
		const frequency = new Map();
		for (const [bodyID, propulsionID, weaponIDs] of TemplateFactory.SUPERSET())
		{
			if (components[bodyID] &&
				components[propulsionID] &&
				weaponIDs.every(w => components[w]) &&
				this.allowed(bodyID, propulsionID, weaponIDs))
			{
				frequency[bodyID]       = (frequency[bodyID]       ?? 0) + 1;
				frequency[propulsionID] = (frequency[propulsionID] ?? 0) + 1;
				frequency[weaponIDs[0]] = (frequency[weaponIDs[0]] ?? 0) + 1;
				allowed.push([bodyID, propulsionID, weaponIDs]);
			}
		}
		const templates = new Map();
		for (const [bodyID, propulsionID, weaponIDs] of allowed)
		{
			const bodyChance       = (components[bodyID]       ?? 0) / frequency[bodyID];
			const propulsionChance = (components[propulsionID] ?? 0) / frequency[propulsionID];
			const weaponChance     = (components[weaponIDs[0]] ?? 0) / frequency[weaponIDs[0]];
			const overallChance = Math.ceil(Math.sqrt(bodyChance * propulsionChance * weaponChance));
			// console(`${bodyID} ${propulsionID} ${weaponIDs} --- ${bodyChance} ${propulsionChance} ${weaponChance} --- ${overallChance}`);
			templates.set([bodyID, propulsionID, weaponIDs], overallChance);
		}
		this.select = new WeightedRandom(templates).get;
	}

	produce()
	{
		const template = this.select();
		if (!template)
		{
			return TemplateFactory.truck;
		}
		return {
			name: TemplateFactory.nameFrom(...template),
			body: template[0],
			propulsion: template[1],
			weapons: template[2],
		};
	}

	/**
	* @returns {boolean} true if the template DOES NOT violate any rule
	*/
	allowed(bodyID, propulsionID, weaponIDs)
	{
		for (const rule of this.rules)
		{
			const template = { body: bodyID, propulsion: propulsionID, weapon: weaponIDs[0] };

			if ((rule.if?.(template) && !rule.then?.(template)) ||
				(rule.assert && !rule.assert?.(template)))
			{
				return false;
			}
		}
		return true;
	}

	static nameFrom(bodyID, propulsionID, weaponIDs)
	{
		const name = [];
		for (const weaponID of weaponIDs)
		{
			name.push(TemplateFactory.WZWEAPON[weaponID].name);
		}
		name.push(TemplateFactory.WZBODY[bodyID].name);
		name.push(TemplateFactory.WZPROPULSION[propulsionID].name);
		return name.join(" ");
	}

	static convert(obj) // convert [name -> component] to [ID -> component]
	{
		const result = {};
		for (const [name, component] of Object.entries(obj)) {
			result[component.Id] = { ...component, name };
		}
		return result;
	}

	// Fallback template
	static truck = {
		name: "Truck Viper Wheels",
		body: "Body1REC",
		propulsion: "wheeled01",
		weapons: ["Spade1Mk1"]
	};

	static RULESETS = {
		REQUIRED: [
			{ // must not use ZNULL components
				assert: ({body, propulsion, weapon}) =>
					!body.toUpperCase().includes("ZNULL") &&
					!propulsion.toUpperCase().includes("ZNULL") &&
					!weapon.toUpperCase().includes("ZNULL"),
			},
		],
		VTOL: [
			{ // flying propulsions must use vtol weapons
				if: ({propulsion}) => propulsion == "V-Tol" || propulsion == "Helicopter",
				then: ({weapon}) => weapon.toUpperCase().includes("VTOL"),
			},
			{ // non-flying propulsions must not use vtol weapons
				if: ({propulsion}) => propulsion != "V-Tol" && propulsion != "Helicopter",
				then: ({weapon}) => !weapon.toUpperCase().includes("VTOL"),
			},
			{ // helicopter bodies must use vtol propulsion
				if: ({body}) => body.toUpperCase().includes("CHOPPER"),
				then: ({propulsion}) => propulsion == "V-Tol",
			},
			{ // transport bodies must use vtol propulsion
				if: ({body}) => TemplateFactory.WZBODY[body].BodyClass.toUpperCase().includes("TRANSPORT"),
				then: ({propulsion}) => propulsion == "V-Tol",
			},
		],
		CYBORG: [
			{ // cyborg bodies must use cyborg propulsion
				if: ({body}) => body.toUpperCase().includes("CYB"),
				then: ({propulsion}) => propulsion.toUpperCase().includes("CYB"),
			},
			{ // non-cyborg bodies must not use cyborg propulsion
				if: ({body}) => !body.toUpperCase().includes("CYB"),
				then: ({propulsion}) => !propulsion.toUpperCase().includes("CYB"),
			},
			{ // cyborg propulsions must use cyborg bodies
				if: ({propulsion}) => propulsion.toUpperCase().includes("CYB"),
				then: ({body}) => body.toUpperCase().includes("CYB"),
			},
			{ // non-cyborg propulsions must not use cyborg bodies
				if: ({propulsion}) => !propulsion.toUpperCase().includes("CYB"),
				then: ({body}) => !body.toUpperCase().includes("CYB"),
			},
			{ // cyborg light bodies must use cyborg weapons
				if: ({body}) => body.toUpperCase().includes("CYBORGLIGHT"),
				then: ({weapon}) => weapon.toUpperCase().includes("CYB"),
			},
			{ // cyborg light bodies must not use heavy cyborg weapons
				if: ({body}) => body.toUpperCase().includes("CYBORGLIGHT"),
				then: ({weapon}) => !weapon.toUpperCase().includes("CYB-HVY"),
			},
			{ // cyborg heavy bodies must use heavy cyborg weapons
				if: ({body}) => body.toUpperCase().includes("CYBORGHEAVY"),
				then: ({weapon}) => weapon.toUpperCase().includes("CYB-HVY"),
			},
			{ // non-cyborg bodies must not use cyborg weapons
				if: ({body}) => !body.toUpperCase().includes("CYB"),
				then: ({weapon}) => !weapon.toUpperCase().includes("CYB"),
			},
		],
		BABA: [
			{ // baba bodies must use baba propulsion
				if: ({body}) => TemplateFactory.WZBODY[body].BodyClass.toUpperCase().includes("BABA"),
				then: ({propulsion}) => propulsion.toUpperCase().includes("BABA"),
			},
			{ // non-baba bodies must not use baba propulsion
				if: ({body}) => !TemplateFactory.WZBODY[body].BodyClass.toUpperCase().includes("BABA"),
				then: ({propulsion}) => !propulsion.toUpperCase().includes("BABA"),
			},
			{ // non-baba bodies must not use baba weapons
				if: ({body}) => !TemplateFactory.WZBODY[body].BodyClass.toUpperCase().includes("BABA"),
				then: ({weapon}) =>
					!weapon.toUpperCase().includes("BABA") &&
					!weapon.toUpperCase().includes("BUSCANNON") &&
					!weapon.toUpperCase().includes("JEEP") &&
					!weapon.toUpperCase().includes("BUGGY") &&
					!weapon.toUpperCase().includes("TRIKE"),
			},
			{ // person bodies must use BaBaLegs and BaBaMG
				if: ({body}) => body.toUpperCase().includes("PERSON"),
				then: ({propulsion, weapon}) => propulsion == "BaBaLegs" && weapon == "BaBaMG",
			},
			{ // non-person bodies must not use BaBaLegs
				if: ({body}) => !body.toUpperCase().includes("PERSON"),
				then: ({propulsion}) => propulsion != "BaBaLegs",
			},
			{ // bus body must use normal bus weapons
				if: ({body}) => body == "BusBody",
				then: ({weapon}) => weapon == "BusCannon" || weapon == "BabaFlame",
			},
			{ // firetruck body must use normal firetruck weapons
				if: ({body}) => body == "FireBody",
				then: ({weapon}) => weapon == "BusCannon" || weapon == "BabaFlame",
			},
			{ // jeep bodies must use BJeepMG
				if: ({body}) => body.toUpperCase().includes("B2JEEPBODY"),
				then: ({weapon}) => weapon == "BJeepMG",
			},
			{ // rocket jeep bodies must use BabaRocket
				if: ({body}) => body.toUpperCase().includes("B2RKJEEPBODY"),
				then: ({weapon}) => weapon == "BabaRocket",
			},
			{ // buggy bodies must use BuggyMG
				if: ({body}) => body.toUpperCase().includes("B3BODY-SML-BUGGY01"),
				then: ({weapon}) => weapon == "BuggyMG",
			},
			{ // rocket buggy bodies must use BabaRocket
				if: ({body}) => body.toUpperCase().includes("B3BODYRKBUGGY01"),
				then: ({weapon}) => weapon == "BabaRocket",
			},
			{ // trike bodies must use bTrikeMG
				if: ({body}) => body.toUpperCase().includes("B4BODY-SML-TRIKE01"),
				then: ({weapon}) => weapon == "bTrikeMG",
			},
		],
	};

	static RULES = {
		hoverFlame: { // hovers must use flame
			if: ({propulsion}) => propulsion == "hover01",
			then: ({weapon}) => weapon.toUpperCase().includes("FLAME"),
		},
		strongHover: { // viper, scorpion, mantis, and leopard must not use hover
			if: ({body}) =>
				body == "Body1REC" ||
				body == "Body8MBT" ||
				body == "Body12SUP" ||
				body == "Body2SUP",
			then: ({propulsion}) => propulsion != "hover01",
		},
		lateTracks: { // non-T4 bodies must not use tracks
			if: ({body}) =>
				body != "Body3MBT" &&
				body != "Body7ABT" &&
				body != "Body10MBT" &&
				body != "Body13SUP" &&
				body != "Body14SUP",
			then: ({propulsion}) => propulsion != "tracked01",
		},
		noT4halftracks: { // T4 bodies must not use half-tracks
			if: ({body}) =>
				body == "Body3MBT" ||
				body == "Body7ABT" ||
				body == "Body10MBT" ||
				body == "Body13SUP" ||
				body == "Body14SUP",
			then: ({propulsion}) => propulsion != "HalfTrack",
		},
		noSnails: { // light bodies must not use heavy weapons
			if: ({body}) => TemplateFactory.WZBODY[body].Power < 15000,
			then: ({weapon}) => TemplateFactory.WZWEAPON[weapon].Weight < 5000,
		},
		noLongRange: { // must not use weapons with range greater than 11 tiles
			assert: ({weapon}) => TemplateFactory.WZWEAPON[weapon].MaxRange <= (128 * 11),
		},
		cannonsOnly: { // must only use cannons or gauss
			assert: ({weapon}) =>
				TemplateFactory.WZWEAPON[weapon].ImpactClass === "CANNON" ||
				TemplateFactory.WZWEAPON[weapon].ImpactClass === "GAUSS",
		},
		vtolOff: { // must not use vtol propulsion
			assert: ({propulsion}) => propulsion != "V-Tol",
		},
	};
};
