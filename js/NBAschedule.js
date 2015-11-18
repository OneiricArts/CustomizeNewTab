/*

*/
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
	//var url = 'http://data.nba.com/json/cms/noseason/scoreboard/' 

	var url = 'http://data.nba.com/5s/json/cms/noseason/scoreboard/' 
	+ yyyy + mm + dd + '/games.json';
	var conf_standings_url = 'http://data.nba.com/json/cms/'+yyyy+'/standings/conference.json';

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

		$('#NBA-panel #standings-btn').click(standings);

		//console.log(localJsonObj.sports_content.games.game);

		for (var i = 0; i < localJsonObj.sports_content.games.game.length; i++) {

			var game = localJsonObj.sports_content.games.game[i];

			var $game_item = $game_table.find('#game_item_template').clone();
			$game_item.removeAttr('id');



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

			$games[game.id] = $game_item;
			
			/* if i want teh popup to be a row right under:
			$game_table.append("<tr id='"  
				+ game.id 
				+ '#demo'
				+ "' class='collapse'><td colspan='5'><span id='gameid'></td></tr>")	
			$game_item.attr('data-target', '#' + game.id);*/
			$game_item.click({game: game}, createGameDetails);


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
	
		$('#NBA-panel #NBA-game-info #header').html(event.data.game.visitor.nickname
				+ ' @ ' + event.data.game.home.nickname);

		var boxscoreurl = "http://data.nba.com/json/cms/noseason/game/"
		+yyyy+mm+dd 
		+ '/'
		+ event.data.game.id
		+"/boxscore.json";

		var playbyplay_url = "http://data.nba.com/json/cms/noseason/game/"
							+ yyyy+mm+dd + '/' + event.data.game.id
							+ "/pbp_" + event.data.game.period_time.period_value 
							+ ".json"

		updatePlayByPlay(playbyplay_url);

/*		$.getJSON(boxscoreurl, function(data) {
			//var game = data.sports_content.game;
			console.log("box score url: " + boxscoreurl);
		});*/
	}

	function updatePlayByPlay(playbyplay_url){
		$.getJSON(playbyplay_url, function(data) {
			console.log('pbp: ' + playbyplay_url);

			var $tbody = $('#NBA-panel #NBA-game-info #pbp tbody');

			var plays = data.sports_content.game.play;
			$tbody.html("");
			var counter, i;
			for (counter = 0, i = plays.length - 1; i >= 0, counter < 10; i--, counter++) {
				var tr = "<tr>";
				tr += "<td>" + plays[i].clock + "</td>";
				tr += "<td>" + plays[i].description + "</td>";
				tr += "<td>" + plays[i].home_score + "</td>";
				tr += "<td>" + plays[i].visitor_score + "</td>";
				tr += "</tr>";
				$tbody.append( tr);
			};
		});
	}

	function removeGame(event) {

		for (var i = 0; i < localJsonObj.sports_content.games.game.length; i++) {
			if(localJsonObj.sports_content.games.game[i].id == event.data.id) 
			{
				localJsonObj.sports_content.games.game.splice(i, 1);
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

	function standings() {
		var $modal_body = $('#NBA-standings .modal-body');

		$.getJSON(conf_standings_url, function(data) {

			var west = data.sports_content.standings.conferences.West.team;
			var east = data.sports_content.standings.conferences.East.team;
			var tabs = [west, east];

			var $west = $modal_body.find('#West');
			var $east = $modal_body.find('#East');
			var $tabs = [$west, $east];

			for(var i = 0; i < tabs.length; i++) {
				var conf = tabs[i];
			
				var $standings_table = $modal_body.find('#standings-table-temp').clone();
				$standings_table.removeAttr('id');

				for(var j = 0; j < conf.length; j++) {

					var $standings_item = $standings_table.find('#standings-item-temp').clone();
					$standings_item.removeAttr('id');

					$standings_item.find('#rank').html(j+1);
					$standings_item.find('#team').html(conf[j].name);
					$standings_item.find('#pct').html(conf[j].team_stats.pct);
					$standings_item.find('#wins').html(conf[j].team_stats.wins);
					$standings_item.find('#losses').html(conf[j].team_stats.losses);
					$standings_item.find('#streak').html(conf[j].team_stats.streak);

					if(j==7) { //playoff team divider
						var border="border-bottom:3pt solid grey;";
						$standings_item.attr("style",border);
					}

					$standings_table.append($standings_item);
					$standings_item.show();	
				}

				$tabs[i].html($standings_table);
				$standings_table.show();
			}
		});
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