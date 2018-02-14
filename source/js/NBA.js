class NBA extends Sport { // eslint-disable-line

  constructor() {
    super();
    this.datakey = 'NBA_DATA';
    this.$game_table = $('#NBA-panel #NBA_game_table');
    this.$game_template = $('#NBA-schedule-template').html();

    this.updateGamesID; // eslint-disable-line no-unused-expressions

    this.rowId = '#NBA_widget';
    this.autoUpdateButtonId = `${this.rowId} #autoupdate-btn`;
  }

  off() {
    console.log('nba off');
    this.turnOffAutoUpdate();
  }

  async getJsonData() {
    const data = await NBAData.getSchedule(this.today);
    const combinedData = NBAData.carryOverData(this.data, data);
    return combinedData;
  }

  writeToTemplate() {
    // this.data.sports_content.games.game.push({'home':'test'});

    if (this.updateGamesID) {
      this.data.sports_content.games.autoUpdating = true;
    } else {
      this.data.sports_content.games.autoUpdating = false;
    }

    this.data.sports_content.games.day = this.today.getDate();
    this.data.sports_content.games.month = this.today.getMonth() + 1;
    this.data.sports_content.games.date =
      this.data.sports_content.sports_meta.season_meta.calendar_date;

    WidgetNew.displayTemplate('NBAschedule', 'schedule',
      this.data.sports_content.games, $('#NBA_widget'));
  }

  cacheButtonActions() {
    const that = this;
    $('body').on('click', '#NBA_game_table #remove-game-btn', { that }, this.removeGame);
    $('body').on('click', '#NBA_widget #reset_games', this.resetSchedule.bind(this));
    $('body').on('click', '#NBA_widget #update-btn', this.updateSchedule.bind(this));
    $('body').on('click', '#NBA_widget #autoupdate-btn', { that }, this.autoupdateSchedule);
    $('body').on('click', '#NBA_widget #standings-btn', this.standings.bind(this));
    $('body').on('click', '#NBA_widget #boxscore-btn', { that }, this.boxscore);
    $('body').on('click', '#NBA_widget #tomorrow-btn', this.changeDay.bind(this, 1));
    $('body').on('click', '#NBA_widget #yesterday-btn', this.changeDay.bind(this, -1));
    $('body').on('click', '#NBA_widget #today-btn', this.changeDay.bind(this, 0));
  }

  removeGame(event) {
    const that = event.data.that;
    const id = $(this).closest('tr').attr('id');

    $(`#${id}`).remove();
    $(`#c${id}`).remove();

    for (let i = 0; i < that.data.sports_content.games.game.length; i += 1) {
      if (id === that.data.sports_content.games.game[i].id) {
        that.data.sports_content.games.game[i].hidden = true;
        break;
      }
    }
    that.saveData();
  }

  highlightGames() {
    for (let i = 0; i < this.data.sports_content.games.game.length; i += 1) {
      if (this.data.sports_content.games.game[i].highlight) {
        const rowId = `#${this.data.sports_content.games.game[i].id}`;
        // $(rowId).effect("highlight", {color: '#FFFF99'}, 2000);
        // $(rowId).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100)
        //         .fadeIn(100).fadeIn(100).fadeOut(100).fadeIn(100);

        // doing it this way to remove jQueryUI dependency for now
        $(rowId).addClass('flash');
        setTimeout(() => $(rowId).removeClass('flash'), 2000);

        // clear after highlighted
        this.data.sports_content.games.game[i].highlight = false;
      }
    }
  }

  // AUTO UPDATING CODE

  autoupdateSchedule(event) {
    $(this).toggleClass('btn-secondary').toggleClass('btn-success');

    const self = event.data.that;

    if ($(this).hasClass('btn-success')) {
      console.log('updating---');
      self.continueAutoUpdate.bind(self);
      self.updateGamesID = window.setInterval(self.continueAutoUpdate.bind(self), 10000);
    } else {
      self.turnOffAutoUpdate();
    }
  }

  continueAutoUpdate() {
    let allGamesDone = true;
    for (let i = 0; i < this.data.sports_content.games.game.length; i += 1) {
      if (this.data.sports_content.games.game[i].period_time.period_status !== 'Final') {
        allGamesDone = false;
        break;
      }
    }
    if (!allGamesDone) {
      this.getDataSchedule();
    } else {
      this.turnOffAutoUpdate();
    }
  }

  turnOffAutoUpdate() {
    console.log('clearing---');
    window.clearInterval(this.updateGamesID);
    if ($(this.autoUpdateButtonId).hasClass('btn-success')) {
      const btn = $(this.autoUpdateButtonId);
      btn.find('span').toggleClass('glyphicon-remove', true);
      btn.find('span').toggleClass('glyphicon-ok', false);
      btn.toggleClass('btn-success', false);
      btn.toggleClass('btn-default', true);
    }
  }

  // standings

  async standings() {
    const year = this.data.sports_content.sports_meta.season_meta.standings_season_year;
    const data = await NBAData.getStandings(year);

    // var templ = $('#NBA-standings-template').html();

    WidgetNew.displayTemplate('NBAstandings', 'teams', data.sports_content.standings.conferences.West.team, $('#NBA-standings #West'));
    WidgetNew.displayTemplate('NBAstandings', 'teams', data.sports_content.standings.conferences.East.team, $('#NBA-standings #East'));

    // Mark Playoff teams with grey line
    const border = 'border-bottom:3pt solid grey;';
    $($('#NBA-standings #West tr')[8]).attr('style', border);
    $($('#NBA-standings #East tr')[8]).attr('style', border);
  }

  async boxscore(event) {
    const self = event.data.that;
    const data = await NBAData.getBoxScore(self.today, $(this).val());
    WidgetNew.displayTemplate('NBAboxscore', 'game', data.sports_content.game, $('#NBA-boxscore .modal-content'));
  }
}
