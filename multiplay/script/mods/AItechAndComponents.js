function avalibleScavComponents(player)
{

	const SCAV_COMPONENTS = [
		"B4body-sml-trike01",
		"B3body-sml-buggy01",
		"B2JeepBody",
		"BusBody",
		"FireBody",
		"B1BaBaPerson01",
		"BaBaProp",
		"BaBaLegs",
		"bTrikeMG",
		"BuggyMG",
		"BJeepMG",
		"BusCannon",
		"BabaFlame",
		"BaBaMG",
		"B2crane1",
		"scavCrane1",
		"B2crane2",
		"scavCrane2",
		"ScavSensor",
		"Helicopter",
		"B2RKJeepBody",
		"B2tractor",
		"B3bodyRKbuggy01",
		"HeavyChopper",
		"ScavCamperBody",
		"ScavengerChopper",
		"ScavIcevanBody",
		"ScavNEXUSbody",
		"ScavNEXUStrack",
		"ScavTruckBody",
		"MG1-VTOL-SCAVS",
		"Rocket-VTOL-Pod-SCAVS",
		"ScavNEXUSlink",
		"BaBaCannon",
		"BabaPitRocket",
		"BabaPitRocketAT",
		"BabaRocket",
		"BTowerMG",
		"Mortar1Mk1",
	];

	for (var i = 0, len = SCAV_COMPONENTS.length; i < len; ++i)
	{
		makeComponentAvailable(SCAV_COMPONENTS[i], player);
	}
}


function getRedComponents(timeS)
{
	redComponents = [];
	for (var tech in allRes)
	{
		if (allRes[tech] <= timeS && research[tech].redComponents)
		{
			redComponents = redComponents.concat(research[tech].redComponents);
		}
	}
	return redComponents;
}

function giveResearch()
{
	hackNetOff();
	completeResearchOnTime(getTotalTimeS(), AI);
	hackNetOn();
}
