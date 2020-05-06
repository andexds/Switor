import {
  drawThemePalette,
  changeLocalStyleBySelectColors,
  addNewTheme,
  cleanStorage,
  updateListOfStyle,
  applyTheme,
  deleteTheme
} from './components/index';

figma.showUI(__html__);
figma.ui.resize(320, 420);

figma.ui.onmessage = msg => {
  if (msg.type === 'draw-theme-palette') {
    drawThemePalette();
  }
  if (msg.type === 'change-local-theme') {
    changeLocalStyleBySelectColors();
  }
  if (msg.type === 'add-new-theme') {
    addNewTheme();
  }
  if (msg.type === 'clean-storage') {
    cleanStorage();
  }
  if (msg.type === 'draw-list') {
    updateListOfStyle();
  }
  if (msg.type === 'apply-theme') {
    applyTheme(msg.name);
  }
  if (msg.type === 'delete-theme') {
    deleteTheme(msg.name);
  }
}
