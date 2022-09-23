const fs = require("fs");
const login = require("facebook-chat-api");
const readline = require("readline");

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const obj = {
  email: "hggamingg25@gmail.com",
  password: "ChannelRice059!",
};

login(
  obj,
  {
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36",
  },
  (err, api) => {
    if (err) {
      switch (err.error) {
        case "login-approval":
          console.log("Enter code > ");
          rl.on("line", (line) => {
            err.continue(line);
            rl.close();
          });
          break;
        default:
          console.error(err);
      }
      return;
    }
    fs.writeFileSync("appstate.json", JSON.stringify(api.getAppState()));

    // Logged in!
  }
);
