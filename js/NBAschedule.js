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

	function twoDigits(n) {
		return n<10? '0'+n:''+n
	}

	dd = twoDigits(dd);
	mm = twoDigits(mm);

	//dd = '09';
	//dd = '25';
	//var url = 'http://data.nba.com/json/cms/noseason/scoreboard/' 

	var url = 'http://data.nba.com/5s/json/cms/noseason/scoreboard/' 
	+ yyyy + mm + dd + '/games.json';
	var conf_standings_url = 'http://data.nba.com/json/cms/'+yyyy+'/standings/conference.json';

	var xhr = new XMLHttpRequest();

	function saveLocalData() {
		chrome.storage.local.set({'NBAgamesJson': localJsonObj}, 
			function() {
		});
	}

	function clearGames() {
		for(var game in $games) {
			$games[game].remove();
		}
	}

	function cacheButtons() {
		var $reset_games = $('#NBA-panel #reset_games');
		$reset_games.click(resetGames);
		$('#NBA-panel #standings-btn').on('click', standings);

		$('body').on('click', '#NBA-panel #remove-game-btn', removeGame);
	}

	function cacheGames() {
		var games = [];
		$('#NBA-schedul-games tr').each(function(){
			games[$(this).attr('id')] = $(this);
		});

		$games = games;
	}

	function displayAllDays(reset) {

		if(reset) {
		  	clearGames();
		}
		
		var $game_table = $('#NBA-panel #NBA_game_table');

		if(localJsonObj.sports_content.games.game.length == 0) {
			$game_table.html('<span class="glyphicon glyphicon-bell"></span> No Games Today');
			return;
		}

		else {
			var source = document.getElementById("NBA-schedule-template").innerHTML;
			var template = Handlebars.compile(source);
			var data = {games: localJsonObj.sports_content.games.game};
			var output = template(data);
			$game_table.find('tbody').html(output);
		}

		cacheGames();
		updateScores();
	}

	function updateScores() {

		$.getJSON(url, function(data) {

			local_games = localJsonObj.sports_content.games.game;
			all_games = data.sports_content.games.game;

			var i,j;
			for (i=0, j=0; i < all_games.length; i++) {

				// same game?
				if(all_games[i].id == local_games[j].id) {
					
					var game_time = (all_games[i].period_time.period_status +  
									  all_games[i].period_time.game_clock) ==
									  (local_games[j].period_time.period_status +  
									  local_games[j].period_time.game_clock);

					var visitor_scores = all_games[i].visitor.score == local_games[j].visitor.score;
					var home_scores = all_games[i].home.score == local_games[j].home.score;
									  				  
					if( (!game_time) || (!visitor_scores) || (!home_scores) ) {
						
						//console.log('new!');
						writeGameDetails($games[all_games[i].id], all_games[i], true);
						local_games[j] = all_games[i];
						saveLocalData();
					}
					styleScores(local_games[j]);
					j++;
				}
			}

			/*for(var i = 0; i < local_games.length; i++) {
			}*/

			timeoutID = window.setTimeout(updateScores, 10000);
		});
	}

	function styleScores(game) {
		var visitor_score = parseInt(game.visitor.score);
		var home_score = parseInt(game.home.score);

		var home_winning = home_score > visitor_score;
		var visitor_winning = visitor_score > home_score;

		//console.log('styleScores => ' + home_winning + " " + visitor_winning);

		$games[game.id].find('#away_team').toggleClass('winning', visitor_winning);
		$games[game.id].find('#home_team').toggleClass('winning', home_winning);
	}

	function writeGameDetails($game, game, update) {

		if(!update) {
			var $home_team = $game.find('#home_team');
			var $away_team = $game.find('#away_team');	

			$home_team.html(game.home.nickname);
			$away_team.html(game.visitor.nickname);	
		}

		var $home_score = $game.find('#h-score');
		var $visitor_score = $game.find('#v-score');
		var $game_time = $game.find('#time');

		$home_score.html(game.home.score); 
		$visitor_score.html(game.visitor.score);

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

	function removeGame() {
		
		for (var i = 0; i < localJsonObj.sports_content.games.game.length; i++) {
			var targetId = $(this).closest('tr').attr('id');
			if(localJsonObj.sports_content.games.game[i].id == targetId) 
			{
				localJsonObj.sports_content.games.game.splice(i, 1);
				$games[targetId].remove();
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
		$.getJSON(conf_standings_url, function(data) {

			var source = document.getElementById("NBA-standings-template").innerHTML;
			var template = Handlebars.compile(source);
			var input = {teams: data.sports_content.standings.conferences.West.team};
			var output = template(input);
			$('#NBA-standings .modal-body #West').html(output);

			input = {teams: data.sports_content.standings.conferences.East.team};
			output = template(input);
			$('#NBA-standings .modal-body #East').html(output);
			
			// Mark Playoff teams with grey line
			var border="border-bottom:3pt solid grey;";
			$($('#NBA-standings .modal-body #West tr')[8]).attr("style",border);
			$($('#NBA-standings .modal-body #East tr')[8]).attr("style",border);
		});
	}

	/* 
		gets the game data for the week if no local data is present, or if 
		week has been updated 
	*/
	function getNewWeekData(date) {


		$.getJSON(url, function(data) {
			if( date && date == 
				data.sports_content.sports_meta.season_meta.calendar_date){
			}
			else {
			  	localJsonObj = data;
			  	saveLocalData();
			  	displayAllDays(true);
		  	}
		});
	}


	function handler() {

		cacheButtons();

		chrome.storage.local.get('NBAgamesJson', function (result) {
			

			if(result.NBAgamesJson) {
				localJsonObj = result.NBAgamesJson;
				displayAllDays();
				getNewWeekData(localJsonObj.sports_content.sports_meta.season_meta.calendar_date);
			}
			else {
				getNewWeekData();
			}
		});
	}

	/* API for other js code */
	return {
		handler: handler,
	}

})();