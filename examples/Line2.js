//Created by Ren Yuan


const renderer = new c2.Renderer(document.getElementById('c2'));
resize();

renderer.background('#cccccc');
let random = new c2.Random();


class Agent extends c2.Line {
    constructor() {
        let x1 = random.next(renderer.width);
        let y1 = random.next(renderer.height);
        let x2 = random.next(renderer.width);
        let y2 = random.next(renderer.height);
        super(x1, y1, x2, y2);

        this.v1 = new c2.Vector(random.next(-5, 5), random.next(-5, 5));
        this.v2 = new c2.Vector(random.next(-5, 5), random.next(-5, 5));
        this.weight = random.next(1, 5);
        this.color = c2.Color.hsl(random.next(0, 30), random.next(30, 60), random.next(20, 100));
    }

    update(){
        this.bounce(this.p1, this.v1);
        this.bounce(this.p2, this.v2);
    }

    bounce(p, v){
        p.x += v.x;
        p.y += v.y;

        if (p.x < 0) {
            p.x = 0;
            v.x *= -1;
        } else if (p.x > renderer.width) {
            p.x = renderer.width;
            v.x *= -1;
        }
        if (p.y < 0) {
            p.y = 0;
            v.y *= -1;
        } else if (p.y > renderer.height) {
            p.y = renderer.height;
            v.y *= -1;
        }
    }
}

let agents = [];
for (let i = 0; i < 15; i++) agents[i] = new Agent();


renderer.draw(() => {
    renderer.clear();

    for (let i = 0; i < agents.length; i++) {
        agents[i].update();
    }

    let n = 30;
    for (let i = 0; i < agents.length-1; i++) {
        for (let j = 0; j < n; j++) {
            let t = c2.norm(j, 0, n);
            let c = c2.Color.lerp(agents[i].color, agents[i+1].color, t);
            let w = c2.lerp(agents[i].weight, agents[i+1].weight, t);
            let l = agents[i].lerp(agents[i+1], t);
            renderer.stroke(c);
            renderer.lineWidth(w);
            renderer.line(l);
        }
    }
});


window.addEventListener('resize', resize);
function resize() {
    let parent = renderer.canvas.parentElement;
    renderer.size(parent.clientWidth, parent.clientWidth / 16 * 9);
}