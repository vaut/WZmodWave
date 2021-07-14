/*jshint esversion: 7 */

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

var game = {
	get totalTimeS()
	{
		return ((gameTime / 1000) + getStartTime());
	}
};

function getStartTime()
{
	const cleanTech = 1;
	const timeBaseTech = 4.5 * 60; // after Power Module
	const timeAdvancedBaseTech = 7.9 * 60; // after Mortar and Repair Facility
	const timeT2 = 17 * 60;
	const timeT3 = 26 * 60; // after Needle Gun and Scourge Missile
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
