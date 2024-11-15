'use strict';

import './popup.css';

(async function() {
  document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('inputForm');
    const ul = document.querySelector('ul');
    const deleteAll = document.querySelector('#deleteAll');
    const documentFragment = new DocumentFragment();

    let dataKey = 2;

    const deleteImage = id => {
      ul.removeChild(ul.querySelector(`li[data-key="${id}"]`));
      deleteAll.disabled = !ul.children.length;
    }

    const createListItem = (key, url) => {
      const buttonDelete = document.createElement('button');
      buttonDelete.classList.add('btn', 'btn-sm', 'btn-outline-danger');
      buttonDelete.textContent = 'Delete';
      buttonDelete.setAttribute('onclick', `deleteImage(${key})`);

      const divButton = document.createElement('div');
      divButton.classList.add('col-auto');
      divButton.appendChild(buttonDelete);

      const divImage = document.createElement('div');
      divImage.classList.add('col-auto', 'mr-auto', 'py-1');
      divImage.textContent = url;

      const divRow = document.createElement('div');
      divRow.classList.add('row');

      divRow.append(divImage, divButton);

      const li = document.createElement('li');
      li.classList.add('list-group-item');
      li.dataset.key = key;
      li.appendChild(divRow);
      return li;
    }

    form.imageUrl.addEventListener('input', e => {
      form.btn.disabled = !e.target.value;
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const { imageUrl, btn } = e.target;
      const key = dataKey++;
      const li = createListItem(key, imageUrl.value);

      documentFragment.appendChild(li);
      ul.prepend(documentFragment);

      e.target.reset();
      btn.disabled = true;
      deleteAll.disabled = false;
    });

    deleteAll.addEventListener('click', e => {
      while (ul.firstElementChild) {
        ul.removeChild(ul.lastElementChild);
      }

      deleteAll.disabled = true;
    });

    let saved = await getAllHashes();
    Object.keys(saved).forEach(key => {
      createListItem(dataKey, key)
      $dataKey++;
    });
  });


  // Communicate with background file by sending a message
  chrome.runtime.sendMessage(
    {
      type: 'GET_IMAGES',
      payload: {}
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.log("Message failed:", chrome.runtime.lastError.message);
      } else {
        console.log("Response received:", response);
      }
      console.log(response);
      if (response && response.images) {
        console.log(response.images);
        let div = document.getElementById('list');
        Object.keys(response.images).forEach(key => {
          let el = document.createElement('div');
          div.classList.add('col-auto', 'mr-auto', 'py-1');
          el.textContent = `${key}`;
          div.appendChild(el);
        });
      }
    }
  );
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

function add(url) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.sendMessage(
      tab.id,
      {
        type: 'ADD_IMAGE',
        payload: {
          src: url
        }
      },
      (response) => {
        console.log('New image saved');
      }
    );
  });
}

function getAllHashes() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, (items) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      resolve(items);
    });
  });
}
