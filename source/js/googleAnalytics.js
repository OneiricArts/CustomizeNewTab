/* global ga:false */
/* global gaFF:false */

/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    UNIVERSAL FUNCTIONS TO SEND GA DATA
        - AUTO PICKS BETWEEN CHROME OR FIREFOX SENDING METHODS
        - CAN BE USED IN OTHER FILES WITHOUT WORRYING ABOUT CHROME V. FIREFOX
   ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

// try to find ga function
const gaChrome = (typeof ga === 'function');
const gaFirefox = (typeof gaFF === 'function');

function gaSendPageView() {
  if (gaChrome) {
    ga('send', 'pageview', {
      page: '/new_tab.html',
    });
  } else if (gaFirefox) {
    gaFF('&t=pageview&dp=/new_tab.html');
  }
}

function gaSendLoadTime(timeSincePageLoad) {
  if (gaChrome) {
    ga('send', 'timing', {
      timingLabel: 'JS_Dependencies',
      timingVar: 'load',
      timingValue: timeSincePageLoad,
    });
  } else if (gaFirefox) {
    gaFF(`&t=timing&utv=load&utt=${timeSincePageLoad}&utl=JS_Dependencies`);
  }
}

function gaSendEvent(o) {
  if (gaChrome) {
    ga('send', 'event', {
      eventCategory: o.ec,
      eventAction: o.ea,
      eventLabel: o.el,
    });
  } else if (gaFirefox) {
    gaFF(`&t=event&ec=${o.ec}&ea=${o.ea}&el=${o.el}`);
  }
}

function gaSendException(errorMsg) {
  if (gaChrome) {
    ga('send', 'exception', {
      exDescription: errorMsg,
    });
  } else if (gaFirefox) {
    gaFF(`&t=exception&exd=${errorMsg}`);
  }
}

/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    HELPER FUNCTIONS
   ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

function sendClickEvent(e, o) {
  let label = e.target.id;

  if (label === '') {
    label = e.target.className;
  } if (label === '') {
    label = e.target.tagName.toLowerCase();
  }

  if (o && o.label) {
    label = o.label;
  }

  gaSendEvent({
    ec: 'user_interaction',
    ea: 'click',
    el: label,
  });
}

/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    INITIAL TRACKING EVENTS
      - SPECIAL CASES CAN BE USED IN RESPECTIVE FILES
   ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

gaSendPageView();

if (window.performance) {
  gaSendLoadTime(Math.round(performance.now()));
}

// send browser dimensions
// var dimensions = window.innerHeight + "x" + window.innerWidth;
// ga('send', 'Browser Dimensions', 'plixels', dimensions);

// track which features are being clicked on
$('html').on('click', 'a', e => sendClickEvent(e));
$('html').on('click', 'button', e => sendClickEvent(e));
$('html').on('click', 'span', e => sendClickEvent(e));
$('html').on('click', 'tr', e => sendClickEvent(e, { label: 'game_row' }));

// send uncaught (unexpected) exceptions to google analytics, if local installation show alert
window.onerror = (msg, url, line, col, error) => {
  let extra = !col ? '' : `\n column: ${col}`;
  extra += !error ? '' : `\n error: ${error}`;
  const errorMsg = `Error: ${msg} \n url:${url} \n line: ${line} ${extra}`;

  if (devEnv) {
    alert(errorMsg); // eslint-disable-line no-alert
  } else {
    gaSendException(errorMsg);
  }
};
