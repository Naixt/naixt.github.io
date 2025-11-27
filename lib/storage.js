import { assert, assertDefined } from "./lib.js";

class LocalStorageSync {
    constructor(key, defaultData) {
        assertDefined({ key, defaultData });
        this.key = key;
        this.data = null;
        this.defaultData = defaultData;
    }

    loadLocalData() {
        localStorage[this.key] ??= JSON.stringify(this.defaultData);
        return this.data = JSON.parse(localStorage[this.key]);
    }

    saveLocally() {
        // XXX: can throw QuotaExceededError, but this is not likely in our application
        localStorage[this.key] = JSON.stringify(this.data);
    }

    clearLocalData() {
        localStorage[this.key] = JSON.stringify(this.defaultData);
        this.data = {};
    }

    assertLoaded() {
        assert(this.data !== null, "Expected LocalStorageSync instance to be loaded (did you forget to call loadLocalData?)");
    }

    get(key) {
        this.assertLoaded();
        assertDefined({ key });
        return this.data[key];
    }

    set(key, value) {
        assertDefined({ key, value });
        this.data[key] = value;
        this.saveLocally();
        return this.data[key];
    }
}

const NaixtLocalStorage = new LocalStorageSync("naixt", {
    peerServer: "localhost"
    // TODO: does peer.foxboy.stream work?
});
NaixtLocalStorage.loadLocalData();

export { LocalStorageSync, NaixtLocalStorage };
