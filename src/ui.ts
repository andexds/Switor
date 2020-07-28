import Slider from './components/slider/Slider';
import Tab from './components/tab/Tab';
import './styles/app.scss';
var _ = require('lodash');

document.body.classList.add('theme');

document.getElementById('drawThemePalette').onclick = () => {
  parent.postMessage({ pluginMessage: { type: 'draw-theme-palette' } }, '*');
};
document.getElementById('changeLocalStyle').onclick = () => {
  parent.postMessage({ pluginMessage: { type: 'change-local-theme' } }, '*');
};
document.getElementById('addNewTheme').onclick = () => {
  parent.postMessage({ pluginMessage: { type: 'add-new-theme' } }, '*');
}
document.getElementById('iHaveInSwitorDefaultStyle').onchange = (e) => {
  const target = e.target as HTMLInputElement;
  parent.postMessage({ pluginMessage: { type: 'searchWithoutDefaultTheme', data: target.checked } }, '*');
}
const message = document.getElementById('message');
message.classList.add('displayNone');
document.getElementById('whatButton').onmouseenter = () => {
  message.classList.remove('displayNone');
}
document.getElementById('whatButton').onmouseleave = () => {
  message.classList.add('displayNone');
}

const slider1 = new Slider(document.querySelector('.slider_name_local'));
const slider2 = new Slider(document.querySelector('.slider_name_global'));
const tab = new Tab(document.querySelector('.tabs'));

const styleMessage = document.getElementById('message__create');
const themeMessage = document.getElementById('message__change');

parent.postMessage({ pluginMessage: { type: 'draw-list' } }, '*');
parent.postMessage({ pluginMessage: { type: 'setCheckbox' } }, '*');

onmessage = (e) => {
  if (e.data.pluginMessage.status === 'drawList') {
    const checkboxBlock = document.querySelector('.checkboxBlock');
    const placeholder = document.querySelector('.placeholder-1');
    const list = document.querySelector('.list');

    if (e.data.pluginMessage.data === undefined) {
      console.log('list of style doesn\'t exist');
      parent.postMessage({ pluginMessage: { type: 'create-storage' } }, '*');
      return;
    }

    if (e.data.pluginMessage.data.length === 0) {
      checkboxBlock.classList.add('displayNone');
      placeholder.classList.remove('displayNone');
      return;
    } else {
      checkboxBlock.classList.remove('displayNone');
      placeholder.classList.add('displayNone');
    }

    list.innerHTML = '';
    _.each(e.data.pluginMessage.data, (style) => {
      const item = document.createElement('div');
      const description = document.createElement('div');
      const listButtons = document.createElement('div');
      const buttonApply = document.createElement('button');
      const buttonDelete = document.createElement('button');

      item.classList.add('list_item');
      description.classList.add('list_descrition');
      listButtons.classList.add('list_buttons');
      buttonDelete.classList.add('button', 'button_type_secondary');
      buttonApply.classList.add('button', 'button_type_primary', 'button_space_left', 'button_apply');
      
      buttonDelete.dataset.name = style.name;
      buttonApply.dataset.name = style.name;
      buttonDelete.innerText = 'Delete';
      buttonApply.innerText = 'Apply';

      const month = Number(style.date.split('/')[0]);
      const day = style.date.split('/')[1];
      const year = style.date.split('/')[2];

      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];

      description.innerHTML = `
        <div class="list_title">${style.name}</div>
        <div class="list_date">${months[month-1]} ${day}, ${year}</div>`;
      
        console.log(style.date);

      buttonApply.addEventListener('click', (e) => {
        if (!(e.target instanceof HTMLButtonElement)) {
          return;
        }
        const name = e.target.dataset.name;
        e.target.innerText = 'Wait...';
        parent.postMessage({ pluginMessage: { type: 'apply-theme', name} }, '*');
      });
      buttonDelete.addEventListener('click', (e) => {
        if (!(e.target instanceof HTMLButtonElement)) {
          return;
        }
        const name = e.target.dataset.name;
        parent.postMessage({ pluginMessage: { type: 'delete-theme', name} }, '*');
      });

      listButtons.append(buttonDelete, buttonApply);
      item.append(description, listButtons);
      list.append(item);
    });

  } else if (e.data.pluginMessage.status === 'wasApply') {
    
    const button = document.querySelector(`.button_apply[data-name='${e.data.pluginMessage.data}']`);
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    console.log('fff: ', button);
    button.innerText = "Apply";
  } else if (e.data.pluginMessage.status === 'set-checkbox') {
    const checkbox = document.getElementById('iHaveInSwitorDefaultStyle') as HTMLInputElement;
    checkbox.checked = Boolean(e.data.pluginMessage.data);
  }
}