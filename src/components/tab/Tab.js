class Tab {
  constructor(element) {
    const tabs = element.querySelectorAll('.tabs_item');

    tabs.forEach((tab) => {
      tab.querySelector('a').addEventListener('click', this.openPage);
    });
  }

  openPage(e) {
    e.preventDefault();
    const pageId = e.target.getAttribute('href');
    const page =  document.querySelector(pageId);
    const pages = document.querySelectorAll('.page');
    const tabs = document.querySelectorAll('.tabs .tabs_item');
    
    tabs.forEach((tab) => {
      tab.classList.remove('tabs_item_active');
    });
    pages.forEach((page) =>  {
      page.classList.add('page_visible-none');
    })

    page.classList.remove('page_visible-none');
    e.target.parentNode.classList.add('tabs_item_active');
  }
}

export default Tab;