//Created by Ren Yuan


export function deg(rad: number): number {
    return rad / Math.PI * 180;
}

export function rad(deg: number): number {
    return deg / 180 * Math.PI;
}

export function fract(x: number): number {
    return x - Math.floor(x);
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
}

export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

export function map(value: number, start1: number, end1: number, start2: number, end2: number): number {
    return start2 + (end2 - start2) * (value - start1) / (end1 - start1);
}

export function norm(value: number, start: number, end: number): number {
    return (value - start) / (end - start);
}

export function dist(x1: number, y1: number, x2: number, y2: number): number {
    let dx = x1 - x2;
    let dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}




export function max(data: number[]): number {
    return Math.max(...data);
}

export function min(data: number[]): number {
    return Math.min(...data);
}

export function sum(data: number[]): number {
    return data.reduce((a, b) => a + b);
}

export function mean(data: number[]): number {
    return sum(data) / data.length;
}

export function median(data: number[]): number {
    let array = [...data].sort();
    let i = Math.floor(data.length / 2);
    if (data.length % 2 == 0) return (array[i - 1] + array[i]) / 2;
    else return array[i];
}

export function variance(data: number[]): number {
    let m = mean(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += (data[i] - m) * (data[i] - m);
    return sum / data.length;
}

export function deviation(data: number[]): number {
    return Math.sqrt(variance(data));
}




export class Random {
    private _a;
    private _c;
    private _m;
    private _seed: number;

    constructor(){
        this._a = 1664525;
        this._c = 1013904223;
        this._m = 4294967296;
    }

    seed(seed: number){
       this._seed = seed;
    }

    private lcg(): number{
        this._seed = (this._a * this._seed + this._c) % this._m;
        return this._seed / this._m;
    }

    next(): number;
    next(max: number): number;
    next(min: number, max: number): number;
    next(): number {
        let rand;
        if(this._seed == undefined) rand = Math.random();
        else rand = this.lcg();

        if (arguments.length == 1) {
            return arguments[0] * rand;
        } else if (arguments.length == 2) {
            return arguments[0] + (arguments[1] - arguments[0]) * rand;
        } else {
            return rand;
        }
    }
}


export class Perlin {
    private _random: Random;
    private _offset: number;

    private _gradient: number[][];
    private _permutation: number[];

    private _octaves: number;
    private _falloff: number;

    constructor(){
        this._random = new Random();
        this._offset = Math.random()*256;

        this._gradient = [
            [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1],
            [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
        ];

        this.permutation();

        this._octaves = 4;
        this._falloff = 0.5;
    }

    private permutation(){
    	let array = new Array(256);
        for (let i = 0; i < 256; i++) array[i] = i;

        let shuffle = [];
        while(array.length) {
            let i = Math.floor(this._random.next(array.length));
            shuffle.push(array.splice(i, 1)[0]);
        }

        this._permutation = new Array(512);
        for (let i = 0; i < 512; i++) this._permutation[i] = shuffle[i & 255];
    }

    seed(seed: number){
        this._random.seed(seed);
        this._offset = this._random.next()*256;

        this.permutation();
    }

    detail(octaves: number, falloff: number){
        this._octaves = octaves;
        this._falloff = falloff;
    }

    noise(x: number, y: number = 0, z: number = 0): number{
        x += this._offset;

        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let totalAmplitude = 0;

        for (let i = 0; i < this._octaves; i++) {
            total += this.compute(x*frequency, y*frequency, z*frequency) * amplitude;
            frequency *= 2;
            totalAmplitude += amplitude;
            amplitude *= this._falloff;
        }

        return total / totalAmplitude;
    }

    private dot(g: number[], x: number, y: number, z: number): number{
        return g[0]*x + g[1]*y + g[2]*z; 
    }

    private fade(t: number): number { 
        return t*t*t*(t*(t*6-15)+10);
    }

    private mix(a: number, b: number, t: number): number { 
        return (1-t) * a + t * b; 
    }

    private compute(x: number, y: number = 0, z: number = 0): number{
        let X = Math.floor(x);
        let Y = Math.floor(y);
        let Z = Math.floor(z);

        x -= X;
        y -= Y;
        z -= Z;

        X &= 255;
        Y &= 255;
        Z &= 255;

        let g000 = this._permutation[X+this._permutation[Y+this._permutation[Z]]] & 11;
        let g001 = this._permutation[X+this._permutation[Y+this._permutation[Z+1]]] & 11;
        let g010 = this._permutation[X+this._permutation[Y+1+this._permutation[Z]]] & 11;
        let g011 = this._permutation[X+this._permutation[Y+1+this._permutation[Z+1]]] & 11;
        let g100 = this._permutation[X+1+this._permutation[Y+this._permutation[Z]]] & 11;
        let g101 = this._permutation[X+1+this._permutation[Y+this._permutation[Z+1]]] & 11;
        let g110 = this._permutation[X+1+this._permutation[Y+1+this._permutation[Z]]] & 11;
        let g111 = this._permutation[X+1+this._permutation[Y+1+this._permutation[Z+1]]] & 11;

        let d000 = this.dot(this._gradient[g000], x, y, z); 
        let d100 = this.dot(this._gradient[g100], x-1, y, z); 
        let d010 = this.dot(this._gradient[g010], x, y-1, z); 
        let d110 = this.dot(this._gradient[g110], x-1, y-1, z); 
        let d001 = this.dot(this._gradient[g001], x, y, z-1); 
        let d101 = this.dot(this._gradient[g101], x-1, y, z-1); 
        let d011 = this.dot(this._gradient[g011], x, y-1, z-1); 
        let d111 = this.dot(this._gradient[g111], x-1, y-1, z-1);

        let u = this.fade(x); 
        let v = this.fade(y); 
        let w = this.fade(z);

        let x00 = this.mix(d000, d100, u); 
        let x01 = this.mix(d001, d101, u); 
        let x10 = this.mix(d010, d110, u); 
        let x11 = this.mix(d011, d111, u);

        let xy0 = this.mix(x00, x10, v); 
        let xy1 = this.mix(x01, x11, v);

        let xyz = this.mix(xy0, xy1, w);

        return (xyz+1)/2;
    }
}