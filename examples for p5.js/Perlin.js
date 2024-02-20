//Created by Ren Yuan


let perlin = new c2.Perlin();
//perlin.detail(4, .5);
//perlin.seed(0);

let row = 20;
let col = 10;

function setup() {
    createCanvas(960, 540, WEBGL);
    colorMode(HSL, 100);
}

function draw() {
      translate(-width/2, -height/2);
    background('#cccccc');
  
    let start = frameCount * .01;

    stroke('#333333');
    strokeWeight(1);
    for (let i=0; i<row; i++) {
        let t = norm(i, 0, row);
        let c = color(8*t, 30+30*t, 20+70*t);
        fill(c);
        beginShape();
        for (let j=0; j<col; j++) {
            let x = map(j, 0, col-1, 0, width);
            let y = map(i, 0, row, height/3, height)
            + (perlin.noise(start+j*.1, start+i*.04)-.5)
            * height*2;
            vertex(x, y);
        }
        vertex(width, height);
        vertex(0, height);
        endShape(CLOSE);
    }
}