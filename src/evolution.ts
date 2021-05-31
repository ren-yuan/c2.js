//Created by Ren Yuan


export class Population {
    chromosomes:Chromosome[]
    crossoverRate:number;
    mutationRate:number;
    generation:number;
    private _fitness:Function;

    private _selection:string = 'roulette';
    private _sumFitness:number = 0;
    private _tournament:number = 0;
    private _elitism:number = 0;

    constructor(chromosomes: Chromosome[], crossoverRate: number, mutationRate: number, fitness:Function) {
        this.chromosomes = chromosomes;
        this.crossoverRate = crossoverRate;
        this.mutationRate = mutationRate;
        this.generation = 0;
        this._fitness = fitness;
    }

    setElitism(n:number){
        this._elitism = n;
    }

    setSelection(type:string, n:number=0){ //roulette (default), tournament
        this._selection = type;
        this._tournament = n;
    }

    setCrossover(type:string){ //single_point (default), two_point, pmx
        for (let c of this.chromosomes) c.setCrossover(type);
    }

    setMutation(type:string){ //deviate, random (default), exchange, insertion
        for (let c of this.chromosomes) c.setMutation(type);
    }


    fitness():object{
        this._sumFitness = 0;
        for (let chromosome of this.chromosomes) {
            if(this._fitness) this._fitness(chromosome);
            this._sumFitness += chromosome.fitness;
        }
        this.chromosomes.sort( (a, b) => b.fitness -  a.fitness );

        return {'generation': this.generation,
                'sumFitness': this._sumFitness,
                'averageFitness': this._sumFitness/this.chromosomes.length,
                'bestFitness': this.chromosomes[0].fitness,
                'worstFitness': this.chromosomes[this.chromosomes.length-1].fitness,
                'bestChromosome': this.chromosomes[0]
                };
    }

    reproduction() {
        let next = new Array();
        //Elitism Selection
        if(this._elitism > 0 && this._elitism <= this.chromosomes.length){
            for (let i=0; i<this._elitism; i++) next.push(this.chromosomes[i].copy());
        }

        while (next.length < this.chromosomes.length) {
            //Selection
            let parent1 = this.selection();
            let parent2 = this.selection();
            //Crossover
            let children = this.crossover(parent1, parent2);
            //Mutation
            if(children instanceof Array) {
                children[0].mutation(this.mutationRate);
                next.push(children[0]);
                if(next.length < this.chromosomes.length && children.length==2){
                    children[1].mutation(this.mutationRate);
                    next.push(children[1]);
                }
            }else{
                children.mutation(this.mutationRate);
                next.push(children);
            }
        }
        this.chromosomes = next;
        this.generation++;
    }

    
    private selection():Chromosome{
        if(this._selection == 'roulette'){
            return this.roulette();
        }else if(this._selection == 'tournament'){
            return this.tournament();
        }
    }

    private roulette():Chromosome{
        let k = 0;
        let p = Math.random() * this._sumFitness;
        for (let chromosome of this.chromosomes) {
            k += chromosome.fitness;
            if (k >= p) return chromosome;
        }
    }

    private tournament():Chromosome{
        let bestFitness = Number.NEGATIVE_INFINITY;
        let chromosome = null;
        for (let i=0; i<this._tournament; i++) {
            let p = Math.floor(Math.random() * this.chromosomes.length);
            let c = this.chromosomes[p];
            if(c.fitness > bestFitness || chromosome == null){
                bestFitness = c.fitness;
                chromosome = c;
            }
        }
        return chromosome;
    }

    private crossover(parent1:Chromosome, parent2:Chromosome):Chromosome[]|Chromosome{
        if(parent1 != parent2 && Math.random() < this.crossoverRate) {
            return parent1.crossover(parent2);
        }else{
            return [parent1.copy(), parent2.copy()];
        }
    }
}




export class Chromosome{
    fitness:number;
    genes:number[];

    private type:string = 'float';
    private lower:number = 0;
    private upper:number = 0;

    private crossoverType:string = 'single_point'; 
    private mutationType:string = 'random'; 

    constructor();
    constructor(chromosome:Chromosome);
    constructor(){
        this.fitness = 0;
        this.genes = [];
        if(arguments[0] instanceof Chromosome){
            for (let gene of arguments[0].genes) this.genes.push(gene);
            this.type = arguments[0].type;
            this.lower = arguments[0].lower;
            this.upper = arguments[0].upper;
            this.crossoverType = arguments[0].crossoverType;
            this.mutationType = arguments[0].mutationType;
        }
    }

    copy():Chromosome{
        return new Chromosome(this);
    }


    setCrossover(type:string){ 
        this.crossoverType = type;
    }

    setMutation(type:string){ 
        this.mutationType = type;
    }

