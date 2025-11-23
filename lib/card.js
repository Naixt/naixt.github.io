import { assert, assertDefined, unimplemented } from "./lib.js";

// class specifying how a card is instantiated
class NaixtCardTemplate {
    constructor({ name, cost, health, power }) {
        assertDefined({ name, cost, health, power });
        this.name = name;
        this.cost = cost;
        this.health = health;
        this.power = power;
    }
}

// class representing card in game logic
class NaixtCard {
    constructor(template) {
        this.cost = template.cost;
        this.currentCost = this.cost;
        this.health = template.health;
        this.currentHealth = this.health;
        this.power = template.power;
        this.currentPower = this.power;
    }
    
    registerEffect(effect) {
        unimplemented();
    }
}

export { NaixtCardTemplate, NaixtCard };
