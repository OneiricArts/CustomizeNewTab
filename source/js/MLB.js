
"use strict";

class MLB extends Sport {

	constructor() {
		super();
		this.dataKey = 'MLB';
		//'http://gd2.mlb.com/components/game/mlb/year_2016/month_04/day_15/master_scoreboard.json';
		this.schedule_url_start = 'http://gd2.mlb.com/components/game/mlb/';
		this.schedule_url_end = '/master_scoreboard.json';
		this.schedule_url = this.schedule_url_start + this.yyyymmdd() + this.schedule_url_end;
	}

	formatDate(yyyy, mm, dd) {
		return 'year_' + yyyy + '/month_' + mm + '/day_' + dd;
	}

    displaySchedule(newData) {

		// case where only one game: data provides object instead of array, so create array
		try {
			if(!Array.isArray(newData.data.games.game)) {
				newData.data.games.game = [newData.data.games.game];
			}
		} catch(e) {}
		        
		try {
            // if data is for the same week, carry over any data that I need to
            if (this.data && this.data.subject && this.data.subject === newData.subject) {
                for (var i = 0; i < this.data.data.games.game.length
                    && newData.data.games.game.length; i++) {
                    if (this.data.data.games.game[i].game_pk == newData.data.games.game[i].game_pk
                        && this.data.data.games.game[i].hidden) {
                        newData.data.games.game[i]['hidden'] = true;
                    } else {
                        break;
                    }
                }
            }
        } catch(excption) {}

		this.data = newData;
		this.saveData(this.writeScheduleToDOM());
	}

	writeToTemplate(error) {
		this.displayTemplate('MLB', 'schedule', this.data.data.games, $('#MLB_widget'));
	}

	cacheButtonActions() {
		var that = this;
		$('body').on('click', '#MLB_widget #remove-game-btn', {that: that}, this.removeGame);

		$('body').on('click', '#MLB_widget #reset_games', this.resetSchedule.bind(this));
		$('body').on('click', '#MLB_widget #refresh_scores', this.updateSchedule.bind(this));

		$('body').on('click', '#MLB_widget #tomorrow-btn', this.changeDay.bind(this, 1));
		$('body').on('click', '#MLB_widget #yesterday-btn', this.changeDay.bind(this,-1));
		$('body').on('click', '#MLB_widget #today-btn', this.changeDay.bind(this,0));
	}

	removeGame(event) {
		var that = event.data.that;
		var id = $(this).closest('tr').attr('id');

		$('#'+id).remove();
		$('#c'+id).remove();

		for (var i = 0; i < that.data.data.games.game.length; i++) {
			if(id == that.data.data.games.game[i].game_pk) {
				that.data.data.games.game[i]['hidden'] = true;
				break;
			}
		}

		that.saveData();
	}

	massageData(result, callback) {
		try {
			for (var i = 0; i < result.data.games.game.length; i++) {
				var game = result.data.games.game[i];

				/* time status 
				*********************************************************************************************/
				var time_to_show;

				//console.log('>>>>>> ===== ' + game.status.status);

				if(game.status.status == "Final" || game.status.status === "Postponed") {
					time_to_show = game.status.status;
				}
				else if (game.status.status === "In Progress") {
					time_to_show = game.status.inning_state + ' of ' + game.status.inning;
					//time_to_show = game.status.inning + " / " + game.status.inning_state;
				}
				else if (game.status.status === "Preview" || game.status.status === "Pre-Game" 
						|| game.status.status === "Warmup") {

					try {
						var timeArr = game.time.split(':');
						var dateArr = game.original_date.split('/');
						// check time.Arr.length
						var yyyy 	= parseInt(dateArr[0]);
						var mm 		= parseInt(dateArr[1]);
						var dd 		= parseInt(dateArr[2]);
						var hours 	= parseInt(timeArr[0]);
						var minutes = parseInt(timeArr[1]);

						var date = new Date(yyyy, mm, dd);
						hours = hours - 1;      // setUTCHours is 0-23, NBA API is 1 - 24 for hours
						if(game.ampm === "PM") {
							hours += 12;
						}
						else { //AM
							hours -= 12;
						}

						var EST_UTC_OFFSET = 5; // EST + 5 = UTC
						date.setUTCHours( (hours+EST_UTC_OFFSET)%24, minutes);
						time_to_show = date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
					}

					catch(e) {
						time_to_show = game.time + " " + game.time_zone;
						console.log('>> time_to_show excption');
					}
				}
				result.data.games.game[i]['time_to_show'] = time_to_show;

				/* winning 
				********************************************************************************************/
				if(game.linescore) {
					var at_score = parseInt(game.linescore.r.away);
					var ht_score = parseInt(game.linescore.r.home);
					result.data.games.game[i]['atwinning'] = at_score > ht_score;
					result.data.games.game[i]['htwinning'] = ht_score > at_score;
				}
			}
			callback.call(this, result);
		}
		catch(e) {
			console.log('fudge cakes -- massageData' + e);
		}

		callback.call(this, result);
	}
}