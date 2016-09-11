
"use strict";

class NFL extends Sport {

	constructor() {
		super();
		this.dataKey = 'NHL';
		this.schedule_url =  'http://www.nfl.com/liveupdate/scorestrip/ss.json';
    }

	writeToTemplate(error) {
		console.log('>>>>>>>>>>>>>');
		console.log(this.data);

		if(error) {
			if(!this.data) {this.data = {};}
			this.data['error'] = true;
			this.data.games = null;
		}

        this.displayTemplate('NFLschedule', 'games', this.data.gms, $('#NFL_widget'));
	}

	getJsonData(url, callback) {
		console.log('getting from internet.');
		console.log(url);
		$.getJSON(url, function(result) {
			this.massageData.call(this, result, callback);
		}.bind(this)).fail(function(result){
		}.bind(this));
		// TODO handle timeout
	}

	massageData(data, callback) {
		console.log(data);
		try {
            var url = 'http://www.nfl.com/liveupdate/scores/scores.json'
            $.getJSON(url, function(result) {

                for (var i = 0; i < data.gms.length; i++) {

                    data.gms[i]['extrainfo'] = result[data.gms[i].eid];

                    /*if(data.gms[i].q == 'P') {
                        data.gms[i]['hasntStarted'] = true; 
                    }*/

                    if(data.gms[i]['extrainfo'].home.score[1] !== null) {
                        data.gms[i]['scoreTable'] = true; 
                    }

                    if(!isNaN(data.gms[i].q)) {
                        data.gms[i]['playing'] = true; 
                    }

                    if(data.gms[i].q === 'F' || data.gms[i].q === 'FO') {
                        data.gms[i]['done'] = true; 
                    }
                }
                callback.call(this,data);		
            }.bind(this));
			callback.call(this, data);
		}
		catch(e) {
			console.log('fudge cakes -- massageData' + e);
		}
	}

	cacheButtonActions() {
		//var that = this;
		//$('body').on('click', '#NBA_game_table #remove-game-btn', {that: that}, this.removeGame);
		$('body').on('click', '#NHL_widget #reset_games', this.resetSchedule.bind(this));
		$('body').on('click', '#NHL_widget #tomorrow-btn', this.changeDay.bind(this, 1));
		$('body').on('click', '#NHL_widget #yesterday-btn', this.changeDay.bind(this,-1));
		$('body').on('click', '#NHL_widget #today-btn', this.changeDay.bind(this,0));
	}
}


