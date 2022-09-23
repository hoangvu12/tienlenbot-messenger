const util = require("../util");
const Game = require("../game/Game");

function createGame(id) {
  util.gamesMap.set(id, new Game(id));
}

module.exports = {
  execute({ event }, handlers) {
    const gameId = event.threadID;

    if (util.usersMap.get(event.senderID).gameId)
      return handlers.reply(
        "Bạn đang tham gia một trận đấu, !thoatphong để thoát khỏi trận đấu.",
        event.threadID
      );

    if (util.isGameExist(gameId))
      return handlers.reply(
        "ID bị trùng khớp, vui lòng thử ID khác",
        event.threadID
      );

    createGame(gameId);

    util.joinGame(gameId, event.senderID);

    handlers.reply(
      `Tạo thành công! Mời người khác tham gia bằng cách chat "!thamgia"`,
      event.threadID
    );
  },
};
