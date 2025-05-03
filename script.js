let step = 0;
let userData = { name: "", location: "", wish: "" };

const text = document.getElementById('text');
const input = document.getElementById('input');
const button = document.getElementById('submit');
const mapDiv = document.getElementById('map');

// 監聽背景點擊與按鈕
document.body.addEventListener('click', onBodyClick);
button.addEventListener('click', handleSubmit);

// 啟動：顯示第一頁
showWelcome();

function onBodyClick() {
  // 如果正在輸入階段 (step 2,3,4)，點背景不動作
  if ([2, 3, 4].includes(step)) return;

  // 否則依當前 step 處理
  if (step === 0) {
    showRules();
  } else if (step === 5) {
    showDivination();
  } else if (step === 6) {
    showGuidancePrompt();
  } else if (step === 7) {
    showAdvice();
  }
}

function showWelcome() {
  step = 0;
  hideInput();
  text.innerText = "Hi, welcome to this little online temple, known only by a few. Why not share your wish with the gods?";
}

function showRules() {
  step = 1;
  hideInput();
  text.innerText = "Here, everything follows order. Left to right. Top to bottom. In this temple, one must follow the rules of the divine.";
  // 3 秒後進入姓名輸入
  setTimeout(showNameInput, 3000);
}

function showNameInput() {
  step = 2;
  text.innerText = "Tell the gods your name:";
  showInput();
}

function showLocationInput() {
  step = 3;
  text.innerText = "Tell the gods roughly where you are:";
  showInput();
}

function showWishInput() {
  step = 4;
  text.innerText = "Tell the gods your doubt or your wish:";
  showInput();
}

function handleSubmit(e) {
  e.stopPropagation(); // 防止按鈕也觸發 body click

  // 根據當前階段處理
  if (step === 2) {
    userData.name = input.value.trim();
    showLocationInput();
  } else if (step === 3) {
    userData.location = input.value.trim();
    showWishInput();
  } else if (step === 4) {
    userData.wish = input.value.trim();
    hideInput();
    step = 5;
    text.innerText = "Click the screen to cast the divination blocks.";
  }
}

function showDivination() {
  // 只有在 step 5 點擊才進來
  if (step !== 5) return;
  step = 6;
  const result = Math.floor(Math.random() * 3);
  let resultText = "";
  if (result === 0) resultText = "Sacred Response (One face up, one down): The gods agree with your wish.";
  if (result === 1) resultText = "Laughing Response (Both up): The gods are amused. Ask again later.";
  if (result === 2) resultText = "Negative Response (Both down): The gods disagree. Reflect deeper.";
  text.innerText = resultText;
}

function showGuidancePrompt() {
  if (step !== 6) return;
  step = 7;
  text.innerText = "Click to receive your divine guidance.";
}

function showAdvice() {
  if (step !== 7) return;
  step = 8;
  fetch('https://api.adviceslip.com/advice')
    .then(res => res.json())
    .then(data => {
      text.innerText = `Your divine message: "${data.slip.advice}"\n\nBlessed location near you:`;
      showMap(userData.location);
    });
}

// helpers: 顯示/隱藏輸入框與按鈕
function showInput() {
  input.value = "";
  input.classList.remove('hidden');
  button.classList.remove('hidden');
}
function hideInput() {
  input.classList.add('hidden');
  button.classList.add('hidden');
}

function initMap() {
  console.log("Google Maps API loaded.");
}

// Google Maps
function initMap() { /* dummy callback */ }
function showMap(address) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address }, (results, status) => {
    if (status !== "OK" || !results[0]) {
      text.innerText += `\n(We couldn’t find your location, but the gods understand.)`;
      return;
    }

    const userLoc = results[0].geometry.location;

    // 1. 建立地圖並顯示使用者位置
    const map = new google.maps.Map(mapDiv, {
      center: userLoc,
      zoom: 12
    });
    new google.maps.Marker({
      map,
      position: userLoc,
      title: "Your location"
    });
    mapDiv.classList.remove('hidden');

    // 2. 用 PlacesService 搜尋半徑內所有 POI
    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
      location: userLoc,
      radius: 5000 // 5 公里範圍
      // 不指定 type，回傳所有 point_of_interest
    }, (places, placesStatus) => {
      if (placesStatus === google.maps.places.PlacesServiceStatus.OK && places.length) {
        // 隨機一個
        const choice = places[Math.floor(Math.random() * places.length)];

        // 標記這個幸運地點
        new google.maps.Marker({
          map,
          position: choice.geometry.location,
          title: choice.name,
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
          }
        });

        // 顯示名稱
        text.innerText += `\nLucky spot: ${choice.name}`;
      } else {
        text.innerText += `\n(No nearby places found.)`;
      }
    });
  });
}




