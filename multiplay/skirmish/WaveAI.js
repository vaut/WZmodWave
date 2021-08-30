include("multiplay/script/lib.js");
include("multiplay/script/astar.js");
var groups = [];

class Group
{
	constructor(units, obj)
	{
		const num = newGroup();
		this.num = num;
		units.forEach(function (o)
		{
			groupAdd(num, o);
		});
		this.notTakeTarget = gameTime;
		this.secondTargets = [];
		this.obj = obj;
		this.road = [];
		this.updateMainTarget();
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
		this.droids.forEach((droid) =>
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
		while (!(
			this.mainTarget &&
			dist(this.pos, this.mainTarget) > ((mapWidth+mapHeight)/6) &&
			droidCanReach(this.pos, this.mainTarget.x, this.mainTarget.y)
		))
		{
			this.mainTarget = {x: Math.floor(Math.random() * mapWidth), y: Math.floor(Math.random() * mapHeight), type: "tile"};
		}
		debug(1111, this.mainTarget.x, this.mainTarget.y);
		this.road = road(
			aStarDist(this.pos, this.mainTarget, false),
			this.maxRange
		);
	}


	updateSecondTargets()
	{
		let targets = enumEnemyObjects();
		this.road = road(
			aStarDist(this.pos, this.mainTarget, false),
			this.maxRange
		);
		let numPos = this.road[this.pos.x][this.pos.y];
		targets = targets.filter((p) =>
		{
			return (
				this.road[p.x] &&
        this.road[p.x][p.y] !== 0 &&
        this.road[p.x][p.y] >= numPos &&
        !p.isVTOL
			);
		});
		targets.sort((a, b) =>
		{
			return this.road[a.x][a.y] - this.road[b.x][b.y];
		});
		this.secondTargets = targets;
	}

	get secondTarget()
	{
		this.updateSecondTargets();
		if (this.secondTargets.length == 0)
		{
			return this.mainTarget;
		}
		else
		{
			return this.secondTargets[0];
		}
	}

	orderUpdate()
	{
		const target = this.secondTarget;
		//debug (target.x, target.y, this.pos.x, this.pos.y);
		this.droids.forEach((o) =>
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
				//debug(o.x, o.y, target.x, target.y, movePos.x, movePos.y);
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
}

class Arty extends Group
{
	orderUpdate()
	{
		const target = this.secondTarget;
		if (target.type != "tile" )
		{
			return;
		}
		//		debug (this.secondTarget);
		this.droids.forEach((o) =>
		{
			if (target.type == DROID)
			{
				orderDroidLoc(o, DORDER_SCOUT, target.x, target.y);
			}
			else {orderDroidObj(o, DORDER_ATTACK, target);}
		});
	}
}

function eventGameInit()
{
	setTimer("ordersUpdate", 100);
	setTimer("groupsManagement", 1000);
	setTimer("mainTargetsUpdate", 6 * 60 * 1000);
}

function stopGame()
{
	removeTimer("ordersUpdate");
	removeTimer("groupsManagement");
	removeTimer("mainTargetsUpdate");
}


function ordersUpdate()
{
	groups
		.filter((group) =>
		{
			return group.count != 0;
			//		return (Math.abs((group.grupnum % 10) - (gametime % 1000)/100) < 1); //обязательно проверить как работает
		})
		.forEach(function (group)
		{
			group.orderUpdate();
		});
}

function groupsManagement()
{
	groups = groups.filter(function (group)
	{
		return group.count != 0;
	});
	let units = [].concat(
		enumDroid(me, DROID_CYBORG),
		enumDroid(me, DROID_WEAPON)
	);
	units = units.filter(function (obj)
	{
		return !obj.group;
	});
	if (!units.length)
	{
		return;
	}
	let ObjMainTarget = { mainTarget: null };
	groups.push(new Group(units, ObjMainTarget));
	let hover = units.filter((unit) =>
	{
		return (
			unit.propulsion == "wheeled01" ||
      unit.propulsion == "hover01" ||
      unit.propulsion == "CyborgLegs"
		);
	});
	if (hover.length > 0)
	{
		groups.push(new Group(hover, ObjMainTarget));
	}
	let arty = units.filter((unit) =>
	{
		return !Stats.Weapon[unit.weapons[0].fullname].FireOnMove;
	});
	if (arty.length > 0)
	{
		groups.push(new Arty(arty, ObjMainTarget));
	}
}

function mainTargetsUpdate()
{
	groups
		.filter((group) =>
		{
			return group.count != 0;
		})
		.forEach((group) =>
		{
			group.updateMainTarget();
		});
}

function enumEnemyObjects()
{
	let targets = [];
	for (let playnum = 0; playnum < maxPlayers; playnum++)
	{
		if (playnum == me || allianceExistsBetween(me, playnum))
		{
			continue;
		}
		targets = targets.concat(enumStruct(playnum), enumDroid(playnum));
	}
	return targets;
}
