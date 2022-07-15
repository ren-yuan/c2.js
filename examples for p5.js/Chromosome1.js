//Created by Ren Yuan


let rectColor;

let target = ['h','e','l','l','o',' ', 'w','o','r','l','d'];
let chromosomes = [];
let p;

function fitness(chromosome){
    let score = 0;

    for (let i = 0; i < chromosome.genes.length; i++) {
        if (String.fromCharCode(chromosome.genes[i]) == target[i]) score++;
    }
    
    chromosome.fitness = score / chromosome.genes.length;
}

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 360, 100, 100);
    rectColor = color(random(0, 30), random(30, 60), 60);

    for(let i=0; i<300; i++) {
        let c = new c2.Chromosome();
        c.initInteger(target.length, 32, 126);
        chromosomes.push(c);
    }

    p = new c2.Population(chromosomes, .7, .01, fitness);
    p.setCrossover('two_point');
    p.setMutation('random');
}

function draw() {
    background('#cccccc');

    noStroke();
    fill(rectColor);
    rect(0, 0, width/2, height);
    
    let info = p.fitness();

    textSize(12);
    textStyle(NORMAL);
    textAlign(LEFT, TOP);
    noStroke();
    fill('#333333');
    let x = width / 2 + 20;
    let y = 20;
    for (let i = 0; i < p.chromosomes.length; i++) {
        let string = p.chromosomes[i].toString(true);
        text(string, x, y);
        y += 20;
        if (y > height - 20) {
            x += 80;
            y = 20;
        }
    }

    let tx = 20;
    let ty = 20;
    fill('#333333'); 
    text('generation ' + info.generation, tx, ty);
    text('best fitness ' + info.bestFitness.toFixed(2), tx, ty+15);
    text('worst fitness ' + info.worstFitness.toFixed(2), tx, ty+30);
    text('average fitness ' + info.averageFitness.toFixed(2), tx, ty+45);

    let best = info.bestChromosome;
    textSize(width/8);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    fill('#333333');
    text(best.toString(true), width / 2, height / 2);

    if(info.bestFitness != 1) p.reproduction();
}