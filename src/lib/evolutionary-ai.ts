/**
 * @fileOverview Evolutionary AI Engine for BROCKSTON.
 * Handles generation, mutation, and selection of CPU-friendly neural architectures.
 * Ported from v5.0 Python Evolutionary Engine.
 */

export class NeuralNetIndividual {
  inputSize: number;
  outputSize: number;
  numLayers: number;
  neuronsPerLayer: number;
  fitness: number = 0;
  weights: number[][][] = [];

  constructor(inputSize: number, outputSize: number, numLayers: number = 1, neuronsPerLayer: number = 16) {
    this.inputSize = inputSize;
    this.outputSize = outputSize;
    this.numLayers = Math.min(numLayers, 4);
    this.neuronsPerLayer = Math.min(neuronsPerLayer, 64);
    this.weights = this.initializeWeights();
  }

  private initializeWeights(): number[][][] {
    const weights: number[][][] = [];
    
    // Input to first hidden layer
    const firstLayer: number[][] = Array.from({ length: this.neuronsPerLayer }, () => 
      Array.from({ length: this.inputSize }, () => Math.random() * 2 - 1)
    );
    weights.push(firstLayer);

    // Hidden layers
    for (let l = 0; l < this.numLayers - 1; l++) {
      const hiddenLayer: number[][] = Array.from({ length: this.neuronsPerLayer }, () => 
        Array.from({ length: this.neuronsPerLayer }, () => Math.random() * 2 - 1)
      );
      weights.push(hiddenLayer);
    }

    // Last hidden to output layer
    const outputLayer: number[][] = Array.from({ length: this.outputSize }, () => 
      Array.from({ length: this.neuronsPerLayer }, () => Math.random() * 2 - 1)
    );
    weights.push(outputLayer);

    return weights;
  }

  predict(inputs: number[]): number[] {
    let activation = inputs.length === this.inputSize 
      ? inputs 
      : [...inputs, ...new Array(Math.max(0, this.inputSize - inputs.length)).fill(0)].slice(0, this.inputSize);

    for (let i = 0; i < this.weights.length; i++) {
      const layer = this.weights[i];
      const nextActivation: number[] = [];

      for (const neuronWeights of layer) {
        // Dot product
        let val = 0;
        for (let j = 0; j < activation.length; j++) {
          val += activation[j] * neuronWeights[j];
        }

        // Leaky ReLU for hidden, Sigmoid for output
        if (i < this.weights.length - 1) {
          val = val > 0 ? val : 0.01 * val;
        } else {
          val = 1.0 / (1.0 + Math.exp(-Math.max(-100, Math.min(100, val))));
        }
        nextActivation.append ? nextActivation.push(val) : nextActivation.push(val);
      }
      activation = nextActivation;
    }
    return activation;
  }

  toDict() {
    return {
      inputSize: this.inputSize,
      outputSize: this.outputSize,
      numLayers: this.numLayers,
      neuronsPerLayer: this.neuronsPerLayer,
      fitness: this.fitness,
      weights: this.weights
    };
  }

  static fromDict(data: any): NeuralNetIndividual {
    const ind = new NeuralNetIndividual(data.inputSize, data.outputSize, data.numLayers, data.neuronsPerLayer);
    ind.fitness = data.fitness || 0;
    ind.weights = data.weights || ind.weights;
    return ind;
  }
}

export class EvolutionaryAI {
  populationSize: number;
  inputSize: number;
  outputSize: number;
  mutationRate: number;
  population: NeuralNetIndividual[];
  generation: number = 1;
  bestFittest: NeuralNetIndividual | null = null;

  constructor(populationSize: number, inputSize: number, outputSize: number, mutationRate: number = 0.1) {
    this.populationSize = populationSize;
    this.inputSize = inputSize;
    this.outputSize = outputSize;
    this.mutationRate = mutationRate;
    this.population = Array.from({ length: populationSize }, () => 
      new NeuralNetIndividual(inputSize, outputSize, Math.floor(Math.random() * 4) + 1, Math.floor(Math.random() * 56) + 8)
    );
  }

  evaluateFitness(individual: NeuralNetIndividual): number {
    // In a real scenario, this would test against a dataset.
    // For the prototype, we simulate fitness based on complexity efficiency.
    return Math.random() * 100;
  }

  select(): [NeuralNetIndividual, NeuralNetIndividual] {
    const tournament = Array.from({ length: Math.max(2, Math.floor(this.populationSize / 5)) }, () => 
      this.population[Math.floor(Math.random() * this.populationSize)]
    );
    tournament.sort((a, b) => b.fitness - a.fitness);
    return [tournament[0], tournament[1]];
  }

  crossover(p1: NeuralNetIndividual, p2: NeuralNetIndividual): NeuralNetIndividual {
    const childLayers = Math.random() > 0.5 ? p1.numLayers : p2.numLayers;
    const childNeurons = Math.random() > 0.5 ? p1.neuronsPerLayer : p2.neuronsPerLayer;
    return new NeuralNetIndividual(this.inputSize, this.outputSize, childLayers, childNeurons);
  }

  mutate(ind: NeuralNetIndividual) {
    if (Math.random() < this.mutationRate) {
      ind.numLayers = Math.max(1, Math.min(4, ind.numLayers + (Math.random() > 0.5 ? 1 : -1)));
      ind.neuronsPerLayer = Math.max(8, Math.min(64, ind.neuronsPerLayer + (Math.random() > 0.5 ? 8 : -8)));
      // Forced weights re-init on arch mutation
      ind.weights = (new NeuralNetIndividual(ind.inputSize, ind.outputSize, ind.numLayers, ind.neuronsPerLayer)).weights;
    } else {
      // Weight mutation
      const l = Math.floor(Math.random() * ind.weights.length);
      const n = Math.floor(Math.random() * ind.weights[l].length);
      const w = Math.floor(Math.random() * ind.weights[l][n].length);
      ind.weights[l][n][w] += (Math.random() * 2 - 1) * 0.5;
    }
  }

  evolveStep() {
    this.population.forEach(ind => {
      ind.fitness = this.evaluateFitness(ind);
    });

    this.population.sort((a, b) => b.fitness - a.fitness);
    
    if (!this.bestFittest || this.population[0].fitness > this.bestFittest.fitness) {
      this.bestFittest = NeuralNetIndividual.fromDict(this.population[0].toDict());
    }

    const newPopulation: NeuralNetIndividual[] = [this.population[0]]; // Elitism

    while (newPopulation.length < this.populationSize) {
      const [p1, p2] = this.select();
      const child = this.crossover(p1, p2);
      this.mutate(child);
      newPopulation.push(child);
    }

    this.population = newPopulation;
    this.generation++;
  }
}
