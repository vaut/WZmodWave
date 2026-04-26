# Mode Wave Defense
Dans ce mod, vous allez vous défendre contre des ennemis qui arrivent par des vagues. Vous commencez au Sud de la map, et seule une bande étroite de terre est disponible, le reste de la map est inaccessible. Vous avez 4 minutes pour vous préparer à la première vague.

A la fin de la minuterie, la map s'élargit de 10 carreaux, et le débarquement commence. Lorsque vous aurez détruit toutes les unités, vous aurez 2 minutes avant la vague suivante.
Pour gagner, vous devez débloquer toute la map.

## Particularités à savoir
- Les unités débarquées sont toujours technoliguqmeent plus avancées que les vôtres. En théorie, c’est possible
de faire avancer la recherche à la même vitesse que votre adversaire, mais en pratique, vous aurez toujours un train de retard pour les fabriquer.
- Le nombre des unités débarquées augmente avec le carré du temps, et linéairement avec le nombre de derricks.
- Le débarquement contient des VTOL.
- Les limites de constructions dépendent du nombre des puits de pétrole sur la map.
- Les limites ne dépendent pas du nombre de joueurs.
- Ce mod ne supporte pas la sauvegarde ni le chargement.

## Comment le lancer
1. Installez la map 10c-Stone-Jungle-v3w.wz
2. Choisissez-la (taille "10 joueurs")
3. Modifiez le AI par défaut, et mettez «waveAI» dans la dernière case. Modifiez la diffuculté pour réduire/augmenter le nombre des unités lors du débarquement.

## Tuning et le choix de la map
`10c-Stone-Jungle-v3w.wz` n’est pas la seule disponible, mais celle qui est recommandée. Il est possible de modifier l’expansion de la map vers le Nord uniquement, pour ce faire, utilisez la map `10c-ntw_trail10pro2.wz` et les settings qui vont avec `multiplay/script/rules/settings.json_ntw_trail10pro2`, à mettre à la place de `multiplay/script/rules/settings.json`.

### Tuning
Par défaut, le mod utilisera:
- `multiplay/script/rules/settings.json`
- `multiplay/script/rules/research.json`
- `multiplay/script/rules/structure.json`
- `multiplay/script/rules/startingComponents.json`
- `multiplay/script/rules/componentWeights.json`
- `multiplay/script/rules/redundantComponents.json`
Ou, s'il est présent:
- `multiplay/script/rules/<MapName>/settings.json`
- `multiplay/script/rules/<MapName>/research.json`
- `multiplay/script/rules/<MapName>/structure.json`
- `multiplay/script/rules/<MapName>/startingComponents.json`
- `multiplay/script/rules/<MapName>/componentWeights.json`
- `multiplay/script/rules/<MapName>/redundantComponents.json`

Explication pour `settings.json`:
```
{
	"totalGameTime": 90,  # le temps qu’il faut avant que les unités débarquées n’atteigne le rang 16
	"protectTimeM": 3,    # le temps avant la première vague
	"pauseM": 0.8,        # le temps entre deux vagues
	"inWavePauseS": 7,    # le temps entre deux débarquements dans la même vague
	"INCREM_PAUSEM": 0.1, # à chaque vague, augmentez le délai entre les vagues en minutes
	"timeHandicapM": 2,   # le retard de l’AI dans les recherches, en minutes
	"RESIDUAL": 0.03,     # une vague est considérée comme vaincue lorsqu'il ne reste plus que 3% des unités
                                     
	"startHeight": 50,             # le radius de la zone de départ (où la hauteur, lorsque applicable)
	"expansionDirection": "all",   # vers où la map va s’aggrandir: Nord uniquement ou toutes les directions
	"expansionAmount": 24,         # la vitesse d’expansion de la map, le nombre des carreaux qui s’ajoutent
	"transporterUnitCount": 45,    # nombre d'unités qui atterrissent à partir de chaque transporteur
	"transporterExperience": 9999, # attribue un rang aux transporteurs (plus difficiles à détruire)
                                  
	"Kpower": 0.15,        # le multiplicateur de la taille de débarquement par le temps
	"doublePowerM": 120,   # le multiplicateur de la taille de débarquement par le temps au carré
	"startPowerC": 0,      # puissance supplémentaire constante
	"Kfinal": 3,           # le multiplicateur de la taille de la dernière vague
	"structPower": {       # types de structures autorisés
		"DEFENSE": 0.01,   # nombre de structures de DÉFENSE
		"REARM PAD": 0.001 # nombre de structures REARM PAD
	},                             
                          
	"waterLanding": false,            # les unités peuvent atterrir dans l'eau
	"waterStructure": false,          # les structures peuvent apparaître sur l'eau
	"enableWaveExperience": true,     # Grades des unités. Activé/Désactivé
	"waveExperienceModifier": null,   # vitesse à laquelle les unités ennemies gagnent de l'expérience (null = par défaut)
	"playerExperienceModifier": null, # vitesse à laquelle vos unités gagnent de l'expérience (null = par défaut)
	"playersManipulation": true       # modifications apportées à la base du joueur et restrictions au début du jeu
}
```
Explication pour `componentWeights.json`:
```
{
	"Rocket-Sunburst": 40,     # 60% de moins
	"EMP-Cannon": 50,          # 50% de moins
	"CyborgLegs": 100,         # défaut
	"V-Tol": 0,                # Désactivé
	"Rocket-VTOL-Sunburst": 0, # Désactivé
	"RailGun1Mk1": 300,        # 300% de plus
	"RailGun2Mk1": 300,        # 350% de plus
	"TransporterBody": 0,      # Désactivé
	"SuperTransportBody": 0,   # Désactivé
	"CommandTurret1": 0        # Désactivé
}
```
Explication pour `redundantComponents.json`:
```
{
	"R-Vehicle-Prop-Halftracks": [
		"wheeled01"                # Arrêter d'utiliser les roues après avoir recherché Half-Track
	],
	"R-Wpn-Howitzer-Incendiary": [
		"Mortar-Incendiary"        # Arrêter d'utiliser le mortier incendiaire après avoir recherché Incendiary Howitzer
	],
	"R-Vehicle-Body11": [
		"Body1REC"                 # Arrêter d'utiliser le Viper après avoir recherché le Python
	]
}
```
Explication pour `startingComponents.json`:
```
[
	"B2JeepBody",
	"BusBody",    # Rendre les composants disponibles pour l'IA Wave au démarrage
	"BaBaMG"     
]
```


## Conseils pour réussir
- l’AI n’est pas très maline, et ne fait pas de distinction entre votre armée, les murs, et les points de défense, et va détruire méthodiquement tout ce qu’elle trouve. Construisez des défenses peu chères pour faire distraction.
- Le type des chars dans le débarquement ne dépend que du temps, vous pouvez chercher des combinaisons de chars + ou - efficaces
- L’ennemi n’a pas de radars mobiles, mais possède des tours de radar, et l’artillerie
- Après une heure de jeu, le nombre des unités débarquées devient très grand, vaut mieux gagner avant, si possible
- Vous pouvez faire durer le jeu en laissant quelques unités en vie (VTOL ne compte pas, et les structures non plus), ça vous laisse de la marge pour respirer et reconstruire. Ceci dit, le nombre des unités débarquées augmente avec le temps...
- N’oubliez pas de construire vos usines lorsque les limites de constructions augmentent
- Le débarquement est très dense, mais près de la moitié des chars est constituées de corps légers. Quelques grandes explosions pour nettoyer tout ça...
- Les unités débarquées sont «Veteran», donc plus costauds que d’habitude
