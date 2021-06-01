//Created by Ren Yuan


let audioContext;

function createAudioContext(){
	if (typeof window !== 'undefined' && typeof audioContext === 'undefined') {
		window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;
		audioContext = new AudioContext();
	}
}


export class AudioIn{
	context:AudioContext;
	node:MediaStreamAudioSourceNode;

	constructor(callback:Function){
		createAudioContext();
		this.context = audioContext;
		let constraints = {audio: true, video: false};
		window.navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
			this.node = audioContext.createMediaStreamSource(stream);
			callback();
		}).catch((error) => {});
	}

	connect(node:AudioNode){
		this.node.connect(node);
	}

	disconnect(){
		this.node.disconnect();
	}
}


export class Sound{
	context:AudioContext;
	audio:HTMLMediaElement;
	node:MediaElementAudioSourceNode;

	constructor(url:string, callback:Function){
		createAudioContext();
		this.context = audioContext;
		this.audio = new Audio(url);
		this.audio.addEventListener('loadeddata', () => {
  			this.node = audioContext.createMediaElementSource(this.audio);
  			callback();
		});
	}

	duration():number{
		return this.audio.duration;
	}

	currentTime():number{
		return this.audio.currentTime;
	}

	volume():number{
		return this.audio.volume;
	}

	paused():boolean{
		return this.audio.paused;
	}

	loop(loop:boolean = true){
		this.audio.loop = loop;
	}

	autoplay(auto:boolean = true){
		this.audio.autoplay = auto;
	}

	play(){
		this.audio.play();
	}

	pause(){
		this.audio.pause();
	}

	connect(node:AudioNode){
		this.node.connect(node);
	}

	disconnect(){
		this.node.disconnect();
	}
}


export class Analyser{
	context:AudioContext;
	node:AnalyserNode;

	constructor(){
		createAudioContext();
		this.context = audioContext;
		this.node = audioContext.createAnalyser();
	}

	analyze(audio:AudioIn|Sound){
		audio.node.connect(this.node);
	}

	fftSize(fftSize:number){
		this.node.fftSize = fftSize;
	}

	binCount():number{
		return this.node.frequencyBinCount;
	}

	smooth(smoothing:number){
		this.node.smoothingTimeConstant = smoothing;
	}

	level():number {
		let data = this.timeDomain();
	    let sum = 0;
	    for (let i=0; i<data.length; i++) {
	      	sum += data[i]*data[i];
	    }
	    sum /= data.length;
	    return Math.sqrt(sum);
  	}

	timeDomain():number[]{
		let timeDomain = new Uint8Array(this.node.frequencyBinCount);
		this.node.getByteTimeDomainData(timeDomain);

		let data = new Array(timeDomain.length);
		for (let i=0; i<timeDomain.length; i++) {
	    	data[i] = (timeDomain[i]-128)/128;
	    }
		return data;
	}

	freqDomain():number[]{
		let freqDomain = new Uint8Array(this.node.frequencyBinCount);
		this.node.getByteFrequencyData(freqDomain);

		let data = new Array(freqDomain.length);
		for (let i=0; i<freqDomain.length; i++) {
	    	data[i] = freqDomain[i]/255;
	    }
		return data;
	}

	connect(node:AudioNode){
		this.node.connect(node);
	}

	disconnect(){
		this.node.disconnect();
	}

	output(){
		this.node.connect(audioContext.destination);
	}
}