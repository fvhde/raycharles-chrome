'use strict';

import './popup.css';

document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage(
    {
      type: 'GET_IMAGES'
    },
    (response) => {
      if (response && response.images) {
        console.log('Image count: ' + response.images.length);
      }
    }
  );
});


(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('inputForm');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const userInput = document.getElementById('userInput').value;

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];

        chrome.tabs.sendMessage(
          tab.id,
          {
            type: 'ADD_IMAGE',
            payload: {
              src: userInput
            }
          },
          (response) => {
            console.log('Current count value passed to contentScript file');
          }
        );
      });

      console.log(userInput)
      form.reset();
    });
  });

  // Communicate with background file by sending a message
  chrome.runtime.sendMessage(
    {
      type: 'GREETINGS',
      payload: {
        message: 'Hello, my name is Pop. I am from Popup.',
      },
    },
    (response) => {
      console.log(response.message);
    }
  );
})();
