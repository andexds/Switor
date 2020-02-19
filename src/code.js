import { createThemeFromStyles, changeStyleColor } from './styles';
figma.showUI(__html__);
figma.ui.resize(360, 472);
figma.ui.onmessage = msg => {
    figma.ui.postMessage({ status: 'update' });
    if (msg.type === 'create-theme') {
        createThemeFromStyles('Default');
    }
    if (msg.type === 'change-theme') {
        changeStyleColor();
    }
};
