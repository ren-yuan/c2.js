//Created by Ren Yuan


const renderer = new c2.Renderer(document.getElementById('c2'));
resize();


renderer.background('#cccccc');
renderer.fontSize(12);
renderer.fontWeight('normal');
renderer.textAlign('left');
renderer.textBaseline('top');

let random = new c2.Random();
let color = c2.Color.hsl(random.next(0, 30), random.next(30, 60), 60);


let points = [];

for(let i=0; i<10; i++){
    let x = random.next(renderer.width);
    let y = random.next(renderer.height);
    points[i] = new c2.Point(x, y);
}


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


let chromosomes = [];
for(let i=0; i<100; i++) {
    let c = new c2.Chromosome();
    c.initPermutation(points.length);
    chromosomes.push(c);
}

let p = new c2.Population(chromosomes, .7, .1, fitness);
p.setElitism(2);
p.setCrossover('pmx');
p.setMutation('exchange');



renderer.draw(() => {
    renderer.clear();
    
    let info = p.fitness();

    let best = info.bestChromosome;

    renderer.stroke('#333333');
    renderer.lineWidth(1);
    renderer.fill(color);
    renderer.beginPath();
    for (let i = 0; i < best.genes.length; i++) {
        let p = points[best.genes[i]];
        renderer.lineTo(p.x, p.y);
    }
    renderer.endPath(true);

    
    for(let i=0; i<points.length; i++){
        renderer.stroke('#333333');
        renderer.lineWidth(5);
        renderer.point(points[i]);
    }

    let tx = 20;
    let ty = 20;
    renderer.stroke(false);
    renderer.fill('#333333'); 
    renderer.text('generation ' + info.generation, tx, ty);
    renderer.text('best fitness ' + info.bestFitness.toFixed(4), tx, ty+15);
    renderer.text('worst fitness ' + info.worstFitness.toFixed(4), tx, ty+30);
    renderer.text('average fitness ' + info.averageFitness.toFixed(4), tx, ty+45);


    if(info.generation < 100) p.reproduction();
    
});


window.addEventListener('resize', resize);
function resize() {
    let parent = renderer.canvas.parentElement;
    renderer.size(parent.clientWidth, parent.clientWidth / 16 * 9);
}