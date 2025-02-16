// Add this at the beginning of main.js
// Listen for system color scheme changes
const colorSchemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
colorSchemeMediaQuery.addEventListener('change', handleColorSchemeChange);

// Initial check for color scheme
handleColorSchemeChange(colorSchemeMediaQuery);

function handleColorSchemeChange(mediaQuery) {
  document.documentElement.classList.toggle('dark-mode', mediaQuery.matches);
  // You could also set a cookie here to remember the preference
}

// Rest of the existing main.js code...
// Get document elements
const textDisplay = document.querySelector('#text-display');
const inputField = document.querySelector('#input-field');

// Default: time-based typing
let timeCount = 60; // Default time in seconds
let randomWords = [];
let wordList = [];
let currentWord = 0;
let correctKeys = 0;
let startDate = 0;
let timer;
let timerActive = false;

// Base input field classes
const baseInputClasses = 'w-full border px-4 py-1 rounded text-lg focus:outline-none focus:border-highlight';

// Retrieve or set default language/time preference
getCookie('language') === '' ? setLanguage('english') : setLanguage(getCookie('language'));
getCookie('timeCount') === '' ? setTimeCount(60) : setTimeCount(getCookie('timeCount'));

// Generate text for the time test and reset
function setText(e) {
  e = e || window.event;
  // If Shift is held, keep the existing word list (unused, but included for convenience)
  const keepWordList = e && e.shiftKey;

  if (!keepWordList) {
    wordList = [];
  }
  currentWord = 0;
  correctKeys = 0;
  inputField.value = '';
  timerActive = false;
  clearTimeout(timer);
  textDisplay.style.display = 'block';
  
  // Reset input field classes
  inputField.className = baseInputClasses;
  inputField.classList.remove('border-wrong');
  inputField.classList.add('border-border-subtle');

  // Always time-based logic
  textDisplay.style.height = '3.2rem';
  document.querySelector(`#tc-${timeCount}`).innerHTML = timeCount;
  textDisplay.innerHTML = '';
  if (!keepWordList) {
    wordList = [];
    for (let i = 0; i < 500; i++) {
      const n = Math.floor(Math.random() * randomWords.length);
      wordList.push(randomWords[n]);
    }
  }

  // Show words on screen
  wordList.forEach(word => {
    const span = document.createElement('span');
    span.innerHTML = word + ' ';
    textDisplay.appendChild(span);
  });
  // Color the first word as "current"
  if (textDisplay.firstChild) {
    textDisplay.firstChild.classList.add('highlight');
  }

  inputField.focus();
}

// Key press logic
inputField.addEventListener('keydown', e => {
  // If the timer hasn't started, start it on first key
  if (currentWord === 0 && inputField.value === '') {
    if (!timerActive) {
      startTimer(timeCount);
      timerActive = true;
    }
  }

  // Mark input field as wrong if the typed portion does not match
  if (timerActive) {
    checkInputFieldClass(e);
  }

  // Space checks the word
  if (e.key === ' ') {
    e.preventDefault();
    if (inputField.value !== '') {
      // Scroll text if a new line is reached
      const currentWordPosition = textDisplay.childNodes[currentWord].getBoundingClientRect();
      const nextWordPosition = textDisplay.childNodes[currentWord + 1]
        ? textDisplay.childNodes[currentWord + 1].getBoundingClientRect()
        : { top: 0 };

      if (currentWordPosition.top < nextWordPosition.top) {
        // Hide all used words
        for (let i = 0; i <= currentWord; i++) {
          textDisplay.childNodes[i].style.display = 'none';
        }
      }

      // Mark correctness
      if (inputField.value === wordList[currentWord]) {
        textDisplay.childNodes[currentWord].classList.add('correct');
        correctKeys += wordList[currentWord].length + 1; // includes space
      } else {
        textDisplay.childNodes[currentWord].classList.add('wrong');
      }

      // Remove 'highlight' from old word
      textDisplay.childNodes[currentWord].classList.remove('highlight');

      // Move highlight/color to the next word
      if (textDisplay.childNodes[currentWord + 1]) {
        textDisplay.childNodes[currentWord + 1].classList.add('highlight');
      }

      inputField.value = '';
      // Reset border color when moving to next word
      inputField.classList.remove('border-wrong');
      inputField.classList.add('border-border-subtle');
      currentWord++;
    }
  }
  // If at the last word, pressing the final character can trigger the result
  else if (
    currentWord === wordList.length - 1 &&
    inputField.value + e.key === wordList[currentWord]
  ) {
    textDisplay.childNodes[currentWord].classList.add('correct');
    textDisplay.childNodes[currentWord].classList.remove('highlight');
    correctKeys += wordList[currentWord].length;
    currentWord++;
    showResult();
  }
});

