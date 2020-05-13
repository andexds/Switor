import Style from '../style/Style';
import  { drawRectangel, drawText } from '../draw/Draw';
var _ = require('lodash');

// Изменени локальных стилей по выбранным цветам
function changeLocalStyleBySelectColors() {
  const styleList = Style.getLocalStyle();

  if (styleList === null) {
    figma.notify("At first please select some theme colors");
    return;
  }

  const styleArray = Style.getArrayFromStyles(styleList);

  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify("Ok, you must have local style to create palette");
    return;
  }

  for (const color of selection) {
    if ('fills' in color) {
      const name = color.name;
      const fills = color.fills;
      const id = styleArray.indexOf(name);

      if (id === -1) {
        continue;
      }

      styleList[id].paints = [ fills[0] ];
    } else {
      figma.notify("Ok, you must have local style to create palette");
      return;
    }
  }
}

// Рисование палитры цветов из локальных стилей
function drawThemePalette() {
  const styleList = Style.getLocalStyle();
  if (styleList === null) {
    figma.notify("Ok, you must have local style to create palette");
    return;
  }
  const nodeArray: BaseNode[] = [];
  let group: GroupNode;

  figma.loadFontAsync({ family: "Roboto", style: "Regular" }).then(() => {
    const subtitle  = drawText('Theme name', 0, -65, 12, 0.5);
    const title = drawText('Default', 0, -50, 24, 1);

    nodeArray.push(subtitle);
    nodeArray.push(title);
    group = figma.group(nodeArray, figma.currentPage);
    group.name = 'Default';

    figma.currentPage.selection = [ group ];
    figma.viewport.scrollAndZoomIntoView([ group ]);
  });
  
  styleList.forEach((style, index) => {
    nodeArray.push(drawRectangel(style.paints, style.name, index));
  });
}
// Обновление UI листа стилей
function updateListOfStyle() {
  figma.clientStorage.getAsync('switor-styles').then((storage) => {
    figma.ui.postMessage({ status: 'drawList', data: storage });
  });
}

// Создание новой темы из локальных стилей
function addNewTheme() {
  const localStyle = Style.getLocalStyle().map(({id, name}) => {
      return {id: id.split(',')[0].split(':')[1], name};
  });
  let storageStyles = [];
  figma.clientStorage.getAsync('switor-styles').then((storage) => {
    if (storage.length !== 0) {
      storageStyles = storage;
    }

    const name = figma.root.name;
    const date = new Date().toLocaleDateString('ru-RU');
    const index = _.findIndex(storageStyles, function(o) { return o.name == name; });
    
    if (index === -1) {
      const style = {
        name,
        date,
        style: localStyle
      }
      storageStyles.push(style);

      figma.clientStorage.setAsync('switor-styles', storageStyles).then(() => {
        updateListOfStyle();
      })
    } else {
      figma.notify("Theme already has been added");
    }
  });
}

const formatId = (rawid) => rawid.split(',')[0].split(':')[1];

// Получаем ID стиля всех элементов
// и получаем плоский список всех Node
const makeObjectWithCurrentIdAndNodes = () => {
  const selections = figma.currentPage.selection;
  const collectOfNode = {};

  if (selections.length === 0) {
    figma.notify('Please select something');
    return;
  }

  const iterOfNode = (selections) => {
    if ('children' in selections) {
      let children = selections.children;
      for (let child of children) {
        iterOfNode(child);
      }
    } else {
      const currentFillId = formatId(selections.fillStyleId);
      collectOfNode[currentFillId] = collectOfNode[currentFillId] === undefined ? [{ node: selections, type: 'fill' }] : [...collectOfNode[currentFillId], { node: selections, type: 'fill' }];

      const currentStrokeId = formatId(selections.strokeStyleId);
      collectOfNode[currentStrokeId] = collectOfNode[currentStrokeId] === undefined ? [{ node: selections, type: 'stroke' }] : [...collectOfNode[currentStrokeId], { node: selections, type: 'stroke' }];
    }
  }

  for (let selection of selections) {
    iterOfNode(selection);
  }
  return collectOfNode;
}

// Получаем именя цветов текущей темы
const getNamesOfCurrentId = (collectOfNode, allTheme) => {
  const keys = Object.keys(collectOfNode);
  const collectOldIDWithName = {};
  allTheme.forEach((theme) => {
    theme.style.forEach((style) => {
      if (keys.indexOf(style.id) > -1) {
        collectOldIDWithName[style.name] = style.id;
      }
    })
  });

  return collectOldIDWithName;
}

// Получаем ID новой темы
const makeObjectWithNewIdAndNode = (collectOldId, newTheme, collectNodes) => {

  const names = Object.keys(collectOldId);
  const collectNewId = {};

  newTheme.style.forEach((style) => {
    if (names.indexOf(style.name) > -1) {
      const id = collectOldId[style.name];
      const nodes = collectNodes[id];

      collectNewId[style.id] = nodes;
    }
  });

  return collectNewId;
}

// Применение темы к выделенному элементу
function applyTheme(name) {
  const currentIdWithNode = makeObjectWithCurrentIdAndNodes();

  figma.clientStorage.getAsync('switor-styles').then((allThemes) => {
    const newTheme = allThemes.filter((theme) => theme.name === name)[0];
    const anotherThemes = allThemes.filter((theme) => theme.name !== name);

    const currentIdWithName = getNamesOfCurrentId(currentIdWithNode, anotherThemes);
    const newIdWithNode = makeObjectWithNewIdAndNode(currentIdWithName, newTheme, currentIdWithNode);

    const ids = Object.keys(newIdWithNode);

    ids.forEach((id) => {
      figma.importStyleByKeyAsync(String(id)).then((paint) => {
        newIdWithNode[id].forEach((node) => {
          const type = node.type;
          if (type === 'fill') {
            node.node.fillStyleId  = paint.id;
          } else if (type === 'stroke') {
            node.node.strokeStyleId  = paint.id;
          }
          console.log(node.node.name, ' changed color');
        });
      });
    });
    figma.ui.postMessage({ status: 'wasApply', data: newTheme.name });
    figma.notify('You are awesome 😍');
  });
}

// Удаление темы
function deleteTheme(name) {
  figma.clientStorage.getAsync('switor-styles').then((allThemes) => {
    const newList = allThemes.filter((theme) => {
      return theme.name === name ? false : true;
    });
    figma.clientStorage.setAsync('switor-styles', newList).then(() => {
      updateListOfStyle();
      figma.notify(`Theme ${name} was delete`);
    });
  });
}

export {
  drawThemePalette,
  changeLocalStyleBySelectColors,
  addNewTheme,
  updateListOfStyle,
  applyTheme,
  deleteTheme
};
