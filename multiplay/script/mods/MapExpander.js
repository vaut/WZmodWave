/**
 * Controls the map expansion
 *
 * Requires Scrim.js
 */
class MapExpander
{
	/**
	 * Create a MapExpander.
	 *
	 * @param {*} mapExpansionPattern - Define the behavior. Examples:
	 *   "mapExpansionPattern": [["north"]],
	 *   "mapExpansionPattern": [["north", "west", "south", "east"]],
	 *   "mapExpansionPattern": [
	 *       ["north"],
	 *       ["west"],
	 *       ["south"],
	 *       ["east"]
	 *   ],
	 *   "mapExpansionPattern": [
	 *       ["north", "south"],
	 *       ["west", "east"]
	 *   ],
	 */
	constructor(mapExpansionPattern)
	{
		this.mapExpansionPattern = mapExpansionPattern;
		this.key = MapExpander.generateKey(this.mapExpansionPattern);
		this.startShape = MapExpander.START_SHAPE[this.key];
	}

	/**
	 * @param {number} n - the current number (1, 2, 3, ...)
	 * @returns {string[]} the directions that the map will expand
	 */
	getExpansionDirection(n)
	{
		return this.mapExpansionPattern[(n - 1) % this.mapExpansionPattern.length];
	}

	/**
	 * @param {string[]} directions
	 * @param {number} amount - number of tiles to expand the map. Negative numbers not supported
	 */
	static expand(directions, amount)
	{
		directions.forEach(direction => Scrim.growDirection(direction, amount));
	}

	/**
	 * Set the scroll limits using setScrollLimits()
	 *
	 * @param {number} size - diameter
	 * @param {number} [width] - optional
	 * @param {number} [height] - optional
	 * @returns {number[]}
	 */
	setStartingScrollLimits(size, width = mapWidth, height = mapHeight)
	{
		const startArea = { // key -> area
			"x2,y2"       : [0                , 0                 , size             , size              ],
			"x1,x2,y2"    : [width/2 - size/2 , 0                 , width/2 + size/2 , size              ],
			"x1,y2"       : [width   - size   , 0                 , width            , size              ],
			"y1,x2,y2"    : [0                , height/2 - size/2 , size             , height/2 + size/2 ],
			"x1,y1,x2,y2" : [width/2 - size/2 , height/2 - size/2 , width/2 + size/2 , height/2 + size/2 ],
			"x1,y1,y2"    : [width   - size   , height/2 - size/2 , width            , height/2 + size/2 ],
			"y1,x2"       : [0                , height   - size   , size             , height            ],
			"x1,y1,x2"    : [width/2 - size/2 , height   - size   , width/2 + size/2 , height            ],
			"x1,y1"       : [width   - size   , height   - size   , size             , height            ],
			"y2"          : [0                , 0                 , width            , size              ],
			"y1,y2"       : [0                , height/2 - size/2 , width            , height/2 + size/2 ],
			"y1"          : [0                , height   - size   , width            , height            ],
			"x2"          : [0                , 0                 , size             , height            ],
			"x1,x2"       : [width/2 - size/2 , 0                 , width/2 + size/2 , height            ],
			"x1"          : [width   - size   , 0                 , width            , height            ],
		};
		setScrollLimits(...startArea[this.key]);
	}

	/**
	 * @param {string[][]} pattern
	 * @returns {string} e.g. "x1,x2,y1"
	 */
	static generateKey(pattern)
	{
		let x1 = "", y1 = "", x2 = "", y2 = "";

		for (let i = 0; i < pattern.length; i++) {
			const row = pattern[i];
			for (let j = 0; j < row.length; j++) {
				const str = row[j];
				if (str === "x1")
				{
					x1 = "x1,";
				}
				else if (str === "y1")
				{
					y1 = "y1,";
				}
				else if (str === "x2")
				{
					x2 = "x2,";
				}
				else /*if (str === "y2")*/
				{
					y2 = "y2,";
				}
			}
		}

		const key = x1 + y1 + x2 + y2;
		return key.slice(0,-1);
	}

	// 0 1 2
	// 3 4 5
	// 6 7 8
	static START_SHAPE = { // key -> shape
		"x2,y2"       : [0],
		"x1,x2,y2"    : [1],
		"x1,y2"       : [2],
		"y1,x2,y2"    : [3],
		"x1,y1,x2,y2" : [4],
		"x1,y1,y2"    : [5],
		"y1,x2"       : [6],
		"x1,y1,x2"    : [7],
		"x1,y1"       : [8],
		"y2"          : [0, 1, 2],
		"y1,y2"       : [3, 4, 5],
		"y1"          : [6, 7, 8],
		"x2"          : [0, 3, 6],
		"x1,x2"       : [1, 4, 7],
		"x1"          : [2, 5, 8],
	};
}
