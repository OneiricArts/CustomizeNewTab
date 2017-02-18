
class NFL extends Sport {

  constructor() {
    super();
    this.dataKey = 'NFL';
    this.schedule_url = 'http://www.nfl.com/liveupdate/scores/scores.json';
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
      console.log(`NFL getJson fail: ${JSON.stringify(result)}`);
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
      let specificUrl;
      const today = new Date();
      const playOffStartDate = new Date(2017, 0, 7);

      if (today > playOffStartDate) {
        const firstKey = Object.keys(data)[0];
        const gameDate = new Date(firstKey.substring(0, 4),
          (parseInt(firstKey.substring(4, 6), 10) - 1), firstKey.substring(6, 8));


        // console.log(gameDate);
        // console.log(playOffStartDate);

        const playoffWeekNum = Math.round((gameDate - playOffStartDate) / 604800000) + 18;
        console.log(playoffWeekNum);

        specificUrl = `http://www.nfl.com/ajax/scorestrip?season=2016&seasonType=POST&week=${playoffWeekNum}`;

        const self = this;

        fetch(specificUrl).then(response => response.text())
          .then((text) => {
            const jsonObj = $.xml2json(text);
            const combinedData = {};
            combinedData.gms = [];

            console.log(jsonObj);

            if (jsonObj.gms) {
              if (jsonObj.gms.g.length) {
                for (let i = 0; i < jsonObj.gms.g.length; i += 1) {
                  combinedData.gms.push(data[jsonObj.gms.g[i].eid]);
                  combinedData.gms[i].extrainfo = jsonObj.gms.g[i];
                  combinedData.gms[i].eid = jsonObj.gms.g[i].eid;
                }
              } else {
                for (const key of Object.keys(data).sort()) {
                  combinedData.gms.push(data[key]);
                  combinedData.gms[combinedData.gms.length - 1].eid = key;
                  combinedData.gms[combinedData.gms.length - 1].extrainfo = jsonObj.gms.g;
                }
              }
            } else {
              for (const key of Object.keys(data).sort()) {
                combinedData.gms.push(data[key]);
                combinedData.gms[combinedData.gms.length - 1].eid = key;
              }
            }


            // for (const key of Object.keys(data).sort()) {
            //   combinedData.gms.push(data[key]);
            //   combinedData.gms[combinedData.gms.length - 1].eid = key;
            // }

            combinedData.w = playoffWeekNum;

            // for (let i = 0; i < combinedData.gms.length; i += 1) {
            //   if (jsonObj.gms.g[i] && (combinedData.gms[i].eid === jsonObj.gms.g[i].eid)) {
            //     combinedData.gms[i].extrainfo = jsonObj.gms.g[i];
            //   }
            //   else {
            //     console.log('===> ' + combinedData.gms[i].eid + ' ' + jsonObj.gms.g[i].eid);
            //   }
            // }

            self.labelScheduleData(combinedData);

            console.log(combinedData.gms[0]);

            callback.call(self, combinedData);
          });
      } else {
        specificUrl = 'http://www.nfl.com/liveupdate/scorestrip/ss.json';
        $.getJSON(specificUrl, (result) => {
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

            if (devEnv) {
              // favorite team
              if (combinedData.gms[i].h === 'SF' || combinedData.gms[i].v === 'SF' ||
                combinedData.gms[i].h === 'NE' || combinedData.gms[i].v === 'NE') {
                combinedData.gms[i].fav_team = true;
              }
            }
          }
          callback.call(this, combinedData);
        }).fail((result) => {
          console.log(`failed with: ${specificUrl}`);
          console.log(result);
        });
      }
    } catch (e) {
      console.log(`fudge cakes -- massageData${e}`);
    }
  }

  /* eslint no-param-reassign: ["error", { "props": false }] */
  // this function alters passed object
  labelScheduleData(schedule) {
    for (let i = 0; i < schedule.gms.length; i += 1) {
      // can't check for score table in handlebars, because it 0 is a valid entry,
      // but if(0) is false
      if (schedule.gms[i].home.score[1] !== null) {
        schedule.gms[i].scoreTable = true;
      }

      // if (!isNaN(schedule.gms[i].extrainfo.q) || schedule.gms[i].extrainfo.q === 'P') {
      if (schedule.gms[i].qtr && !schedule.gms[i].qtr.includes('Final') && !isNaN(schedule.gms[i].qtr)) {
        schedule.gms[i].playing = true;
      }

      // tweaking looks, overtime is too long
      if (schedule.gms[i].qtr === 'final overtime') {
        schedule.gms[i].qtr = 'final OT';
      }

      // only show first letter of day?
      // schedule.gms[i].d = schedule.gms[i].d.substring(0,1);

      // local time
      const options = {};
      if (schedule.gms[i].extrainfo) {
        const hours = parseInt(schedule.gms[i].extrainfo.t.split(':')[0], 10);

        if (hours >= 0 && hours <= 10) {
          options.ampm = 'PM';
        } else {
          options.ampm = 'AM';
        }

        schedule.gms[i].t = this.toLocalTime(schedule.gms[i].extrainfo.t.split(':')[0],
          schedule.gms[i].extrainfo.t.split(':')[1], options).split(' ')[0];
      } else {
        schedule.gms[i].t = `${schedule.gms[i].eid.substring(4, 6)}.${schedule.gms[i].eid.substring(6, 8)}`;
      }

      // label whos winning
      if (schedule.gms[i].home.score.T !== null) {
        const homeScore = parseInt(schedule.gms[i].home.score.T, 10);
        const visitorScore = parseInt(schedule.gms[i].away.score.T, 10);

        if (homeScore > visitorScore) {
          schedule.gms[i].home_winning = true;
        }
        if (visitorScore > homeScore) {
          schedule.gms[i].visitor_winning = true;
        }
      }

      // who has possession
      if (schedule.gms[i].playing &&
        schedule.gms[i].posteam === schedule.gms[i].home.abbr) {
        schedule.gms[i].home_pos = true;
      } else if (schedule.gms[i].playing &&
        schedule.gms[i].posteam === schedule.gms[i].away.abbr) {
        schedule.gms[i].visitor_pos = true;
      }

      if (devEnv) {
        // favorite team
        if (schedule.gms[i].home.abbr === 'SF' || schedule.gms[i].away.abbr === 'SF' ||
          schedule.gms[i].home.abbr === 'NE' || schedule.gms[i].away.abbr === 'NE') {
          schedule.gms[i].fav_team = true;
        }
      }
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
      if (self.data.gms[i].eid === id) { // === results in bug ... used to?!!!!!!
        self.data.gms[i].hidden = true;
        break;
      }
    }

    self.saveData();
  }
}
