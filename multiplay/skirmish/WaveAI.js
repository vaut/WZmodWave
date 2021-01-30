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
		this.updateMainTarget();
		this.orderUpdate();
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
		if (this.count == 0 || targets.length == 0){return;}
		targets = getRandom(targets, 5);
		this.mainTarget = sortByDist(targets, this.pos).shift;
		this.updateSecondTargets();
	}

	updateSecondTargets(){
		if (this.count == 0 || !this.mainTarget){return;}
//		debug(JSON.stringify(waves[group].mainTarget));
		let targets = enumEnemyObjects;
		targets = targets.filter(function(p){
			return cosPhy(this.pos, this.mainTarget, p) < 0.965;
		});
		sortByDist(targets, pos);
//		debug("second targets", JSON.stringify(targets[0]));
		this.secondTarget = targets;
	}
	
	get shiftSecondTarget(){
		if (this.secondTargets.length == 0){this.updateMainTarget(group);}
		let secondTarget = this.secondTargets.shift();
		while (!getObject(secondTarget.type, secondTarget.player, secondTarget.id))
		{
			if (waves[group].secondTargets.length == 0)
			{
				this.updateMainTarget();
				secondTarget = this.secondTargets.shift();
			}
		}
	return secondTarget;
	}	

	orderUpdate(){
//	updateSecondTarget(group);
		let secondTarget = this.shiftSecondTarget;
//	this.target = secondTarget;
//	let mainTarget = waves[group].mainTarget;
		this.droids.forEach(function(o)
		{
			if (o.isVTOL == true) {orderDroidObj(o, DORDER_ATTACK, secondTarget); return;}
			if (secondTarget.type == DROID){orderDroidLoc(o, DORDER_MOVE, secondTarget.x, secondTarget.y);}
			else orderDroidObj(o, DORDER_ATTACK, secondTarget);
//		debug ("target", secondTarget);
//
		});
		debug("target", group, secondTarget.name, secondTarget.x, secondTarget.y );
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
//	waves : N,
}	 



function eventGameInit()
{
	setTimer("unitsСontrol", 1*100);
	setTimer("groupsManagement", 1*1000);
}

function eventDroidIdle(droid){
	if (droid.player !== me){return;}
	groupsManagement();
	let groupNum = droid.group;
	if (groupNum == null ){return;}
	groups.groupNum.orderUpdate();
}

function unitsСontrol()
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
/*
function attack(group)
{
//	let group = Math.floor(Math.random()*waves.length)+1;
	let myWave = enumGroup(group);
//	debug(group);
	if (myWave.length == 0)
	{
		return;
	}
	let myTarget = waves[group].target;
	if (!myTarget)
	{
		debug("fist target", group);
		target(group);
		return;
	}
	else
	{
//		debug (target, getObject(target.type, target.player, target.id));
		if (!getObject(myTarget.type, myTarget.player, myTarget.id))
		{
			debug("force target", group);
			target(group);
		}
	}
}
*/

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
