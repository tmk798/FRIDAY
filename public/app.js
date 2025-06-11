// Elements
const startBtn = document.querySelector("#start_friday_btn");
const stopBtn = document.querySelector("#stop_friday_btn");
stopBtn.style.display = "none";
const time = document.querySelector("#time");
const battery = document.querySelector("#battery");
const internet = document.querySelector("#internet");
const turn_on = document.querySelector("#turn_on");
// const friday_intro = document.querySelector("#friday_intro");
const msgs = document.querySelector(".messages");

let attemptsLeft = 3;
let windowsB = []; // Track opened windows
let fridayComs = []; // Friday commands
let cameraStream = null; // Track camera stream

// Friday commands initialization
[
    "hello friday", "wake up", "open youtube", "search <something> on youtube", "play <song/video name>",
    "open google", "search for <query>", "open instagram", "open my instagram profile", "open instagram profile",
    "open linkedin", "open my linkedin profile", "open linkedin profile", "open github", "open my github profile",
    "open github profile", "open leetcode", "open geeksforgeeks", "open chatgpt", "open chat gpt",
    "open my website", "open whatsapp", "what are your commands", "close this", "what is the weather or temperature",
    "show the full weather report", "are you there", "shut down", "open my canva designs", "open canva",
    "current charge", "charging status", "current time", "connection status", "who are you", "change my information",
    "open calendar", "close all tabs", "top headlines", "news regarding <topic>", "open camera", "close camera",
    "calculate <expression>", "shutdown friday" ,"activate static mode" // Added new commands
].forEach(cmd => fridayComs.push(cmd));


// Weather Setup
let lastWeatherData = null; // Store weather data globally

