namespace("pim_")

function pim_eventPlayerLeft(player)
{
	Pim.leavers.push(player);
}

/**
 * Player limit
 */
class Pim
{
	static TYPES = {
		"null"      : 0, // slot is open/closed (no player allocated)
		"player"    : 1, // slot is filled (allocated with player)
		"human"     : 2, // player is human
		"bot"       : 3, // player is AI
		"scav"      : 4, // slot is scavenger (NOTE: not very useful)
		"leaver"    : 5, // player has left the game (e.g. quit/kick)
		"spec"      : 6, // player is spectator (players are still spec even after left) (bots cannot spec)
		"contender" : 7, // player is currently playing (not spectator and not leaver)
	};
	static leavers = [];
	static SPEC_MAX = 20;

	/**
	 * @param {number[]} players
	 * @param {function|null} [f=null] - optionally specify a custom sort function
	 */
	static sort(players, f = null)
	{
		if (f)
		{
			return players.sort(f);
		}
		else
		{
			return players.sort((a, b) => playerData[a].position - playerData[b].position);
		}
	}

////////////////////////////////////////////////////////////////////////////////

	/**
	 * @param {boolean} [sorted=false]
	 * @returns {number[]}
	 */
	static getNulls(sorted = false)
	{
		if (sorted)
		{
			return Pim.sort(Array.from(Pim.iterNulls()));
		}
		else
		{
			return Array.from(Pim.iterNulls());
		}
	}

	/**
	 * @param {boolean} [sorted=false]
	 * @returns {number[]}
	 */
	static getPlayers(sorted = false)
	{
		if (sorted)
		{
			return Pim.sort(Array.from(Pim.iterPlayers()));
		}
		else
		{
			return Array.from(Pim.iterPlayers());
		}
	}

	/**
	 * @param {boolean} [sorted=false]
	 * @returns {number[]}
	 */
	static getHumans(sorted = false)
	{
		if (sorted)
		{
			return Pim.sort(Array.from(Pim.iterHumans()));
		}
		else
		{
			return Array.from(Pim.iterHumans());
		}
	}

	/**
	 * @param {boolean} [sorted=false]
	 * @returns {number[]}
	 */
	static getBots(sorted = false)
	{
		if (sorted)
		{
			return Pim.sort(Array.from(Pim.iterBots()));
		}
		else
		{
			return Array.from(Pim.iterBots());
		}
	}

	/**
	 * @param {boolean} [sorted=false]
	 * @returns {number[]}
	 */
	static getScavs(sorted = false)
	{
		if (sorted)
		{
			return Pim.sort(Array.from(Pim.iterScavs()));
		}
		else
		{
			return Array.from(Pim.iterScavs());
		}
	}

	/**
	 * @param {boolean} [sorted=false]
	 * @returns {number[]}
	 */
	static getLeavers(sorted = false)
	{
		if (sorted)
		{
			return Pim.sort(Array.from(Pim.iterLeavers()));
		}
		else
		{
			return Array.from(Pim.iterLeavers());
		}
	}

	/**
	 * @param {boolean} [sorted=false]
	 * @returns {number[]}
	 */
	static getSpecs(sorted = false)
	{
		if (sorted)
		{
			return Pim.sort(Array.from(Pim.iterSpecs()));
		}
		else
		{
			return Array.from(Pim.iterSpecs());
		}
	}

	/**
	 * @param {boolean} [sorted=false]
	 * @returns {number[]}
	 */
	static getContenders(sorted = false)
	{
		if (sorted)
		{
			return Pim.sort(Array.from(Pim.iterContenders()));
		}
		else
		{
			return Array.from(Pim.iterContenders());
		}
	}

////////////////////////////////////////////////////////////////////////////////

	static *iterNulls() {
		for (let player = 0; player < maxPlayers; player++)
		{
			if (Pim.isNull(player))
			{
				yield player;
			}
		}
	}

	static *iterPlayers() {
		for (let player = 0; player < maxPlayers; player++)
		{
			if (Pim.isPlayer(player))
			{
				yield player;
			}
		}
	}

	static *iterHumans() {
		for (let player = 0; player < maxPlayers; player++)
		{
			if (Pim.isHuman(player))
			{
				yield player;
			}
		}
	}

