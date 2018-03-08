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

window.addEventListener('offline', () => { $('#no-internet-alert').addClass('fade-in').show(); });

// reload page when online for cleanest reset
window.addEventListener('online', () => { document.location.reload(); });

class PageHandeler extends WidgetNew {
  constructor() {
    super();
    this.datakey = 'pageHandler_widgets';

    this.NFL = new NFL(); this.NBA = new NBA(); this.NHL = new NHL(); this.MLB = new MLB();
    this.Links = new Links();
    this.widgetKeys = ['NFL', 'NBA', 'NHL', 'MLB', 'Links'];

    // defaults, will get overriden by loadData()
    this.data.NFL = false; this.data.NBA = true; this.data.NHL = false;
    this.data.MLB = false; this.data.Links = true;
  }

  static async loadDev() {
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
      if (this.data[key] === true) {
        this[key].on();
        gaSendEvent({ ec: 'Active_Widgets_On_Init', ea: 'InitActive', el: key });
      } else {
        // buttons are on by default -- turn them off if needed
        $(`#page_options #${key}-button`).trigger('click');
      }
    }
  }

  triggerWidget(event) {
    // DO NOT SEND TO GOOGLE ANALYTICS, stops other GA click addEventListener
    // DO trigger any other events (i.e. _dev_btn event)
    event.stopPropagation();

    // change to data-attribute?
    $(this).toggleClass('btn-outline-success').toggleClass('btn-outline-secondary');
    const key = $(this).attr('id').split('-')[0];
    $(`#${key}_widget`).toggle();

    const self = event.data.self;
    if ($(this).hasClass('btn-outline-success')) {
      self.data[key] = true;
      self[key].on();
    } else {
      self.data[key] = false;
      self[key].off();
    }

    self.saveData();
  }

  async init() {
    $('#page_options button').on('click', { self: this }, this.triggerWidget);
    // $('body').on('click', $('#page_options button'), triggerWidget);

    if (devEnv) { PageHandeler.loadDev(); }

    await this.loadData();
    this.loadWidgets();
  }
}

$(document).ready(() => {
  const obj = new PageHandeler();
  obj.init();

  const backGround = new Backgrounds();
  backGround.on();

  if (!navigator.onLine) {
    $('#no-internet-alert').show();
  }

  $('#extension-version').text(chrome.app.getDetails().version);
});
