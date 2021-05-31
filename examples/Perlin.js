//Created by Ren Yuan


const renderer = new c2.Renderer(document.getElementById('c2'));
resize();

renderer.background('#cccccc');
let perlin = new c2.Perlin();
//perlin.detail(4, .5);
//perlin.seed(0);


let row = 20;
let col = 10;

renderer.draw(() => {
    renderer.clear();

    let time = renderer.frame * .01;

    renderer.stroke('#333333');
    renderer.lineWidth(1);
    for (let i=0; i<row; i++) {
      let t = c2.norm(i, 0, row);
      let c = c2.Color.hsl(30*t, 30+30*t, 20+70*t);
      renderer.fill(c);
      renderer.beginPath();
      for (let j=0; j<col; j++) {
        let x = c2.map(j, 0, col-1, 0, renderer.width);
        let y = c2.map(i, 0, row, renderer.height/3, renderer.height)
          + (perlin.noise(time+j*.1, time+i*.04)-.5)
          * renderer.height*2;
        renderer.lineTo(x, y);
      }
      renderer.lineTo(renderer.width, renderer.height);
      renderer.lineTo(0, renderer.height);
      renderer.endPath(true);
    }
});


window.addEventListener('resize', resize);
function resize() {
    let parent = renderer.canvas.parentElement;
    renderer.size(parent.clientWidth, parent.clientWidth / 16 * 9);
}