function weather(location) {
  const weatherCont = document.querySelector(".temp").querySelectorAll("*");
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=48ddfe8c9cf29f95b7d0e54d6e171008`;
  const xhr = new XMLHttpRequest();

  xhr.open("GET", url, true);
  xhr.onload = function () {
    if (this.status === 200) {
      let data = JSON.parse(this.responseText);
      lastWeatherData = data; // Store for later use

      weatherCont[0].textContent = `Location : ${data.name}`;
      weatherCont[1].textContent = `Country : ${data.sys.country}`;
      weatherCont[2].textContent = `Weather type : ${data.weather[0].main}`;
      weatherCont[3].textContent = `Weather description : ${data.weather[0].description}`;
      weatherCont[4].src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      weatherCont[5].textContent = `Original Temperature : ${ktc(data.main.temp)}`;
      weatherCont[6].textContent = `feels like ${ktc(data.main.feels_like)}`;
      weatherCont[7].textContent = `Min temperature ${ktc(data.main.temp_min)}`;
      weatherCont[8].textContent = `Max temperature ${ktc(data.main.temp_max)}`;
    } else {
      weatherCont[0].textContent = "Weather info not found";
    }
  };
  xhr.send();
}

function ktc(k) {
  return (k - 273.15).toFixed(2);
}

// Time setup
function updateTime() {
  const now = new Date();

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12;

  const timeStr = `${hours}:${minutes}:${seconds} ${ampm}`;
  const dateStr = now.toDateString(); // e.g., "Sat Jun 07 2025"

  document.getElementById("time").textContent = timeStr;
  document.getElementById("date").textContent = dateStr;
}



// Auto friday (starts recognition only if password is set)
function autoFriday() {
  if (localStorage.getItem("friday_setup") !== null) {
    recognition.start();
  } else {
    readOut("Please set up password first, sir.");
  }
}

// On window load
window.onload = () => {
  // Play turn on sound every time
  turn_on.play();

  turn_on.addEventListener("ended", () => {
    setTimeout(() => {
      if (localStorage.getItem("friday_setup") === null) {
        // Password not set yet - show setup and prompt password
        setup.style.display = "block";
        readOut("Sir, Enter Password");
      } else {
        // Password already setup - start recognition
        setup.style.display = "none";
        autoFriday();
        readOut("Ready To Go Sir");
      }
    }, 200);
  });

  // Friday commands - FIXED
  const commandsContainer = document.querySelector(".commands");
  commandsContainer.innerHTML = "<h2>FRIDAY Commands</h2>"; // Initialize with heading
  fridayComs.forEach((e) => {
    commandsContainer.innerHTML += `<p>• ${e}</p>`;
  });
  commandsContainer.style.display = "none"; // Hide by default

  // Time update every second
  updateTime();
  setInterval(updateTime, 1000);

  // Battery Setup
  let batteryPromise = navigator.getBattery();
  batteryPromise.then(batteryCallback);

  function batteryCallback(batteryObject) {
    printBatteryStatus(batteryObject);
    setInterval(() => {
      printBatteryStatus(batteryObject);
    }, 5000);
  }

  function printBatteryStatus(batteryObject) {
    if (batteryObject.charging) {
      document.querySelector(".battery").style.width = "260px";
      battery.textContent = `${(batteryObject.level * 100).toFixed(0)}% | Status: Plugged In⚡`;
    } else {
      document.querySelector(".battery").style.width = "260px";
      battery.textContent = `${(batteryObject.level * 100).toFixed(0)}% | Status: Unplugged🔋`;
    }
  }

  // Internet Setup
  navigator.onLine ? (internet.textContent = "Online") : (internet.textContent = "Offline");
  setInterval(() => {
    navigator.onLine ? (internet.textContent = "Online") : (internet.textContent = "Offline");
  }, 5000);

  // Disable recognition on load - mic off till password is correct
  recognition.abort();
};

// Function to block the page after 3 failed attempts
function blockPage() {
  try {
    recognition.abort();
  } catch { }

  startBtn.disabled = true;
  stopBtn.disabled = true;

  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = "black";
  overlay.style.color = "red";
  overlay.style.fontSize = "2rem";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = 9999;
  overlay.style.flexDirection = "column";
  overlay.style.textAlign = "center";
  overlay.textContent = "Access denied. Unauthorized user found. FRIDAY is shutting down.";
  document.body.appendChild(overlay);

  document.body.style.overflow = "hidden";

  setup.querySelectorAll("input, button").forEach((elem) => {
    elem.disabled = true;
  });

  window.addEventListener("contextmenu", (e) => e.preventDefault());
  window.addEventListener(
    "keydown",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );
}

//create a chat
function createMsg(who, msg) {
  let newmsg = document.createElement("p")
  newmsg.innerText = msg;
  newmsg.setAttribute("class", who)
  msgs.appendChild(newmsg)
}

// Friday Setup
const setup = document.querySelector(".friday_setup");
setup.style.display = "none";

if (localStorage.getItem("friday_setup") === null) {
  setup.style.display = "block";
  setup.querySelector("button").addEventListener("click", userInfo);
} else {
  const userData = JSON.parse(localStorage.getItem("friday_setup"));
  if (userData.location && userData.location !== "N/A") {
    weather(userData.location);
  }
}

// User Info Handling
function userInfo() {
  let setupInfo = {
    name: setup.querySelectorAll("input")[0].value.trim() || "N/A",
    bio: setup.querySelectorAll("input")[1].value.trim() || "N/A",
    location: setup.querySelectorAll("input")[2].value.trim() || "N/A",
    instagram: setup.querySelectorAll("input")[3].value.trim() || "N/A",
    github: setup.querySelectorAll("input")[4].value.trim() || "N/A",
    linkedin: setup.querySelectorAll("input")[5].value.trim() || "N/A",
  };

  const password = setup.querySelector("input[type='password']").value.trim();

  if (!password) {
    readOut("Please enter the password to continue.");
    alert("Password is mandatory. Please enter the password.");
    return;
  }

  if (password.toLowerCase() === "wake up daddy's home") {
    // Password correct: save info and proceed
    localStorage.setItem("friday_setup", JSON.stringify(setupInfo));
    setup.style.display = "none";
    if (setupInfo.location !== "N/A") weather(setupInfo.location);
    readOut("Access granted. Welcome sir.");
    
    autoFriday(); // start voice recognition now
  } 
  
  
  else {
    attemptsLeft--;
    if (attemptsLeft <= 0) {
      const denialMessage = "Access denied. Unauthorized user found. FRIDAY is shutting down.";
      speakWithZira(denialMessage, () => {
        const isWindows = navigator.platform.toLowerCase().includes("win");
        if (isWindows) {
          window.close();
          setTimeout(() => {
            if (!window.closed) window.location.href = "about:blank";
          }, 1500);
        } else {
          blockPage();
        }
      });
    } 
    else {
      alert(`Password incorrect. ${attemptsLeft} attempt${attemptsLeft > 1 ? "s" : ""} left.`);
      readOut(`Password incorrect. ${attemptsLeft} attempt${attemptsLeft > 1 ? "s" : ""} left.`);
    }
  }
}

// Voice Recognition Setup
/// Setup Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = localStorage.getItem("lang") || "en-US";

// Start recognition
startBtn.addEventListener("click", () => {
  const userdata = localStorage.getItem("friday_setup");
  const userInfo = userdata ? JSON.parse(userdata) : null;

  if (userInfo) {
    recognition.start();
    readOut("Voice recognition activated, sir.");

  } else {
    readOut("Please enter your password first, sir.");
  }
});


// Stop recognition
stopBtn.addEventListener("click", () => {
  recognition.stop();
  readOut("Voice recognition deactivated, sir.");
});

// Show stop button when recognition starts
recognition.onstart = () => {
  console.log("VR Activated");
  stopBtn.style.display = "inline-block";
};

// Hide stop button when recognition ends
recognition.onend = () => {
  console.log("VR Deactivated");
  stopBtn.style.display = "none";
};



// Camera functions
function openCamera() {
    if (cameraStream) {
        readOut("Camera is already open, sir.");
        return;
    }

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            cameraStream = stream;
            const video = document.createElement("video");
            video.id = "camera-preview";
            video.srcObject = stream;
            video.autoplay = true;
            video.style.position = "fixed";
            video.style.top = "150px";
            video.style.left = "150px";
            video.style.width = "300px";
            video.style.zIndex = "9999";
            document.body.appendChild(video);
            readOut("Camera activated, sir.");
        })
        .catch(() => readOut("Camera permission denied."));
}

function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
        const video = document.getElementById("camera-preview");
        if (video) video.remove();
        readOut("Camera closed, sir.");
    } else {
        readOut("No camera is open, sir.");
    }
}






// Handle recognition results
recognition.onresult = function (event) {
  const transcript = event.results[event.resultIndex][0].transcript.toLowerCase();
  createMsg("usermsg", transcript);
  // Add command handling logic here


  // NEW COMMAND HANDLING
  if (transcript.includes("close this")) {
    document.querySelector(".commands").style.display = "none";
    document.querySelector(".temp").style.display = "none";
         closeCamera();
    readOut("Closing popups sir");
  }

  if (transcript.includes("activate static mode")) {
        readOut("Static mode activated. Voice recognition is now off.");
         recognition.stop();
        windowsB.forEach(win => win.close());
        closeCamera();
 
        windowsB = [];
    }

if (transcript.includes("shutdown friday")) {
  const message = "Shutting down completely. Goodbye sir.";

  // Load voices first
  const speakWithZira = (text, callback) => {
    const voices = speechSynthesis.getVoices();
    let zira = voices.find(v => v.name.includes("Zira"));

    const utterance = new SpeechSynthesisUtterance(text);
    if (zira) utterance.voice = zira;

    utterance.onend = () => {
      if (callback) callback();
    };

    speechSynthesis.speak(utterance);
  };

  // Ensure voices are loaded before calling speak
  const loadVoicesThenSpeak = () => {
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.onvoiceschanged = () => {
        speakWithZira(message, shutdownFriday);
      };
    } else {
      speakWithZira(message, shutdownFriday);
    }
  };

  const shutdownFriday = () => {
    const isWindows = navigator.platform.toLowerCase().includes("win");
    if (isWindows) {
      window.open('', '_self').close();
      setTimeout(() => {
        window.location.href = "about:blank";
      }, 1500);
    } else {
      blockPage();
    }
  };

  loadVoicesThenSpeak();
}





  // userdata access commands

  if (transcript.includes("what's my name") || transcript.includes("what is my name")&& userInfo) {
    readOut(`Sir, I know that you are ${userInfo.name}`);
  }
  if (transcript.includes("what's my bio") || transcript.includes("what is my bio") && userInfo) {
    readOut(`Sir, I know that you are ${userInfo.bio}`);
  }



  //weather
  if (transcript.includes("what is the weather") || transcript.includes("what's the weather") || transcript.includes("temperature")) {
    if (lastWeatherData) {
      const tempC = ktc(lastWeatherData.main.temp);
      const condition = lastWeatherData.weather[0].description;
      readOut(`It's currently ${tempC} degrees Celsius with ${condition}`);
    } else {
      readOut("Weather data not available sir");
    }
  }

  if (transcript.includes("full weather report") && userInfo) {
    readOut("opening the weather report sir");
    let a = window.open(
      `https://www.google.com/search?q=weather+in+${userInfo.location}`
    );
    if (a) windowsB.push(a);
  }

  if (transcript.includes("are you there")) {
    readOut("Yes sir, I'm here and ready");
  }

  if (transcript.includes("what are your commands")) {
    readOut("Sir, I am programmed to follow these commands");
    document.querySelector(".commands").style.display = "block";
  }
  // data change
  if (transcript.includes("change my information")) {
    readOut("Opening the information tab sir");
    localStorage.clear();

    if (window.innerWidth <= 400) {
      window.resizeTo(screen.width, screen.height)
    }
    setup.style.display = "flex";
    setup.querySelector("button").addEventListener("click", userInfo);
  }
  //hello one

  if (transcript.includes("hello friday") || transcript.includes("wake up")) {
    readOut("Hello sir");
  }
  // general commands
  if (transcript.includes("current charge")) {
    readOut(`the current charge is ${battery.textContent.split('|')[0]}`);
  }
  if (transcript.includes("charging status")) {
    readOut(`the current charging status is ${battery.textContent.split('|')[1]}`);
  }
  if (transcript.includes("current time")) {
    readOut(`The current time is ${time.textContent}`);
  }
  if (transcript.includes("connection status")) {
    readOut(`you are ${internet.textContent} sir`);
  }
  //friday bio
  if (transcript.includes("who are you")) {
    readOut(
      "sir, i am Friday, a voice assistant made for browsers using javascript . I can do anything which can be done from a browser."
    );
  }

 

  // IMPROVED SEARCH WITH VOICE CONFIRMATION

  if (transcript.includes("open youtube") || transcript.includes("open you tube")) {
    readOut("Opening youtube sir");
    let a = window.open("https://www.youtube.com/");
    if (a) windowsB.push(a);
  }

  if (transcript.includes("search") && transcript.includes("on youtube")) {
    let input = transcript.replace("search", "").replace("on youtube", "").trim();
    let searchQuery = input.split(" ").join("+");
    readOut(`Searching for ${input} on YouTube sir`);
    let a = window.open(`https://www.youtube.com/results?search_query=${searchQuery}`);
    if (a) windowsB.push(a);
  }

  if (transcript.includes("play")) {
    let input = transcript.replace("play", "").trim();
    let searchQuery = input.split(" ").join("+");
    readOut(`Playing ${input} on YouTube sir`);
    let a = window.open(`https://www.google.com/search?q=${searchQuery}+site:youtube.com&btnI`);
    if (a) windowsB.push(a);
  }
  // canva

  if (transcript.includes("open my canva designs")) {
    readOut("opening canva designs");
    let a = window.open("https://www.canva.com/folder/all-designs");
    if (a) windowsB.push(a);
  }

  if (transcript.includes("open canva") || transcript.includes("open can va")) {
    readOut("opening canva");
    let a = window.open("https://www.canva.com/");
    if (a) windowsB.push(a);
  }

  //google
  if (transcript.includes("open google")) {
    readOut("Opening Google sir");
    let a = window.open("https://www.google.com/");
    if (a) windowsB.push(a);
  }

  if (transcript.includes("search for")) {
    let input = transcript.replace("search for", "").trim();
    let searchQuery = input.split(" ").join("+");
    readOut(`Searching for ${input} on Google sir`);
    let a = window.open(`https://www.google.com/search?q=${searchQuery}`);
    if (a) windowsB.push(a);
  }

  // userdata access commands
 if (userInfo) {
  if (transcript.includes("what is my name")) {
    readOut(`Sir, I know that you are ${userInfo.name}`);
  }

  if (transcript.includes("what is my bio")) {
    readOut(`Sir, I know that you are ${userInfo.bio}`);
  }

  // Instagram
  if (transcript.includes("open my instagram profile")) {
    readOut("Opening your Instagram profile sir");
    let a = window.open("https://www.instagram.com/tanmaykhule1feb/");
    if (a) windowsB.push(a);
  } else if (transcript.includes("open instagram profile")) {
    readOut("Opening Instagram profile sir");
    let a = window.open(`https://www.instagram.com/${userInfo.instagram}`);
    if (a) windowsB.push(a);
  } else if (transcript.includes("open instagram")) {
    readOut("Opening Instagram sir");
    let a = window.open("https://www.instagram.com/");
    if (a) windowsB.push(a);
  }

  // LinkedIn
  if (transcript.includes("open my linkedin profile")) {
    readOut("Opening your LinkedIn profile sir");
    let a = window.open("https://www.linkedin.com/in/tanmay-khule-523705250/");
    if (a) windowsB.push(a);
  } else if (transcript.includes("open linkedin profile")) {
    readOut("Opening LinkedIn profile sir");
    let a = window.open(`https://www.linkedin.com/in/${userInfo.linkedin}`);
    if (a) windowsB.push(a);
  } else if (transcript.includes("open linkedin")) {
    readOut("Opening LinkedIn sir");
    let a = window.open("https://www.linkedin.com/");
    if (a) windowsB.push(a);
  }

  // GitHub
if (transcript.includes("open my github profile")) {
      readOut("Opening your github profile sir");
      let a = window.open("https://github.com/tmk798");
      if (a) windowsB.push(a);
    } else if (transcript.includes("open github profile")) {
      readOut("Opening github profile sir");
      let a = window.open(`https://github.com/${userInfo.github}`);
      if (a) windowsB.push(a);
    } else if (transcript.includes("open github")) {
      readOut("Opening github sir");
      let a = window.open("https://github.com/");
      if (a) windowsB.push(a);
    }
}


     if (transcript.includes("open leetcode") || transcript.includes("open leet code")) {
        readOut("Opening LeetCode sir");
        window.open("https://leetcode.com/");
    }

    // GeeksForGeeks command (fixed variations)
    if (transcript.includes("open geeksforgeeks") || transcript.includes("open g f g")) {
        readOut("Opening GeeksForGeeks sir");
        window.open("https://www.geeksforgeeks.org/");
    }

  if (transcript.includes("open chatgpt") || transcript.includes("open chat gpt")) {
    readOut("Opening chat gpt sir");
    let a = window.open("https://chatgpt.com/");
    if (a) windowsB.push(a);
  }

  if (transcript.includes("open my website")) {
    readOut("Opening your website sir");
    let a = window.open("https://thetmkshowportfoliowebsite007.netlify.app/");
    if (a) windowsB.push(a);
  }

  if (transcript.includes("open whatsapp")) {
    readOut("Opening whatsapp sir");
    let a = window.open("https://web.whatsapp.com/");
    if (a) windowsB.push(a);
  }

      // Camera commands
    if (transcript.includes("open camera")) {
        openCamera();
    }

    if (transcript.includes("close camera")) {
        closeCamera();
    }

    // Calculation command
    if (transcript.includes("calculate")) {
        const expr = transcript.replace("calculate", "").trim();
        try {
            const result = eval(expr);
            readOut(`The result is ${result}`);
        } catch (e) {
            readOut("Sorry, that expression could not be calculated.");
        }
    }
  //folder creation
  // === Folder Creation ===
  if (transcript.includes("create folder")) {
    const folderName = transcript.replace("create folder", "").trim();
    fetch("/create-folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderName }),
    })
      .then((res) => res.json())
      .then((data) => readOut(data.message))
      .catch(() => readOut("Failed to create folder."));
  }

  // calendar
  if (transcript.includes("open calendar")) {
    readOut("opening calendar");
    let a = window.open("https://calendar.google.com/");
    if (a) windowsB.push(a);
  }

  // close all opened tabs - FIXED
   if (transcript.includes("close all tabs")) {
        readOut("Closing all tabs sir");
        windowsB.forEach(win => {
            try {
                if (win && !win.closed) win.close();
            } catch (error) {
                console.error("Error closing window:", error);
            }
        });
        windowsB = [];
    }


  // news commands - PLACEHOLDER IMPLEMENTATIONS
  if (transcript.includes("top headlines")) {
    readOut("These are today's top headlines sir");
    let a = window.open("https://news.google.com", "_blank");
    if (a) windowsB.push(a);
  }

  if (transcript.includes("news regarding")) {
    let input = transcript.replace("news regarding", "").trim();
    readOut(`Here's some headlines on ${input}`);
    let a = window.open(`https://news.google.com/search?q=${encodeURIComponent(input)}`, "_blank");
    if (a) windowsB.push(a);
  }



};

