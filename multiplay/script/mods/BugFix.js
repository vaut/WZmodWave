namespace("BugFix_");

function BugFix_eventStartLevel()
{
	setTimer("BugFix_longRangeTrucks", TICK_TIME);
	setTimer("BugFix_ghostTransports", 1000);
}

// FIX: Truck repair from a long distance (hold position + patrol)
function BugFix_longRangeTrucks()
{
	for (let player = 0; player < maxPlayers; player++)
	{
		if (playerData[player].isHuman)
		{
			enumDroid(player, DROID_CONSTRUCT).forEach(d =>
			{
				if ((d.order === DORDER_PATROL || d.order === DORDER_SCOUT) && d.action === 5) // DACTION_REPAIR
				{
					orderDroid(d, DORDER_STOP);
					if (player === selectedPlayer)
					{
						console("ERROR:", JSON.stringify(d).slice(0,150));
						playSound("beep8.ogg");
						centreView(mapWidth*Math.round(Math.random()), mapHeight*Math.round(Math.random()));
						cameraZoom(0, 9999999);
					}
				}
			});
		}
	}
}

// FIX: AA can't hit the transport
function BugFix_ghostTransports()
{
	for (let player = 0; player < maxPlayers; player++)
	{
		enumDroid(player, DROID_TRANSPORTER).forEach(d =>
		{
			if (d.health < 10) // less than 10%
			{
				removeObject(d, true);
			}
		});
		enumDroid(player, DROID_SUPERTRANSPORTER).forEach(d =>
		{
			if (d.health < 10) // less than 10%
			{
				removeObject(d, true);
			}
		});
	}
}
