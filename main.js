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

window.addEventListener("load", function () {
    let panelEngine = new PanelFocuser();
    window.NaixtLocalStorage = NaixtLocalStorage;
    let engine = new NaixtGameEngine({ database: cardsDatabase });
    let renderer = new NaixtGameRenderer();
    let pov = NaixtPlayer.FIRST_PLAYER;
    let controller = new NaixtGameController({ engine, renderer, pov });
    let gameArea = document.querySelector(".game-area");

    let peer = new PeerConnection();
    /**** main menu interface panel ****/
    panelEngine.addPanel(MainMenuPanel, ".interface-view", { peer });

    /**** lobby interface panel ****/
    panelEngine.addPanel(LobbyPanel, ".lobby-view", { peer });
    this.document.querySelector(".lobby-peers").addEventListener("click", ev => {
        if(ev.target.classList.contains("connect-peer")) {
            let peerId = ev.target.parentElement.querySelector(".their-peer-id");
            assert(peerId, "No peer ID found");
            peerId = peerId.textContent;
            console.log(peerId);
            // TODO: popup content to reply with user's name while waiting
            let popup = Popup.withTitleAndContent("Waiting...", "No response yet", ["Cancel"]);
            popup.addEventListener("accept", () => {
                peer.cancelConnectionRequest(peerId);
            });
            popup.addEventListener("cancel", () => {
                peer.cancelConnectionRequest(peerId);
            });
            popup.deploy();
            peer.requestConnectionWithPeer(peerId)
                .then(conn => {
                    console.log("Successfully established connection", conn);
                    popup.kill();
                    panelEngine.focus("game-view");
                })
                .catch(err => {
                    popup.kill();
                    Popup.withTitleAndContent("Could not connect", `Reason: ${err.reason}`, ["OK"])
                        .deploy();
                });
        }
    });
    /*panelEngine.addButtonTransition(".solo-mode", "game-view", () => {
        controller.initialize(gameArea);
        controller.render();
    });
    */
    // cors: peerjs --port 9007 --key peerjs --allow_discovery --cors=http://localhost:8080
    /*
    panelEngine.addButtonTransition(".peer-host", "host-view", () => {
        let statusMessage = document.querySelector(".host-status");
        statusMessage.textContent = "Awaiting response from Peer server...";
        peer ??= new PeerConnection();
        peer.connect().then(id => {
            statusMessage.textContent = `Your id: ${id}`;
        });
    });
    panelEngine.addButtonTransition(".peer-connect", "connect-view", () => {
        let statusMessage = document.querySelector(".connect-status");
        statusMessage.textContent = "Please enter a Peer ID (doesn't work yet)";
    });
    */

    // TODO: READDD
    /*panelEngine.#addButtonTransition(".interface-options", "options-view", () => {
        optionsPeerServer.value = NaixtLocalStorage.get("peerServer");
        syncOptionsVisualState();
    });*/

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
    // TODO: READDDDDD
    // panelEngine.#addButtonTransition(".options-return", "interface-view");

    /**** host view panel ****/
    // panelEngine.addButtonTransition(".host-return", "interface-view");

    /**** connect view panel ****/
    // panelEngine.addButtonTransition(".connect-return", "interface-view");

    /**** spectate view panel ****/
    // TODO

    /**** game view panel ****/
    // TODO: add button for mobile users?
    let chatInput = document.querySelector(".chat-input");
    let chatRecord = document.querySelector(".chat-record");
    const appendChatMessage = ({ from, content }) => {
        chatRecord.appendChild(makeElement("div", [
            makeElement("strong", from + ": "),
            makeElement("span", content),
        ]));
    };
    chatInput.addEventListener("keydown", ev => {
        if(ev.key === "Enter") {
            // submit
            peer.broadcastMessage(chatInput.value);
            appendChatMessage({ from: "'me' (fix)", content: chatInput.value });
            // TODO: relate to my metadata
            chatInput.value = "";
        }
    });
    peer.addEventListener("chatMessage", ev => {
        let { content, from } = ev.detail;
        appendChatMessage({ from, content });
    });

    // TODO: remove debug interface stuff
    window.controller = controller; // TODO: remove debug
    document.getElementById("swap-perspective")?.addEventListener("click", () => {
        controller.pov = NaixtPlayer.opponentForPlayer(controller.pov);
        controller.render();
    });
});
