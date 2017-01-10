
class NFL extends Sport {

  constructor() {
    super();
    this.dataKey = 'NFL';
    this.schedule_url = 'http://www.nfl.com/liveupdate/scorestrip/ss.json';
  }

  writeToTemplate(error = false) {
    if (error) {
      if (!this.data) { this.data = {}; }
      this.data.error = true;
      this.data.games = null;
    }

    this.displayTemplate('NFLschedule', 'schedule', this.data, $('#NFL_widget'));
  }

  getJsonData(url, callback) {
    $.getJSON(url, (result) => {
      this.massageData.call(this, result, callback);
    }).fail((result) => {
    });
    // TODO handle timeout
  }

  displaySchedule(newData) {
    const updateNewData = newData;

    // if data is for the same week, carry over any data that I need to
    if (this.data && this.data.gms && this.data.w === updateNewData.w) {
      for (let i = 0; i < updateNewData.gms.length && this.data.gms.length; i += 1) {
        if (updateNewData.gms[i].eid === this.data.gms[i].eid && this.data.gms[i].hidden) {
          updateNewData.gms[i].hidden = true;
        }
      }
    }

    this.data = updateNewData;
    this.saveData(this.writeScheduleToDOM());
  }

  massageData(data, callback) {
    try {
      const url = 'http://www.nfl.com/liveupdate/scores/scores.json';
      $.getJSON(url, (result) => {
        const combinedData = data;

        for (let i = 0; i < combinedData.gms.length; i += 1) {
          combinedData.gms[i].extrainfo = result[combinedData.gms[i].eid];

          if (combinedData.gms[i].extrainfo.home.score[1] !== null) {
            combinedData.gms[i].scoreTable = true;
          }

          if (!isNaN(combinedData.gms[i].q)) {
            combinedData.gms[i].playing = true;
          }

          // tweaking looks, overtime is too long
          if (combinedData.gms[i].extrainfo.qtr === 'final overtime') {
            combinedData.gms[i].extrainfo.qtr = 'final OT';
          }

          // only show first letter of day?
          // combinedData.gms[i].d = combinedData.gms[i].d.substring(0,1);

          // local time
          const options = {};
          const hours = parseInt(combinedData.gms[i].t.split(':')[0], 10);

          if (hours >= 0 && hours <= 10) {
            options.ampm = 'PM';
          } else {
            options.ampm = 'AM';
          }

          combinedData.gms[i].t = this.toLocalTime(combinedData.gms[i].t.split(':')[0],
            combinedData.gms[i].t.split(':')[1], options).split(' ')[0];

          // label whos winning
          if (combinedData.gms[i].extrainfo.home.score.T !== null) {
            const homeScore = parseInt(combinedData.gms[i].extrainfo.home.score.T, 10);
            const visitorScore = parseInt(combinedData.gms[i].extrainfo.away.score.T, 10);

            if (homeScore > visitorScore) {
              combinedData.gms[i].home_winning = true;
            }
            if (visitorScore > homeScore) {
              combinedData.gms[i].visitor_winning = true;
            }
          }

          // who has possession
          if (combinedData.gms[i].playing &&
            combinedData.gms[i].extrainfo.posteam === combinedData.gms[i].extrainfo.home.abbr) {
            combinedData.gms[i].home_pos = true;
          } else if (combinedData.gms[i].playing &&
            combinedData.gms[i].extrainfo.posteam === combinedData.gms[i].extrainfo.away.abbr) {
            combinedData.gms[i].visitor_pos = true;
          }

          if (dev_env) {
            // favorite team
            if (combinedData.gms[i].h === 'SF' || combinedData.gms[i].v === 'SF' ||
                combinedData.gms[i].h === 'NE' || combinedData.gms[i].v === 'NE') {
              combinedData.gms[i].fav_team = true;
            }
          }
        }
        callback.call(this, combinedData);
      });
    } catch (e) {
      console.log(`fudge cakes -- massageData${e}`);
    }
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
      if (self.data.gms[i].eid == id) { // === results in bug
        self.data.gms[i].hidden = true;
        break;
      }
    }

    self.saveData();
  }
}
