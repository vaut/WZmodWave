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

Tous les paramètres sont dans `multiplay/script/rules/settings.json`:

```text
{
	"protectTimeM": 4, # le temps avant la première vague
	"totalGameTime": 90, # le temps qu’il faut avant que les unités débarquées n’atteigne le rang 16
	"expansion": 10, # la vitesse d’expansion de la map, le nombre des carreaux qui s’ajoutent
	"startHeight": 35, # le radius de la zone de départ (où la hauteur, lorsque applicable)
	"Kpower" : 0.25, # le multiplicateur de la taille de débarquement par le temps
	"doublePowerM": 20, # le multiplicateur de la taille de débarquement par le temps au carré
	"multiplierForStructures": 0.7, # contrôler le nombre de structures
	"pauseM": 2, # le temps entre deux vagues
	"inWavePauseS": 11, # le temps entre deux débarquements dans la même vague
	"timeHandicapM": 0.5 # le retard de l’AI dans les recherches, en minutes
	"Kfinal": 2, # le multiplicateur de la taille de la dernière vague
	"expansionDirection" : "north"/"all" # vers où la map va s’aggrandir: Nord uniquement ou toutes les directions
	"RESIDUAL": 0.03, # une vague est considérée comme vaincue lorsqu'il ne reste plus que 3 % des unités
	"INCREM_PAUSEM": 0.1, # à chaque vague, augmentez le délai entre les vagues en minutes
	"waterWave": false, # les vagues peuvent débarquer dans l'eau
	"playersManipulation": true, # modifications apportées à la base du joueur et restrictions au début du jeu
	"structs": ["DEFENSE", "GENERIC", "REARM PAD"], # Types de structures autorisées
	"enableExperience": true, # Grades des unités. Activé/Désactivé
}
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
