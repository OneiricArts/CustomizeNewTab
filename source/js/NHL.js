class NHL extends Sport { // eslint-disable-line no-unused-vars

  constructor() {
    super();
    this.datakey = 'NHL';
  }

  writeToTemplate() {
    this.data.day = this.today.getDate();
    this.data.month = this.today.getMonth() + 1;

    WidgetNew.displayTemplate('NHL', 'schedule',
      this.data, $('#NHL_widget'));
  }

  displaySchedule(newData) {
    const updateNewData = newData;

    try {
      for (let i = 0; i < updateNewData.games.length; i += 1) {
        if (updateNewData.games[i].cnt.id === this.data.games[i].cnt.id) {
          updateNewData.games[i].cnt.carry_over = this.data.games[i].cnt.carry_over;
        }
      }
    } catch (e) { /* don't carry anything over */ }

    this.data = updateNewData;
    this.saveData();
    this.writeScheduleToDOM();
  }

  async getJsonData(url, callback) {
    const data = {};
    data.games = (await NHLData.getSchedule(this.today));
    callback.call(this, data);
  }

  cacheButtonActions() {
    const self = this;
    $('body').on('click', '#NHL_game_table #remove-game-btn', { self }, this.removeGame);

    $('body').on('click', '#NHL_widget #reset_games', this.resetSchedule.bind(this));
    $('body').on('click', '#NHL_widget #refresh_scores', this.updateSchedule.bind(this));

    $('body').on('click', '#NHL_widget #tomorrow-btn', this.changeDay.bind(this, 1));
    $('body').on('click', '#NHL_widget #yesterday-btn', this.changeDay.bind(this, -1));
    $('body').on('click', '#NHL_widget #today-btn', this.changeDay.bind(this, 0));
  }

  removeGame(event) {
    const self = event.data.self;
    const id = parseInt($(this).closest('tr').attr('id'), 10);

    $(`#${id}`).remove();

    for (let i = 0; i < self.data.games.length; i += 1) {
      if (id === self.data.games[i].cnt.id) {
        self.data.games[i].cnt.carry_over.hidden = true;
        break;
      }
    }

    self.saveData();
  }
}
