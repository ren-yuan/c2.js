//Created by Ren Yuan


const renderer = new c2.Renderer(document.getElementById('c2'));
resize();

renderer.background('#cccccc');
let random = new c2.Random();


class Agent extends c2.Point {
    constructor() {
        let x = random.next(renderer.width);
        let y = random.next(renderer.height);
        super(x, y);

        this.vx = random.next(-2, 2);
        this.vy = random.next(-2, 2);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) {
            this.x = 0;
            this.vx *= -1;
        } else if (this.x > renderer.width) {
            this.x = renderer.width;
            this.vx *= -1;
        }
        if (this.y < 0) {
            this.y = 0;
            this.vy *= -1;
        } else if (this.y > renderer.height) {
            this.y = renderer.height;
            this.vy *= -1;
        }
    }

    display() {
        renderer.stroke('#333333');
        renderer.lineWidth(5);
        renderer.point(this.x, this.y);
    }
}

let agents = new Array(20);
for (let i = 0; i < agents.length; i++) agents[i] = new Agent();

let color = c2.Color.hsl(random.next(0, 30), random.next(30, 60), 60);


renderer.draw(() => {
    renderer.clear();

    let convexHull = new c2.ConvexHull();
    convexHull.compute(agents);
    let vertices = convexHull.vertices;
    let region = convexHull.region;

    renderer.stroke('#333333');
    renderer.lineWidth(1);
    renderer.fill(color);
    renderer.polygon(region);

    for (let i = 0; i < agents.length; i++) {
        agents[i].display();
        agents[i].update();
    }
});


window.addEventListener('resize', resize);
function resize() {
    let parent = renderer.canvas.parentElement;
    renderer.size(parent.clientWidth, parent.clientWidth / 16 * 9);
}