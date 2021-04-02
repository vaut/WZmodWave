include("multiplay/script/lib.js");
include("multiplay/script/astar.js");
var groups = [];

class Group {
	constructor(units, mainTarget) {
		const num = newGroup();
		this.num = num;
		units.forEach(function (o) {
			groupAdd(num, o);
		});
    //		this.type = type;
		this.notTakeTarget = gameTime;
		this.secondTargets = [];
		this.objMainTarget = mainTarget;
	}

	get mainTarget() {
		return this.objMainTarget.mainTarget;
	}

	set mainTarget(mainTarget) {
		this.objMainTarget.mainTarget = mainTarget;
	}

	get droids() {
		return enumGroup(this.num);
	}

	get pos() {
		const arr = this.droids;
		const sum = arr.reduce(
			function (acc, obj) {
				return { x: acc.x + obj.x, y: acc.y + obj.y };
			},
			{ x: 0, y: 0 }
		);
		return { x: sum.x / arr.length, y: sum.y / arr.length };
	}
	get maxRande() {
		let range = 0;
		this.droids.forEach((droid) => {
			if (Stats.Weapon[droid.weapons[0].fullname].MaxRange > range) {
				range = Stats.Weapon[droid.weapons[0].fullname].MaxRange;
			}
		});
		return range / 128;
	}

	get count() {
		return groupSize(this.num);
	}

	updateMainTarget() {
		let targets = enumMainEnemyObjects();
		if (targets.length == 0) {
			targets = enumEnemyObjects();
		}
    //		if (this.count == 0 || targets.length == 0){return;}
		targets = getRandom(targets, 5);
		sortByDist(targets, this.pos);
		this.mainTarget = targets.shift();
	}

	updateSecondTargets() {
		if (enumMainEnemyObjects().length == 0) {
			stopGame();
			return;
		}
		if (
			!this.mainTarget ||
      !getObject(
      	this.mainTarget.type,
      	this.mainTarget.player,
      	this.mainTarget.id
      )
		) {
			this.updateMainTarget();
		}
		let targets = enumEnemyObjects();
		let pos = this.pos;
		let mainTarget = this.mainTarget;
		let poins = aStarDist(pos, mainTarget, false);
    //		let vector = [poins.shift(), points[0]];
    //		let vertor = { x: (vector[0].x - vector[1].x)*10, y: (vector[0].y - vector[1].y)*10 };
		if (poins.length > 1) {
			targets = targets.filter((p) => {
				return (
					cosPhy(this.pos, poins[1], p) > 0.1 &&
          !p.isVTOL &&
          propulsionCanReach("wheeled01", pos.x, pos.y, p.x, p.y) &&
          dist(this.pos, p) < this.maxRande + 5
				);
			});
		}
		if (targets.length == 0) {
			targets = poins.map((p) => {
				p.type = "land";
				return p;
			});
		}
		sortByDist(targets, pos);
		this.secondTargets = targets;
	}

	get secondTarget() {
		if (enumMainEnemyObjects().length == 0) {
			stopGame();
			return null;
		}
		while (
			!(
				this.secondTargets[0] &&
        (this.secondTargets[0].type == "land" ||
          getObject(
          	this.secondTargets[0].type,
          	this.secondTargets[0].player,
          	this.secondTargets[0].id
          ))
			)
		) {
			if (this.secondTargets.length == 0) {
				this.updateSecondTargets();
			} else {
				this.secondTargets.shift();
			}
		}
		return this.secondTargets[0];
	}

	orderUpdate() {
		let target = this.secondTarget;
		this.droids.forEach((o) => {
			if (target.type == "land") {
				orderDroidLoc(o, DORDER_MOVE, this.mainTarget.x, this.mainTarget.y);
				return;
			}
			if (target.type == DROID) {
				let V = { x: target.x - o.x, y: target.y - o.y };
				debug(V.x, V.y);
				let modV = Math.sqrt(V.x * V.x + V.y * V.y);
				let range = Stats.Weapon[o.weapons[0].fullname].MaxRange/128;
				V = { x: (V.x / modV) * range, y: (V.y / modV) * range };
				let movePos = { x: target.x - V.x, y: target.y - V.y };
				debug(target.x, target.y, movePos.x, movePos.y);
				if (droidCanReach(o, movePos.x, movePos.y)) {
					target = movePos;
				}
				orderDroidLoc(o, DORDER_MOVE, target.x, target.y);
				return;
			}
			orderDroidObj(o, DORDER_ATTACK, target);
		});
	}
  /*
	clustering() {
		this.notTakeOrder =
      gameTime + 6 * 1000 + Math.floor(Math.random() * 1000) - 500;

		const pos = this.pos;
		this.droids.forEach(function (o) {
			orderDroidLoc(o, DORDER_MOVE, pos.x, pos.y);
		});
	}*/
}

