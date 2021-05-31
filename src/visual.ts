//Created by Ren Yuan


import { Point, Line, Arc, Polyline, Spline, Sector, Circle, Triangle, Rect, Polygon, CellVertex, Cell } from "./geometry";


export class Renderer {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    width: number;
    height: number;
    frame: number = 0;
    mouse = { px: 0, py: 0, x: 0, y: 0, press: false, over: false, out: false, move: false, down: false, up: false, click: false, dblclick: false };

    private _mouseover;
    private _mouseout;
    private _mousemove;
    private _mousedown;
    private _mouseup;
    private _click;
    private _dblclick;

    private _draw;
    private _loop = true;

    private _stroke = true;
    private _fill = true;

    private _font = { style: 'normal', weight: 'normal', size: 12, family: 'sans-serif' };

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this._mouseover = this.mouseover.bind(this);
        this._mouseout = this.mouseout.bind(this);
        this._mousemove = this.mousemove.bind(this);
        this._mousedown = this.mousedown.bind(this);
        this._mouseup = this.mouseup.bind(this);
        this._click = this.click.bind(this);
        this._dblclick = this.dblclick.bind(this);

        this.onMouse();
    }

    size(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.canvas.width = w;
        this.canvas.height = h;
    }

    background(c: string) {
        this.canvas.style.background = c;
    }


    on(event: string, f: EventListener, options: any = false) {
        this.canvas.addEventListener(event, f, options);
    }

    off(event: string, f: EventListener) {
        this.canvas.removeEventListener(event, f);
    }

    onMouse(mouse: boolean = true) {
        if (mouse) {
            this.canvas.addEventListener('mouseover', this._mouseover.bind(this), false);
            this.canvas.addEventListener('mouseout', this._mouseout.bind(this), false);
            this.canvas.addEventListener('mousemove', this._mousemove.bind(this), false);
            this.canvas.addEventListener('mousedown', this._mousedown.bind(this), false);
            this.canvas.addEventListener('mouseup', this._mouseup.bind(this), false);
            this.canvas.addEventListener('click', this._click.bind(this), false);
            this.canvas.addEventListener('dblclick', this._dblclick.bind(this), false);
        } else {
            this.canvas.removeEventListener('mouseover', this._mouseover.bind(this), false);
            this.canvas.removeEventListener('mouseout', this._mouseout.bind(this), false);
            this.canvas.removeEventListener('mousemove', this._mousemove.bind(this), false);
            this.canvas.removeEventListener('mousedown', this._mousedown.bind(this), false);
            this.canvas.removeEventListener('mouseup', this._mouseup.bind(this), false);
            this.canvas.removeEventListener('click', this._click.bind(this), false);
            this.canvas.removeEventListener('dblclick', this._dblclick.bind(this), false);
        }
    }

    private mouseover(e: MouseEvent) {
        this.mouse.over = true;
    }
    private mouseout(e: MouseEvent) {
        this.mouse.out = true;
    }
    private mousemove(e: MouseEvent) {
        this.mouse.move = true;
        this.mouse.px = this.mouse.x;
        this.mouse.py = this.mouse.y;
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
    }
    private mousedown(e: MouseEvent) {
        this.mouse.down = true;
        this.mouse.press = true;
    }
    private mouseup(e: MouseEvent) {
        this.mouse.up = true;
        this.mouse.press = false;
    }
    private click(e: MouseEvent) {
        this.mouse.click = true;
    }
    private dblclick(e: MouseEvent) {
        this.mouse.dblclick = true;
    }


    draw(f: Function) {
        this._draw = f;
        this.animation();
    }

    loop(loop: boolean = true) {
        if (loop) {
            if (this._loop) return;
            this._loop = true;
            this.animation();
        } else {
            this._loop = false;
        }
    }

    private animation() {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this._draw();
        this.mouse.over = false;
        this.mouse.out = false;
        this.mouse.move = false;
        this.mouse.down = false;
        this.mouse.up = false;
        this.mouse.click = false;
        this.mouse.dblclick = false;
        this.frame++;
        if (this._loop) window.requestAnimationFrame(this.animation.bind(this));
    }





    alpha(a: number) {
        this.context.globalAlpha = a;
    }

    clear(): void;
    clear(c: string): void;
    clear() {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        if (arguments.length == 1) {
            const fill = this.context.fillStyle;
            this.context.fillStyle = arguments[0];
            this.context.fillRect(0, 0, this.width, this.height);
            this.context.fillStyle = fill;
        } else {
            this.context.clearRect(0, 0, this.width, this.height);
        }
    }

    stroke(c: string | boolean = true) {
        if (typeof c == 'boolean') {
            this._stroke = c;
        } else {
            this._stroke = true;
            this.context.strokeStyle = c;
        }
    }

    lineWidth(w: number) {
        this.context.lineWidth = w;
    }

    lineCap(cap: CanvasLineCap) { //butt (default), round, square
        this.context.lineCap = cap;
    }

    lineJoin(join: CanvasLineJoin) { //round, bevel, miter (default)
        this.context.lineJoin = join;
    }

    lineDash(segments: number[] | boolean) {
        if (typeof segments == 'boolean') {
            this.context.setLineDash([]);
        } else {
            this.context.setLineDash(segments);
        }
    }

    dashOffset(offset: number) {
        this.context.lineDashOffset = offset;
    }

    fill(c: string | boolean = true) {
        if (typeof c == 'boolean') {
            this._fill = c;
        } else {
            this._fill = true;
            this.context.fillStyle = c;
        }
    }




    point(p: Point);
    point(x: number, y: number);
    point() {
        if (!this._stroke) return;

        let x, y;
        if (arguments[0] instanceof Point) {
            [x, y] = [arguments[0].x, arguments[0].y];
        } else if (arguments.length == 2) {
            [x, y] = [arguments[0], arguments[1]];
        } else {
            return;
        }

        const fill = this.context.fillStyle;
        this.context.fillStyle = this.context.strokeStyle;
        this.context.beginPath();
        this.context.arc(x, y, this.context.lineWidth * 0.5, 0, 2 * Math.PI, false);
        this.context.fill();
        this.context.fillStyle = fill;
    }


    line(line: Line);
    line(p1: Point, p2: Point);
    line(x1: number, y1: number, x2: number, y2: number);
    line() {
        if (!this._stroke) return;

        let x1, y1, x2, y2;
        if (arguments[0] instanceof Line) {
            [x1, y1, x2, y2] = [arguments[0].p1.x, arguments[0].p1.y, arguments[0].p2.x, arguments[0].p2.y];
        } else if (arguments.length == 2) {
            [x1, y1, x2, y2] = [arguments[0].x, arguments[0].y, arguments[1].x, arguments[1].y];
        } else if (arguments.length == 4) {
            [x1, y1, x2, y2] = [arguments[0], arguments[1], arguments[2], arguments[3]];
        } else {
            return;
        }

        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
    }


    arc(arc: Arc);
    arc(x: number, y: number, r: number, start: number, end: number);
    arc() {
        if (!this._stroke && !this._fill) return;

        let x, y, r, start, end;
        if (arguments[0] instanceof Arc) {
            [x, y, r, start, end] = [arguments[0].p.x, arguments[0].p.y, arguments[0].r, arguments[0].start, arguments[0].end];
        } else if (arguments.length == 4) {
            [x, y, r, start, end] = [arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]];
        } else {
            return;
        }

        this.context.beginPath();
        this.context.arc(x, y, r, start, end, false);
        if (this._fill) this.context.fill();
        if (this._stroke) this.context.stroke();
    }


    polyline(polyline: Polyline);
    polyline(points: Point[]);
    polyline() {
        if (!this._stroke) return;

        let vertices;
        if (arguments[0] instanceof Polyline) {
            vertices = arguments[0].vertices;
        } else if (arguments[0] instanceof Array) {
            vertices = arguments[0];
        } else {
            return;
        }

        this.context.beginPath();
        for (let v of vertices) this.context.lineTo(v.x, v.y);
        this.context.stroke();
    }


    spline(spline: Spline | Point[], mode: string = 'clamped', detail: number = 20) { //clamped (default), open, closed
        if (spline instanceof Array) spline = new Spline(spline);

        spline.compute(mode, detail);
        this.polyline(spline.vertices);
    }


    sector(sector: Sector);
    sector(x: number, y: number, r1: number, r2: number, start: number, end: number);
    sector() {
        if (!this._stroke && !this._fill) return;

        let x, y, r1, r2, start, end;
        if (arguments[0] instanceof Sector) {
            [x, y, r1, r2, start, end] = [arguments[0].p.x, arguments[0].p.y, arguments[0].r1, arguments[0].r2, arguments[0].start, arguments[0].end];
        } else if (arguments.length == 4) {
            [x, y, r1, r2, start, end] = [arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]];
        } else {
            return;
        }

        this.context.beginPath();
        this.context.arc(x, y, r2, start, end, false);
        if (r1 == 0) {
            this.context.lineTo(x, y);
        } else {
            this.context.arc(x, y, r1, end, start, true);
        }
        this.context.closePath();
        if (this._fill) this.context.fill();
        if (this._stroke) this.context.stroke();
    }


    circle(circle: Circle);
    circle(x: number, y: number, r: number);
    circle() {
        if (!this._stroke && !this._fill) return;

        let x, y, r;
        if (arguments[0] instanceof Circle) {
            [x, y, r] = [arguments[0].p.x, arguments[0].p.y, arguments[0].r];
        } else if (arguments.length == 3) {
            [x, y, r] = [arguments[0], arguments[1], arguments[2]];
        } else {
            return;
        }

        this.context.beginPath();
        this.context.arc(x, y, r, 0, 2 * Math.PI, false);
        if (this._fill) this.context.fill();
        if (this._stroke) this.context.stroke();
    }


    ellipse(x: number, y: number, rx: number, ry: number, a: number = 0) {
        if (!this._stroke && !this._fill) return;

        this.context.beginPath();
        this.context.ellipse(x, y, rx, ry, a, 0, 2 * Math.PI, false);
        if (this._fill) this.context.fill();
        if (this._stroke) this.context.stroke();
    }


    triangle(triangle: Triangle);
    triangle(p1: Point, p2: Point, p3: Point);
    triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number);
    triangle() {
        if (!this._stroke && !this._fill) return;

        let x1, y1, x2, y2, x3, y3;
        if (arguments[0] instanceof Triangle) {
            [x1, y1, x2, y2, x3, y3] = [arguments[0].p1.x, arguments[0].p1.y, arguments[0].p2.x, arguments[0].p2.y, arguments[0].p3.x, arguments[0].p3.y];
        } else if (arguments.length == 3) {
            [x1, y1, x2, y2, x3, y3] = [arguments[0].x, arguments[0].y, arguments[1].x, arguments[1].y, arguments[2].x, arguments[2].y];
        } else if (arguments.length == 6) {
            [x1, y1, x2, y2, x3, y3] = [arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]];
        } else {
            return;
        }

        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.lineTo(x3, y3);
        this.context.closePath();
        if (this._fill) this.context.fill();
        if (this._stroke) this.context.stroke();
    }


    rect(rect: Rect);
    rect(x: number, y: number, w: number, h: number);
    rect() {
        if (!this._stroke && !this._fill) return;

        let x, y, w, h;
        if (arguments[0] instanceof Rect) {
            [x, y, w, h] = [arguments[0].p.x, arguments[0].p.y, arguments[0].w, arguments[0].h];
        } else if (arguments.length == 4) {
            [x, y, w, h] = [arguments[0], arguments[1], arguments[2], arguments[3]];
        } else {
            return;
        }

        if (this._fill) this.context.fillRect(x, y, w, h);
        if (this._stroke) this.context.strokeRect(x, y, w, h);
    }


    quad(p1: Point, p2: Point, p3: Point, p4: Point);
    quad(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number);
    quad() {
        if (!this._stroke && !this._fill) return;

        let x1, y1, x2, y2, x3, y3, x4, y4;
        if (arguments.length == 4) {
            [x1, y1, x2, y2, x3, y3, x4, y4] = [arguments[0].x, arguments[0].y, arguments[1].x, arguments[1].y, arguments[2].x, arguments[2].y, arguments[3].x, arguments[3].y];
        } else if (arguments.length == 8) {
            [x1, y1, x2, y2, x3, y3, x4, y4] = [arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7]];
        } else {
            return;
        }
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.lineTo(x3, y3);
        this.context.lineTo(x4, y4);
        this.context.closePath();
        if (this._fill) this.context.fill();
        if (this._stroke) this.context.stroke();
    }

    
    polygon(polygon: Polygon);
    polygon(points: Point[]);
    polygon() {
        if (!this._stroke && !this._fill) return;

        let vertices;
        if (arguments[0] instanceof Polygon) {
            vertices = arguments[0].vertices;
        } else if (arguments[0] instanceof Array) {
            vertices = arguments[0];
        } else {
            return;
        }

        this.context.beginPath();
        for (let v of vertices) this.context.lineTo(v.x, v.y);
        this.context.closePath();
        if (this._fill) this.context.fill();
        if (this._stroke) this.context.stroke();
    }


    cell(cell: Cell) {
        if (!this._stroke && !this._fill) return;

        if (cell.state != 1) {
            this.circle(cell.p.x, cell.p.y, cell.r);
            return;
        }

        this.context.beginPath();
        this.context.moveTo(cell.vertices[0].x, cell.vertices[0].y);
        for (let i = 0; i < cell.vertices.length; i++) {
            const v1 = cell.vertices[i];
            const v2 = cell.vertices[(i + 1) % cell.vertices.length];
            if (v1.type == 0) {
                this.context.lineTo(v2.x, v2.y);
            } else {
                this.context.arc(cell.p.x, cell.p.y, cell.r, v1.a, v2.a);
            }
        }
        if (this._fill) this.context.fill();
        if (this._stroke) this.context.stroke();
    }




    quadraticBezier(x1: number, y1: number, cx1: number, cy1: number, x2: number, y2: number) {
        if (!this._stroke && !this._fill) return;

        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.quadraticCurveTo(cx1, cy1, x2, y2);
        this.context.quadraticCurveTo(cx1, cy1, x2, y2);
        if (this._fill) this.context.fill();
        if (this._stroke) this.context.stroke();
    }

    bezier(x1: number, y1: number, cx1: number, cy1: number, cx2: number, cy2: number, x2: number, y2: number) {
        if (!this._stroke && !this._fill) return;

        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
        if (this._fill) this.context.fill();
        if (this._stroke) this.context.stroke();
    }




    beginPath() {
        this.context.beginPath();
    }

    moveTo(x: number, y: number) {
        this.context.moveTo(x, y);
    }

    lineTo(x: number, y: number) {
        this.context.lineTo(x, y);
    }

    quadraticBezierTo(cx: number, cy: number, x: number, y: number) {
        this.context.quadraticCurveTo(cx, cy, x, y);
    }

    bezierTo(cx1: number, cy1: number, cx2: number, cy2: number, x: number, y: number) {
        this.context.bezierCurveTo(cx1, cy1, cx2, cy2, x, y);
    }

    endPath(close: boolean = false) {
        if (close) this.context.closePath();
        if (this._fill) this.context.fill();
        if (this._stroke) this.context.stroke();
    }




    fontStyle(style: string) { //normal (default), italic, oblique
        this._font.style = style;
        this.font();
    }

    fontWeight(weight: string) { //normal (default), bold, bolder, lighter
        this._font.weight = weight;
        this.font();
    }

    fontSize(size: number) {
        this._font.size = size;
        this.font();
    }

    fontFamily(family: string) {
        this._font.family = family;
        this.font();
    }

    private font(){
        this.context.font = this._font.style + ' ' + this._font.weight + ' ' + this._font.size + 'px ' + this._font.family;
    }

    textAlign(align: CanvasTextAlign) { //start (default), end, left, right, center
        this.context.textAlign = align;
    }

    textBaseline(baseline: CanvasTextBaseline) { //top, hanging, middle, alphabetic (default), ideographic, bottom
        this.context.textBaseline = baseline;
    }

    measureText(text: string): number {
        return this.context.measureText(text).width;
    }

    text(text: string, x: number, y: number) {
        if (this._fill) this.context.fillText(text, x, y);
        if (this._stroke) this.context.strokeText(text, x, y);
    }




    save() {
        this.context.save();
    }

    restore() {
        this.context.restore();
    }

    translate(x: number, y: number) {
        this.context.translate(x, y);
    }

    rotate(a: number) {
        this.context.rotate(a);
    }

    scale(x: number, y: number) {
        this.context.scale(x, y);
    }

    setTransform(a: number, b: number, c: number, d: number, e: number, f: number) {
        this.context.setTransform(a, b, c, d, e, f);
    }

    transform(a: number, b: number, c: number, d: number, e: number, f: number) {
        this.context.transform(a, b, c, d, e, f);
    }




    image(img: CanvasImageSource, x: number, y: number, w: number, h: number) {
        this.context.drawImage(img, x, y, w, h);
    }

    dataURL(): string {
        return this.canvas.toDataURL();
    }
}



