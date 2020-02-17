
import { getLocalStyle, createThemeFromStyles, changeStyleColor } from './styles';
figma.showUI(__html__);
figma.ui.resize(360, 480);

figma.ui.onmessage = msg => {
  if (msg.type === 'create-theme') {
    figma.ui.postMessage({status: 'update'});
    const styleList = getLocalStyle();
    if (styleList !== null) {
      createThemeFromStyles('Default', styleList);
    }
  }
  if (msg.type === 'change-theme') {
    figma.ui.postMessage({status: 'update'});
    changeStyleColor();
  }

}