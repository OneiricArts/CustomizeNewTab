class NFL extends Sport { // eslint-disable-line no-unused-vars

  constructor() {
    super();
    this.datakey = 'NFL';
    this.schedule_url = 'http://www.nfl.com/liveupdate/scores/scores.json';
  }

  writeToTemplate(error = false) {
    if (error) {
      if (!this.data) { this.data = {}; }
      this.data.error = true;
      this.data.games = null;
    }

    WidgetNew.displayTemplate('NFLschedule', 'schedule', this.data, $('#NFL_widget'));
  }

  async getJsonData() { // eslint-disable-line class-methods-use-this
    const data = await NFLData.getNFLData();
    return data;
  }

  displaySchedule(newData) {
    const updateNewData = newData;

    try {
      // if data is for the same week, carry over any data that I need to
      if (this.data && this.data.gms && this.data.w === updateNewData.w) {
        for (let i = 0; i < updateNewData.gms.length && this.data.gms.length; i += 1) {
          if (updateNewData.gms[i].eid === this.data.gms[i].eid && this.data.gms[i].hidden) {
            updateNewData.gms[i].hidden = true;
          }
        }
      }
    } catch (e) {
      // don't carry anything over
    }

    this.data = updateNewData;
    this.saveData();
    this.writeScheduleToDOM()
  }

  cacheButtonActions() {
    const self = this;
    $('body').on('click', '#NFL-schedule-table #remove-game-btn', { self }, this.removeGame);
    $('body').on('click', '#NFL_widget #reset_games', this.resetSchedule.bind(this));
    $('body').on('click', '#NFL_widget #refresh_scores', this.updateSchedule.bind(this));
  }

  removeGame(event) {
    const self = event.data.self;
    const id = $(this).closest('tr').attr('id');

    $(`#${id}`).remove();
    $(`#c${id}`).remove();

    for (let i = 0; i < self.data.gms.length; i += 1) {
      if (self.data.gms[i].eid === parseInt(id, 10)) {
        self.data.gms[i].hidden = true;
        break;
      }
    }

    self.saveData();
  }
}
