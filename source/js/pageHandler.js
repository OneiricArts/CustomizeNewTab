/*
  detect if locally loaded: by checking extension vs. chrome store extension id
  devEnv used to enable features for myself/not ready for release
    - also defrentiate Google Analytics ID
*/
const devEnv = chrome.i18n.getMessage('@@extension_id') !== 'cbdhcjkifbkbckpoejnakoekiheijpei';
// console.log(dev_env);

window.log = (message) => {
  if (devEnv) { console.log(message); } // eslint-disable-line no-console
};

window.addEventListener('offline', () => { $('#no-internet-alert').fadeIn(); });

// reload page when online for cleanest reset
window.addEventListener('online', () => { document.location.reload(); });

class PageHandeler extends Base {
  constructor() {
    super();
    this.datakey = 'pageHndler_widgets';

    this.NFL = new NFL();
    this.NBA = new NBA();
    this.NHL = new NHL();
    this.MLB = new MLB();
    this.Links = new Links();

    this.widgetKeys = ['NFL', 'NBA', 'NHL', 'MLB', 'Links'];
  }

  /* this.data.<stuff> is set in this.setDefaults */

  loadFunctionality() {
    if (devEnv) {
      PageHandeler.loadDev();
    }
    this.loadWidgets();
  }

  static loadDev() {
    $('#_dev_btn').show();
    $('#_dev_btn').on('click', async (event) => {
      // STOP ALL OTHER EVENTS
      event.stopImmediatePropagation();

      await browser.storage.local.clear();
      location.reload();
    });
  }

  loadWidgets() {
    for (let i = 0; i < this.widgetKeys.length; i += 1) {
      const key = this.widgetKeys[i];

      // turn widget on
      if ((key in this.data) && (this.data[key] === true) && (key in this)) {
        this[key].on();
        gaSendEvent({ ec: 'Active_Widgets_On_Init', ea: 'InitActive', el: key });
      } else { // buttons are on by default -- turn them off if needed
        $(`#page_options #${key}-button`).trigger('click');
      }
    }
  }

  setDefaults() {
    for (let i = 0; i < this.widgetKeys.length; i += 1) {
      this.data[this.widgetKeys[i]] = false;
    }

    this.data.NBA = true;
    this.data.NFL = true;
    this.data.MLB = false;
    this.data.NHL = true;
    this.data.Links = true;

    this.loadFunctionality();
  }

  triggerWidget(event) {
    const that = event.data.that;

    // DO NOT SEND TO GOOGLE ANALYTICS, stops other GA click addEventListener
    // DO trigger any other events (i.e. _dev_btn event)
    event.stopPropagation();

    const key = $(this).attr('id').split('-')[0];

    // console.log($(this));

    $(this).toggleClass('btn-outline-success').toggleClass('btn-outline-secondary');
    let id = `#${key}_col`;

    if ($(id).length === 0) {
      id = `#${key}_widget`;
    }
    $(id).toggle();

    if ($(this).hasClass('btn-outline-success')) {
      that.data[key] = true;
      if (key in that) {
        that[key].on();
      }
    } else {
      that.data[key] = false;
      if (key in that) {
        that[key].off();
      }
    }
    that.saveData();
  }

  init() {
    const that = this;
    $('#page_options button').on('click', { that }, this.triggerWidget);
    // $('body').on('click', $('#page_options button'), triggerWidget);

    that.loadData(this.loadFunctionality, this.setDefaults);
  }
}

$(document).ready(() => {
  const obj = new PageHandeler();
  obj.init();

  if (!navigator.onLine) {
    $('#no-internet-alert').show();
  }
});
