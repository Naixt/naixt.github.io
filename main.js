import { NaixtGameRenderer } from "./lib/render.js";
import { NaixtGameEngine } from "./lib/engine.js";
import { NaixtGameController } from "./lib/controller.js";
import { NaixtPlayer } from "./lib/player.js";
import { assert, assertDefined, makeElement } from "./lib/lib.js";
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

    let peer = new PeerConnection();
    /**** main menu interface panel ****/
    let lobbyPeers = document.querySelector(".lobby-peers");
    panelEngine.addButtonTransition(".connect", "lobby-view", () => {
        let peerIds = document.querySelectorAll(".my-peer-id");
        lobbyPeers.textContent = "";
        const refresh = () => {
            lobbyPeers.textContent = "";
            peer.getPeerList().then(list => {
                list.forEach(id => {
                    let connectButton = makeElement("button.connect-peer", "Connect");
                    lobbyPeers.appendChild(makeElement("li", [
                        connectButton,
                        makeElement("span.their-peer-id", id),
                    ]));
                });
                if(list.length === 0) {
                    lobbyPeers.appendChild(makeElement("li", "(nothing to see here!)"));
                }
            });
        };
        if(!peer) {
            peerIds.forEach(el => el.textContent = "Connecting...");
        }
        // TODO: advertise metadata about connection
        peer ??= new PeerConnection();
        peer.establishPeerId().then(id => {
            peerIds.forEach(el => el.textContent = id);
            refresh();
            let waitingPopup, metadata;
            peer.addEventListener("connectionRequest", ev => {
                // TODO: queue multiple connection requests
                metadata = ev.detail;
                console.log("Connection details:", metadata);
                waitingPopup = Popup.withTitleAndContent(
                    "Incoming connection",
                    `Accept connection from ${metadata.name}? (Peer id ${metadata.id})`,
                    ["Accept", "Deny"],
                );
                waitingPopup.addEventListener("accept", ev => {
                    let { name } = ev.detail;
                    if(name === "Accept") {
                        peer.acceptConnection(metadata.id);
                        panelEngine.focus("game-view");
                    }
                    else {
                        peer.rejectConnection(metadata.id);
                    }
                });
                waitingPopup.addEventListener("cancel", () => peer.rejectConnection(metadata.id));
                waitingPopup.deploy();
            }, { once: true });
            
            peer.addEventListener("connectionRequestCancelled", ev => {
                waitingPopup.kill();
                Popup.withTitleAndContent("Request cancelled", `${metadata.name} (id ${metadata.id}) cancelled their request`, ["OK"])
                    .deploy();
            }, { once: true });
        });
        document.querySelector(".lobby-refresh").addEventListener("click", refresh);
    });
    // TODO: REMOVE; TESTING
    document.querySelector(".connect").click();
    /**** lobby interface panel ****/
    lobbyPeers.addEventListener("click", ev => {
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
    // panelEngine.addButtonTransition(".host-return", "interface-view");

    /**** connect view panel ****/
    // panelEngine.addButtonTransition(".connect-return", "interface-view");

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
