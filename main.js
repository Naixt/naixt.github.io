import { NaixtGameRenderer } from "./lib/render.js";
import { NaixtGameEngine } from "./lib/engine.js";
import { NaixtGameController } from "./lib/controller.js";
import { NaixtPlayer } from "./lib/player.js";
import { makeElement } from "./lib/lib.js";
import { Popup } from "./lib/popup.js";
import { PeerConnection } from "./lib/peer.js";
import cardsDatabase from "./data/cards.json" with { type: "json" };

window.addEventListener("load", function () {
    let engine = new NaixtGameEngine({ database: cardsDatabase });
    let renderer = new NaixtGameRenderer();
    let pov = NaixtPlayer.FIRST_PLAYER;
    let controller = new NaixtGameController({ engine, renderer, pov });
    let gameArea = document.querySelector(".game-area");
    
    const focusPanel = panelClass => {
        document.querySelectorAll(".naixt-panel").forEach(panel => {
            panel.classList.toggle("hidden", !panel.classList.contains(panelClass));
        });
    };

    let peer = null;
    /**** main menu interface panel ****/
    document.querySelector(".solo-mode").addEventListener("click", () => {
        controller.initialize(gameArea);
        controller.render();
        focusPanel("game-view");
    });
    document.querySelector(".peer-host").addEventListener("click", () => {
        let statusMessage = document.querySelector(".host-status");
        statusMessage.textContent = "Awaiting response from Peer server...";
        focusPanel("host-view");
        /*
        peer ??= new PeerConnection();
        peer.host().then(id => {
            statusMessage.textContent = `Your id: ${id}`;
        });*/
        statusMessage.textContent = "(just testing infrastructure)";
    });
    document.querySelector(".peer-connect").addEventListener("click", () => {
        let statusMessage = document.querySelector(".connect-status");
        statusMessage.textContent = "Please enter a Peer ID (doesn't work yet)";
        focusPanel("connect-view");
    });

    /**** host view panel ****/
    document.querySelector(".host-return").addEventListener("click", () => {
        focusPanel("interface-view");
    });

    /**** connect view panel ****/
    document.querySelector(".connect-return").addEventListener("click", () => {
        focusPanel("interface-view");
    });

    /**** spectate view panel ****/

    /**** game view panel ****/


    // TODO: remove debug interface stuff
    window.controller = controller; // TODO: remove debug
    document.getElementById("swap-perspective")?.addEventListener("click", () => {
        controller.pov = NaixtPlayer.opponentForPlayer(controller.pov);
        controller.render();
    });
});
