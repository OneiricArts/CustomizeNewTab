
(async function backgroundsCNT() {
  const datakey = 'Backgrounds_data';

  let data = {
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

  function get(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, (result) => {
        const err = chrome.runtime.lastError;
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  function set(object) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(object, () => {
        const err = chrome.runtime.lastError;
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  function saveData() {
    return set({ [datakey]: data });
  }

  async function loadData() {
    const loadedData = await get(datakey);
    if (loadedData[datakey]) { data = loadedData[datakey]; }
  }

  function setBackground() {
    if (data.currentPhoto.photoDataURL) {
      $('body').css({
        backgroundImage: `url(${data.currentPhoto.photoDataURL})`,
        backgroundSize: 'cover',
      });

      if (data.currentPhoto.attribution) {
        WidgetNew.displayTemplate('backgroundsAttribution', 'attribution',
          data.currentPhoto.attribution, $('#backgrounds-attribution'));
      }
    } else {
      $('body').css({
        background: 'linear-gradient(to left, #457fca , #5691c8)',
      });
    }
  }

  async function updateBackgroundDataForNextPageLoad() {
    window.log(data.photos.length);
    const chanceOfChangingPicture = Math.random() > 0.7 || true;

    if (!chanceOfChangingPicture) return;

    // select Current Photo For Next PageLoad
    if (data.photos.length > 0) {
      const photo = data.photos.shift();
      data.currentPhoto.attribution.fullName = photo.user.name;
      data.currentPhoto.attribution.profileLink = photo.user.links.html;
      data.currentPhoto.attribution.imageLink = photo.links.html;
      data.currentPhoto.photoURL = photo.urls.regular;
    } else {
      await getRandomPhototsFromUnsplash();
    }

    // save photo as Data URL for next page load
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        data.currentPhoto.photoDataURL = reader.result;
        saveData();
      };

      const image = await (await fetch(data.currentPhoto.photoURL)).blob();
      reader.readAsDataURL(image);
    } catch (e) {
      gaLogException(`Unsplash // Backgrounds fetch image error // ${e}`, false);
    }
  }

  async function getRandomPhototsFromUnsplash() {
    const APPLICATION_ID = '79952897a5ed06ea68f7e970b88de925600429730cddc67b656f4cb4f32b9670';

    const paramsArr = {
      client_id: APPLICATION_ID,
      featured: true,
      // query: 'sport',
      orientation: 'landscape',
      count: 30,                           // number of photos to return
      sig: Math.ceil(Math.random() * 100), // https://github.com/unsplash/unsplash-source-js/issues/9
    };

    const paramsString = Object.entries(paramsArr).map(([key, value]) => `&${key}=${value.toString()}`).join('');

    const url = `https://api.unsplash.com/photos/random/?${paramsString}`;

    try {
      const response = await fetch(url);

      const ratelimitRemaining = response.headers.get('X-Ratelimit-Remaining');
      if (ratelimitRemaining < 10) {
        gaLogException(`Unsplash // ${ratelimitRemaining} Unsplash API rate-limit-remaining`, false);
      }

      if (response.status === 200) {
        const arrayOfPhotos = await response.json();
        data.photos = arrayOfPhotos;
        saveData();
        updateBackgroundDataForNextPageLoad();
      } else {
        gaLogException(`Unsplash // API Failed with ${await response.text()}`);
      }
    } catch (e) {
      const errorMsg = `Unsplash // Backgrounds fetch api error ${e}`;
      gaLogException(errorMsg, false);
    }
  }

  await loadData();
  setBackground();
  updateBackgroundDataForNextPageLoad();
}());
