let step = 0;
let userData = {
  name: "",
  location: "",
  wish: ""
};

const container = document.getElementById('container');
const text = document.getElementById('text');
const input = document.getElementById('input');
const button = document.getElementById('submit');
const mapDiv = document.getElementById('map');

document.body.addEventListener('click', advanceStep);
button.addEventListener('click', handleSubmit);

function advanceStep() {
  step++;
  input.classList.add('hidden');
  button.classList.add('hidden');
  switch (step) {
    case 1:
      text.innerText = "Hi, welcome to this little online temple, known only by a few. Why not share your wish with the gods?";
      break;
    case 2:
      text.innerText = "Here, everything follows order. Left to right. Top to bottom. In this temple, one must follow the rules of the divine.";
      setTimeout(() => {
        step++;
        showNameInput();
      }, 3000);
      break;
    case 5:
      text.innerText = "Click the screen to cast the divination blocks.";
      break;
    case 6:
      showDivination();
      break;
    case 7:
      text.innerText = "Click to receive your divine guidance.";
      break;
    case 8:
      getAdvice();
      break;
  }
}

function showNameInput() {
  text.innerText = "Tell the gods your name:";
  input.value = "";
  input.classList.remove('hidden');
  button.classList.remove('hidden');
}

function handleSubmit() {
  if (step === 3) {
    userData.name = input.value;
    step++;
    text.innerText = "Tell the gods roughly where you are:";
    input.value = "";
  } else if (step === 4) {
    userData.location = input.value;
    step++;
    text.innerText = "Tell the gods your doubt or your wish:";
    input.value = "";
  } else if (step === 5) {
    userData.wish = input.value;
    step++;
    text.innerText = "Click the screen to cast the divination blocks.";
  }

  input.classList.add('hidden');
  button.classList.add('hidden');
}

function showDivination() {
  const result = Math.floor(Math.random() * 3);
  let resultText = "";
  if (result === 0) resultText = "Sacred Response (One face up, one down): The gods agree with your wish.";
  if (result === 1) resultText = "Laughing Response (Both up): The gods are amused. Ask again later.";
  if (result === 2) resultText = "Negative Response (Both down): The gods disagree. Reflect deeper.";
  text.innerText = resultText;
}

function getAdvice() {
  fetch('https://api.adviceslip.com/advice')
    .then(res => res.json())
    .then(data => {
      text.innerText = `Your divine message: "${data.slip.advice}"\n\nBlessed location near you:`;
      showMap(userData.location);
    });
}

// ---------------- Google Maps ----------------

function initMap() {
  // required dummy to avoid Google Maps error
}

function showMap(address) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: address }, function (results, status) {
    if (status === "OK") {
      const userLocation = results[0].geometry.location;
      const map = new google.maps.Map(mapDiv, {
        center: userLocation,
        zoom: 14
      });
      new google.maps.Marker({ map: map, position: userLocation });

      mapDiv.classList.remove('hidden');
    } else {
      text.innerText += `\n(We couldn’t find your location, but the gods understand.)`;
    }
  });
}
