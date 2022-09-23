const util = require("../util");

module.exports = {
  execute({ event }, handlers) {
    if (!util.isUserInAGame(event.senderID))
      return handlers.reply("Bạn không có tham gia trận đấu nào!");

    const game = util.getGameById(util.getGameIdFromUser(event.senderID));
    const skipResult = game.handleSkip(event.senderID);

    handlers.reply({
      body: skipResult.message,
      mentions: [
        {
          tag: `@${skipResult.nextPlayer.name}`,
          id: skipResult.nextPlayer.id,
          fromIndex: 0, // Highlight the second occurrence of @Sender
        },
      ],
    });
  },
};
