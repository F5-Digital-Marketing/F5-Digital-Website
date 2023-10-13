
  (function ($) {
  
  "use strict";

    // MENU
    $('.navbar-collapse a').on('click',function(){
      $(".navbar-collapse").collapse('hide');
    });
    
    // CUSTOM LINK
    $('.smoothscroll').click(function(){
      var el = $(this).attr('href');
      var elWrapped = $(el);
      var header_height = $('.navbar').height();
  
      scrollToDiv(elWrapped,header_height);
      return false;
  
      function scrollToDiv(element,navheight){
        var offset = element.offset();
        var offsetTop = offset.top;
        var totalScroll = offsetTop-navheight;
  
        $('body,html').animate({
        scrollTop: totalScroll
        }, 300);
      }
    });

    $(window).on('scroll', function(){
      function isScrollIntoView(elem, index) {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(window).height()*.5;
        if(elemBottom <= docViewBottom && elemTop >= docViewTop) {
          $(elem).addClass('active');
        }
        if(!(elemBottom <= docViewBottom)) {
          $(elem).removeClass('active');
        }
        var MainTimelineContainer = $('#vertical-scrollable-timeline')[0];
        var MainTimelineContainerBottom = MainTimelineContainer.getBoundingClientRect().bottom - $(window).height()*.5;
        $(MainTimelineContainer).find('.inner').css('height',MainTimelineContainerBottom+'px');
      }
      var timeline = $('#vertical-scrollable-timeline li');
      Array.from(timeline).forEach(isScrollIntoView);
    });
  
  })(window.jQuery);



  const lerp = (f0, f1, t) => (1 - t) * f0 + t * f1;
const clamp = (val, min, max) => Math.max(min, Math.min(val, max));

class DragScroll {
  constructor(obj) {
    this.$el = document.querySelector(obj.el);
    this.$wrap = this.$el.querySelector(obj.wrap);
    this.$items = this.$el.querySelectorAll(obj.item);
    this.$bar = this.$el.querySelector(obj.bar);
    this.init();
  }

  init() {
    this.progress = 0;
    this.speed = 0;
    this.oldX = 0;
    this.x = 0;
    this.playrate = 0;
    //
    this.bindings();
    this.events();
    this.calculate();
    this.raf();
  }

  bindings() {
    [
    'events',
    'calculate',
    'raf',
    'handleWheel',
    'move',
    'raf',
    'handleTouchStart',
    'handleTouchMove',
    'handleTouchEnd'].
    forEach(i => {this[i] = this[i].bind(this);});
  }

  calculate() {
    this.progress = 0;
    this.wrapWidth = this.$items[0].clientWidth * this.$items.length;
    this.$wrap.style.width = `${this.wrapWidth}px`;
    this.maxScroll = this.wrapWidth - this.$el.clientWidth;
  }

  handleWheel(e) {
    this.progress += e.deltaY;
    this.move();
  }

  handleTouchStart(e) {
    e.preventDefault();
    this.dragging = true;
    this.startX = e.clientX || e.touches[0].clientX;
    this.$el.classList.add('dragging');
  }

  handleTouchMove(e) {
    if (!this.dragging) return false;
    const x = e.clientX || e.touches[0].clientX;
    this.progress += (this.startX - x) * 2.5;
    this.startX = x;
    this.move();
  }

  handleTouchEnd() {
    this.dragging = false;
    this.$el.classList.remove('dragging');
  }

  move() {
    this.progress = clamp(this.progress, 0, this.maxScroll);
  }

  events() {
    window.addEventListener('resize', this.calculate);
    window.addEventListener('wheel', this.handleWheel);
    //
    this.$el.addEventListener('touchstart', this.handleTouchStart);
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleTouchEnd);
    //
    window.addEventListener('mousedown', this.handleTouchStart);
    window.addEventListener('mousemove', this.handleTouchMove);
    window.addEventListener('mouseup', this.handleTouchEnd);
    document.body.addEventListener('mouseleave', this.handleTouchEnd);
  }

  raf() {
    // requestAnimationFrame(this.raf)
    this.x = lerp(this.x, this.progress, 0.1);
    this.playrate = this.x / this.maxScroll;
    //
    this.$wrap.style.transform = `translateX(${-this.x}px)`;
    this.$bar.style.transform = `scaleX(${.18 + this.playrate * .82})`;
    //
    this.speed = Math.min(100, this.oldX - this.x);
    this.oldX = this.x;
    //
    this.scale = lerp(this.scale, this.speed, 0.1);
    this.$items.forEach(i => {
      i.style.transform = `scale(${1 - Math.abs(this.speed) * 0.002})`;
      i.querySelector('img').style.transform = `scaleX(${1 + Math.abs(this.speed) * 0.004})`;
    });
  }}



/*--------------------
Instances
--------------------*/
const scroll = new DragScroll({
  el: '.carousel',
  wrap: '.carousel--wrap',
  item: '.carousel--item',
  bar: '.carousel--progress-bar' });



/*--------------------
One raf to rule em all
--------------------*/
const raf = () => {
  requestAnimationFrame(raf);
  scroll.raf();
};
raf();

