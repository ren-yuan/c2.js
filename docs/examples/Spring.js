//Created by Ren Yuan


const renderer = new c2.Renderer(document.getElementById('c2'));
resize();

renderer.background('#cccccc');
let random = new c2.Random();


let world = new c2.World(new c2.Rect(0, 0, renderer.width, renderer.height));

createTree(createParticle(), 0);

function createParticle(){
    let x = random.next(renderer.width);
    let y = random.next(renderer.height);
    let p = new c2.Particle(x, y);
    p.radius = random.next(10, renderer.height/15);
    p.mass = p.radius
    p.color = c2.Color.hsl(random.next(0, 30), random.next(30, 60), random.next(20, 100));
    world.addParticle(p);

    return p;
}

function createTree(parent, level){
  if(level==3) return;

  for(let i=0; i<3; i++){
    let p = createParticle();

    let s = new c2.Spring(parent, p);
    s.length = (parent.radius + p.radius) * 2;
    world.addSpring(s);

    createTree(p, level+1);
  }
}


let gravitation = new c2.Gravitation(-10);
gravitation.range(10);
world.addInteractionForce(gravitation);


renderer.draw(() => {
    renderer.clear();

    world.update();

    for(let i=0; i<world.springs.length; i++){
      let s = world.springs[i];
      renderer.stroke('#333333');
      renderer.lineWidth(s.length/30);
      renderer.line(s.p1.position.x, s.p1.position.y, 
                    s.p2.position.x, s.p2.position.y);
    }

    for(let i=0; i<world.particles.length; i++){
      let p = world.particles[i];
      renderer.stroke('#333333');
      renderer.lineWidth(1);
      renderer.fill(p.color);
      renderer.circle(p.position.x, p.position.y, p.radius);
    }
});


window.addEventListener('resize', resize);
function resize() {
    let parent = renderer.canvas.parentElement;
    renderer.size(parent.clientWidth, parent.clientWidth / 16 * 9);
}