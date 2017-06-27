/**
 * Links widget: my links and Chrome Top Sites
 * @extends widgetNew
 * @requires jQuery.js
 */
class Links extends WidgetNew { // eslint-disable-line no-unused-vars

  constructor() {
    super();
    this.datakey = 'Links_data';
  }

  async init() {
    await this.loadData();

    /*
      BACKWARD COMPATIBILITY: CARRY OVER USER DATA
      Used to store this.data = [custom links array]
      check if its still an array and carry over the data

      also, if it is an array, need to change it to an object
    */
    if (Object.prototype.toString.call(this.data) === '[object Array]') {
      const arr = this.data;
      this.data = {};
      this.data.myLinks = arr;
    }

    if (!this.data.myLinks) {
      this.setMyLinksDefaults();
      this.saveData();
    }

    this.showLinks();

    /**
     * Click handlers
     */

    $('#Links_widget').on('click', '#remove-my-link', e => this.removeMyLink(e));
    $('body').on('click', '#add-my-link-submit', () => this.addMyLink());

    // add-my-link modal: clear values on close
    $('body').on('hidden.bs.modal', '#add-my-link-modal', () => {
      $('#add-my-link-modal .modal-body').find('textarea,input').val('');
    });
  }

  async showLinks() {
    const mostVisitedURLs = await browser.topSites.get();
    const dataObj = {
      topSites: mostVisitedURLs.slice(0, 5),
      myLinks: this.data.myLinks,
    };

    WidgetNew.displayTemplate('Links', 'links', dataObj, $('#Links_widget'));
  }

  addMyLink() {
    this.data.myLinks.push({
      title: $('#add-my-link-name').val(),
      url: $('#add-my-link-url').val(),
    });
    this.showLinks(); // to show updated list
    this.saveData();
  }

  removeMyLink(e) {
    e.preventDefault(); // don't trigger/follow link
    const $el = $(e.currentTarget).closest('a');

    this.data.myLinks.splice(parseInt($el.data('index'), 10), 1);
    this.showLinks(); // to show updated list
    this.saveData();
  }

  setMyLinksDefaults() {
    this.data.myLinks = [
      {
        title: 'To remove a link, press the x ---> ',
        url: 'https://github.com/OneiricArts/CustomizeNewTab/wiki/Hints',
      },
      {
        title: 'To add your own link, press \'Add Link\'',
        url: 'https://github.com/OneiricArts/CustomizeNewTab/wiki/Hints',
      },
      {
        title: 'How to use this extension',
        url: 'https://github.com/OneiricArts/CustomizeNewTab/wiki/Hints',
      },
      {
        title: 'NPR',
        url: 'http://www.npr.org/',
      },
      {
        title: 'UNICEF',
        url: 'http://www.unicef.org/',
      },
    ];
  }
}
