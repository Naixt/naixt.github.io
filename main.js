import { NaixtGameRenderer } from "./lib/render.js";
import { NaixtGameEngine } from "./lib/engine.js";
import { NaixtGameController } from "./lib/controller.js";
import cardsDatabase from "./data/cards.json" with { type: "json" };
import { NaixtPlayer } from "./lib/player.js";

window.addEventListener("load", function () {
    let engine = new NaixtGameEngine({ database: cardsDatabase });
    let renderer = new NaixtGameRenderer();
    let pov = NaixtPlayer.FIRST_PLAYER;
    let controller = new NaixtGameController({ engine, renderer, pov });
    let gameArea = document.getElementById("game-area");
    controller.initialize(gameArea);
    controller.render();

    // TODO: remove debug interface stuff
    window.controller = controller; // TODO: remove debug
    this.document.getElementById("swap-perspective").addEventListener("click", () => {
        controller.pov = NaixtPlayer.opponentForPlayer(controller.pov);
        controller.render();
    });
});
