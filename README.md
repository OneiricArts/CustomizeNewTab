
### Notes

Bootstrap 4 got rid of panels ... I went back to panels. Change that to cards sometime before Bootstrap 4 is stable. But Bootstrap 4 didn't like my glyphs, and after a lot of frustration I decided to ditch it for now.

Performance: TODO
Currently, seems to take less memory than default New Tab Page for Chroem? (using Google Chrome's Task manager)

### //TODO
1. On hide in myScript have an api to terminate update function of NFL / NBA
2. Also internal check (see if all 'Final') to cancel update()?
2. Have View options (upcoming & current games only, favorites, etc.) (theres a filter glyph too) ... lower priority since you can just delete shit.
2. Use (one of) eye-open / fire / bullhorn / bell to signal live game. use one of them plus text in a button for red zone? 
3. Update Needs to add multiple events to live games.
4. Remove <all_urls> permission (add nba url)
5. Currently, downloading new games clears data first. what happens when there is no internet connection? Retain old data? (actually, clear doesn't remove from local data, so if user refreshes page, old data will show. include last updated somewhere?)

... these will totally get done. 

### Bugs
* For NBA, the time sometimes reads something like Final 2:30. It should just read Final in those situations.
	- Tip off has similar problem
* ~~Currently Downloading / Resetting All games just appends to current list. A refresh fixes this problem (for me and dev work it is adequite for now).~~

### NFL API Response Example

```
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
```


### Coding Stuff

```javascript
try {
	games_by_days[game.d].push(game);	
} catch (e) {

	/* if its a type error, means can't push.
		probably means that a day (key) was encountered
		that i hadn't though I would see. so just add it
	*/
	if (e instanceof TypeError) {
		games_by_days[game.d] = [game];	
	} 
}

vs.

if(games_by_days[game.d]) {
	games_by_days[game.d].push(game);
} else {
	games_by_days[game.d] = [game];
}
```