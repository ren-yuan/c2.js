//Created by Ren Yuan


export class Vector {
    x: number;
    y: number;

    constructor();
    constructor(v: Vector);
    constructor(x: number, y: number);
    constructor() {
        if (arguments.length == 1) {
            this.x = arguments[0].x;
            this.y = arguments[0].y;
        } else if (arguments.length == 2) {
            this.x = arguments[0];
            this.y = arguments[1];
        } else {
            this.x = 0;
            this.y = 0;
        }
    }

    copy(): Vector {
        return new Vector(this.x, this.y);
    }

    mag(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    magSq(): number {
        return this.x * this.x + this.y * this.y;
    }

    angle();
    angle(v: Vector): number;
    angle() {
        if (arguments.length == 0) {
            return Math.atan2(this.y, this.x);
        } else if (arguments.length == 1) {
            let a = this.normalize();
            let b = arguments[0].normalize();
            return Math.sign(a.cross(b)) * Math.acos(a.dot(b));
        }
    }

    add(v: Vector): Vector;
    add(x: number, y: number): Vector;
    add() {
        if (arguments.length == 1) {
            return new Vector(this.x + arguments[0].x, this.y + arguments[0].y);
        } else if (arguments.length == 2) {
            return new Vector(this.x + arguments[0], this.y + arguments[1]);
        }
    }

    sub(v: Vector): Vector;
    sub(x: number, y: number): Vector;
    sub() {
        if (arguments.length == 1) {
            return new Vector(this.x - arguments[0].x, this.y - arguments[0].y);
        } else if (arguments.length == 2) {
            return new Vector(this.x - arguments[0], this.y - arguments[1]);
        }
    }

    mult(n: number): Vector {
        return new Vector(this.x * n, this.y * n);
    }

    div(n: number): Vector {
        return new Vector(this.x / n, this.y / n);
    }

    dot(v: Vector): number {
        return this.x * v.x + this.y * v.y;
    }

    cross(v: Vector): number {
        return this.x * v.y - v.x * this.y;
    }

    normalize(): Vector {
        let m = this.x * this.x + this.y * this.y;
        if (m > 0) {
            m = Math.sqrt(m);
            return new Vector(this.x / m, this.y / m);
        }
        return new Vector();
    }

    limit(n: number): Vector {
        if (this.magSq() > n * n) return this.normalize().mult(n);
        return this.copy();
    }

    invert(): Vector {
        return new Vector(-this.x, -this.y);
    }

    perpendicular(): Vector {
        return new Vector(-this.y, this.x);
    }

    projection(v: Vector): Vector {
        let n = v.normalize();
        return n.mult(this.dot(n));
    }

    reflect(v: Vector): Vector {
        let n = v.normalize();
        return n.mult(this.dot(n) * 2).sub(this);
    }

    rotate(a): Vector {
        return new Vector(Math.cos(a) * this.x - Math.sin(a) * this.y, Math.sin(a) * this.x + Math.cos(a) * this.y);
    }

    distance(v: Vector): number {
        let dx = this.x - v.x;
        let dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    distanceSq(v: Vector): number {
        let dx = this.x - v.x;
        let dy = this.y - v.y;
        return dx * dx + dy * dy;
    }
}




export class Point {
    x: number;
    y: number;

    constructor();
    constructor(p: Point);
    constructor(x: number, y: number);
    constructor() {
        if (arguments.length == 1) {
            this.x = arguments[0].x;
            this.y = arguments[0].y;
        } else if (arguments.length == 2) {
            this.x = arguments[0];
            this.y = arguments[1];
        } else {
            this.x = 0;
            this.y = 0;
        }
    }

    translate(x: number, y: number): Point {
        this.x += x;
        this.y += y;
        return this;
    }

    rotate(a: number): Point;
    rotate(a: number, p: Point): Point;
    rotate() {
        if (arguments.length == 1) {
            let dx = this.x;
            let dy = this.y;
            this.x = Math.cos(arguments[0]) * dx - Math.sin(arguments[0]) * dy;
            this.y = Math.sin(arguments[0]) * dx + Math.cos(arguments[0]) * dy;
        } else if (arguments.length == 2) {
            let dx = this.x - arguments[1].x;
            let dy = this.y - arguments[1].y;
            this.x = arguments[1].x + Math.cos(arguments[0]) * dx - Math.sin(arguments[0]) * dy;
            this.y = arguments[1].y + Math.sin(arguments[0]) * dx + Math.cos(arguments[0]) * dy;
        }
        return this;
    }

    scale(s: number): Point;
    scale(s: number, p: Point): Point;
    scale() {
        if (arguments.length == 1) {
            this.x *= arguments[0];
            this.y *= arguments[0];
        } else if (arguments.length == 2) {
            this.x = arguments[1].x + (this.x - arguments[1].x) * arguments[0];
            this.y = arguments[1].y + (this.y - arguments[1].y) * arguments[0];
        }
        return this;
    }

    copy(): Point {
        return new Point(this.x, this.y);
    }

    distance(p: Point): number {
        let dx = this.x - p.x;
        let dy = this.y - p.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    distanceSq(p: Point): number {
        let dx = this.x - p.x;
        let dy = this.y - p.y;
        return dx * dx + dy * dy;
    }

    lerp(p: Point, t: number): Point {
        return new Point(this.x + (p.x - this.x) * t, this.y + (p.y - this.y) * t);
    }
}




export class Line {
    p1: Point;
    p2: Point;

    constructor(p1: Point, p2: Point);
    constructor(x1: number, y1: number, x2: number, y2: number);
    constructor() {
        if (arguments.length == 2) {
            this.p1 = arguments[0];
            this.p2 = arguments[1];
        } else if (arguments.length == 4) {
            this.p1 = new Point(arguments[0], arguments[1]);
            this.p2 = new Point(arguments[2], arguments[3]);
        }
    }

    translate(x: number, y: number): Line {
        this.p1.translate(x, y);
        this.p2.translate(x, y);
        return this;
    }

    rotate(a: number): Line;
    rotate(a: number, p: Point): Line;
    rotate() {
        if (arguments.length == 1) {
            this.p1.rotate(arguments[0]);
            this.p2.rotate(arguments[0]);
        } else if (arguments.length == 2) {
            this.p1.rotate(arguments[0], arguments[1]);
            this.p2.rotate(arguments[0], arguments[1]);
        }
        return this;
    }

    scale(s: number): Line;
    scale(s: number, p: Point): Line;
    scale() {
        if (arguments.length == 1) {
            this.p1.scale(arguments[0]);
            this.p2.scale(arguments[0]);
        } else if (arguments.length == 2) {
            this.p1.scale(arguments[0], arguments[1]);
            this.p2.scale(arguments[0], arguments[1]);
        }
        return this;
    }

    reverse(): Line {
        let temp = this.p1;
        this.p1 = this.p2;
        this.p2 = temp;
        return this;
    }

    copy(): Line {
        return new Line(this.p1.copy(), this.p2.copy());
    }

    bounds(): Rect {
        return new Rect(this.p1.copy(), this.p2.copy());
    }

    length(): number {
        return this.p1.distance(this.p2);
    }

    angle(): number {
        return new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y).angle();
    }

    direction(): Vector {
        return new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y).normalize();
    }

    normal(): Vector {
        return this.direction().perpendicular();
    }

    middle(): Point {
        return this.p1.lerp(this.p2, 0.5);
    }

    point(t: number): Point {
        return this.p1.lerp(this.p2, t);
    }

    lerp(l: Line, t: number): Line {
        let p1 = this.p1.lerp(l.p1, t);
        let p2 = this.p2.lerp(l.p2, t);
        return new Line(p1, p2);
    }

    closest(p: Point): Point {
        let v1 = new Vector(p.x - this.p1.x, p.y - this.p1.y);
        let v2 = new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
        let t = v1.dot(v2) / v2.dot(v2);
        if (t <= 0) return this.p1.copy();
        if (t >= 1) return this.p2.copy();
        return this.p1.lerp(this.p2, t);
    }

    distance(p: Point): number {
        return p.distance(this.closest(p));
    }

    intersects(l: Line): boolean{
        let v1 = new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
        let v2 = new Vector(l.p2.x - l.p1.x, l.p2.y - l.p1.y);
        let v3 = new Vector(l.p1.x - this.p1.x, l.p1.y - this.p1.y);
        let v4 = v1.perpendicular();
        let v5 = v2.perpendicular();
        let t = v3.dot(v5) / v1.dot(v5);
        let u = -v3.dot(v4) / v2.dot(v4);

        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }

    intersection(l: Line): Point | null{
        let v1 = new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
        let v2 = new Vector(l.p2.x - l.p1.x, l.p2.y - l.p1.y);
        let v3 = new Vector(l.p1.x - this.p1.x, l.p1.y - this.p1.y);
        let v4 = v1.perpendicular();
        let v5 = v2.perpendicular();
        let t = v3.dot(v5) / v1.dot(v5);
        let u = -v3.dot(v4) / v2.dot(v4);

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            let v = v1.mult(t);
            return new Point(this.p1.x + v.x, this.p1.y + v.y);
        } else {
            return null;
        }
    }