class Vtol extends Group {
	updateSecondTargets() {
		if (enumMainEnemyObjects().length == 0) {
			stopGame();
			return;
		}
		if (
			!this.mainTarget ||
      !getObject(
      	this.mainTarget.type,
      	this.mainTarget.player,
      	this.mainTarget.id
      )
		) {
			this.updateMainTarget();
		}
		let targets = enumEnemyObjects(),
			pos = this.pos,
			mainTarget = this.mainTarget;
		targets = targets.filter(function (p) {
			return cosPhy(pos, mainTarget, p) > 0.65 && !p.isVTOL;
		});
		sortByDist(targets, pos);
		this.secondTargets = targets;
	}

	orderUpdate() {
		const target = this.secondTarget;
		this.droids.forEach(function (o) {
			orderDroidObj(o, DORDER_ATTACK, target);
			return;
		});
	}
}

class Arty extends Group {
	updateSecondTargets() {
		if (enumMainEnemyObjects().length == 0) {
			stopGame();
			return;
		}
		if (
			!this.mainTarget ||
      !getObject(
      	this.mainTarget.type,
      	this.mainTarget.player,
      	this.mainTarget.id
      )
		) {
			this.updateMainTarget();
		}
		let targets = enumEnemyObjects(),
			pos = this.pos,
			mainTarget = this.mainTarget;
		targets = targets.filter(function (p) {
			return cosPhy(pos, mainTarget, p) > 0.75 && !p.isVTOL;
		});
		sortByDist(targets, pos);
		this.secondTargets = targets;
	}

	orderUpdate() {
		const target = this.secondTarget;
		this.droids.forEach(function (o) {
			if (target.type == DROID) {
				orderDroidLoc(o, DORDER_SCOUT, target.x, target.y);
			} else orderDroidObj(o, DORDER_ATTACK, target);
		});
	}
}

function eventGameInit() {
	setTimer("ordersUpdate", 100);
	setTimer("groupsManagement", 1000);
	setTimer("seconTargetsUpdate", 10 * 1000);
	setTimer("mainTargetsUpdate", 100 * 1000);
  //	setTimer("clustering", 45 * 1000);
}

function stopGame() {
	removeTimer("ordersUpdate");
	removeTimer("groupsManagement");
	removeTimer("seconTargetsUpdate");
	removeTimer("mainTargetsUpdate");
}

function eventDroidIdle(droid) {
	if (droid.player !== me) {
		return;
	}
	groupsManagement();
	let groupNum = droid.group;
	if (groupNum == null) {
		return;
	}
	let group = groups
		.filter(function (group) {
			return group.num == groupNum;
		})
		.shift();
	group.orderUpdate();
}

function ordersUpdate() {
	groups
		.filter(function (group) {
			return true;
      //		return (Math.abs((group.grupnum % 10) - (gametime % 1000)/100) < 1); //обязательно проверить как работает
		})
		.forEach(function (group) {
			group.orderUpdate();
		});
}

function groupsManagement() {
	groups = groups.filter(function (group) {
		return group.count != 0;
	});
	let units = [].concat(
		enumDroid(me, DROID_CYBORG),
		enumDroid(me, DROID_WEAPON)
	);
	units = units.filter(function (obj) {
		return !obj.group;
	});
	if (!units.length) {
		return;
	}
	let ObjMainTarget = { mainTarget: null };
	groups.push(new Group(units, ObjMainTarget));

	let hover = units.filter((unit) => {
		return (
			unit.propulsion == "wheeled01" ||
      unit.propulsion == "hover01" ||
      unit.propulsion == "CyborgLegs"
		);
	});
	if (hover.length > 0) {
		groups.push(new Group(hover, ObjMainTarget));
	}

	let vtol = units.filter((unit) => {
		return unit.isVTOL;
	});
	if (vtol.length > 0) {
		groups.push(new Vtol(vtol, ObjMainTarget));
	}
	let arty = units.filter((unit) => {
		return !Stats.Weapon[unit.weapons[0].fullname].FireOnMove;
	});
	if (arty.length > 0) {
		groups.push(new Arty(arty, ObjMainTarget));
	}
}

function seconTargetsUpdate() {
	groups.forEach(function (group) {
		group.updateSecondTargets();
	});
}

function mainTargetsUpdate() {
	groups.forEach(function (group) {
		group.updateMainTarget();
	});
}
/*
function clustering() {
	groups.forEach(function (group) {
		group.clustering();
	});
}
*/
function enumEnemyObjects() {
	let targets = [];
	for (let playnum = 0; playnum < maxPlayers; playnum++) {
		if (playnum == me || allianceExistsBetween(me, playnum)) {
			continue;
		}
		targets = targets.concat(enumStruct(playnum), enumDroid(playnum));
	}
	return targets;
}

function enumMainEnemyObjects() {
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
	for (let playnum = 0; playnum < maxPlayers; playnum++) {
		if (playnum == me || allianceExistsBetween(me, playnum)) {
			continue;
		}
		for (let i = 0; i < structs.length; ++i) {
			targets = targets.concat(enumStruct(playnum, structs[i]));
		}
    //		targets = targets.concat(enumDroid(playnum), DROID_CONSTRUCT);
	}
	if (targets.length == 0) {
		targets = enumEnemyObjects();
	}
	return targets;
}
