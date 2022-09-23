const util = require("../util");

module.exports = {
  execute({ args, api, event }) {
    if (args.length === 0)
      return api.sendMessage("Vui lòng nhập tên người chơi.", event.threadID);

    const playerName = args.join(" ");
    const slug = util.stringToSlug(playerName);

    if (!util.isUserInAGame(event.senderID)) {
      return api.sendMessage(
        "Bạn không có tham gia trận đấu nào!",
        event.threadID
      );
    }

    const game = util.getGameById(util.getGameIdFromUser(event.senderID));
    const players = game.players;

    const chosenPlayer = players.find((player) => player.slug === slug)[0];

    api.sendMessage(
      `Số bài hiện tại của ${chosenPlayer.name} là: ${chosenPlayer.cards.length}`,
      event.threadID
    );
  },
};
