var debug = true;

var NFLschedule = (function(){
	
	var localJsonObj;
	var $games = {};
	var url = 'http://www.nfl.com/liveupdate/scorestrip/ss.xml'
	var xhr = new XMLHttpRequest();

	//$('#week_number').text("Week " + week_number);
	//week_number = jsonObj.gms.w;

	function saveLocalData() {
		chrome.storage.local.set({'gamesJson': localJsonObj}, 
			function() {
		});
	}

	function resetGames() {

		var $game_table_rows = $('#game_table tr');

		// remove rows besides header and hidden template
		// ^ thats why starts at 2
		for(var i = 2; i < $game_table_rows.length; i++) {
			$game_table_rows[i].remove();
		}

		getNewWeekData(false);	
		//saveLocalData(); <--- concurency doesn't allow it here. 
		//runs alongside getNewWeekData so needs to be called from there
	}

	function displayAllDays() {

		var $reset_games = $('#reset_games');
		$reset_games.click(resetGames);

		var $refresh_scores = $('#refresh_scores');
		$refresh_scores.click(updateGames);
		

		$('#week_number').text("Week " + localJsonObj.gms.w);

		var $game_table = $('#game_table');

		for (var i = 0; i < localJsonObj.gms.g.length; i++) {

			var $game_item = $game_table.find('#game_item_template').clone();
			$game_item.removeAttr('id');

			var $home_team = $game_item.find('#home_team');
			var $away_team = $game_item.find('#away_team');
			var $home_score = $game_item.find('#score');
			var $game_time = $game_item.find('#time');

			var game = localJsonObj.gms.g[i];

			$home_team.html(game.hnn);
			$away_team.html(game.vnn);

			$home_score.html(game.hs + '-' + game.vs);

			var arrtime = game.t.split(':');
			var hrs = arrtime[0];
			var mins = arrtime[1];

			// in EST
			$game_time.html(game.d + ' ' + hrs + ":" + mins);
			
			$game_table.append($game_item);
			$game_item.removeAttr('style');

			$games[game.eid] = $game_item;
			
			var $remove = $game_item.find('#remove');
			$remove.click({eid: game.eid, game:$game_item},removeGame);
		}		
		updateGames();
	}

	/* 
		gets the game data for the week if no local data is present, or if 
		week has been updated 
	*/
	function getNewWeekData(exists) {

		xhr.open("GET", url, true);		
		xhr.onreadystatechange = function() {

			var response = xhr.responseXML;

			if(response) {

				var jsonObj = $.xml2json(response);

				// same week, don't update
				if(exists && (localJsonObj.gms.w == jsonObj.gms.w) ) {}

				else { // new week, update
					localJsonObj = null;
					localJsonObj = jsonObj;
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
			
			var response = xhr.responseXML;
			if(response) {
				var jsonObj = $.xml2json(response);

				/*var done = ['F', 'FO'];
				var playing = ['1', '2', '3', '4'];

				for (var i = 0; i < jsonObj.gms.g.length; i++) {
					
					var game = jsonObj.gms.g[i];

					for (var j = 0; j < localJsonObj.gms.g.length; j++) {

						var lgame = localJsonObj.gms.g[j];

						if(lgame.eid == game.eid) {

							if( (done.indexOf(lgame.q) < 0) &&
								(done.indexOf(game.q) >= 0) ) {
								updateScore(game, j);
							}

							if( playing.indexOf(game.q) >= 0 ) {
								updateScore(game, j)
							}
							break;
						}
					}
				}*/

				var i,j;	// i for old, j for new
				for (i=0, j=0; j < localJsonObj.gms.g.length; i++) {

					var new_game = jsonObj.gms.g[i];
					var old_game = localJsonObj.gms.g[j];

					styleScores(old_game);

					// same game?
					if(new_game.eid == old_game.eid) {
						/*if( (new_game.q !== old_game.q) || (new_game.hs !== old_game.hs) || 
							(new_game.vs !== old_game.vs) ){				
							updateScore(new_game, j);			
						}*/
						updateScore(new_game, j);
						j++;
					}
				}
			}
		}
		xhr.send();
	}

	function styleScores(game) {
		var visitor_score = parseInt(game.vs);
		var home_score = parseInt(game.hs);

		var home_winning = home_score > visitor_score;
		var visitor_winning = visitor_score > home_score;

		//console.log('styleScores => ' + home_winning + " " + visitor_winning);

		$games[game.eid].find('#away_team').toggleClass('winning', visitor_winning);
		$games[game.eid].find('#home_team').toggleClass('winning', home_winning);
	}

	function updateScore(game, index) {
		var $scores = $games[game.eid].find('#score');
		$scores.html(game.hs + '-' + game.vs);

		if(game.rz && (parseInt(game.rz) !== 0) ) {
			$scores.append(' [RZ]')

		}
		if(game.k) {
			var $time = $games[game.eid].find('#time');
			$time.html(game.q + "Q: " + game.k);		
		}

		styleScores(game);

		// update local info
		localJsonObj.gms.g[index] = game;
		saveLocalData();
	}

	function removeGame(event) {
		for (var i = 0; i < localJsonObj.gms.g.length; i++) {
			if(localJsonObj.gms.g[i].eid == event.data.eid) 
			{
				localJsonObj.gms.g.splice(i, 1);
				break;
			}
		}
		event.data.game.remove();
		saveLocalData();
	}

	function handler() {

		chrome.storage.local.get('gamesJson', function (result) {
			
			if(result.gamesJson) {
				localJsonObj = null;
				localJsonObj = result.gamesJson;
				getNewWeekData(true);
			}
			else {
				getNewWeekData(false);
			}
		});
	}

	/* API for other js code */
	return {
		handler: handler,
	}

})();