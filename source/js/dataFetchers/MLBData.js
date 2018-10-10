const MLBData = { // eslint-disable-line no-unused-vars
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
      return [];
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
        const convertedData = data;
        convertedData.data.games.game = [data.data.games.game];
        return convertedData;
      }
      return data;
    } catch (e) {
      console.log('// MLB convertScheduleToArray errored //');
      console.log(e);
    }
    return data;
  },

  labelScheduleData(ad) {
    const data = ad;
    try {
      try {
        if (!data.data.games.game) {
          data.data.games.game = [];
        } else if (!Array.isArray(data.data.games.game)) {
          data.data.games.game = [data.data.games.game];
        }
      } catch (e) {
        return data;
      }

      for (let i = 0; i < data.data.games.game.length; i += 1) {
        const game = data.data.games.game[i];

        /* time status
        *******************************************************************************************/
        let timeToShow;

        // console.log('>>>>>> ===== ' + game.status.status);

        if (game.status.status === 'Final' || game.status.status === 'Postponed') {
          timeToShow = game.status.status;
        } else if (game.status.status === 'In Progress') {
          timeToShow = game.status.inning;

          if (game.status.inning_state === 'Top') {
            data.data.games.game[i].topofinning = true;
          }

          if (game.status.inning_state === 'Bottom') {
            data.data.games.game[i].bottomofinning = true;
          }
        } else if (game.status.status === 'Delayed') {
          timeToShow = 'Delayed';
        } else if (game.status.status === 'Preview' || game.status.status === 'Pre-Game'
          || game.status.status === 'Warmup') {
          try {
            const timeArr = game.time.split(':');
            const dateArr = game.original_date.split('/');
            // check time.Arr.length
            const yyyy = parseInt(dateArr[0], 10);
            const mm = parseInt(dateArr[1], 10);
            const dd = parseInt(dateArr[2], 10);
            let hours = parseInt(timeArr[0], 10);
            const minutes = parseInt(timeArr[1], 10);


            if (game.ampm === 'PM') {
              hours += 12;
            } else { // AM
              hours -= 12;
            }

            const date = new Date(yyyy, mm, dd, hours, minutes);
            timeToShow = helpers.toLocalTime(date);
          } catch (e) {
            timeToShow = `${game.time} ${game.time_zone}`;
            console.log('>> time_to_show excption');
          }
        }

        if (game.time === 'TBD') {
          timeToShow = game.time;
        }

        data.data.games.game[i].time_to_show = timeToShow;

        /* winning
        *******************************************************************************************/
        if (game.linescore) {
          const atScore = parseInt(game.linescore.r.away, 10);
          const htScore = parseInt(game.linescore.r.home, 10);
          data.data.games.game[i].atwinning = atScore > htScore;
          data.data.games.game[i].htwinning = htScore > atScore;
        }
      }
    } catch (e) {
      console.log(`fudge cakes -- massageData ${e}`);
    }
    return data;
  },

  carryOverData(oldD, newD) {
    const oldData = oldD;
    const newData = newD;
    try {
      if (oldData && oldData.subject && oldData.subject === newData.subject) {
        for (let i = 0; i < oldData.data.games.game.length
          && newData.data.games.game.length; i += 1) {
          if (oldData.data.games.game[i].game_pk === newData.data.games.game[i].game_pk
            && oldData.data.games.game[i].hidden) {
            newData.data.games.game[i].hidden = true;
          }
        }
      }
    } catch (excption) {
      // do nothing
    }

    return newData;
  },
};
