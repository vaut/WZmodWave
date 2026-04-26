class TrueTemplate
{

}

class SoftTemplate
{

}

class HardTemplate
{

}

/**
 * Static library (fancy namespace)
 */
class Template
{
	// Remap the Stats object: (name -> component) to (Id -> component)
	static Body       = Template.#convert(Stats.Body);
	static Propulsion = Template.#convert(Stats.Propulsion);
	static Weapon     = Template.#convert(Stats.Weapon);
	static Repair     = Template.#convert(Stats.Repair);
	static Sensor     = Template.#convert(Stats.Sensor);
	static ECM        = Template.#convert(Stats.ECM);

	/**
	 * @param {string} body - component Id
	 * @param {string} propulsion - component Id
	 * @param {string[]} turrets - array of component Id
	 * @returns {object} template
	 */
	from(body, propulsion, turrets)
	{
		return { body, propulsion, turrets };
	}

	/**
	 * @param {number} player
	 * @param {string} name
	 * @param {string} body - component Id
	 * @param {string} propulsion - component Id
	 * @param {...string} turrets - component Ids
	 * @returns {object} template
	 */
	static make(player, name, body, propulsion, ...turrets)
	{
		return makeTemplate(player, name, body, propulsion, "", ...turrets);
	}

	static toString(template)
	{
		return template.turrets.join(" ") + " " + template.body + " " + template.propulsion;
	}

	/**
	 * @param {object} template
	 * @param {number} player
	 * @param {number} x
	 * @param {number} y
	 * @returns {object} droid
	 */
	static spawn(template, player, x, y)
	{
		hackNetOff();
		const droid = addDroid(
			player, x, y,
			template.name,
			template.body,
			template.propulsion,
			"", "",
			...template.turrets
		);
		hackNetOn();
		return droid;
	}

	/**
	 * @param {object} template
	 * @returns {string} name
	 */
	static name(template)
	{
		return template.fullname;
	}

	/**
	 * @param {string} body - component name
	 * @param {string} propulsion - component name
	 * @param {...string} turrets - component names
	 * @returns {string} template name
	 */
	static nameFromNames(body, propulsion, ...turrets)
	{
		return turrets.join(" ") + " " + body + " " + propulsion;
	}

	/**
	 * @param {string} body - component Id
	 * @param {string} propulsion - component Id
	 * @param {...string} turrets - component Ids
	 * @returns {string} template name
	 */
	static nameFromIds(body, propulsion, ...turrets)
	{
		return turrets.map(t => Template.getTurretByName(t)).join(" ") + " " + body + " " + propulsion;
	}

	/**
	 * @param {object} template
	 * @returns {number} droid type
	 */
	static droidType(template)
	{
		return template.droidType;
	}

	/**
	 * @param {object} template
	 * @returns {string} component Id
	 */
	static body(template)
	{
		return template.body;
	}

	/**
	 * @param {object} template
	 * @returns {string} component Id
	 */
	static propulsion(template)
	{
		return template.propulsion
	}

	/**
	 * @param {object} template
	 * @returns {string} component Id
	 */
	static brain(template)
	{
		return template.brain;
	}

	/**
	 * @param {object} template
	 * @returns {number} build points
	 */
	static points(template)
	{
		return template.points;
	}

	/**
	 * @param {object} template
	 * @returns {number} energy required
	 */
	static power(template)
	{
		return template.power;
	}

	/**
	 * @param {object} template
	 * @returns {number} energy required
	 */
	static cost(template)
	{
		return template.cost;
	}

	/**
	 * @param {object} template
	 * @returns {string[]} array of component Ids
	 */
	static turrets(template)
	{
		if (template.weapons.length > 0)
		{
			return template.weapons;
		}
		if (template.construct !== "ZNULLCONSTRUCT")
		{
			return template.construct;
		}
		if (template.repair !== "ZNULLREPAIR")
		{
			return template.repair;
		}
		if (template.sensor !== "ZNULLSENSOR")
		{
			return template.sensor;
		}
		if (template.ecm !== "ZNULLECM")
		{
			return template.ecm;
		}
	}

