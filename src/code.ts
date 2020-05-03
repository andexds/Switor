
import { createThemeFromStyles, changeStyleColor } from './components/index';
figma.showUI(__html__);
figma.ui.resize(320, 420);

figma.ui.onmessage = msg => {
  if (msg.type === 'create-theme') {
    createThemeFromStyles('Default');
  }
  if (msg.type === 'change-theme') {
    changeStyleColor();
  }
}