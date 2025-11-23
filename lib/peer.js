import { Peer } from "https://esm.sh/peerjs@1.5.5?bundle-deps";
import { assert, assertDefined } from "./lib.js";

class PeerConnection {
    constructor() {
        this.peer = null;
    }

    handleData(packet) {
        console.log("received data:", packet);
    }

    host() {
        assert(this.peer === null, "TODO: changing peers");
        this.peer = new Peer();
        return new Promise((resolve, reject) => {
            this.peer.on("open", id => {
                this.id = id;
                resolve(this.id);
            });
        });
        // this.peer.on("connection", conn => {
        //     conn.on("data", this.handleData.bind(this));
        // });
    }

    connect(peerId) {
        assertDefined(peerId);
        this.peer = new Peer();
        let conn = this.peer.connect(peerId);
        conn.on("data", this.handleData.bind(this));
    }
}

class SoloConnection {

}

export { PeerConnection, SoloConnection };
