import { NaixtGameRenderer } from "./lib/render.js";
import { NaixtGameEngine } from "./lib/engine.js";
import { NaixtGameController } from "./lib/controller.js";
import { NaixtPlayer } from "./lib/player.js";
import { assertDefined, makeElement } from "./lib/lib.js";
import { Popup } from "./lib/popup.js";
import { PeerConnection } from "./lib/peer.js";
import cardsDatabase from "./data/cards.json" with { type: "json" };
import { NaixtLocalStorage } from "./lib/storage.js";
import { PanelFocuser } from "./lib/panel.js";

window.addEventListener("load", function () {
    let panelEngine = new PanelFocuser();
    window.NaixtLocalStorage = NaixtLocalStorage;
    let engine = new NaixtGameEngine({ database: cardsDatabase });
    let renderer = new NaixtGameRenderer();
    let pov = NaixtPlayer.FIRST_PLAYER;
    let controller = new NaixtGameController({ engine, renderer, pov });
    let gameArea = document.querySelector(".game-area");

    let peer = null;
    /**** main menu interface panel ****/
    panelEngine.addButtonTransition(".solo-mode", "game-view", () => {
        controller.initialize(gameArea);
        controller.render();
    });
    // TODO: use peer discovery
    // TODO: figure out how --cors works
    // e.g. `peerjs --port 9007 --key peerjs --allow_discovery --cors=localhost:8080` doesn't work
    panelEngine.addButtonTransition(".peer-host", "host-view", () => {
        let statusMessage = document.querySelector(".host-status");
        statusMessage.textContent = "Awaiting response from Peer server...";
        peer ??= new PeerConnection();
        peer.host().then(id => {
            statusMessage.textContent = `Your id: ${id}`;
        });
    });
    panelEngine.addButtonTransition(".peer-connect", "connect-view", () => {
        let statusMessage = document.querySelector(".connect-status");
        statusMessage.textContent = "Please enter a Peer ID (doesn't work yet)";
    });
    panelEngine.addButtonTransition(".interface-options", "options-view", () => {
        optionsPeerServer.value = NaixtLocalStorage.get("peerServer");
        syncOptionsVisualState();
    });

    /**** options view panel ****/
    let optionsPeerServer = document.querySelector(".options-peer-server");
    let optionsSaveButton = document.querySelector(".options-save");
    const syncOptionsVisualState = () => {
        optionsSaveButton.disabled = optionsPeerServer.value === NaixtLocalStorage.get("peerServer");
    };
    optionsPeerServer.addEventListener("input", () => {
        syncOptionsVisualState();
    });
    optionsSaveButton.addEventListener("click", () => {
        NaixtLocalStorage.set("peerServer", optionsPeerServer.value);
        syncOptionsVisualState();
    });
    panelEngine.addButtonTransition(".options-return", "interface-view");

    /**** host view panel ****/
    panelEngine.addButtonTransition(".host-return", "interface-view");

    /**** connect view panel ****/
    panelEngine.addButtonTransition(".connect-return", "interface-view");

    /**** spectate view panel ****/
    // TODO

    /**** game view panel ****/
    // TODO

    // TODO: remove debug interface stuff
    window.controller = controller; // TODO: remove debug
    document.getElementById("swap-perspective")?.addEventListener("click", () => {
        controller.pov = NaixtPlayer.opponentForPlayer(controller.pov);
        controller.render();
    });
});
