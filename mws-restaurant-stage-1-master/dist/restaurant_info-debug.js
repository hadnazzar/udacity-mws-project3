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