class Sport extends Widget { // eslint-disable-line no-unused-vars

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

  loadLocalSchedule() {
    this.loadData(() => {
      this.writeScheduleToDOM();
      this.getDataSchedule();
    },
    this.getDataSchedule);
  }

  displaySchedule(newData) {
    this.data = newData;
    this.saveData(this.writeScheduleToDOM());
  }

  writeScheduleToDOM() {
    this.writeToTemplate();
    this.highlightGames();
  }

  resetSchedule() {
    this.data = null;
    this.saveData(this.getDataSchedule);
  }

  updateSchedule() { this.getDataSchedule(); }
}
