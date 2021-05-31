//Created by Ren Yuan


const renderer = new c2.Renderer(document.getElementById('c2'));
resize();

renderer.background('#cccccc');
renderer.fontSize(12);
renderer.fontWeight('normal');
renderer.textAlign('left');
renderer.textBaseline('top');

let random = new c2.Random();


let target = [
    1,2, 3,2, 3,3, 2,3, 2,6, 3,6, 3,7, 1,7,
    4,2, 6,2, 6,5, 5,5, 5,6, 6,6, 6,7, 4,7, 4,4, 5,4, 5,3, 4,3,
    7,6, 8,6, 8,7, 7,7,
    10,2, 11,2, 11,7, 9,7, 9,6, 10,6,
    12,2, 14,2, 14,3, 13,3, 13,4, 14,4, 14,7, 12,7, 12,6, 13,6, 13,5, 12,5
];

let splitPoints = [14, 38, 46, 58, 82];

let colors = [];
for(let i=0; i<5; i++){
    colors[i] = c2.Color.hsl(random.next(0, 30), random.next(30, 60), random.next(20, 100));
}

function fitness(chromosome){
    let score = 0;

    for (let i = 0; i < chromosome.genes.length; i++) {
        if (chromosome.genes[i] == target[i]) score++;
    }
    
    chromosome.fitness = score / chromosome.genes.length;
}


let chromosomes = [];
for(let i=0; i<50; i++) {
    let c = new c2.Chromosome();
    c.initInteger(target.length, -1, 16);
    chromosomes.push(c);
}

let p = new c2.Population(chromosomes, .9, .01, fitness);
p.setElitism(5);
p.setSelection('tournament', 5);
p.setCrossover('two_point');
p.setMutation('random');




renderer.draw(() => {
    renderer.clear();
    
    let info = p.fitness();
    let best = info.bestChromosome;


    let count = 0;
    renderer.stroke('#333333');
    renderer.lineWidth(1);

    let spline = new c2.Spline();
    let w = renderer.width/16;
    for (let i = 0; i < best.genes.length; i+=2) {
        let x = w/2 + best.genes[i] * w;
        let y = best.genes[i+1] * w;
        spline.add(x, y);
        if(splitPoints.indexOf(i)!=-1){
            renderer.fill(colors[count++]);
            spline.compute('closed');
            renderer.polygon(spline.vertices);
            spline.clear();
        }
    }


    let tx = 20;
    let ty = 20;
    renderer.stroke(false);
    renderer.fill('#333333'); 
    renderer.text('generation ' + info.generation, tx, ty);
    renderer.text('best fitness ' + info.bestFitness.toFixed(2), tx, ty+15);
    renderer.text('worst fitness ' + info.worstFitness.toFixed(2), tx, ty+30);
    renderer.text('average fitness ' + info.averageFitness.toFixed(2), tx, ty+45);

    if(info.bestFitness != 1) p.reproduction();
});


window.addEventListener('resize', resize);
function resize() {
    let parent = renderer.canvas.parentElement;
    renderer.size(parent.clientWidth, parent.clientWidth / 16 * 9);
}