import './ui.scss';

document.getElementById('create').onclick = () => {
    parent.postMessage({ pluginMessage: { type: 'create-theme' } }, '*');
};
document.getElementById('change').onclick = () => {
    parent.postMessage({ pluginMessage: { type: 'change-theme' } }, '*');
};

const styleMessage = document.getElementById('message__create');
const themeMessage = document.getElementById('message__change');
onmessage = (e) => {
  if (e.data.pluginMessage.status === 'stylenotexist') {
    styleMessage.style.display = 'block';
  }
  if (e.data.pluginMessage.status === 'themenotexist') {
    themeMessage.style.display = 'block';
  }
  if (e.data.pluginMessage.status === 'update') {
    styleMessage.style.display = 'none';
    themeMessage.style.display = 'none';
  }
  if (e.data.pluginMessage.status === 'themeexist') {
    
  }
}