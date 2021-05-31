//Created by Ren Yuan


const renderer = new c2.Renderer(document.getElementById('c2'));
resize();

renderer.background('#cccccc');
let random = new c2.Random();


class Agent extends c2.Rect{
    constructor() {
        let x = random.next(renderer.width);
        let y = random.next(renderer.height);
        let w = random.next(renderer.width);
        let h = random.next(renderer.height);
        super(x, y, w, h);

        this.vx = random.next(-2, 2);
        this.vy = random.next(-2, 2);
        this.color = c2.Color.hsl(random.next(0, 30), random.next(30, 60), random.next(20, 100));
    }

    update(){
        this.p.x += this.vx;
        this.p.y += this.vy;

        if (this.p.x < 0) {
            this.p.x = 0;
            this.vx *= -1;
        } else if (this.p.x > renderer.width-this.w) {
            this.p.x = renderer.width-this.w;
            this.vx *= -1;
        }
        if (this.p.y < 0) {
            this.p.y = 0;
            this.vy *= -1;
        } else if (this.p.y > renderer.height-this.h) {
            this.p.y = renderer.height-this.h;
            this.vy *= -1;
        }
    }

    display(){
        renderer.stroke('#333333');
        renderer.lineWidth(1);
        renderer.lineDash([5, 5]);
        renderer.fill(false);
        renderer.rect(this);
    }
}


let agents = [];
for (let i = 0; i < 10; i++) agents[i] = new Agent();


renderer.draw(() => {
    renderer.clear();

    for (let i = 0; i < agents.length; i++) {
        agents[i].display();
        agents[i].update();
    }

    for (let i = 0; i < agents.length-1; i++) {
        for (let j = i+1; j < agents.length; j++) {
          let rect = agents[i].intersection(agents[j]);
            if(rect!=null){
              renderer.stroke(false);
              let c = c2.Color.lerp(agents[i].color, agents[j].color, .5);
              renderer.fill(c);
              renderer.rect(rect);
            }
        }
    }
});


window.addEventListener('resize', resize);
function resize() {
    let parent = renderer.canvas.parentElement;
    renderer.size(parent.clientWidth, parent.clientWidth / 16 * 9);
}