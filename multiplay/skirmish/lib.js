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

function sortBymDist(list, pos)
{
	return list.sort((a, b) => mDist(a, pos) - mDist(b, pos));
}

function sortByDist(list, pos)
{
	return list.sort((a, b) => dist(a, pos) - dist(b, pos));
}

function shuffle(arr)
{
	for (let i = arr.length - 1; i > 0; i--)
	{
		const j = Math.floor(Math.random() * i);
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

function *iterEnemies()
{
	for (let player = 0; player < maxPlayers; player++)
	{
		if (player != me && !allianceExistsBetween(me, player))
		{
			yield player;
		}
	}
}
