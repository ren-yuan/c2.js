//Created by Ren Yuan


const renderer = new c2.Renderer(document.getElementById('c2'));
resize();

renderer.background('#cccccc');
let random = new c2.Random();


class Agent extends c2.Circle{
    constructor() {
        let x = random.next(renderer.width);
        let y = random.next(renderer.height);
        let r = random.next(10, renderer.width/15);
        super(x, y, r);

        this.vx = random.next(-2, 2);
        this.vy = random.next(-2, 2);
        this.color = c2.Color.hsl(random.next(0, 30), random.next(30, 60), random.next(20, 100));
    }

    update(){
        this.p.x += this.vx;
        this.p.y += this.vy;

        if (this.p.x < this.r) {
            this.p.x = this.r;
            this.vx *= -1;
        } else if (this.p.x > renderer.width-this.r) {
            this.p.x = renderer.width-this.r;
            this.vx *= -1;
        }
        if (this.p.y < this.r) {
            this.p.y = this.r;
            this.vy *= -1;
        } else if (this.p.y > renderer.height-this.r) {
            this.p.y = renderer.height-this.r;
            this.vy *= -1;
        }
    }

    display(){
        renderer.stroke(false);
        renderer.fill(this.color);
        renderer.circle(this);
    }

    bounds(){
      return this;
    }
}

let agents = [];
for (let i = 0; i < 25; i++) agents[i] = new Agent();


let quadTree = new c2.QuadTree(new c2.Rect(0,0,renderer.width,renderer.height), 1);

function drawQuadTree(quadTree){
    renderer.stroke('#333333');
    renderer.lineWidth(1);
    renderer.fill(false);
    renderer.rect(quadTree.bounds);

    if(quadTree.leaf()) return;
    for(let i=0; i<4; i++) drawQuadTree(quadTree.children[i]);
}

let circle = new c2.Circle(0, 0, renderer.width/10);


renderer.draw(() => {
    renderer.clear();

    quadTree.clear();
    quadTree.insert(agents);

    drawQuadTree(quadTree);


    for (let i = 0; i < agents.length; i++) {
        agents[i].update();
        agents[i].display();
    }


    let mouse = new c2.Point(renderer.mouse.x, renderer.mouse.y);
    circle.p = mouse;

    renderer.stroke('#000000');
    renderer.lineWidth(1);
    renderer.lineDash([5, 5]);
    renderer.fill(false);
    renderer.circle(circle);
    renderer.lineDash(false);

    let objects = quadTree.query(circle);

    for(let i=0; i<objects.length; i++){
        renderer.stroke('#000000');
        renderer.lineWidth(1);
        renderer.fill(false);
        renderer.circle(objects[i]);
    }
});


window.addEventListener('resize', resize);
function resize() {
    let parent = renderer.canvas.parentElement;
    renderer.size(parent.clientWidth, parent.clientWidth / 16 * 9);
}
