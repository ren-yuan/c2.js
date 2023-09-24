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

let constForce = new c2.ConstForce(0, 1);
world.addForce(constForce);

let leftTop = new c2.Point(renderer.width/4, renderer.height/8*3);
let rightBottom = new c2.Point(renderer.width/4*3, renderer.height/8*5);
let rect = new c2.Rect(leftTop, rightBottom);
let rectConstraint = new c2.PolygonConstraint(rect);
world.addConstraint(rectConstraint);


renderer.draw(() => {
    renderer.clear();

    renderer.stroke('#333333');
    renderer.lineWidth(1);
    renderer.lineDash([5, 5]);
    renderer.fill(false);
    renderer.rect(rect);

    world.update();
    
    for(let i=0; i<world.particles.length; i++){
      let p = world.particles[i];
      renderer.stroke('#333333');
      renderer.lineWidth(1);
      renderer.lineDash(false);
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