    split(data: number[]): Line[] {
        let sum = data.reduce((a, b) => a + b);

        let points = new Array(data.length + 1);
        points[0] = this.p1;
        points[data.length] = this.p2;
        let t = 0;
        for (let i = 0; i < data.length - 1; i++) {
            t += data[i] / sum;
            points[i + 1] = this.p1.lerp(this.p2, t);
        }

        let lines = new Array(data.length);
        for (let i = 0; i < data.length; i++) {
            lines[i] = new Line(points[i].copy(), points[i + 1].copy());
        }
        return lines;
    }
}




export class Arc {
    p: Point;
    r: number;
    start: number;
    end: number;

    constructor(p: Point, r: number, start: number, end: number);
    constructor(x: number, y: number, r: number, start: number, end: number);
    constructor() {
        if (arguments.length == 4) {
            this.p = arguments[0];
            this.r = arguments[1];
            this.start = arguments[2];
            this.end = arguments[3];
        } else if (arguments.length == 5) {
            this.p = new Point(arguments[0], arguments[1]);
            this.r = arguments[2];
            this.start = arguments[3];
            this.end = arguments[4];
        }
        if (this.start > this.end) {
            let temp = this.start;
            this.start = this.end;
            this.end = temp;
        }
    }

    translate(x: number, y: number): Arc {
        this.p.translate(x, y);
        return this;
    }

    rotate(a: number): Arc;
    rotate(a: number, p: Point): Arc;
    rotate() {
        if (arguments.length == 1) {
            this.p.rotate(arguments[0]);
        } else if (arguments.length == 2) {
            this.p.rotate(arguments[0], arguments[1]);
        }
        this.start += arguments[0];
        this.end += arguments[0];
        return this;
    }

    scale(s: number): Arc;
    scale(s: number, p: Point): Arc;
    scale() {
        if (arguments.length == 1) {
            this.p.scale(arguments[0]);
        } else if (arguments.length == 2) {
            this.p.scale(arguments[0], arguments[1]);
        }
        this.r *= arguments[0];
        return this;
    }

    copy(): Arc {
        return new Arc(this.p.copy(), this.r, this.start, this.end);
    }

