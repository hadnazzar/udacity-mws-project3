/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static DATABASE_URL(path) {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/${path}`;
  }


  static changeRestaurantFavoriteStatus(restaurant) {

    // Open up a transaction as usual
    var objectStore = db.transaction(["restaurants"], "readwrite").objectStore("restaurants");

    // Get the to-do list object that has this title as it's title
    var objectStoreTitleRequest = objectStore.get(restaurant.id);

    objectStoreTitleRequest.onsuccess = function () {
      // Grab the data object returned as the result
      var data = objectStoreTitleRequest.result;

      if (data.is_favorite) {
        data.is_favorite = false;
        let url = `http://localhost:1337/restaurants/${restaurant.id}/?is_favorite=false`
        let button = document.getElementById(`favBtn-${restaurant.id}`)
        button.innerHTML = 'Unfavorite';
        fetch(url, {
          method: 'PUT', // *GET, POST, PUT, DELETE, etc.
        })
          .then(response => response.json()) // parses response to JSON
        button.backgroundColor = "orange";
      }
      else {
        data.is_favorite = true;
        let url = `http://localhost:1337/restaurants/${restaurant.id}/?is_favorite=false`
        let button = document.getElementById(`favBtn-${restaurant.id}`)
        button.innerHTML = 'Favorite';
        fetch(url, {
          method: 'PUT', // *GET, POST, PUT, DELETE, etc.
        })
          .then(response => response.json()) // parses response to JSON
        button.backgroundColor = "red";
      }

      // Create another request that inserts the item back into the database
      var updateTitleRequest = objectStore.put(data);

      // Log the transaction that originated this request
      console.log("The transaction that originated this request is " + updateTitleRequest.transaction);

      // When this new request succeeds, run the displayData() function again to update the display
      updateTitleRequest.onsuccess = function () {
        updateRestaurants()
      };
    };
  }


  static changeReviewSuccessStatus(review) {

    // Open up a transaction as usual
    var objectStore = db.transaction("reviews", "readwrite").objectStore("reviews");

    // Get the to-do list object that has this title as it's title
    var objectStoreTitleRequest = objectStore.get(review.id);

    objectStoreTitleRequest.onsuccess = function () {
      // Grab the data object returned as the result
      var data = objectStoreTitleRequest.result;
      data.success = true;
      // Create another request that inserts the item back into the database
      var updateTitleRequest = objectStore.put(data);
      // Log the transaction that originated this request
      console.log("The transaction that originated this request is " + updateTitleRequest.transaction);
      // When this new request succeeds, run the displayData() function again to update the display
      updateTitleRequest.onsuccess = function () {
      };
    };
  }




  static addReviewToDB(review) {
    fetch('http://localhost:1337/reviews/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(review)
    })
      .then(res => res.json())
      .catch(error => {
        console.error(error)
      })
      .then(res => {
        console.log(res)
        // open a read/write db transaction, ready for adding the data
        var transaction = db.transaction(["reviews"], "readwrite");

        // report on the success of the transaction completing, when everything is done
        transaction.oncomplete = function (event) {
          console.log("complete")
        };

        transaction.onerror = function (event) {
          console.log("error")
        };

        // create an object store on the transaction
        var objectStore = transaction.objectStore("reviews");

        // Make a request to add our newItem object to the object store
        let valueForIndexedDB = res ? res : { ...review, success: false }
        var objectStoreRequest = objectStore.add(valueForIndexedDB);

        objectStoreRequest.onsuccess = function (event) {
          // report the success of our request
          console.log("success")
          fillReviewsHTML()

          if (!res) {
            window.addEventListener('online', function () {
              DBHelper.postReview(review)
                .then(res => {
                  console.log(res)
                  DBHelper.changeReviewSuccessStatus(res)
                  window.removeEventListener('online')
                })
            });
          }
        };
      });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    var request = window.indexedDB.open("indexedDB", 1);
    request.onerror = function (event) {
      // Handle errors!
      let xhr = new XMLHttpRequest();
      xhr.open('GET', DBHelper.DATABASE_URL("restaurants"));
      xhr.onload = () => {
        if (xhr.status === 200) { // Got a success response from server!
          const json = JSON.parse(xhr.responseText);
          // const restaurants = json.restaurants;
          const restaurants = json;
          callback(null, restaurants);
        } else { // Oops!. Got an error from server.
          const error = (`Request failed. Returned status of ${xhr.status}`);
          callback(error, null);
        }
      };
      xhr.send();
    };
    request.onsuccess = function (event) {
      // Do something with the request.result!
      db.transaction("restaurants").objectStore("restaurants").getAll().onsuccess = function (event) {
        var restaurants = event.target.result;
        if (restaurants.length > 0) {
          callback(null, restaurants);
        }
        else {
          let xhr = new XMLHttpRequest();
          xhr.open('GET', DBHelper.DATABASE_URL("restaurants"));
          xhr.onload = () => {
            if (xhr.status === 200) { // Got a success response from server!
              const json = JSON.parse(xhr.responseText);
              // const restaurants = json.restaurants;
              const restaurants = json;
              callback(null, restaurants);
            } else { // Oops!. Got an error from server.
              const error = (`Request failed. Returned status of ${xhr.status}`);
              callback(error, null);
            }
          };
          xhr.send();
        }
      };
    };
  }


  static fetchReviews(callback) {
    var request = window.indexedDB.open("indexedDB", 1);
    request.onerror = function (event) {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', DBHelper.DATABASE_URL("reviews"));
      xhr.onload = () => {
        if (xhr.status === 200) { // Got a success response from server!
          const json = JSON.parse(xhr.responseText);
          const reviews = json;
          callback(null, reviews);
        } else { // Oops!. Got an error from server.
          const error = (`Request failed. Returned status of ${xhr.status}`);
          callback(error, null);
        }
      };
      xhr.send();
    };
    request.onsuccess = function (event) {
      // Do something with the request.result!
      db.transaction("reviews").objectStore("reviews").getAll().onsuccess = function (event) {
        var reviews = event.target.result;
        if (reviews.length > 0) {
          callback(null, reviews);
        }
        else {
          let xhr = new XMLHttpRequest();
          xhr.open('GET', DBHelper.DATABASE_URL("reviews"));
          xhr.onload = () => {
            if (xhr.status === 200) { // Got a success response from server!
              const json = JSON.parse(xhr.responseText);
              const reviews = json;
              callback(null, reviews);
            } else { // Oops!. Got an error from server.
              const error = (`Request failed. Returned status of ${xhr.status}`);
              callback(error, null);
            }
          };
          xhr.send();
        }
      };
    };
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/imgSrc/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    }
    );
    return marker;
  }

  static postReview(review) {
    return fetch('http://localhost:1337/reviews/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(review)
    })
      .then(res => res.json())
      .catch(error => {
        console.error(error)
      })
  }
}


