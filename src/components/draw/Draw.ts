function drawRectangel(paints, name, i) {
  const rect = figma.createRectangle();
  rect.cornerRadius = 4;
  rect.resize(80, 40);
  rect.cornerSmoothing = 1;
  rect.x = 0;
  rect.y = (10 + rect.height) * (i === undefined ? 1 : i);
  rect.fills = paints;

  // rect.fillStyleId = styleId;
  rect.name = name || `color-${i}`;
  return rect;
}

function drawText(text, x, y, fontSize, opacity) {
  const textNode = figma.createText();
  textNode.characters = text;
  textNode.x = x;
  textNode.y = y;
  textNode.fontSize = fontSize;
  textNode.opacity = opacity;

  return textNode;
}

export { drawRectangel, drawText };