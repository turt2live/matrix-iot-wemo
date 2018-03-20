import { MatrixClient } from "matrix-bot-sdk";
import config from "./config";
import { WemoWatcher } from "./wemo-watcher";
import striptags = require("striptags");

export class CommandProcessor {
    constructor(private client: MatrixClient) {
    }

    public tryCommand(roomId: string, event: any): Promise<any> {
        let message = event['content']['body'];
        if (!message || !message.startsWith("!wemo")) return;
        if (roomId !== config.targetRoomId) return;

        if (message.trim() === "!wemo") message = "!wemo help";

        const cmdArgs = message.substring("!wemo".length).trim().split(" ");
        if (cmdArgs[0] === "status") {
            const htmlMessage = "Wemo Device Status:<br/><table><thead><tr>" +
                "<th>Device Name</th><th>Status</th>" +
                "</tr></thead><tbody>" +
                WemoWatcher.getDevices().map(d => "<tr><td>" + d.name + "</td><td>" + (d.isOn ? "on" : "off") + "</td></tr>").join("") +
                "</tbody></table>";
            const textMessage = "Wemo Device Status:\n" +
                WemoWatcher.getDevices().map(d => d.name + " is " + (d.isOn ? "on" : "off")).join("\n");
            this.client.sendMessage(roomId, {
                formatted_body: htmlMessage,
                format: "org.matrix.custom.html",
                body: textMessage,
                msgtype: "m.notice",
            });
        } else if (cmdArgs[0] === "on" || cmdArgs[0] === "off") {
            cmdArgs.splice(0, 1);
            const deviceName = cmdArgs.join(" ");
            if (WemoWatcher.setDeviceState(deviceName, cmdArgs[0] === "on")) {
                this.client.sendMessage(roomId, "State updated");
            } else {
                const htmlMessage = "<font color='red'>Device not found</font>";
                this.client.sendMessage(roomId, {
                    formatted_body: htmlMessage,
                    format: "org.matrix.custom.html",
                    body: striptags(htmlMessage),
                    status: "error",
                    msgtype: "m.notice",
                });
            }
        } else {
            const htmlMessage = "Wemo Help:<br/><pre><code>" +
                "!wemo help            - This menu\n" +
                "!wemo status          - List the status of each device\n" +
                "!wemo on <device>     - Turn a device on\n" +
                "!wemo off <device>     - Turn a device on\n" +
                "</code></pre>";
            this.client.sendMessage(roomId, {
                formatted_body: htmlMessage,
                format: "org.matrix.custom.html",
                body: striptags(htmlMessage),
                msgtype: "m.notice",
            });
        }
    }
}