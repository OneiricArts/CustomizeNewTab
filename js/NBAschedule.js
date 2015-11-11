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

	//dd = '09';
	//dd = '11';
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
		var $game_table_rows = $('#NBA-panel #NBA_game_table tr');
		// remove rows besides header and hidden template (first 2)
		for(var i = 2; i < $game_table_rows.length; i++) {
			$game_table_rows[i].remove();
		}
	}

	function displayAllDays() {

		var $game_table = $('#NBA-panel #NBA_game_table');

		//console.log(localJsonObj.sports_content.games.game);

		for (var i = 0; i < localJsonObj.sports_content.games.game.length; i++) {

			var game = localJsonObj.sports_content.games.game[i];

			var $game_item = $game_table.find('#game_item_template').clone();
			$game_item.removeAttr('id');


			$game_item.click({id: game.id},updateShit);

			var $home_team = $game_item.find('#home_team');
			var $away_team = $game_item.find('#away_team');
			var $home_score = $game_item.find('#score');
			var $game_time = $game_item.find('#time');


			$home_team.html(game.home.nickname);
			$away_team.html(game.visitor.nickname);


			$home_score.html(game.home.score + '-' + game.visitor.score);
			
			//$game_time.html(game.time-1200-300);
			$game_time.html(game.period_time.period_status + " " + game.period_time.game_clock);

			$game_table.append($game_item);
			$game_item.show();	
							
			/*$game_table.append("<tr id='"  
				+ game.id 
				+ '#demo'
				+ "' class='collapse'><td colspan='5'><span id='gameid'></td></tr>")*/		
		
			$game_item.attr('data-toggle', 'collapse');
			//$game_item.attr('data-target', '#' + game.id);
			$game_item.attr('data-target', '#demo');
		}		
	}

	function updateShit(event) {
		//$('#' +event.data.id + ' #gameid').html(event.data.id);
		

		var boxscoreurl = "http://data.nba.com/json/cms/noseason/game/"
		+yyyy+mm+dd 
		+ '/'
		+ event.data.id
		+"/boxscore.json";

		$.getJSON(boxscoreurl, function(data) {

			var game = data.sports_content.game;

			$('#demo #game-id').html(event.data.id);
			$('#demo #period-value').html(game.period_time.period_value);
			$('#demo #game-clock').html(game.period_time.game_clock);

			console.log('---------');
			//console.log(data.sports_content);
		});
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