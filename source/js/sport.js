class Sport extends WidgetNew { // eslint-disable-line no-unused-vars

  constructor() {
    super();
    this.today = new Date();
  }

  init() {
    this.loadLocalSchedule();
    this.cacheButtonActions();
  }

  async loadLocalSchedule() {
    await this.loadData();

    /**
     * replaces `!_.isEmpty(this.data)`
     *  other alternative (Object.getOwnPropertyNames(this.data).length > 0)
     *
     * Object.keys({1:{}, 3:2}).length  // 2
     * Object.keys([1]).length          // 1
     *
     * Object.keys({}).length           // 0
     * Object.keys([]).length           // 0
     *
     * Object.keys(null).length         // TypeError: Cannot convert undefined or null to object
     */
    if (this.data && Object.keys(this.data).length > 0) {
      this.writeScheduleToDOM();
      this.getSchedule();
    } else {
      this.getSchedule();
    }
  }

  async getSchedule() {
    const schedule = await this.getJsonData();
    this.data = schedule;
    this.writeScheduleToDOM();
    this.saveData();
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

  writeScheduleToDOM() {
    this.writeToTemplate();
    this.highlightGames();
  }

  resetSchedule() {
    this.data = null;
    this.getSchedule();
    this.saveData();
  }

  updateSchedule() { this.getSchedule(); }
}
