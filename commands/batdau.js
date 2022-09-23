const util = require("../util");
module.exports = {
  execute({ event }, handlers) {
    if (!util.isUserInAGame(event.senderID)) {
      return handlers.reply("Bạn không có tham gia trận đấu nào!");
    }

    const game = util.getGameById(util.getGameIdFromUser(event.senderID));

    const response = game.startGame();

    if (!response.success) return handlers.reply(response.message);

    const playersInGame = game.getPlayers();

    playersInGame.forEach((player) => {
      const message = util.displayCards(player.cards, { userCard: true });

      handlers.send(message, player.id);
    });

    const currentTurn = playersInGame[game.currentPlayer].name;

    handlers.send(`Lượt đánh của ${currentTurn}. !danh {sothutu} để đánh`);
  },
};
