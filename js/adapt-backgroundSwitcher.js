import Adapt from 'core/js/adapt';
import data from 'core/js/data';
import _ from 'underscore';
import BackgroundSwitcherPageView from './BackgroundSwitcherPageView';

class BackgroundSwitcher extends Backbone.Controller {

  initialize() {
    this.listenTo(Adapt, {
      'app:dataReady': this.onDataReady,
      'pageView:postRender': this.onPageViewPostRender
    });
    this._isMuted = true;
  }

  onDataReady() {
    const hasBackgroundSwitcher = data.some(model => model.get('_backgroundSwitcher')?._isEnabled === true);
    if (!hasBackgroundSwitcher) return;
    this.disableSmoothScrolling();
    this.createVideoTags();
  }

  onPageViewPostRender({ model }) {
    if (!model.get('_backgroundSwitcher')?._isEnabled) return;
    new BackgroundSwitcherPageView({ model });
    this.setUpClickJack();
  }

  get isMuted() {
    return this._isMuted;
  }

  set isMuted(value) {
    this._isMuted = value;
  }

  get maxVideos() {
    const contentObjects = Adapt.course.findDescendantModels('contentobject');
    const maxVideos = contentObjects.reduce((memo, contentobject) => {
      const videoBlocks = contentobject.findDescendantModels('block').filter((block) => {
        const config = block.get('_backgroundSwitcher');
        return !config?._isEnabled && config?._src?.includes('.mp4');
      });
      return videoBlocks.length > memo ? videoBlocks.length : memo;
    }, 1);
    return maxVideos;
  }

  createVideoTags() {
    this._videoTags = new Array(this.maxVideos);

    for (let i = 0, l = this._videoTags.length; i < l; i++) {
      const videoTag = this._videoTags[i] = document.createElement('video');
      videoTag.muted = true;
      videoTag.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAOBbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAA+gAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAqt0cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAA+gAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAABAAAAAKAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAPoAAAEAAABAAAAAAIjbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAAoAAAAKABVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABzm1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAY5zdGJsAAAAlnN0c2QAAAAAAAAAAQAAAIZhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAABAACgBIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP//AAAAMGF2Y0MBZAAp/+EAF2dkACms2V/khAAAAwAEAAADAKA8YMZYAQAGaOviSyLAAAAAGHN0dHMAAAAAAAAAAQAAABQAAAIAAAAAFHN0c3MAAAAAAAAAAQAAAAEAAAAwY3R0cwAAAAAAAAAEAAAAAQAABAAAAAABAAAGAAAAAAEAAAIAAAAAEQAABAAAAAAcc3RzYwAAAAAAAAABAAAAAQAAABQAAAABAAAAZHN0c3oAAAAAAAAAAAAAABQAAAMwAAAAEwAAAAwAAAAUAAAAEAAAAB8AAAAZAAAAFQAAABgAAAASAAAAEAAAABUAAAAXAAAAIwAAABAAAAAZAAAAEQAAABEAAAAXAAAAEQAAABRzdGNvAAAAAAAAAAEAAAOxAAAAYnVkdGEAAABabWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAbWRpcmFwcGwAAAAAAAAAAAAAAAAtaWxzdAAAACWpdG9vAAAAHWRhdGEAAAABAAAAAExhdmY1Ny4yOC4xMDAAAAAIZnJlZQAABMRtZGF0AAAC8QYF///t3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjY2NSBhMDFlMzM5IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNiAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTIwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yOC4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCB2YnZfbWF4cmF0ZT0xMDAgdmJ2X2J1ZnNpemU9MTgzNSBjcmZfbWF4PTAuMCBuYWxfaHJkPW5vbmUgZmlsbGVyPTAgaXBfcmF0aW89MS40MCBhcT0xOjEuMDAAgAAAADdliIQAn8ket4Sv4N/8MvAHtq99THPJIafABVFPijchtanS8Mw6aa0tWGyt/2cQYkG1yh0Uj0+/AAAAD0GaImxJ/909iP1N1leiXwAAAAgBnkF5CH/vgQAAABBBmkM8IZMphJ/VF9nKPyiyAAAADEGaZEnhDyZTAk++gQAAABtBmoVJ4Q8mUwJP5J9yLeMJPZB+V34vLL4d2fEAAAAVQZqmSeEPJlMCT8K8tO8CvFNF4F9nAAAAEUGax0nhDyZTAk/VDHx1074RAAAAFEGa6EnhDyZTAk/ClXs0E/5AgBfAAAAADkGbCUnhDyZTAk/42A2AAAAADEGbKknhDyZTAk++gQAAABFBm0tJ4Q8mUwJv+SqXB6XowQAAABNBm2xJ4Q8mUwJv5aYpSZp9CTfMAAAAH0GbjUnhDyZTAm/Jfl28zEqav462f5Nm+T9YdKxlvIEAAAAMQZuuSeEPJlMCb8GBAAAAFUGbz0nhDyZTAm/mCtLPn5SN5p/XQQAAAA1Bm/BJ4Q8mUwIj/8eAAAAADUGaEUnhDyZTAiv/yoAAAAATQZoySeEPJlMCK//4hEA8Lzz1twAAAA1BmlNJ4Q8mUwI7/9GA';
    }
  }

  firstClick(event) {
    for (let i = 0, l = this._videoTags.length; i < l; i++) {
      this._videoTags[i].play();
    }
    _.delay(this.pauseAll, 100);
  }

  pauseAll() {
    for (let i = 0, l = this._videoTags.length; i < l; i++) {
      this._videoTags[i].pause();
    }
  }

  setUpClickJack() {
    _.bindAll(this, 'firstClick', 'pauseAll');

    $('body').one({
      click: this.firstClick,
      touchend: this.firstClick
    });
  }

  getVideoTag() {
    return this._videoTags.pop();
  }

  releaseVideoTag(video) {
    this._videoTags.push(video);
    video.pause();
  }

  /**
   * Turn off smooth scrolling in IE and Edge to stop the background from flickering on scroll
   */
  disableSmoothScrolling() {
    const userAgent = navigator.userAgent;
    const shouldDisableSmoothScrolling = (userAgent.match(/MSIE 10/i) || userAgent.match(/Trident\/7\./) || userAgent.match(/Edge/));
    if (!shouldDisableSmoothScrolling) return;
    $('body').on('mousewheel', function (event) {
      event.preventDefault();
      const wd = event.originalEvent.wheelDelta;
      const csp = window.pageYOffset;
      window.scrollTo(0, csp - wd);
    });
  }

}

export default (Adapt.backgroundSwitcher = new BackgroundSwitcher());
