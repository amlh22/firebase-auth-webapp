import { initializeApp } from "firebase/app";
import { 
    getAuth,
    signInWithEmailAndPassword,
    FacebookAuthProvider,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult, 
    signOut,
    onAuthStateChanged, 
    connectAuthEmulator 
 } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOURKEYHERE",
  authDomain: "mobile-web-app-demo.firebaseapp.com",
  projectId: "mobile-web-app-demo",
  storageBucket: "mobile-web-app-demo.appspot.com",
  messagingSenderId: "950086163983",
  appId: "YOURIDHERE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

//Connect to emulator
if (window.location.hostname === 'localhost') {
  console.log("localhost detected");
  auth.connectAuthEmulator('http://localhost:9099');
}

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

const txtEmail = document.querySelector('#email');
const txtPass = document.querySelector('#password');
const submitBtn = document.querySelector('#submit');
const signOutButton = document.querySelector("#signOut");
const fbButton = document.querySelector("#facebook");
const googButton = document.querySelector("#google");

const loginEmailPass = async() => {
  const email = txtEmail.value;
  const pass = txtPass.value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    console.log(userCredential.user);
  } catch (error) {
    console.error(error);
  }
};

submitBtn.addEventListener("click", loginEmailPass);

fbButton.addEventListener('click', event => {
  event.preventDefault();
  signInWithRedirect(auth, facebookProvider);
});

googButton.addEventListener('click', event => {
  event.preventDefault();
  signInWithRedirect(auth, googleProvider);
});

const handleRedirectResult = async() => {
  try {
    const result = await getRedirectResult(auth);
    if(result) {
      const credential = GoogleAuthProvider.credentialFromResult(result) || FacebookAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      console.log('User: ', user)
      showApp();
    }
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error('Error:', errorMessage);
    const email = error.customData?.email;
    const credential = GoogleAuthProvider.credentialFromError(error) || FacebookAuthProvider.credentialFromError(error);
  }
}

const checkAuth = async() => {
  onAuthStateChanged(auth, user => {
    if(user) {
      console.log(user);
      showApp();
      showLoginState(user);
      showSignOutButton();
    }
    else {
      showLoginForm();
      hideSignOutButton();
    }
  });
};

const showSignOutButton = () => {
  if (signOutButton) {
    signOutButton.style.display = 'block';
  }
};

const hideSignOutButton = () => {
  if (signOutButton) {
    signOutButton.style.display = 'none';
  }
};

//Initialise geolocation
let map, infoWindow;

function getAddress(lat, lng) {
  const geocoder = new google.maps.Geocoder();
  const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };
  geocoder.geocode({ location: latlng }, (results, status) => {
    if (status === "OK") {
      if (results[0]) {
        document.getElementById("address").textContent = results[0].formatted_address;
      } else {
        document.getElementById("address").textContent = "No results found";
      }
    } else {
      document.getElementById("address").textContent = "Geolocation failed due to: " + status;
    }
  });
}

//Creates and initialises a map with default centre and zoom level
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 3.053, lng: 101.671 },
    zoom: 6,
  });
  infoWindow = new google.maps.InfoWindow();

  const locationButton = document.createElement("button");

  locationButton.textContent = "Pan to Current Location";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          infoWindow.setPosition(pos);
          infoWindow.setContent("Location found.");
          infoWindow.open(map);
          map.setCenter(pos);
          getAddress(pos.lat, pos.lng);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        },
      );
    } else {
      // If browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation.",
  );
  infoWindow.open(map);
}

const showLoginForm = () => {
  document.getElementById('login').style.display = 'block';
  document.getElementById('app').style.display = 'none';
}

const showApp = () => {
  document.getElementById('login').style.display = 'none';
  document.getElementById('app').style.display = 'block';
}

//Call to sign out user
signOut(auth).then(() => {
  console.log('user signed out')
})
.catch((error) => {
  console.log(error.message);
});

const signOutUser = () => {
  signOut(auth).then(() => {
    console.log('User signed out');
    showLoginForm();
  }).catch((error) => {
    console.log(error.message);
  });
};

// Sign out user
if (signOutButton) {
  signOutButton.addEventListener('click', signOutUser);
}


window.addEventListener('load', handleRedirectResult);
checkAuth();

window.initMap = initMap;

