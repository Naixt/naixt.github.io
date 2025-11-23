import { assert, assertDefined } from "./lib.js";
import { NaixtPlayer } from "./player.js";
import { NaixtGameView } from "./render.js";

class NaixtGameController {
    constructor({ engine, renderer, pov } = {}) {
        assertDefined({ engine, renderer, pov });
        assert(pov === NaixtPlayer.FIRST_PLAYER || pov === NaixtPlayer.SECOND_PLAYER, "Expected `pov` to be one of `NaixtPlayer.FIRST_PLAYER` or `NaixtPlayer.SECOND_PLAYER`");
        this.engine = engine;
        this.renderer = renderer;
        this.pov = pov;
    }

    initialize(gameArea) {
        assertDefined({ gameArea });
        this.renderer.anchor(gameArea);
        this.renderer.initialize();
        let deck1 = [...this.engine.database];
        let deck2 = [...this.engine.database];
        this.engine.newGame(deck1, deck2);
    }

    render() {
        this.renderer.render(new NaixtGameView(this.engine, this.pov));
    }
}

export { NaixtGameController };
