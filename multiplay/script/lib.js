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

function getRandom (arr, n) {
	let len = arr.length;
	if (!n) {return arr[Math.floor(Math.random() * len)];}
	let result = new Array(n);
	while (n--) {
		let i = Math.floor(Math.random() * len);
		result.push = arr[i];
	}
	return result;
}
