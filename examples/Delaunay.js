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


renderer.draw(() => {
    renderer.clear();

    let delaunay = new c2.Delaunay();
    delaunay.compute(agents);
    let vertices = delaunay.vertices;
    let edges = delaunay.edges;
    let triangles = delaunay.triangles;

    let maxArea = 0;
    let minArea = Number.POSITIVE_INFINITY;
    for (let i = 0; i < triangles.length; i++) {
        let area = triangles[i].area();
        if(area < minArea) minArea = area;
        if(area > maxArea) maxArea = area;
    }

    renderer.stroke('#333333');
    renderer.lineWidth(1);
    for (let i = 0; i < triangles.length; i++) {
        let t = c2.norm(triangles[i].area(), minArea, maxArea);
        let color = c2.Color.hsl(30*t, 30+30*t, 20+80*t);
        renderer.fill(color);
        renderer.triangle(triangles[i]);
    }
    

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