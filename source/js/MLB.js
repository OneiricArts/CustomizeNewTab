class MLB extends Sport { // eslint-disable-line no-unused-vars

  constructor() {
    super();
    this.datakey = 'MLB';
  }

  async getJsonData(url, callback) {
    let data = {};
    data = (await MLBData.getSchedule(this.today));
    callback.call(this, data);
  }

  displaySchedule(newResult) {
    const newData = newResult;
    try {
      // if data is for the same week, carry over any data that I need to
      if (this.data && this.data.subject && this.data.subject === newData.subject) {
        for (let i = 0; i < this.data.data.games.game.length
          && newData.data.games.game.length; i += 1) {
          if (this.data.data.games.game[i].game_pk === newData.data.games.game[i].game_pk
            && this.data.data.games.game[i].hidden) {
            newData.data.games.game[i].hidden = true;
          }
        }
      }
    } catch (excption) {
      // do nothing
    }

    this.data = newData;
    this.saveData(this.writeScheduleToDOM());
  }

  writeToTemplate() {
    WidgetNew.displayTemplate('MLB', 'schedule', this.data.data.games, $('#MLB_widget'));
  }

  cacheButtonActions() {
    const that = this;
    $('body').on('click', '#MLB_widget #remove-game-btn', { that }, this.removeGame);

    $('body').on('click', '#MLB_widget #reset_games', this.resetSchedule.bind(this));
    $('body').on('click', '#MLB_widget #refresh_scores', this.updateSchedule.bind(this));

    $('body').on('click', '#MLB_widget #tomorrow-btn', this.changeDay.bind(this, 1));
    $('body').on('click', '#MLB_widget #yesterday-btn', this.changeDay.bind(this, -1));
    $('body').on('click', '#MLB_widget #today-btn', this.changeDay.bind(this, 0));
  }

  removeGame(event) {
    const that = event.data.that;
    const id = $(this).closest('tr').attr('id');

    $(`#${id}`).remove();
    $(`#c${id}`).remove();

    for (let i = 0; i < that.data.data.games.game.length; i += 1) {
      if (id === that.data.data.games.game[i].game_pk) {
        that.data.data.games.game[i].hidden = true;
        break;
      }
    }

    that.saveData();
  }
}
