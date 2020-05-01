class Styles {


  static getLocalStyle = () => {
    const styleList = figma.getLocalPaintStyles();
    return styleList.length === 0 ? null : styleList;
  };

  static getArrayFromStyles = (styleList: PaintStyle[]) => {
    return styleList.map(({ name }) => {
      return name;
    });
  };



}




export default Styles;