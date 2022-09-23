const util = require("../util");

module.exports = {
  async execute({ event }, handlers) {
    const user = util.usersMap.get(event.senderID);

    const gameId = event.threadID;

    if (util.isUserInAGame(event.senderID))
      return handlers.reply(
        "Bạn đang tham gia một trận đấu, !thoatphong để thoát khỏi trận đấu.",
        event.threadID
      );

    if (!util.isGameExist(gameId))
      return handlers.reply("Game ID không tồn tại!", event.threadID);

    util.joinGame(gameId, event.senderID);

    const game = util.getGameById(gameId);

    let message = `Người chơi ${user.name} đã tham gia!\n\nNgười chơi đã tham gia:\n`;

    game.players.forEach((player, index) => {
      message += `[${index + 1}] ${player.name}\n`;
    });

    handlers.reply(message, event.threadID);
  },
};