export class Color {
    static rgb(gray: number): string;
    static rgb(gray: number, a: number): string;
    static rgb(r: number, g: number, b: number): string;
    static rgb(r: number, g: number, b: number, a: number): string;
    static rgb(): string {
        if (arguments.length == 1) {
            return 'rgb(' + arguments[0] + ',' + arguments[0] + ',' + arguments[0] + ')';
        } else if (arguments.length == 2) {
            return 'rgba(' + arguments[0] + ',' + arguments[0] + ',' + arguments[0] + ',' + arguments[1] + ')';
        } else if (arguments.length == 3) {
            return 'rgb(' + arguments[0] + ',' + arguments[1] + ',' + arguments[2] + ')';
        } else if (arguments.length == 4) {
            return 'rgba(' + arguments[0] + ',' + arguments[1] + ',' + arguments[2] + ',' + arguments[3] + ')';
        }
    }

    static hsl(gray: number): string;
    static hsl(gray: number, a: number): string;
    static hsl(h: number, s: number, l: number): string;
    static hsl(h: number, s: number, l: number, a: number): string;
    static hsl(): string {
        if (arguments.length == 1) {
            return 'hsl(' + 0 + ',' + 0 + '%,' + arguments[0] + '%)';
        } else if (arguments.length == 2) {
            return 'hsla(' + 0 + ',' + 0 + '%,' + arguments[0] + '%,' + arguments[1] + ')';
        } else if (arguments.length == 3) {
            return 'hsl(' + arguments[0] + ',' + arguments[1] + '%,' + arguments[2] + '%)';
        } else if (arguments.length == 4) {
            return 'hsla(' + arguments[0] + ',' + arguments[1] + '%,' + arguments[2] + '%,' + arguments[3] + ')';
        }
    }

    static lerp(c1: string, c2: string, t: number) {
        let mode = c1.slice(0, 3);
        let regex = "\\((.+?)\\)";
        let c1_array = c1.match(regex)[1].split(',');
        let c2_array = c2.match(regex)[1].split(',');
        let n = c1_array.length;

        if (mode == 'hsl') {
            c1_array[1] = c1_array[1].slice(0, -1);
            c1_array[2] = c1_array[2].slice(0, -1);
            c2_array[1] = c2_array[1].slice(0, -1);
            c2_array[2] = c2_array[2].slice(0, -1);
        }

        let x = Number(c1_array[0]) + (Number(c2_array[0]) - Number(c1_array[0])) * t;
        let y = Number(c1_array[1]) + (Number(c2_array[1]) - Number(c1_array[1])) * t;
        let z = Number(c1_array[2]) + (Number(c2_array[2]) - Number(c1_array[2])) * t;
        let a = 1;
        if (n == 4) a = Number(c1_array[3]) + (Number(c2_array[3]) - Number(c1_array[3])) * t;

        if (mode == 'rgb') {
            return `rgba(${x},${y},${z},${a})`;
        } else if (mode == 'hsl') {
            return `hsla(${x},${y}%,${z}%,${a})`;
        }
    }
}