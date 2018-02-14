class MLB extends Sport { // eslint-disable-line no-unused-vars

  constructor() {
    super();
    this.datakey = 'MLB';
  }

  async getJsonData() {
    const data = await MLBData.getSchedule(this.today);
    const combinedData = MLBData.carryOverData(this.data, data);
    return combinedData;
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
