//Created by Ren Yuan


const renderer = new c2.Renderer(document.getElementById('c2'));
resize();

renderer.background('#cccccc');
renderer.fontSize(12);
renderer.fontWeight('normal');
renderer.textAlign('left');
renderer.textBaseline('top');

let random = new c2.Random();

let circles = new Array(50);
for(let i=0; i<circles.length; i++){
    let x = random.next(renderer.width);
    let y = random.next(renderer.height);
    let r = random.next(10, renderer.height/12);
    circles[i] = new c2.Circle(x, y, r);
    circles[i].color = c2.Color.hsl(random.next(0, 30), random.next(30, 60), random.next(20, 100));
}

function decode(chromosome){
    for(let i=0; i<circles.length; i++){
        let c = circles[i];
        c.p.x = c2.map(chromosome.genes[i], 0, 1, 0, renderer.width);
        c.p.y = c2.map(chromosome.genes[circles.length+i], 0, 1, 0, renderer.height);
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


let chromosomes = [];
for(let i=0; i<10; i++) {
    let c = new c2.Chromosome();
    c.initFloat(circles.length*2, 0, 1);
    chromosomes.push(c);
}

let p = new c2.Population(chromosomes, .9, .01, fitness);
p.setSelection('tournament', 5);
p.setCrossover('single_point');
p.setMutation('random');




renderer.draw(() => {
    renderer.clear();
    
    let info = p.fitness();

    let best = info.bestChromosome;
    decode(best);
    for(let i=0; i<circles.length; i++){
        renderer.stroke('#333333');
        renderer.lineWidth(1);
        renderer.fill(circles[i].color);
        renderer.circle(circles[i]);
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