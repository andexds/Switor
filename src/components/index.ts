import Styles from './styles/Styles';

const createThemeFromStyles = (nameTheme:string) => {
  const styleList = Styles.getLocalStyle();
  if (styleList === null) {
    figma.ui.postMessage({status: 'stylenotexist'});
    return;
  }
  const nodeArray: BaseNode[] = [];
  let group: GroupNode;

  const fontDidLoad = figma.loadFontAsync({ family: "Roboto", style: "Regular" });
  fontDidLoad.then(() => {
    const subtitle = figma.createText();
    subtitle.characters = 'Theme name';
    subtitle.x = 0;
    subtitle.y = -65;
    subtitle.fontSize = 12;
    subtitle.opacity = 0.5;

    const title = figma.createText();
    title.characters = nameTheme;
    title.x = 0;
    title.y = -50;
    title.fontSize = 24;

    nodeArray.push(subtitle);
    nodeArray.push(title);
    group = figma.group(nodeArray, figma.currentPage);
    group.name = nameTheme;

    figma.currentPage.selection = [ group ];
    figma.viewport.scrollAndZoomIntoView([ group ]);
  });
  
  for (let i = 0; i < styleList.length; i += 1) {
    const style = styleList[i];
    const rect = figma.createRectangle();
    rect.cornerRadius = 4;
    rect.resize(80, 40);
    rect.cornerSmoothing = 1;
    rect.x = 0;
    rect.y = (10 + rect.height) * i;
    rect.fills = style.paints;
    rect.name = style.name;
    nodeArray.push(rect);
  }
};
const changeStyleColor = () => {
  const styleList = Styles.getLocalStyle();
  if (styleList === null) {
    figma.ui.postMessage({status: 'themenotexist'});
    return;
  }
  const styleArray = Styles.getArrayFromStyles(styleList);

  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.ui.postMessage({status: 'themenotexist'});
    return;
  }

  for (const color of selection) {
    if ('fills' in color) {
      console.log(color.fills);
      const name = color.name;
      const fills = color.fills;
      const id = styleArray.indexOf(name);

      if (id === -1) {
        continue;
      }

      styleList[id].paints = [ fills[0] ];
    } else {
      //figma.notify('Please select some shape of theme');
      figma.ui.postMessage({status: 'themenotexist'});
      //figma.closePlugin();
      return;
    }
  }
}

export { createThemeFromStyles, changeStyleColor };