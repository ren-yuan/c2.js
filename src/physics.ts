//Created by Ren Yuan


import { Vector, Point, Line, Arc, Circle, Rect, Polygon, QuadTree } from "./geometry";


export class World {
    bounds: Rect;
    friction: number = .75;

    particles: Particle[];
    springs: Spring[];

    forces: Force[];
    interactionForces: InteractionForce[];
    constraints: Constraint[];

    constructor(bounds: Rect = null) {
        this.bounds = bounds;

        this.particles = [];
        this.springs = [];
        this.forces = [];
        this.interactionForces = [];
        this.constraints = [];
    }

    addParticle(p: Particle) {
        this.particles.push(p);
    }
    addSpring(s: Spring) {
        this.springs.push(s);
    }
    addForce(f: Force) {
        this.forces.push(f);
    }
    addInteractionForce(f: InteractionForce) {
        this.interactionForces.push(f);
    }
    addConstraint(c: Constraint) {
        this.constraints.push(c);
    }

    removeParticle(p: Particle){
        let index = this.particles.indexOf(p);
        if(index!=-1) this.particles.splice(index, 1);
    }
    removeSpring(s: Spring) {
        let index = this.springs.indexOf(s);
        if(index!=-1) this.springs.splice(index, 1);
    }
    removeForce(f: Force) {
        let index = this.forces.indexOf(f);
        if(index!=-1) this.forces.splice(index, 1);
    }
    removeInteractionForce(f: InteractionForce) {
        let index = this.interactionForces.indexOf(f);
        if(index!=-1) this.interactionForces.splice(index, 1);
    }
    removeConstraint(c: Constraint){
        let index = this.constraints.indexOf(c);
        if(index!=-1) this.constraints.splice(index, 1);
    }

    update() {
        for (let p of this.particles) for (let f of this.forces) f.apply(p);
        for (let f of this.interactionForces) f.apply(this.particles);
        for (let s of this.springs) s.update();
        for (let p of this.particles) p.update(this.friction);
        for (let p of this.particles) for (let c of this.constraints) c.apply(p);
        if (this.bounds) for (let p of this.particles) p.bounce(this.bounds);
    }
}


export class Particle {
    previousPosition: Vector;
    position: Vector;
    radius: number = 1;
    mass: number = 1;

    private _force: Vector;
    private _fix:boolean;

    constructor(x: number, y: number) {
        this.position = new Vector(x, y);
        this.previousPosition = this.position.copy();
        this._force = new Vector();
    }

    velocity(){
        return this.position.sub(this.previousPosition);
    }

    addVelocity(v: Vector) {
        if(this._fix) return;
        this.previousPosition = this.previousPosition.sub(v);
    }

    clearVelocity(){
        this.previousPosition = this.position.copy();
    }

    addForce(f: Vector) {
        if(this._fix) return;
        this._force = this._force.add(f);
    }

    clearForce(){
        this._force = new Vector();
    }

    update(friction: number = 1) {
        if(this._fix) return;
        let v = this.position.sub(this.previousPosition);
        let p = this.position.add(v.add(this._force.div(this.mass)).mult(friction));
        this.previousPosition = this.position.copy();
        this.position = p;
        this._force = this._force.mult(0);
    }

    bounce(rect: Rect) {
        if(this._fix) return;
        this.position.x = Math.min(Math.max(this.position.x, rect.p.x + this.radius), rect.p.x + rect.w - this.radius);
        this.position.y = Math.min(Math.max(this.position.y, rect.p.y + this.radius), rect.p.y + rect.h - this.radius);
    }

    bounds(): Circle {
        return new Circle(this.position.x, this.position.y, this.radius);
    }

    fix(){
        this._fix = true;
    }

    unfix(){
        this._fix = false;
    }
}


export class Spring {
    p1: Particle;
    p2: Particle;
    length: number;
    strength: number = 1;

    private _min: number = 0;
    private _max: number = Number.POSITIVE_INFINITY;

    constructor(p1: Particle, p2: Particle);
    constructor(p1: Particle, p2: Particle, strength: number);
    constructor(p1: Particle, p2: Particle, strength: number, length: number);
    constructor() {
        this.p1 = arguments[0];
        this.p2 = arguments[1];
        if (arguments.length == 2) {
            this.length = this.p1.position.sub(this.p2.position).mag();
        } else if (arguments.length == 3) {
            this.length = this.p1.position.sub(this.p2.position).mag();
            this.strength = arguments[2];
        } else if (arguments.length == 4) {
            this.strength = arguments[2];
            this.length = arguments[3];
        }
    }

    range(min: number = 0, max:number = Number.POSITIVE_INFINITY){
        this._min = min;
        this._max = max;
    }

