var debug = false;

var NFLschedule = (function(){

	function displayAllDays(jsonObj) {

		$('#week_number').text("Week " + jsonObj.gms.w);
		
		// determines order
		var days = ["Thu", "Sun", "Mon"];
		
		var games_by_days = {
			"Sun": [],
			"Mon": [],
			"Thu": [],
		};

		for (var i = 0; i < jsonObj.gms.g.length; i++) {
			game = jsonObj.gms.g[i];
			
			try {
				games_by_days[game.d].push(game);	
			} catch (e) {

				/* if its a type error, means can't push.
					probably means that a day (key) was encountered
					that i hadn't though I would see. so just add it
				
					replace with if has key / else ?
				*/
				if (e instanceof TypeError) {
					games_by_days[game.d] = [game];	
				} 
			}
		};

		// go through all days
		for (var i = 0; i < days.length; i++) {
			if(debug){console.log(days[i] + "...");}

			var $game_div = $('#game_day_template').clone();
			$game_div.removeAttr('id');

			var $game_title = $game_div.find('.card-title');
			var $game_list = $game_div.find('ul');

			$game_title.html(days[i]);

			// go through games for that day
			for (var j = 0; j < games_by_days[days[i]].length; j++) {

				var $game_item = $game_div.find('#game_item_template').clone();
				$game_item.removeAttr('id');

				var $home_team = $game_item.find('#home-team');
				var $away_team = $game_item.find('#away-team');

				var $home_score = $game_item.find('#home-score');
				var $away_score = $game_item.find('#away-score');
				var $game_time = $game_item.find('#game-time');

				var game = games_by_days[days[i]][j];

				$home_team.html(game.hnn);
				$away_team.html(game.vnn);

				$home_score.html(game.hs);
				$away_score.html(game.vs);

				var arrtime = game.t.split(':');
				var hrs = arrtime[0];
				var mins = arrtime[1];

				/*var date = new Date();
				date.setHours(parseInt(hrs)+4);
				date.setMinutes(parseInt(mins));
				console.log(date.toString() + ' || ' + hrs+":"+mins + ' --> ' + date.toLocaleTimeString() );*/

				$game_time.html(hrs + ":" + mins + " (EST)");
				$game_list.append($game_item);
				$game_item.removeAttr('style');
			}

			$('#nfl_games').append($game_div);
			$game_div.show();
		}
	}

	function getDataFromAPI(storedjsonObj) {

		var url = 'http://www.nfl.com/liveupdate/scorestrip/ss.xml'

		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		
		xhr.onreadystatechange = function() {
			if(debug){console.log('got xml');}

			var response = xhr.responseXML;

			if(response) {
				var jsonObj = $.xml2json(response);

				if( storedjsonObj && (jsonObj.gms.w == storedjsonObj.gms.w) ) {
					// do nothing, already up to date
				}

				else {
					chrome.storage.local.set({'gamesJson': jsonObj}, 
					function() {
						if(debug){console.log('Settings saved');}
					});
					displayAllDays(jsonObj);	
				}
			}
		}
		xhr.send();
	}


	function handler() {

		chrome.storage.local.get('gamesJson', function (result) {
			
			if(debug){console.log('handler...');}

			if(result.gamesJson) {
				//displayAllDays(result.gamesJson);
				//getDataFromAPI(result.gamesJson);
				getDataFromAPI(null);

			}
			else {
				getDataFromAPI(null);
			}
		});
	}

	/* API for other js code */
	return {
		handler: handler,
	}

})();