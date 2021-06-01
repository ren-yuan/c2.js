//Created by Ren Yuan


const renderer = new c2.Renderer(document.getElementById('c2'));
resize();

renderer.background('#cccccc');
renderer.fontSize(16);
renderer.fontWeight('normal');
renderer.textAlign('center');
renderer.textBaseline('middle');
let random = new c2.Random();

color1 = c2.Color.hsl(random.next(0, 30), random.next(30, 60), random.next(20, 100));
color2 = c2.Color.hsl(random.next(0, 30), random.next(30, 60), random.next(20, 100));
color3 = c2.Color.hsl(random.next(0, 30), random.next(30, 60), random.next(20, 100));



let analyser;

let audioIn;

renderer.on('mousedown', () => {
    if(typeof audioIn === 'undefined'){
        audioIn = new c2.AudioIn(function(){
            analyser = new c2.Analyser();
            analyser.analyze(audioIn);
        });
    }
});

/*
let sound;

renderer.on('mousedown', () => {
    if(typeof sound === 'undefined'){
        sound = new c2.Sound("sound.mp3", function(){
            sound.loop();
            sound.play();
            analyser = new c2.Analyser();
            analyser.output();
            analyser.analyze(sound);
        });
    }
});
*/

renderer.draw(() => {
    renderer.clear();

    if(typeof analyser === 'undefined'){
        renderer.stroke(false);
        renderer.fill('#333333');
        renderer.text('click to turn on microphone', renderer.width/2, renderer.height/2);
        return;
    }

    let rms = analyser.level();
    let timeDomain = analyser.timeDomain();
    let freqDomain = analyser.freqDomain();

    renderer.stroke('#333333');
    renderer.lineWidth(1);

    renderer.fill(color1);
    let r = rms*renderer.width;
    renderer.circle(renderer.width/2, 0, r);

    renderer.fill(color2);
    renderer.beginPath();
    for(let i=0; i<timeDomain.length; i++){
        let x = c2.map(i, 0, timeDomain.length, 0, renderer.width);
        let y = renderer.height/2 + timeDomain[i] * renderer.height/2;
        renderer.lineTo(x, y);
    }
    renderer.lineTo(renderer.width, renderer.height);
    renderer.lineTo(0, renderer.height);
    renderer.endPath(true);

    renderer.fill(color3);
    renderer.beginPath();
    for(let i=0; i<freqDomain.length; i++){
        let x = c2.map(i, 0, freqDomain.length, 0, renderer.width);
        let y = renderer.height - freqDomain[i] * renderer.height/2;
        renderer.lineTo(x, y);
    }
    renderer.lineTo(renderer.width, renderer.height);
    renderer.lineTo(0, renderer.height);
    renderer.endPath(true);
});


window.addEventListener('resize', resize);
function resize() {
    let parent = renderer.canvas.parentElement;
    renderer.size(parent.clientWidth, parent.clientWidth / 16 * 9);
}