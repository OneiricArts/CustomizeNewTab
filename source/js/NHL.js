/* eslint-disable */

"use strict";

class NHL extends Sport {

	constructor() {
		super();
		this.dataKey = 'NHL';
		//this.schedule_url = 'http://live.nhle.com/GameData/GCScoreboard/2016-04-14.jsonp';
		this.schedule_url_start = 'http://live.nhle.com/GameData/GCScoreboard/';
		this.schedule_url_end = '.jsonp';
		this.schedule_url =  this.schedule_url_start + this.yyyymmdd() + this.schedule_url_end;
	}

	formatDate(yyyy, mm, dd) { return yyyy + '-' + mm + '-' + dd;}

	updateNewData(newData) {
		try {
			
            // if data is for the same week, carry over any data that I need to
            if (this.data.currentDate === newData.currentDate) {
                for (var i = 0; i < this.data.games.length && newData.games.length; i++) {
                    if (this.data.games[i].id == newData.games[i].id
                        && this.data.games[i].hidden) {
                        newData.games[i]['hidden'] = true;
						
                    } 
                }
            }
        } catch(e) {
			log('MLB : updateNewData : ' + e);
		}
	}

	writeToTemplate(error) {
		if(error) {
			if(!this.data) {this.data = {};}
			this.data['error'] = true;
			this.data.games = null;
		}

		this.data.day = this.today.getDate();
		this.data.month = this.today.getMonth()+1;

		this.displayTemplate('NHL', 'schedule', 
			this.data, $('#NHL_widget'));
	}

	getJsonData(url, callback) {
		$.getJSON(url, function(result) {
			this.massageData.call(this, result, callback);
		}.bind(this)).fail(function(result){
			try {
				var json = result.responseText.split('(')[1];
				json = json.split(')')[0];
				var result = JSON.parse(json);
				this.massageData.call(this, result, callback);
			}
			catch(e) {
				this.writeErrorMessage(true);
			}
		}.bind(this));
		// TODO handle timeout
	}

	massageData(result, callback) {
		try {
			for (var i = 0; i < result.games.length; i++) {

				/*
					Names are all uppercase initially. Transform them to lower case, 
					so can capitalize only the first litter via CSS
				*/
				result.games[i].atcommon = result.games[i].atcommon.toLowerCase();
				result.games[i].htcommon = result.games[i].htcommon.toLowerCase();

				var game = result.games[i];

				/* mark who's winning 
				********************************************************************************************/
				var ats = parseInt(game.ats);
				var hts = parseInt(game.hts);
				result.games[i]['atswinning'] = ats > hts;
				result.games[i]['htswinning'] = hts > ats;

				/* time to local 
				*********************************************************************************************/
				var time_to_show;

				if ( game.bs.includes('PM') || game.bs.includes('AM') ) {
					try {
						var timeArr = game.bs.split(':');
						var hours 	= parseInt(timeArr[0]);
						var minutes = parseInt(timeArr[1].split(' ')[0]);
						var date = new Date(this.today);

						hours = hours - 1;      // setUTCHours is 0-23, NBA API is 1 - 24 for hours
						if(game.ampm === "PM") {
							hours += 12;
						}
						else { //AM
							hours -= 12;
						}

						var EST_UTC_OFFSET = 5; // EST + 5 = UTC
						date.setUTCHours( (hours+EST_UTC_OFFSET)%24, minutes);
						result.games[i].bs = date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
					}

					catch(e) {
						//time_to_show = game.bs;
						console.log('>> time_to_show excption' + e);
					}
				}
				//result.data.games.game[i]['time_to_show'] = time_to_show;
			}
			callback.call(this, result);
		}
		catch(e) {
			console.log('fudge cakes -- massageData' + e);
		}
	}

	cacheButtonActions() {
		var self = this;
		$('body').on('click', '#NHL_game_table #remove-game-btn', {self: self}, this.removeGame);

		$('body').on('click', '#NHL_widget #reset_games', this.resetSchedule.bind(this));
		$('body').on('click', '#NHL_widget #refresh_scores', this.updateSchedule.bind(this));

		$('body').on('click', '#NHL_widget #tomorrow-btn', this.changeDay.bind(this, 1));
		$('body').on('click', '#NHL_widget #yesterday-btn', this.changeDay.bind(this,-1));
		$('body').on('click', '#NHL_widget #today-btn', this.changeDay.bind(this,0));
	}

		removeGame(event) {
		var self = event.data.self;
		var id = $(this).closest('tr').attr('id');

		$('#'+id).remove();
		$('#c'+id).remove();

		for (var i = 0; i < self.data.games.length; i++) {
			if(id == self.data.games[i].id) {
				self.data.games[i]['hidden'] = true;
				break;
			}
		}

		self.saveData();
	}
}

