const login = require("facebook-chat-api");
const requireDir = require("require-dir");
const commands = requireDir("./commands");
const fs = require("fs");
const util = require("./util");
const Player = require("./game/Player");

login(
  { appState: JSON.parse(fs.readFileSync("appstate.json", "utf-8")) },
  async (err, api) => {
    api.setOptions({
      selfListen: true,
      logLevel: "silent",
      updatePresence: false,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36",
    });

    api.listenMqtt(async function (err, event) {
      if (err) return console.error(err);
      if (event.type !== "message") return;
      if (!event.isGroup) return;
      if (!event.body.startsWith("!")) return;

      if (!util.usersMap.has(event.senderID)) {
        const username = await util.getUsername(api, event.senderID);
        util.usersMap.set(event.senderID, new Player(username, event.senderID));
      }

      try {
        const args = event.body.slice(1).trim().split(/ +/g);
        const command = args.shift().replace(/\./g, "_");

        if (typeof commands[command].execute !== "function") return;

        const userFunction = commands[command].execute;

        const parameters = {
          args,
          api,
          event,
        };

        await userFunction(parameters);
      } catch (err) {
        console.log(err);
        api.sendMessage(`Error: ${err.message}`, event.senderID);
      }
    });
  }
);
