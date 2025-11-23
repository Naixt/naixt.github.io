import { assertDefined } from "./lib.js";
import { NaixtPlayer } from "./player.js";

class NaixtGameEngine {
    constructor({ database }) {
        assertDefined({ database });
        this.database = database;
        this.players = null;
        this.turnNumber = null;
    }
    
    newGame(deck1, deck2) {
        assertDefined({ deck1, deck2 });
        this.players = [
            new NaixtPlayer({ health: 25, deck: deck1, name: "first player" }), // first player
            new NaixtPlayer({ health: 25, deck: deck2, name: "second player" }), // second player
        ];
        this.turnNumber = 0;
    }

    turnPlayer() {
        return this.turnNumber % 2 === 0 ? NaixtPlayer.FIRST_PLAYER : NaixtPlayer.SECOND_PLAYER;
    }

    static getPlayerIdx(playerSymbol) {
        assertDefined({ playerSymbol });
        assert(playerSymbol === NaixtPlayer.FIRST_PLAYER || playerSymbol === NaixtPlayer.SECOND_PLAYER, "Expected `playerSymbol` to be one of `NaixtPlayer.FIRST_PLAYER` or `NaixtPlayer.SECOND_PLAYER`");
        return playerSymbol === NaixtPlayer.FIRST_PLAYER ? 0 : 1;
    }
}

export { NaixtGameEngine };