    crossover(mate:Chromosome):Chromosome[]|Chromosome{
        if(this.crossoverType == 'two_point') return Crossover.twoPoint(this, mate);
        else if(this.crossoverType == 'pmx') return Crossover.PMX(this, mate);
        else return Crossover.singlePoint(this, mate);
    }

    mutation(mutationRate:number){
        if(this.mutationType == 'deviate') {
            Mutation.deviate(this, mutationRate);
        }else if(this.mutationType == 'random') {
            Mutation.random(this, mutationRate, this.lower, this.upper, this.type == 'integer');
        }else if(this.mutationType == 'exchange') {
            if(Math.random() < mutationRate) Mutation.exchange(this);
        }else if(this.mutationType == 'insertion') {
            if(Math.random() < mutationRate) Mutation.insertion(this);
        }
    }

    
    initFloat(length:number, lower:number, upper:number){
        this.genes = new Array(length);
        for(let i=0; i<length; i++) {
            this.genes[i] = lower + (upper-lower) * Math.random();
        }
        this.type = 'float';
        this.lower = lower;
        this.upper = upper;
    }

    initInteger(length:number, lower:number, upper:number){
        this.genes = new Array(length);
        for(let i=0; i<length; i++) {
            this.genes[i] = Math.floor(lower + (upper-lower+1) * Math.random());
        }
        this.type = 'integer';
        this.lower = lower;
        this.upper = upper;
    }

    initPermutation(length:number){
        this.genes = new Array(length);
        for(let i=0; i<length; i++) this.genes[i] = i;
           this.shuffle();
        this.type = 'permutation';
        this.lower = 0;
        this.upper = length;
    }

    
    find(gene:number): number {
        return this.genes.findIndex((g)=>g===gene);
    }

    swap(i: number, j: number) {
        let temp = this.genes[i];
        this.genes[i] = this.genes[j];
        this.genes[j] = temp;
    }

    shuffle(){
        let genes = [];
        while(this.genes.length) {
            let i = Math.floor(Math.random() * this.genes.length);
            genes.push(this.genes.splice(i, 1)[0]);
        }
        this.genes = genes;
    }

    toString(code: boolean = false): string {
        let str = '';
        if(code){
            for (let i = 0; i < this.genes.length; i++) str += String.fromCharCode(this.genes[i]);
        }else{
            for (let i = 0; i < this.genes.length; i++) str += this.genes[i];
        }
        return str;
    }
}




export class Crossover{
    //Single Point Crossover
    static singlePoint(parent1:Chromosome, parent2:Chromosome):Chromosome[]{
        let offspring1 = parent1.copy();
        let offspring2 = parent2.copy();
        
        let p = Math.floor(Math.random() * offspring1.genes.length);
        
        for (let i = p; i < offspring1.genes.length; i++) {
            let temp = offspring1.genes[i];
            offspring1.genes[i] = offspring2.genes[i];
            offspring2.genes[i] = temp;
        }

        return [offspring1, offspring2];
    }

    //Two Point Crossover
    static twoPoint(parent1:Chromosome, parent2:Chromosome):Chromosome[]{
        let offspring1 = parent1.copy();
        let offspring2 = parent2.copy();
    
        let p1 = Math.floor(Math.random() * (offspring1.genes.length-1));
        let p2 = Math.floor(p1+1 + (offspring1.genes.length-p1-1) * Math.random());

        for (let i = p1; i < p2; i++) {
            let temp = offspring1.genes[i];
            offspring1.genes[i] = offspring2.genes[i];
            offspring2.genes[i] = temp;
        }
        
        return [offspring1, offspring2];
    }

    //Partially Mapped Crossover
    static PMX(parent1:Chromosome, parent2:Chromosome):Chromosome[]{
        let offspring1 = parent1.copy();
        let offspring2 = parent2.copy();

        let p1 = Math.floor(Math.random() * (offspring1.genes.length-1));
        let p2 = Math.floor(p1+1 + (offspring1.genes.length-p1-1) * Math.random());

        for(let i=p1; i<=p2; i++){
            let g1 = parent1.genes[i];
            let g2 = parent2.genes[i];
            if(g1 != g2){
                let i1 = parent1.find(g2);
                let i2 = parent2.find(g1);
                offspring1.swap(i, i1);
                offspring2.swap(i, i2);
            }
        } 
        
        return [offspring1, offspring2];
    }
}




export class Mutation{
    //Deviate Mutation
    static maxDeviation = .1;
    static deviate(chromosome:Chromosome, mutationRate:number){
        let genes = chromosome.genes;
        for(let i=0; i<genes.length; i++){
            if(Math.random() < mutationRate) genes[i] += (Math.random()*2-1) * Mutation.maxDeviation;
        }
    }

