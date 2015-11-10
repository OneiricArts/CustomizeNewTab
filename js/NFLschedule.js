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
				if(debug){console.log('Settings saved');}
		});

		
	}

	function resetGames() {
		getNewWeekData(false);	
		//saveLocalData();
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
				console.log('getNewWeekData');

				// same week, don't update
				if(exists && (localJsonObj.gms.w == jsonObj.gms.w) ) {}

				else { // new week, update
					localJsonObj = null;
					localJsonObj = jsonObj;

					console.log('got all new data');
					console.log(localJsonObj);
					saveLocalData();
				}	

				displayAllDays();
			}
		}
		xhr.send();
	}

	// TODO -- still need $games obj
	/*
		<g eid="2015110900" gsis="56634" d="Mon" t="8:30" q="1" k="08:11" 
		h="SD" hnn="chargers" hs="0" v="CHI" vnn="bears" vs="0" p="SD" rz="1" 
		ga="" gt="REG"/>

		<g eid="2015110900" gsis="56634" d="Mon" t="8:30" q="1" k="06:50" 
		h="SD" hnn="chargers" hs="7" v="CHI" vnn="bears" vs="0" p="CHI" rz="0" 
		ga="" gt="REG"/>


		<g eid="2015110809" gsis="56632" d="Sun" t="4:25" q="F" h="IND" 
		hnn="colts" hs="27" v="DEN" vnn="broncos" vs="24" rz="0" 
		ga="" gt="REG"/>

		<g eid="2015110810" gsis="56633" d="Sun" t="8:30" q="FO" h="DAL" 
		hnn="cowboys" hs="27" v="PHI" vnn="eagles" vs="33" rz="0" ga="" 
		gt="REG"/>
		
		<g eid="2015110900" gsis="56634" d="Mon" t="8:30" q="H" h="SD" 
		hnn="chargers" hs="16" v="CHI" vnn="bears" vs="7" rz="0" ga="" 
		gt="REG"/>
	*/
	function updateGames() { 

		xhr.open("GET", url, true);		
		xhr.onreadystatechange = function() {
			
			var response = xhr.responseXML;
			if(response) {
				var jsonObj = $.xml2json(response);

				console.log('updating...');
				for (var i = 0; i < jsonObj.gms.g.length; i++) {
					
					var game = jsonObj.gms.g[i];
					var q = game.q;

					if (q == '1' || q == '2' || q == '3' || q == '4' ) { 
						console.log('changing scores.. ' + game.hs + '-' + game.vs);
						var $scores = $games[game.eid].find('#score');
						$scores.html(game.hs + '-' + game.vs);

						for (var j = 0; j < localJsonObj.gms.g.length; j++) {
							if(localJsonObj.gms.g[j].eid == game.eid) {
								localJsonObj.gms.g[j] = game;
								saveLocalData();
							}
						}
					}
				}
			}
		}
		xhr.send();
	}

	function removeGame(event) {
		console.log('removeGame');

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
			
			if(debug){console.log('handler...');}

			if(result.gamesJson) {
				localJsonObj = null;
				console.log(result.gamesJson.gms.g.length);
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