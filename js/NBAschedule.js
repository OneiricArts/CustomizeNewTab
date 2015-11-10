var debug = true;

var NBAschedule = (function(){
	
	var localJsonObj;
	var $games = {};

	/*
		http://stackoverflow.com/questions/1531093/
		how-to-get-current-date-in-javascript
	*/
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	var url = 'http://data.nba.com/5s/json/cms/noseason/scoreboard/' 
	+ yyyy + mm + dd + '/games.json';

	var xhr = new XMLHttpRequest();

	function saveLocalData() {
		chrome.storage.local.set({'NBAgamesJson': localJsonObj}, 
			function() {
				if(debug){console.log('Settings saved');}
		});
	}

	function clearGames() {
		var $game_table_rows = $('#NBA_game_table tr');
		// remove rows besides header and hidden template (first 2)
		for(var i = 2; i < $game_table_rows.length; i++) {
			$game_table_rows[i].remove();
		}
	}

	function displayAllDays() {

		var $game_table = $('#NBA_game_table');

		//console.log(localJsonObj.sports_content.games.game);

		for (var i = 0; i < localJsonObj.sports_content.games.game.length; i++) {

			var $game_item = $game_table.find('#game_item_template').clone();
			$game_item.removeAttr('id');

			var $home_team = $game_item.find('#home_team');
			var $away_team = $game_item.find('#away_team');
			var $home_score = $game_item.find('#score');
			var $game_time = $game_item.find('#time');

			var game = localJsonObj.sports_content.games.game[i];

			$home_team.html(game.home.nickname);
			$away_team.html(game.visitor.nickname);

			$home_score.html('-');
			$game_time.html(game.time-1200-300);
			
			$game_table.append($game_item);
			$game_item.removeAttr('style');			
		}		
	}

	/* 
		gets the game data for the week if no local data is present, or if 
		week has been updated 
	*/
	function getNewWeekData(exists) {
		console.log('trying')

		$.getJSON(url, function(data) {
		  	console.log(data);
		  	localJsonObj = data;
		  	clearGames();
		  	displayAllDays();
		});
	}


	function handler() {

		chrome.storage.local.get('NBAgamesJson', function (result) {
			
			if(debug){console.log('NBA handler...');}

			if(result.NBAgamesJson) {

				console.log('A');
				localJsonObj = result.NBAgamesJson;
				displayAllDays();
				getNewWeekData();
			}
			else {
				console.log('B');
				getNewWeekData();
			}
		});
	}

	/* API for other js code */
	return {
		handler: handler,
	}

})();