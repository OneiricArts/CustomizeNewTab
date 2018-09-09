const NFLData = { // eslint-disable-line no-unused-vars
  async getNFLData() {
    // get main data
    const url = 'http://www.nfl.com/liveupdate/scores/scores.json';
    const scores = await (await fetch(url)).json();

    let combinedData = {};
    try {
      // get additional data
      const specificUrl = 'https://feeds.nfl.com/feeds-rs/scores.json';
      const scorestrip = await (await fetch(specificUrl)).json();
      combinedData = this.combineNFLAPIData(scores, scorestrip);
    } catch (e) {
      combinedData = this.combineNFLAPIData(scores, null);
    }

    combinedData = this.labelScheduleData(combinedData);
    return combinedData;
  },

  combineNFLAPIData(primaryData, additionalData) {
    const combinedData = {};

    combinedData.gms = _.map(primaryData, (v, k) => {
      const g = v;
      g.eid = parseInt(k, 10);
      return g;
    });

    if (!additionalData) {
      return combinedData;
    }

    // convert ss.json games array to object
    const additionalDataObj = {};
    for (let i = 0; i < additionalData.gameScores.length; i += 1) {
      const g = additionalData.gameScores[i];
      additionalDataObj[g.gameSchedule.gameId] = g;
    }

    _.map(combinedData.gms, (v) => {
      const g = v;
      g.extrainfo = additionalDataObj[g.eid];
      return g;
    });

    combinedData.w = additionalData.week;

    return combinedData;
  },

  labelScheduleData(data) {
    _.map(data.gms, (v) => {
      const game = v;

      // if (!isNaN(schedule.gms[i].extrainfo.q) || schedule.gms[i].extrainfo.q === 'P') {
      if (game.qtr && !game.qtr.includes('Final') && !isNaN(game.qtr)) {
        game.playing = true;
      }

      // can't check for score table in handlebars, because it 0 is a valid entry,
      // but if(0) is false
      if (game.home.score[1] !== null) {
        game.scoreTable = true;
      }

      // label whos winning
      if (game.home.score.T !== null) {
        const homeScore = parseInt(game.home.score.T, 10);
        const visitorScore = parseInt(game.away.score.T, 10);

        if (homeScore > visitorScore) {
          game.home_winning = true;
        }
        if (visitorScore > homeScore) {
          game.visitor_winning = true;
        }
      }

      // who has possession
      if (game.playing &&
        game.posteam === game.home.abbr) {
        game.home_pos = true;
      } else if (game.playing &&
        game.posteam === game.away.abbr) {
        game.visitor_pos = true;
      }

      // local time
      if (game.extrainfo) {
        const hours = parseInt(game.extrainfo.gameSchedule.gameTimeEastern.split(':')[0], 10);

        const options = {};
        if (hours >= 0 && hours <= 10) {
          options.ampm = 'PM';
        } else {
          options.ampm = 'AM';
        }

        game.t = this.toLocalTime(
          game.extrainfo.gameSchedule.gameTimeEastern.split(':')[0] - 1,
          game.extrainfo.gameSchedule.gameTimeEastern.split(':')[1],
          options,
        ).split(' ')[0];

        const gameDate = new Date(game.extrainfo.gameSchedule.gameDate);
        game.extrainfo.gameSchedule.gameDate = gameDate.toLocaleString('en-us', { weekday: 'short' });
      } else {
        game.t = `${game.eid.toString().substring(4, 6)}.${game.eid.toString().substring(6, 8)}`;
      }

      /**
       * tweaking game.qtr looks
       */
      if (game.qtr === 'final overtime') {
        // overtime makes column too long
        game.qtr = 'final OT';
      } else if (game.qtr === 'Pregame') {
        // pregame is useless info
        game.qtr = `${game.extrainfo.gameSchedule.gameDate} ${game.t}`;
      }

      if (devEnv) {
        if (game.home.abbr === 'SF' || game.away.abbr === 'SF' ||
            game.home.abbr === 'NE' || game.away.abbr === 'NE') {
          game.fav_team = true;
        }
      }
    });

    return data;
  },

  toLocalTime(hrs, mins, opts) {
    let options = opts;
    if (!opts) {
      options = {};
    }

    try {
      let hours = parseInt(hrs, 10);
      const minutes = parseInt(mins, 10);

      // convert to 24 hours if need to (and provide AM/PM)
      if (options.ampm === 'PM' && hours < 12) {
        hours += 12;
      } else if (options.ampm === 'AM' && hours === 12) {
        hours = 0;
      }

      // EST + 5 = UTC
      const EST_UTC_OFFSET = 5;

      const date = new Date();
      date.setUTCHours((hours + EST_UTC_OFFSET) % 24, minutes, 0);

      if (!options.format) {
        options.format = { hour: '2-digit', minute: '2-digit' };
      }
      return date.toLocaleTimeString([], options.format);
    } catch (e) {
      console.log(e);
      return null;
    }
  },

  carryOverData(oldD, newD) {
    const oldData = oldD;
    const newData = newD;

    try {
      // if data is for the same week, carry over any data that I need to
      if (oldData && oldData.gms && oldData.w === newData.w) {
        for (let i = 0; i < newData.gms.length && oldData.gms.length; i += 1) {
          if (newData.gms[i].eid === oldData.gms[i].eid && oldData.gms[i].hidden) {
            newData.gms[i].hidden = true;
          }
        }
      }
    } catch (e) {
      // don't carry anything over
    }

    return newData;
  },
};