    update() {
        let v = this.p1.position.sub(this.p2.position);
        let d = v.mag();

        if (d >= this._min && d <= this._max) {
            v = v.mult((this.length - d) / d / (this.p1.mass+this.p2.mass) * this.strength);
            this.p1.position = this.p1.position.add(v.mult(this.p1.mass));
            this.p2.position = this.p2.position.sub(v.mult(this.p2.mass));
        }
    }
}




export abstract class Force {
    abstract apply(p: Particle);
}

export class ConstForce extends Force {
    force: Vector;

    constructor(v: Vector);
    constructor(x: number, y: number);
    constructor() {
        super();
        if (arguments.length == 1) {
            this.force = arguments[0];
        } else if (arguments.length == 2) {
            this.force = new Vector(arguments[0], arguments[1]);
        } else {
            this.force = new Vector(0, 0);
        }
    }

    apply(p: Particle) {
        p.addForce(this.force);
    }
}

export class PointField extends Force {
    point: Point;
    strength: number;

    private _min: number = 0;
    private _max: number = Number.POSITIVE_INFINITY;

    constructor(point: Point, strength: number = 1) {
        super();
        this.point = point;
        this.strength = strength;
    }

    range(min: number = 0, max:number = Number.POSITIVE_INFINITY){
        this._min = min;
        this._max = max;
    }

    force(position: Vector): Vector | null {
        let force = position.sub(this.point.x, this.point.y);
        let d = force.mag();

        if (d >= this._min && d <= this._max) {
            let a = d - this._min;
            let b = this._max - this._min;
            force = force.normalize().mult(1.0 - a * a / (b * b));
            return force.mult(-this.strength);
        } else {
            return null;
        }
    }

    apply(p: Particle) {
        let force = this.force(p.position);
        if (force) p.addForce(force);
    }
}

export class LineField extends Force {
    line: Line;
    strength: number;

    private _min: number = 0;
    private _max: number = Number.POSITIVE_INFINITY;

    constructor(line: Line, strength: number = 1) {
        super();
        this.line = line;
        this.strength = strength;
    }

    range(min: number = 0, max:number = Number.POSITIVE_INFINITY){
        this._min = min;
        this._max = max;
    }

    force(position: Vector): Vector | null {
        let cp = this.line.closest(new Point(position.x, position.y));

        let force = position.sub(cp.x, cp.y);
        let d = force.mag();

        if (d >= this._min && d <= this._max) {
            let a = d - this._min;
            let b = this._max - this._min;
            force = force.normalize().mult(1.0 - a * a / (b * b));
            return force.mult(-this.strength);
        } else {
            return null;
        }
    }

    apply(p: Particle) {
        let force = this.force(p.position);
        if (force) p.addForce(force);
    }
}

export class ArcField extends Force {
    arc: Arc;
    strength: number;

    private _min: number = 0;
    private _max: number = Number.POSITIVE_INFINITY;

    constructor(arc: Arc, strength: number = 1) {
        super();
        this.arc = arc;
        this.strength = strength;
    }

    range(min: number = 0, max:number = Number.POSITIVE_INFINITY){
        this._min = min;
        this._max = max;
    }

    force(position: Vector): Vector | null {
        let cp = this.arc.closest(new Point(position.x, position.y));

        let force = position.sub(cp.x, cp.y);
        let d = force.mag();

        if (d >= this._min && d <= this._max) {
            let a = d - this._min;
            let b = this._max - this._min;
            force = force.normalize().mult(1.0 - a * a / (b * b));
            return force.mult(-this.strength);
        } else {
            return null;
        }
    }

    apply(p: Particle) {
        let force = this.force(p.position);
        if (force) p.addForce(force);
    }
}

export class CircleField extends Force {
    circle: Circle;
    strength: number;

    private _min: number = 0;
    private _max: number = Number.POSITIVE_INFINITY;

    constructor(circle: Circle, strength: number = 1) {
        super();
        this.circle = circle;
        this.strength = strength;
    }

    range(min: number = 0, max:number = Number.POSITIVE_INFINITY){
        this._min = min;
        this._max = max;
    }

    force(position: Vector): Vector | null {
        let cp = this.circle.closest(new Point(position.x, position.y));

        let force = position.sub(cp.x, cp.y);
        let d = force.mag();

        if (d >= this._min && d <= this._max) {
            let a = d - this._min;
            let b = this._max - this._min;
            force = force.normalize().mult(1.0 - a * a / (b * b));
            return force.mult(-this.strength);
        } else {
            return null;
        }
    }

    apply(p: Particle) {
        let force = this.force(p.position);
        if (force) p.addForce(force);
    }
}




export abstract class InteractionForce {
    abstract apply(particles: Particle[]);
}

export class Collision extends InteractionForce {
    strength: number = 1;
    iterations: number = 1;

    private _filter: Function;
    private _quadTree: QuadTree;

    constructor(quadTree: QuadTree = null) {
        super();
        this._filter = ()=>true;
        this._quadTree = quadTree;
    }

