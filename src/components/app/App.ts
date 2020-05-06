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
      console.log(color.fills);
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
    nodeArray.push(drawRectangel(style.id, style.name, index));
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
      // return {id, name};
  });
  let storageStyles = [];
  figma.clientStorage.getAsync('switor-styles').then((storage) => {
    console.log('st: ', storage);
    if (storage.length !== 0) {
      storageStyles = storage;
      console.log(storageStyles);
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

// Применение темы к выделенному элементу
function applyTheme(name) {
  const selections = figma.currentPage.selection;

  if (selections.length === 0) {
    figma.notify('Please select something');
    return;
  }

  const iterOfNode = (selections, allTheme, newTheme) => {
    if ('children' in selections) {
      let children = selections.children;
      for (let child of children) {
        iterOfNode(child, allTheme, newTheme) ;
      }
    } else {
      const currentId = selections.fillStyleId.split(',')[0].split(':')[1];
      console.log('current: ', currentId);

      const findName = (allTheme) => {
        let name = '';
        allTheme.forEach((theme) => {
          const filtered = theme.style.filter((st) => {
            return st.id === currentId;
          });
          if (filtered.length !== 0) {
            name = filtered[0].name;
          }
        });
        return name;
      };

      const nameCurrentColor = findName(allTheme);
      console.log(nameCurrentColor);
      console.log(newTheme);
      if (nameCurrentColor === '') return;
      const newId = newTheme.style.filter((st) => {
        return st.name === nameCurrentColor;
      })[0].id;

      console.log('newID ', newId);
      figma.importStyleByKeyAsync(newId).then((paint) => {
        selections.fillStyleId = paint.id;
      });
    }
  }

  figma.clientStorage.getAsync('switor-styles').then((allThemes) => {
    const indexNewTheme = _.findIndex(allThemes, (s) => {
      return s.name === name;
    });

    const newTheme = allThemes[indexNewTheme];
    for (let selection of selections) {
      iterOfNode(selection, allThemes, newTheme);
    }

    figma.ui.postMessage({ status: 'wasApply', data: newTheme.name });
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
