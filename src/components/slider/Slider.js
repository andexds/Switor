class Slider {
  constructor (element) {
    this.domElement = element;
    this.arrowBackward = element.querySelector('.slider_arrow_type_backward');
    this.arrowForward = element.querySelector('.slider_arrow_type_forward');
    this.sliders = element.getElementsByClassName('slider_slide');
    this.currentSlide = 0;
    this.countOfSlides  = this.sliders.length;

    this.arrowForward.addEventListener('click', this.nextSlide.bind(this));
    this.arrowBackward.addEventListener('click', this.prevSlide.bind(this));
  }

  upDateArrow() {
    if (this.currentSlide > 0) {
      this.arrowBackward.classList.remove('slider_arrow_hidden');
    } else {
      this.arrowBackward.classList.add('slider_arrow_hidden');
    }

    if (this.currentSlide + 1 >= this.countOfSlides) {
      this.arrowForward.classList.add('slider_arrow_hidden');
    } else {
      this.arrowForward.classList.remove('slider_arrow_hidden');
    }
  }

  nextSlide() {
    console.log(this.currentSlide);
    if (this.currentSlide + 1 < this.countOfSlides) {
      this.sliders[this.currentSlide].classList.remove('slider_slide_type_active');
      this.currentSlide = this.currentSlide + 1;
      this.sliders[this.currentSlide].classList.add('slider_slide_type_active');
    }
    this.upDateArrow();
  }

  prevSlide() {
    console.log(this.currentSlide);
    if (this.currentSlide > 0) {
      this.sliders[this.currentSlide].classList.remove('slider_slide_type_active');
      this.currentSlide = this.currentSlide - 1;
      this.sliders[this.currentSlide].classList.add('slider_slide_type_active');
    }
    this.upDateArrow();
  }
}

export default Slider;