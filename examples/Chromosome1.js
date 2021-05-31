//Created by Ren Yuan


const renderer = new c2.Renderer(document.getElementById('c2'));
resize();


renderer.background('#cccccc');


let random = new c2.Random();
let color = c2.Color.hsl(random.next(0, 30), random.next(30, 60), 60);


let target = ['h','e','l','l','o',' ', 'w','o','r','l','d'];

function fitness(chromosome){
    let score = 0;

    for (let i = 0; i < chromosome.genes.length; i++) {
        if (String.fromCharCode(chromosome.genes[i]) == target[i]) score++;
    }
    
    chromosome.fitness = score / chromosome.genes.length;
}


let chromosomes = [];
for(let i=0; i<300; i++) {
    let c = new c2.Chromosome();
    c.initInteger(target.length, 32, 126);
    chromosomes.push(c);
}

let p = new c2.Population(chromosomes, .7, .01, fitness);
p.setCrossover('two_point');
p.setMutation('random');




renderer.draw(() => {
    renderer.clear();

    renderer.stroke(false);
    renderer.fill(color);
    renderer.rect(0, 0, renderer.width/2, renderer.height);
    
    let info = p.fitness();

    
    renderer.fontSize(12);
    renderer.fontWeight('normal');
    renderer.textAlign('left');
    renderer.textBaseline('top');
    renderer.stroke(false);
    renderer.fill('#333333');
    let x = renderer.width / 2 + 20;
    let y = 20;
    for (let i = 0; i < p.chromosomes.length; i++) {
        let text = p.chromosomes[i].toString(true);
        renderer.text(text, x, y);
        y += 20;
        if (y > renderer.height - 20) {
            x += 80;
            y = 20;
        }
    }


    let tx = 20;
    let ty = 20;
    renderer.fill('#333333'); 
    renderer.text('generation ' + info.generation, tx, ty);
    renderer.text('best fitness ' + info.bestFitness.toFixed(2), tx, ty+15);
    renderer.text('worst fitness ' + info.worstFitness.toFixed(2), tx, ty+30);
    renderer.text('average fitness ' + info.averageFitness.toFixed(2), tx, ty+45);


    let best = info.bestChromosome;
    renderer.fontSize(renderer.width/8);
    renderer.fontWeight('bolder');
    renderer.textAlign('center');
    renderer.textBaseline('middle');
    renderer.fill('#333333');
    renderer.text(best.toString(true), renderer.width / 2, renderer.height / 2);


    if(info.bestFitness != 1) p.reproduction();
    
});


window.addEventListener('resize', resize);
function resize() {
    let parent = renderer.canvas.parentElement;
    renderer.size(parent.clientWidth, parent.clientWidth / 16 * 9);
}