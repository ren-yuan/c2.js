//Created by Ren Yuan


const renderer = new c2.Renderer(document.getElementById('c2'));
resize();

renderer.background('#cccccc');
let random = new c2.Random();


class Agent extends c2.Point {
    constructor(x, y) {
        super(x, y);

        this.weight = random.next(1, 5);
        this.color = c2.Color.hsl(random.next(0, 30), random.next(30, 60), random.next(20, 100), .5);
    }
}

let agents = new Array(10);
for (let i = 0; i < agents.length; i++) {
    let x = random.next(renderer.width);
    let y = random.next(renderer.height);
    agents[i] = new Agent(x, y);
}


renderer.draw(() => {
    for (let i = 0; i < agents.length; i++) {
        let next = (i+1) % agents.length;
        agents[i].rotate(.01, agents[next]);

        renderer.stroke(agents[i].color);
        renderer.lineWidth(agents[i].weight);
        renderer.line(agents[i].x, agents[i].y, agents[next].x, agents[next].y);

        renderer.stroke('#333333');
        renderer.point(agents[i].x, agents[i].y);
    }
});


window.addEventListener('resize', resize);
function resize() {
    let parent = renderer.canvas.parentElement;
    renderer.size(parent.clientWidth, parent.clientWidth / 16 * 9);
}