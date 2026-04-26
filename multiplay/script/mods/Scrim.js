class Scrim {
    static get() {
        const { x: x1, y: y1, x2, y2 } = getScrollLimits();
        return { x1, y1, x2, y2 };
    }
    static get x1() {
        const { x, y, x2, y2 } = getScrollLimits();
        return x;
    }
    static get y1() {
        const { x, y, x2, y2 } = getScrollLimits();
        return y;
    }
    static get x2() {
        const { x, y, x2, y2 } = getScrollLimits();
        return x2;
    }
    static get y2() {
        const { x, y, x2, y2 } = getScrollLimits();
        return y2;
    }
    static get mapArea() {
        return { x1: 0, y1: 0, x2: mapWidth, y2: mapHeight };
    }
    static get droidArea() {
        const { x, y, x2, y2 } = getScrollLimits();
        return { x1: x + 1, y1: y + 1, x2: x2 - 1, y2: y2 - 1 };
    }
    static get structArea() {
        const { x, y, x2, y2 } = getScrollLimits();
        return { x1: x + 3, y1: y + 3, x2: x2 - 3, y2: y2 - 3 };
    }
    static get scrollArea() {
        return Scrim.get();
    }
    static getArea(type) {
        switch (type?.toLowerCase()) {
            case "map"    : return Scrim.mapArea;
            case "droid"  : return Scrim.droidArea;
            case "struct" : return Scrim.structArea;
            default       : return Scrim.scrollArea;
        }
    }
    static *iterate(area) {
        const x1 = area?.x1;
        const y1 = area?.y1;
        const x2 = area?.x2;
        const y2 = area?.y2;
        for (let x = x1; x < x2; x++) {
            for (let y = y1; y < y2; y++) {
                yield { x, y };
            }
        }
    }
    static contains(x, y, type) {
        if (x == null || y == null) {
            return false;
        }
        const { x1, y1, x2, y2 } = Scrim.getArea(type);
        return x >= x1
            && y >= y1
            && x < x2
            && y < y2;
    }
    static containsObject(obj, type) {
        return Scrim.contains(obj?.x, obj?.y, type);
    }
    /**
     * Snap a coordinate to the nearest border
     * The result x, y will satisfy Scrim.contains(x, y, type) assuming margin = 0
     *
     * @param {number} x
     * @param {number} y
     * @param {string} [border] - optional
     * @param {string} [type="scroll"] - "map" | "droid" | "struct" | "scroll". optional
     * @param {number} [margin] - optional margin offset (2 tiles in, -3 tiles out)
     */
    static snap(x, y, border, type, margin = 0) {
        const { x1, y1, x2, y2 } = Scrim.getArea(type);
        const B = Scrim.translate(border);
        if (B == "y1") {
            return Scrim.clamp(x, y1 + margin, "map");
        } else if (B == "x2") {
            return Scrim.clamp(x2 - 1 - margin, y, "map");
        } else if (B == "y2") {
            return Scrim.clamp(x, y2 - 1 - margin, "map");
        } else if (B == "x1") {
            return Scrim.clamp(x1 + margin, y, "map");
        } else {
            return Scrim.snap(x, y, Scrim.nearestBorder(x, y, type), type);
        }
    }
    static snapObject(obj, border, type, margin = 0) {
        return Scrim.snap(obj?.x, obj?.y, border, type, margin);
    }
    /**
     * @returns {string}
     */
    static nearestBorder(x, y, type, filter) {
        const { x1, y1, x2, y2 } = Scrim.getArea(type);
        let distWest;
        let distNorth;
        let distEast;
        let distSouth;
        if (filter) {
            filter = filter.map(b => Scrim.translate(b));
            distWest  = filter.includes("x1") ? Math.abs(x - x1) : Infinity;
            distNorth = filter.includes("y1") ? Math.abs(y - y1) : Infinity;
            distEast  = filter.includes("x2") ? Math.abs(x2 - 1 - x) : Infinity;
            distSouth = filter.includes("y2") ? Math.abs(y2 - 1 - y) : Infinity;
        } else {
            distWest  = Math.abs(x - x1);
            distNorth = Math.abs(y - y1);
            distEast  = Math.abs(x2 - 1 - x);
            distSouth = Math.abs(y2 - 1 - y);
        }
        const minDist = Math.min(distWest, distEast, distNorth, distSouth);
        if (minDist === distWest) {
            return "west";
        } else if (minDist === distEast) {
            return "east";
        } else if (minDist === distNorth) {
            return "north";
        } else {
            return "south";
        }
    }
    /**
     * @param {number} x
     * @param {number} y
     * @param {{x1: number, y1: number, x2: number, y2: number}} area
     * @param {string[]} [filter]
     * @returns {number}
     */
    static distToNearestBorder(x, y, area, filter) {
        const { x1, y1, x2, y2 } = area;

        if (filter) {
            let minDist = Infinity;
            for (const B of filter) {
                const border = Scrim.translate(B);
                if (border === "x1") {
                    const dist = x - x1;
                    if (dist < minDist) minDist = dist;
                } else if (border === "y1") {
                    const dist = y - y1;
                    if (dist < minDist) minDist = dist;
                } else if (border === "x2") {
                    const dist = x2 - 1 - x;
                    if (dist < minDist) minDist = dist;
                } else if (border === "y2") {
                    const dist = y2 - 1 - y;
                    if (dist < minDist) minDist = dist;
                }
            }
            return minDist;
        }

        const distWest = x - x1;
        const distNorth = y - y1;
        const distEast = x2 - 1 - x;
        const distSouth = y2 - 1 - y;

        let min = distWest;
        if (distEast < min) min = distEast;
        if (distNorth < min) min = distNorth;
        if (distSouth < min) min = distSouth;
        return min;
    }
    // result x, y will satisfy Scrim.contains()
    static clamp(x, y, type) {
        const { x1, y1, x2, y2 } = Scrim.getArea(type);
        return {
            x: Math.max(x1, Math.min(x2 - 1, x)),
            y: Math.max(y1, Math.min(y2 - 1, y)),
        };
    }
    static get isMax() {
        const { x, y, x2, y2 } = getScrollLimits();
        return x == 0 && y == 0 && x2 == mapWidth && y2 == mapHeight;
    }
    static center(type) {
        const { x1, y1, x2, y2 } = Scrim.getArea(type);
        return {
            x: x1 + ((x2 - x1) >> 1),
            y: y1 + ((y2 - y1) >> 1),
        };
    }
    static width(type) {
        const { x1, y1, x2, y2 } = Scrim.getArea(type);
        return x2 - x1;
    }
    static height(type) {
        const { x1, y1, x2, y2 } = Scrim.getArea(type);
        return y2 - y1;
    }

////////////////////////////////////////////////////////////////////////////////

    static validate({ x1 = 0, y1 = 0, x2 = mapWidth, y2 = mapHeight } = {}) {
        x1 ??= 0;
        y1 ??= 0;
        x2 ??= mapWidth;
        y2 ??= mapHeight;

        if (x1 > x2) {
            [x1, x2] = [x2, x1];
        }
        if (y1 > y2) {
            [y1, y2] = [y2, y1];
        }

        x1 = Math.max(x1, 0);
        y1 = Math.max(y1, 0);
        x2 = Math.min(x2, mapWidth);
        y2 = Math.min(y2, mapHeight);

        return { x1, y1, x2, y2 };
    }

    // Store the most recent update to the scroll limits
    static diff = { x1: 0, y1: 0, x2: 0, y2: 0 };

    static set(values) {
        const { x1, y1, x2, y2 } = Scrim.validate(values);

        // SIDE EFFECT: Store the change in Scrim.diff
        const before = Scrim.get();
        Scrim.diff.x1 = x1 - before.x1;
        Scrim.diff.y1 = y1 - before.y1;
        Scrim.diff.x2 = x2 - before.x2;
        Scrim.diff.y2 = y2 - before.y2;

        // Execute the change
        setScrollLimits(x1, y1, x2, y2);

        return { x1, y1, x2, y2 };
    }

    static grow({ x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = {}) {
        const { x1: X1, y1: Y1, x2: X2, y2: Y2 } = Scrim.get();
        return Scrim.set({
            x1: X1 + x1,
            y1: Y1 + y1,
            x2: X2 + x2,
            y2: Y2 + y2
        });
    }
    static shrink({ x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = {}) {
        const { x1: X1, y1: Y1, x2: X2, y2: Y2 } = Scrim.get();
        return Scrim.set({
            x1: X1 - x1,
            y1: Y1 - y1,
            x2: X2 - x2,
            y2: Y2 - y2
        });
    }

    static growAll(n) {
        return Scrim.grow({ x1: n, y1: n, x2: n, y2: n });
    }
    static shrinkAll(n) {
        return Scrim.shrink({ x1: n, y1: n, x2: n, y2: n });
    }

    static growWest(n = 1)    { return Scrim.grow({ x1: -n }); }
    static growNorth(n = 1)   { return Scrim.grow({ y1: -n }); }
    static growEast(n = 1)    { return Scrim.grow({ x2:  n }); }
    static growSouth(n = 1)   { return Scrim.grow({ y2:  n }); }
    static growDirection(direction, n) {
        switch (Scrim.translate(direction)) {
            case "x1" : return Scrim.growWest(n);
            case "y1" : return Scrim.growNorth(n);
            case "x2" : return Scrim.growEast(n);
            case "y2" : return Scrim.growSouth(n);
        }
    }

    static shrinkWest(n = 1)  { return Scrim.grow({ x1:  n }); }
    static shrinkNorth(n = 1) { return Scrim.grow({ y1:  n }); }
    static shrinkEast(n = 1)  { return Scrim.grow({ x2: -n }); }
    static shrinkSouth(n = 1) { return Scrim.grow({ y2: -n }); }
    static shrinkDirection(direction, n) {
        switch (Scrim.translate(direction)) {
            case "x1" : return Scrim.shrinkWest(n);
            case "y1" : return Scrim.shrinkNorth(n);
            case "x2" : return Scrim.shrinkEast(n);
            case "y2" : return Scrim.shrinkSouth(n);
        }
    }

////////////////////////////////////////////////////////////////////////////////

    static translate(x, fallback) {
        switch (x.toLowerCase?.()) {
            case "w":
            case "x1":
            case "west":
            case "left":
                return "x1";
            case "n":
            case "y1":
            case "north":
            case "top":
            case "up":
                return "y1";
            case "e":
            case "x2":
            case "east":
            case "right":
                return "x2";
            case "s":
            case "y2":
            case "south":
            case "bottom":
            case "down":
                return "y2";
            default:
                if (fallback !== undefined)
                {
                    return fallback;
                }
                throw new Error("Scrim.translate() failure:", x);
        }
    }

    static oppositeOf(x) {
        switch (translate(x)) {
            case "x1": return "x2";
            case "y1": return "y2";
            case "x2": return "x1";
            case "y2": return "y1";
            default  : throw new Error("Scrim.oppositeOf() failure:", x);
        }
    }
}
