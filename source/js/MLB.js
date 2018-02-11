"use strict";

class MLB extends Sport {

	constructor() {
		super();
		this.dataKey = 'MLB';
	}

	async getJsonData(url, callback) {
		let data = {};
		data = (await MLBData.getSchedule(this.today));
		callback.call(this, data);
	}

	displaySchedule(newData) {
		try {
			// if data is for the same week, carry over any data that I need to
			if (this.data && this.data.subject && this.data.subject === newData.subject) {
				for (var i = 0; i < this.data.data.games.game.length
					&& newData.data.games.game.length; i++) {
					if (this.data.data.games.game[i].game_pk === newData.data.games.game[i].game_pk
						&& this.data.data.games.game[i].hidden) {
						newData.data.games.game[i]['hidden'] = true;
					}
				}
			}
		} catch (excption) { }

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
}