// // Speak function

function readOut(message) {

  const speech = new SpeechSynthesisUtterance(message);

  speech.lang = recognition.lang;

  synth.speak(speech);
}


// Placeholder message display function

function createMsg(type, message) {

  console.log(`[${type}] ${message}`);

  // You can add UI logic here to display messages

}




// function openCamera() {
//   navigator.mediaDevices.getUserMedia({ video: true })
//     .then((stream) => {
//       const video = document.createElement("video");
//       video.srcObject = stream;
//       video.autoplay = true;
//       video.style.position = "fixed";
//       video.style.top = "150px";
//       video.style.left = "150px";
//       video.style.width = "300px";
//       video.style.zIndex = 9999;
//       document.body.appendChild(video);
//     })
//     .catch(() => readOut("Camera permission denied."));
// }

// // NEW COMMAND HANDLING
// if (transcript.includes("close this")) {
//   document.querySelector(".commands").style.display = "none";
//   document.querySelector(".temp").style.display = "none";
//   readOut("Closing popups sir");
// }

// if (transcript.includes("shut down")) {
//   readOut("Shutting down FRIDAY. Goodbye sir.");
//   recognition.stop();
// }
// // userdata access commands

// if (transcript.includes("what's my name") && userInfo) {
//   readOut(`Sir, I know that you are ${userInfo.name}`);
// }
// if (transcript.includes("what's my bio") && userInfo) {
//   readOut(`Sir, I know that you are ${userInfo.bio}`);
// }
// //weather
// if (transcript.includes("what is the weather") || transcript.includes("what's the weather") || transcript.includes("temperature")) {
//   if (lastWeatherData) {
//     const tempC = ktc(lastWeatherData.main.temp);
//     const condition = lastWeatherData.weather[0].description;
//     readOut(`It's currently ${tempC} degrees Celsius with ${condition}`);
//   } else {
//     readOut("Weather data not available sir");
//   }
// }

