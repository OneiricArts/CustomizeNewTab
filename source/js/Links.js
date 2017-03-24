class Links extends Base { // eslint-disable-line no-unused-vars

  constructor() {
    super();
    this.datakey = 'Links_data';
    this.loadData(this.showTopSites, this.setDefaults);
  }

  init() {
    const self = this;

    $('#bookmark-panel').on('click', '#remove_customLink', (evt) => {
      evt.preventDefault();
      self.removeCustomLink($(this).closest('a'));
    });

    // $("body").on('click', '#bookmark-panel #remove', {self:this}, this.removeCustomLink);
    $('body').on('click', '#addBookmark', { self: this }, this.addBookmark);

    /* clear values on close */
    $('body').on('hidden.bs.modal', '#addCustomLinkModal', () => {
      $('#addCustomLinkModal .modal-body').find('textarea,input').val('');
    });
  }

  addBookmark(event) { // eslint-disable-line class-methods-use-this
    const self = event.data.self;
    self.data.push({
      title: $('#bookmark_name').val(),
      url: $('#bookmark_url').val(),
    });
    self.saveData(self.showTopSites());
  }

  showTopSites() {
    chrome.topSites.get((mostVisitedURLs) => {
        // var $template = $("#Links-template").html();
      const dataKey = 'links';
      const dataObj = {};

      dataObj.topSites = mostVisitedURLs.slice(0, 5);

      if (this.data && this.data.length > 0) {
        dataObj.customSites = this.data;
      }

      const $element = $('#bookmark-panel');
      this.displayTemplate('Links', dataKey, dataObj, $element);
      this.saveData();
    });
  }

  setDefaults() {
    this.data = [
      {
        title: 'NPR',
        url: 'http://www.npr.org/',
      },
      {
        title: 'UNICEF',
        url: 'http://www.unicef.org/',
      },
      {
        title: 'Hints',
        url: 'https://github.com/OneiricArts/CustomizeNewTab/wiki/Hints',
      },
    ];
    this.showTopSites();
  }

  removeCustomLink($el) {
    this.data.splice(parseInt($el.attr('id').split('_')[0], 10), 1);

    if (this.data.length === 0) {
      $('#custom-sites').remove();
      this.saveData();
    } else {
      this.saveData(this.showTopSites);
    }
  }
}
