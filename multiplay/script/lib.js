if ( typeof timeBaseTech == "undefined")
{
	include("multiplay/script/rules/variables.js");
}

function dist(a,b)
{
	if (!(a.x && b.x && a.y && b.y)) {return Infinity;}
	return ((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));
}

function mDist(a,b)
{
	if (!(a.x && b.x && a.y && b.y)) {return Infinity;}
	return (Math.abs(a.x-b.x)+Math.abs(a.y-b.y));
}

function cosPhy(pos, target1, target2)
{
	let a = {x: target1.x-pos.x, y:target1.y-pos.y};
	let b = {x: target2.x-pos.x, y:target2.y-pos.y};
	return (a.x*b.x+a.y*b.y)*Math.abs(a.x*b.x+a.y*b.y)/((a.x**2+a.y**2)*(b.x**2+b.y**2));
}

function sortBymDist (list, pos)
{
	const sorter = (a, b) => mDist (a, pos) -  mDist (b, pos);
	return list.sort(sorter);
}

function sortByDist (list, pos)
{
	const sorter = (a, b) => dist (a, pos) -  dist (b, pos);
	return list.sort(sorter);
}

function getRandom (arr, n)
{
	let len = arr.length;
	if (!n) {return arr[Math.floor(Math.random() * len)];}
	let result = [];
	while (n--)
	{
		let i = Math.floor(Math.random() * len);
		result.push(arr[i]);
	}
	return result;
}

function getTotalTimeS()
{
	if (((gameTime / 1000) + getStartTime()) >= settings.timeHandicapM/60)
	{
		return ((gameTime / 1000) + getStartTime() - settings.timeHandicapM/60);
	}
	else
	{
		return ((gameTime / 1000) + getStartTime());
	}
}

function getStartTime()
{

	var startTime = 1;
	var techLevel = getMultiTechLevel();
	if (baseType == CAMP_BASE)
	{
		startTime = timeBaseTech;
	}
	if (baseType == CAMP_WALLS)
	{
		startTime = timeAdvancedBaseTech;
	}
	if (techLevel == 2)
	{
		startTime = timeT2;
	}
	if (techLevel == 3)
	{
		startTime = timeT3;
	}
	if (techLevel == 4)
	{
		startTime = 100 * 60;
	}
	return startTime;
}

function getNumOil()
{

	const limits =  getScrollLimits();
	numOil = enumFeature(ALL_PLAYERS).filter(function (e)
	{
		if (e.stattype == OIL_RESOURCE && inScrollLimits(e,limits)) {return true;}
		return false;
	}).length;
	numOil += enumStruct(scavengerPlayer, RESOURCE_EXTRACTOR).length;
	for (let playnum = 0; playnum < maxPlayers; playnum++)
	{
		numOil += enumStruct(playnum, RESOURCE_EXTRACTOR).length;
	}
	return numOil;
}


function inScrollLimits(obj,limits)
{
	if (obj.x > limits.x+BORDER && obj.x < limits.x2-BORDER && obj.y > limits.y+BORDER && obj.y < limits.y2-BORDER)
	{
		return true;
	}
	return false;
}
