class Backgrounds extends WidgetNew { // eslint-disable-line no-unused-vars

  constructor() {
    super();
    this.datakey = 'Backgrounds_data';

    this.data = {
      photos: [],
      currentPhoto: {
        photoURL: '',
        photoDataURL: '',
        attribution: {
          imageLink: '',
          profileLink: '',
          fullName: '',
          unsplashAppName: 'Sports_New_Tab_Extension',
        },
      },
    };
  }

  async init() {
    await this.loadData();
    this.setBackground();
    this.updateBackgroundDataForNextPageLoad();
  }

  setBackground() {
    if (this.data.currentPhoto.photoDataURL) {
      $('body').css({
        backgroundImage: `url(${this.data.currentPhoto.photoDataURL})`,
        backgroundSize: 'cover',
      });

      if (this.data.currentPhoto.attribution) {
        WidgetNew.displayTemplate('backgroundsAttribution', 'attribution',
          this.data.currentPhoto.attribution, $('#backgrounds-attribution'));
      }
    } else {
      $('body').css({
        background: 'linear-gradient(to left, #457fca , #5691c8)',
      });
    }
  }

  async updateBackgroundDataForNextPageLoad() {
    window.log(this.data.photos.length);
    const chanceOfChangingPicture = Math.random() > 0.7 || true;

    if (!chanceOfChangingPicture) return;

    // select Current Photo For Next PageLoad
    if (this.data.photos.length > 0) {
      const photo = this.data.photos.shift();
      this.data.currentPhoto.attribution.fullName = photo.user.name;
      this.data.currentPhoto.attribution.profileLink = photo.user.links.html;
      this.data.currentPhoto.attribution.imageLink = photo.links.html;
      this.data.currentPhoto.photoURL = photo.urls.regular;
    } else {
      await this.getRandomPhototsFromUnsplash();
    }

    // save photo as Data URL for next page load
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.data.currentPhoto.photoDataURL = reader.result;
        this.saveData();
      };

      const image = await (await fetch(this.data.currentPhoto.photoURL)).blob();
      reader.readAsDataURL(image);
    } catch (e) {
      gaLogException(`Unsplash // Backgrounds fetch image error // ${e}`, false);
    }
  }

  async getRandomPhototsFromUnsplash() {
    const APPLICATION_ID = '79952897a5ed06ea68f7e970b88de925600429730cddc67b656f4cb4f32b9670';

    const paramsArr = {
      client_id: APPLICATION_ID,
      featured: true,
      // query: 'sport',
      orientation: 'landscape',
      count: 30,                           // number of photos to return
      sig: Math.ceil(Math.random() * 100), // https://github.com/unsplash/unsplash-source-js/issues/9
    };

    const paramsString = _.map(Object.keys(paramsArr), k => `&${k}=${paramsArr[k].toString()}`).join('');

    const url = `https://api.unsplash.com/photos/random/?${paramsString}`;

    try {
      const response = await fetch(url);

      const ratelimitRemaining = response.headers.get('X-Ratelimit-Remaining');
      if (ratelimitRemaining < 10) {
        gaLogException(`Unsplash // ${ratelimitRemaining} Unsplash API rate-limit-remaining`, false);
      }

      if (response.status === 200) {
        const arrayOfPhotos = await response.json();
        this.data.photos = arrayOfPhotos;
        this.saveData();
        this.updateBackgroundDataForNextPageLoad();
      } else {
        gaLogException(`Unsplash // API Failed with ${await response.text()}`);
      }
    } catch (e) {
      const errorMsg = `Unsplash // Backgrounds fetch api error ${e}`;
      gaLogException(errorMsg, false);
    }
  }
}
