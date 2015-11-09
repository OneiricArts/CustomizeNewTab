var debug = false;

var NFLschedule = (function(){

	var days = [];	 //api gets games in order inside week	
	var games_by_days = {};
	var week_number;
	

	var url = 'http://www.nfl.com/liveupdate/scorestrip/ss.xml'
	var xhr = new XMLHttpRequest();

	function formatData(jsonObj) {

		week_number = jsonObj.gms.w;

		$('#week_number').text("Week " + week_number);

		for (var i = 0; i < jsonObj.gms.g.length; i++) {
			game = jsonObj.gms.g[i];
			
			key = game.d + " @ " + game.t;
			//console.log(key)

			if(games_by_days[key]) {
				games_by_days[key].push(game);
			} else {
				games_by_days[key] = [game];
				days.push(key);
			}
		}	
	}

	function saveLocalData() {

		var local_data = {
			'w': week_number,
			'gms': games_by_days,
			'days': days
		};

		console.log(days);

		chrome.storage.local.set({'gamesJson': local_data}, 
			function() {
				if(debug){console.log('Settings saved');}
		});
	}

	function displayAllDays(jsonObj) {


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

				$game_time.html(hrs + ":" + mins /* + " (EST)"*/);
				$game_list.append($game_item);
				$game_item.removeAttr('style');
				

				var $remove = $game_item.find('#remove');
				$remove.click({eid: game.eid, game:$game_item, 
					daytimekey: game.d + " @ " + game.t},removeGame);

				//console.log(game);

				$game_item.attr('id', game.eid);
			}

			$('#nfl_games').append($game_div);
			$game_div.show();
		}
	}

	/* 
		gets the game data for the week if no local data is present, or if 
		week has been updated 
	*/
	function getNewWeekData(localJsonObj) {

		xhr.open("GET", url, true);		
		xhr.onreadystatechange = function() {
			if(debug){console.log('got xml');}

			var response = xhr.responseXML;

			if(response) {
				var jsonObj = $.xml2json(response);

				console.log('doing shit')
				console.log(localJsonObj)
				console.log( "==>" + localJsonObj['w']);

				console.log(localJsonObj['w'] == jsonObj.gms.w);

				// same week, display old data
				if(  localJsonObj && (localJsonObj['w'] == jsonObj.gms.w) ) {

					games_by_days = localJsonObj['gms'];
					days = localJsonObj['days'];
					week_number = localJsonObj['w'];

					console.log(games_by_days);
					console.log(days);
					console.log(week_number);

				}

				else {
					formatData(jsonObj);
					saveLocalData();
				}	

				displayAllDays();
				
			}
		}
		xhr.send();
	}

	function updateGames() {

		xhr.open("GET", url, true);
		xhr.onreadystatechange = function() {

			for (var i = 0; i < result.gms.g.length; i++) {
				game = jsonObj.gms.g[i];
				
				key = game.eid;


				if (game.q == 'iP') { //TODO
					var $home_score = $games[key].find('#home-score');
					var $away_score = $games[key].find('#away-score');

					$home_score.html(game.hs);
					$away_score.html(game.vs);
				}
			}
		}
		xhr.send();
	}

	function removeGame(event) {
		console.log('removeGame');
		//console.log(event.data.eid);
		//console.log(event.data.game);
		//console.log(event.data.daytimekey);

		daytimekey = event.data.daytimekey;

		if(daytimekey in games_by_days) {
			for (var i = 0; i < games_by_days[daytimekey].length; i++) {
				console.log(games_by_days[daytimekey][i].eid)
				if(games_by_days[daytimekey][i].eid == event.data.eid) {
					games_by_days[daytimekey].splice(i, 1);
					break;
				}
			}
		} 

		event.data.game.remove();

		saveLocalData();
	}


	function handler() {

		chrome.storage.local.get('gamesJson', function (result) {
			
			if(debug){console.log('handler...');}

			if(result.gamesJson) {
				getNewWeekData(result.gamesJson);
			}
			else {
				getNewWeekData(null);
			}
		});


	}

	/* API for other js code */
	return {
		handler: handler,
	}

})();