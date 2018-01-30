const MLBData = {

  async getSchedule(date = new Date()) {
    date.setDate(date.getDate() + 0);
    const url = `http://gd2.mlb.com/components/game/mlb/${this.formattedDate(date)}/master_scoreboard.json`;

    try {
      const data = await (await fetch(url)).json();
      const gamesArray = this.convertScheduleToArray(data);
      const labeledSchedule = this.labelScheduleData(gamesArray);
      return labeledSchedule;
    } catch (e) {
      console.log('// MLB DATA RETREIVAL FAILED //');
      console.log(e);
    }
  },

  formattedDate(date) {
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    const twoDigits = n => (n < 10 ? `0${n}` : `${n}`);
    return `year_${yyyy}/month_${twoDigits(mm)}/day_${twoDigits(dd)}`;
  },

  convertScheduleToArray(data) {
    // case where only one game: API provides object instead of array, so create array with obj
    try {
      if (data.data.games.game && !Array.isArray(data.data.games.game)) {
        return [data.data.games.game];
      }
      return data;
    } catch (e) {
      console.log('// MLB convertScheduleToArray errored //');
      console.log(e);
    }
    return data;
  },

  labelScheduleData(data) {
    try {
      _.map(data, (v) => {
        const game = v;
        game.cnt = {};

        /**
         * _id
         * //////////////////////////////////////////////////////////////////////
         */
        game.cnt.id = game.game_pk;

        /**
         * _status
         * //////////////////////////////////////////////////////////////////////
         */
        let timeToShow;

        if (game.status.status === 'Final' || game.status.status === 'Postponed' || game.status.stat === 'Delayed') {
          timeToShow = game.status.status;
        } else if (game.status.status === 'In Progress') {
          timeToShow = game.status.inning;

          // FIXME: not showing up as symbol/emoji in output, just as a literal string
          if (game.status.inning_state === 'Top') {
            // timeToShow = `&#9650; ${game.status.inning}`;
            game.cnt.topOfInning = true;
          } else if (game.status.inning_state === 'Bottom') {
            // timeToShow = `&#9660; ${game.status.inning}`;
            game.cnt.bottomOfInning = true;
          }
        } else if (game.status.status === 'Preview' || game.status.status === 'Pre-Game' || game.status.status === 'Warmup') {
          timeToShow = this.toLocalTime(game);
        } else {
          timeToShow = `${game.time} ${game.time_zone}`;
        }
        game.cnt.status = timeToShow;

        /**
         * _teamName
         * //////////////////////////////////////////////////////////////////////
         */
        game.cnt.awayTeamName = game.away_team_name;
        game.cnt.homeTeamName = game.home_team_name;

        /**
         * _teamScore
         * _teamWinning
         * //////////////////////////////////////////////////////////////////////
         */
        if (game.linescore) {
          game.cnt.awayTeamScore = parseInt(game.linescore.r.away, 10);
          game.cnt.homeTeamScore = parseInt(game.linescore.r.home, 10);

          game.cnt.awayTeamWinning = game.cnt.awayTeamScore > game.cnt.homeTeamScore;
          game.cnt.homeTeamWinning = game.cnt.homeTeamScore > game.cnt.awayTeamScore;
        }
      });
      return data;
    } catch (e) {
      console.log('fudge cakes -- massageData');
      console.log(e);
    }
    return data;
  },

  toLocalTime(game) {
    try {
      const timeArr = game.time.split(':');
      const dateArr = game.original_date.split('/');
      const yyyy = parseInt(dateArr[0], 10);
      const mm = parseInt(dateArr[1], 10);
      const dd = parseInt(dateArr[2], 10);
      let hours = parseInt(timeArr[0], 10);
      const minutes = parseInt(timeArr[1], 10);

      const date = new Date(yyyy, mm, dd);

      if (game.ampm === 'PM') {
        hours += 12;
      } else { // AM
        hours -= 12;
      }

      const EST_UTC_OFFSET = 5; // EST + 5 = UTC
      date.setUTCHours((hours + EST_UTC_OFFSET) % 24, minutes);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.log('>> MLB local time conversion failed');
      return `${game.time} ${game.time_zone}`;
    }
  },
};