// if (transcript.includes("full weather report") && userInfo) {
//   readOut("opening the weather report sir");
//   let a = window.open(
//     `https://www.google.com/search?q=weather+in+${userInfo.location}`
//   );
//   if (a) windowsB.push(a);
// }

// if (transcript.includes("are you there")) {
//   readOut("Yes sir, I'm here and ready");
// }

// if (transcript.includes("what are your commands")) {
//   readOut("Sir, I am programmed to follow these commands");
//   document.querySelector(".commands").style.display = "block";
// }
// // data change
// if (transcript.includes("change my information")) {
//   readOut("Opening the information tab sir");
//   localStorage.clear();

//   if (window.innerWidth <= 400) {
//     window.resizeTo(screen.width, screen.height)
//   }
//   setup.style.display = "flex";
//   setup.querySelector("button").addEventListener("click", userInfo);
// }
// //hello one

// if (transcript.includes("hello friday") || transcript.includes("wake up")) {
//   readOut("Hello sir");
// }
// // general commands
// if (transcript.includes("current charge")) {
//   readOut(`the current charge is ${battery.textContent.split('|')[0]}`);
// }
// if (transcript.includes("charging status")) {
//   readOut(`the current charging status is ${battery.textContent.split('|')[1]}`);
// }
// if (transcript.includes("current time")) {
//   readOut(`The current time is ${time.textContent}`);
// }
// if (transcript.includes("connection status")) {
//   readOut(`you are ${internet.textContent} sir`);
// }
// //friday bio
// if (transcript.includes("who are you")) {
//   readOut(
//     "sir, i am Friday, a voice assistant made for browsers using javascript . I can do anything which can be done from a browser."
//   );
// }

