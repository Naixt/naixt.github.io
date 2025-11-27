import { Peer } from "https://esm.sh/peerjs@1.5.5?bundle-deps";
import { assert, assertDefined } from "./lib.js";
import { NaixtLocalStorage } from "./storage.js";

class PeerConnection {
    static #HOST = Symbol("PeerConnection.#HOST");
    static #GUEST = Symbol("PeerConnection.#GUEST");

    constructor() {
        this.peer = null;
        this.mode = null;
    }

    handleData(packet) {
        console.log("received data:", packet);
    }

    peerOptions() {
        return {
            host: NaixtLocalStorage.get("peerServer"),
            port: 9007,
        };
    }

    initializeHostConnection() {
        this.peer = new Peer(undefined, this.peerOptions());
        this.mode = PeerConnection.#HOST;
        return new Promise((resolve, reject) => {
            this.peer.on("open", id => {
                this.id = id;
                resolve(this.id);
            });
        });
    }

    host() {
        assert(this.peer === null || this.mode === PeerConnection.#HOST, "TODO: changing from host to guest");
        if(this.peer === null) {
            return this.initializeHostConnection();
        }
        return Promise.resolve(this.id);
        // this.peer.on("connection", conn => {
        //     conn.on("data", this.handleData.bind(this));
        // });
    }

    connect(peerId) {
        assertDefined(peerId);
        assert(this.peer === null || this.mode === PeerConnection.#GUEST, "TODO: changing from guest to host");
        this.peer = new Peer(undefined, this.peerOptions());
        this.mode = PeerConnection.#GUEST;
        let conn = this.peer.connect(peerId);
        conn.on("data", this.handleData.bind(this));
    }
}

class SoloConnection {

}

export { PeerConnection, SoloConnection };
