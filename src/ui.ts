import Slider from './components/slider/Slider';
import './styles/app.scss';

document.body.classList.add('theme');

document.getElementById('create').onclick = () => {
    parent.postMessage({ pluginMessage: { type: 'create-theme' } }, '*');
};
document.getElementById('change').onclick = () => {
    parent.postMessage({ pluginMessage: { type: 'change-theme' } }, '*');
};

const slider1 = new Slider(document.querySelector('.slider_name_local'));

const styleMessage = document.getElementById('message__create');
const themeMessage = document.getElementById('message__change');