//Created by Ren Yuan


let quadColor;

let points = [];

let a = 2, b = 1;
let f = (x) => a * x + b;
let classify = (x, y) => y < f(x) ? 0:1;

let neuralNet = new c2.NeuralNet(2, 1, 0, 0);
let n = neuralNet.weights().length;

let chromosomes = [];
let p;

function fitness(chromosome){
    let score = 0;

    neuralNet.weights(chromosome.genes);
    for (let i = 0; i < points.length; i++) {
        let p = points[i];
        let output = neuralNet.feedforward([p.x, p.y]);
        let answer = classify(p.x, p.y);
        if((output[0]<.5) == (answer==0)) score++;
    }
    
    chromosome.fitness = score/points.length;
}

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 100);
    textSize(12);
    textStyle(NORMAL);
    textAlign(LEFT, TOP);

    quadColor = color(random(0, 8), random(30, 60), 60);

    for(let i=0; i<200; i++){
        let x = random(-width/2, width/2);
        let y = random(-height/2, height/2);
        points[i] = new c2.Point(x, y);
    }

    for(let i=0; i<10; i++) {
        let c = new c2.Chromosome();
        c.initFloat(n, -1, 1);
        chromosomes.push(c);
    }

    p = new c2.Population(chromosomes, .9, .01, fitness);
    p.setSelection('tournament', 5);
    p.setCrossover('two_point');
    c2.Mutation.maxDeviation = .1;
    p.setMutation('deviate');
}

function draw() {
    background('#cccccc');

    let info = p.fitness();
    let best = info.bestChromosome;
    neuralNet.weights(best.genes);
    let weights = neuralNet.weights();

    push();
    translate(width/2, height/2);

    let x1 = -width/2;
    let y1 = -(weights[2] + weights[0]*x1)/weights[1];
    let x2 = width/2;
    let y2 = -(weights[2] + weights[0]*x2)/weights[1];

    stroke('#333333');
    strokeWeight(1);
    fill(quadColor);
    quad(x1, y1, x2, y2, width/2, height/2, width/2, -height/2);

    for (let i = 0; i < points.length; i++) {
        let p = points[i];

        stroke('#333333');
        noFill();
        if(classify(p.x, p.y)<.5) {
            strokeWeight(5);
            point(p.x, p.y);    
        }else {
            strokeWeight(2);
            circle(p.x, p.y, 3);
        }
    }

    pop();

    let tx = 20;
    let ty = 20;
    noStroke();
    fill('#333333'); 
    text('generation ' + info.generation, tx, ty);
    text('best fitness ' + info.bestFitness.toFixed(2), tx, ty+15);
    text('worst fitness ' + info.worstFitness.toFixed(2), tx, ty+30);
    text('average fitness ' + info.averageFitness.toFixed(2), tx, ty+45);

    if(info.bestFitness != 1) p.reproduction();
}