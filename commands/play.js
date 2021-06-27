const util = require("../util");

module.exports = {
  execute({ args, api, event }) {
    if (args.length === 0)
      return api.sendMessage("Vui lòng nhập index của lá bài!", event.threadID);

    const cards = args;

    if (!util.isUserInAGame(event.senderID))
      return api.sendMessage(
        "Bạn không có tham gia trận đấu nào!",
        event.threadID
      );

    const user = util.usersMap.get(event.senderID);
    const game = util.getGameById(util.getGameIdFromUser(event.senderID));
    const response = game.play(cards, event.senderID);

    let message = `${user.name} đánh:\n\n${util.displayCards(response.cards)}`;

    if (!response.success)
      return api.sendMessage(response.message, event.threadID);

    if (!response.win) {
      api.sendMessage(`${message}\n\n${response.message}`, event.threadID);

      const userCurrentCards = util.displayCards(response.player.cards, {
        userCard: true,
      });

      return api.sendMessage(userCurrentCards, event.senderID);
    } else {
      if (game.players.length - game.leaderboard.length !== 1) {
        message = `${message}\n\n${user.name} đã hết lá bài.\n${response.message}`;
        api.sendMessage(message, event.threadID);
      } else {
        //All but one player ran out of cards. Add the last player to the leaderboard and end the game.
        util.addLastPlayerToLeaderBoard(game);
        let leaderBoard = util.displayLeaderBoard(game.leaderboard);

        message = `${message}\n\n${user.name} đã hét lá bài.\nTrận đấu kết thúc\n\nBảng xếp hạng:${leaderBoard}`;

        api.sendMessage(message, event.threadID);

        // util.resetUsers(game.players);
        // util.removeGameById(game.id);
      }
    }
  },
};
