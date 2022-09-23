const util = require("../util");

module.exports = {
  execute({ event }, handlers) {
    if (!util.isUserInAGame(event.senderID))
      return handlers.reply(
        "Bạn không có tham gia trận đấu nào!",
        event.threadID
      );

    const game = util.getGameById(util.getGameIdFromUser(event.senderID));

    if (game.inProgress) {
      return handlers.reply("Không thể thoát khi trận đấu đang diễn ra!");
    }

    util.leaveGame(event.threadID);

    return handlers.reply("Bạn đã thoát trận đấu");
  },
};
