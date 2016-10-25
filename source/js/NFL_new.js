
"use strict";

class NFL extends Sport {

	constructor() {
		super();
		this.dataKey = 'NFL';
		this.schedule_url =  'http://www.nfl.com/liveupdate/scorestrip/ss.json';
    }

	writeToTemplate(error=false) {

		if(error) {
			if(!this.data) {this.data = {};}
			this.data['error'] = true;
			this.data.games = null;
		}

        this.displayTemplate('NFLschedule', 'schedule', this.data, $('#NFL_widget'));
	}

	getJsonData(url, callback) {

		$.getJSON(url, function(result) {
			this.massageData.call(this, result, callback);
		}.bind(this)).fail(function(result){
		}.bind(this));
		// TODO handle timeout
	}

	displaySchedule(newData) {

		// if data is for the same week, carry over any data that I need to
		if(this.data && this.data.gms && this.data.w == newData.w) {
			for (var i = 0; i < newData.gms.length && this.data.gms.length; i++) {
				if(newData.gms[i].eid == this.data.gms[i].eid && this.data.gms[i].hidden) {
					newData.gms[i]['hidden'] = true;
				}
			}
		}

		this.data = newData;
		this.saveData(this.writeScheduleToDOM());
	}

	massageData(data, callback) {
		try {
            var url = 'http://www.nfl.com/liveupdate/scores/scores.json'
            $.getJSON(url, function(result) {
                for (var i = 0; i < data.gms.length; i++) {
					
                    data.gms[i]['extrainfo'] = result[data.gms[i].eid];

                    if (data.gms[i]['extrainfo'].home.score[1] !== null) {
                        data.gms[i]['scoreTable'] = true;
                    }

                    if (!isNaN(data.gms[i].q)) {
                        data.gms[i]['playing'] = true;
                    }

					// local time 
					data.gms[i].t = this.toLocalTime(data.gms[i].t.split(':')[0], data.gms[i].t.split(':')[1]).split(' ')[0];

					// label whos winning
					if (data.gms[i].extrainfo.home.score.T !== null) {
						var home_score = parseInt(data.gms[i].extrainfo.home.score.T);
						var visitor_score = parseInt(data.gms[i].extrainfo.away.score.T);

						if (home_score > visitor_score) {
							data.gms[i]['home_winning'] = true;
						}
						if (visitor_score > home_score) {
							data.gms[i]['visitor_winning'] = true;
						}
					}
                }
                callback.call(this,data);		
            }.bind(this));
		}
		catch(e) {
			console.log('fudge cakes -- massageData' + e);
		}
	}

	cacheButtonActions() {
		var self = this;
		$('body').on('click', '#NFL-schedule-table #remove-game-btn', {self: self}, this.removeGame);
		$('body').on('click', '#NFL_widget #reset_games', this.resetSchedule.bind(this));
		$('body').on('click', '#NFL_widget #refresh_scores', this.updateSchedule.bind(this));
	}

	removeGame(event) {
		var self = event.data.self;
		var id = $(this).closest('tr').attr('id');

		$('#'+id).remove();
		$('#c'+id).remove();

		for (var i = 0; i < self.data.gms.length; i++) {
			if(self.data.gms[i].eid == id) {
				self.data.gms[i]['hidden'] = true;
				break;
			}
		}

		self.saveData();
	}
}


