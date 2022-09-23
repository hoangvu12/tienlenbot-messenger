const Player = require("./Player.js");
const Table = require("./Table.js");
const util = require("../util.js");

class Game {
  constructor(id) {
    this.id = id;
    //name of the game
    this.players = [];
    this.cards = [];
    //index of the current player
    this.currentPlayer = null;
    //table holds the cards played in a previous turn
    this.table = null;
    this.inProgress = false;
    this.leaderboard = [];
  }

  addPlayer(id, name) {
    const MAX_PLAYERS = 4;
    const returnObject = { success: true };

    if (this.inProgress) {
      returnObject.message =
        "Đang diễn ra trận đấu! Không thể thêm người chơi.";
      returnObject.success = false;

      return returnObject;
    }

    if (this.players.length >= 4) {
      returnObject.message = "Đã đủ người tham gia (tối đa 4 người).";
      returnObject.success = false;

      return returnObject;
    }

    const newPlayer = new Player(name, id);
    this.players.push(newPlayer);
    const availablePlayersLeft = MAX_PLAYERS - this.players.length;

    returnObject.message = `Thêm người chơi thành công, còn ${availablePlayersLeft} người chơi chưa tham gia.`;

    return returnObject;
  }

  endGame() {
    const gameId = this.id;

    this.inProgress = false;
    this.cards = [];
    this.currentPlayer = null;
    this.table = null;
    this.players = this.players.map((player) => {
      const user = new Player(player.name, player.id);

      user.setGameId(gameId);

      return user;
    });
    this.leaderboard = [];
  }

  startGame() {
    const MINIMUM_PLAYERS = 2;
    const returnObject = { success: true };

    if (this.inProgress) {
      returnObject.success = false;
      returnObject.message = "Không thể bắt đầu trận đấu đang diễn ra!";

      return returnObject;
    }

    if (this.players.length < MINIMUM_PLAYERS) {
      returnObject.success = false;
      returnObject.message = `Cần ${MINIMUM_PLAYERS} người chơi trở lên để bắt đầu!`;
      this.inProgress = false;

      return returnObject;
    }

    this.cards = util.createDeck();

    util.distributeCards(this.players.length, this.players, this.cards);

    this.currentPlayer = this.players.indexOf(
      util.findThreeOfSpades(this.players)
    );

    this.inProgress = true;

    this.table = new Table();

    returnObject.success = true;
    returnObject.message =
      "Đang phát bài cho người chơi... (Kiểm tra tin nhắn riêng).";

    return returnObject;
  }

  getPlayers() {
    return this.players;
  }

  getTableCards() {
    return this.table.cards;
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  handleSkip(playerId) {
    let userIndex = util.getPlayerById(playerId, this.players);

    const player = this.players[userIndex];

    if (userIndex === null) {
      return {
        player,
        message: "Bạn không có ở trong trận đấu!",
      };
    }

    if (userIndex !== this.currentPlayer) {
      return {
        player,
        message: "Không phải lượt của bạn!",
      };
    }

    player.skip = true;

    const skipMessage = util.setNextPlayer(this);

    const nextPlayer = this.players[this.currentPlayer];

    return {
      message: `${player.name} Bỏ lượt!\n ${skipMessage}`,
      player,
      nextPlayer,
    };
  }

  play(cardsIndex, playerId) {
    let returnObject = {
      success: false,
      message: "",
      cards: [],
      player: null,
      win: false,
    };

    let playerIndex = util.getPlayerById(playerId, this.players);

    if (playerIndex === null) {
      returnObject.message = "Bạn không tham gia trận đấu!";
      return returnObject;
    }

    if (playerIndex !== this.currentPlayer) {
      returnObject.message = "Không phải lượt của bạn!";
      return returnObject;
    }

    if (cardsIndex.length > this.players[playerIndex].cards.length) {
      returnObject.message = "Không đủ lá!";
      return returnObject;
    }

    //convert user input array of strings into array of integers and sort
    let intCardsIndex = cardsIndex.map((index) => parseInt(index));

    intCardsIndex.sort(function (a, b) {
      return a - b;
    });

    let chosenCards = intCardsIndex.map(
      (index) => this.players[playerIndex].cards[index]
    );

    try {
      let type = util.validPlay(chosenCards, this.table);

      if (!type) {
        returnObject.message = "Không hợp lệ!";
        return returnObject;
      }

      if (util.compareToTable(chosenCards, type, this.table)) {
        this.table.cards = chosenCards;
        this.table.type = type;

        util.removeCards(intCardsIndex, playerIndex, this.players);

        returnObject.message = util.setNextPlayer(this);
        returnObject.success = true;
        returnObject.cards = chosenCards;
        returnObject.player = this.players[playerIndex];
        returnObject.nextPlayer = this.players[this.currentPlayer];
      } else {
        returnObject.message = "Lá của bạn không thắng được lá trên bàn!";
        return returnObject;
      }

      if (this.players[playerIndex].cards.length === 0) {
        this.players[playerIndex].skip = true;
        this.leaderboard.push(this.players[playerIndex]);
        returnObject.win = true;
      }

      return returnObject;
    } catch {
      returnObject.message = "Không hợp lệ!";
      return returnObject;
    }
  }

  removePlayer(id) {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].id === id) {
        this.players.splice(i, 1);
        return true;
      }
    }
    return false;
  }
}

module.exports = Game;
