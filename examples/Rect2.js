//Created by Ren Yuan


const renderer = new c2.Renderer(document.getElementById('c2'));
resize();


renderer.background('#cccccc');
let random = new c2.Random();
let perlin = new c2.Perlin();


let data = new Array(30);
let colors = [];
for(let i=0; i<data.length; i++){
  colors[i] = c2.Color.hsl(random.next(0, 30), random.next(30, 60), random.next(20, 100));
}

renderer.draw(() => {
    renderer.clear();

    let time = renderer.frame * .01;

    for(let i=0; i<data.length; i++) data[i] = perlin.noise(i, time);

    let rect = new c2.Rect(0, 0, renderer.width, renderer.height);
    let rects = rect.split(data, 'squarify');

    renderer.stroke('#333333');
    renderer.lineWidth(1);
    for (let i=0; i<rects.length; i++) {
      renderer.fill(colors[i]);
      renderer.rect(rects[i]);
    }
});


window.addEventListener('resize', resize);
function resize() {
    let parent = renderer.canvas.parentElement;
    renderer.size(parent.clientWidth, parent.clientWidth / 16 * 9);
}