    //Random Resetting
    static random(chromosome:Chromosome, mutationRate:number, lower:number, upper:number, integer:boolean=false){
        let genes = chromosome.genes;
        if(integer){
            for(let i=0; i<genes.length; i++){
                if(Math.random() < mutationRate) genes[i] = Math.floor(lower + (upper-lower+1) * Math.random());
            }
        }else{
            for(let i=0; i<genes.length; i++){
                if(Math.random() < mutationRate) genes[i] = lower + (upper-lower) * Math.random();
            }
        }
    }

    //Exchange Mutation
    static exchange(chromosome:Chromosome){
        let p1 = Math.floor(Math.random() * chromosome.genes.length);
        let p2 = p1;
        while(p1==p2) p2 = Math.floor(Math.random() * chromosome.genes.length);
        let temp = chromosome.genes[p1];
        chromosome.genes[p1] = chromosome.genes[p2];
        chromosome.genes[p2] = temp;
    }

    //Insertion Mutation
    static insertion(chromosome:Chromosome){
        let p1 = Math.floor(Math.random() * chromosome.genes.length);
        let p2 = p1;
        while(p1==p2) p2 = Math.floor(Math.random() * chromosome.genes.length);
        let gene = chromosome.genes[p1];
        chromosome.genes.splice(p1, 1);
        chromosome.genes.splice(p2, 0, gene);
    }
}




export class NeuralNet{
    neurons:Neuron[][];

    constructor(neuralNet:NeuralNet);
    constructor(inputs:number, outputs:number, hiddenLayers:number, layerNeurons:number);
    constructor(){
        if(arguments[0] instanceof NeuralNet){
            this.neurons = [];
            for(let i=0; i<arguments[0].neurons.length; i++){
                let layer = [];
                for(let j=0; j<arguments[0].neurons[i].length; j++) {
                    layer.push(arguments[0].neurons[i][j].copy());
                }
                this.neurons.push(layer);
            }
        }else{
            this.neurons = [];
            if(arguments[2]>0){
                this.addLayer(arguments[0], arguments[3]);
                for(let i=0; i<arguments[2]-1; i++) this.addLayer(arguments[3], arguments[3]);
                this.addLayer(arguments[3], arguments[1]);
            }else{
                this.addLayer(arguments[0], arguments[1]);
            } 
        }
    }

    private addLayer(inputs:number, outputs:number){
        let layer = new Array(outputs);
        for(let i=0; i<outputs; i++) layer[i] = new Neuron(inputs);
        this.neurons.push(layer);
    }

    copy():NeuralNet{
        return new NeuralNet(this);
    }

    feedforward(input:number[]):number[]{
        let output = [];
        for(let i=0; i<this.neurons.length; i++) {
            if(i>0){
                input = [...output];
                output = [];
            }
            for(let j=0; j<this.neurons[i].length; j++) {
                output.push(this.neurons[i][j].activate(input));
            }
        }
        return output;
    }

    weights():number[];
    weights(weights:number[]);
    weights(){
        if(arguments.length == 1){
            let index = 0;
            for(let i=0; i<this.neurons.length; i++){
                for(let j=0; j<this.neurons[i].length; j++) {
                    for(let k=0; k<this.neurons[i][j].weights.length; k++){
                        this.neurons[i][j].weights[k] = arguments[0][index];
                        index++;
                    }
                }
            }
        }else{
            let weights = [];
            for(let i=0; i<this.neurons.length; i++){
                for(let j=0; j<this.neurons[i].length; j++) {
                    for(let k=0; k<this.neurons[i][j].weights.length; k++){
                        weights.push(this.neurons[i][j].weights[k]);
                    }
                }
            }
            return weights;
        }
    }

    indexes():number[]{
        let indexes = [];
        let index = 0;
        for(let i=0; i<this.neurons.length; i++){
            for(let j=0; j<this.neurons[i].length; j++) {
                indexes.push(index);
                for(let k=0; k<this.neurons[i][j].weights.length; k++){
                    index++;
                }
            }
        }
        return indexes;
    }
}

export class Neuron{
    weights:number[];

    constructor(neuron:Neuron);
    constructor(inputs:number);
    constructor(){
        if(arguments[0] instanceof Neuron){
            this.weights = new Array(arguments[0].weights.length);
            for (let i=0; i<this.weights.length; i++) {
                this.weights[i] = arguments[0].weights[i];
            }
        }else{
            this.weights = new Array(arguments[0]+1);
            for (let i=0; i<this.weights.length; i++) {
                this.weights[i] = Math.random()*2-1;
            }
        }
    }

    copy():Neuron{
        return new Neuron(this);
    }

    activate(input:number[]):number{
        let sum = 0;
        for(let i=0; i<this.weights.length-1; i++) {
            sum += this.weights[i] * input[i];
        }
        sum += this.weights[this.weights.length - 1];
        return this.sigmoid(sum);
    }

    sigmoid(z:number):number{
        return 1/(1+Math.exp(-z));
    }
}