// // IMPROVED SEARCH WITH VOICE CONFIRMATION

// if (transcript.includes("open youtube") || transcript.includes("open you tube")) {
//   readOut("Opening youtube sir");
//   let a = window.open("https://www.youtube.com/");
//   if (a) windowsB.push(a);
// }

// if (transcript.includes("search") && transcript.includes("on youtube")) {
//   let input = transcript.replace("search", "").replace("on youtube", "").trim();
//   let searchQuery = input.split(" ").join("+");
//   readOut(`Searching for ${input} on YouTube sir`);
//   let a = window.open(`https://www.youtube.com/results?search_query=${searchQuery}`);
//   if (a) windowsB.push(a);
// }

// if (transcript.includes("play")) {
//   let input = transcript.replace("play", "").trim();
//   let searchQuery = input.split(" ").join("+");
//   readOut(`Playing ${input} on YouTube sir`);
//   let a = window.open(`https://www.google.com/search?q=${searchQuery}+site:youtube.com&btnI`);
//   if (a) windowsB.push(a);
// }
// // canva

// if (transcript.includes("open my canva designs")) {
//   readOut("opening canva designs");
//   let a = window.open("https://www.canva.com/folder/all-designs");
//   if (a) windowsB.push(a);
// }

// if (transcript.includes("open canva") || transcript.includes("open can va")) {
//   readOut("opening canva");
//   let a = window.open("https://www.canva.com/");
//   if (a) windowsB.push(a);
// }

