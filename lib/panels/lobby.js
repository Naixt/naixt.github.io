import { assert, assertDefined, makeElement } from "../lib.js";
import { Popup } from "../popup.js";
import { Panel } from "./panel.js";

class LobbyPanel extends Panel {
    constructor(options) {
        super(options);
        let { peer } = options
        assertDefined({ peer });
        this.peer = peer;
        this.lobbyPeers = this.querySelector(".lobby-peers");
        // TODO: scope below to `id`
        this.waitingPopup = null;
        this.metadata = null;
    }

    initialize() {
        super.initialize();
        let peerIds = this.querySelectorAll(".my-peer-id");
        this.lobbyPeers.textContent = "";
        if(!this.peer.id) {
            peerIds.forEach(el => el.textContent = "Connecting...");
        }
        // TODO: advertise metadata about connection
        this.peer.establishPeerId().then(id => {
            peerIds.forEach(el => el.textContent = id);
            this.refresh();
            this.peer.addEventListener("connectionRequest",
                ev => this.handleInboundConnectionRequest(ev.detail),
                { once: true });
            
            this.peer.addEventListener("connectionRequestCancelled",
                () => this.cancelConnectionRequest(),
                { once: true });
        });
        this.querySelector(".lobby-refresh").addEventListener("click", this.refresh.bind(this));

        
        this.lobbyPeers.addEventListener("click", ev => {
            if(ev.target.classList.contains("connect-peer")) {
                let peerId = ev.target.parentElement.querySelector(".their-peer-id");
                this.requestConnectionWithPeer(peerId);
            }
        });
    }

    handleInboundConnectionRequest(metadata) {
        // TODO: queue multiple connection requests
        this.metadata = metadata;
        console.log("Connection details:", this.metadata);
        this.waitingPopup = Popup.withTitleAndContent(
            "Incoming connection",
            `Accept connection from ${this.metadata.name}? (Peer id ${this.metadata.id})`,
            ["Accept", "Deny"],
        );
        this.waitingPopup.addEventListener("accept", ev => {
            let { name } = ev.detail;
            if(name === "Accept") {
                this.peer.acceptConnection(this.metadata.id);
                this.panelEngine.focus("game-view");
            }
            else {
                this.peer.rejectConnection(this.metadata.id);
            }
        });
        this.waitingPopup.addEventListener("cancel", () => this.peer.rejectConnection(this.metadata.id));
        this.waitingPopup.deploy();
    }

    cancelConnectionRequest() {
        this.waitingPopup.kill(); // TODO: delete?
        Popup.withTitleAndContent("Request cancelled", `${metadata.name} (id ${metadata.id}) cancelled their request`, ["OK"])
            .deploy();
    }

    requestConnectionWithPeer(peerId) {
        assert(peerId, "No peer ID found");
        peerId = peerId.textContent;
        console.log("Requesting connection with", peerId);
        // TODO: popup content to reply with user's name while waiting
        let popup = Popup.withTitleAndContent("Waiting...", "No response yet", ["Cancel"]);
        popup.addEventListener("accept", () => {
            // accepting here (via Cancel) button also means to cancel
            this.peer.cancelConnectionRequest(peerId);
        });
        popup.addEventListener("cancel", () => {
            this.peer.cancelConnectionRequest(peerId);
        });
        popup.deploy();
        this.peer.requestConnectionWithPeer(peerId)
            .then(conn => {
                console.log("Successfully established connection", conn);
                popup.kill();
                this.panelEngine.focus("game-view");
            })
            .catch(err => {
                popup.kill();
                console.error(err);
                Popup.withTitleAndContent("Could not connect", `Reason: ${err.reason}`, ["OK"])
                    .deploy();
            });
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
