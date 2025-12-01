import { Peer } from "https://esm.sh/peerjs@1.5.5?bundle-deps";
import { assert, assertDefined } from "./lib.js";
import { NaixtLocalStorage } from "./storage.js";

class PeerConnection extends EventTarget {
    // static #HOST = Symbol("PeerConnection.#HOST");
    // static #GUEST = Symbol("PeerConnection.#GUEST");

    constructor() {
        super();
        this.peer = null;
        this.id = null;
        this.inboundConnections = {};
        this.outgoingConnections = {};
        this.connections = {};
        // this.mode = null;
    }

    static #PROTOCOLS = [ "http://", "https://" ];
    peerOptions() {
        let peerServer = NaixtLocalStorage.get("peerServer");
        let slashIndex = peerServer.indexOf("/");
        let host, path;
        if(slashIndex === -1) {
            host = peerServer;
            path = "/";
        }
        else {
            host = peerServer.slice(0, slashIndex);
            path = peerServer.slice(slashIndex);
        }
        let protocol = PeerConnection.#PROTOCOLS.find(protocol => host.startsWith(protocol));
        if(protocol) {
            host = host.slice(protocol.length);
        }
        else {
            protocol = PeerConnection.#PROTOCOLS[0]; // http by default
        }
        let port = 9007;
        // superset of the options the Peer constructor expects (i.e., {host, path, port})
        return {
            protocol, host, path, port,
        };
    }

    assertConnected() {
        assert(this.id !== null, "Expected peer connection to be initialized");
    }

    // there are no (other) options to the url/GET request
    peerAPI(method) {
        this.assertConnected();
        assert(method === "peers" || method === "id", `Unrecognized API: ${method}`);
        let { host, port, protocol } = this.peerOptions();
        return `${protocol}${host}:${port}/${this.id}/${method}`;
    }

    getPeerList() {
        // excludes myself
        this.assertConnected();
        return fetch(this.peerAPI("peers"))
            .then(req => req.json())
            .then(json => json.filter(id => id !== this.id));
    }

    establishPeerId() {
        if(this.id !== null) {
            console.warn("Warning: redundant connection while connected");
            return Promise.resolve(this.id);
        }
        return new Promise((resolve, reject) => {
            this.peer = new Peer(undefined, this.peerOptions());
            this.peer.on("open", id => {
                this.id = id;
                this.listenForConnections();
                resolve(this.id);
            });
            // TODO: handle reject
        });
    }

    listenForConnections() {
        this.assertConnected();
        // TODO: handle redundant listeners
        this.peer.on("connection", conn => {
            let { id } = conn.metadata;
            conn.on("open", () => {
                // TODO: automatically siphon certain requests (e.g. 2nd request to same host is a spectator request)
                console.log("Connection received:", conn);
                this.inboundConnections[id] = { conn };
                this.dispatchEvent(new CustomEvent("connectionRequest", { detail: conn.metadata }));
            });
            conn.on("data", data => this.handleData(id, data));
        });
    }

    descriptiveMetadata() {
        return {
            id: this.id,
            name: this.id.slice(0, 8), // TODO: let users set their names
        };
    }

    requestConnectionWithPeer(id) {
        return new Promise((resolve, reject) => {
            let conn = this.peer.connect(id, {
                metadata: this.descriptiveMetadata(),
            });
            conn.on("open", () => {
                this.outgoingConnections[id] = { conn, resolve, reject };
                // this.dispatchEvent("metadataReceived", ...)
                conn.on("data", data => this.handleData(id, data));
            });
        });
    }

    acceptConnection(id) {
        let { conn } = this.inboundConnections[id];
        conn.send({
            type: "accept",
        });
        this.connections[id] = {
            conn
        };
    }

    rejectConnection(id) {
        let { conn } = this.inboundConnections[id];
        delete this.inboundConnections[id];
        conn.send({
            type: "reject",
        });
        conn.close();
    }

    cancelConnectionRequest(id) {
        let { conn, reject } = this.outgoingConnections[id];
        conn.send({
            type: "cancelConnect",
        });
        conn.close();
        reject({ reason: "Cancelled request "});
    }

    handleData(id, data) {
        console.log("received data:", data, "from", id);
        // host packets
        if(data.type === "cancelConnect") {
            this.dispatchEvent(new CustomEvent("connectionRequestCancelled"));
            let { conn } = this.inboundConnections[id];
            conn.close();
        }
        // guest packets
        else if(data.type === "reject") {
            // we were rejected :(
            let { conn, reject } = this.outgoingConnections[id];
            reject({ reason: "Manual rejection" });
            conn.close();
        }
        else if(data.type === "accept") {
            // accepted :D
            let { resolve, conn } = this.outgoingConnections[id];
            resolve(conn);
        }
        else if(data.type === "chatMessage") {
            let { conn } = this.connections[id];
            this.dispatchEvent(new CustomEvent("chatMessage", { detail: {
                content: data.message,
                from: conn.metadata.name,
            } }));
        }
    }

    /*
    initializeHostConnection() {
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
    */
}

class SoloConnection {

}

export { PeerConnection, SoloConnection };