    bounds(): Rect {
        let p1 = new Point(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        let p2 = new Point(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
        let step = Math.PI / 2;
        let start = Math.floor(this.start / step) * step;
        let angle = start + step;
        let p = new Point();
        for (let i = 0; i < 4 && angle < this.end; i++) {
            p.x = this.p.x + Math.cos(angle) * this.r;
            p.y = this.p.y + Math.sin(angle) * this.r;
            p1.x = Math.min(p1.x, p.x);
            p1.y = Math.min(p1.y, p.y);
            p2.x = Math.max(p2.x, p.x);
            p2.y = Math.max(p2.y, p.y);
            angle += step;
        }
        p = this.point(0);
        p1.x = Math.min(p1.x, p.x);
        p1.y = Math.min(p1.y, p.y);
        p2.x = Math.max(p2.x, p.x);
        p2.y = Math.max(p2.y, p.y);
        p = this.point(1);
        p1.x = Math.min(p1.x, p.x);
        p1.y = Math.min(p1.y, p.y);
        p2.x = Math.max(p2.x, p.x);
        p2.y = Math.max(p2.y, p.y);
        return new Rect(p1, p2);
    }

    length(): number {
        return (this.end - this.start) * this.r;
    }

    middle(): Point {
        return this.point(0.5);
    }

    point(t: number): Point {
        let a = this.start + (this.end - this.start) * t;
        let x = this.p.x + Math.cos(a) * this.r;
        let y = this.p.y + Math.sin(a) * this.r;
        return new Point(x, y);
    }

    lerp(a: Arc, t: number): Arc {
        let p = this.p.lerp(a.p, t);
        let r = this.r + (a.r - this.r) * t;
        let start = this.start + (a.start - this.start) * t;
        let end = this.end + (a.end - this.end) * t;
        return new Arc(p, r, start, end);
    }

    contains(v: Vector): boolean {
        let a = v.angle();
        if (a < 0) a += 2 * Math.PI;
        let start = this.start % (2 * Math.PI);
        let end = this.end % (2 * Math.PI);
        return end <= start ? (a > start && a < 2 * Math.PI || a > 0 && a < end) : (a > start && a < end);
    }

    closest(p: Point): Point {
        let v = new Vector(p.x - this.p.x, p.y - this.p.y);
        if (this.contains(v)) {
            v = v.normalize().mult(this.r).add(this.p.x, this.p.y)
            return new Point(v.x, v.y);
        } else {
            let p1 = this.point(0);
            let p2 = this.point(1);
            return p.distanceSq(p1) < p.distanceSq(p2) ? p1 : p2;
        }
    }

    distance(p: Point) {
        return p.distance(this.closest(p));
    }

    polyline(n: number): Polyline {
        let points = new Array(n + 1);
        for (let i = 0; i <= n; i++) {
            let a = this.start + (this.end - this.start) * i / n;
            let x = this.p.x + Math.cos(a) * this.r;
            let y = this.p.y + Math.sin(a) * this.r;
            points[i] = new Point(x, y);
        }
        return new Polyline(points);
    }

    split(data: number[]): Arc[] {
        let sum = data.reduce((a, b) => a + b);

        let angles = new Array(data.length + 1);
        angles[0] = this.start;
        angles[data.length] = this.end;
        let a = this.start;
        for (let i = 0; i < data.length - 1; i++) {
            a += data[i] / sum * (this.end - this.start);
            angles[i + 1] = a;
        }

        let arcs = new Array(data.length);
        for (let i = 0; i < arcs.length; i++) {
            arcs[i] = new Arc(this.p.copy(), this.r, angles[i], angles[i + 1]);
        }
        return arcs;
    }
}




export class Polyline {
    vertices: Point[];

    constructor();
    constructor(points: Point[]);
    constructor() {
        if (arguments.length == 1) {
            this.vertices = arguments[0];
        } else {
            this.vertices = new Array();
        }
    }

    add(p: Point): Polyline;
    add(x: number, y: number): Polyline;
    add() {
        if (arguments.length == 1) {
            this.vertices.push(arguments[0]);
        } else if (arguments.length == 2) {
            this.vertices.push(new Point(arguments[0], arguments[1]));
        }
        return this;
    }

    clear(){
        this.vertices = [];
    }

    translate(x, y): Polyline {
        for (let v of this.vertices) v.translate(x, y);
        return this;
    }

    rotate(a: number): Polyline;
    rotate(a: number, p: Point): Polyline;
    rotate() {
        if (arguments.length == 1) {
            for (let v of this.vertices) v.rotate(arguments[0]);
        } else if (arguments.length == 2) {
            for (let v of this.vertices) v.rotate(arguments[0], arguments[1]);
        }
        return this;
    }

    scale(s: number): Polyline;
    scale(s: number, p: Point): Polyline;
    scale() {
        if (arguments.length == 1) {
            for (let v of this.vertices) v.scale(arguments[0]);
        } else if (arguments.length == 2) {
            for (let v of this.vertices) v.scale(arguments[0], arguments[1]);
        }
        return this;
    }

    reverse(): Polyline {
        this.vertices.reverse();
        return this;
    }

    copy(): Polyline {
        let points = new Array(this.vertices.length);
        for (let i = 0; i < this.vertices.length; i++) {
            points[i] = this.vertices[i].copy();
        }
        return new Polyline(points);
    }

    edges(): Line[] {
        let lines = new Array();
        for (let i = 0; i < this.vertices.length - 1; i++) {
            let p1 = this.vertices[i];
            let p2 = this.vertices[i + 1];
            lines.push(new Line(p1, p2));
        }
        return lines;
    }

    bounds(): Rect {
        let p1 = new Point(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        let p2 = new Point(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
        for (let p of this.vertices) {
            p1.x = Math.min(p1.x, p.x);
            p1.y = Math.min(p1.y, p.y);
            p2.x = Math.max(p2.x, p.x);
            p2.y = Math.max(p2.y, p.y);
        }
        return new Rect(p1, p2);
    }

    length(): number {
        let length = 0;
        for (let i = 0; i < this.vertices.length - 1; i++) {
            let p1 = this.vertices[i];
            let p2 = this.vertices[i + 1];
            length += p1.distance(p2);
        }
        return length;
    }

    closest(p: Point): Point {
        let cp;
        let dmin = Number.POSITIVE_INFINITY;
        for (let i = 0; i < this.vertices.length - 1; i++) {
            let l = new Line(this.vertices[i], this.vertices[i + 1]);
            let lp = l.closest(p);
            let d = p.distanceSq(lp);
            if (d < dmin) {
                cp = lp;
                dmin = d;
            }
        }
        return cp;
    }

    distance(p: Point): number {
        return p.distance(this.closest(p));
    }
}




export class Spline {
    points: Point[];
    vertices: Point[];

    constructor();
    constructor(points: Point[]);
    constructor() {
        if (arguments.length == 1) {
            this.points = arguments[0];
        } else {
            this.points = new Array();
        }
    }

    compute(mode: string = 'clamped', detail: number = 20) { //clamped (default), open, closed
        if (this.points.length < 4) return;
        let points = new Array();
        if (mode == 'open') {
            points = points.concat(this.points);
        } else if (mode == 'closed') {
            points.push(this.points[this.points.length - 2]);
            points.push(this.points[this.points.length - 1]);
            points = points.concat(this.points);
            points.push(this.points[0]);
        } else { //clamped
            points.push(this.points[0]);
            points = points.concat(this.points);
            points.push(this.points[this.points.length - 1]);
        }

        this.vertices = new Array();
        for (let i = 0; i < points.length - 3; i++) {
            let p1 = points[i];
            let p2 = points[i + 1];
            let p3 = points[i + 2];
            let p4 = points[i + 3];
            for (let i = 0; i < detail; i++) {
                let t = i / (detail - 1);
                this.vertices.push(this.point(p1, p2, p3, p4, t));
            }
        }
    }

    point(p1: number, p2: number, p3: number, p4: number, t: number): Point {
        let p = (p1, p2, t1, t2) => new Point(p1.x * t1 + p2.x * t2, p1.y * t1 + p2.y * t2);
        let a1 = p(p1, p2, -t, t + 1);
        let a2 = p(p2, p3, 1 - t, t);
        let a3 = p(p3, p4, 2 - t, t - 1);
        let b1 = p(a1, a2, (1 - t) / 2, (t + 1) / 2);
        let b2 = p(a2, a3, (2 - t) / 2, t / 2);
        return p(b1, b2, 1 - t, t);
    }

    tangent(p1: number, p2: number, p3: number, p4: number, t: number): Vector {
        let a = this.point(p1, p2, p3, p4, t);
        let b = this.point(p1, p2, p3, p4, t + 1e-6);
        return new Vector(b.x - a.x, b.y - a.y).normalize();
    }

    normal(p1: number, p2: number, p3: number, p4: number, t: number): Vector {
        return this.tangent(p1, p2, p3, p4, t).perpendicular();
    }

    add(p: Point): Spline;
    add(x: number, y: number): Spline;
    add() {
        if (arguments.length == 1) {
            this.points.push(arguments[0]);
        } else if (arguments.length == 2) {
            this.points.push(new Point(arguments[0], arguments[1]));
        }
        return this;
    }

    clear(){
        this.points = [];
        this.vertices = [];
    }

    translate(x, y): Spline {
        for (let v of this.points) v.translate(x, y);
        return this;
    }

    rotate(a: number): Spline;
    rotate(a: number, p: Point): Spline;
    rotate() {
        if (arguments.length == 1) {
            for (let v of this.points) v.rotate(arguments[0]);
        } else if (arguments.length == 2) {
            for (let v of this.points) v.rotate(arguments[0], arguments[1]);
        }
        return this;
    }

    scale(s: number): Spline;
    scale(s: number, p: Point): Spline;
    scale() {
        if (arguments.length == 1) {
            for (let v of this.points) v.scale(arguments[0]);
        } else if (arguments.length == 2) {
            for (let v of this.points) v.scale(arguments[0], arguments[1]);
        }
        return this;
    }

    reverse(): Spline {
        this.points.reverse();
        return this;
    }

    copy(): Spline {
        let array = new Array(this.points.length);
        for (let i = 0; i < this.points.length; i++) {
            array[i] = this.points[i].copy();
        }
        return new Spline(array);
    }
}




export class Sector {
    p: Point;
    r1: number;
    r2: number;
    start: number;
    end: number;

    constructor(p: Point, r1: number, r2: number, start: number, end: number);
    constructor(x: number, y: number, r1: number, r2: number, start: number, end: number);
    constructor() {
        if (arguments.length == 5) {
            this.p = arguments[0];
            this.r1 = arguments[1];
            this.r2 = arguments[2];
            this.start = arguments[3];
            this.end = arguments[4];
        } else if (arguments.length == 6) {
            this.p = new Point(arguments[0], arguments[1]);
            this.r1 = arguments[2];
            this.r2 = arguments[3];
            this.start = arguments[4];
            this.end = arguments[5];
        }
        if (this.start > this.end) {
            let temp = this.start;
            this.start = this.end;
            this.end = temp;
        }
    }

    translate(x: number, y: number): Sector {
        this.p.translate(x, y);
        return this;
    }

    rotate(a: number): Sector;
    rotate(a: number, p: Point): Sector;
    rotate() {
        if (arguments.length == 1) {
            this.p.rotate(arguments[0]);
        } else if (arguments.length == 2) {
            this.p.rotate(arguments[0], arguments[1]);
        }
        this.start += arguments[0];
        this.end += arguments[0];
        return this;
    }

    scale(s: number): Sector;
    scale(s: number, p: Point): Sector;
    scale() {
        if (arguments.length == 1) {
            this.p.scale(arguments[0]);
        } else if (arguments.length == 2) {
            this.p.scale(arguments[0], arguments[1]);
        }
        this.r1 *= arguments[0];
        this.r2 *= arguments[0];
        return this;
    }

    copy(): Sector {
        return new Sector(this.p.copy(), this.r1, this.r2, this.start, this.end);
    }

    bounds(): Rect {
        let rect1 = new Arc(this.p, this.r1, this.start, this.end).bounds();
        let rect2 = new Arc(this.p, this.r2, this.start, this.end).bounds();
        return rect1.merge(rect2);
    }

    area(): number {
        return (this.end - this.start) / 2 * (this.r2 * this.r2 - this.r1 * this.r1);
    }

    center(): Point {
        let a = (this.start + this.end) / 2;
        let r = (this.r1 + this.r2) / 2;
        let x = this.p.x + Math.cos(a) * r;
        let y = this.p.y + Math.sin(a) * r;
        return new Point(x, y);
    }

    contains(p: Point): boolean {
        let v = new Vector(p.x - this.p.x, p.y - this.p.y);
        let d = v.mag();
        return d > this.r1 && d < this.r2 && new Arc(this.p, this.r2, this.start, this.end).contains(v);
    }

    closest(p: Point): Point {
        let a1 = new Arc(this.p, this.r1, this.start, this.end);
        let a2 = new Arc(this.p, this.r2, this.start, this.end);
        let points = [
            a1.closest(p),
            a2.closest(p),
            new Line(a1.point(0), a2.point(0)).closest(p),
            new Line(a1.point(1), a2.point(1)).closest(p)
        ];
        let cp;
        let dmin = Number.POSITIVE_INFINITY;
        for (let i = 0; i < 4; i++) {
            let d = p.distanceSq(points[i]);
            if (d < dmin) {
                cp = points[i];
                dmin = d;
            }
        }
        return cp;
    }

    distance(p: Point): number {
        return p.distance(this.closest(p));
    }

    polygon(n: number): Polygon {
        let points = new Array(n * 2 + 2);
        for (let i = 0; i <= n; i++) {
            let a = this.start + (this.end - this.start) * i / n;
            let x = this.p.x + Math.cos(a) * this.r2;
            let y = this.p.y + Math.sin(a) * this.r2;
            points[i] = new Point(
                this.p.x + Math.cos(a) * this.r2,
                this.p.y + Math.sin(a) * this.r2);
            points[n + 1 + i] = new Point(
                this.p.x + Math.cos(this.start + this.end - a) * this.r1,
                this.p.y + Math.sin(this.start + this.end - a) * this.r1);
        }
        return new Polygon(points);
    }

    split(data: number[], mode: string = 'angle'): Sector[] { //angle (default), radius, area
        let sum = data.reduce((a, b) => a + b);

        if (mode == 'angle') {
            let angles = new Array(data.length + 1);
            angles[0] = this.start;
            angles[data.length] = this.end;
            let a = this.start;
            for (let i = 0; i < data.length - 1; i++) {
                a += data[i] / sum * (this.end - this.start);
                angles[i + 1] = a;
            }

            let sectors = new Array(data.length);
            for (let i = 0; i < sectors.length; i++) {
                sectors[i] = new Sector(this.p.copy(), this.r1, this.r2, angles[i], angles[i + 1]);
            }
            return sectors;
        } else if (mode == 'radius') {
            let radiuses = new Array(data.length + 1);
            radiuses[0] = this.r1;
            radiuses[data.length] = this.r2;
            let r = this.r1;
            for (let i = 0; i < data.length - 1; i++) {
                r += data[i] / sum * (this.r2 - this.r1);
                radiuses[i + 1] = r;
            }

            let sectors = new Array(data.length);
            for (let i = 0; i < sectors.length; i++) {
                sectors[i] = new Sector(this.p.copy(), radiuses[i], radiuses[i + 1], this.start, this.end);
            }
            return sectors;
        } else if (mode == 'area') {
            let area = this.area();
            let radiuses = new Array(data.length + 1);
            radiuses[0] = this.r1;
            radiuses[data.length] = this.r2;
            let r = this.r1;
            for (let i = 0; i < data.length - 1; i++) {
                radiuses[i + 1] = Math.sqrt(data[i] / sum * area * 2 / (this.end - this.start) + r * r);
                r = radiuses[i + 1];
            }

            let sectors = new Array(data.length);
            for (let i = 0; i < sectors.length; i++) {
                sectors[i] = new Sector(this.p.copy(), radiuses[i], radiuses[i + 1], this.start, this.end);
            }
            return sectors;
        }
    }
}




export class Circle {
    p: Point;
    r: number;

    constructor();
    constructor(p: Point, r: number);
    constructor(x: number, y: number, r: number);
    constructor(p1: Point, p2: Point, p3: Point);
    constructor() {
        if (arguments.length == 0) {
            this.p = new Point();
            this.r = 1;
        } else if (arguments.length == 2) {
            this.p = arguments[0];
            this.r = arguments[1];
        } else if (arguments.length == 3) {
            if (arguments[0] instanceof Point) {
                let v1 = new Vector(arguments[2].x - arguments[1].x, arguments[2].y - arguments[1].y);
                let v2 = new Vector(arguments[0].x - arguments[2].x, arguments[0].y - arguments[2].y);
                let v3 = new Vector(arguments[1].x - arguments[0].x, arguments[1].y - arguments[0].y);
                let v4 = v3.perpendicular();
                let v = v4.mult(v1.dot(v2) / v4.dot(v2)).add(v3).mult(0.5).add(arguments[0].x, arguments[0].y);
                this.p = new Point(v.x, v.y);
                this.r = this.p.distance(arguments[0]);
            } else {
                this.p = new Point(arguments[0], arguments[1]);
                this.r = arguments[2]
            }
        }
    }

    translate(x: number, y: number): Circle {
        this.p.translate(x, y);
        return this;
    }

    rotate(a: number): Circle;
    rotate(a: number, p: Point): Circle;
    rotate() {
        if (arguments.length == 1) {
            this.p.rotate(arguments[0]);
        } else if (arguments.length == 2) {
            this.p.rotate(arguments[0], arguments[1]);
        }
        return this;
    }

    scale(s: number): Circle;
    scale(s: number, p: Point): Circle;
    scale() {
        if (arguments.length == 1) {
            this.p.scale(arguments[0]);
        } else if (arguments.length == 2) {
            this.p.scale(arguments[0], arguments[1]);
        }
        this.r *= arguments[0];
        return this;
    }

    copy(): Circle {
        return new Circle(this.p.copy(), this.r);
    }

    bounds(): Rect {
        let p1 = new Point(this.p.x - this.r, this.p.y - this.r);
        let p2 = new Point(this.p.x + this.r, this.p.y + this.r);
        return new Rect(p1, p2);
    }

    area(): number {
        return Math.PI * this.r * this.r;
    }

    circumference(): number {
        return 2 * Math.PI * this.r;
    }

    tangent(p: Point): Point[] | null {
        let m = this.p.lerp(p, 0.5);
        let d = m.distance(p);
        let c = new Circle(m, d);
        return this.intersection(c);
    }

    contains(s: Point | Circle): boolean {
        if (s instanceof Point) {
            let dx = this.p.x - s.x;
            let dy = this.p.y - s.y;
            return dx * dx + dy * dy < this.r * this.r;
        } else if (s instanceof Circle) {
            let dx = this.p.x - s.p.x;
            let dy = this.p.y - s.p.y;
            let r = this.r - s.r;
            return dx * dx + dy * dy < r*r;
        }
    }

    closest(p: Point): Point {
        let v = new Vector(p.x - this.p.x, p.y - this.p.y).normalize().mult(this.r).add(this.p.x, this.p.y);
        return new Point(v.x, v.y);
    }

    distance(p: Point): number {
        return Math.abs(p.distance(this.p) - this.r);
    }

    intersects(s: Circle | Rect): boolean{
        if (s instanceof Circle) {
            let dx = this.p.x - s.p.x;
            let dy = this.p.y - s.p.y;
            let r = this.r + s.r;
            return dx * dx + dy * dy <= r * r;
        }else if(s instanceof Rect){            
            let x = this.p.x;
            let y = this.p.y;
            if (x < s.p.x) x = s.p.x;
            else if (x > s.p.x + s.w) x = s.p.x + s.w;
            if (y < s.p.y) y = s.p.y;
            else if (y > s.p.y + s.h) y = s.p.y + s.h;

            let dx = this.p.x - x;
            let dy = this.p.y - y;
            return dx * dx + dy * dy <= this.r * this.r;  
        }
    }

    intersection(c: Circle): Point[] | null {
        let d = this.p.distance(c.p);
        if (d > this.r + c.r || d < Math.abs(this.r - c.r)) return null;
        let angle = Math.acos((this.r * this.r + d * d - c.r * c.r) / (2 * this.r * d));

        let v1 = new Vector(c.p.x - this.p.x, c.p.y - this.p.y);
        let v2 = v1.copy();
        v1 = v1.normalize().mult(this.r).rotate(angle).add(this.p.x, this.p.y);
        v2 = v2.normalize().mult(this.r).rotate(-angle).add(this.p.x, this.p.y);

        let points = [new Point(v1.x, v1.y), new Point(v2.x, v2.y)];
        return points;
    }

    polygon(n: number): Polygon {
        let points = new Array(n);
        for (let i = 0; i < n; i++) {
            let a = 2 * Math.PI * i / n;
            let x = this.p.x + Math.cos(a) * this.r;
            let y = this.p.y + Math.sin(a) * this.r;
            points[i] = new Point(x, y);
        }
        return new Polygon(points);
    }

    split(data: number[], mode: string = 'angle'): Sector[] {
        return new Sector(this.p, 0, this.r, 0, Math.PI * 2).split(data, mode);
    }
}




export class Triangle {
    p1: Point;
    p2: Point;
    p3: Point;

    constructor(p1: Point, p2: Point, p3: Point);
    constructor(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number);
    constructor() {
        if (arguments.length == 3) {
            this.p1 = arguments[0];
            this.p2 = arguments[1];
            this.p3 = arguments[2];
        } else if (arguments.length == 6) {
            this.p1 = new Point(arguments[0], arguments[1]);
            this.p2 = new Point(arguments[2], arguments[3]);
            this.p3 = new Point(arguments[4], arguments[5]);
        }
    }

    translate(x: number, y: number): Triangle {
        this.p1.translate(x, y);
        this.p2.translate(x, y);
        this.p3.translate(x, y);
        return this;
    }

    rotate(a: number): Triangle;
    rotate(a: number, p: Point): Triangle;
    rotate() {
        if (arguments.length == 1) {
            this.p1.rotate(arguments[0]);
            this.p2.rotate(arguments[0]);
            this.p3.rotate(arguments[0]);
        } else if (arguments.length == 2) {
            this.p1.rotate(arguments[0], arguments[1]);
            this.p2.rotate(arguments[0], arguments[1]);
            this.p3.rotate(arguments[0], arguments[1]);
        }
        return this;
    }

    scale(s: number): Triangle;
    scale(s: number, p: Point): Triangle;
    scale() {
        if (arguments.length == 1) {
            this.p1.scale(arguments[0]);
            this.p2.scale(arguments[0]);
            this.p3.scale(arguments[0]);
        } else if (arguments.length == 2) {
            this.p1.scale(arguments[0], arguments[1]);
            this.p2.scale(arguments[0], arguments[1]);
            this.p3.scale(arguments[0], arguments[1]);
        }
        return this;
    }

    reverse(): Triangle {
        let temp = this.p1;
        this.p1 = this.p3;
        this.p3 = temp;
        return this;
    }

    copy(): Triangle {
        return new Triangle(this.p1.copy(), this.p2.copy(), this.p3.copy());
    }

    bounds(): Rect {
        let x1 = Math.min(Math.min(this.p1.x, this.p2.x), this.p3.x);
        let y1 = Math.min(Math.min(this.p1.y, this.p2.y), this.p3.y);
        let x2 = Math.max(Math.max(this.p1.x, this.p2.x), this.p3.x);
        let y2 = Math.max(Math.max(this.p1.y, this.p2.y), this.p3.y);
        return new Rect(new Point(x1, y1), new Point(x2, y2));
    }

    edges(): Line[] {
        let lines = new Array(3);
        lines[0] = new Line(this.p1, this.p2);
        lines[1] = new Line(this.p2, this.p3);
        lines[2] = new Line(this.p3, this.p1);
        return lines;
    }

    polygon(): Polygon {
        return new Polygon([this.p1, this.p2, this.p3]);
    }

    area(): number {
        let v1 = new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
        let v2 = new Vector(this.p3.x - this.p1.x, this.p3.y - this.p1.y);
        return v1.cross(v2) / 2;
    }

    circumference(): number {
        return this.p1.distance(this.p2) + this.p2.distance(this.p3) + this.p3.distance(this.p1);
    }

    centroid(): Point {
        let x = (this.p1.x + this.p2.x + this.p3.x) / 3;
        let y = (this.p1.y + this.p2.y + this.p3.y) / 3;
        return new Point(x, y);
    }

    clockwise(): boolean {
        let v1 = new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
        let v2 = new Vector(this.p3.x - this.p2.x, this.p3.y - this.p2.y);
        return v1.cross(v2) > 0;
    }

    contains(s: Point | Triangle): boolean {
        if (s instanceof Point) {
            let v1 = new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
            let v2 = new Vector(this.p3.x - this.p2.x, this.p3.y - this.p2.y);
            let v3 = new Vector(this.p1.x - this.p3.x, this.p1.y - this.p3.y);
            let v4 = new Vector(s.x - this.p1.x, s.y - this.p1.y);
            let v5 = new Vector(s.x - this.p2.x, s.y - this.p2.y);
            let v6 = new Vector(s.x - this.p3.x, s.y - this.p3.y);
            if (this.clockwise()) {
                return v1.cross(v4) > 0 && v2.cross(v5) > 0 && v3.cross(v6) > 0;
            } else {
                return v1.cross(v4) < 0 && v2.cross(v5) < 0 && v3.cross(v6) < 0;
            }
        } else if (s instanceof Triangle) {
            return this.contains(s.p1) && this.contains(s.p2) && this.contains(s.p3);
        }
    }

    closest(p: Point): Point {
        let cp;
        let dmin = Number.POSITIVE_INFINITY;
        let points = [this.p1, this.p2, this.p3];
        for (let i = 0; i < points.length; i++) {
            let l = new Line(points[i], points[(i + 1) % points.length]);
            let lp = l.closest(p);
            let d = p.distanceSq(lp);
            if (d < dmin) {
                cp = lp;
                dmin = d;
            }
        }
        return cp;
    }

    distance(p: Point): number {
        return p.distance(this.closest(p));
    }

    circumcircle(): Circle {
        return new Circle(this.p1, this.p2, this.p3);
    }
}




export class Rect {
    p: Point;
    w: number;
    h: number;

    constructor(p1: Point, p2: Point);
    constructor(p: Point, w: number, h: number);
    constructor(x: number, y: number, w: number, h: number);
    constructor() {
        if (arguments.length == 2) {
            this.p = new Point(Math.min(arguments[0].x, arguments[1].x), Math.min(arguments[0].y, arguments[1].y));
            this.w = Math.abs(arguments[0].x - arguments[1].x);
            this.h = Math.abs(arguments[0].y - arguments[1].y);
        } else if (arguments.length == 3) {
            this.p = arguments[0];
            this.w = arguments[1];
            this.h = arguments[2];
        } else if (arguments.length == 4) {
            this.p = new Point(arguments[0], arguments[1]);
            this.w = arguments[2];
            this.h = arguments[3];
        }
    }

    translate(x: number, y: number): Rect {
        this.p.translate(x, y);
        return this;
    }

    scale(s: number): Rect;
    scale(s: number, p: Point): Rect;
    scale() {
        if (arguments.length == 1) {
            this.p.scale(arguments[0]);
        } else if (arguments.length == 2) {
            this.p.scale(arguments[0], arguments[1]);
        }
        this.w *= arguments[0];
        this.h *= arguments[0];
        return this;
    }

    copy(): Rect {
        return new Rect(this.p.x, this.p.y, this.w, this.h);
    }

    centroid(): Point {
        return new Point(this.p.x + this.w * 0.5, this.p.y + this.h * 0.5);
    }

    area(): number {
        return this.w * this.h;
    }

    circumference(): number {
        return (this.w + this.h) * 2;
    }

    vertices(): Point[] {
        let points = new Array(4);
        points[0] = this.p.copy();
        points[1] = new Point(this.p.x + this.w, this.p.y);
        points[2] = new Point(this.p.x + this.w, this.p.y + this.h);
        points[3] = new Point(this.p.x, this.p.y + this.h);
        return points;
    }

    edges(): Line[] {
        let points = this.vertices();
        let lines = new Array(4);
        lines[0] = new Line(points[0], points[1]);
        lines[1] = new Line(points[1], points[2]);
        lines[2] = new Line(points[2], points[3]);
        lines[3] = new Line(points[3], points[0]);
        return lines;
    }

    polygon(): Polygon {
        return new Polygon(this.vertices());
    }

    merge(rect: Rect): Rect {
        let p1 = new Point(Math.min(this.p.x, rect.p.x), Math.min(this.p.y, rect.p.y));
        let p2 = new Point(Math.max(this.p.x + this.w, rect.p.x + rect.w), Math.max(this.p.y + this.h, rect.p.y + rect.h));
        return new Rect(p1, p2);
    }

    contains(s: Point | Circle | Rect): boolean {
        if (s instanceof Point) {
            return s.x >= this.p.x && s.x <= this.p.x + this.w && s.y >= this.p.y && s.y <= this.p.y + this.h;
        } else if (s instanceof Circle) {
            return s.p.x-s.r >= this.p.x && s.p.x+s.r <= this.p.x + this.w && s.p.y-s.r >= this.p.y && s.p.y+s.r <= this.p.y + this.h;
        } else if (s instanceof Rect) {
            return s.p.x >= this.p.x && s.p.y >= this.p.y && s.p.x + s.w <= this.p.x + this.w && s.p.y + s.h <= this.p.y + this.h;
        }
    }

    closest(p: Point): Point {
        let left = this.p.x;
        let top = this.p.y;
        let right = this.p.x + this.w;
        let bottom = this.p.y + this.h;

        if (p.x < left) {
            return new Point(left, Math.min(Math.max(p.y, top), bottom));
        } else if (p.y < top) {
            return new Point(Math.min(Math.max(p.x, left), right), top);
        } else if (p.x > right) {
            return new Point(right, Math.min(Math.max(p.y, top), bottom));
        } else if (p.y > bottom) {
            return new Point(Math.min(Math.max(p.x, left), right), bottom);
        } else {
            let cp;
            let dests = [
                Math.abs(p.x - left),
                Math.abs(p.y - top),
                Math.abs(p.x - right),
                Math.abs(p.y - bottom)
            ];
            let points = [
                new Point(left, p.y),
                new Point(p.x, top),
                new Point(right, p.y),
                new Point(p.x, bottom)
            ];
            let dmin = Number.POSITIVE_INFINITY;
            for (let i = 0; i < 4; i++) {
                if (dests[i] < dmin) {
                    cp = points[i];
                    dmin = dests[i];
                }
            }
            return cp;
        }
    }

    distance(p: Point): number {
        return p.distance(this.closest(p));
    }

    intersects(s: Point | Circle | Rect): boolean{
        if (s instanceof Point) {
            return this.contains(s);
        }else if(s instanceof Circle){
            return s.intersects(this);
        }else if(s instanceof Rect){
            return this.p.x <= s.p.x + s.w &&
                    this.p.x + this.w >= s.p.x &&
                    this.p.y <= s.p.y + s.h &&
                    this.p.y + this.h >= s.p.y;
        }
    }

    intersection(rect: Rect): Rect | null {
        if (!this.intersects(rect)) return null;

        let points = new Array();
        let vertices1 = this.vertices();
        let vertices2 = rect.vertices();
        for (let i = 0; i < 4; i++) {
            if (rect.contains(vertices1[i])) points.push(vertices1[i]);
            if (this.contains(vertices2[i])) points.push(vertices2[i]);
        }

        let edges1 = this.edges();
        let edges2 = rect.edges();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let p = edges1[i].intersection(edges2[j]);
                if (p != null) points.push(p);
            }
        }

        let p1 = points[0].copy();
        let p2 = points[0].copy();
        for (let i = 0; i < points.length; i++) {
            let p = points[i];
            if (p.x < p1.x) p1.x = p.x;
            if (p.x > p2.x) p2.x = p.x;
            if (p.y < p1.y) p1.y = p.y;
            if (p.y > p2.y) p2.y = p.y;
        }
        return new Rect(p1, p2);
    }

    split(data: number[], mode: string = 'squarify'): Rect[] { //dice, slice, squarify (default)
        if (mode == 'dice') {
            return this.dice(data);
        } else if (mode == 'slice') {
            return this.slice(data);
        } else if (mode == 'squarify') {
            let sum = data.reduce((a, b) => a + b);
            let array = new Array(data.length);
            for (let i = 0; i < data.length; i++) array[i] = data[i] / sum * this.area();
            return this.squarify(array, this.p.x, this.p.y, this.w, this.h);
        }
    }

    dice(data: number[]): Rect[] {
        let sum = data.reduce((a, b) => a + b);

        let p1 = this.p.copy();
        let p2 = new Point(this.p.x + this.w, this.p.y);
        let p3 = new Point(this.p.x + this.w, this.p.y + this.h);
        let p4 = new Point(this.p.x, this.p.y + this.h);

        let top = new Array(data.length);
        let bottom = new Array(data.length);
        top[0] = p1;
        bottom[data.length - 1] = p3;
        let t = 0;
        for (let i = 0; i < data.length - 1; i++) {
            t += data[i] / sum;
            top[i + 1] = p1.lerp(p2, t);
            bottom[i] = p4.lerp(p3, t);
        }
        let rectangles = new Array(data.length);
        for (let i = 0; i < data.length; i++) {
            rectangles[i] = new Rect(top[i], bottom[i]);
        }
        return rectangles;
    }

    slice(data: number[]): Rect[] {
        let sum = data.reduce((a, b) => a + b);

        let p1 = this.p.copy();
        let p2 = new Point(this.p.x + this.w, this.p.y);
        let p3 = new Point(this.p.x + this.w, this.p.y + this.h);
        let p4 = new Point(this.p.x, this.p.y + this.h);

        let left = new Array(data.length);
        let right = new Array(data.length);
        left[0] = p1;
        right[data.length - 1] = p3;
        let t = 0;
        for (let i = 0; i < data.length - 1; i++) {
            t += data[i] / sum;
            left[i + 1] = p1.lerp(p4, t);
            right[i] = p2.lerp(p3, t);
        }
        let rectangles = new Array(data.length);
        for (let i = 0; i < data.length; i++) {
            rectangles[i] = new Rect(left[i], right[i]);
        }
        return rectangles;
    }

    squarify(data: number[], x: number, y: number, w: number, h: number): Rect[] {
        let ratio = (w, h) => { return w > h ? w / h : h / w };

        let vertical = w > h;
        let side = vertical ? h : w;
        let rectangles = new Array();
        if (vertical) {
            for (let i = 0; i < data.length; i++) {
                let worst = rectangles.length == 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
                let areas = 0;
                for (let r of rectangles) worst = Math.max(worst, ratio(r.w, r.h));
                for (let r of rectangles) areas += r.area();
                let tw = (areas + data[i]) / side;
                let th = data[i] / tw;
                let ty = y;
                for (let r of rectangles) ty += r.area() / tw;
                let rect = new Rect(x, ty, tw, th);
                let k = ratio(rect.w, rect.h);
                for (let r of rectangles) k = Math.max(k, ratio(tw, r.area() / tw));
                if (k < worst) {
                    rectangles.push(rect);
                    ty = y;
                    for (let r of rectangles) {
                        [r.h, r.w, r.p.y] = [r.area() / tw, tw, ty];
                        ty += r.h;
                    }
                } else {
                    areas = 0;
                    for (let r of rectangles) areas += r.area();
                    let offset = areas / side;
                    rectangles = rectangles.concat(this.squarify(data.slice(i), x + offset, y, w - offset, h));
                    break;
                }
            }
        } else {
            for (let i = 0; i < data.length; i++) {
                let worst = rectangles.length == 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
                let areas = 0;
                for (let r of rectangles) worst = Math.max(worst, ratio(r.w, r.h));
                for (let r of rectangles) areas += r.area();
                let th = (areas + data[i]) / side;
                let tw = data[i] / th;
                let tx = x;
                for (let r of rectangles) tx += r.area() / th;
                let rect = new Rect(tx, y, tw, th);
                let k = ratio(rect.w, rect.h);
                for (let r of rectangles) k = Math.max(k, ratio(r.area() / th, th));
                if (k < worst) {
                    rectangles.push(rect);
                    tx = x;
                    for (let r of rectangles) {
                        [r.w, r.h, r.p.x] = [r.area() / th, th, tx];
                        tx += r.w;
                    }
                } else {
                    areas = 0;
                    for (let r of rectangles) areas += r.area();
                    let offset = areas / side;
                    rectangles = rectangles.concat(this.squarify(data.slice(i), x, y + offset, w, h - offset));
                    break;
                }
            }
        }

        return rectangles;
    }

    clip(poly: Polygon): Polygon | null {
        return new Polygon(this.vertices()).clip(poly);
    }
}




export class Polygon {
    vertices: Point[];

    constructor();
    constructor(points: Point[]);
    constructor() {
        if (arguments.length == 1) {
            this.vertices = arguments[0];
        } else {
            this.vertices = new Array();
        }
    }

    add(p: Point): Polygon;
    add(x: number, y: number): Polygon;
    add() {
        if (arguments.length == 1) {
            this.vertices.push(arguments[0]);
        } else if (arguments.length == 2) {
            this.vertices.push(new Point(arguments[0], arguments[1]));
        }
        return this;
    }

    clear(){
        this.vertices = [];
    }

    translate(x, y): Polygon {
        for (let v of this.vertices) v.translate(x, y);
        return this;
    }

    rotate(a: number): Polygon;
    rotate(a: number, p: Point): Polygon;
    rotate() {
        if (arguments.length == 1) {
            for (let v of this.vertices) v.rotate(arguments[0]);
        } else if (arguments.length == 2) {
            for (let v of this.vertices) v.rotate(arguments[0], arguments[1]);
        }
        return this;
    }

    scale(s: number): Polygon;
    scale(s: number, p: Point): Polygon;
    scale() {
        if (arguments.length == 1) {
            for (let v of this.vertices) v.scale(arguments[0]);
        } else if (arguments.length == 2) {
            for (let v of this.vertices) v.scale(arguments[0], arguments[1]);
        }
        return this;
    }

    reverse(): Polygon {
        this.vertices.reverse();
        return this;
    }

    edges(): Line[] {
        let lines = new Array();
        for (let i = 0; i < this.vertices.length; i++) {
            let p1 = this.vertices[i];
            let p2 = this.vertices[(i + 1) % this.vertices.length];
            lines.push(new Line(p1, p2));
        }
        return lines;
    }

    bounds(): Rect {
        let p1 = new Point(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        let p2 = new Point(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
        for (let p of this.vertices) {
            p1.x = Math.min(p1.x, p.x);
            p1.y = Math.min(p1.y, p.y);
            p2.x = Math.max(p2.x, p.x);
            p2.y = Math.max(p2.y, p.y);
        }
        return new Rect(p1, p2);
    }

    area(): number {
        let area = 0;
        for (let i = 0; i < this.vertices.length; i++) {
            let p1 = this.vertices[i];
            let p2 = this.vertices[(i + 1) % this.vertices.length];
            let v1 = new Vector(p1.x, p1.y);
            let v2 = new Vector(p2.x, p2.y);
            area += v1.cross(v2);
        }
        area /= 2;
        return area;
    }

    circumference(): number {
        let circumference = 0;
        for (let i = 0; i < this.vertices.length; i++) {
            let p1 = this.vertices[i];
            let p2 = this.vertices[(i + 1) % this.vertices.length];
            circumference += p1.distance(p2);
        }
        return circumference;
    }

    centroid(): Point {
        let area = this.area();
        let x = 0;
        let y = 0;
        for (let i = 0; i < this.vertices.length; i++) {
            let p1 = this.vertices[i];
            let p2 = this.vertices[(i + 1) % this.vertices.length];
            let v1 = new Vector(p1.x, p1.y);
            let v2 = new Vector(p2.x, p2.y);
            let cross = v1.cross(v2);
            x += (p1.x + p2.x) * cross;
            y += (p1.y + p2.y) * cross;
        }
        return new Point(x / 6 / area, y / 6 / area);
    }

    clockwise(): boolean {
        return this.area() > 0;
    }

    convex(): boolean {
        let clockwise = this.clockwise();

        for (let i = 0; i < this.vertices.length; i++) {
            let p1 = this.vertices[i];
            let p2 = this.vertices[(i + 1) % this.vertices.length];
            let p3 = this.vertices[(i + 2) % this.vertices.length];
            let v1 = new Vector(p2.x - p1.x, p2.y - p1.y);
            let v2 = new Vector(p3.x - p2.x, p3.y - p2.y);
            if (clockwise) {
                if (v1.cross(v2) < 0) return false;
            } else {
                if (v1.cross(v2) > 0) return false;
            }
        }
        return true;
    }

    contains(s: Point | Polygon): boolean {
        if (this.vertices.length < 3) return false;

        if (s instanceof Point) {
            let count = 0;
            for (let i = 0; i < this.vertices.length; i++) {
                let p1 = this.vertices[i];
                let p2 = this.vertices[(i + 1) % this.vertices.length];
                if (p1.x <= s.x && s.x < p2.x || p2.x <= s.x && s.x < p1.x) {
                    let y = (p2.y - p1.y) / (p2.x - p1.x) * (s.x - p1.x) + p1.y;
                    if (s.y < y) count++;
                }
            }
            return count % 2 != 0;
        } else if (s instanceof Polygon) {
            for (let i = 0; i < s.vertices.length; i++) {
                if (!this.contains(s.vertices[i])) return false;
            }
            return true;
        }
    }

    closest(p: Point): Point {
        let cp;
        let dmin = Number.POSITIVE_INFINITY;
        for (let i = 0; i < this.vertices.length; i++) {
            let l = new Line(this.vertices[i], this.vertices[(i + 1) % this.vertices.length]);
            let lp = l.closest(p);
            let d = p.distanceSq(lp);
            if (d < dmin) {
                cp = lp;
                dmin = d;
            }
        }
        return cp;
    }

    distance(p: Point): number {
        return p.distance(this.closest(p));
    }

    clip(poly: Polygon): Polygon | null {
        let [x, y] = [0, 0];
        let points = new Array();
        for (let i = 0; i < this.vertices.length; i++) {
            let p1 = this.vertices[i];
            let p2 = this.vertices[(i + 1) % this.vertices.length];
            let l1 = new Line(p1, p2);
            if (poly.contains(p1)) {
                points.push(p1);
                [x, y] = [x + p1.x, y + p1.y];
            }
            for (let j = 0; j < poly.vertices.length; j++) {
                let p3 = poly.vertices[j];
                let p4 = poly.vertices[(j + 1) % poly.vertices.length];
                let l2 = new Line(p3, p4);
                let ip = l1.intersection(l2);
                if (ip != null) {
                    points.push(ip);
                    [x, y] = [x + ip.x, y + ip.y];
                }
            }
        }

        for (let i = 0; i < poly.vertices.length; i++) {
            let p = poly.vertices[i];
            if (this.contains(p)) {
                points.push(p);
                [x, y] = [x + p.x, y + p.y];
            }
        }
        [x, y] = [x / points.length, y / points.length];

        points.sort(function (a, b) {
            let a1 = new Vector(a.x - x, a.y - y).angle();
            let a2 = new Vector(b.x - x, b.y - y).angle();
            if (a1 > a2) return 1;
            else if (a1 == a2) return 0;
            else return -1;
        });

        if(points.length>0) return new Polygon(points);
        else return null;
    }
}




export class QuadTree {
    children: QuadTree[];
    objects: any[];

    bounds: Rect;
    capacity: number;
    maxLevels: number;
    private _level: number;
    
    constructor(bounds: Rect, capacity: number = 4, maxLevels: number = 4, level: number = 0) {
        this.bounds = bounds;
        this.capacity = capacity;
        this.maxLevels = maxLevels;
        this._level = level;

        this.children = null;
        this.objects = [];
    }

    leaf(): boolean{
        return this.children == null;
    }

    clear(){
        this.children = null;
        this.objects = [];
    }

    insert(object: any){
        if(object instanceof Array){
            for(let i=0; i<object.length; i++) this.insert(object[i]);  
            return;
        }

        if(this.children){
            for(let i=0; i<4; i++){
                if(this.children[i].bounds.intersects(object.bounds())) 
                    this.children[i].insert(object);
            }
            return;
        }

        this.objects.push(object);

        if(this.objects.length > this.capacity && this._level < this.maxLevels){
            let x = this.bounds.p.x;
            let y = this.bounds.p.y;
            let w = this.bounds.w/2;
            let h = this.bounds.h/2;
            this.children = [
                new QuadTree(new Rect(x, y, w, h), this.capacity, this.maxLevels, this._level+1), 
                new QuadTree(new Rect(x+w, y, w, h), this.capacity, this.maxLevels, this._level+1),
                new QuadTree(new Rect(x+w, y+h, w, h), this.capacity, this.maxLevels, this._level+1),
                new QuadTree(new Rect(x, y+h, w, h), this.capacity, this.maxLevels, this._level+1)
            ];
            
            for(let i=0; i<this.objects.length; i++){
                for(let j=0; j<4; j++){
                    if(this.children[j].bounds.intersects(this.objects[i].bounds()))
                        this.children[j].insert(this.objects[i]);
                }
            }

            this.objects = [];
        }
    }

    query(range: Rect | Circle): any[]{
        let objects = this.objects;

        if(this.children){
            for(let i=0; i<4; i++){
                if(this.children[i].bounds.intersects(range)) {
                    objects = objects.concat(this.children[i].query(range));
                }
            }
        }

        objects = objects.filter((x,index)=>objects.indexOf(x)===index);

        return objects;
    }
}




export class ConvexHull {
    vertices: Point[];
    region: Polygon;

    compute(points) {
        if (points.length < 3) {
            this.vertices = points;
            this.region = new Polygon(points);
            return;
        }

        let sort_points = points.slice();

        sort_points.sort(function (a, b) {
            if (a.y > b.y) return 1;
            else if (a.y == b.y) return a.x - b.x;
            else return -1;
        });

        let p = new Point(sort_points[0].x - 1, sort_points[0].y);
        let v = new Vector(1, 0);
        sort_points.sort(function (a, b) {
            let a1 = new Vector(a.x - p.x, a.y - p.y).angle();
            let a2 = new Vector(b.x - p.x, b.y - p.y).angle();
            if (a1 > a2) return 1;
            else if (a1 == a2) return a.distanceSq(p) - b.distanceSq(p);
            else return -1;
        });

        let vertices = new Array();
        for (let i = 0; i < sort_points.length; i++) {
            if (vertices.length < 2) {
                vertices.push(sort_points[i]);
            } else {
                vertices.push(sort_points[i]);
                let valid;
                do {
                    let p1 = vertices[vertices.length - 3];
                    let p2 = vertices[vertices.length - 2];
                    let p3 = vertices[vertices.length - 1];
                    let v1 = new Vector(p2.x - p1.x, p2.y - p1.y);
                    let v2 = new Vector(p3.x - p1.x, p3.y - p1.y);
                    if (v1.cross(v2) > 0) {
                        valid = true;
                    } else {
                        valid = false;
                        vertices.splice(vertices.length - 2, 1);
                    }
                } while (vertices.length >= 3 && !valid);
            }
        }

        this.vertices = vertices;
        this.region = new Polygon(this.vertices);
    }
}




export class Delaunay {
    vertices: Point[];
    edges: Line[];
    triangles: Triangle[];

    compute(points: Point[]) {
        let left = Number.POSITIVE_INFINITY;
        let top = Number.POSITIVE_INFINITY;
        let right = Number.NEGATIVE_INFINITY;
        let bottom = Number.NEGATIVE_INFINITY;
        for (let i = 0; i < points.length; i++) {
            left = Math.min(points[i].x, left);
            top = Math.min(points[i].y, top);
            right = Math.max(points[i].x, right);
            bottom = Math.max(points[i].y, bottom);
        }
        let x = (left + right) / 2;
        let y = (top + bottom) / 2;

        let p1 = new Point(x + 10000000, y);
        let p2 = new Point(x - 5000000, y + 10000000);
        let p3 = new Point(x - 5000000, y - 10000000);
        let superTriangle = new Triangle(p1, p2, p3);

        let triangles = new Array();
        triangles.push(superTriangle);

        for (let i = 0; i < points.length; i++) {
            let lines = new Array();
            for (let j = triangles.length - 1; j >= 0; j--) {
                let t = triangles[j];
                if (t.circumcircle().contains(points[i])) {
                    lines.push(new Line(t.p1, t.p2));
                    lines.push(new Line(t.p2, t.p3));
                    lines.push(new Line(t.p3, t.p1));
                    triangles.splice(j, 1);
                }
            }

            for (let j = 0; j < lines.length - 1; j++) {
                let e1 = lines[j];
                for (let k = j + 1; k < lines.length; k++) {
                    let e2 = lines[k];
                    if (e1.p1 == e2.p1 && e1.p2 == e2.p2 || e1.p1 == e2.p2 && e1.p2 == e2.p1) {
                        e1.__remove = true;
                        e2.__remove = true;
                    }
                }
            }

            for (let j = lines.length - 1; j >= 0; j--) {
                let e = lines[j];
                if (e.__remove) lines.splice(j, 1);
                else triangles.push(new Triangle(points[i], e.p1, e.p2));
            }
        }

        let edges = new Array();
        for (let i = triangles.length - 1; i >= 0; i--) {
            let t = triangles[i];
            if ((t.p1 == superTriangle.p1 || t.p1 == superTriangle.p2 || t.p1 == superTriangle.p3) ||
                (t.p2 == superTriangle.p1 || t.p2 == superTriangle.p2 || t.p2 == superTriangle.p3) ||
                (t.p3 == superTriangle.p1 || t.p3 == superTriangle.p2 || t.p3 == superTriangle.p3)) {
                triangles.splice(i, 1);
            } else {
                edges.push(new Line(t.p1, t.p2));
                edges.push(new Line(t.p2, t.p3));
                edges.push(new Line(t.p3, t.p1));
            }
        }

        for (let i = edges.length - 1; i > 0; i--) {
            let e1 = edges[i];
            for (let j = i - 1; j >= 0; j--) {
                let e2 = edges[j];
                if (e1.p1 == e2.p1 && e1.p2 == e2.p2 || e1.p1 == e2.p2 && e1.p2 == e2.p1) {
                    edges.splice(i, 1);
                }
            }
        }

        this.vertices = points;
        this.edges = edges;
        this.triangles = triangles;
    }
}




export class Voronoi {
    triangles: Triangle[];
    vertices: Point[];
    edges: Line[];
    regions: Polygon[];

    compute(points: Point[]) {
        let left = Number.POSITIVE_INFINITY;
        let top = Number.POSITIVE_INFINITY;
        let right = Number.NEGATIVE_INFINITY;
        let bottom = Number.NEGATIVE_INFINITY;
        for (let i = 0; i < points.length; i++) {
            left = Math.min(points[i].x, left);
            top = Math.min(points[i].y, top);
            right = Math.max(points[i].x, right);
            bottom = Math.max(points[i].y, bottom);
        }
        let x = (left + right) / 2;
        let y = (top + bottom) / 2;

        let p1 = new Point(x + 10000000, y);
        let p2 = new Point(x - 5000000, y + 10000000);
        let p3 = new Point(x - 5000000, y - 10000000);
        let superTriangle = new Triangle(p1, p2, p3);

        let triangles = new Array();
        triangles.push(superTriangle);

        for (let i = 0; i < points.length; i++) {
            (<any>points[i]).__circumcenters = new Array();

            let lines = new Array();
            for (let j = triangles.length - 1; j >= 0; j--) {
                let t = triangles[j];
                if (t.circumcircle().contains(points[i])) {
                    lines.push(new Line(t.p1, t.p2));
                    lines.push(new Line(t.p2, t.p3));
                    lines.push(new Line(t.p3, t.p1));
                    triangles.splice(j, 1);
                }
            }

            for (let j = 0; j < lines.length - 1; j++) {
                let e1 = lines[j];
                for (let k = j + 1; k < lines.length; k++) {
                    let e2 = lines[k];
                    if (e1.p1 == e2.p1 && e1.p2 == e2.p2 || e1.p1 == e2.p2 && e1.p2 == e2.p1) {
                        e1.__remove = true;
                        e2.__remove = true;
                    }
                }
            }

            for (let j = lines.length - 1; j >= 0; j--) {
                let e = lines[j];
                if (e.__remove) lines.splice(j, 1);
                else triangles.push(new Triangle(points[i], e.p1, e.p2));
            }
        }

        let vertices = new Array();
        for (let i = 0; i < triangles.length; i++) {
            let t = triangles[i];
            t.__circumcenter = t.circumcircle().p;
            vertices.push(t.__circumcenter);
            if (t.p1.__circumcenters) t.p1.__circumcenters.push(t.__circumcenter);
            if (t.p2.__circumcenters) t.p2.__circumcenters.push(t.__circumcenter);
            if (t.p3.__circumcenters) t.p3.__circumcenters.push(t.__circumcenter);
        }

        let edges = new Array();
        for (let i = 0; i < triangles.length; i++) {
            let t1 = triangles[i];
            for (let j = 0; j < i; j++) {
                let t2 = triangles[j];
                if ((t1.p1 == t2.p1 && t1.p2 == t2.p2 || t1.p1 == t2.p2 && t1.p2 == t2.p1) ||
                    (t1.p1 == t2.p2 && t1.p2 == t2.p3 || t1.p1 == t2.p3 && t1.p2 == t2.p2) ||
                    (t1.p1 == t2.p3 && t1.p2 == t2.p1 || t1.p1 == t2.p1 && t1.p2 == t2.p3) ||
                    (t1.p2 == t2.p1 && t1.p3 == t2.p2 || t1.p2 == t2.p2 && t1.p3 == t2.p1) ||
                    (t1.p2 == t2.p2 && t1.p3 == t2.p3 || t1.p2 == t2.p3 && t1.p3 == t2.p2) ||
                    (t1.p2 == t2.p3 && t1.p3 == t2.p1 || t1.p2 == t2.p1 && t1.p3 == t2.p3) ||
                    (t1.p3 == t2.p1 && t1.p1 == t2.p2 || t1.p3 == t2.p2 && t1.p1 == t2.p1) ||
                    (t1.p3 == t2.p2 && t1.p1 == t2.p3 || t1.p3 == t2.p3 && t1.p1 == t2.p2) ||
                    (t1.p3 == t2.p3 && t1.p1 == t2.p1 || t1.p3 == t2.p1 && t1.p1 == t2.p3)) {
                    edges.push(new Line(t1.__circumcenter, t2.__circumcenter));
                }
            }
        }

        let regions = new Array();
        for (let i = 0; i < points.length; i++) {
            let p = points[i];
            (<any>p).__circumcenters.sort(function (a, b) {
                let v1 = new Vector(a.x - p.x, a.y - p.y);
                let v2 = new Vector(b.x - p.x, b.y - p.y);
                return v1.angle() - v2.angle();
            });
            let region = new Polygon((<any>p).__circumcenters);
            regions.push(region);
        }

        this.triangles = triangles;
        this.vertices = vertices;
        this.edges = edges;
        this.regions = regions;
    }
}




export class LimitedVoronoi {
    cells: Cell[];

    compute(cells: Cell[]|Circle[]) {
        let sites;
        if (cells[0] instanceof Circle) {
            sites = new Array(cells.length);
            for (let i = 0; i < cells.length; i++){
                sites[i] = new Cell(cells[i].p.x, cells[i].p.y, cells[i].r);
            }
        }else{
            sites = cells;
        }

        for (let i = 0; i < cells.length; i++) {
            sites[i].clear();
            sites[i].__lines = new Array();
            sites[i].__points = new Array();
            sites[i].__contained = false;
        }

        for (let i = 0; i < sites.length - 1; i++) {
            let s1 = sites[i];
            for (let j = i + 1; j < sites.length; j++) {
                let s2 = sites[j];
                let d = s1.p.distance(s2.p);
                if (d < s1.r - s2.r) s2.__contained = true;
                if (d < s2.r - s1.r) s1.__contained = true;
            }
        }

        let lines = new Array();

        for (let i = 0; i < sites.length - 1; i++) {
            let s1 = sites[i];
            if (s1.__contained) continue;
            for (let j = i + 1; j < sites.length; j++) {
                let s2 = sites[j];
                if (s2.__contained) continue;
                if (s1.p.distance(s2.p) < s1.r + s2.r) {
                    let points = intersection(s1, s2);
                    let p1 = points[0];
                    let p2 = points[1];
                    let p3 = points[1].copy();
                    let p4 = points[0].copy();
                    s1.__points.push(p1);
                    s1.__points.push(p2);
                    s2.__points.push(p3);
                    s2.__points.push(p4);
                    let l1 = new Line(p1, p2);
                    let l2 = new Line(p3, p4);
                    s1.__lines.push(l1);
                    s2.__lines.push(l2);
                    lines.push(l1);
                    lines.push(l2);
                    (<any>l1).__s1 = s1;
                    (<any>l1).__s2 = s2;
                    (<any>l2).__s1 = s2;
                    (<any>l2).__s2 = s1;
                    (<any>p1).__l1 = l1;
                    (<any>p1).__l2 = l2;
                    (<any>p2).__l1 = l1;
                    (<any>p2).__l2 = l2;
                    (<any>p3).__l1 = l1;
                    (<any>p3).__l2 = l2;
                    (<any>p4).__l1 = l1;
                    (<any>p4).__l2 = l2;
                    (<any>p1).__arc = true;
                    (<any>p3).__arc = true;
                }
            }
        }


        function intersection(s1, s2) {
            let d = s1.p.distance(s2.p);
            let a = (s1.r * s1.r - s2.r * s2.r + d * d) / (2 * d);
            let h = Math.sqrt(s1.r * s1.r - a * a);
            let p = new Vector(s2.p.x - s1.p.x, s2.p.y - s1.p.y).normalize().mult(a).add(s1.p.x, s1.p.y);
            let dx = h * (s2.p.y - s1.p.y) / d;
            let dy = h * (s2.p.x - s1.p.x) / d;
            let p2 = new Point(p.x - dx, p.y + dy);
            let p1 = new Point(p.x + dx, p.y - dy);
            let clockwise = (p1.x - s2.p.x) * (p2.y - s2.p.y) - (p2.x - s2.p.x) * (p1.y - s2.p.y) < 0;
            if (a > d) clockwise = !clockwise;
            if (clockwise) {
                return [p2, p1];
            } else {
                return [p1, p2];
            }
        }

        for (let i = 0; i < lines.length - 1; i++) {
            for (let j = i + 1; j < lines.length; j++) {
                let l1 = lines[i];
                let l2 = lines[j];
                if (l1.__s1 == l2.__s2 && l1.__s2 == l2.__s1) continue;
                if (l1.__s1 == l2.__s1) {
                    let p = l1.intersection(l2);
                    if (p != null) {
                        p.__l1 = l1;
                        p.__l2 = l2;
                        l1.__s1.__points.push(p);
                    }
                }
            }
        }

        for (let i = 0; i < sites.length; i++) {
            let s = sites[i];

            if (s.__contained) {
                s.state = 2;
                continue;
            }
            if (s.__points.length == 0) {
                s.state = 0;
                continue;
            }

            for (let j = 0; j < s.__lines.length; j++) {
                let l = s.__lines[j];
                for (let k = s.__points.length - 1; k >= 0; k--) {
                    let p = s.__points[k];
                    if (p.__l1 != l && p.__l2 != l) {
                        let v = new Vector(p.x - l.p1.x, p.y - l.p1.y);
                        if (v.cross(l.direction()) < 0) s.__points.splice(k, 1);
                    }
                }
            }

            let center = new Vector();
            for (let j = 0; j < s.__points.length; j++) {
                let p = s.__points[j];
                center = center.add(p.x, p.y);
            }
            center = center.div(s.__points.length);

            s.__points.sort(function (a, b) {
                let a1 = new Vector(a.x - center.x, a.y - center.y).angle();
                let a2 = new Vector(b.x - center.x, b.y - center.y).angle();
                return a1 - a2;
            });

            for (let j = s.__points.length - 1; j > 1; j--) {
                let p1 = s.__points[j];
                let p2 = s.__points[j - 1];
                if (p1.distance(p2) < 1e-4) s.__points.splice(j, 1);
            }

            if (s.__points.length > 0) {
                s.state = 1;
            } else {
                s.state = 2;
                continue;
            }

            for (let j = 0; j < s.__points.length; j++) {
                let p = s.__points[j];
                let a = new Vector(p.x, p.y).sub(s.p.x, s.p.y).angle();
                s.vertices.push(new CellVertex(p.x, p.y, a, p.__arc ? 1 : 0));
            }
        }

        this.cells = sites;
    }
}

export class CellVertex {
    x: number;
    y: number;
    a: number;
    type: number; //line, arc

    constructor(x: number, y: number, a: number, type: number) {
        this.x = x;
        this.y = y;
        this.a = a;
        this.type = type;
    }
}

export class Cell {
    p: Point;
    r: number;
    vertices: CellVertex[];
    state: number; //disjoint, intersect, contain

    constructor(p: Point, r: number)
    constructor(x: number, y: number, r: number)
    constructor() {
        if (arguments.length == 2) {
            this.p = arguments[0];
            this.r = arguments[1];
        } else if (arguments.length == 3) {
            this.p = new Point(arguments[0], arguments[1]);
            this.r = arguments[2];
        }
        this.vertices = new Array();
    }

    clear(){
        this.vertices = [];
    }

    polygon(detail: number): Polygon {
        if (this.state != 1) return new Circle(this.p, this.r).polygon(detail);

        let points = new Array();
        for (let i = 0; i < this.vertices.length; i++) {
            const v1 = this.vertices[i];
            const v2 = this.vertices[(i + 1) % this.vertices.length];
            if (v1.type == 0) {
                points.push(new Point(v1.x, v1.y));
            } else {
                let start = v1.a;
                let end = v2.a;
                if (start > end) end += 2 * Math.PI;
                const n = Math.max((end - start) / (2 * Math.PI) * detail, 1);
                for (let j = 0; j < n; j++) {
                    const a = start + (end - start) * j / n;
                    const x = this.p.x + Math.cos(a) * this.r;
                    const y = this.p.y + Math.sin(a) * this.r;
                    points.push(new Point(x, y));
                }
            }
        }
        return new Polygon(points);
    }
}