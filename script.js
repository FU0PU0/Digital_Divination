let isReady = false;
let step    = 0;

// 在 load 的時候，先執行一次定位，讓 overlay 一進頁就居中
window.addEventListener('load', onScroll);
window.addEventListener('resize', onScroll);
window.addEventListener('scroll', onScroll);
document.body.addEventListener('click', onHeroClick);

function onScroll() {
  const hero       = document.getElementById('hero');
  const scrollY    = window.scrollY;
  const vh         = window.innerHeight;
  const maxScrollY = hero.clientHeight - vh;
  const progress   = Math.min(scrollY / maxScrollY, 1);

  // 背景往上
  document.querySelector('.bg-image').style.transform =
    `translateY(${-progress * 100}%)`;

    const ov           = document.getElementById('overlay-image');
    const overlayW     = ov.clientWidth;
    const startLeft    = (window.innerWidth - overlayW) / 2;
  
    // 只需要改这里：
    const extraFactor = 0.2;            // ← 0.0 (不出屏) 到 1.0 (整宽都出屏) 之间调
    const endLeft     = -overlayW * extraFactor;
  
    // 从 startLeft 线性跑到 endLeft
    const leftPx      = startLeft + (endLeft - startLeft) * progress;
    ov.style.left     = `${leftPx}px`;


   // —— Hero 文字浮現 & 隐藏输入框 —— 
    const heroContent = document.getElementById('hero-content');
    const textEl      = document.getElementById('text');
    const inputEl     = document.getElementById('input');
    const buttonEl    = document.getElementById('submit');
    const mapEl       = document.getElementById('map');
    
    if (progress < 1) {
   // 还没到底，隐藏整个 hero-content
    heroContent.classList.add('hidden');
    isReady = false;
    } else {
    if (heroContent.classList.contains('hidden')) {
    heroContent.classList.remove('hidden');
    // 隐藏 input/button/map
    inputEl.classList.add('hidden');
    buttonEl.classList.add('hidden');
    mapEl.classList.add('hidden');
    // 显示欢迎文字
    textEl.innerText = "Hi, welcome to this little online temple, known only by a few. Why not share your wish with the deity?";
    }
   
    isReady = true;
    }
}

function onHeroClick(e) {
  if (!isReady || step !== 0) return;

  // 1. 移除 hero
  window.removeEventListener('scroll', onScroll);
  document.body.removeEventListener('click', onHeroClick);
  document.getElementById('hero').remove();

  // 2. 给 body 开启主内容居中模式
  document.body.classList.add('main-mode');

  // 3. 把 hero-content (主流程容器) 中心化
  const heroContent = document.getElementById('hero-content');
  // 解除它固定在 overlay 右侧的定位
  heroContent.style.position  = 'static';
  heroContent.style.transform = 'none';
  heroContent.classList.remove('hidden');

  // 4. 启动原本互动
  initDivination();
}

// ---------- 以下保持你原本的 initDivination 定義 ----------

