class Sport extends WidgetNew { // eslint-disable-line no-unused-vars

  constructor() {
    super();
    this.today = new Date();
  }

  init() {
    this.loadLocalSchedule();
    this.cacheButtonActions();
  }

  /*
    OVERWRITE in extending classes for unique functionality
  */
  /* eslint class-methods-use-this: ["error", { "exceptMethods": ["cacheButtonActions",
    writeToTemplate, highlightGames, getJsonData] }] */
  cacheButtonActions() {}
  writeToTemplate() {}
  getJsonData() {}
  highlightGames() {}

  /* eslint no-unused-expressions: [2, { allowTernary: true }]*/
  changeDay(n) {
    n ? this.today.setDate(this.today.getDate() + n) : this.today = new Date();
    this.resetSchedule();
  }

  async getDataSchedule() {
    const schedule = await this.getJsonData();
    this.displaySchedule(schedule);
  }

  async loadLocalSchedule() {
    await this.loadData();
    if (!_.isEmpty(this.data)) {
      this.writeScheduleToDOM();
      this.getDataSchedule();
    } else {
      this.getDataSchedule();
    }
  }

  displaySchedule(newData) {
    this.data = newData;
    this.writeScheduleToDOM();
    this.saveData();
  }

  writeScheduleToDOM() {
    this.writeToTemplate();
    this.highlightGames();
  }

  resetSchedule() {
    this.data = null;
    this.getDataSchedule();
    this.saveData();
  }

  updateSchedule() { this.getDataSchedule(); }
}
