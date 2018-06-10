class DBHelper{static get DATABASE_URL(){return"http://localhost:1337/restaurants"}static changeRestaurantData(){var e=db.transaction(["restaurants"],"readwrite").objectStore("restaurants"),t=e.get(1);t.onsuccess=function(){var s=t.result;s.notified="yes";var n=e.put(s);console.log("The transaction that originated this request is "+n.transaction),n.onsuccess=function(){displayData()}}}static fetchRestaurants(e){var t=window.indexedDB.open("indexedDB",1);t.onerror=function(t){let s=new XMLHttpRequest;s.open("GET",DBHelper.DATABASE_URL),s.onload=(()=>{if(200===s.status){const t=JSON.parse(s.responseText);e(null,t)}else{const t=`Request failed. Returned status of ${s.status}`;e(t,null)}}),s.send()},t.onsuccess=function(t){db.transaction("restaurants").objectStore("restaurants").getAll().onsuccess=function(t){var s=t.target.result;if(s.length>0)e(null,s);else{let t=new XMLHttpRequest;t.open("GET",DBHelper.DATABASE_URL),t.onload=(()=>{if(200===t.status){const s=JSON.parse(t.responseText);e(null,s)}else{const s=`Request failed. Returned status of ${t.status}`;e(s,null)}}),t.send()}}}}static fetchRestaurantById(e,t){DBHelper.fetchRestaurants((s,n)=>{if(s)t(s,null);else{const s=n.find(t=>t.id==e);s?t(null,s):t("Restaurant does not exist",null)}})}static fetchRestaurantByCuisine(e,t){DBHelper.fetchRestaurants((s,n)=>{if(s)t(s,null);else{const s=n.filter(t=>t.cuisine_type==e);t(null,s)}})}static fetchRestaurantByNeighborhood(e,t){DBHelper.fetchRestaurants((s,n)=>{if(s)t(s,null);else{const s=n.filter(t=>t.neighborhood==e);t(null,s)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,s){DBHelper.fetchRestaurants((n,a)=>{if(n)s(n,null);else{let n=a;"all"!=e&&(n=n.filter(t=>t.cuisine_type==e)),"all"!=t&&(n=n.filter(e=>e.neighborhood==t)),s(null,n)}})}static fetchNeighborhoods(e){DBHelper.fetchRestaurants((t,s)=>{if(t)e(t,null);else{const t=s.map((e,t)=>s[t].neighborhood),n=t.filter((e,s)=>t.indexOf(e)==s);e(null,n)}})}static fetchCuisines(e){DBHelper.fetchRestaurants((t,s)=>{if(t)e(t,null);else{const t=s.map((e,t)=>s[t].cuisine_type),n=t.filter((e,s)=>t.indexOf(e)==s);e(null,n)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return`/imgSrc/${e.photograph}`}static mapMarkerForRestaurant(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:DBHelper.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}var request=window.indexedDB.open("indexedDB",1);request.onerror=function(e){alert("Database error: "+e.target.errorCode)},request.onsuccess=function(e){db=e.target.result},request.onupgradeneeded=function(e){var t=e.target.result;t.createObjectStore("restaurants",{keyPath:"id"}).transaction.oncomplete=function(e){DBHelper.fetchRestaurants((e,s)=>{if(e)callback(e,null);else{var n=t.transaction("restaurants","readwrite").objectStore("restaurants");s.forEach(function(e){n.add(e)})}})}};