//IndexedDB
var request = window.indexedDB.open("indexedDB", 1);

request.onerror = function (event) {
  // Generic error handler for all errors targeted at this database's
  // requests!
  alert("Database error: " + event.target.errorCode);
};
request.onsuccess = function (event) {
  // Do something with request.result!
  db = event.target.result;
};


// This event is only implemented in recent browsers   
request.onupgradeneeded = function (event) {

  // Save the IDBDatabase interface 
  var db = event.target.result;

  // Create an objectStore for this database
  var objectStoreRestaurants = db.createObjectStore("restaurants", {
    keyPath: "id", autoIncrement: true
  });
  var objectStoreReviews = db.createObjectStore("reviews", {
    keyPath: "id", autoIncrement: true
  });
  // Use transaction oncomplete to make sure the objectStore creation is 
  // finished before adding data into it.
  objectStoreRestaurants.transaction.addEventListener('complete', function (event) {
    // Store values in the newly created objectStore.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        var restaurantObjectStore = db.transaction("restaurants", "readwrite").objectStore("restaurants");
        restaurants.forEach(function (restaurant) {
          restaurantObjectStore.add(restaurant);
        });
      }
    });
  });


  objectStoreReviews.transaction.addEventListener('complete', function (event) {
    // Store values in the newly created objectStore.
    DBHelper.fetchReviews((error, reviews) => {
      if (error) {
        callback(error, null);
      } else {
        var reviewObjectStore = db.transaction("reviews", "readwrite").objectStore("reviews");
        reviews.forEach(function (reviews) {
          reviewObjectStore.add(reviews);
        });
      }
    });
  });
};

window.restaurants;
var map
var markers = []

var deferredPrompt;

window.addEventListener('beforeinstallprompt', function (e) {
  console.log('beforeinstallprompt Event fired');
  e.preventDefault();

  // Stash the event so it can be triggered later.
  deferredPrompt = e;

  return false;
});

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById("map-container").style.display = "none"
  window.dbExists = true;
  var request = window.indexedDB.open("MyDatabase");
  request.onupgradeneeded = function (e) {
    e.target.transaction.abort();
    window.dbExists = false;
  }
  fetchNeighborhoods();
  fetchCuisines();
  updateRestaurants();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */

document.getElementById("show-map-markers").addEventListener("click", function(){
  showMapMarkers()
});


