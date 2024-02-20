//Created by Ren Yuan
//c2js.org

let color1;
let color2;
let color3;

let analyser;
let audioIn;

function mousePressed() {
    if(typeof audioIn === 'undefined'){
        audioIn = new c2.AudioIn(function(){
            analyser = new c2.Analyser();
            analyser.analyze(audioIn);
        });
    }
}

/*
let sound;

function mousePressed() {
    if(typeof sound === 'undefined'){
        sound = new c2.Sound("sound.mp3", function(){
            sound.loop();
            sound.play();
            analyser = new c2.Analyser();
            analyser.output();
            analyser.analyze(sound);
        });
    }
}
*/

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 100);
    textSize(16);
    textStyle(NORMAL);
    textAlign(CENTER, CENTER);

    color1 = color(random(0, 8), random(30, 60), random(20, 100));
    color2 = color(random(0, 8), random(30, 60), random(20, 100));
    color3 = color(random(0, 8), random(30, 60), random(20, 100));
}

function draw() {
    background('#cccccc');

    if(typeof analyser === 'undefined'){
        noStroke();
        fill('#333333');
        text('click to turn on microphone', width/2, height/2);
        return;
    }

    let rms = analyser.level();
    let timeDomain = analyser.timeDomain();
    let freqDomain = analyser.freqDomain();

    stroke('#333333');
    strokeWeight(1);

    fill(color1);
    let r = rms * width;
    circle(width/2, 0, r);

    fill(color2);
    beginShape();
    for(let i=0; i<timeDomain.length; i++){
        let x = map(i, 0, timeDomain.length, 0, width);
        let y = height/2 + timeDomain[i] * height/2;
        vertex(x, y);
    }
    vertex(width, height);
    vertex(0, height);
    endShape(CLOSE);

    fill(color3);
    beginShape();
    for(let i=0; i<freqDomain.length; i++){
        let x = map(i, 0, freqDomain.length, 0, width);
        let y = height - freqDomain[i] * height/2;
        vertex(x, y);
    }
    vertex(width, height);
    vertex(0, height);
    endShape(CLOSE);
}