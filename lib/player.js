import { assertDefined } from "./lib.js";

class NaixtPlayer {
    static ME = Symbol("NaixtPlayer.ME");
    static ENEMY = Symbol("NaixtPlayer.ENEMY");
    static FIRST_PLAYER = Symbol("NaixtPlayer.FIRST_PLAYER");
    static SECOND_PLAYER = Symbol("NaixtPlayer.SECOND_PLAYER");
    static opponentForPlayer(playerSymbol) {
        return playerSymbol === this.FIRST_PLAYER ? this.SECOND_PLAYER : this.FIRST_PLAYER; 
    }
    
    constructor({ health, deck, name }) {
        assertDefined({ health, deck, name });
        this.health = health;
        this.hand = [];
        this.deck = deck;
        this.name = name;
    }
}

export { NaixtPlayer };
