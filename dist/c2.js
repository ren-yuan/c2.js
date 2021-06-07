(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.c2 = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Analyser = exports.Sound = exports.AudioIn = void 0;
let audioContext;
function createAudioContext() {
    if (typeof window !== 'undefined' && typeof audioContext === 'undefined') {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
    }
}
class AudioIn {
    constructor(callback) {
        createAudioContext();
        this.context = audioContext;
        let constraints = { audio: true, video: false };
        window.navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            this.node = audioContext.createMediaStreamSource(stream);
            callback();
        }).catch((error) => { });
    }
    connect(node) {
        this.node.connect(node);
    }
    disconnect() {
        this.node.disconnect();
    }
}
exports.AudioIn = AudioIn;
class Sound {
    constructor(url, callback) {
        createAudioContext();
        this.context = audioContext;
        this.audio = new Audio(url);
        this.audio.addEventListener('loadeddata', () => {
            this.node = audioContext.createMediaElementSource(this.audio);
            callback();
        });
    }
    duration() {
        return this.audio.duration;
    }
    currentTime() {
        return this.audio.currentTime;
    }
    volume() {
        return this.audio.volume;
    }
    paused() {
        return this.audio.paused;
    }
    loop(loop = true) {
        this.audio.loop = loop;
    }
    autoplay(auto = true) {
        this.audio.autoplay = auto;
    }
    play() {
        this.audio.play();
    }
    pause() {
        this.audio.pause();
    }
    connect(node) {
        this.node.connect(node);
    }
    disconnect() {
        this.node.disconnect();
    }
}
exports.Sound = Sound;
class Analyser {
    constructor() {
        createAudioContext();
        this.context = audioContext;
        this.node = audioContext.createAnalyser();
    }
    analyze(audio) {
        audio.node.connect(this.node);
    }
    fftSize(fftSize) {
        this.node.fftSize = fftSize;
    }
    binCount() {
        return this.node.frequencyBinCount;
    }
    smooth(smoothing) {
        this.node.smoothingTimeConstant = smoothing;
    }
    level() {
        let data = this.timeDomain();
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i] * data[i];
        }
        sum /= data.length;
        return Math.sqrt(sum);
    }
    timeDomain() {
        let timeDomain = new Uint8Array(this.node.frequencyBinCount);
        this.node.getByteTimeDomainData(timeDomain);
        let data = new Array(timeDomain.length);
        for (let i = 0; i < timeDomain.length; i++) {
            data[i] = (timeDomain[i] - 128) / 128;
        }
        return data;
    }
    freqDomain() {
        let freqDomain = new Uint8Array(this.node.frequencyBinCount);
        this.node.getByteFrequencyData(freqDomain);
        let data = new Array(freqDomain.length);
        for (let i = 0; i < freqDomain.length; i++) {
            data[i] = freqDomain[i] / 255;
        }
        return data;
    }
    connect(node) {
        this.node.connect(node);
    }
    disconnect() {
        this.node.disconnect();
    }
    output() {
        this.node.connect(audioContext.destination);
    }
}
exports.Analyser = Analyser;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Neuron = exports.NeuralNet = exports.Mutation = exports.Crossover = exports.Chromosome = exports.Population = void 0;
class Population {
    constructor(chromosomes, crossoverRate, mutationRate, fitness) {
        this._selection = 'roulette';
        this._sumFitness = 0;
        this._tournament = 0;
        this._elitism = 0;
        this.chromosomes = chromosomes;
        this.crossoverRate = crossoverRate;
        this.mutationRate = mutationRate;
        this.generation = 0;
        this._fitness = fitness;
    }
    setElitism(n) {
        this._elitism = n;
    }
    setSelection(type, n = 0) {
        this._selection = type;
        this._tournament = n;
    }
    setCrossover(type) {
        for (let c of this.chromosomes)
            c.setCrossover(type);
    }
    setMutation(type) {
        for (let c of this.chromosomes)
            c.setMutation(type);
    }
    fitness() {
        this._sumFitness = 0;
        for (let chromosome of this.chromosomes) {
            if (this._fitness)
                this._fitness(chromosome);
            this._sumFitness += chromosome.fitness;
        }
        this.chromosomes.sort((a, b) => b.fitness - a.fitness);
        return { 'generation': this.generation,
            'sumFitness': this._sumFitness,
            'averageFitness': this._sumFitness / this.chromosomes.length,
            'bestFitness': this.chromosomes[0].fitness,
            'worstFitness': this.chromosomes[this.chromosomes.length - 1].fitness,
            'bestChromosome': this.chromosomes[0]
        };
    }
    reproduction() {
        let next = new Array();
        if (this._elitism > 0 && this._elitism <= this.chromosomes.length) {
            for (let i = 0; i < this._elitism; i++)
                next.push(this.chromosomes[i].copy());
        }
        while (next.length < this.chromosomes.length) {
            let parent1 = this.selection();
            let parent2 = this.selection();
            let children = this.crossover(parent1, parent2);
            if (children instanceof Array) {
                children[0].mutation(this.mutationRate);
                next.push(children[0]);
                if (next.length < this.chromosomes.length && children.length == 2) {
                    children[1].mutation(this.mutationRate);
                    next.push(children[1]);
                }
            }
            else {
                children.mutation(this.mutationRate);
                next.push(children);
            }
        }
        this.chromosomes = next;
        this.generation++;
    }
    selection() {
        if (this._selection == 'roulette') {
            return this.roulette();
        }
        else if (this._selection == 'tournament') {
            return this.tournament();
        }
    }
    roulette() {
        let k = 0;
        let p = Math.random() * this._sumFitness;
        for (let chromosome of this.chromosomes) {
            k += chromosome.fitness;
            if (k >= p)
                return chromosome;
        }
    }
    tournament() {
        let bestFitness = Number.NEGATIVE_INFINITY;
        let chromosome = null;
        for (let i = 0; i < this._tournament; i++) {
            let p = Math.floor(Math.random() * this.chromosomes.length);
            let c = this.chromosomes[p];
            if (c.fitness > bestFitness || chromosome == null) {
                bestFitness = c.fitness;
                chromosome = c;
            }
        }
        return chromosome;
    }
    crossover(parent1, parent2) {
        if (parent1 != parent2 && Math.random() < this.crossoverRate) {
            return parent1.crossover(parent2);
        }
        else {
            return [parent1.copy(), parent2.copy()];
        }
    }
}
exports.Population = Population;
class Chromosome {
    constructor() {
        this.type = 'float';
        this.lower = 0;
        this.upper = 0;
        this.crossoverType = 'single_point';
        this.mutationType = 'random';
        this.fitness = 0;
        this.genes = [];
        if (arguments[0] instanceof Chromosome) {
            for (let gene of arguments[0].genes)
                this.genes.push(gene);
            this.type = arguments[0].type;
            this.lower = arguments[0].lower;
            this.upper = arguments[0].upper;
            this.crossoverType = arguments[0].crossoverType;
            this.mutationType = arguments[0].mutationType;
        }
    }
    copy() {
        return new Chromosome(this);
    }
    setCrossover(type) {
        this.crossoverType = type;
    }
    setMutation(type) {
        this.mutationType = type;
    }
    crossover(mate) {
        if (this.crossoverType == 'two_point')
            return Crossover.twoPoint(this, mate);
        else if (this.crossoverType == 'pmx')
            return Crossover.PMX(this, mate);
        else
            return Crossover.singlePoint(this, mate);
    }
    mutation(mutationRate) {
        if (this.mutationType == 'deviate') {
            Mutation.deviate(this, mutationRate);
        }
        else if (this.mutationType == 'random') {
            Mutation.random(this, mutationRate, this.lower, this.upper, this.type == 'integer');
        }
        else if (this.mutationType == 'exchange') {
            if (Math.random() < mutationRate)
                Mutation.exchange(this);
        }
        else if (this.mutationType == 'insertion') {
            if (Math.random() < mutationRate)
                Mutation.insertion(this);
        }
    }
    initFloat(length, lower, upper) {
        this.genes = new Array(length);
        for (let i = 0; i < length; i++) {
            this.genes[i] = lower + (upper - lower) * Math.random();
        }
        this.type = 'float';
        this.lower = lower;
        this.upper = upper;
    }
    initInteger(length, lower, upper) {
        this.genes = new Array(length);
        for (let i = 0; i < length; i++) {
            this.genes[i] = Math.floor(lower + (upper - lower + 1) * Math.random());
        }
        this.type = 'integer';
        this.lower = lower;
        this.upper = upper;
    }
    initPermutation(length) {
        this.genes = new Array(length);
        for (let i = 0; i < length; i++)
            this.genes[i] = i;
        this.shuffle();
        this.type = 'permutation';
        this.lower = 0;
        this.upper = length;
    }
    find(gene) {
        return this.genes.findIndex((g) => g === gene);
    }
    swap(i, j) {
        let temp = this.genes[i];
        this.genes[i] = this.genes[j];
        this.genes[j] = temp;
    }
    shuffle() {
        let genes = [];
        while (this.genes.length) {
            let i = Math.floor(Math.random() * this.genes.length);
            genes.push(this.genes.splice(i, 1)[0]);
        }
        this.genes = genes;
    }
    toString(code = false) {
        let str = '';
        if (code) {
            for (let i = 0; i < this.genes.length; i++)
                str += String.fromCharCode(this.genes[i]);
        }
        else {
            for (let i = 0; i < this.genes.length; i++)
                str += this.genes[i];
        }
        return str;
    }
}
exports.Chromosome = Chromosome;
class Crossover {
    static singlePoint(parent1, parent2) {
        let offspring1 = parent1.copy();
        let offspring2 = parent2.copy();
        let p = Math.floor(Math.random() * offspring1.genes.length);
        for (let i = p; i < offspring1.genes.length; i++) {
            let temp = offspring1.genes[i];
            offspring1.genes[i] = offspring2.genes[i];
            offspring2.genes[i] = temp;
        }
        return [offspring1, offspring2];
    }
    static twoPoint(parent1, parent2) {
        let offspring1 = parent1.copy();
        let offspring2 = parent2.copy();
        let p1 = Math.floor(Math.random() * (offspring1.genes.length - 1));
        let p2 = Math.floor(p1 + 1 + (offspring1.genes.length - p1 - 1) * Math.random());
        for (let i = p1; i < p2; i++) {
            let temp = offspring1.genes[i];
            offspring1.genes[i] = offspring2.genes[i];
            offspring2.genes[i] = temp;
        }
        return [offspring1, offspring2];
    }
    static PMX(parent1, parent2) {
        let offspring1 = parent1.copy();
        let offspring2 = parent2.copy();
        let p1 = Math.floor(Math.random() * (offspring1.genes.length - 1));
        let p2 = Math.floor(p1 + 1 + (offspring1.genes.length - p1 - 1) * Math.random());
        for (let i = p1; i <= p2; i++) {
            let g1 = parent1.genes[i];
            let g2 = parent2.genes[i];
            if (g1 != g2) {
                let i1 = parent1.find(g2);
                let i2 = parent2.find(g1);
                offspring1.swap(i, i1);
                offspring2.swap(i, i2);
            }
        }
        return [offspring1, offspring2];
    }
}
exports.Crossover = Crossover;
class Mutation {
    static deviate(chromosome, mutationRate) {
        let genes = chromosome.genes;
        for (let i = 0; i < genes.length; i++) {
            if (Math.random() < mutationRate)
                genes[i] += (Math.random() * 2 - 1) * Mutation.maxDeviation;
        }
    }
    static random(chromosome, mutationRate, lower, upper, integer = false) {
        let genes = chromosome.genes;
        if (integer) {
            for (let i = 0; i < genes.length; i++) {
                if (Math.random() < mutationRate)
                    genes[i] = Math.floor(lower + (upper - lower + 1) * Math.random());
            }
        }
        else {
            for (let i = 0; i < genes.length; i++) {
                if (Math.random() < mutationRate)
                    genes[i] = lower + (upper - lower) * Math.random();
            }
        }
    }
    static exchange(chromosome) {
        let p1 = Math.floor(Math.random() * chromosome.genes.length);
        let p2 = p1;
        while (p1 == p2)
            p2 = Math.floor(Math.random() * chromosome.genes.length);
        let temp = chromosome.genes[p1];
        chromosome.genes[p1] = chromosome.genes[p2];
        chromosome.genes[p2] = temp;
    }
    static insertion(chromosome) {
        let p1 = Math.floor(Math.random() * chromosome.genes.length);
        let p2 = p1;
        while (p1 == p2)
            p2 = Math.floor(Math.random() * chromosome.genes.length);
        let gene = chromosome.genes[p1];
        chromosome.genes.splice(p1, 1);
        chromosome.genes.splice(p2, 0, gene);
    }
}
exports.Mutation = Mutation;
Mutation.maxDeviation = .1;
class NeuralNet {
    constructor() {
        if (arguments[0] instanceof NeuralNet) {
            this.neurons = [];
            for (let i = 0; i < arguments[0].neurons.length; i++) {
                let layer = [];
                for (let j = 0; j < arguments[0].neurons[i].length; j++) {
                    layer.push(arguments[0].neurons[i][j].copy());
                }
                this.neurons.push(layer);
            }
        }
        else {
            this.neurons = [];
            if (arguments[2] > 0) {
                this.addLayer(arguments[0], arguments[3]);
                for (let i = 0; i < arguments[2] - 1; i++)
                    this.addLayer(arguments[3], arguments[3]);
                this.addLayer(arguments[3], arguments[1]);
            }
            else {
                this.addLayer(arguments[0], arguments[1]);
            }
        }
    }
    addLayer(inputs, outputs) {
        let layer = new Array(outputs);
        for (let i = 0; i < outputs; i++)
            layer[i] = new Neuron(inputs);
        this.neurons.push(layer);
    }
    copy() {
        return new NeuralNet(this);
    }
    feedforward(input) {
        let output = [];
        for (let i = 0; i < this.neurons.length; i++) {
            if (i > 0) {
                input = [...output];
                output = [];
            }
            for (let j = 0; j < this.neurons[i].length; j++) {
                output.push(this.neurons[i][j].activate(input));
            }
        }
        return output;
    }
    weights() {
        if (arguments.length == 1) {
            let index = 0;
            for (let i = 0; i < this.neurons.length; i++) {
                for (let j = 0; j < this.neurons[i].length; j++) {
                    for (let k = 0; k < this.neurons[i][j].weights.length; k++) {
                        this.neurons[i][j].weights[k] = arguments[0][index];
                        index++;
                    }
                }
            }
        }
        else {
            let weights = [];
            for (let i = 0; i < this.neurons.length; i++) {
                for (let j = 0; j < this.neurons[i].length; j++) {
                    for (let k = 0; k < this.neurons[i][j].weights.length; k++) {
                        weights.push(this.neurons[i][j].weights[k]);
                    }
                }
            }
            return weights;
        }
    }
    indexes() {
        let indexes = [];
        let index = 0;
        for (let i = 0; i < this.neurons.length; i++) {
            for (let j = 0; j < this.neurons[i].length; j++) {
                indexes.push(index);
                for (let k = 0; k < this.neurons[i][j].weights.length; k++) {
                    index++;
                }
            }
        }
        return indexes;
    }
}
exports.NeuralNet = NeuralNet;
class Neuron {
    constructor() {
        if (arguments[0] instanceof Neuron) {
            this.weights = new Array(arguments[0].weights.length);
            for (let i = 0; i < this.weights.length; i++) {
                this.weights[i] = arguments[0].weights[i];
            }
        }
        else {
            this.weights = new Array(arguments[0] + 1);
            for (let i = 0; i < this.weights.length; i++) {
                this.weights[i] = Math.random() * 2 - 1;
            }
        }
    }
    copy() {
        return new Neuron(this);
    }
    activate(input) {
        let sum = 0;
        for (let i = 0; i < this.weights.length - 1; i++) {
            sum += this.weights[i] * input[i];
        }
        sum += this.weights[this.weights.length - 1];
        return this.sigmoid(sum);
    }
    sigmoid(z) {
        return 1 / (1 + Math.exp(-z));
    }
}
exports.Neuron = Neuron;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cell = exports.CellVertex = exports.LimitedVoronoi = exports.Voronoi = exports.Delaunay = exports.ConvexHull = exports.QuadTree = exports.Polygon = exports.Rect = exports.Triangle = exports.Circle = exports.Sector = exports.Spline = exports.Polyline = exports.Arc = exports.Line = exports.Point = exports.Vector = void 0;
class Vector {
    constructor() {
        if (arguments.length == 1) {
            this.x = arguments[0].x;
            this.y = arguments[0].y;
        }
        else if (arguments.length == 2) {
            this.x = arguments[0];
            this.y = arguments[1];
        }
        else {
            this.x = 0;
            this.y = 0;
        }
    }
    copy() {
        return new Vector(this.x, this.y);
    }
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    magSq() {
        return this.x * this.x + this.y * this.y;
    }
    angle() {
        if (arguments.length == 0) {
            return Math.atan2(this.y, this.x);
        }
        else if (arguments.length == 1) {
            let a = this.normalize();
            let b = arguments[0].normalize();
            return Math.sign(a.cross(b)) * Math.acos(a.dot(b));
        }
    }
    add() {
        if (arguments.length == 1) {
            return new Vector(this.x + arguments[0].x, this.y + arguments[0].y);
        }
        else if (arguments.length == 2) {
            return new Vector(this.x + arguments[0], this.y + arguments[1]);
        }
    }
    sub() {
        if (arguments.length == 1) {
            return new Vector(this.x - arguments[0].x, this.y - arguments[0].y);
        }
        else if (arguments.length == 2) {
            return new Vector(this.x - arguments[0], this.y - arguments[1]);
        }
    }
    mult(n) {
        return new Vector(this.x * n, this.y * n);
    }
    div(n) {
        return new Vector(this.x / n, this.y / n);
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    cross(v) {
        return this.x * v.y - v.x * this.y;
    }
    normalize() {
        let m = this.x * this.x + this.y * this.y;
        if (m > 0) {
            m = Math.sqrt(m);
            return new Vector(this.x / m, this.y / m);
        }
        return new Vector();
    }
    limit(n) {
        if (this.magSq() > n * n)
            return this.normalize().mult(n);
        return this.copy();
    }
    invert() {
        return new Vector(-this.x, -this.y);
    }
    perpendicular() {
        return new Vector(-this.y, this.x);
    }
    projection(v) {
        let n = v.normalize();
        return n.mult(this.dot(n));
    }
    reflect(v) {
        let n = v.normalize();
        return n.mult(this.dot(n) * 2).sub(this);
    }
    rotate(a) {
        return new Vector(Math.cos(a) * this.x - Math.sin(a) * this.y, Math.sin(a) * this.x + Math.cos(a) * this.y);
    }
    distance(v) {
        let dx = this.x - v.x;
        let dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    distanceSq(v) {
        let dx = this.x - v.x;
        let dy = this.y - v.y;
        return dx * dx + dy * dy;
    }
}
exports.Vector = Vector;
class Point {
    constructor() {
        if (arguments.length == 1) {
            this.x = arguments[0].x;
            this.y = arguments[0].y;
        }
        else if (arguments.length == 2) {
            this.x = arguments[0];
            this.y = arguments[1];
        }
        else {
            this.x = 0;
            this.y = 0;
        }
    }
    translate(x, y) {
        this.x += x;
        this.y += y;
        return this;
    }
    rotate() {
        if (arguments.length == 1) {
            let dx = this.x;
            let dy = this.y;
            this.x = Math.cos(arguments[0]) * dx - Math.sin(arguments[0]) * dy;
            this.y = Math.sin(arguments[0]) * dx + Math.cos(arguments[0]) * dy;
        }
        else if (arguments.length == 2) {
            let dx = this.x - arguments[1].x;
            let dy = this.y - arguments[1].y;
            this.x = arguments[1].x + Math.cos(arguments[0]) * dx - Math.sin(arguments[0]) * dy;
            this.y = arguments[1].y + Math.sin(arguments[0]) * dx + Math.cos(arguments[0]) * dy;
        }
        return this;
    }
    scale() {
        if (arguments.length == 1) {
            this.x *= arguments[0];
            this.y *= arguments[0];
        }
        else if (arguments.length == 2) {
            this.x = arguments[1].x + (this.x - arguments[1].x) * arguments[0];
            this.y = arguments[1].y + (this.y - arguments[1].y) * arguments[0];
        }
        return this;
    }
    copy() {
        return new Point(this.x, this.y);
    }
    distance(p) {
        let dx = this.x - p.x;
        let dy = this.y - p.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    distanceSq(p) {
        let dx = this.x - p.x;
        let dy = this.y - p.y;
        return dx * dx + dy * dy;
    }
    lerp(p, t) {
        return new Point(this.x + (p.x - this.x) * t, this.y + (p.y - this.y) * t);
    }
}
exports.Point = Point;
class Line {
    constructor() {
        if (arguments.length == 2) {
            this.p1 = arguments[0];
            this.p2 = arguments[1];
        }
        else if (arguments.length == 4) {
            this.p1 = new Point(arguments[0], arguments[1]);
            this.p2 = new Point(arguments[2], arguments[3]);
        }
    }
    translate(x, y) {
        this.p1.translate(x, y);
        this.p2.translate(x, y);
        return this;
    }
    rotate() {
        if (arguments.length == 1) {
            this.p1.rotate(arguments[0]);
            this.p2.rotate(arguments[0]);
        }
        else if (arguments.length == 2) {
            this.p1.rotate(arguments[0], arguments[1]);
            this.p2.rotate(arguments[0], arguments[1]);
        }
        return this;
    }
    scale() {
        if (arguments.length == 1) {
            this.p1.scale(arguments[0]);
            this.p2.scale(arguments[0]);
        }
        else if (arguments.length == 2) {
            this.p1.scale(arguments[0], arguments[1]);
            this.p2.scale(arguments[0], arguments[1]);
        }
        return this;
    }
    reverse() {
        let temp = this.p1;
        this.p1 = this.p2;
        this.p2 = temp;
        return this;
    }
    copy() {
        return new Line(this.p1.copy(), this.p2.copy());
    }
    bounds() {
        return new Rect(this.p1.copy(), this.p2.copy());
    }
    length() {
        return this.p1.distance(this.p2);
    }
    angle() {
        return new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y).angle();
    }
    direction() {
        return new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y).normalize();
    }
    normal() {
        return this.direction().perpendicular();
    }
    middle() {
        return this.p1.lerp(this.p2, 0.5);
    }
    point(t) {
        return this.p1.lerp(this.p2, t);
    }
    lerp(l, t) {
        let p1 = this.p1.lerp(l.p1, t);
        let p2 = this.p2.lerp(l.p2, t);
        return new Line(p1, p2);
    }
    closest(p) {
        let v1 = new Vector(p.x - this.p1.x, p.y - this.p1.y);
        let v2 = new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
        let t = v1.dot(v2) / v2.dot(v2);
        if (t <= 0)
            return this.p1.copy();
        if (t >= 1)
            return this.p2.copy();
        return this.p1.lerp(this.p2, t);
    }
    distance(p) {
        return p.distance(this.closest(p));
    }
    intersects(l) {
        let v1 = new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
        let v2 = new Vector(l.p2.x - l.p1.x, l.p2.y - l.p1.y);
        let v3 = new Vector(l.p1.x - this.p1.x, l.p1.y - this.p1.y);
        let v4 = v1.perpendicular();
        let v5 = v2.perpendicular();
        let t = v3.dot(v5) / v1.dot(v5);
        let u = -v3.dot(v4) / v2.dot(v4);
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }
    intersection(l) {
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
        }
        else {
            return null;
        }
    }
    split(data) {
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
exports.Line = Line;
class Arc {
    constructor() {
        if (arguments.length == 4) {
            this.p = arguments[0];
            this.r = arguments[1];
            this.start = arguments[2];
            this.end = arguments[3];
        }
        else if (arguments.length == 5) {
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
    translate(x, y) {
        this.p.translate(x, y);
        return this;
    }
    rotate() {
        if (arguments.length == 1) {
            this.p.rotate(arguments[0]);
        }
        else if (arguments.length == 2) {
            this.p.rotate(arguments[0], arguments[1]);
        }
        this.start += arguments[0];
        this.end += arguments[0];
        return this;
    }
    scale() {
        if (arguments.length == 1) {
            this.p.scale(arguments[0]);
        }
        else if (arguments.length == 2) {
            this.p.scale(arguments[0], arguments[1]);
        }
        this.r *= arguments[0];
        return this;
    }
    copy() {
        return new Arc(this.p.copy(), this.r, this.start, this.end);
    }
    bounds() {
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
    length() {
        return (this.end - this.start) * this.r;
    }
    middle() {
        return this.point(0.5);
    }
    point(t) {
        let a = this.start + (this.end - this.start) * t;
        let x = this.p.x + Math.cos(a) * this.r;
        let y = this.p.y + Math.sin(a) * this.r;
        return new Point(x, y);
    }
    lerp(a, t) {
        let p = this.p.lerp(a.p, t);
        let r = this.r + (a.r - this.r) * t;
        let start = this.start + (a.start - this.start) * t;
        let end = this.end + (a.end - this.end) * t;
        return new Arc(p, r, start, end);
    }
    contains(v) {
        let a = v.angle();
        if (a < 0)
            a += 2 * Math.PI;
        let start = this.start % (2 * Math.PI);
        let end = this.end % (2 * Math.PI);
        return end <= start ? (a > start && a < 2 * Math.PI || a > 0 && a < end) : (a > start && a < end);
    }
    closest(p) {
        let v = new Vector(p.x - this.p.x, p.y - this.p.y);
        if (this.contains(v)) {
            v = v.normalize().mult(this.r).add(this.p.x, this.p.y);
            return new Point(v.x, v.y);
        }
        else {
            let p1 = this.point(0);
            let p2 = this.point(1);
            return p.distanceSq(p1) < p.distanceSq(p2) ? p1 : p2;
        }
    }
    distance(p) {
        return p.distance(this.closest(p));
    }
    polyline(n) {
        let points = new Array(n + 1);
        for (let i = 0; i <= n; i++) {
            let a = this.start + (this.end - this.start) * i / n;
            let x = this.p.x + Math.cos(a) * this.r;
            let y = this.p.y + Math.sin(a) * this.r;
            points[i] = new Point(x, y);
        }
        return new Polyline(points);
    }
    split(data) {
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
exports.Arc = Arc;
class Polyline {
    constructor() {
        if (arguments.length == 1) {
            this.vertices = arguments[0];
        }
        else {
            this.vertices = new Array();
        }
    }
    add() {
        if (arguments.length == 1) {
            this.vertices.push(arguments[0]);
        }
        else if (arguments.length == 2) {
            this.vertices.push(new Point(arguments[0], arguments[1]));
        }
        return this;
    }
    clear() {
        this.vertices = [];
    }
    translate(x, y) {
        for (let v of this.vertices)
            v.translate(x, y);
        return this;
    }
    rotate() {
        if (arguments.length == 1) {
            for (let v of this.vertices)
                v.rotate(arguments[0]);
        }
        else if (arguments.length == 2) {
            for (let v of this.vertices)
                v.rotate(arguments[0], arguments[1]);
        }
        return this;
    }
    scale() {
        if (arguments.length == 1) {
            for (let v of this.vertices)
                v.scale(arguments[0]);
        }
        else if (arguments.length == 2) {
            for (let v of this.vertices)
                v.scale(arguments[0], arguments[1]);
        }
        return this;
    }
    reverse() {
        this.vertices.reverse();
        return this;
    }
    copy() {
        let points = new Array(this.vertices.length);
        for (let i = 0; i < this.vertices.length; i++) {
            points[i] = this.vertices[i].copy();
        }
        return new Polyline(points);
    }
    edges() {
        let lines = new Array();
        for (let i = 0; i < this.vertices.length - 1; i++) {
            let p1 = this.vertices[i];
            let p2 = this.vertices[i + 1];
            lines.push(new Line(p1, p2));
        }
        return lines;
    }
    bounds() {
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
    length() {
        let length = 0;
        for (let i = 0; i < this.vertices.length - 1; i++) {
            let p1 = this.vertices[i];
            let p2 = this.vertices[i + 1];
            length += p1.distance(p2);
        }
        return length;
    }
    closest(p) {
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
    distance(p) {
        return p.distance(this.closest(p));
    }
}
exports.Polyline = Polyline;
class Spline {
    constructor() {
        if (arguments.length == 1) {
            this.points = arguments[0];
        }
        else {
            this.points = new Array();
        }
    }
    compute(mode = 'clamped', detail = 20) {
        if (this.points.length < 4)
            return;
        let points = new Array();
        if (mode == 'open') {
            points = points.concat(this.points);
        }
        else if (mode == 'closed') {
            points.push(this.points[this.points.length - 2]);
            points.push(this.points[this.points.length - 1]);
            points = points.concat(this.points);
            points.push(this.points[0]);
        }
        else {
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
    point(p1, p2, p3, p4, t) {
        let p = (p1, p2, t1, t2) => new Point(p1.x * t1 + p2.x * t2, p1.y * t1 + p2.y * t2);
        let a1 = p(p1, p2, -t, t + 1);
        let a2 = p(p2, p3, 1 - t, t);
        let a3 = p(p3, p4, 2 - t, t - 1);
        let b1 = p(a1, a2, (1 - t) / 2, (t + 1) / 2);
        let b2 = p(a2, a3, (2 - t) / 2, t / 2);
        return p(b1, b2, 1 - t, t);
    }
    tangent(p1, p2, p3, p4, t) {
        let a = this.point(p1, p2, p3, p4, t);
        let b = this.point(p1, p2, p3, p4, t + 1e-6);
        return new Vector(b.x - a.x, b.y - a.y).normalize();
    }
    normal(p1, p2, p3, p4, t) {
        return this.tangent(p1, p2, p3, p4, t).perpendicular();
    }
    add() {
        if (arguments.length == 1) {
            this.points.push(arguments[0]);
        }
        else if (arguments.length == 2) {
            this.points.push(new Point(arguments[0], arguments[1]));
        }
        return this;
    }
    clear() {
        this.points = [];
        this.vertices = [];
    }
    translate(x, y) {
        for (let v of this.points)
            v.translate(x, y);
        return this;
    }
    rotate() {
        if (arguments.length == 1) {
            for (let v of this.points)
                v.rotate(arguments[0]);
        }
        else if (arguments.length == 2) {
            for (let v of this.points)
                v.rotate(arguments[0], arguments[1]);
        }
        return this;
    }
    scale() {
        if (arguments.length == 1) {
            for (let v of this.points)
                v.scale(arguments[0]);
        }
        else if (arguments.length == 2) {
            for (let v of this.points)
                v.scale(arguments[0], arguments[1]);
        }
        return this;
    }
    reverse() {
        this.points.reverse();
        return this;
    }
    copy() {
        let array = new Array(this.points.length);
        for (let i = 0; i < this.points.length; i++) {
            array[i] = this.points[i].copy();
        }
        return new Spline(array);
    }
}
exports.Spline = Spline;
class Sector {
    constructor() {
        if (arguments.length == 5) {
            this.p = arguments[0];
            this.r1 = arguments[1];
            this.r2 = arguments[2];
            this.start = arguments[3];
            this.end = arguments[4];
        }
        else if (arguments.length == 6) {
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
    translate(x, y) {
        this.p.translate(x, y);
        return this;
    }
    rotate() {
        if (arguments.length == 1) {
            this.p.rotate(arguments[0]);
        }
        else if (arguments.length == 2) {
            this.p.rotate(arguments[0], arguments[1]);
        }
        this.start += arguments[0];
        this.end += arguments[0];
        return this;
    }
    scale() {
        if (arguments.length == 1) {
            this.p.scale(arguments[0]);
        }
        else if (arguments.length == 2) {
            this.p.scale(arguments[0], arguments[1]);
        }
        this.r1 *= arguments[0];
        this.r2 *= arguments[0];
        return this;
    }
    copy() {
        return new Sector(this.p.copy(), this.r1, this.r2, this.start, this.end);
    }
    bounds() {
        let rect1 = new Arc(this.p, this.r1, this.start, this.end).bounds();
        let rect2 = new Arc(this.p, this.r2, this.start, this.end).bounds();
        return rect1.merge(rect2);
    }
    area() {
        return (this.end - this.start) / 2 * (this.r2 * this.r2 - this.r1 * this.r1);
    }
    center() {
        let a = (this.start + this.end) / 2;
        let r = (this.r1 + this.r2) / 2;
        let x = this.p.x + Math.cos(a) * r;
        let y = this.p.y + Math.sin(a) * r;
        return new Point(x, y);
    }
    contains(p) {
        let v = new Vector(p.x - this.p.x, p.y - this.p.y);
        let d = v.mag();
        return d > this.r1 && d < this.r2 && new Arc(this.p, this.r2, this.start, this.end).contains(v);
    }
    closest(p) {
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
    distance(p) {
        return p.distance(this.closest(p));
    }
    polygon(n) {
        let points = new Array(n * 2 + 2);
        for (let i = 0; i <= n; i++) {
            let a = this.start + (this.end - this.start) * i / n;
            let x = this.p.x + Math.cos(a) * this.r2;
            let y = this.p.y + Math.sin(a) * this.r2;
            points[i] = new Point(this.p.x + Math.cos(a) * this.r2, this.p.y + Math.sin(a) * this.r2);
            points[n + 1 + i] = new Point(this.p.x + Math.cos(this.start + this.end - a) * this.r1, this.p.y + Math.sin(this.start + this.end - a) * this.r1);
        }
        return new Polygon(points);
    }
    split(data, mode = 'angle') {
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
        }
        else if (mode == 'radius') {
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
        }
        else if (mode == 'area') {
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
exports.Sector = Sector;
class Circle {
    constructor() {
        if (arguments.length == 0) {
            this.p = new Point();
            this.r = 1;
        }
        else if (arguments.length == 2) {
            this.p = arguments[0];
            this.r = arguments[1];
        }
        else if (arguments.length == 3) {
            if (arguments[0] instanceof Point) {
                let v1 = new Vector(arguments[2].x - arguments[1].x, arguments[2].y - arguments[1].y);
                let v2 = new Vector(arguments[0].x - arguments[2].x, arguments[0].y - arguments[2].y);
                let v3 = new Vector(arguments[1].x - arguments[0].x, arguments[1].y - arguments[0].y);
                let v4 = v3.perpendicular();
                let v = v4.mult(v1.dot(v2) / v4.dot(v2)).add(v3).mult(0.5).add(arguments[0].x, arguments[0].y);
                this.p = new Point(v.x, v.y);
                this.r = this.p.distance(arguments[0]);
            }
            else {
                this.p = new Point(arguments[0], arguments[1]);
                this.r = arguments[2];
            }
        }
    }
    translate(x, y) {
        this.p.translate(x, y);
        return this;
    }
    rotate() {
        if (arguments.length == 1) {
            this.p.rotate(arguments[0]);
        }
        else if (arguments.length == 2) {
            this.p.rotate(arguments[0], arguments[1]);
        }
        return this;
    }
    scale() {
        if (arguments.length == 1) {
            this.p.scale(arguments[0]);
        }
        else if (arguments.length == 2) {
            this.p.scale(arguments[0], arguments[1]);
        }
        this.r *= arguments[0];
        return this;
    }
    copy() {
        return new Circle(this.p.copy(), this.r);
    }
    bounds() {
        let p1 = new Point(this.p.x - this.r, this.p.y - this.r);
        let p2 = new Point(this.p.x + this.r, this.p.y + this.r);
        return new Rect(p1, p2);
    }
    area() {
        return Math.PI * this.r * this.r;
    }
    circumference() {
        return 2 * Math.PI * this.r;
    }
    tangent(p) {
        let m = this.p.lerp(p, 0.5);
        let d = m.distance(p);
        let c = new Circle(m, d);
        return this.intersection(c);
    }
    contains(s) {
        if (s instanceof Point) {
            let dx = this.p.x - s.x;
            let dy = this.p.y - s.y;
            return dx * dx + dy * dy < this.r * this.r;
        }
        else if (s instanceof Circle) {
            let dx = this.p.x - s.p.x;
            let dy = this.p.y - s.p.y;
            let r = this.r - s.r;
            return dx * dx + dy * dy < r * r;
        }
    }
    closest(p) {
        let v = new Vector(p.x - this.p.x, p.y - this.p.y).normalize().mult(this.r).add(this.p.x, this.p.y);
        return new Point(v.x, v.y);
    }
    distance(p) {
        return Math.abs(p.distance(this.p) - this.r);
    }
    intersects(s) {
        if (s instanceof Circle) {
            let dx = this.p.x - s.p.x;
            let dy = this.p.y - s.p.y;
            let r = this.r + s.r;
            return dx * dx + dy * dy <= r * r;
        }
        else if (s instanceof Rect) {
            let x = this.p.x;
            let y = this.p.y;
            if (x < s.p.x)
                x = s.p.x;
            else if (x > s.p.x + s.w)
                x = s.p.x + s.w;
            if (y < s.p.y)
                y = s.p.y;
            else if (y > s.p.y + s.h)
                y = s.p.y + s.h;
            let dx = this.p.x - x;
            let dy = this.p.y - y;
            return dx * dx + dy * dy <= this.r * this.r;
        }
    }
    intersection(c) {
        let d = this.p.distance(c.p);
        if (d > this.r + c.r || d < Math.abs(this.r - c.r))
            return null;
        let angle = Math.acos((this.r * this.r + d * d - c.r * c.r) / (2 * this.r * d));
        let v1 = new Vector(c.p.x - this.p.x, c.p.y - this.p.y);
        let v2 = v1.copy();
        v1 = v1.normalize().mult(this.r).rotate(angle).add(this.p.x, this.p.y);
        v2 = v2.normalize().mult(this.r).rotate(-angle).add(this.p.x, this.p.y);
        let points = [new Point(v1.x, v1.y), new Point(v2.x, v2.y)];
        return points;
    }
    polygon(n) {
        let points = new Array(n);
        for (let i = 0; i < n; i++) {
            let a = 2 * Math.PI * i / n;
            let x = this.p.x + Math.cos(a) * this.r;
            let y = this.p.y + Math.sin(a) * this.r;
            points[i] = new Point(x, y);
        }
        return new Polygon(points);
    }
    split(data, mode = 'angle') {
        return new Sector(this.p, 0, this.r, 0, Math.PI * 2).split(data, mode);
    }
}
exports.Circle = Circle;
class Triangle {
    constructor() {
        if (arguments.length == 3) {
            this.p1 = arguments[0];
            this.p2 = arguments[1];
            this.p3 = arguments[2];
        }
        else if (arguments.length == 6) {
            this.p1 = new Point(arguments[0], arguments[1]);
            this.p2 = new Point(arguments[2], arguments[3]);
            this.p3 = new Point(arguments[4], arguments[5]);
        }
    }
    translate(x, y) {
        this.p1.translate(x, y);
        this.p2.translate(x, y);
        this.p3.translate(x, y);
        return this;
    }
    rotate() {
        if (arguments.length == 1) {
            this.p1.rotate(arguments[0]);
            this.p2.rotate(arguments[0]);
            this.p3.rotate(arguments[0]);
        }
        else if (arguments.length == 2) {
            this.p1.rotate(arguments[0], arguments[1]);
            this.p2.rotate(arguments[0], arguments[1]);
            this.p3.rotate(arguments[0], arguments[1]);
        }
        return this;
    }
    scale() {
        if (arguments.length == 1) {
            this.p1.scale(arguments[0]);
            this.p2.scale(arguments[0]);
            this.p3.scale(arguments[0]);
        }
        else if (arguments.length == 2) {
            this.p1.scale(arguments[0], arguments[1]);
            this.p2.scale(arguments[0], arguments[1]);
            this.p3.scale(arguments[0], arguments[1]);
        }
        return this;
    }
    reverse() {
        let temp = this.p1;
        this.p1 = this.p3;
        this.p3 = temp;
        return this;
    }
    copy() {
        return new Triangle(this.p1.copy(), this.p2.copy(), this.p3.copy());
    }
    bounds() {
        let x1 = Math.min(Math.min(this.p1.x, this.p2.x), this.p3.x);
        let y1 = Math.min(Math.min(this.p1.y, this.p2.y), this.p3.y);
        let x2 = Math.max(Math.max(this.p1.x, this.p2.x), this.p3.x);
        let y2 = Math.max(Math.max(this.p1.y, this.p2.y), this.p3.y);
        return new Rect(new Point(x1, y1), new Point(x2, y2));
    }
    edges() {
        let lines = new Array(3);
        lines[0] = new Line(this.p1, this.p2);
        lines[1] = new Line(this.p2, this.p3);
        lines[2] = new Line(this.p3, this.p1);
        return lines;
    }
    polygon() {
        return new Polygon([this.p1, this.p2, this.p3]);
    }
    area() {
        let v1 = new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
        let v2 = new Vector(this.p3.x - this.p1.x, this.p3.y - this.p1.y);
        return v1.cross(v2) / 2;
    }
    circumference() {
        return this.p1.distance(this.p2) + this.p2.distance(this.p3) + this.p3.distance(this.p1);
    }
    centroid() {
        let x = (this.p1.x + this.p2.x + this.p3.x) / 3;
        let y = (this.p1.y + this.p2.y + this.p3.y) / 3;
        return new Point(x, y);
    }
    clockwise() {
        let v1 = new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
        let v2 = new Vector(this.p3.x - this.p2.x, this.p3.y - this.p2.y);
        return v1.cross(v2) > 0;
    }
    contains(s) {
        if (s instanceof Point) {
            let v1 = new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
            let v2 = new Vector(this.p3.x - this.p2.x, this.p3.y - this.p2.y);
            let v3 = new Vector(this.p1.x - this.p3.x, this.p1.y - this.p3.y);
            let v4 = new Vector(s.x - this.p1.x, s.y - this.p1.y);
            let v5 = new Vector(s.x - this.p2.x, s.y - this.p2.y);
            let v6 = new Vector(s.x - this.p3.x, s.y - this.p3.y);
            if (this.clockwise()) {
                return v1.cross(v4) > 0 && v2.cross(v5) > 0 && v3.cross(v6) > 0;
            }
            else {
                return v1.cross(v4) < 0 && v2.cross(v5) < 0 && v3.cross(v6) < 0;
            }
        }
        else if (s instanceof Triangle) {
            return this.contains(s.p1) && this.contains(s.p2) && this.contains(s.p3);
        }
    }
    closest(p) {
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
    distance(p) {
        return p.distance(this.closest(p));
    }
    circumcircle() {
        return new Circle(this.p1, this.p2, this.p3);
    }
}
exports.Triangle = Triangle;
class Rect {
    constructor() {
        if (arguments.length == 2) {
            this.p = new Point(Math.min(arguments[0].x, arguments[1].x), Math.min(arguments[0].y, arguments[1].y));
            this.w = Math.abs(arguments[0].x - arguments[1].x);
            this.h = Math.abs(arguments[0].y - arguments[1].y);
        }
        else if (arguments.length == 3) {
            this.p = arguments[0];
            this.w = arguments[1];
            this.h = arguments[2];
        }
        else if (arguments.length == 4) {
            this.p = new Point(arguments[0], arguments[1]);
            this.w = arguments[2];
            this.h = arguments[3];
        }
    }
    translate(x, y) {
        this.p.translate(x, y);
        return this;
    }
    scale() {
        if (arguments.length == 1) {
            this.p.scale(arguments[0]);
        }
        else if (arguments.length == 2) {
            this.p.scale(arguments[0], arguments[1]);
        }
        this.w *= arguments[0];
        this.h *= arguments[0];
        return this;
    }
    copy() {
        return new Rect(this.p.x, this.p.y, this.w, this.h);
    }
    centroid() {
        return new Point(this.p.x + this.w * 0.5, this.p.y + this.h * 0.5);
    }
    area() {
        return this.w * this.h;
    }
    circumference() {
        return (this.w + this.h) * 2;
    }
    vertices() {
        let points = new Array(4);
        points[0] = this.p.copy();
        points[1] = new Point(this.p.x + this.w, this.p.y);
        points[2] = new Point(this.p.x + this.w, this.p.y + this.h);
        points[3] = new Point(this.p.x, this.p.y + this.h);
        return points;
    }
    edges() {
        let points = this.vertices();
        let lines = new Array(4);
        lines[0] = new Line(points[0], points[1]);
        lines[1] = new Line(points[1], points[2]);
        lines[2] = new Line(points[2], points[3]);
        lines[3] = new Line(points[3], points[0]);
        return lines;
    }
    polygon() {
        return new Polygon(this.vertices());
    }
    merge(rect) {
        let p1 = new Point(Math.min(this.p.x, rect.p.x), Math.min(this.p.y, rect.p.y));
        let p2 = new Point(Math.max(this.p.x + this.w, rect.p.x + rect.w), Math.max(this.p.y + this.h, rect.p.y + rect.h));
        return new Rect(p1, p2);
    }
    contains(s) {
        if (s instanceof Point) {
            return s.x >= this.p.x && s.x <= this.p.x + this.w && s.y >= this.p.y && s.y <= this.p.y + this.h;
        }
        else if (s instanceof Circle) {
            return s.p.x - s.r >= this.p.x && s.p.x + s.r <= this.p.x + this.w && s.p.y - s.r >= this.p.y && s.p.y + s.r <= this.p.y + this.h;
        }
        else if (s instanceof Rect) {
            return s.p.x >= this.p.x && s.p.y >= this.p.y && s.p.x + s.w <= this.p.x + this.w && s.p.y + s.h <= this.p.y + this.h;
        }
    }
    closest(p) {
        let left = this.p.x;
        let top = this.p.y;
        let right = this.p.x + this.w;
        let bottom = this.p.y + this.h;
        if (p.x < left) {
            return new Point(left, Math.min(Math.max(p.y, top), bottom));
        }
        else if (p.y < top) {
            return new Point(Math.min(Math.max(p.x, left), right), top);
        }
        else if (p.x > right) {
            return new Point(right, Math.min(Math.max(p.y, top), bottom));
        }
        else if (p.y > bottom) {
            return new Point(Math.min(Math.max(p.x, left), right), bottom);
        }
        else {
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
    distance(p) {
        return p.distance(this.closest(p));
    }
    intersects(s) {
        if (s instanceof Point) {
            return this.contains(s);
        }
        else if (s instanceof Circle) {
            return s.intersects(this);
        }
        else if (s instanceof Rect) {
            return this.p.x <= s.p.x + s.w &&
                this.p.x + this.w >= s.p.x &&
                this.p.y <= s.p.y + s.h &&
                this.p.y + this.h >= s.p.y;
        }
    }
    intersection(rect) {
        if (!this.intersects(rect))
            return null;
        let points = new Array();
        let vertices1 = this.vertices();
        let vertices2 = rect.vertices();
        for (let i = 0; i < 4; i++) {
            if (rect.contains(vertices1[i]))
                points.push(vertices1[i]);
            if (this.contains(vertices2[i]))
                points.push(vertices2[i]);
        }
        let edges1 = this.edges();
        let edges2 = rect.edges();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let p = edges1[i].intersection(edges2[j]);
                if (p != null)
                    points.push(p);
            }
        }
        let p1 = points[0].copy();
        let p2 = points[0].copy();
        for (let i = 0; i < points.length; i++) {
            let p = points[i];
            if (p.x < p1.x)
                p1.x = p.x;
            if (p.x > p2.x)
                p2.x = p.x;
            if (p.y < p1.y)
                p1.y = p.y;
            if (p.y > p2.y)
                p2.y = p.y;
        }
        return new Rect(p1, p2);
    }
    split(data, mode = 'squarify') {
        if (mode == 'dice') {
            return this.dice(data);
        }
        else if (mode == 'slice') {
            return this.slice(data);
        }
        else if (mode == 'squarify') {
            let sum = data.reduce((a, b) => a + b);
            let array = new Array(data.length);
            for (let i = 0; i < data.length; i++)
                array[i] = data[i] / sum * this.area();
            return this.squarify(array, this.p.x, this.p.y, this.w, this.h);
        }
    }
    dice(data) {
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
    slice(data) {
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
    squarify(data, x, y, w, h) {
        let ratio = (w, h) => { return w > h ? w / h : h / w; };
        let vertical = w > h;
        let side = vertical ? h : w;
        let rectangles = new Array();
        if (vertical) {
            for (let i = 0; i < data.length; i++) {
                let worst = rectangles.length == 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
                let areas = 0;
                for (let r of rectangles)
                    worst = Math.max(worst, ratio(r.w, r.h));
                for (let r of rectangles)
                    areas += r.area();
                let tw = (areas + data[i]) / side;
                let th = data[i] / tw;
                let ty = y;
                for (let r of rectangles)
                    ty += r.area() / tw;
                let rect = new Rect(x, ty, tw, th);
                let k = ratio(rect.w, rect.h);
                for (let r of rectangles)
                    k = Math.max(k, ratio(tw, r.area() / tw));
                if (k < worst) {
                    rectangles.push(rect);
                    ty = y;
                    for (let r of rectangles) {
                        [r.h, r.w, r.p.y] = [r.area() / tw, tw, ty];
                        ty += r.h;
                    }
                }
                else {
                    areas = 0;
                    for (let r of rectangles)
                        areas += r.area();
                    let offset = areas / side;
                    rectangles = rectangles.concat(this.squarify(data.slice(i), x + offset, y, w - offset, h));
                    break;
                }
            }
        }
        else {
            for (let i = 0; i < data.length; i++) {
                let worst = rectangles.length == 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
                let areas = 0;
                for (let r of rectangles)
                    worst = Math.max(worst, ratio(r.w, r.h));
                for (let r of rectangles)
                    areas += r.area();
                let th = (areas + data[i]) / side;
                let tw = data[i] / th;
                let tx = x;
                for (let r of rectangles)
                    tx += r.area() / th;
                let rect = new Rect(tx, y, tw, th);
                let k = ratio(rect.w, rect.h);
                for (let r of rectangles)
                    k = Math.max(k, ratio(r.area() / th, th));
                if (k < worst) {
                    rectangles.push(rect);
                    tx = x;
                    for (let r of rectangles) {
                        [r.w, r.h, r.p.x] = [r.area() / th, th, tx];
                        tx += r.w;
                    }
                }
                else {
                    areas = 0;
                    for (let r of rectangles)
                        areas += r.area();
                    let offset = areas / side;
                    rectangles = rectangles.concat(this.squarify(data.slice(i), x, y + offset, w, h - offset));
                    break;
                }
            }
        }
        return rectangles;
    }
    clip(poly) {
        return new Polygon(this.vertices()).clip(poly);
    }
}
exports.Rect = Rect;
class Polygon {
    constructor() {
        if (arguments.length == 1) {
            this.vertices = arguments[0];
        }
        else {
            this.vertices = new Array();
        }
    }
    add() {
        if (arguments.length == 1) {
            this.vertices.push(arguments[0]);
        }
        else if (arguments.length == 2) {
            this.vertices.push(new Point(arguments[0], arguments[1]));
        }
        return this;
    }
    clear() {
        this.vertices = [];
    }
    translate(x, y) {
        for (let v of this.vertices)
            v.translate(x, y);
        return this;
    }
    rotate() {
        if (arguments.length == 1) {
            for (let v of this.vertices)
                v.rotate(arguments[0]);
        }
        else if (arguments.length == 2) {
            for (let v of this.vertices)
                v.rotate(arguments[0], arguments[1]);
        }
        return this;
    }
    scale() {
        if (arguments.length == 1) {
            for (let v of this.vertices)
                v.scale(arguments[0]);
        }
        else if (arguments.length == 2) {
            for (let v of this.vertices)
                v.scale(arguments[0], arguments[1]);
        }
        return this;
    }
    reverse() {
        this.vertices.reverse();
        return this;
    }
    edges() {
        let lines = new Array();
        for (let i = 0; i < this.vertices.length; i++) {
            let p1 = this.vertices[i];
            let p2 = this.vertices[(i + 1) % this.vertices.length];
            lines.push(new Line(p1, p2));
        }
        return lines;
    }
    bounds() {
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
    area() {
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
    circumference() {
        let circumference = 0;
        for (let i = 0; i < this.vertices.length; i++) {
            let p1 = this.vertices[i];
            let p2 = this.vertices[(i + 1) % this.vertices.length];
            circumference += p1.distance(p2);
        }
        return circumference;
    }
    centroid() {
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
    clockwise() {
        return this.area() > 0;
    }
    convex() {
        let clockwise = this.clockwise();
        for (let i = 0; i < this.vertices.length; i++) {
            let p1 = this.vertices[i];
            let p2 = this.vertices[(i + 1) % this.vertices.length];
            let p3 = this.vertices[(i + 2) % this.vertices.length];
            let v1 = new Vector(p2.x - p1.x, p2.y - p1.y);
            let v2 = new Vector(p3.x - p2.x, p3.y - p2.y);
            if (clockwise) {
                if (v1.cross(v2) < 0)
                    return false;
            }
            else {
                if (v1.cross(v2) > 0)
                    return false;
            }
        }
        return true;
    }
    contains(s) {
        if (this.vertices.length < 3)
            return false;
        if (s instanceof Point) {
            let count = 0;
            for (let i = 0; i < this.vertices.length; i++) {
                let p1 = this.vertices[i];
                let p2 = this.vertices[(i + 1) % this.vertices.length];
                if (p1.x <= s.x && s.x < p2.x || p2.x <= s.x && s.x < p1.x) {
                    let y = (p2.y - p1.y) / (p2.x - p1.x) * (s.x - p1.x) + p1.y;
                    if (s.y < y)
                        count++;
                }
            }
            return count % 2 != 0;
        }
        else if (s instanceof Polygon) {
            for (let i = 0; i < s.vertices.length; i++) {
                if (!this.contains(s.vertices[i]))
                    return false;
            }
            return true;
        }
    }
    closest(p) {
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
    distance(p) {
        return p.distance(this.closest(p));
    }
    clip(poly) {
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
            if (a1 > a2)
                return 1;
            else if (a1 == a2)
                return 0;
            else
                return -1;
        });
        if (points.length > 0)
            return new Polygon(points);
        else
            return null;
    }
}
exports.Polygon = Polygon;
class QuadTree {
    constructor(bounds, capacity = 4, maxLevels = 4, level = 0) {
        this.bounds = bounds;
        this.capacity = capacity;
        this.maxLevels = maxLevels;
        this._level = level;
        this.children = null;
        this.objects = [];
    }
    leaf() {
        return this.children == null;
    }
    clear() {
        this.children = null;
        this.objects = [];
    }
    insert(object) {
        if (object instanceof Array) {
            for (let i = 0; i < object.length; i++)
                this.insert(object[i]);
            return;
        }
        if (this.children) {
            for (let i = 0; i < 4; i++) {
                if (this.children[i].bounds.intersects(object.bounds()))
                    this.children[i].insert(object);
            }
            return;
        }
        this.objects.push(object);
        if (this.objects.length > this.capacity && this._level < this.maxLevels) {
            let x = this.bounds.p.x;
            let y = this.bounds.p.y;
            let w = this.bounds.w / 2;
            let h = this.bounds.h / 2;
            this.children = [
                new QuadTree(new Rect(x, y, w, h), this.capacity, this.maxLevels, this._level + 1),
                new QuadTree(new Rect(x + w, y, w, h), this.capacity, this.maxLevels, this._level + 1),
                new QuadTree(new Rect(x + w, y + h, w, h), this.capacity, this.maxLevels, this._level + 1),
                new QuadTree(new Rect(x, y + h, w, h), this.capacity, this.maxLevels, this._level + 1)
            ];
            for (let i = 0; i < this.objects.length; i++) {
                for (let j = 0; j < 4; j++) {
                    if (this.children[j].bounds.intersects(this.objects[i].bounds()))
                        this.children[j].insert(this.objects[i]);
                }
            }
            this.objects = [];
        }
    }
    query(range) {
        let objects = this.objects;
        if (this.children) {
            for (let i = 0; i < 4; i++) {
                if (this.children[i].bounds.intersects(range)) {
                    objects = objects.concat(this.children[i].query(range));
                }
            }
        }
        objects = objects.filter((x, index) => objects.indexOf(x) === index);
        return objects;
    }
}
exports.QuadTree = QuadTree;
class ConvexHull {
    compute(points) {
        if (points.length < 3) {
            this.vertices = points;
            this.region = new Polygon(points);
            return;
        }
        let sort_points = points.slice();
        sort_points.sort(function (a, b) {
            if (a.y > b.y)
                return 1;
            else if (a.y == b.y)
                return a.x - b.x;
            else
                return -1;
        });
        let p = new Point(sort_points[0].x - 1, sort_points[0].y);
        let v = new Vector(1, 0);
        sort_points.sort(function (a, b) {
            let a1 = new Vector(a.x - p.x, a.y - p.y).angle();
            let a2 = new Vector(b.x - p.x, b.y - p.y).angle();
            if (a1 > a2)
                return 1;
            else if (a1 == a2)
                return a.distanceSq(p) - b.distanceSq(p);
            else
                return -1;
        });
        let vertices = new Array();
        for (let i = 0; i < sort_points.length; i++) {
            if (vertices.length < 2) {
                vertices.push(sort_points[i]);
            }
            else {
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
                    }
                    else {
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
exports.ConvexHull = ConvexHull;
class Delaunay {
    compute(points) {
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
                if (e.__remove)
                    lines.splice(j, 1);
                else
                    triangles.push(new Triangle(points[i], e.p1, e.p2));
            }
        }
        let edges = new Array();
        for (let i = triangles.length - 1; i >= 0; i--) {
            let t = triangles[i];
            if ((t.p1 == superTriangle.p1 || t.p1 == superTriangle.p2 || t.p1 == superTriangle.p3) ||
                (t.p2 == superTriangle.p1 || t.p2 == superTriangle.p2 || t.p2 == superTriangle.p3) ||
                (t.p3 == superTriangle.p1 || t.p3 == superTriangle.p2 || t.p3 == superTriangle.p3)) {
                triangles.splice(i, 1);
            }
            else {
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
exports.Delaunay = Delaunay;
class Voronoi {
    compute(points) {
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
            points[i].__circumcenters = new Array();
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
                if (e.__remove)
                    lines.splice(j, 1);
                else
                    triangles.push(new Triangle(points[i], e.p1, e.p2));
            }
        }
        let vertices = new Array();
        for (let i = 0; i < triangles.length; i++) {
            let t = triangles[i];
            t.__circumcenter = t.circumcircle().p;
            vertices.push(t.__circumcenter);
            if (t.p1.__circumcenters)
                t.p1.__circumcenters.push(t.__circumcenter);
            if (t.p2.__circumcenters)
                t.p2.__circumcenters.push(t.__circumcenter);
            if (t.p3.__circumcenters)
                t.p3.__circumcenters.push(t.__circumcenter);
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
            p.__circumcenters.sort(function (a, b) {
                let v1 = new Vector(a.x - p.x, a.y - p.y);
                let v2 = new Vector(b.x - p.x, b.y - p.y);
                return v1.angle() - v2.angle();
            });
            let region = new Polygon(p.__circumcenters);
            regions.push(region);
        }
        this.triangles = triangles;
        this.vertices = vertices;
        this.edges = edges;
        this.regions = regions;
    }
}
exports.Voronoi = Voronoi;
class LimitedVoronoi {
    compute(cells) {
        let sites;
        if (cells[0] instanceof Circle) {
            sites = new Array(cells.length);
            for (let i = 0; i < cells.length; i++) {
                sites[i] = new Cell(cells[i].p.x, cells[i].p.y, cells[i].r);
            }
        }
        else {
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
                if (d < s1.r - s2.r)
                    s2.__contained = true;
                if (d < s2.r - s1.r)
                    s1.__contained = true;
            }
        }
        let lines = new Array();
        for (let i = 0; i < sites.length - 1; i++) {
            let s1 = sites[i];
            if (s1.__contained)
                continue;
            for (let j = i + 1; j < sites.length; j++) {
                let s2 = sites[j];
                if (s2.__contained)
                    continue;
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
                    l1.__s1 = s1;
                    l1.__s2 = s2;
                    l2.__s1 = s2;
                    l2.__s2 = s1;
                    p1.__l1 = l1;
                    p1.__l2 = l2;
                    p2.__l1 = l1;
                    p2.__l2 = l2;
                    p3.__l1 = l1;
                    p3.__l2 = l2;
                    p4.__l1 = l1;
                    p4.__l2 = l2;
                    p1.__arc = true;
                    p3.__arc = true;
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
            if (a > d)
                clockwise = !clockwise;
            if (clockwise) {
                return [p2, p1];
            }
            else {
                return [p1, p2];
            }
        }
        for (let i = 0; i < lines.length - 1; i++) {
            for (let j = i + 1; j < lines.length; j++) {
                let l1 = lines[i];
                let l2 = lines[j];
                if (l1.__s1 == l2.__s2 && l1.__s2 == l2.__s1)
                    continue;
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
                        if (v.cross(l.direction()) < 0)
                            s.__points.splice(k, 1);
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
                if (p1.distance(p2) < 1e-4)
                    s.__points.splice(j, 1);
            }
            if (s.__points.length > 0) {
                s.state = 1;
            }
            else {
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
exports.LimitedVoronoi = LimitedVoronoi;
class CellVertex {
    constructor(x, y, a, type) {
        this.x = x;
        this.y = y;
        this.a = a;
        this.type = type;
    }
}
exports.CellVertex = CellVertex;
class Cell {
    constructor() {
        if (arguments.length == 2) {
            this.p = arguments[0];
            this.r = arguments[1];
        }
        else if (arguments.length == 3) {
            this.p = new Point(arguments[0], arguments[1]);
            this.r = arguments[2];
        }
        this.vertices = new Array();
    }
    clear() {
        this.vertices = [];
    }
    polygon(detail) {
        if (this.state != 1)
            return new Circle(this.p, this.r).polygon(detail);
        let points = new Array();
        for (let i = 0; i < this.vertices.length; i++) {
            const v1 = this.vertices[i];
            const v2 = this.vertices[(i + 1) % this.vertices.length];
            if (v1.type == 0) {
                points.push(new Point(v1.x, v1.y));
            }
            else {
                let start = v1.a;
                let end = v2.a;
                if (start > end)
                    end += 2 * Math.PI;
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
exports.Cell = Cell;

},{}],4:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./math"), exports);
__exportStar(require("./geometry"), exports);
__exportStar(require("./physics"), exports);
__exportStar(require("./evolution"), exports);
__exportStar(require("./audio"), exports);
__exportStar(require("./visual"), exports);

},{"./audio":1,"./evolution":2,"./geometry":3,"./math":5,"./physics":6,"./visual":7}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Perlin = exports.Random = exports.deviation = exports.variance = exports.median = exports.mean = exports.sum = exports.min = exports.max = exports.dist = exports.norm = exports.map = exports.lerp = exports.clamp = exports.fract = exports.rad = exports.deg = void 0;
function deg(rad) {
    return rad / Math.PI * 180;
}
exports.deg = deg;
function rad(deg) {
    return deg / 180 * Math.PI;
}
exports.rad = rad;
function fract(x) {
    return x - Math.floor(x);
}
exports.fract = fract;
function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}
exports.clamp = clamp;
function lerp(start, end, t) {
    return start + (end - start) * t;
}
exports.lerp = lerp;
function map(value, start1, end1, start2, end2) {
    return start2 + (end2 - start2) * (value - start1) / (end1 - start1);
}
exports.map = map;
function norm(value, start, end) {
    return (value - start) / (end - start);
}
exports.norm = norm;
function dist(x1, y1, x2, y2) {
    let dx = x1 - x2;
    let dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}
exports.dist = dist;
function max(data) {
    return Math.max(...data);
}
exports.max = max;
function min(data) {
    return Math.min(...data);
}
exports.min = min;
function sum(data) {
    return data.reduce((a, b) => a + b);
}
exports.sum = sum;
function mean(data) {
    return sum(data) / data.length;
}
exports.mean = mean;
function median(data) {
    let array = [...data].sort();
    let i = Math.floor(data.length / 2);
    if (data.length % 2 == 0)
        return (array[i - 1] + array[i]) / 2;
    else
        return array[i];
}
exports.median = median;
function variance(data) {
    let m = mean(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++)
        sum += (data[i] - m) * (data[i] - m);
    return sum / data.length;
}
exports.variance = variance;
function deviation(data) {
    return Math.sqrt(variance(data));
}
exports.deviation = deviation;
class Random {
    constructor() {
        this._a = 1664525;
        this._c = 1013904223;
        this._m = 4294967296;
    }
    seed(seed) {
        this._seed = seed;
    }
    lcg() {
        this._seed = (this._a * this._seed + this._c) % this._m;
        return this._seed / this._m;
    }
    next() {
        let rand;
        if (this._seed == undefined)
            rand = Math.random();
        else
            rand = this.lcg();
        if (arguments.length == 1) {
            return arguments[0] * rand;
        }
        else if (arguments.length == 2) {
            return arguments[0] + (arguments[1] - arguments[0]) * rand;
        }
        else {
            return rand;
        }
    }
}
exports.Random = Random;
class Perlin {
    constructor() {
        this._random = new Random();
        this._offset = Math.random() * 256;
        this._gradient = [
            [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1],
            [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
        ];
        this.permutation();
        this._octaves = 4;
        this._falloff = 0.5;
    }
    permutation() {
        let array = new Array(256);
        for (let i = 0; i < 256; i++)
            array[i] = i;
        let shuffle = [];
        while (array.length) {
            let i = Math.floor(this._random.next(array.length));
            shuffle.push(array.splice(i, 1)[0]);
        }
        this._permutation = new Array(512);
        for (let i = 0; i < 512; i++)
            this._permutation[i] = shuffle[i & 255];
    }
    seed(seed) {
        this._random.seed(seed);
        this._offset = this._random.next() * 256;
        this.permutation();
    }
    detail(octaves, falloff) {
        this._octaves = octaves;
        this._falloff = falloff;
    }
    noise(x, y = 0, z = 0) {
        x += this._offset;
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let totalAmplitude = 0;
        for (let i = 0; i < this._octaves; i++) {
            total += this.compute(x * frequency, y * frequency, z * frequency) * amplitude;
            frequency *= 2;
            totalAmplitude += amplitude;
            amplitude *= this._falloff;
        }
        return total / totalAmplitude;
    }
    dot(g, x, y, z) {
        return g[0] * x + g[1] * y + g[2] * z;
    }
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    mix(a, b, t) {
        return (1 - t) * a + t * b;
    }
    compute(x, y = 0, z = 0) {
        let X = Math.floor(x);
        let Y = Math.floor(y);
        let Z = Math.floor(z);
        x -= X;
        y -= Y;
        z -= Z;
        X &= 255;
        Y &= 255;
        Z &= 255;
        let g000 = this._permutation[X + this._permutation[Y + this._permutation[Z]]] & 11;
        let g001 = this._permutation[X + this._permutation[Y + this._permutation[Z + 1]]] & 11;
        let g010 = this._permutation[X + this._permutation[Y + 1 + this._permutation[Z]]] & 11;
        let g011 = this._permutation[X + this._permutation[Y + 1 + this._permutation[Z + 1]]] & 11;
        let g100 = this._permutation[X + 1 + this._permutation[Y + this._permutation[Z]]] & 11;
        let g101 = this._permutation[X + 1 + this._permutation[Y + this._permutation[Z + 1]]] & 11;
        let g110 = this._permutation[X + 1 + this._permutation[Y + 1 + this._permutation[Z]]] & 11;
        let g111 = this._permutation[X + 1 + this._permutation[Y + 1 + this._permutation[Z + 1]]] & 11;
        let d000 = this.dot(this._gradient[g000], x, y, z);
        let d100 = this.dot(this._gradient[g100], x - 1, y, z);
        let d010 = this.dot(this._gradient[g010], x, y - 1, z);
        let d110 = this.dot(this._gradient[g110], x - 1, y - 1, z);
        let d001 = this.dot(this._gradient[g001], x, y, z - 1);
        let d101 = this.dot(this._gradient[g101], x - 1, y, z - 1);
        let d011 = this.dot(this._gradient[g011], x, y - 1, z - 1);
        let d111 = this.dot(this._gradient[g111], x - 1, y - 1, z - 1);
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
        return (xyz + 1) / 2;
    }
}
exports.Perlin = Perlin;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolygonConstraint = exports.RectConstraint = exports.CircleConstraint = exports.Constraint = exports.Gravitation = exports.Collision = exports.InteractionForce = exports.CircleField = exports.ArcField = exports.LineField = exports.PointField = exports.ConstForce = exports.Force = exports.Spring = exports.Particle = exports.World = void 0;
const geometry_1 = require("./geometry");
class World {
    constructor(bounds = null) {
        this.friction = .75;
        this.bounds = bounds;
        this.particles = [];
        this.springs = [];
        this.forces = [];
        this.interactionForces = [];
        this.constraints = [];
    }
    addParticle(p) {
        this.particles.push(p);
    }
    addSpring(s) {
        this.springs.push(s);
    }
    addForce(f) {
        this.forces.push(f);
    }
    addInteractionForce(f) {
        this.interactionForces.push(f);
    }
    addConstraint(c) {
        this.constraints.push(c);
    }
    removeParticle(p) {
        let index = this.particles.indexOf(p);
        if (index != -1)
            this.particles.splice(index, 1);
    }
    removeSpring(s) {
        let index = this.springs.indexOf(s);
        if (index != -1)
            this.springs.splice(index, 1);
    }
    removeForce(f) {
        let index = this.forces.indexOf(f);
        if (index != -1)
            this.forces.splice(index, 1);
    }
    removeInteractionForce(f) {
        let index = this.interactionForces.indexOf(f);
        if (index != -1)
            this.interactionForces.splice(index, 1);
    }
    removeConstraint(c) {
        let index = this.constraints.indexOf(c);
        if (index != -1)
            this.constraints.splice(index, 1);
    }
    update() {
        for (let p of this.particles)
            for (let f of this.forces)
                f.apply(p);
        for (let f of this.interactionForces)
            f.apply(this.particles);
        for (let s of this.springs)
            s.update();
        for (let p of this.particles)
            p.update(this.friction);
        for (let p of this.particles)
            for (let c of this.constraints)
                c.apply(p);
        if (this.bounds)
            for (let p of this.particles)
                p.bounce(this.bounds);
    }
}
exports.World = World;
class Particle {
    constructor(x, y) {
        this.radius = 1;
        this.mass = 1;
        this.position = new geometry_1.Vector(x, y);
        this.previousPosition = this.position.copy();
        this._force = new geometry_1.Vector();
    }
    velocity() {
        return this.position.sub(this.previousPosition);
    }
    addVelocity(v) {
        if (this._fix)
            return;
        this.previousPosition = this.previousPosition.sub(v);
    }
    clearVelocity() {
        this.previousPosition = this.position.copy();
    }
    addForce(f) {
        if (this._fix)
            return;
        this._force = this._force.add(f);
    }
    clearForce() {
        this._force = new geometry_1.Vector();
    }
    update(friction = 1) {
        if (this._fix)
            return;
        let v = this.position.sub(this.previousPosition);
        let p = this.position.add(v.add(this._force.div(this.mass)).mult(friction));
        this.previousPosition = this.position.copy();
        this.position = p;
        this._force = this._force.mult(0);
    }
    bounce(rect) {
        if (this._fix)
            return;
        this.position.x = Math.min(Math.max(this.position.x, rect.p.x + this.radius), rect.p.x + rect.w - this.radius);
        this.position.y = Math.min(Math.max(this.position.y, rect.p.y + this.radius), rect.p.y + rect.h - this.radius);
    }
    bounds() {
        return new geometry_1.Circle(this.position.x, this.position.y, this.radius);
    }
    fix() {
        this._fix = true;
    }
    unfix() {
        this._fix = false;
    }
}
exports.Particle = Particle;
class Spring {
    constructor() {
        this.strength = 1;
        this._min = 0;
        this._max = Number.POSITIVE_INFINITY;
        this.p1 = arguments[0];
        this.p2 = arguments[1];
        if (arguments.length == 2) {
            this.length = this.p1.position.sub(this.p2.position).mag();
        }
        else if (arguments.length == 3) {
            this.length = this.p1.position.sub(this.p2.position).mag();
            this.strength = arguments[2];
        }
        else if (arguments.length == 4) {
            this.strength = arguments[2];
            this.length = arguments[3];
        }
    }
    range(min = 0, max = Number.POSITIVE_INFINITY) {
        this._min = min;
        this._max = max;
    }
    update() {
        let v = this.p1.position.sub(this.p2.position);
        let d = v.mag();
        if (d >= this._min && d <= this._max) {
            v = v.mult((this.length - d) / d / (this.p1.mass + this.p2.mass) * this.strength);
            this.p1.position = this.p1.position.add(v.mult(this.p1.mass));
            this.p2.position = this.p2.position.sub(v.mult(this.p2.mass));
        }
    }
}
exports.Spring = Spring;
class Force {
}
exports.Force = Force;
class ConstForce extends Force {
    constructor() {
        super();
        if (arguments.length == 1) {
            this.force = arguments[0];
        }
        else if (arguments.length == 2) {
            this.force = new geometry_1.Vector(arguments[0], arguments[1]);
        }
        else {
            this.force = new geometry_1.Vector(0, 0);
        }
    }
    apply(p) {
        p.addForce(this.force);
    }
}
exports.ConstForce = ConstForce;
class PointField extends Force {
    constructor(point, strength = 1) {
        super();
        this._min = 0;
        this._max = Number.POSITIVE_INFINITY;
        this.point = point;
        this.strength = strength;
    }
    range(min = 0, max = Number.POSITIVE_INFINITY) {
        this._min = min;
        this._max = max;
    }
    force(position) {
        let force = position.sub(this.point.x, this.point.y);
        let d = force.mag();
        if (d >= this._min && d <= this._max) {
            let a = d - this._min;
            let b = this._max - this._min;
            force = force.normalize().mult(1.0 - a * a / (b * b));
            return force.mult(-this.strength);
        }
        else {
            return null;
        }
    }
    apply(p) {
        let force = this.force(p.position);
        if (force)
            p.addForce(force);
    }
}
exports.PointField = PointField;
class LineField extends Force {
    constructor(line, strength = 1) {
        super();
        this._min = 0;
        this._max = Number.POSITIVE_INFINITY;
        this.line = line;
        this.strength = strength;
    }
    range(min = 0, max = Number.POSITIVE_INFINITY) {
        this._min = min;
        this._max = max;
    }
    force(position) {
        let cp = this.line.closest(new geometry_1.Point(position.x, position.y));
        let force = position.sub(cp.x, cp.y);
        let d = force.mag();
        if (d >= this._min && d <= this._max) {
            let a = d - this._min;
            let b = this._max - this._min;
            force = force.normalize().mult(1.0 - a * a / (b * b));
            return force.mult(-this.strength);
        }
        else {
            return null;
        }
    }
    apply(p) {
        let force = this.force(p.position);
        if (force)
            p.addForce(force);
    }
}
exports.LineField = LineField;
class ArcField extends Force {
    constructor(arc, strength = 1) {
        super();
        this._min = 0;
        this._max = Number.POSITIVE_INFINITY;
        this.arc = arc;
        this.strength = strength;
    }
    range(min = 0, max = Number.POSITIVE_INFINITY) {
        this._min = min;
        this._max = max;
    }
    force(position) {
        let cp = this.arc.closest(new geometry_1.Point(position.x, position.y));
        let force = position.sub(cp.x, cp.y);
        let d = force.mag();
        if (d >= this._min && d <= this._max) {
            let a = d - this._min;
            let b = this._max - this._min;
            force = force.normalize().mult(1.0 - a * a / (b * b));
            return force.mult(-this.strength);
        }
        else {
            return null;
        }
    }
    apply(p) {
        let force = this.force(p.position);
        if (force)
            p.addForce(force);
    }
}
exports.ArcField = ArcField;
class CircleField extends Force {
    constructor(circle, strength = 1) {
        super();
        this._min = 0;
        this._max = Number.POSITIVE_INFINITY;
        this.circle = circle;
        this.strength = strength;
    }
    range(min = 0, max = Number.POSITIVE_INFINITY) {
        this._min = min;
        this._max = max;
    }
    force(position) {
        let cp = this.circle.closest(new geometry_1.Point(position.x, position.y));
        let force = position.sub(cp.x, cp.y);
        let d = force.mag();
        if (d >= this._min && d <= this._max) {
            let a = d - this._min;
            let b = this._max - this._min;
            force = force.normalize().mult(1.0 - a * a / (b * b));
            return force.mult(-this.strength);
        }
        else {
            return null;
        }
    }
    apply(p) {
        let force = this.force(p.position);
        if (force)
            p.addForce(force);
    }
}
exports.CircleField = CircleField;
class InteractionForce {
}
exports.InteractionForce = InteractionForce;
class Collision extends InteractionForce {
    constructor(quadTree = null) {
        super();
        this.strength = 1;
        this.iterations = 1;
        this._filter = () => true;
        this._quadTree = quadTree;
    }
    filter(f) {
        this._filter = f;
    }
    apply(particles) {
        for (let k = 0; k < this.iterations; k++) {
            if (this._quadTree) {
                this._quadTree.clear();
                this._quadTree.insert(particles);
            }
            for (let i = 0; i < particles.length - 1; i++) {
                let a = particles[i];
                if (this._quadTree) {
                    let objects = this._quadTree.query(new geometry_1.Circle(a.position.x, a.position.y, a.radius));
                    for (let j = 0; j < objects.length; j++) {
                        let b = objects[j];
                        if (!this._filter(a, b) || a === b)
                            continue;
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
                else {
                    for (let j = i + 1; j < particles.length; j++) {
                        let b = particles[j];
                        if (!this._filter(a, b))
                            continue;
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
exports.Collision = Collision;
class Gravitation extends InteractionForce {
    constructor(G = 1) {
        super();
        this.iterations = 1;
        this._min = 0;
        this._max = Number.POSITIVE_INFINITY;
        this.G = G;
        this._filter = () => true;
    }
    range(min = 0, max = Number.POSITIVE_INFINITY) {
        this._min = min;
        this._max = max;
    }
    filter(f) {
        this._filter = f;
    }
    apply(particles) {
        for (let k = 0; k < this.iterations; k++) {
            for (let i = 0; i < particles.length - 1; i++) {
                let a = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    let b = particles[j];
                    if (!this._filter(a, b))
                        continue;
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
exports.Gravitation = Gravitation;
class Constraint {
}
exports.Constraint = Constraint;
class CircleConstraint extends Constraint {
    constructor(circle) {
        super();
        this.circle = circle;
    }
    apply(p) {
        if (this.circle.p.distance(new geometry_1.Point(p.position.x, p.position.y)) < this.circle.r + p.radius) {
            let v = p.position.sub(this.circle.p.x, this.circle.p.y).normalize();
            v = v.mult(this.circle.r + p.radius).add(this.circle.p.x, this.circle.p.y);
            p.position.x = v.x;
            p.position.y = v.y;
        }
    }
}
exports.CircleConstraint = CircleConstraint;
class RectConstraint extends Constraint {
    constructor(rect) {
        super();
        this.rect = rect;
    }
    apply(p) {
        let x = p.position.x;
        let y = p.position.y;
        let cx = false;
        let cy = false;
        if (x < this.rect.p.x)
            x = this.rect.p.x;
        else if (x > this.rect.p.x + this.rect.w)
            x = this.rect.p.x + this.rect.w;
        else
            cx = true;
        if (y < this.rect.p.y)
            y = this.rect.p.y;
        else if (y > this.rect.p.y + this.rect.h)
            y = this.rect.p.y + this.rect.h;
        else
            cy = true;
        let dx = p.position.x - x;
        let dy = p.position.y - y;
        if (dx * dx + dy * dy <= p.radius * p.radius) {
            let v = p.position.sub(x, y).normalize().mult(p.radius).add(x, y);
            if (cx && cy)
                v = v.invert();
            p.position.x = v.x;
            p.position.y = v.y;
        }
    }
}
exports.RectConstraint = RectConstraint;
class PolygonConstraint extends Constraint {
    constructor(polygon) {
        super();
        this.polygon = polygon;
    }
    apply(p) {
        let point = new geometry_1.Point(p.position.x, p.position.y);
        let contain = this.polygon.contains(point);
        let cp = this.polygon.closest(point);
        let d = cp.distance(point);
        if (contain || d < p.radius) {
            let v = p.position.sub(cp.x, cp.y).normalize().mult(p.radius).add(cp.x, cp.y);
            if (contain)
                v = v.invert();
            p.position.x = v.x;
            p.position.y = v.y;
        }
    }
}
exports.PolygonConstraint = PolygonConstraint;

},{"./geometry":3}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Color = exports.Renderer = void 0;
const geometry_1 = require("./geometry");
class Renderer {
    constructor(canvas) {
        this.frameCount = 0;
        this.mouse = { px: 0, py: 0, x: 0, y: 0, press: false, over: false, out: false, move: false, down: false, up: false, click: false, dblclick: false };
        this._loop = true;
        this._stroke = true;
        this._fill = true;
        this._font = { style: 'normal', weight: 'normal', size: 12, family: 'sans-serif' };
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this._mouseover = this.mouseover.bind(this);
        this._mouseout = this.mouseout.bind(this);
        this._mousemove = this.mousemove.bind(this);
        this._mousedown = this.mousedown.bind(this);
        this._mouseup = this.mouseup.bind(this);
        this._click = this.click.bind(this);
        this._dblclick = this.dblclick.bind(this);
        this.onMouse();
    }
    size(w, h) {
        this.width = w;
        this.height = h;
        this.canvas.width = w;
        this.canvas.height = h;
    }
    background(c) {
        this.canvas.style.background = c;
    }
    on(event, f, options = false) {
        this.canvas.addEventListener(event, f, options);
    }
    off(event, f) {
        this.canvas.removeEventListener(event, f);
    }
    onMouse(mouse = true) {
        if (mouse) {
            this.canvas.addEventListener('mouseover', this._mouseover.bind(this), false);
            this.canvas.addEventListener('mouseout', this._mouseout.bind(this), false);
            this.canvas.addEventListener('mousemove', this._mousemove.bind(this), false);
            this.canvas.addEventListener('mousedown', this._mousedown.bind(this), false);
            this.canvas.addEventListener('mouseup', this._mouseup.bind(this), false);
            this.canvas.addEventListener('click', this._click.bind(this), false);
            this.canvas.addEventListener('dblclick', this._dblclick.bind(this), false);
        }
        else {
            this.canvas.removeEventListener('mouseover', this._mouseover.bind(this), false);
            this.canvas.removeEventListener('mouseout', this._mouseout.bind(this), false);
            this.canvas.removeEventListener('mousemove', this._mousemove.bind(this), false);
            this.canvas.removeEventListener('mousedown', this._mousedown.bind(this), false);
            this.canvas.removeEventListener('mouseup', this._mouseup.bind(this), false);
            this.canvas.removeEventListener('click', this._click.bind(this), false);
            this.canvas.removeEventListener('dblclick', this._dblclick.bind(this), false);
        }
    }
    mouseover(e) {
        this.mouse.over = true;
    }
    mouseout(e) {
        this.mouse.out = true;
    }
    mousemove(e) {
        this.mouse.move = true;
        this.mouse.px = this.mouse.x;
        this.mouse.py = this.mouse.y;
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
    }
    mousedown(e) {
        this.mouse.down = true;
        this.mouse.press = true;
    }
    mouseup(e) {
        this.mouse.up = true;
        this.mouse.press = false;
    }
    click(e) {
        this.mouse.click = true;
    }
    dblclick(e) {
        this.mouse.dblclick = true;
    }
    draw(f) {
        this._draw = f;
        this.animation();
    }
    loop(loop = true) {
        if (loop) {
            if (this._loop)
                return;
            this._loop = true;
            this.animation();
        }
        else {
            this._loop = false;
        }
    }
    animation() {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this._draw();
        this.mouse.over = false;
        this.mouse.out = false;
        this.mouse.move = false;
        this.mouse.down = false;
        this.mouse.up = false;
        this.mouse.click = false;
        this.mouse.dblclick = false;
        this.frameCount++;
        if (this._loop)
            window.requestAnimationFrame(this.animation.bind(this));
    }
    alpha(a) {
        this.context.globalAlpha = a;
    }
    clear() {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        if (arguments.length == 1) {
            const fill = this.context.fillStyle;
            this.context.fillStyle = arguments[0];
            this.context.fillRect(0, 0, this.width, this.height);
            this.context.fillStyle = fill;
        }
        else {
            this.context.clearRect(0, 0, this.width, this.height);
        }
    }
    stroke(c = true) {
        if (typeof c == 'boolean') {
            this._stroke = c;
        }
        else {
            this._stroke = true;
            this.context.strokeStyle = c;
        }
    }
    lineWidth(w) {
        this.context.lineWidth = w;
    }
    lineCap(cap) {
        this.context.lineCap = cap;
    }
    lineJoin(join) {
        this.context.lineJoin = join;
    }
    lineDash(segments) {
        if (typeof segments == 'boolean') {
            this.context.setLineDash([]);
        }
        else {
            this.context.setLineDash(segments);
        }
    }
    dashOffset(offset) {
        this.context.lineDashOffset = offset;
    }
    fill(c = true) {
        if (typeof c == 'boolean') {
            this._fill = c;
        }
        else {
            this._fill = true;
            this.context.fillStyle = c;
        }
    }
    point() {
        if (!this._stroke)
            return;
        let x, y;
        if (arguments[0] instanceof geometry_1.Point) {
            [x, y] = [arguments[0].x, arguments[0].y];
        }
        else if (arguments.length == 2) {
            [x, y] = [arguments[0], arguments[1]];
        }
        else {
            return;
        }
        const fill = this.context.fillStyle;
        this.context.fillStyle = this.context.strokeStyle;
        this.context.beginPath();
        this.context.arc(x, y, this.context.lineWidth * 0.5, 0, 2 * Math.PI, false);
        this.context.fill();
        this.context.fillStyle = fill;
    }
    line() {
        if (!this._stroke)
            return;
        let x1, y1, x2, y2;
        if (arguments[0] instanceof geometry_1.Line) {
            [x1, y1, x2, y2] = [arguments[0].p1.x, arguments[0].p1.y, arguments[0].p2.x, arguments[0].p2.y];
        }
        else if (arguments.length == 2) {
            [x1, y1, x2, y2] = [arguments[0].x, arguments[0].y, arguments[1].x, arguments[1].y];
        }
        else if (arguments.length == 4) {
            [x1, y1, x2, y2] = [arguments[0], arguments[1], arguments[2], arguments[3]];
        }
        else {
            return;
        }
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
    }
    arc() {
        if (!this._stroke && !this._fill)
            return;
        let x, y, r, start, end;
        if (arguments[0] instanceof geometry_1.Arc) {
            [x, y, r, start, end] = [arguments[0].p.x, arguments[0].p.y, arguments[0].r, arguments[0].start, arguments[0].end];
        }
        else if (arguments.length == 4) {
            [x, y, r, start, end] = [arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]];
        }
        else {
            return;
        }
        this.context.beginPath();
        this.context.arc(x, y, r, start, end, false);
        if (this._fill)
            this.context.fill();
        if (this._stroke)
            this.context.stroke();
    }
    polyline() {
        if (!this._stroke)
            return;
        let vertices;
        if (arguments[0] instanceof geometry_1.Polyline) {
            vertices = arguments[0].vertices;
        }
        else if (arguments[0] instanceof Array) {
            vertices = arguments[0];
        }
        else {
            return;
        }
        this.context.beginPath();
        for (let v of vertices)
            this.context.lineTo(v.x, v.y);
        this.context.stroke();
    }
    spline(spline, mode = 'clamped', detail = 20) {
        if (spline instanceof Array)
            spline = new geometry_1.Spline(spline);
        spline.compute(mode, detail);
        this.polyline(spline.vertices);
    }
    sector() {
        if (!this._stroke && !this._fill)
            return;
        let x, y, r1, r2, start, end;
        if (arguments[0] instanceof geometry_1.Sector) {
            [x, y, r1, r2, start, end] = [arguments[0].p.x, arguments[0].p.y, arguments[0].r1, arguments[0].r2, arguments[0].start, arguments[0].end];
        }
        else if (arguments.length == 4) {
            [x, y, r1, r2, start, end] = [arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]];
        }
        else {
            return;
        }
        this.context.beginPath();
        this.context.arc(x, y, r2, start, end, false);
        if (r1 == 0) {
            this.context.lineTo(x, y);
        }
        else {
            this.context.arc(x, y, r1, end, start, true);
        }
        this.context.closePath();
        if (this._fill)
            this.context.fill();
        if (this._stroke)
            this.context.stroke();
    }
    circle() {
        if (!this._stroke && !this._fill)
            return;
        let x, y, r;
        if (arguments[0] instanceof geometry_1.Circle) {
            [x, y, r] = [arguments[0].p.x, arguments[0].p.y, arguments[0].r];
        }
        else if (arguments.length == 3) {
            [x, y, r] = [arguments[0], arguments[1], arguments[2]];
        }
        else {
            return;
        }
        this.context.beginPath();
        this.context.arc(x, y, r, 0, 2 * Math.PI, false);
        if (this._fill)
            this.context.fill();
        if (this._stroke)
            this.context.stroke();
    }
    ellipse(x, y, rx, ry, a = 0) {
        if (!this._stroke && !this._fill)
            return;
        this.context.beginPath();
        this.context.ellipse(x, y, rx, ry, a, 0, 2 * Math.PI, false);
        if (this._fill)
            this.context.fill();
        if (this._stroke)
            this.context.stroke();
    }
    triangle() {
        if (!this._stroke && !this._fill)
            return;
        let x1, y1, x2, y2, x3, y3;
        if (arguments[0] instanceof geometry_1.Triangle) {
            [x1, y1, x2, y2, x3, y3] = [arguments[0].p1.x, arguments[0].p1.y, arguments[0].p2.x, arguments[0].p2.y, arguments[0].p3.x, arguments[0].p3.y];
        }
        else if (arguments.length == 3) {
            [x1, y1, x2, y2, x3, y3] = [arguments[0].x, arguments[0].y, arguments[1].x, arguments[1].y, arguments[2].x, arguments[2].y];
        }
        else if (arguments.length == 6) {
            [x1, y1, x2, y2, x3, y3] = [arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]];
        }
        else {
            return;
        }
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.lineTo(x3, y3);
        this.context.closePath();
        if (this._fill)
            this.context.fill();
        if (this._stroke)
            this.context.stroke();
    }
    rect() {
        if (!this._stroke && !this._fill)
            return;
        let x, y, w, h;
        if (arguments[0] instanceof geometry_1.Rect) {
            [x, y, w, h] = [arguments[0].p.x, arguments[0].p.y, arguments[0].w, arguments[0].h];
        }
        else if (arguments.length == 4) {
            [x, y, w, h] = [arguments[0], arguments[1], arguments[2], arguments[3]];
        }
        else {
            return;
        }
        if (this._fill)
            this.context.fillRect(x, y, w, h);
        if (this._stroke)
            this.context.strokeRect(x, y, w, h);
    }
    quad() {
        if (!this._stroke && !this._fill)
            return;
        let x1, y1, x2, y2, x3, y3, x4, y4;
        if (arguments.length == 4) {
            [x1, y1, x2, y2, x3, y3, x4, y4] = [arguments[0].x, arguments[0].y, arguments[1].x, arguments[1].y, arguments[2].x, arguments[2].y, arguments[3].x, arguments[3].y];
        }
        else if (arguments.length == 8) {
            [x1, y1, x2, y2, x3, y3, x4, y4] = [arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7]];
        }
        else {
            return;
        }
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.lineTo(x3, y3);
        this.context.lineTo(x4, y4);
        this.context.closePath();
        if (this._fill)
            this.context.fill();
        if (this._stroke)
            this.context.stroke();
    }
    polygon() {
        if (!this._stroke && !this._fill)
            return;
        let vertices;
        if (arguments[0] instanceof geometry_1.Polygon) {
            vertices = arguments[0].vertices;
        }
        else if (arguments[0] instanceof Array) {
            vertices = arguments[0];
        }
        else {
            return;
        }
        this.context.beginPath();
        for (let v of vertices)
            this.context.lineTo(v.x, v.y);
        this.context.closePath();
        if (this._fill)
            this.context.fill();
        if (this._stroke)
            this.context.stroke();
    }
    cell(cell) {
        if (!this._stroke && !this._fill)
            return;
        if (cell.state != 1) {
            this.circle(cell.p.x, cell.p.y, cell.r);
            return;
        }
        this.context.beginPath();
        this.context.moveTo(cell.vertices[0].x, cell.vertices[0].y);
        for (let i = 0; i < cell.vertices.length; i++) {
            const v1 = cell.vertices[i];
            const v2 = cell.vertices[(i + 1) % cell.vertices.length];
            if (v1.type == 0) {
                this.context.lineTo(v2.x, v2.y);
            }
            else {
                this.context.arc(cell.p.x, cell.p.y, cell.r, v1.a, v2.a);
            }
        }
        if (this._fill)
            this.context.fill();
        if (this._stroke)
            this.context.stroke();
    }
    quadraticBezier(x1, y1, cx1, cy1, x2, y2) {
        if (!this._stroke && !this._fill)
            return;
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.quadraticCurveTo(cx1, cy1, x2, y2);
        this.context.quadraticCurveTo(cx1, cy1, x2, y2);
        if (this._fill)
            this.context.fill();
        if (this._stroke)
            this.context.stroke();
    }
    bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2) {
        if (!this._stroke && !this._fill)
            return;
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
        if (this._fill)
            this.context.fill();
        if (this._stroke)
            this.context.stroke();
    }
    beginPath() {
        this.context.beginPath();
    }
    moveTo(x, y) {
        this.context.moveTo(x, y);
    }
    lineTo(x, y) {
        this.context.lineTo(x, y);
    }
    quadraticBezierTo(cx, cy, x, y) {
        this.context.quadraticCurveTo(cx, cy, x, y);
    }
    bezierTo(cx1, cy1, cx2, cy2, x, y) {
        this.context.bezierCurveTo(cx1, cy1, cx2, cy2, x, y);
    }
    endPath(close = false) {
        if (close)
            this.context.closePath();
        if (this._fill)
            this.context.fill();
        if (this._stroke)
            this.context.stroke();
    }
    fontStyle(style) {
        this._font.style = style;
        this.font();
    }
    fontWeight(weight) {
        this._font.weight = weight;
        this.font();
    }
    fontSize(size) {
        this._font.size = size;
        this.font();
    }
    fontFamily(family) {
        this._font.family = family;
        this.font();
    }
    font() {
        this.context.font = this._font.style + ' ' + this._font.weight + ' ' + this._font.size + 'px ' + this._font.family;
    }
    textAlign(align) {
        this.context.textAlign = align;
    }
    textBaseline(baseline) {
        this.context.textBaseline = baseline;
    }
    measureText(text) {
        return this.context.measureText(text).width;
    }
    text(text, x, y) {
        if (this._fill)
            this.context.fillText(text, x, y);
        if (this._stroke)
            this.context.strokeText(text, x, y);
    }
    save() {
        this.context.save();
    }
    restore() {
        this.context.restore();
    }
    translate(x, y) {
        this.context.translate(x, y);
    }
    rotate(a) {
        this.context.rotate(a);
    }
    scale(x, y) {
        this.context.scale(x, y);
    }
    setTransform(a, b, c, d, e, f) {
        this.context.setTransform(a, b, c, d, e, f);
    }
    transform(a, b, c, d, e, f) {
        this.context.transform(a, b, c, d, e, f);
    }
    image(img, x, y, w, h) {
        this.context.drawImage(img, x, y, w, h);
    }
    dataURL() {
        return this.canvas.toDataURL();
    }
}
exports.Renderer = Renderer;
class Color {
    static rgb() {
        if (arguments.length == 1) {
            return 'rgb(' + arguments[0] + ',' + arguments[0] + ',' + arguments[0] + ')';
        }
        else if (arguments.length == 2) {
            return 'rgba(' + arguments[0] + ',' + arguments[0] + ',' + arguments[0] + ',' + arguments[1] + ')';
        }
        else if (arguments.length == 3) {
            return 'rgb(' + arguments[0] + ',' + arguments[1] + ',' + arguments[2] + ')';
        }
        else if (arguments.length == 4) {
            return 'rgba(' + arguments[0] + ',' + arguments[1] + ',' + arguments[2] + ',' + arguments[3] + ')';
        }
    }
    static hsl() {
        if (arguments.length == 1) {
            return 'hsl(' + 0 + ',' + 0 + '%,' + arguments[0] + '%)';
        }
        else if (arguments.length == 2) {
            return 'hsla(' + 0 + ',' + 0 + '%,' + arguments[0] + '%,' + arguments[1] + ')';
        }
        else if (arguments.length == 3) {
            return 'hsl(' + arguments[0] + ',' + arguments[1] + '%,' + arguments[2] + '%)';
        }
        else if (arguments.length == 4) {
            return 'hsla(' + arguments[0] + ',' + arguments[1] + '%,' + arguments[2] + '%,' + arguments[3] + ')';
        }
    }
    static lerp(c1, c2, t) {
        let mode = c1.slice(0, 3);
        let regex = "\\((.+?)\\)";
        let c1_array = c1.match(regex)[1].split(',');
        let c2_array = c2.match(regex)[1].split(',');
        let n = c1_array.length;
        if (mode == 'hsl') {
            c1_array[1] = c1_array[1].slice(0, -1);
            c1_array[2] = c1_array[2].slice(0, -1);
            c2_array[1] = c2_array[1].slice(0, -1);
            c2_array[2] = c2_array[2].slice(0, -1);
        }
        let x = Number(c1_array[0]) + (Number(c2_array[0]) - Number(c1_array[0])) * t;
        let y = Number(c1_array[1]) + (Number(c2_array[1]) - Number(c1_array[1])) * t;
        let z = Number(c1_array[2]) + (Number(c2_array[2]) - Number(c1_array[2])) * t;
        let a = 1;
        if (n == 4)
            a = Number(c1_array[3]) + (Number(c2_array[3]) - Number(c1_array[3])) * t;
        if (mode == 'rgb') {
            return `rgba(${x},${y},${z},${a})`;
        }
        else if (mode == 'hsl') {
            return `hsla(${x},${y}%,${z}%,${a})`;
        }
    }
}
exports.Color = Color;

},{"./geometry":3}]},{},[4])(4)
});
