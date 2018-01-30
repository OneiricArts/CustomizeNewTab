"use strict";

class MLB extends Sport {

	constructor() {
		super();
		this.dataKey = 'MLB';
	}

	writeToTemplate(error) {
		console.log(this.data.games)
		this.displayTemplate('MLB', 'schedule', this.data, $('#MLB_widget'));
	}

	async getJsonData(url, callback) {
		const data = {};
		data.games = (await MLBData.getSchedule(this.today));
		callback.call(this, data);
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