function initDivination() {
  const userData = { name: "", location: "", wish: "" };
  const text     = document.getElementById('text');
  const input    = document.getElementById('input');
  const button   = document.getElementById('submit');
  const mapDiv   = document.getElementById('map');

  document.body.addEventListener('click', onBodyClick);
  button.addEventListener('click', handleSubmit);

  showRules();

  function onBodyClick() {
    if ([2,3,4].includes(step)) return;
    if      (step === 0) showRules();
    else if (step === 5) showDivination();
    else if (step === 6) showGuidancePrompt();
    else if (step === 7) showAdvice();
  }

  function showWelcome() {
    step = 0; hideInput();
    text.innerText = "Hi, welcome to this little online temple, known only by a few. Why not share your wish with the deity?";
  }

  function showRules() {
    step = 1; hideInput();
    text.innerText = "Here, everything follows order…";
    setTimeout(showNameInput, 3000);
  }

  function showNameInput() {
    step = 2; text.innerText = "Tell the deity your name:"; showInput();
  }

  function showLocationInput() {
    step = 3;
    text.innerText = "Tell the deity roughly where you are:";
    showInput();
  
    // 建立 autocomplete 並暫存到全域變數
    window.__autocomplete = new google.maps.places.Autocomplete(input, {
      types: ["geocode"],
      componentRestrictions: { country: "us" },
      fields: ["formatted_address", "geometry"]
    });
  
    window.__autocomplete.addListener("place_changed", () => {
      const place = window.__autocomplete.getPlace();
      if (place.formatted_address) input.value = place.formatted_address;
    });
  }

  function showWishInput() {
    step = 4;
    text.innerText = "Tell the deity your doubt or your wish:";
    showInput();
  
    // 強制移除 autocomplete 建立的建議框
    if (window.__autocomplete) {
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer) pacContainer.remove();
      window.__autocomplete.unbindAll();
      window.__autocomplete = null;
    }
  }
  

  function handleSubmit(e) {
    e.stopPropagation();
    if (step === 2) {
      userData.name = input.value.trim(); showLocationInput();
    } else if (step === 3) {
      userData.location = input.value.trim(); showWishInput();
    } else if (step === 4) {
      userData.wish = input.value.trim();
      hideInput(); step = 5;
      text.innerText = "Click the screen to cast the divination blocks.";
    }
  }

  function showDivination() {
    if (step !== 5) return;
    step = 6;
    const msgs = [
      "Sacred Response… The deity agree with your wish.",
      "Laughing Response… The deity are amused. Ask later.",
      "Negative Response… The deity disagree. Reflect deeper."
    ];
    text.innerText = msgs[Math.floor(Math.random()*3)];
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
      .then(r=>r.json()).then(data=>{
        text.innerText = `Your divine message: "${data.slip.advice}"\n\nBlessed location near you:`;
        showMap(userData.location);
      });
  }

  function showInput() {
    input.value = "";
    input.classList.remove('hidden');
    button.classList.remove('hidden');
  
    // 根據當前 step 設定 placeholder
    if (step === 2) {
      input.placeholder = "Enter your name";
    } else if (step === 3) {
      input.placeholder = "Enter your location";
    } else if (step === 4) {
      input.placeholder = "Share your wish or doubt";
    } else {
      input.placeholder = "";
    }
  }
  
  function hideInput() {
    input.classList.add('hidden');
    button.classList.add('hidden');
  }

  function showMap(address) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status !== 'OK' || !results[0]) {
        text.innerText += '\n(Couldn’t find your location.)';
        return;
      }
  
      // 1. 使用者位置
      const userLoc = results[0].geometry.location;
      const userLat = userLoc.lat();
      const userLng = userLoc.lng();
  
      // 一定要先把 <div id="map"> 顯示出來
      mapDiv.classList.remove('hidden');
  
      // 然後再初始化地圖
      const map = new google.maps.Map(mapDiv, {
        center: userLoc,
        zoom: 13
      });
  
      // 標記「你的位置」
      new google.maps.Marker({
        map,
        position: userLoc,
        title: 'Your Location',
        icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
      });
  
      // 3. 隨機計算幸運地點
      const R = 5000; // 公尺
      const d = Math.sqrt(Math.random()) * R;
      const θ = Math.random() * 2 * Math.PI;
      const δLat = (d * Math.cos(θ)) / 111000;
      const δLng = (d * Math.sin(θ)) / (111000 * Math.cos(userLat * Math.PI / 180));
      const lucky = {
        lat: userLat + δLat,
        lng: userLng + δLng
      };
  
      // 標記「幸運地點」
      new google.maps.Marker({
        map,
        position: lucky,
        title: 'Lucky spot',
        icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
      });
  
      // 4. 顯示座標文字
      text.innerText += `\nLucky spot: (${lucky.lat.toFixed(5)}, ${lucky.lng.toFixed(5)})`;
  
      // 5. （可選）畫路線
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,  // 我們已經自己畫了 markers
        polylineOptions: { strokeColor: '#4169E1', strokeOpacity: 0.7 }
      });
      directionsRenderer.setMap(map);
  
      directionsService.route({
        origin: userLoc,
        destination: lucky,
        travelMode: 'WALKING'
      }, (res, status2) => {
        if (status2 === 'OK') {
          directionsRenderer.setDirections(res);
        } else {
          console.warn('Directions request failed:', status2);
        }
      });
    });
  }
}

// Google Maps callback
function initMap(){}


