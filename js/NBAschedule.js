var debug = true;

var NBAschedule = (function(){
	
	var localJsonObj;
	var $games = {};
	var timeoutID;

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
		for(var game in $games) {
			console.log($games[game]);
			$games[game].remove();
		}
	}

	function displayAllDays() {

		var $game_table = $('#NBA-panel #NBA_game_table');

		var $reset_games = $('#NBA-panel #reset_games');
		$reset_games.click(resetGames);

		//console.log(localJsonObj.sports_content.games.game);

		for (var i = 0; i < localJsonObj.sports_content.games.game.length; i++) {

			var game = localJsonObj.sports_content.games.game[i];

			var $game_item = $game_table.find('#game_item_template').clone();
			$game_item.removeAttr('id');


			$game_item.click({id: game.id}, createGameDetails);

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

			$games[game.id] = $game_item;

			var $remove = $game_item.find('#remove');
			$remove.click({id: game.id},removeGame);
		}	

		updateScores();
	}

	function updateScores() {

		console.log('updating scores...');
		$.getJSON(url, function(data) {

			local_games = localJsonObj.sports_content.games.game;
			all_games = data.sports_content.games.game;

			var i,j;
			for (i=0, j=0; i < all_games.length; i++) {

				// same game?
				if(all_games[i].id == local_games[j].id) {
					
					var new_game_ui = all_games[i].period_time.period_status +  
									  all_games[i].period_time.game_clock;

					var old_game_ui = local_games[j].period_time.period_status +  
									  local_games[j].period_time.game_clock;
									  				  
					if(new_game_ui !== old_game_ui) {
						console.log('new!');
						writeGameDetails($games[all_games[i].id], all_games[i], true);
						local_games[j] = all_games[i];
						saveLocalData();
					}
					j++;
				}
			}
			timeoutID = window.setTimeout(updateScores, 5000);
		});
	}

	function writeGameDetails($game, game, update) {

		if(!update) {
			var $home_team = $game.find('#home_team');
			var $away_team = $game.find('#away_team');	

			$home_team.html(game.home.nickname);
			$away_team.html(game.visitor.nickname);	
		}

		var $home_score = $game.find('#score');
		var $game_time = $game.find('#time');

		$home_score.html(game.home.score + '-' + game.visitor.score);		
		$game_time.html(game.period_time.period_status + " " + game.period_time.game_clock);
		
		if(update) {
			//$game.fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
			$game.effect("highlight", {color: '#FFFF99'}, 2000);
		}
	}

	function createGameDetails(event) {
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

	function removeGame(event) {

		console.log('NBA removeGame');

		for (var i = 0; i < localJsonObj.sports_content.games.game.length; i++) {
			if(localJsonObj.sports_content.games.game[i].id == event.data.id) 
			{
				localJsonObj.sports_content.games.game.splice(i, 1);
				console.log(localJsonObj.sports_content.games.game.length);
				$games[event.data.id].remove();
				break;
			}
		}
		saveLocalData();
	}

	function resetGames() {
		clearGames();
		getNewWeekData(false);
	}
	/* 
		gets the game data for the week if no local data is present, or if 
		week has been updated 
	*/
	function getNewWeekData(date) {

		console.log('Get New Data');

		$.getJSON(url, function(data) {
			if(date && date == 
				data.sports_content.sports_meta.season_meta.calendar_date){
				console.log('Old Data Same as New Data, dont overwrite');		
			}
			else {
				console.log('replacing old data with new data');
			  	//console.log(data);
			  	localJsonObj = data;
			  	saveLocalData();
			  	clearGames();
			  	displayAllDays();
		  	}
		});
	}


	function handler() {

		chrome.storage.local.get('NBAgamesJson', function (result) {
			
			if(debug){console.log('NBA handler...');}

			if(result.NBAgamesJson) {

				console.log('Display Old DataFirst');
				localJsonObj = result.NBAgamesJson;
				displayAllDays();
				getNewWeekData(localJsonObj.sports_content.sports_meta.season_meta.calendar_date);
			}
			else {
				console.log('No Old Data');
				getNewWeekData();
			}
		});
	}

	/* API for other js code */
	return {
		handler: handler,
	}

})();