// //google
// if (transcript.includes("open google")) {
//   readOut("Opening Google sir");
//   let a = window.open("https://www.google.com/");
//   if (a) windowsB.push(a);
// }

// if (transcript.includes("search for")) {
//   let input = transcript.replace("search for", "").trim();
//   let searchQuery = input.split(" ").join("+");
//   readOut(`Searching for ${input} on Google sir`);
//   let a = window.open(`https://www.google.com/search?q=${searchQuery}`);
//   if (a) windowsB.push(a);
// }

// // userdata access commands
// if (userInfo) {
//   if (transcript.includes("what is my name")) {
//     readOut(`Sir, I know that you are ${userInfo.name}`);
//   }
//   if (transcript.includes("what is my bio")) {
//     readOut(`Sir, I know that you are ${userInfo.bio}`);
//   }
//   // REST OF THE COMMANDS (unchanged)
//   if (transcript.includes("open my instagram profile")) {
//     readOut("Opening your Instagram profile sir");
//     let a = window.open("https://www.instagram.com/tanmaykhule1feb/");
//     if (a) windowsB.push(a);
//   } else if (transcript.includes("open instagram profile")) {
//     readOut("Opening Instagram profile sir");
//     let a = window.open(`https://www.instagram.com/${userInfo.instagram}`);
//     if (a) windowsB.push(a);
//   } else if (transcript.includes("open instagram")) {
//     readOut("Opening Instagram sir");
//     let a = window.open("https://www.instagram.com/");
//     if (a) windowsB.push(a);
//   }

