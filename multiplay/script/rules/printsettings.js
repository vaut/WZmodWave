function printGameSettings()
{
	if (Wave.AI === null)
	{
		console(_("ERROR: Missing Wave AI. Enable scavengers or add Wave AI bot."));
		return;
	}

	if (configError)
	{
		console(_("ERROR") + " " + _("Invalid config") + ": " + configError);
		return;
	}

	console(
		"\n" +
		_("Wave Mod") + "\n" +
		"by Vaut + Arc (https://github.com/vaut/WZmodWave)\n" +
		_("Defend the Theta Sector") + "\n" +
		_("Difficulty") + ": " + Math.round(Wave.difficulty * 100) + "%\n" +
		"\n"
	);
}
