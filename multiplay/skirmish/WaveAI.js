include ("multiplay/script/lib.js");
var groups = [];

class Group {
	constructor(units){
		let num = newGroup();
		this.num = num;
		units.forEach(function(o){groupAdd(num, o);});
//		this.type = type;
		this.secondTargets=[];
		this.mainTarget=null;
	}

	get droids(){
		return enumGroup(this.num);
	}

	get pos(){
		return enumGroup(this.num)[0];
	}

	get count(){
		return groupSize(this.num);
	}

	updateMainTarget(){
		let targets = enumMainEnemyObjects();
		if (targets.length == 0){targets = enumEnemyObjects();}
//		if (this.count == 0 || targets.length == 0){return;}
		targets = getRandom(targets, 5);
		sortByDist(targets, this.pos);
		this.mainTarget = targets.shift();
	}

	updateSecondTargets(){
		if (!this.mainTarget ||
			!getObject(this.mainTarget.type, this.mainTarget.player, this.mainTarget.id)){
			this.updateMainTarget();
			}
		let targets = enumEnemyObjects(),
			pos = this.pos,
			mainTarget = this.mainTarget;
		targets = targets.filter(function(p){
			return cosPhy(pos, mainTarget, p) > 0.965;
		});
		sortByDist(targets, pos);
		this.secondTargets = targets;
	}

	get shiftSecondTarget(){
		if (this.secondTargets.length == 0){this.updateSecondTargets();}

		let secondTarget = this.secondTargets.shift();
		while (!getObject(secondTarget.type, secondTarget.player, secondTarget.id))
		{
			if (this.secondTargets.length == 0)
			{
				this.updateSecondTargets();
			}
			else {secondTarget = this.secondTargets.shift();}
		}
	return secondTarget;
	}

	orderUpdate(){
		let secondTarget = this.shiftSecondTarget;
		this.droids.forEach(function(o)
		{
			if (o.isVTOL == true) {orderDroidObj(o, DORDER_ATTACK, secondTarget); return;}
			if (secondTarget.type == DROID){orderDroidLoc(o, DORDER_MOVE, secondTarget.x, secondTarget.y);}
			else orderDroidObj(o, DORDER_ATTACK, secondTarget);
		});
//		debug("target", this.num, secondTarget.name, secondTarget.x, secondTarget.y );
	}

/*
	clustering()
	{
		droids.forEach(function(o)
		{
			orderDroidLoc(o, DORDER_SCOUT, this.pos.x, this.pos.y);
		});
	}
*/
}


function eventGameInit()
{
	setTimer("ordersUpdate", 100);
	setTimer("groupsManagement", 1000);
	setTimer("seconTargetsUpdate", 10*1000);
	setTimer("mainTargetsUpdate", 100*1000);
}

function eventDroidIdle(droid){
	if (droid.player !== me){return;}
	groupsManagement();
	let groupNum = droid.group;
	if (groupNum == null ){return;}
	let group = groups.filter(function(group) {return group.num == groupNum;}).shift();
	group.orderUpdate();
}

function ordersUpdate()
{
	groups.filter(function(group)
	{
		return true;
//		return (Math.abs((group.grupnum % 10) - (gametime % 1000)/100) < 1); //обязательно проверить как работает
	}).forEach(function(group)
	{
		group.orderUpdate();
	});
}

function groupsManagement()
{
	groups = groups.filter(function(group)
	{
		return group.count != 0;
	});
	let units = [].concat(enumDroid(me, DROID_CYBORG), enumDroid(me, DROID_WEAPON));
	units = units.filter(function(obj){return (!obj.group);});
	if (!units.length){return;}
//разбить на втол, арту, огонь и для каждого создать свою группу
	groups.push(new Group(units));
}

function enumEnemyObjects()
{
	let targets = [];
	for (let playnum = 0; playnum < maxPlayers; playnum++)
	{
		if (playnum == me || allianceExistsBetween(me, playnum)) {continue;}
		targets = targets.concat(enumStruct(playnum), enumDroid(playnum));
	}
	return targets;
}

function enumMainEnemyObjects(){
	let targets=[];
	let structs = [HQ, FACTORY, POWER_GEN, RESOURCE_EXTRACTOR, LASSAT, RESEARCH_LAB, REPAIR_FACILITY, CYBORG_FACTORY, VTOL_FACTORY, REARM_PAD, SAT_UPLINK, COMMAND_CONTROL];
	for (let playnum = 0; playnum < maxPlayers; playnum++)
	{
		if (playnum == me || allianceExistsBetween(me, playnum)) {continue;}
		for (let i = 0; i < structs.length; ++i)
		{
			targets = targets.concat(enumStruct(playnum, structs[i]));
		}
//		targets = targets.concat(enumDroid(playnum), DROID_CONSTRUCT);
	}
	if (targets.length == 0){targets=enumEnemyObjects();}
	return targets;
}