showMapMarkers = () => {
  document.getElementById("show-map-markers").remove()
  document.getElementById("map-container").style.display = "block"
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.onload = function () {
    console.log("map initialized");
    let loc = {
      lat: 40.722216,
      lng: -73.987501
    };
    self.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: loc,
      scrollwheel: false
    });
    addMarkersToMap();

  }
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAC3mlvPLWWMeQz1tnYZjHjZbtFb5ksBMU&libraries=places';
  head.appendChild(script);
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  const imageSrc = DBHelper.imageUrlForRestaurant(restaurant);
  const image = document.createElement('img');
  image.className = 'restaurant-img lazy';
  image.alt = "Restaurant " + restaurant.name;
  image.srcset = [`${imageSrc}-320px.jpg 320w,${imageSrc}-480px.jpg 480w`]
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  const favorite = document.createElement('a');
  favorite.onclick = () => {
    DBHelper.changeRestaurantFavoriteStatus(restaurant)
  }
  favorite.classList = "favoriteBtn"
  favorite.id = `favBtn-${restaurant.id}`
  favorite.innerHTML = restaurant.is_favorite ? "Unfavorite" : "Favorite"
  favorite.style.backgroundColor = restaurant.is_favorite ? "red" : "orange"
  li.append(favorite)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

/* 
* Register Service worker
*/
registerServiceWorker = () => {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('./sw.js', {
      scope: '/'
    }).then(function (reg) {
      // console.log('Service Worker registered');
      reg.addEventListener('updatefound', function () {
        reg.installing.addEventListener('statechange', function () {
          if (this.state === 'installed') {

          }
        })
      })
    }).catch(function () {
      // console.log("Service worker registration failed");
    })
  }
}

registerServiceWorker();


document.addEventListener("DOMContentLoaded", function () {
  let lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));
  let active = false;

  const lazyLoad = function () {
    if (active === false) {
      active = true;

      setTimeout(function () {
        lazyImages.forEach(function (lazyImage) {
          if ((lazyImage.getBoundingClientRect().top <= window.innerHeight && lazyImage.getBoundingClientRect().bottom >= 0) && getComputedStyle(lazyImage).display !== "none") {
            lazyImage.src = lazyImage.dataset.src;
            lazyImage.srcset = lazyImage.dataset.srcset;
            lazyImage.classList.remove("lazy");

            lazyImages = lazyImages.filter(function (image) {
              return image !== lazyImage;
            });

            if (lazyImages.length === 0) {
              document.removeEventListener("scroll", lazyLoad);
              window.removeEventListener("resize", lazyLoad);
              window.removeEventListener("orientationchange", lazyLoad);
            }
          }
        });

        active = false;
      }, 200);
    }
  };

  document.addEventListener("scroll", lazyLoad);
  window.addEventListener("resize", lazyLoad);
  window.addEventListener("orientationchange", lazyLoad);
});
let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */

document.addEventListener('DOMContentLoaded', (event) => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      document.getElementById("map-container").style.display = "none"
    }
    fillBreadcrumb();
  });
})

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const imageSrc = DBHelper.imageUrlForRestaurant(restaurant);
  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img lazy'
  image.alt = restaurant.name;
  image.srcset = [`${imageSrc}-320px.jpg 320w,${imageSrc}-480px.jpg 480w`]

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (id = self.restaurant.id) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!id) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }


  DBHelper.fetchReviews((error, reviews) => {
    if (error) {
      callback(error, null);
    } else {
      resetReviews()
      const ul = document.getElementById('reviews-list');
      reviews.forEach(review => {
        if (review.restaurant_id == id) {
          ul.appendChild(createReviewHTML(review));
        }
      });
      container.appendChild(ul);
    }
  });
}

resetReviews = () => {
  // Remove all restaurants
  const ul = document.getElementById('reviews-list');
  ul.innerHTML = '';
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.createdAt).toLocaleDateString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  const btn = document.createElement('button');
  btn.style.float = "right"
  btn.innerHTML = "Show Map";
  btn.id = "show-inner-map"
  btn.onclick = () => {
    try {
      document.getElementById("map-container").style.display = "block"
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
      document.getElementById("show-inner-map").style.display = "none"
    } catch (error) {
      console.log("Error: inner map could not loaded")
    }
  }
  breadcrumb.appendChild(li);
  breadcrumb.appendChild(btn);

}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

sendRestaurantReview = (e) => {
  let userName = document.getElementById("review-usernameinput").value;
  const rating = document.getElementById("review-rating").value;
  let comments = document.getElementById("review-comment").value
  const id = getParameterByName('id');
  DBHelper.addReviewToDB({ restaurant_id: id, name: userName, rating: rating, comments: comments })
  document.getElementById("review-usernameinput").value = ""
  document.getElementById("review-comment").value = ""
}