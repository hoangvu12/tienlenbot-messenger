const util = require("../util");

module.exports = {
  execute({ args, event }, handlers) {
    if (args.length === 0)
      return handlers.reply("Vui lòng nhập số thứ tự của lá bài!");

    if (!Array.isArray(args)) {
      return handlers.reply("Vui lòng nhập số thứ tự của lá bài! (VD: 0 1 2)");
    }

    const cards = args.map((index) => parseInt(index) - 1);

    if (!util.isUserInAGame(event.senderID))
      return handlers.reply("Bạn không có tham gia trận đấu nào!");

    const user = util.usersMap.get(event.senderID);
    const game = util.getGameById(util.getGameIdFromUser(event.senderID));
    const response = game.play(cards, event.senderID);

    let message = `${user.name} đánh:\n\n${util.displayCards(response.cards)}`;

    const remainingCardsOfPlayersMessage = game.players
      .map((player) => `${player.name} còn ${player.cards.length} lá bài.`)
      .join("\n");

    const actionMessage =
      "Bạn có thể !danh {sothutu} để đánh, hoặc !boluot để bỏ lượt.";

    if (!response.success) return handlers.reply(response.message);

    if (!response.win) {
      const finalMessage = `${message}\n\n${response.message}\n\n${remainingCardsOfPlayersMessage}\n\n${actionMessage}`;

      handlers.reply({
        body: finalMessage,
        mentions: [
          {
            tag: `@${response.nextPlayer.name}`,
            id: response.nextPlayer.id,
            fromIndex: 0,
          },
        ],
      });

      const userCurrentCards = util.displayCards(response.player.cards, {
        userCard: true,
      });

      return handlers.send(userCurrentCards, event.senderID);
    } else {
      if (game.players.length - game.leaderboard.length !== 1) {
        message = `${message}\n\n${user.name} đã hết lá bài.\n${response.message}`;
        handlers.reply(message);
      } else {
        //All but one player ran out of cards. Add the last player to the leaderboard and end the game.
        util.addLastPlayerToLeaderBoard(game);
        let leaderBoard = util.displayLeaderBoard(game.leaderboard);

        message = `${message}\n\n${user.name} đã hết lá bài.\nTrận đấu kết thúc\n\nBảng xếp hạng:${leaderBoard}\n\n!batdau để bắt đầu trận đấu mới!`;

        handlers.reply(message);

        game.endGame();
      }
    }
  },
};
