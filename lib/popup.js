import { assert, assertDefined, makeElement } from "./lib.js";

class Popup {
    constructor({ content, container } = {}) {
        this.container = container ?? document.querySelector(".popup-container");
        assertDefined({ content });
        this.content = content;//.cloneNode();
        this.callbacks = {
            "cancel": [],
            "accept": [],
        };
    }

    remove() {
        this.content.parentElement.remove();
        this.container.classList.add("hidden");
    }

    cancel() {
        this.remove();
        this.callbacks.cancel.splice(0).forEach(cb => {
            cb();
        });
    }

    ok() {
        this.remove();
        this.callbacks.accept.splice(0).forEach(cb => {
            cb(this.content);
        });
    }

    deploy() {
        this.container.classList.remove("hidden");
        this.container.addEventListener("click", (ev) => {
            if(ev.target === this.container) {
                this.cancel();
            }
        });
        let okButton = makeElement("button", "OK");
        let cancelButton = makeElement("button", "Cancel");
        okButton.addEventListener("click", () => {
            this.ok();
        })
        cancelButton.addEventListener("click", () => {
            this.cancel();
        });
        this.container.appendChild(makeElement("div.popup-inner", [
            this.content,
            makeElement("div.button-row", [ okButton, cancelButton ]),
        ]));
    }

    addEventListener(type, cb) {
        assert(Array.isArray(this.callbacks[type]),
            `Cannot listen for ${type} on Popup; did you mean ${Object.keys(this.callbacks)}`);
        this.callbacks[type].push(cb);
    }
}

/*
// Example invocation
let popup = new Popup({ content: makeElement("div", [
    makeElement("h2", "Enter peer ID"),
    makeElement("input"),
]) });
popup.addEventListener("accept", (content) => {
    let { value: hostId } = content.querySelector("input");
    console.log(hostId);
});
popup.deploy();

*/

export { Popup };