// Check typed portion while user is typing
function checkInputFieldClass(e) {
  if (
    (e.key >= 'a' && e.key <= 'z') ||
    e.key === "'" ||
    e.key === ',' ||
    e.key === '.' ||
    e.key === ';'
  ) {
    const typedSoFar = inputField.value + e.key;
    const correctSlice = wordList[currentWord].slice(0, typedSoFar.length);
    
    if (typedSoFar === correctSlice) {
      inputField.classList.remove('border-wrong');
      inputField.classList.add('border-border-subtle');
    } else {
      inputField.classList.remove('border-border-subtle');
      inputField.classList.add('border-wrong');
    }
  } else if (e.key === 'Backspace') {
    const typedSoFar = e.ctrlKey
      ? ''
      : inputField.value.slice(0, inputField.value.length - 1);
    const correctSlice = wordList[currentWord].slice(0, typedSoFar.length);
    
    if (typedSoFar === correctSlice) {
      inputField.classList.remove('border-wrong');
      inputField.classList.add('border-border-subtle');
    } else {
      inputField.classList.remove('border-border-subtle');
      inputField.classList.add('border-wrong');
    }
  } else if (e.key === ' ') {
    inputField.classList.remove('border-wrong');
    inputField.classList.add('border-border-subtle');
  }
}

// Timer for time mode
function startTimer(time) {
  if (time > 0) {
    document.querySelector(`#tc-${timeCount}`).innerHTML = time;
    timer = setTimeout(() => {
      time--;
      startTimer(time);
    }, 1000);
  } else {
    timerActive = false;
    textDisplay.style.display = 'none';
    // Reset border color when test ends
    inputField.classList.remove('border-wrong');
    inputField.classList.add('border-border-subtle');
    // Reset displayed time
    document.querySelector(`#tc-${timeCount}`).innerHTML = timeCount;
    showResult();
  }
}

// Show the result for time mode
function showResult() {
  // Words typed
  const words = correctKeys / 5;
  const minute = timeCount / 60;
  // Calculate accuracy
  let sumKeys = -1;
  for (let i = 0; i < currentWord; i++) {
    sumKeys += wordList[i].length + 1; // includes space
  }
  const acc = Math.min(Math.floor((correctKeys / sumKeys) * 100), 100);
  const wpm = Math.floor(words / minute);

  document.querySelector('#right-wing').innerHTML = `WPM: ${wpm} / ACC: ${acc}`;
}

// Allow ESC to reset test
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    setText(e);
  }
});

// Let user change language on the fly if desired (Alt + L)
document.addEventListener('keydown', e => {
  // Modifiers Windows: [Alt], Mac: [Cmd + Ctrl]
  if (e.altKey || (e.metaKey && e.ctrlKey)) {
    // [mod + l] => Change the language
    if (e.key === 'l') {
      setLanguage(inputField.value);
    }
  }
});

// Fetch the word list for chosen language
function setLanguage(langString) {
  const lang = langString.toLowerCase();
  fetch('texts/random.json')
    .then(response => response.json())
    .then(json => {
      if (json[lang]) {
        randomWords = json[lang];
        setCookie('language', lang, 90);

        // For RTL languages
        if (lang === 'arabic') {
          textDisplay.style.direction = 'rtl';
          inputField.style.direction = 'rtl';
        } else {
          textDisplay.style.direction = 'ltr';
          inputField.style.direction = 'ltr';
        }

        setText();
      } else {
        console.error(`language ${lang} is undefined`);
      }
    })
    .catch(err => console.error(err));
}

// Update timeCount
function setTimeCount(tc) {
  setCookie('timeCount', tc, 90);
  timeCount = tc;
  document.querySelectorAll('#time-count > span').forEach(e => {
    e.style.borderBottom = '';
    e.innerHTML = e.id.substring(3);
  });
  document.querySelector(`#tc-${timeCount}`).style.borderBottom = '2px solid';
  setText();
}

// Cookie helpers
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + d.toUTCString();
  document.cookie = `${cname}=${cvalue};${expires};path=/`;
}

function getCookie(cname) {
  const name = cname + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}