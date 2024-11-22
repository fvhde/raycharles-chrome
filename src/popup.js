'use strict';

import './popup.css';
import { getAllHashes } from './localStore';

(async function() {
  document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('inputForm');
    const ul = document.querySelector('ul');
    const deleteAll = document.querySelector('#deleteAll');
    const documentFragment = new DocumentFragment();

    let dataKey = 1;

    const createListItem = (key, url) => {
      console.log('add :', key, url);
      const buttonDelete = document.createElement('button');
      buttonDelete.classList.add('btn', 'btn-sm', 'btn-outline-danger');
      buttonDelete.textContent = 'Delete';
      buttonDelete.setAttribute('data-id', key);
      buttonDelete.addEventListener('click', ev => {
        let id = ev.currentTarget.dataset.id;
        ul.removeChild(ul.querySelector(`li[data-key="${id}"]`));
        deleteAll.disabled = !ul.children.length;
        // delete from store
        remove(url);
      })

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

      // save in store
      add(imageUrl.value);

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

      clear();

      deleteAll.disabled = true;
    });

    let saved = await getAllHashes();
    console.log(saved, Object.keys(saved));
    Object.keys(saved).forEach(key => {
      let li = createListItem(dataKey, key);
      dataKey++;
      documentFragment.appendChild(li);
      ul.prepend(documentFragment);
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

function remove(key) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.sendMessage(
      tab.id,
      {
        type: 'REMOVE_IMAGE',
        payload: {
          key: key
        }
      },
      (response) => {
        console.log('Image removed');
      }
    );
  });
}

function clear() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.sendMessage(
      tab.id,
      {
        type: 'CLEAR_IMAGES'
      },
      (response) => {
        console.log('All images removed');
      }
    );
  });
}
