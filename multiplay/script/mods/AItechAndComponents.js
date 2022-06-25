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

function getRedBody(timeS)
{
	// кобра делает устаревшими все предыдущие тела, кроме киборгов
	let redBodies = [
		"B1BaBaPerson01",
		"B1BaBaPerson01-Ultimate",
		"B2JeepBody",
		"B2JeepBody-Ultimate",
		"B2RKJeepBody",
		"B2RKJeepBody-Ultimate",
		"B2crane1",
		"B2crane2",
		"B2tractor",
		"B3body-sml-buggy01",
		"B3body-sml-buggy01-Ultimate",
		"B3bodyRKbuggy01",
		"B3bodyRKbuggy01-Ultimate",
		"B4body-sml-trike01",
		"B4body-sml-trike01-Ultimate",
		"Body1REC",
		"Body4ABT",
		"BusBody",
		"FireBody",
		"HeavyChopper",
		"ScavCamperBody",
		"ScavIcevanBody",
		"ScavNEXUSbody",
		"ScavNEXUStrack",
		"ScavTruckBody",
		"ScavengerChopper",
		"SuperTransportBody",
		"TransporterBody",
		"ZNULLBODY"
	];
	for (var tech in allRes)
	{
		if (allRes[tech] <= timeS && tech == "R-Vehicle-Body05")
		{
			return redBodies;
		}
	}
	return [];
}
