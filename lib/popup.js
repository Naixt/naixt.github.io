import { assert, assertDefined, makeElement } from "./lib.js";

class Popup extends EventTarget {
    constructor({ content, buttons, container } = {}) {
        super();
        this.container = container ?? document.querySelector(".popup-container");
        this.buttons = buttons ?? ["OK", "Cancel"];
        assertDefined({ content });
        this.content = content;//.cloneNode();
    }

    static withTitleAndContent(title, content, buttons) {
        return new Popup({
            content: makeElement("div", [
                makeElement("h2", title),
                makeElement("p", content),
            ]),
            buttons,
        });
    }

    #remove() {
        this.content.parentElement.remove();
        this.container.classList.add("hidden");
    }

    kill() {
        this.#remove();
        this.dispatchEvent(new CustomEvent("kill"));
    }

    cancel() {
        this.#remove();
        this.dispatchEvent(new CustomEvent("cancel"));
    }

    buttonClick(idx) {
        assertDefined({ idx });
        this.#remove();
        this.dispatchEvent(new CustomEvent("accept", { detail: {
            idx,
            name: this.buttons[idx],
            content: this.content,
        } }));
    }

    deploy() {
        this.container.classList.remove("hidden");
        this.container.addEventListener("click", (ev) => {
            if(ev.target === this.container) {
                this.cancel();
            }
        });
        let buttons = this.buttons.map((text, idx) => {
            let button = makeElement("button", text);
            button.addEventListener("click", () => {
                this.buttonClick(idx);
            });
            return button;
        });
        this.container.appendChild(makeElement("div.popup-inner", [
            this.content,
            makeElement("div.button-row", buttons),
        ]));
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
