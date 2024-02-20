//Created by Ren Yuan
//c2js.org

let circles = new Array(50);
let chromosomes = [];
let p;

function decode(chromosome){
    for(let i=0; i<circles.length; i++){
        let c = circles[i];
        c.p.x = c2.map(chromosome.genes[i], 0, 1, 0, width);
        c.p.y = c2.map(chromosome.genes[circles.length+i], 0, 1, 0, height);
    }
}

function fitness(chromosome){
    let score = 0;

    decode(chromosome);
    for(let i=0; i<circles.length-1; i++){
        let c1 = circles[i];
        for(let j=i+1; j<circles.length; j++){
            let c2 = circles[j];
            if(c1.intersects(c2)) score++;
        }
    }

    chromosome.fitness = 1/(score+1);
}

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 100);
    ellipseMode(RADIUS);
    textSize(12);
    textStyle(NORMAL);
    textAlign(LEFT, TOP);

    for(let i=0; i<circles.length; i++){
        let x = random(width);
        let y = random(height);
        let r = random(10, height/12);
        circles[i] = new c2.Circle(x, y, r);
        circles[i].color = color(random(0, 8), random(30, 60), random(20, 100));
    }

    for(let i=0; i<10; i++) {
        let c = new c2.Chromosome();
        c.initFloat(circles.length*2, 0, 1);
        chromosomes.push(c);
    }

    p = new c2.Population(chromosomes, .9, .01, fitness);
    p.setSelection('tournament', 5);
    p.setCrossover('single_point');
    p.setMutation('random');
}

function draw() {
    background('#cccccc');
    
    let info = p.fitness();

    let best = info.bestChromosome;
    decode(best);
    for(let i=0; i<circles.length; i++){
        stroke('#333333');
        strokeWeight(1);
        fill(circles[i].color);
        circle(circles[i].p.x, circles[i].p.y, circles[i].r);
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