import { NaixtGameRenderer } from "./lib/render.js";
import { NaixtGameEngine } from "./lib/engine.js";
import { NaixtGameController } from "./lib/controller.js";
import { NaixtPlayer } from "./lib/player.js";
import { assert, assertDefined, makeElement } from "./lib/lib.js";
import { Popup } from "./lib/popup.js";
import { PeerConnection } from "./lib/peer.js";
import cardsDatabase from "./data/cards.json" with { type: "json" };
import { NaixtLocalStorage } from "./lib/storage.js";
import { PanelFocuser } from "./lib/panelFocus.js";
import { MainMenuPanel } from "./lib/panels/mainMenu.js";
import { LobbyPanel } from "./lib/panels/lobby.js";
import { OptionsPanel } from "./lib/panels/options.js";
import { GamePanel } from "./lib/panels/game.js";

window.addEventListener("load", function () {
    let panelEngine = new PanelFocuser();
    let engine = new NaixtGameEngine({ database: cardsDatabase });
    let renderer = new NaixtGameRenderer();
    let pov = NaixtPlayer.FIRST_PLAYER;
    let controller = new NaixtGameController({ engine, renderer, pov });
    let peer = new PeerConnection();
    
    // call peerjs with:
    // peerjs --port 9007 --key peerjs --allow_discovery --cors=http://localhost:8080
    panelEngine.addPanel(MainMenuPanel, ".interface-view", { peer });
    panelEngine.addPanel(LobbyPanel, ".lobby-view", { peer });
    panelEngine.addPanel(OptionsPanel, ".options-view");
    panelEngine.addPanel(GamePanel, ".game-view", { peer });

    // TODO: remove debug interface stuff
    window.NaixtLocalStorage = NaixtLocalStorage;
    window.panelEngine = panelEngine;
    window.controller = controller;
    document.getElementById("swap-perspective")?.addEventListener("click", () => {
        controller.pov = NaixtPlayer.opponentForPlayer(controller.pov);
        controller.render();
    });
});
