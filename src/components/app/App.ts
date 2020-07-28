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

  for (let colorIndex = 0; colorIndex >= selection.length; colorIndex += 1) {
    const color = selection[colorIndex];
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
  

  _.each(styleList, (style, index) => {
    nodeArray.push(drawRectangel(style.paints, style.name, index));
  });
}
// Обновление UI листа стилей
function updateListOfStyle() {
  // figma.clientStorage.setAsync('switor-styles', undefined).then(() => {
  //   console.log('stogare was delet');
  // });
  figma.clientStorage.getAsync('switor-styles').then((storage) => {
    figma.ui.postMessage({ status: 'drawList', data: storage });
  }).catch((e) => {
    console.log('Can\'t load style from storage ', e);
  });
}

// Создание новой темы из локальных стилей
function addNewTheme() {
  const lStyle = Style.getLocalStyle();
  if (lStyle === null) {
    figma.notify('You need have local styles');
    return;
  }
  const localStyle = lStyle.map(({id, name}) => {
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

      _.forIn(children, (child) => {
        iterOfNode(child);
      })

    } else {
      const currentFillId = formatId(selections.fillStyleId);
      if (currentFillId !== undefined) {
        collectOfNode[currentFillId] = collectOfNode[currentFillId] === undefined ? [{ node: selections, type: 'fill' }] : [...collectOfNode[currentFillId], { node: selections, type: 'fill' }];
      }

      const currentStrokeId = formatId(selections.strokeStyleId);
      if (currentStrokeId !== undefined) {
        collectOfNode[currentStrokeId] = collectOfNode[currentStrokeId] === undefined ? [{ node: selections, type: 'stroke' }] : [...collectOfNode[currentStrokeId], { node: selections, type: 'stroke' }];
      }
    }
  }


  _.forIn(selections, (selection) => {
    iterOfNode(selection);
  })
  return collectOfNode;
}

// Получаем имена цветов текущей темы
const getNamesOfCurrentId = (collectOfNode, allTheme) => {
  const keys = Object.keys(collectOfNode);
  const collectOldIDWithName = {};

  _.each(allTheme, (theme) => {
    console.log('alltheme', allTheme);
    _.each(theme.style, (style) => {
      if (keys.indexOf(style.id) > -1) {
        collectOldIDWithName[style.name] = style.id;
      }
    })
  })

  return collectOldIDWithName;
}

// Получаем ID новой темы
const makeObjectWithNewIdAndNode = (collectOldId, newTheme, collectNodes, withDefault) => {
  const names = Object.keys(collectOldId);
  console.log('NEMAS ', names);
  const collectNewId = {};

  _.each(newTheme.style, (style) => {
    if (names.indexOf(style.name) > -1) {
      if (withDefault) {
        const id = collectOldId[style.name];
        collectNewId[style.id] = collectNodes[id];
      } else {
        collectNewId[style.id] = collectNodes[style.name];
      }

    }
  })

  return collectNewId;
}

async function findNameById(currentIdWithNode) {
  const ids = Object.keys(currentIdWithNode);

  const names = await Promise.all(ids.map(async(id) => await figma.importStyleByKeyAsync(id).then((style) => {
    return {name: style.name, nodes: currentIdWithNode[id]};
  })));
  const obj = {};
  _.each(names, (name) => {
    obj[name.name] = name.nodes;
  })
  console.log('nnnn ', obj);
  return obj;
}

// Применение темы к выделенному элементу
function applyTheme(name) {
  figma.clientStorage.getAsync('switor-type-of-search').then((type) => {
    if (type) {
      searchWithDefaultTheme(name);
    } else {
      searchWithoutDefaultTheme(name);
    }
  });
}

function searchWithoutDefaultTheme(name) {
  const currentIdWithNode = makeObjectWithCurrentIdAndNodes();

  findNameById(currentIdWithNode).then((nameOfCurrentNode) => {
    figma.clientStorage.getAsync('switor-styles').then((allThemes) => {
      const newTheme = allThemes.filter((theme) => theme.name === name)[0];
      const newIdWithNode = makeObjectWithNewIdAndNode(nameOfCurrentNode, newTheme, nameOfCurrentNode, false);
      const ids = Object.keys(newIdWithNode);
      
      if (ids.length === 0) {
        figma.ui.postMessage({ status: 'wasApply', data: newTheme.name });
        figma.notify('Can\'t find match styles 😱');
        return;
      }
      _.each(ids, (id) => {
        figma.importStyleByKeyAsync(String(id)).then((paint) => {
          _.each(newIdWithNode[id], (node) => {
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
    console.log('Without Default ', name);
  });
  
  
}

function searchWithDefaultTheme(name) {
  const currentIdWithNode = makeObjectWithCurrentIdAndNodes();

  figma.clientStorage.getAsync('switor-styles').then((allThemes) => {
    const newTheme = allThemes.filter((theme) => theme.name === name)[0];
    const anotherThemes = allThemes.filter((theme) => theme.name !== name);
    const currentIdWithName = getNamesOfCurrentId(currentIdWithNode, anotherThemes);
  
    const newIdWithNode = makeObjectWithNewIdAndNode(currentIdWithName, newTheme, currentIdWithNode, true);
    const ids = Object.keys(newIdWithNode);
    if (Object.keys(ids).length === 0) {
      figma.ui.postMessage({ status: 'wasApply', data: newTheme.name });
      figma.notify('🤔Can\'t find the theme selected element. Please try again with unchecked checkbox or contact with us');
      return;
    }
    _.each(ids, (id) => {
      figma.importStyleByKeyAsync(String(id)).then((paint) => {
        _.each(newIdWithNode[id], (node) => {
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

function createStorage() {
  figma.clientStorage.setAsync('switor-styles', []).then(() => {
    console.log('Storage was create');
  })
}

function setTypeOfSearch(type) {
  figma.clientStorage.setAsync('switor-type-of-search', type).then(() => {
    console.log('type was set');
  });
}

function setCheckbox() {
  figma.clientStorage.getAsync('switor-type-of-search').then((val) => {
    figma.ui.postMessage({ status: 'set-checkbox', data: val });
  });
}

export {
  drawThemePalette,
  changeLocalStyleBySelectColors,
  addNewTheme,
  updateListOfStyle,
  applyTheme,
  deleteTheme,
  createStorage,
  setTypeOfSearch,
  setCheckbox
};
