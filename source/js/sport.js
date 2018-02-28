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

  getDataSchedule() {
    this.getJsonData(this.schedule_url, this.displaySchedule);
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
