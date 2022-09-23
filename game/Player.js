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

class Player {
  constructor(name, id) {
    //Username from Discord
    this.slug = stringToSlug(name);
    this.name = name;
    //Unique ID from Discord
    this.id = id;
    this.skip = false;
    this.gameId = null;
  }

  giveCards(cards) {
    this.cards = cards;
  }

  setGameId(id) {
    this.gameId = id;
  }
}
module.exports = Player;
