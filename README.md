Hi! I built this because most sports websites suck, it takes too many clicks for me to see scheduled games and which ones are close. Unfortunately, life is busy and I used this as a way to de-stress. Hence, the code is crap. I've started to fix that and actually use objects and design things (flow chart, etc.). I think it might be easier to do a clean re-write while I am still on vacation, especially since there is currently a critical bug on the distributed extension that will destroy the NBA widget on January 1st. No Pressure. Well actually, there is none, because I've already fixed that bug in dev and I could just push those 3 lines of code before January 1st, but I like that deadline to deliver a non-shitty code version so I can also extend it easily when life gets busy.

### Dowload and Screenshots on Google Store
https://chrome.google.com/webstore/detail/sports-new-tab-page-beta/cbdhcjkifbkbckpoejnakoekiheijpei

### Firefox
Just waiting on them to finish the WebExtensions :) and then will port over. Should only need to change Chrome local storage stuff to whatever Firefox uses. Oh, and top sites.

### ICON CREDIT
Need to add footer and credit http://www.flaticon.com/free-icon/scoreboard-tied_79638#term=scores&page=1&position=13

### Bugs
* For NBA, the time sometimes reads something like Final 2:30. It should just read Final in those situations.
	- Tip off has similar problem
	- Seems to be an API problem, not my code, will look into after
* For Links: Need to add link by the whole 'https//www' part also, or else won't work. 
	- Easy fix, just low on list because I am going to add 'top sites' from Chrome as the default
	- and then completely re-write the custom link widget (is it even necessary? just dupilcates bookmarsk -- ask users) 

### Notes
Bootstrap 4 got rid of panels ... I went back to panels. Change that to cards sometime before Bootstrap 4 is stable. But Bootstrap 4 didn't like my glyphs, and after a lot of frustration I decided to ditch it for now.