	/**
	 * @param {string} weaponName - component name
	 * @returns {string} component Id
	 */
	static getWeaponByName(weaponName)
	{
		return Stats.Weapon[weaponName] ?? null;
	}

	/**
	 * @param {string} weaponId - component Id
	 * @returns {string} component name
	 */
	static getWeaponById(weaponId)
	{
		return Template.Weapon[weaponId] ?? null;
	}

	/**
	 * @param {string} bodyName - component name
	 * @returns {object|null} component
	 */
	static getBodyByName(bodyName)
	{
		return Stats.Body[bodyName] ?? null;
	}

	/**
	 * @param {string} bodyId - component Id
	 * @returns {object|null} component
	 */
	static getBodyById(bodyId)
	{
		return Template.Body[bodyId] ?? null;
	}

	/**
	 * @param {string} propulsionName - component name
	 * @returns {object|null} component
	 */
	static getPropulsionByName(propulsionName)
	{
		return Stats.Propulsion[propulsionName] ?? null;
	}

	/**
	 * @param {string} propulsionId - component Id
	 * @returns {object|null} component
	 */
	static getPropulsionById(propulsionId)
	{
		return Template.Propulsion[propulsionId] ?? null;
	}

	/**
	 * @param {object} template
	 * @returns {boolean}
	 */
	static isConstruct(template)
	{
		return template.construct !== "ZNULLCONSTRUCT";
	}

	/**
	 * @param {string} turretName - component name
	 * @returns {object|null} component
	 */
	static getTurretByName(turretName)
	{
		return Stats.Weapon[turretName]
			|| Stats.Construct[turretName]
			|| Stats.Repair[turretName]
			|| Stats.Sensor[turretName]
			|| Stats.ECM[turretName]
			|| null;
	}

	/**
	 * @param {string} turretId - component Id
	 * @returns {object|null} component
	 */
	static getTurretById(turretId)
	{
		return Template.Weapon[turretId]
			|| Template.Construct[turretId]
			|| Template.Repair[turretId]
			|| Template.Sensor[turretId]
			|| Template.ECM[turretId]
			|| null;
	}

	/**
	 * @param {string} str - space-separated string in order: turrets, body, propulsion
	 * @returns {object|null} template or null if invalId
	 */
	static fromString(str)
	{
		const words = str.split(" ");

		// Try all ways to partition the end into body + propulsion
		for (let bodyStart = 1; bodyStart < words.length; bodyStart++) {
			for (let propStart = bodyStart + 1; propStart <= words.length; propStart++) {
				const body = words.slice(bodyStart, propStart).join(" ");
				const propulsion = words.slice(propStart).join(" ");

				if (Stats.Body.hasOwnProperty(body) &&
					Stats.Propulsion.hasOwnProperty(propulsion))
				{
					const weaponSlots = Stats.Body[body].WeaponSlots;
					const turretWords = words.slice(0, bodyStart);

					const turrets = partitionIntoTurrets(turretWords, weaponSlots);

					if (turrets !== null) {
						return Template.from(body, propulsion, turrets);
					}
				}
			}
		}

		return null;

		function partitionIntoTurrets(words, maxTurrets)
		{
			if (words.length === 0)
			{
				return [];
			}
			if (maxTurrets === 0)
			{
				return null; // Still have words but no slots left
			}
			// Try using all remaining words as a single turret
			const turret = words.join(" ");
			if (Stats.Weapon.hasOwnProperty(turret))
			{
				return [turret];
			}
			// Try each possible length for the first turret
			for (let i = 1; i < words.length; i++)
			{
				const firstTurret = words.slice(0, i).join(" ");
				if (Stats.Weapon.hasOwnProperty(firstTurret))
				{
					const rest = partitionIntoTurrets(words.slice(i), maxTurrets - 1);
					if (rest !== null)
					{
						return [firstTurret, ...rest];
					}
				}
			}
			return null;
		}
	}

	/**
	 * Remap [name -> component] to [Id -> component]
	 * @param {object}
	 * @returns {object}
	 */
	static #convert(obj)
	{
		return Object.fromEntries(Object.entries(obj).map(
			([Name, component]) => [component.Id, { ...component, Name }]
		));
	}
}