    filter(f:Function){
        this._filter = f;
    }

    apply(particles: Particle[]) {
        for (let k = 0; k < this.iterations; k++) {
            if(this._quadTree){
                this._quadTree.clear();
                this._quadTree.insert(particles);
            }
            
            for (let i = 0; i < particles.length - 1; i++) {
                let a = particles[i];

                if(this._quadTree){
                    let objects = this._quadTree.query(new Circle(a.position.x, a.position.y, a.radius));

                    for (let j = 0; j < objects.length; j++) {
                        let b = objects[j];
                        if (!this._filter(a, b) || a === b) continue;

                        let v = a.position.sub(b.position);
                        let d = v.mag();
                        let r = a.radius + b.radius;
                        if (d < r) {
                            v = v.normalize().mult(r - d).mult(this.strength);
                            a.position = a.position.add(v.mult(a.radius / r));
                            b.position = b.position.sub(v.mult(b.radius / r));
                        }
                    }
                }else{
                    for (let j = i + 1; j < particles.length; j++) {
                        let b = particles[j];
                        if (!this._filter(a, b)) continue;

                        let v = a.position.sub(b.position);
                        let d = v.mag();
                        let r = a.radius + b.radius;
                        if (d < r) {
                            v = v.normalize().mult(r - d).mult(this.strength);
                            a.position = a.position.add(v.mult(a.radius / r));
                            b.position = b.position.sub(v.mult(b.radius / r));
                        }
                    }
                }
            }
        }
    }
}

export class Gravitation extends InteractionForce {
    G: number;
    iterations: number = 1;

    private _min: number = 0;
    private _max: number = Number.POSITIVE_INFINITY;
    private _filter: Function;

    constructor(G: number = 1) {
        super();
        this.G = G;
        this._filter = ()=>true;
    }

    range(min: number = 0, max: number = Number.POSITIVE_INFINITY){
        this._min = min;
        this._max = max;
    }

    filter(f:Function){
        this._filter = f;
    }

    apply(particles: Particle[]) {
        for (let k = 0; k < this.iterations; k++) {
            for (let i = 0; i < particles.length - 1; i++) {
                let a = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    let b = particles[j];
                    if (!this._filter(a, b)) continue;

                    let v = a.position.sub(b.position);
                    let d = v.mag();
                    if (d >= this._min && d <= this._max) {
                        v = v.normalize().mult(this.G * a.mass * b.mass / (d * d));
                        a.position = a.position.sub(v);
                        b.position = b.position.add(v);
                    }
                }
            }
        }
    }
}




export abstract class Constraint {
    abstract apply(p: Particle);
}

export class CircleConstraint extends Constraint {
    circle: Circle;

    constructor(circle: Circle) {
        super();
        this.circle = circle;
    }

    apply(p: Particle) {
        if (this.circle.p.distance(new Point(p.position.x, p.position.y)) < this.circle.r + p.radius) {
            let v = p.position.sub(this.circle.p.x, this.circle.p.y).normalize()
            v = v.mult(this.circle.r + p.radius).add(this.circle.p.x, this.circle.p.y);
            p.position.x = v.x;
            p.position.y = v.y;
        }
    }
}

export class RectConstraint extends Constraint {
    rect: Rect;

    constructor(rect: Rect) {
        super();
        this.rect = rect;
    }

    apply(p: Particle) {
        let x = p.position.x;
        let y = p.position.y;
        let cx = false;
        let cy = false;

        if (x < this.rect.p.x) x = this.rect.p.x;
        else if (x > this.rect.p.x + this.rect.w) x = this.rect.p.x + this.rect.w;
        else cx = true;
        if (y < this.rect.p.y) y = this.rect.p.y;
        else if (y > this.rect.p.y + this.rect.h) y = this.rect.p.y + this.rect.h;
        else cy = true;

        let dx = p.position.x - x;
        let dy = p.position.y - y;

        if (dx * dx + dy * dy <= p.radius * p.radius) {
            let v = p.position.sub(x, y).normalize().mult(p.radius).add(x, y);
            if (cx && cy) v = v.invert();
            p.position.x = v.x;
            p.position.y = v.y;
        }
    }
}

export class PolygonConstraint extends Constraint {
    polygon: Polygon;

    constructor(polygon: Polygon) {
        super();
        this.polygon = polygon;
    }

    apply(p: Particle) {
        let point = new Point(p.position.x, p.position.y);
        let contain = this.polygon.contains(point);
        let cp = this.polygon.closest(point);
        let d = cp.distance(point);

        if (contain || d < p.radius) {
            let v = p.position.sub(cp.x, cp.y).normalize().mult(p.radius).add(cp.x, cp.y);
            if (contain) v = v.invert();
            p.position.x = v.x;
            p.position.y = v.y;
        }
    }
}