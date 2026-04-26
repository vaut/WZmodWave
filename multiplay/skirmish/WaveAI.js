include("multiplay/skirmish/lib.js");
include("multiplay/skirmish/astar.js");
var groups = [];
var unusedGroup = newGroup();



class Group
{
	constructor(units, obj)
	{
		const num = newGroup();
		this.num = num;
		units.forEach(unit => groupAdd(num, unit));
		this.notTakeTarget = gameTime;
		this.secondTargets = [];
		this.obj = obj;
		this.road = [];
	}

	get mainTarget()
	{
		return this.obj.mainTarget;
	}

	set mainTarget(mainTarget)
	{
		this.obj.mainTarget = mainTarget;
	}

	get road()
	{
		return this.obj.road;
	}

	set road(road)
	{
		this.obj.road = road;
	}

	get droids()
	{
		return enumGroup(this.num);
	}

	get pos()
	{
		let arr = this.droids;
		const sum = arr.reduce(
			function (acc, obj)
			{
				return { x: acc.x + obj.x, y: acc.y + obj.y };
			},
			{ x: 0, y: 0 }
		);
		let cent = { x: sum.x / arr.length, y: sum.y / arr.length };
		sortByDist(arr, cent);
		return arr[0];
	}
	/*
	get leadPos() {
		let droids = this.droids;
		let lead = droids.shift();
		let minARG = this.road[lead.x][lead.y];
		droids.forEach((droid) => {
			if (this.road[droid.x][droid.y] < minARG) {
				lead = droid;
				minARG = this.road[droid.x][droid.y];
			}
		});
		return lead;
	}
*/
	get maxRange()
	{
		let range = 0;
		this.droids.forEach(droid =>
		{
			if (Stats.Weapon[droid.weapons[0].fullname].MaxRange > range)
			{
				range = Stats.Weapon[droid.weapons[0].fullname].MaxRange;
			}
		});
		return Math.round(range / 128);
	}

	get count()
	{
		return groupSize(this.num);
	}

	updateMainTarget()
	{
		if (noOpponents())
		{
			stopGame();
			return null;
		}
		let targets = enumMainEnemyObjects();
		if (targets.length == 0)
		{
			targets = enumEnemyObjects();
		}
		// targets = targets.filter(obj => droidCanReach(this.pos, obj.x, obj.y));
		if (targets.length == 0)
		{
			return false;
		}
		shuffle(targets);
		targets = targets.slice(0, 5);
		sortByDist(targets, this.pos);
		this.mainTarget = targets.shift();
		this.road = road(
			aStarDist(this.pos, this.mainTarget, false),
			this.maxRange
		);
		return true;
	}

	updateSecondTargets()
	{
		if (noOpponents())
		{
			stopGame();
			return null;
		}
		if (!this.mainTarget ||
			!getObject(this.mainTarget.type, this.mainTarget.player, this.mainTarget.id))
		{
			if (this.updateMainTarget() === false)
			{
				return false;
			}
		}

		let targets = enumEnemyObjects();
		let numPos = this.road[this.pos.x][this.pos.y];
		targets = targets.filter(p =>
			this.road[p.x] &&
			this.road[p.x][p.y] !== 0 &&
			this.road[p.x][p.y] >= numPos &&
			!p.isVTOL
		);

		if (targets.length === 0)
		{
			targets = [this.mainTarget];
		}
		else
		{
			shuffle(targets);
			targets.sort((a, b) => this.road[a.x][a.y] - this.road[b.x][b.y]);
		}

		this.secondTargets = targets;
	}

	get secondTarget()
	{
		if (noOpponents())
		{
			stopGame();
			return null;
		}

		// We find in all secondary targets the first still living unit. And we return it
		let theTarget = this.secondTargets.find(o => o && getObject(o.type, o.player, o.id));
		if (theTarget)
		{
			return theTarget;
		}

		// If we have reached here, then there are no living targets. We get a new list of targets.
		// And return the first target from it.
		this.updateSecondTargets();
		theTarget = this.secondTargets.shift();
		return theTarget;
	}

	orderUpdate()
	{
		const target = this.secondTarget;
		// debug (target.x, target.y, this.pos.x, this.pos.y);
		this.droids.forEach(o =>
		{
			let V = { x: target.x - o.x, y: target.y - o.y };
			let modV = Math.sqrt(V.x * V.x + V.y * V.y);
			let range = Stats.Weapon[o.weapons[0].fullname].MaxRange / 128 - 3;
			V = { x: (V.x / modV) * range, y: (V.y / modV) * range };
			let movePos = {
				x: Math.ceil(target.x - V.x),
				y: Math.ceil(target.y - V.y),
			};
			if (droidCanReach(o, movePos.x, movePos.y))
			{
				// debug(o.x, o.y, target.x, target.y, movePos.x, movePos.y);
				orderDroidLoc(o, DORDER_MOVE, movePos.x, movePos.y);
				return;
			}
			else
			{
				orderDroidLoc(o, DORDER_MOVE, target.x, target.y);
				return;
			}
		});
	}

	toUnused()
	{
		this.droids.forEach(droid => groupAdd(unusedGroup, droid));
	}

}

