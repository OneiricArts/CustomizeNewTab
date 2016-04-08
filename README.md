
[//]: #	"NOTE TO SELF: update this more regularly"

## What is it?
![Screenshot](./screenshots/2016_03_04_overview.png?raw=true)
*(Current state, NFL is in offseason, so no games)*

[![Get it in the Chrome Web Store](https://developer.chrome.com/webstore/images/ChromeWebStore_BadgeWBorder_v2_206x58.png)](https://chrome.google.com/webstore/detail/sports-new-tab-page-beta/cbdhcjkifbkbckpoejnakoekiheijpei)

[Get it on the Chrome Store](https://chrome.google.com/webstore/detail/sports-new-tab-page-beta/cbdhcjkifbkbckpoejnakoekiheijpei)

Subreddit (forum to communicate easily with me): https://www.reddit.com/r/sportsnewtabpage

This is a replacement for Chrome's New Tab Page with something more useful, and sports oriented (productivity widgets incoming).

I built this because Chrome's new tab page is lame (and the big Google logo + search bar I never use was probably the last straw). Additionally, sports websites suck, it takes too many clicks for me to see basic stuff. Lastly, it helps me work on my JavaScript/frontend skills.

## Current State
Currently, I have three widgets: NFL, NBA, and Links. They show live scores and the current schedule (week for NFL, day for NBA). NBA also has the standings. The Links widget allows custom links, as well as shows the chrome top sites (from the default new tab page).

Basic Google Analytics support so I can see which functionality is used, and which is not (e.g. do people even really realize the feature is there?).

What I have now built is proof that my idea was practical, useful, and something that myself, and other people, enjoy. The code is at a great place to build off. 

See changlog for recent additions: https://github.com/OneiricArts/CustomizeNewTab/wiki/Changelog

## Future Plans

* Widgets
    - MLB
    - Google Tasks/Calendar
    - flickr pictures for background
* improvements
    - Better design for schedule. I thought a table would be the easiest way to present a simple way, but its not responsive horizontally for my needs, and its not flexible in the information I can show.
        + and need a way to easily show other time frames (last week, tomorrow, etc.)
    - Better Widget handler (Bootstrap grid + cards + something), currently my implementation won't be able to handle lots of widgets
    - ~~change coding workflow so can pre-compile handlebars templates~~ (Done!)
    - performance
        + minify everything?
        + require.js?
        + profile
    - native integration
        + notifications apis are nice now
* more quanitified user interaction
    - rely on subjective feedback right now (reddit)
    - surveys + A/B testing + smarter Google Analytics?
* Firefox: just waiting on webextensions
* Safari: Lol. $$$ needed for free extension

Basically, I will probably work on this forever, and have unlimited ideas. I like it much better than the default New Tab, and like where it is going :)

## Code

####Classes Structure

* **Base**: Contains basic functionality and data elements; e.g. saving data to Chrome's local storage. I should move browser-specific (save, load, topsites) APIs to a different class, and call that ChromeBase, so I when I want to port to Firefox, I can just re-implement those.
    - **Sports *extends* Base**: This contains all the logic flow of displaying and updating the schedules for the widgets. But a lot of the functions are empty.
        + **NBA & NFL *extend* Sports**: These contain implementations for the functions involved in Sports. They also contain some unique functions that are exclusive to that widget (e.g. NBA contains standings).
    - **PageHandler *extends* Base**: This handles which widgets to show, and how to resize the widgets. Also handles basic things (e.g. network error message).

####Frontend
* new_tab.html has the static html layout and design.
    - rely on libraries instead of custom css (all custom css is in the head)
    - bootstrap for basic layout, scalability, stlying (e.g. glyphicons)
    - Material Design Lite (Google's design language) for nice-looking features (e.g. Floating Action Button)
* /templates/ contains handlebar templates used to show data.
    - pre-combiled into one js file

### Licenses & Acknowledgements  

##### Image / Icon

Need to add footer and credit http://www.flaticon.com/free-icon/scoreboard-tied_79638#term=scores&page=1&position=13

##### Image / Emerald_Bay
The background uses a part of the image found here:
https://upload.wikimedia.org/wikipedia/commons/9/97/Emerald_Bay.jpg
"This image, which was originally posted to Flickr.com, was uploaded to Commons using Flickr upload bot on 02:42, 16 January 2010 (UTC) by Pauk (talk)."

It is licensed under Creative Commons Attribution 2.0 Generic (CC BY 2.0).