//   if (transcript.includes("open my linkedin profile")) {
//     readOut("Opening your LinkedIn profile sir");
//     let a = window.open("https://www.linkedin.com/in/tanmay-khule-523705250/");
//     if (a) windowsB.push(a);
//   } else if (transcript.includes("open linkedin profile")) {
//     readOut("Opening LinkedIn profile sir");
//     let a = window.open(`https://www.linkedin.com/in/${userInfo.linkedin}`);
//     if (a) windowsB.push(a);
//   } else if (transcript.includes("open linkedin")) {
//     readOut("Opening LinkedIn sir");
//     let a = window.open("https://www.linkedin.com/");
//     if (a) windowsB.push(a);
//   }

//   if (transcript.includes("open my github profile")) {
//     readOut("Opening your github profile sir");
//     let a = window.open("https://github.com/tmk798");
//     if (a) windowsB.push(a);
//   } else if (transcript.includes("open github profile")) {
//     readOut("Opening github profile sir");
//     let a = window.open(`https://github.com/${userInfo.github}`);
//     if (a) windowsB.push(a);
//   } else if (transcript.includes("open github")) {
//     readOut("Opening github sir");
//     let a = window.open("https://github.com/");
//     if (a) windowsB.push(a);
//   }
// }

// if (transcript.includes("open leetcode")) {
//   readOut("Opening leetcode");
//   let a = window.open("https://leetcode.com/problemset/");
//   if (a) windowsB.push(a);
// }

