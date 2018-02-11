const NBAData = { // eslint-disable-line no-unused-vars
  async getStandings(year) {
    const url = `http://data.nba.com/json/cms/${year}/standings/conference.json`;
    const standings = await (await fetch(url)).json();
    return standings;
  },

  async getBoxScore(date, gameID) {
    // href="http://data.nba.com/json/cms/noseason/game/{{@root.schedule.date}}/{{id}}/boxscore.json"
    // http://data.nba.com/json/cms/noseason/game/20180210/0021700826/boxscore.json
    const url = `http://data.nba.com/json/cms/noseason/game/${this.formatDate(date)}/${gameID}/boxscore.json`;
    return (await fetch(url)).json();
  },

  // HELPER METHODS

  formatDate(date) {
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    const twoDigits = n => (n < 10 ? `0${n}` : `${n}`);
    return `${yyyy}${twoDigits(mm)}${twoDigits(dd)}`;
  },
};
