import { assertDefined, makeElement } from "../lib.js";
import { Panel } from "./panel.js";

class GamePanel extends Panel {
    constructor(options = {}) {
        // TODO: DRY: PeerPanel with peer option initialization
        super(options);
        let { peer } = options
        assertDefined({ peer });
        this.peer = peer;
    }

    initialize() {
        super.initialize();
        // TODO: add button for mobile users?
        let chatInput = document.querySelector(".chat-input");
        let chatRecord = document.querySelector(".chat-record");
        const appendChatMessage = ({ from, content }) => {
            chatRecord.appendChild(makeElement("div", [
                makeElement("strong", from + ": "),
                makeElement("span", content),
            ]));
        };
        // TODO: add scroll to chat window
        chatInput.addEventListener("keydown", ev => {
            if(ev.key === "Enter") {
                // submit
                this.peer.broadcastMessage(chatInput.value);
                appendChatMessage({ from: "'me' (fix)", content: chatInput.value });
                // TODO: relate to my metadata
                chatInput.value = "";
            }
        });
        this.peer.addEventListener("chatMessage", ev => {
            let { content, from } = ev.detail;
            appendChatMessage({ from, content });
        });
    }
}

export { GamePanel };
