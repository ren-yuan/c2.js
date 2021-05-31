//Created by Ren Yuan


const renderer = new c2.Renderer(document.getElementById('c2'));
resize();

renderer.background('#cccccc');
let random = new c2.Random();


let world = new c2.World(new c2.Rect(0, 0, renderer.width, renderer.height));

for(let i=0; i<100; i++){
  let x = random.next(renderer.width);
  let y = random.next(renderer.height);
  let p = new c2.Particle(x, y);
  p.radius = random.next(10, renderer.height/14);
  p.color = c2.Color.hsl(random.next(0, 30), random.next(30, 60), random.next(20, 100));

  world.addParticle(p);
}

let collision = new c2.Collision();
world.addInteractionForce(collision);

let pointField = new c2.PointField(new c2.Point(renderer.width/2, renderer.height/2), 1);
world.addForce(pointField);


renderer.draw(() => {
    renderer.clear();

    let time = renderer.frame * .01;

    world.update();

    for(let i=0; i<world.particles.length; i++){
      let p = world.particles[i];
      renderer.stroke('#333333');
      renderer.lineWidth(1);
      renderer.fill(p.color);
      renderer.circle(p.position.x, p.position.y, p.radius);
      renderer.lineWidth(2);
      renderer.point(p.position.x, p.position.y);
    }
});


window.addEventListener('resize', resize);
function resize() {
    let parent = renderer.canvas.parentElement;
    renderer.size(parent.clientWidth, parent.clientWidth / 16 * 9);
}