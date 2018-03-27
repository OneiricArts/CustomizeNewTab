class MLB extends Sport { // eslint-disable-line no-unused-vars

  constructor() {
    super();
    this.datakey = 'MLB';
    this.data.schedule = {
      games: [],
    };
    this.links = [
      {
        href: '"http://mlb.mlb.com/home',
        title: 'MLB',
      },
      {
        href: '"http://www.espn.com/mlb/',
        title: 'MLB',
      },
      {
        href: 'http://www.reddit.com/r/mlb',
        title: 'r/MLB',
      },
    ];
  }

  async getJsonData() {
    const schedule = await MLBData.getSchedule(this.today);
    console.log(schedule);
    const combinedSchedule = MLBData.carryOverData(this.data.schedule, schedule);
    return combinedSchedule;
  }

  writeToTemplate() {
    this.data.schedule.links = this.links;
    WidgetNew.displayTemplate('MLB', 'schedule', this.data.schedule, $('#MLB_widget'));
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

  /**
   * OVERRIDING FROM SPORT.JS UNTIL THIS.DATA IS CHANGED EVERYWHERE
   */

  async getSchedule() {
    const schedule = await this.getJsonData();
    this.data.schedule = schedule;
    this.writeScheduleToDOM();
    this.saveData();
  }

  resetSchedule() {
    this.data.schedule = null;
    this.getSchedule();
    this.saveData();
  }
}
