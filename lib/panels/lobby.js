import { assertDefined, makeElement } from "../lib.js";
import { Popup } from "../popup.js";
import { Panel } from "./panel.js";

class LobbyPanel extends Panel {
    constructor(options) {
        super(options);
        let { peer } = options
        assertDefined({ peer });
        this.peer = peer;
        this.lobbyPeers = this.querySelector(".lobby-peers");
    }

    initialize() {
        let peerIds = this.querySelectorAll(".my-peer-id");
        this.lobbyPeers.textContent = "";
        if(!this.peer.id) {
            peerIds.forEach(el => el.textContent = "Connecting...");
        }
        // TODO: advertise metadata about connection
        this.peer.establishPeerId().then(id => {
            peerIds.forEach(el => el.textContent = id);
            this.refresh();
            let waitingPopup, metadata;
            this.peer.addEventListener("connectionRequest", ev => {
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
                        this.peer.acceptConnection(metadata.id);
                        this.panelEngine.focus("game-view");
                    }
                    else {
                        this.peer.rejectConnection(metadata.id);
                    }
                });
                waitingPopup.addEventListener("cancel", () => this.peer.rejectConnection(metadata.id));
                waitingPopup.deploy();
            }, { once: true });
            
            this.peer.addEventListener("connectionRequestCancelled", ev => {
                waitingPopup.kill();
                Popup.withTitleAndContent("Request cancelled", `${metadata.name} (id ${metadata.id}) cancelled their request`, ["OK"])
                    .deploy();
            }, { once: true });
        });
        this.querySelector(".lobby-refresh").addEventListener("click", this.refresh.bind(this));
    }

    refresh() {
        this.lobbyPeers.textContent = "";
        this.peer.getPeerList().then(list => {
            list.forEach(id => {
                let connectButton = makeElement("button.connect-peer", "Connect");
                this.lobbyPeers.appendChild(makeElement("li", [
                    connectButton,
                    makeElement("span.their-peer-id", id),
                ]));
            });
            if(list.length === 0) {
                this.lobbyPeers.appendChild(makeElement("li", "(nothing to see here!)"));
            }
        });
    }
}

export { LobbyPanel };