	static *iterBots() {
		for (let player = 0; player < maxPlayers; player++)
		{
			if (Pim.isBot(player))
			{
				yield player;
			}
		}
	}

	static *iterScavs() {
		for (let player = 0; player < maxPlayers; player++)
		{
			if (Pim.isScav(player))
			{
				yield player;
			}
		}
	}

	static *iterLeavers() {
		for (let player = 0; player < maxPlayers; player++)
		{
			if (Pim.isLeaver(player))
			{
				yield player;
			}
		}
	}

	static *iterSpecs() {
		for (let player = 0; player < maxPlayers; player++)
		{
			if (Pim.isSpec(player))
			{
				yield player;
			}
		}
	}

	static *iterContenders() {
		for (let player = 0; player < maxPlayers; player++)
		{
			if (Pim.isContender(player))
			{
				yield player;
			}
		}
	}

////////////////////////////////////////////////////////////////////////////////

	/**
	 * @returns {number}
	 */
	static countNulls()
	{
		let count = 0;
		for (let player = 0; player < maxPlayers; player++)
		{
			if (Pim.isNull(player))
			{
				count++;
			}
		}
		return count;
	}

	/**
	 * @returns {number}
	 */
	static countPlayers()
	{
		let count = 0;
		for (let player = 0; player < maxPlayers; player++)
		{
			if (Pim.isPlayer(player))
			{
				count++;
			}
		}
		return count;
	}

	/**
	 * @returns {number}
	 */
	static countHumans()
	{
		let count = 0;
		for (let player = 0; player < maxPlayers; player++)
		{
			if (Pim.isHuman(player))
			{
				count++;
			}
		}
		return count;
	}

	/**
	 * @returns {number}
	 */
	static countBots()
	{
		let count = 0;
		for (let player = 0; player < maxPlayers; player++)
		{
			if (Pim.isBot(player))
			{
				count++;
			}
		}
		return count;
	}

	/**
	 * @returns {number}
	 */
	static countScavs()
	{
		let count = 0;
		for (let player = 0; player < maxPlayers; player++)
		{
			if (Pim.isScav(player))
			{
				count++;
			}
		}
		return count;
	}

	/**
	 * @returns {number}
	 */
	static countLeavers()
	{
		let count = 0;
		for (let player = 0; player < maxPlayers; player++)
		{
			if (Pim.isLeaver(player))
			{
				count++;
			}
		}
		return count;
	}

	/**
	 * @returns {number}
	 */
	static countSpecs()
	{
		let count = 0;
		for (let player = 0; player < Pim.SPEC_MAX; player++)
		{
			if (Pim.isSpec(player))
			{
				count++;
			}
		}
		return count;
	}

	/**
	 * @returns {number}
	 */
	static countContenders()
	{
		let count = 0;
		for (let player = 0; player < maxPlayers; player++)
		{
			if (Pim.isContender(player))
			{
				count++;
			}
		}
		return count;
	}

////////////////////////////////////////////////////////////////////////////////

	/**
	 * @param {number} player
	 * @returns {boolean}
	 */
	static isNull(player)
	{
		return !playerData[player].isHuman && !playerData[player].isAI;
	}

	/**
	 * @param {number} player
	 * @returns {boolean}
	 */
	static isPlayer(player)
	{
		return playerData[player].isHuman || playerData[player].isAI;
	}

	/**
	 * @param {number} player
	 * @returns {boolean}
	 */
	static isHuman(player)
	{
		return playerData[player].isHuman;
	}

	/**
	 * @param {number} player
	 * @returns {boolean}
	 */
	static isBot(player)
	{
		return playerData[player].isAI;
	}

	/**
	 * @param {number} player
	 * @returns {boolean}
	 */
	static isScav(player)
	{
		return player === scavengerPlayer;
	}

	/**
	 * @param {number} player
	 * @returns {boolean}
	 */
	static isLeaver(player)
	{
		return Pim.leavers.includes(player);
	}

	/**
	 * @param {number} player
	 * @returns {boolean}
	 */
	static isSpec(player)
	{
		return isSpectator(player);
	}

	/**
	 * @param {number} player
	 * @returns {boolean}
	 */
	static isContender(player)
	{
		return (playerData[player].isHuman || playerData[player].isAI)
			&& (!isSpectator(player))
			&& (!Pim.leavers.includes(player));
	}
}
