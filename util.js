const Card = require("./game/Card.js");
const Player = require("./game/Player");
const fs = require("fs");

const gamesMap = new Map();
const usersMap = new Map();

const numbers = [
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
  "2",
];

const suites = ["Spade", "Club", "Diamond", "Heart"];

function stringToSlug(str) {
  // remove accents
  var from =
      "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ",
    to =
      "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy";
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(RegExp(from[i], "gi"), to[i]);
  }

  str = str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");

  return str;
}

function isUserInAGame(userId) {
  return !!usersMap.get(userId).gameId;
}

function getGameIdFromUser(userId) {
  return usersMap.get(userId).gameId;
}

function joinGame(gameId, userId) {
  const game = getGameById(gameId);
  const user = usersMap.get(userId);
  const responseMsg = game.addPlayer(userId, user.name);

  if (responseMsg.success) {
    user.setGameId(gameId);
    usersMap.set(userId, user);
  }

  return responseMsg;
}

function leaveGame(userId) {
  const user = usersMap.get(userId);

  const newPlayer = new Player(user.name, user.id);

  usersMap.set(userId, newPlayer);
}

function getUsername(api, id) {
  return new Promise((resolve, reject) => {
    api.getUserInfo(id, function (err, obj) {
      if (err) reject(err);

      for (let userId in obj) {
        resolve(obj[userId].name);
      }
    });
  });
}

function isGameExist(id) {
  return !!gamesMap.has(id);
}

function getGameById(id) {
  return gamesMap.get(id);
}

function removeGameById(id) {
  gamesMap.delete(id);
}

function displayCardsImage(cards) {
  return cards.map((card) => fs.createReadStream(card.file_path));
}

function displayCards(cards, options) {
  const suites = {
    Spade: { icon: "♤", name: "Bích" },
    Club: { icon: "♧", name: "Nhép" },
    Diamond: { icon: "◇", name: "Rô" },
    Heart: { icon: "♡", name: "Cơ" },
  };

  let message = "";

  if (options?.userCard) message = "|----------------------------|\n\n";

  cards.forEach((card, index) => {
    const suite = suites[card.suite];
    message += `[${index + 1}]  ${card.number}${suite.icon} (${suite.name})\n`;
  });

  message += "";

  if (options?.userCard) {
    message += "\n|----------------------------|";
  }

  return message;
}

function resetUsers(users) {
  users.forEach((user) => {
    usersMap.set(user.id, new Player(user.name, user.id));
  });
}

function addLastPlayerToLeaderBoard(game) {
  game.players.forEach((player) => {
    if (game.leaderboard.indexOf(player) === -1) {
      game.leaderboard.push(player);
    }
  });
}

function displayLeaderBoard(leaderBoard) {
  let message = "\n";
  leaderBoard.forEach((player, index) => {
    message += `[${index + 1}] ${player.name}\n`;
  });
  return message;
}

function createDeck() {
  let newDeck = [];
  suites.forEach((suite) => {
    numbers.forEach((number) => {
      newDeck.push(new Card(number, suite));
    });
  });
  shuffle(newDeck);
  return newDeck;
}

//Fisher-Yates (aka Knuth) Shuffle.
function shuffle(cards) {
  let currentIndex = cards.length,
    temporaryValue,
    randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
  return cards;
}

function contains(cards, number, suite) {
  let i = 0;
  while (i < cards.length) {
    if (cards[i].getNumber() === number && cards[i].getSuite() === suite) {
      return true;
    }
    i++;
  }
  return false;
}

//Organize the shuffled cards based on number and suite
function organizeCards(cards) {
  let organized = [];
  numbers.forEach((number) => {
    suites.forEach((suite) => {
      if (contains(cards, number, suite)) {
        organized.push(new Card(number, suite));
      }
    });
  });
  return organized;
}

function distributeCards(length, players, cards) {
  for (let i = 0; i < length; i++) {
    players[i].giveCards(organizeCards(cards.splice(0, 13)));
  }
}

function findThreeOfSpades(players) {
  for (let i = 0; i < players.length; i++) {
    if (contains(players[i].cards, "3", "Spade")) {
      return players[i];
    }
  }
  //if no one has a 3 of spades, first player is returned
  return players[Math.floor(Math.random() * players.length)];
}

function setNextPlayer(game) {
  //One player is left playing the round. Reset.
  if (numberOfSkippedPlayers(game.players) === game.players.length - 1) {
    return resetRound(game);
  }

  let currentIndex = game.currentPlayer;
  let finish = false;
  //look for the next player that didn't skip
  while (!finish) {
    if (currentIndex + 1 === game.players.length) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }
    if (!game.players[currentIndex].skip) {
      game.currentPlayer = currentIndex;
      finish = true;
    }
  }
  return "Giờ là lượt của @" + game.players[game.currentPlayer].name;
}

