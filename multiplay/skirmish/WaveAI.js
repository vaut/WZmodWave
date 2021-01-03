/*jshint esversion: 7 */
namespace("wave_");
debug ("run");
var waves = [];
function wave_eventGameInit()
{
	setTimer("attack", 1*1000);
	setTimer("takeUnits", 5*1000);
}

function attack()
{
	let group = Math.floor(Math.random()*waves.length)+1;
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

function takeUnits()
{
	let newWave = enumDroid(me, DROID_WEAPON);
	newWave = newWave.concat(enumDroid(me, DROID_CYBORG));
	newWave = newWave.filter(function(p){if(p.group) return false; return true;});
	if (!newWave || !newWave.length){return;}
	let group =  newGroup();
	waves[group] = {
		"group" : group,
		"mainTarget" : {"x":Infinity, "y":Infinity},
		"secondTarget":[]
		};
	newWave.forEach(function(o){groupAdd(waves[group].group, o);});
	updateMainTarget(group);
	debug ("new group", group);
	return group;
}

function dist(a,b)
{
	if (!(a.x && b.x && a.y && b.y)) {return Infinity;}
	return ((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));
}
function cosPhy(pos, target1, target2)
{
	let a = {x: target1.x-pos.x, y:target1.y-pos.y};
	let b = {x: target2.x-pos.x, y:target2.y-pos.y};
	return (a.x*b.x+a.y*b.y)*Math.abs(a.x*b.x+a.y*b.y)/((a.x**2+a.y**2)*(b.x**2+b.y**2));
}

function eventDroidIdle(droid){
	if (droid.player !== me){return;}
	let group = droid.group;
	if (group == null ){group =takeUnits(); debug("take", group);}
	if (group == 0){return;}
	target(group);
}

function target(group)
{
	updateSecondTarget(group);
	if (waves[group].secondTarget.length == 0){updateMainTarget(group);}
	let secondTarget = waves[group].secondTarget.shift();
	while (!getObject(secondTarget.type, secondTarget.player, secondTarget.id))
	{
		if (waves[group].secondTarget.length == 0)
		{
			updateMainTarget(group);
			secondTarget = waves[group].secondTarget.shift();
		}
	}
	waves[group].target = secondTarget;
	enumGroup(group).forEach(function(o)
	{
		if (secondTarget.type == DROID){orderDroidLoc(o, DORDER_MOVE, secondTarget.x, secondTarget.y);}
		else orderDroidObj(o, DORDER_ATTACK, secondTarget);
//		debug ("target", secondTarget);
//
	});
	debug("target", group, secondTarget.name, secondTarget.x, secondTarget.y );
}

function updateMainTarget(group)
{
	let targets = getMainTargets();
	if (targets.length == 0){targets = getAllTargets();}
	let target=targets[Math.floor(Math.random()*targets.length)];
	let myWave = enumGroup(group);
	if (myWave.length == 0){ return;}
	let my = myWave[0];
	for (let N=0; N < 5; N++)
	{
		let temp = targets[Math.floor(Math.random()*targets.length)];
		if (dist(target, my) > dist(my, temp))
		{
		target = temp;
		}
	}
//	debug("random target", group, target.name, target.x, target.y);
	waves[group] = {"mainTarget" : target};
	updateSecondTarget(group);

}

function updateSecondTarget(group)
{
	if (enumGroup(group).length == 0){ return;}
	if (!waves[group].mainTarget){ return;}
//	debug(JSON.stringify(waves[group].mainTarget));
	targets = getAllTargets();
	pos = enumGroup(group)[0];
	targets = targets.filter(function(p){
		if(cosPhy(pos, waves[group].mainTarget, p) < 0.96){return true;}
		return false;
	});
	targets.sort(function (a, b) {
		if (dist (a, pos) > dist (b, pos)) {return 1;}
  		if (dist (a, pos) < dist (b, pos)){return -1;}
  		return 0;
	});
//	debug("second targets", JSON.stringify(targets[0]));
	waves[group].secondTarget = targets;
}

function clustering(group)
{
	let [x, y] = [enumGroup(group)[0].x, enumGroup(group)[0].y];
	enumGroup(group).forEach(function(o)
		{
			orderDroidLoc(o, DORDER_SCOUT, x, y);
		});
}

function getAllTargets()
{
	let targets = [];
	for (let playnum = 0; playnum < maxPlayers; playnum++)
	{
		if (playnum == me || allianceExistsBetween(me, playnum)) {continue;}
		targets = targets.concat(enumStruct(playnum), enumDroid(playnum));
	}
	return targets;

}

function getMainTargets()
{
	let targets=[];
	let structs = [HQ, FACTORY, POWER_GEN, RESOURCE_EXTRACTOR, LASSAT, RESEARCH_LAB, REPAIR_FACILITY, CYBORG_FACTORY, VTOL_FACTORY, REARM_PAD, SAT_UPLINK, GATE, COMMAND_CONTROL];
	for (let playnum = 0; playnum < maxPlayers; playnum++)
	{
		if (playnum == me || allianceExistsBetween(me, playnum)) {continue;}
		for (let i = 0; i < structs.length; ++i)
		{
			targets = targets.concat(enumStruct(playnum, structs[i]));
		}
//		targets = targets.concat(enumDroid(playnum), DROID_CONSTRUCT);
	}
	if (targets.length == 0){targets=getAllTargets();}
	return targets;
}