class Vtol extends Group
{
	updateSecondTargets()
	{
		if (!this.mainTarget ||
			!getObject(this.mainTarget.type, this.mainTarget.player, this.mainTarget.id))
		{
			if (this.updateMainTarget() === false)
			{
				return false;
			}
		}
		let targets = enumEnemyObjects(),
		pos = this.pos,
		mainTarget = this.mainTarget;
		targets = targets.filter(p => cosPhy(pos, mainTarget, p) > 0.65 && !p.isVTOL);
		shuffle(targets);
		sortByDist(targets, pos);
		this.secondTargets = targets;
	}

	orderUpdate()
	{
		const target = this.secondTarget;
		this.droids
			.filter(d => d.weapons[0].armed >= 1)
			.forEach(o => orderDroidLoc(o, DORDER_SCOUT, target.x, target.y));
		this.droids
			.filter(d => d.weapons[0].armed < 1)
			.forEach(o => orderDroid(o, DORDER_REARM));
	}
}

class Arty extends Group
{
	orderUpdate()
	{
		const target = this.secondTarget;
		// debug (this.secondTarget);
		this.droids.forEach(o =>
		{
			if (target.type == DROID)
			{
				orderDroidLoc(o, DORDER_SCOUT, target.x, target.y);
			}
			else
			{
				orderDroidObj(o, DORDER_ATTACK, target);
			}
		});
	}
}

class Speed extends Group
{
	orderUpdate()
	{
		const target = this.mainTarget;
		// debug (target.x, target.y, this.pos.x, this.pos.y);
		this.droids.forEach(o => orderDroidLoc(o, DORDER_MOVE, target.x, target.y));
	}
}

function eventGameInit()
{
	setTimer("ordersUpdate", 100);
	setTimer("groupsManagement", 1000);
	setTimer("secondTargetsUpdate", 1000);
	setTimer("mainTargetsUpdate", 10 * 1000);
}

function stopGame()
{
	groups.forEach(group => group.toUnused());
	removeTimer("ordersUpdate");
	removeTimer("groupsManagement");
	removeTimer("secondTargetsUpdate");
	removeTimer("mainTargetsUpdate");
}



function ordersUpdate()
{
	if (noOpponents())
	{
		stopGame();
		return null;
	}
	groups
		.filter(group =>
		{
			if (group.count == 0)
			{
				return false;
			}
			if (group.constructor.name == "Vtol")
			{
				return true;
			}
			if (group.constructor.name == "Speed")
			{
				return ((group.num % 2) == Math.round(gameTime/100)%2);
			}
			return ((group.num % 4) == Math.round(gameTime/100+1)%4);
		})
		.forEach(group => group.orderUpdate());
}

function groupsManagement()
{
	if (noOpponents())
	{
		stopGame();
		return null;
	}
	groups = groups.filter(group => group.count > 0);
	let units = [].concat(
		enumDroid(me, DROID_CYBORG),
		enumDroid(me, DROID_WEAPON),
		enumDroid(me, DROID_PERSON)
	);
	units = units.filter(obj => !obj.group);
	if (units.length === 0)
	{
		return;
	}
	let ObjMainTarget = { mainTarget: null };
	groups.push(new Group(units, ObjMainTarget));
	let hover = units.filter(unit =>
		unit.propulsion == "wheeled01" ||
		unit.propulsion == "hover01" ||
		unit.propulsion == "CyborgLegs"
	);
	if (hover.length > 0)
	{
		groups.push(new Group(hover, ObjMainTarget));
	}

	let vtol = units.filter(unit => unit.isVTOL);
	if (vtol.length > 0)
	{
		groups.push(new Vtol(vtol, { mainTarget: null }));
	}
	let arty = units.filter(unit => !Stats.Weapon[unit.weapons[0].fullname].FireOnMove);
	if (arty.length > 0)
	{
		groups.push(new Arty(arty, ObjMainTarget));
	}
}

function secondTargetsUpdate()
{
	if (noOpponents())
	{
		stopGame();
		return null;
	}
	groups
		.filter(group => group.count > 0 && (group.num % 5) == Math.round(gameTime/1000) % 5)
		.forEach(group => group.updateSecondTargets());
}

function mainTargetsUpdate()
{
	if (noOpponents())
	{
		stopGame();
		return null;
	}
	groups
		.filter(group => group.count > 0 && (group.num % 10) == Math.round(gameTime/1000/10) % 10)
		.forEach(group => group.updateMainTarget());
}

function noOpponents()
{
	if (gameTime < 1000)
	{
		return false;
	}
	return countStruct("A0LightFactory", ENEMIES) === 0
		&& countStruct("A0CyborgFactory", ENEMIES) === 0
		&& countDroid(DROID_ANY, ENEMIES) === 0;
}

function enumEnemyObjects()
{
	let targets = [];
	for (const player of iterEnemies())
	{
		targets = targets.concat(enumStruct(player), enumDroid(player));
	}
	return targets;
}

function enumMainEnemyObjects()
{
	let targets = [];
	let structs = [
		HQ,
		FACTORY,
		POWER_GEN,
		RESOURCE_EXTRACTOR,
		LASSAT,
		RESEARCH_LAB,
		REPAIR_FACILITY,
		CYBORG_FACTORY,
		VTOL_FACTORY,
		REARM_PAD,
		SAT_UPLINK,
		COMMAND_CONTROL,
	];
	for (const player of iterEnemies())
	{
		for (let i = 0; i < structs.length; ++i)
		{
			targets = targets.concat(enumStruct(player, structs[i]));
		}
		// targets = targets.concat(enumDroid(player), DROID_CONSTRUCT);
	}
	if (targets.length === 0)
	{
		targets = enumEnemyObjects();
	}
	return targets;
}
