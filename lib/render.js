import { assert, assertDefined, makeElement } from "./lib.js";
import { NaixtPlayer } from "./player.js";
import { NaixtGameEngine } from "./engine.js";

class NaixtGameView {
    constructor(engine, pov) {
        assertDefined({ engine, pov });
        this.turnPlayer = engine.turnPlayer();
        this.pov = pov; // either FIRST_PLAYER or SECOND_PLAYER
        this.players = [...engine.players];
    }

    getPlayerIdx(playerSymbol) {
        assertDefined({ playerSymbol });
        if(playerSymbol === NaixtPlayer.FIRST_PLAYER) {
            return this.turnPlayer === NaixtPlayer.FIRST_PLAYER ? 0 : 1;
        }
        else {
            return this.turnPlayer === NaixtPlayer.FIRST_PLAYER ? 1 : 0;
        }
    }

    getPlayer(playerSymbol) {
        return this.players[this.getPlayerIdx(playerSymbol)];
    }
}

class NaixtGameRenderer {
    constructor() {
        this.rootElement = makeElement("div.naixt-game");
        this.elements = null;
    }

    isInitialized() {
        return this.elements !== null;
    }
    
    anchor(parent) {
        assertDefined({ parent });
        this.rootElement.remove();
        parent.appendChild(this.rootElement);
    }

    initialize() {
        assert(!this.isInitialized(), "Cannot initialize already-initialized game renderer");
        this.elements = {
            controllerSide: makeElement("div.controller.naixt-side"),
            controllerField: makeElement("div.controller"),
            controllerHand: makeElement("div.controller"),
            controllerDeck: makeElement("div.controller"),
            controllerManaGauge: makeElement("div.controller"),
            enemySide: makeElement("div.enemy.naixt-side"),
            enemyField: makeElement("div.enemy"),
            enemyHand: makeElement("div.enemy"),
            enemyDeck: makeElement("div.enemy"),
            enemyManaGauge: makeElement("div.enemy"),
        };
        this.rootElement.appendChild(this.elements.enemySide);
        this.rootElement.appendChild(this.elements.controllerSide);
    }

    render(gameView) {
        assert(this.isInitialized(), "Cannot render without initializing first");
        assertDefined({ gameView });
        let myPov = gameView.pov;
        let enemyPov = NaixtPlayer.opponentForPlayer(gameView.pov);
        let mePlayer = gameView.getPlayer(myPov);
        let enemyPlayer = gameView.getPlayer(enemyPov);
        this.elements.controllerSide.textContent = mePlayer.name;
        this.elements.enemySide.textContent = enemyPlayer.name;
    }
}

export { NaixtGameRenderer, NaixtGameView };