// if (transcript.includes("open geeksforgeeks")) {
//   readOut("Opening geeksforgeeks sir");
//   let a = window.open("https://www.geeksforgeeks.org/problem-of-the-day");
//   if (a) windowsB.push(a);
// }

// if (transcript.includes("open chatgpt") || transcript.includes("open chat gpt")) {
//   readOut("Opening chat gpt sir");
//   let a = window.open("https://chatgpt.com/");
//   if (a) windowsB.push(a);
// }

// if (transcript.includes("open my website")) {
//   readOut("Opening your website sir");
//   let a = window.open("https://thetmkshowportfoliowebsite007.netlify.app/");
//   if (a) windowsB.push(a);
// }

// if (transcript.includes("open whatsapp")) {
//   readOut("Opening whatsapp sir");
//   let a = window.open("https://web.whatsapp.com/");
//   if (a) windowsB.push(a);
// }

// // calendar
// if (transcript.includes("open calendar")) {
//   readOut("opening calendar");
//   let a = window.open("https://calendar.google.com/");
//   if (a) windowsB.push(a);
// }

// // close all opened tabs - FIXED
// if (transcript.includes("close all tabs")) {
//   readOut("Closing all tabs sir");
//   // Create a copy of current windows
//   const windowsToClose = [...windowsB];

//   windowsToClose.forEach(win => {
//     try {
//       if (win && !win.closed) {
//         win.close();
//       }
//     } catch (error) {
//       console.error("Error closing window:", error);
//     }
//   });

//   // Clear the array
//   windowsB = [];
// }

// // news commands - PLACEHOLDER IMPLEMENTATIONS
// if (transcript.includes("top headlines")) {
//   readOut("These are today's top headlines sir");
//   let a = window.open("https://news.google.com", "_blank");
//   if (a) windowsB.push(a);
// }

// if (transcript.includes("news regarding")) {
//   let input = transcript.replace("news regarding", "").trim();
//   readOut(`Here's some headlines on ${input}`);
//   let a = window.open(`https://news.google.com/search?q=${encodeURIComponent(input)}`, "_blank");
//   if (a) windowsB.push(a);
// }


// Start/Stop buttons
startBtn.addEventListener("click", () => {
  if (localStorage.getItem("friday_setup") !== null) {
    recognition.start();
    readOut("Voice Recognition Activated Sir!!")
    stopBtn.style.display = "inline-block"; // Show stop button
  } else {
    readOut("Please set up password first, sir.");
  }
});

stopBtn.addEventListener("click", () => {
  recognition.stop();
  stopBtn.style.display = "none"; // Hide stop button
});

// Also handle automatic recognition end
recognition.onend = () => {
  console.log("VR Deactivated");
  stopBtn.style.display = "none";
};


// Unified voice function using Microsoft Zira Desktop
function speakWithZira(message, onEndCallback) {
  const synth = window.speechSynthesis;

  function speak() {
    const voices = synth.getVoices();
    let voice = voices.find((v) => v.name === "Microsoft Zira Desktop");
    if (!voice) {
      voice =
        voices.find((v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female")) || voices[0];
    }

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.voice = voice;
    utterance.volume = 1;

    if (onEndCallback) {
      utterance.onend = onEndCallback;
    }

    synth.speak(utterance);
  }

  if (synth.getVoices().length === 0) {
    synth.onvoiceschanged = speak;
  } else {
    speak();
  }
}

// Read out voice function using Microsoft Zira Desktop
function readOut(message) {
  speakWithZira(message);
  createMsg("jmsg", message)
}