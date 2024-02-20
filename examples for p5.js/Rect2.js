//Created by Ren Yuan
//c2js.org

let data = new Array(30);
let colors = [];

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 100);
    
    for(let i=0; i<data.length; i++){
        colors[i] = color(random(0, 8), random(30, 60), random(20, 100));
    }
}

function draw() {
    background('#cccccc');

    for(let i=0; i<data.length; i++) data[i] = noise(i, frameCount * .01);

    let rectangle = new c2.Rect(0, 0, width, height);
    let rects = rectangle.split(data, 'squarify');

    stroke('#333333');
    strokeWeight(1);
    for (let i=0; i<rects.length; i++) {
        fill(colors[i]);
        rect(rects[i].p.x, rects[i].p.y, rects[i].w, rects[i].h);
    }
}