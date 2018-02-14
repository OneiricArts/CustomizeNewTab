const NHLData = { // eslint-disable-line no-unused-vars
  async getSchedule(date = new Date()) {

    const startDate = this.formatDate(date);
    const endDate = this.formatDate(date);

    const expandOptions = [
      'schedule.teams',
      'schedule.linescore',
      // 'schedule.broadcasts.all',
      // 'schedule.ticket',
      // 'schedule.game.content.media.epg',
      // 'schedule.radioBroadcasts',
      // 'schedule.metadata',
      // 'schedule.game.seriesSummary,seriesSummary.series',
    ].join(',');

    const paramOptions = [
      // 'leaderCategories=',
      // 'leaderGameTypes=R',
      // 'site=en_nhl',
      // 'teamId=',
      // 'gameType=',
      // 'timecode=',
    ].join('&');

    const url = [
      `https://statsapi.web.nhl.com/api/v1/schedule?startDate=${startDate}&endDate=${endDate}`,
      `&expand=${expandOptions}`,
      `&${paramOptions}`,
    ].join('');

    try {
      const scores = await (await fetch(url)).json();
      const labeledData = this.labelScheduleData(scores.dates[0].games);
      // labeledData = labeledData.reverse();
      // maybe reverse when games are live?
      return labeledData;
    } catch (e) {
      console.log('// NHL DATA RETREIVAL FAILED //');
      console.log(e);
    }
  },

  formatDate(date) {
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    const twoDigits = n => (n < 10 ? `0${n}` : `${n}`);
    return `${yyyy}-${twoDigits(mm)}-${twoDigits(dd)}`;
  },

  labelScheduleData(data) {
    _.map(data, (v) => {
      const game = v;

      game.cnt = {};

      /**
       * _id
       * //////////////////////////////////////////////////////////////////////
       */
      game.cnt.id = game.gamePk;

      /**
       * _status
       * //////////////////////////////////////////////////////////////////////
       */
      if (game.status.abstractGameState === 'Final') {
        game.cnt.status = game.status.detailedState;
      } else if (game.status.abstractGameState === 'Live') {
        game.cnt.status = `${game.linescore.currentPeriod}Q ${game.linescore.currentPeriodTimeRemaining}`;
      } else {
        const unformattedTime = game.gameDate.split('T')[1];
        const utcHours = unformattedTime.split(':')[0];
        const utcMinutes = unformattedTime.split(':')[1];

        const date = new Date();
        date.setUTCHours(utcHours);
        date.setMinutes(utcMinutes);

        game.cnt.status = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(' ')[0];
      }

      /**
       * _team_name
       * //////////////////////////////////////////////////////////////////////
       */
      game.cnt.home_team_name = game.teams.home.team.teamName;
      game.cnt.away_team_name = game.teams.away.team.teamName;

      /**
       * _team_score
       * _team_winning
       * //////////////////////////////////////////////////////////////////////
       */
      game.cnt.home_team_score = parseInt(game.teams.home.score, 10);
      game.cnt.away_team_score = parseInt(game.teams.away.score, 10);
      game.cnt.home_team_winning = game.cnt.home_team_score > game.cnt.away_team_score;
      game.cnt.away_team_winning = game.cnt.away_team_score > game.cnt.home_team_score;

      /**
       * _score_changed?
       * //////////////////////////////////////////////////////////////////////
       */

      /**
       * _close_game?
       * //////////////////////////////////////////////////////////////////////
       */

      /**
       * _carry_over
       * //////////////////////////////////////////////////////////////////////
       */
      game.cnt.carry_over = {};
    });

    return data;
  },

  carryOverData(oldD, newD) {
    const oldData = oldD;
    const newData = newD;

    try {
      for (let i = 0; i < newData.games.length; i += 1) {
        if (newData.games[i].cnt.id === oldData.games[i].cnt.id) {
          newData.games[i].cnt.carry_over = oldData.games[i].cnt.carry_over;
        }
      }
    } catch (e) { /* don't carry anything over */ }

    return newData;
  },
};
