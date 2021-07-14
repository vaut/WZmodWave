const gameTimeLimit = 120 * 60 *1000;
namespace("co_");
const USERTYPE = {
	spectator: "spectator",
	player: {
		fighter: "fighter",
		winner: "winner",
		loser: "loser",
	},
};

function co_eventGameInit()
{
	game.gameLimit = gameTimeLimit;
	for (let playnum = 0; playnum < maxPlayers; playnum++)
	{
		if (!playerHaveObjects()||playnum !== AI)
		{
			playerData[playnum].usertype = USERTYPE.spectator;
			continue;
		}
		else
		{
			playerData[playnum].usertype = USERTYPE.player.fighter;
		}
	}
	setTimer("timeOut", gameTimeLimit);
}

function checkEndConditions()
{
	if (game.listWaves.length === 0 && enumDroid(AI).length === 0)
	{
		end(true);
		for (let playnum = 0; playnum < maxPlayers; playnum++)
		{
			playerData[playnum].usertype = USERTYPE.winner;
		}

	}
	if (!playerHaveObjects())
	{
		end(false);
		for (let playnum = 0; playnum < maxPlayers; playnum++)
		{
			playerData[playnum].usertype = USERTYPE.loser;
		}

	}
}

function end(winState)
{
	saveEndData();
	gameOverMessage(winState);
	queue("autohostWin", 30 * 1000);
	chat(ALL_PLAYERS, _("the battle is over, you can leave the room"));
	removeTimer("checkEndConditions");
}


function playerHaveObjects()
{
	let objects = [];
	for (let playnum = 0; playnum < maxPlayers; playnum++)
	{
		if (playnum == AI || allianceExistsBetween(playnum, AI) || !enumStruct(playnum))
		{
			continue;
		}
		if (enumStruct(playnum).length !== 0)
		{
			return true;
		}
		if (enumDroid(playnum).length !== 0)
		{
			return true;
		}
	}
	return false;
}


function timeOut()
{
	game.timeout = true;
	//	debug("TIMEOUT");
	saveEndData();
	gameOverMessage(false);
}
