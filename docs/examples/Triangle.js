//Created by Ren Yuan


const renderer = new c2.Renderer(document.getElementById('c2'));
resize();

renderer.background('#cccccc');

let random = new c2.Random();
//random.seed(0);

class Agent extends c2.Triangle{
  constructor(p1, p2, p3){
    super(p1, p2, p3);

    this.color = c2.Color.hsl(random.next(0, 30), random.next(30, 60), random.next(20, 100));
  }

  subdivide() {
    let agents = new Array(4);
    let a = this.p1.lerp(this.p2, random.next(.1, .9));
    let b = this.p2.lerp(this.p3, random.next(.1, .9));
    let c = this.p3.lerp(this.p1, random.next(.1, .9)); 
    agents[0] = new Agent(this.p1, a, c);
    agents[1] = new Agent(this.p2, b, a);
    agents[2] = new Agent(this.p3, c, b);
    agents[3] = new Agent(a, b, c);
    return agents;
  }
}

function subdivide(agent) {
  if (agent.area()<1000) return;
  agents.push(agent);

  let triangles = agent.subdivide();
  for (let i=0; i<triangles.length; i++) {
    if(random.next()<.8) subdivide(triangles[i]);
  }
}

let agents = [];
subdivide(new Agent(new c2.Point(0,0),
                    new c2.Point(renderer.width,0),
                    new c2.Point(0,renderer.height)));
subdivide(new Agent(new c2.Point(renderer.width,0),
                    new c2.Point(renderer.width,renderer.height),
                    new c2.Point(0,renderer.height)));

renderer.draw(() => {
    renderer.clear();

    let point = new c2.Point(renderer.mouse.x, renderer.mouse.y);

    for(let i=0; i<agents.length; i++){
      renderer.stroke('#333333');
      renderer.lineWidth(1);
      renderer.fill(agents[i].color);
      renderer.triangle(agents[i]);
    }
});


window.addEventListener('resize', resize);
function resize() {
    let parent = renderer.canvas.parentElement;
    renderer.size(parent.clientWidth, parent.clientWidth / 16 * 9);
}