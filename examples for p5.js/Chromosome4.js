//Created by Ren Yuan
//c2js.org

let target = [
    1,2, 3,2, 3,3, 2,3, 2,6, 3,6, 3,7, 1,7,
    4,2, 6,2, 6,5, 5,5, 5,6, 6,6, 6,7, 4,7, 4,4, 5,4, 5,3, 4,3,
    7,6, 8,6, 8,7, 7,7,
    10,2, 11,2, 11,7, 9,7, 9,6, 10,6,
    12,2, 14,2, 14,3, 13,3, 13,4, 14,4, 14,7, 12,7, 12,6, 13,6, 13,5, 12,5
];

let splitPoints = [14, 38, 46, 58, 82];
let colors = [];

let chromosomes = [];
let p;

function fitness(chromosome){
    let score = 0;

    for (let i = 0; i < chromosome.genes.length; i++) {
        if (chromosome.genes[i] == target[i]) score++;
    }
    
    chromosome.fitness = score / chromosome.genes.length;
}

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 100);
    textSize(12);
    textStyle(NORMAL);
    textAlign(LEFT, TOP);

    for(let i=0; i<5; i++){
        colors[i] = color(random(0, 8), random(30, 60), random(20, 100));
    }

    for(let i=0; i<50; i++) {
        let c = new c2.Chromosome();
        c.initInteger(target.length, -1, 16);
        chromosomes.push(c);
    }

    p = new c2.Population(chromosomes, .9, .01, fitness);
    p.setElitism(5);
    p.setSelection('tournament', 5);
    p.setCrossover('two_point');
    p.setMutation('random');
}


function draw() {
    background('#cccccc');
    
    let info = p.fitness();
    let best = info.bestChromosome;

    let count = 0;
    stroke('#333333');
    strokeWeight(1);

    let spline = new c2.Spline();
    let w = width/16;
    for (let i = 0; i < best.genes.length; i+=2) {
        let x = w/2 + best.genes[i] * w;
        let y = best.genes[i+1] * w;
        spline.add(x, y);
        if(splitPoints.indexOf(i)!=-1){
            fill(colors[count++]);
            spline.compute('closed');
            drawPolygon(spline.vertices);
            spline.clear();
        }
    }

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

function drawPolygon(vertices) {
    beginShape();
    for (let v of vertices) vertex(v.x, v.y);
    endShape(CLOSE);
}