function numberOfSkippedPlayers(players) {
  let i = 0;
  players.forEach((player) => {
    if (player.skip) {
      i++;
    }
  });
  return i;
}

function resetRound(game) {
  //last player that didn't skip
  for (let i = 0; i < game.players.length; i++) {
    if (!game.players[i].skip) {
      game.currentPlayer = i;
    }
  }
  game.table.cards = [];
  game.table.type = "";
  game.table.size = 0;
  //reset player state
  game.players.forEach((player) => {
    //if the player is on the leaderboard (player has no more cards) they will always skip
    if (game.leaderboard.indexOf(player) === -1) {
      player.skip = false;
    }
  });

  return `Tất cả người chơi đã bỏ lượt
Bây giờ là lượt của @${game.players[game.currentPlayer].name}`;
}

//check if the cards are a valid sequence based on numbers
function validSequence(cards) {
  for (let i = 0; i < cards.length - 1; i++) {
    if (
      !(
        numbers.indexOf(cards[i + 1].number) -
          numbers.indexOf(cards[i].number) ===
        1
      )
    ) {
      return false;
    }
  }
  return true;
}

//checks if cards beat the cards on the table
function compareToTable(cards, type, table) {
  if (table.cards.length === 0) {
    return true;
  }
  //Bombs always beat a single 2
  if (
    table.type === "Single" &&
    table.cards[0].getNumber() === "2" &&
    type === "Bomb"
  ) {
    return true;
  }
  if (type !== table.type) {
    return false;
  }
  let lastCard = cards[cards.length - 1];
  let lastTableCard = table.cards[table.cards.length - 1];
  let lastCardIndex = numbers.indexOf(lastCard.number);
  let lastTableCardIndex = numbers.indexOf(lastTableCard.number);
  if (lastCardIndex > lastTableCardIndex) {
    return true;
  } else {
    //check for the suite of the last cards
    if (lastCardIndex === lastTableCardIndex) {
      if (
        suites.indexOf(lastCard.suite) > suites.indexOf(lastTableCard.suite)
      ) {
        return true;
      }
    }
  }
  return false;
}

function removeCards(index, playerIndex, players) {
  //Remove cards from the end since splice creates a new array and messes up indices
  for (let i = index.length - 1; i >= 0; i--) {
    players[playerIndex].cards.splice(index[i], 1);
  }
}

function bombDetector(cards) {
  //four of a kind
  if (cards.length === 4) {
    let number = cards[0].getNumber();
    for (let i = 1; i < cards.length; i++) {
      if (cards[i].getNumber() !== number) {
        return false;
      }
    }
    return true;
  }
  //double sequence
  if (cards.length === 6) {
    if (
      numbers.indexOf(cards[4].getNumber()) -
        numbers.indexOf(cards[2].getNumber()) ===
        1 &&
      numbers.indexOf(cards[2].getNumber()) -
        numbers.indexOf(cards[0].getNumber()) ===
        1
    ) {
      return true;
    }
  }
  return false;
}

function getPlayerById(playerId, players) {
  for (let i = 0; i < players.length; i++) {
    if (players[i].id === playerId) {
      return i;
    }
  }
  return null;
}

function validPlay(cards, table) {
  if (bombDetector(cards)) {
    return "Bomb";
  }
  if (cards.length !== table.size && table.size !== 0) {
    return false;
  }
  if (cards.length === 1) {
    return "Single";
  }
  if (cards.length === 2) {
    if (cards[0].number === cards[1].number) {
      return "Double";
    } else {
      return false;
    }
  }
  if (cards.length === 3) {
    if (
      cards[0].number === cards[1].number &&
      cards[0].number === cards[2].number
    ) {
      return "Triple";
    }
  }
  if (validSequence(cards)) {
    return "Sequence";
  } else {
    return false;
  }
}

function addHistory(cards, player, history, skip) {
  history.push({ cards: cards, player: player, skip: skip });
}

module.exports = {
  addHistory,
  validSequence,
  validPlay,
  createDeck,
  shuffle,
  getPlayerById,
  contains,
  organizeCards,
  numberOfSkippedPlayers,
  findThreeOfSpades,
  compareToTable,
  removeCards,
  setNextPlayer,
  distributeCards,
  getGameById,
  getGameIdFromUser,
  removeGameById,
  isGameExist,
  isUserInAGame,
  getUsername,
  joinGame,
  leaveGame,
  displayCards,
  displayCardsImage,
  addLastPlayerToLeaderBoard,
  displayLeaderBoard,
  resetUsers,
  stringToSlug,
  gamesMap,
  usersMap,
};
