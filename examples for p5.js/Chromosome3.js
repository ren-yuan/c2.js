//Created by Ren Yuan
//c2js.org

let hullColor;

let points = [];
let chromosomes = [];
let p;

function fitness(chromosome){
    let score = 0;
    for (let i = 0; i < chromosome.genes.length; i++) {
        let p1 = points[chromosome.genes[i]];
        let p2 = points[chromosome.genes[(i+1)%chromosome.genes.length]];
        score += p1.distance(p2);
    }
    score = 1/score;

    chromosome.fitness = score;
}

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 100);
    textSize(12);
    textStyle(NORMAL);
    textAlign(LEFT, TOP);

    hullColor = color(random(0, 8), random(30, 60), 60);

    for(let i=0; i<10; i++){
        let x = random(width);
        let y = random(height);
        points[i] = new c2.Point(x, y);
    }

    for(let i=0; i<100; i++) {
        let c = new c2.Chromosome();
        c.initPermutation(points.length);
        chromosomes.push(c);
    }

    p = new c2.Population(chromosomes, .7, .1, fitness);
    p.setElitism(2);
    p.setCrossover('pmx');
    p.setMutation('exchange');
}

function draw() {
    background('#cccccc');
    
    let info = p.fitness();

    let best = info.bestChromosome;

    stroke('#333333');
    strokeWeight(1);
    fill(hullColor);
  
    beginShape();
    for (let i = 0; i < best.genes.length; i++) {
        let p = points[best.genes[i]];
        vertex(p.x, p.y);
    }
    endShape(CLOSE);
    
    for(let i=0; i<points.length; i++){
        stroke('#333333');
        strokeWeight(5);
        point(points[i].x, points[i].y);
    }

    let tx = 20;
    let ty = 20;
    noStroke();
    fill('#333333'); 
    text('generation ' + info.generation, tx, ty);
    text('best fitness ' + info.bestFitness.toFixed(4), tx, ty+15);
    text('worst fitness ' + info.worstFitness.toFixed(4), tx, ty+30);
    text('average fitness ' + info.averageFitness.toFixed(4), tx, ty+45);

    if(info.generation < 100) p.reproduction();   
}