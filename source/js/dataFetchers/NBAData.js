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
    const data = await (await fetch(url)).json();
    return this.labeledBoxScoreData(data);
  },

  /* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
  labeledBoxScoreData(data) {
    const labeledData = data;
    try {
      const homePlayers = labeledData.sports_content.game.home.players.player;
      labeledData.sports_content.game.home.players.starters = homePlayers.splice(0, 5);
      labeledData.sports_content.game.home.players.bench = homePlayers;

      const awayPlayers = labeledData.sports_content.game.visitor.players.player;
      labeledData.sports_content.game.visitor.players.starters = awayPlayers.splice(0, 5);
      labeledData.sports_content.game.visitor.players.bench = awayPlayers;
    } catch (e) { }
    return labeledData;
  },

  async getSchedule(date) {
    const url = `http://data.nba.com/json/cms/noseason/scoreboard/${this.formatDate(date)}/games.json`;
    const data = await (await fetch(url)).json();
    const labeledData = this.labelScheduleData(data);
    return labeledData;
  },

  labelScheduleData(data) {
    const newData = data;
    _.map(newData.sports_content.games.game, (v) => {
      const game = v;

      const homeScore = parseInt(game.home.score, 10);
      const visitorScore = parseInt(game.visitor.score, 10);

      game.home.winning = (homeScore > visitorScore);
      game.visitor.winning = (visitorScore > homeScore);

      try {
        if (game.period_time.period_status === 'PPD') {
          game.period_time.period_status = 'Postponed';
        } else if (game.period_time.game_status === '1') {
          const hours = parseInt(game.time.substring(0, 2), 10);
          const minutes = parseInt(game.time.substring(2, 4), 10);
          const yyyy = parseInt(game.date.substring(0, 4), 10);
          const mm = parseInt(game.date.substring(4, 6), 10);
          const dd = parseInt(game.date.substring(6, 8), 10);

          const date = new Date(yyyy, mm, dd);

          const EST_UTC_OFFSET = 5; // EST + 5 = UTC

          date.setUTCHours((hours + EST_UTC_OFFSET) % 24, minutes);
          const gametime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          game.period_time.period_status = gametime;
        }
      } catch (e) {
        console.log(e);
      }

      /* quarter status */

      /*
        clear game_clock if game is done or in half-time, the API sometimes
          still returns a value.
        Clear game_clock if 'Start/End of' (0.00 is redundant)
      */
      if (game.period_time.period_status === 'Final' ||
        game.period_time.period_status === 'Halftime' ||
        game.period_time.period_status.includes('Start') ||
        game.period_time.period_status.includes('End')) {
        game.period_time.game_clock = '';
      }

      // console.log(JSON.stringify(game.period_time));

      // Cleaning up time column, currently can get too long
      if (game.period_time.period_status.includes('Qtr') &&
        !game.period_time.period_status.includes('End')) {
        // #th Qtr ==> #Q
        game.period_time.period_status =
          `${game.period_time.period_value}Q`;
      } else if (game.period_time.period_status.includes('End')) {
        // End of 1st Qtr ==> End of 1st
        game.period_time.period_status =
          game.period_time.period_status.replace('Qtr', '');
      }

      // game is in overtime?
      const overtime = parseInt(game.period_time.period_value, 10);
      const status = parseInt(game.period_time.game_status, 10);

      if (overtime > 4 && status === 3) {
        game.overtime = (overtime - 4);
      }

      const periodValue = parseInt(game.period_time.period_value, 10);
      const gameClock = game.period_time.game_clock;

      if (devEnv) {
        // favorite team
        if (game.visitor.abbreviation === 'GSW' || game.home.abbreviation === 'GSW') {
          game.fav_team = true;
        }
      }

      // close game: game in progress, 4th qtr or OT, within 5 points
      if (status === 2 && periodValue > 3) {
        const gameClockMin = parseFloat(gameClock.split(':')[0]);

        /*
          last 5 minutes of regulation, or all of OT (OT is only 5 mins)
          if there is no :, it means there are only seconds left, which i currently
          check by length of split
        */
        if (gameClockMin < 6 || gameClock.split(':').length < 2) {
          const difference = parseInt(game.home.score, 10) - parseInt(game.visitor.score, 10);
          if (Math.abs(difference) < 6) {
            // mark as close game, and if its hidden, show
            game.close_game = true;
            // game.hidden = false;
          }
        }
      }
    });

    return newData;
  },

  // HELPER METHODS

  formatDate(date) {
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    const twoDigits = n => (n < 10 ? `0${n}` : `${n}`);
    return `${yyyy}${twoDigits(mm)}${twoDigits(dd)}`;
  },

  carryOverData(oldD, newD) {
    const oldData = oldD;
    const newData = newD;
    try {
      for (let i = 0; i < oldData.sports_content.games.game.length &&
        i < newData.sports_content.games.game.length; i += 1) {
        if (oldData.sports_content.games.game[i].id !==
          newData.sports_content.games.game[i].id) {
          console.log('data not same -- error');
          break;
        }

        const oldGame = oldData.sports_content.games.game[i];
        const newGame = newData.sports_content.games.game[i];

        // hide?
        if (oldGame.hidden && !oldGame.close_game) {
          newGame.hidden = true;
        }

        // highlight?
        let same;
        if (newGame.home.score === '') {
          same = true;
        } else {
          same = (parseInt(newGame.home.score, 10) + parseInt(newGame.visitor.score, 10)) ===
                 (parseInt(oldGame.home.score, 10) + parseInt(oldGame.visitor.score, 10));
        }
        newData.sports_content.games.game[i].highlight = !same;
      }
    } catch (excption) {
      // do nothing
    }
    return newData;
  },
};
