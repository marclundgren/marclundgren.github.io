/* global m */
/* global FastClick, moment, _ */
/* jshint devel:true, strict:false */

// todo: move import structural css from stylesheet

(function(_, window) {
  var app = {};

  // App dependancies
  app.fastclick = FastClick;
  app.moment    = moment;

  // Stip utility
  app.strip = function(html) {
    // http://stackoverflow.com/a/822486
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Sub utility
  app.sub = function(str, obj) {
    var keys = Object.keys(obj);

    keys.map(function(key) {
      var re = new RegExp('{' + key + '}', 'gm');
      str = str.replace(re, obj[key]);
    });

    return str;
  };

  // Array Flatten utility
  app.array_flatten = function(arrays) {
    return [].concat.apply([], arrays);
  };

  // Model
  app.Video = function(data) {
    this.content    = m.prop(data.content);
    this.date       = m.prop(data.date);
    this.duration   = m.prop(data.duration);
    this.flash      = m.prop(data.flash);
    this.href       = m.prop('');
    this.id         = m.prop('_video_' + _.uniqueId());
    this.moment     = m.prop(app.moment(data.date));
    this.mp4        = m.prop(data.mp4);
    this.ogg        = m.prop(data.ogg);
    this.poster     = m.prop(data.poster);
    this.thumbnail  = m.prop(data.src);
    this.title      = m.prop(data.title);
    this.webm       = m.prop(data.webm);
  };

  // Module: App Header
  app.header = function(config) {
    var header     = { vm: {} };
    var vm         = header.vm;
    config         = config || {};
    vm.title       = m.prop(config.title || '');
    vm.searchURL   = m.prop(config.searchURL || '');
    vm.placeholder = m.prop(config.placeholder || '');
    vm.collapsed   = m.prop(true);
    vm.callbackKey = m.prop(config.callbackKey);
    vm.results     = m.prop([]);
    vm.query       = m.prop(null);
    vm.items       = m.prop([]);
    vm.searchIsInitialized = m.prop(false);

    header.search = {};

    header.search.get = function(url) {
      var vm = header.vm;

      return app.vm.jsonp({ callbackKey: vm.callbackKey(), url: url });
    };

    header.search.init = function() {
      var vm      = header.vm;
      var promise = header.search.get(vm.searchURL());

      promise.then(function(promisedData) {
        vm.items(promisedData.result.items);

        vm.searchIsInitialized(true);
      });

      return promise;
    };

    header.search.view = function() {
      var vm      = header.vm;
      var query   = vm.query();
      var results = query ? vm.filter(query) : [];

      return m('div', {
        style: {
          borderColor : 'transparent',
          display     : 'block',
          float       : 'right',
          padding     : 0,
          position    : 'relative'
        },
        onclick: function() {
          if (!vm.searchIsInitialized()) {
            header.search.init();
          }
        }
      }, [
        m('span.sr-only', 'Toggle navigation'),
        m('form.form-group' + (query ? '.active' : ''), {
          style: { marginBottom: 0 },
          onsubmit: function() {
            return false;
          }
        }, [
          m('div',  [
            m('input', {
              'aria-owns' : '_search_results_list_',
              oninput     : m.withAttr('value', vm.query),
              placeholder : vm.placeholder(),
              role        : 'combobox',
              type        : 'search',
              value       : query
            }),
            m('span.icon', {
              onclick : query ? function() { vm.query(''); } : null,
              style   : { padding: '17px' }
            }, [
              query ? m('i.fa.fa-close') : m('i.fa.fa-search')
            ]),
            results.length ? header.search.results.view({results: results}) : m('')
          ])
        ])
      ]);
    };

    header.vm.getResults = function(query) {
      var results = query ? header.search.fuzzy(query) : null;

      return header.vm.results(results);
    };

    header.vm.filter = function(query) {
      var vm = header.vm;
      query  = query.trim();

      vm.query(query);

      if (header.vm.searchIsInitialized()) {
        return header.vm.getResults(query);
      }
      else {
        header.search.init().then(function() {
          vm.searchIsInitialized(true);
        });
      }
    };

    // a sub-module of header.search
    header.search.results = {};

    header.search.results.view = function(ctrl) {
      var results = ctrl.results;

      return m('ul.#_search_results_list_.search-results', {
        style: {
          backgroundClip  : 'padding-box',
          backgroundColor : '#fff',
          border          : '2px solid #ccc',
          borderRadius    : '4px',
          boxShadow       : '0 6px 12px rgba(0,0,0,.175)',
          float           : 'left',
          fontSize        : '14px',
          left            : '0',
          listStyle       : 'none',
          margin          : '2px 0 0',
          maxHeight       : '24em',
          maxWidth        : '280px',
          overflowY       : 'auto',
          padding         : '5px 0',
          position        : 'absolute',
          textAlign       : 'left',
          top: '46px',
          zIndex          : 1000
        },
        role: 'menu'
      }, results.map(function(result) {
        return m('li', {
          style: {
            clear        : 'left',
            cursor       : 'pointer',
            display      : 'block',
            height       : '3em',
            lineHeight   : '3em',
            maxWidth     : '280px',
            overflow     : 'hidden',
            padding      : '0 1em ',
            textOverflow : 'ellipsis',
            whiteSpace   : 'nowrap'
          },
          role     : 'menuitem',
          tabindex : -1
        }, [
          m('a', {
            href: result.url,
            style: { padding: '10px 0' }
          }, result.title)
        ]);
      }));
    };

    header.search.fuzzy = function(query) {
      var vm    = header.vm;
      var items = vm.items();
      query     = query.toLowerCase();

      return _.filter(items, function(item) {
        var title = item.title.toLowerCase();

        return _.contains(title, query);
      });
    };

    // todo: move the search into a search.view
    header.view = function() {
      var vm = header.vm;

      return m('nav.navbar.navbar-default.app-header', {
        role: 'navigation',
        style: {
          position : 'fixed',
          top      : 0,
          right    : 0,
          left     : 0,
          zIndex   : 1999999999
        }}, [
        m('div.container-fluid', [
          m('div.navbar-header', {
            style: {
              padding : '5px 0',
              width   : '100%'
            }
          }, [
            m('a.navbar-brand', {
              href: '../video-gallery'
            }, vm.title()),
            app.vm.enableSearch() ? header.search.view() : m('')
          ])
        ])
      ]);
    };

    return header;
  };

  // Module: Video Player
  app.videoPlayer = function() {
    var videoPlayer = {};

    videoPlayer.vm  = {};

    videoPlayer.unloadable = function(element, isInitialized, context) {
      if (!isInitialized) {
        context.onunload = function() {
          element.pause();
          element.src = '';
          element.innerHTML = '';
          element.remove();
        };
      }
    };

    videoPlayer.controller = function() {
      this.data  = app.vm.getVideos;
      this.video = app.vm.getVideoById(m.route.param('videoID'));
    };

    videoPlayer.vm.init = function() {
      this.autoplay = m.prop(false);
      this.video    = m.prop();
      this.width    = 108;
    };

    videoPlayer.view = function(controller) {
      var returnVal;
      var video = controller.video;

      if (video) {
        var htmlTitle   = video.title();
        var htmlContent = video.content();
        var vm          = videoPlayer.vm;

        returnVal       = [
          m('div.videoPlayer', {
            style: {
              display    : 'inline-block',
              maxWidth   : '640px',
              width      : '100%'
            }
          }, [
            m('video.animate', {
              config: videoPlayer.unloadable,
              autoplay : vm.autoplay(),
              controls : true,
              poster   : video.poster(),
              style    : {
                maxWidth : '640px',
                width    : '100%'
              },
              onkeydown: function(event) {
                var keyCode = event.keyCode;

                // down, right arrow
                if (keyCode === 39 || keyCode === 40 || keyCode === 37 || keyCode === 38) {
                  event.stopPropagation();
                }
              }
            }, [
              m('source', { src: video.mp4(),  type: 'video/mp4'  }),
              m('source', { src: video.webm(), type: 'video/webm' }),
              m('source', { src: video.ogg(),  type: 'video/ogg'  })
            ]),
            m('section.card', { style: {
                margin    : '1em 0 2em 0',
                maxWidth  : 'none',
                textAlign : 'left',
                width     : '100%'
              }}, [
              m('h1.title', { style: {fontSize: '36px'} }, app.strip(htmlTitle)),
              m('strong', video.moment().format('MMMM DD, YYYY')),
              m('div.content', { style: {
                margin: '1em 0'
              }}, app.strip(htmlContent))
            ])
          ]),
          app.vm.videoList.view(controller)
        ];
      }
      else {
        returnVal = m('');
      }

      return returnVal;
    };

    videoPlayer.vm.init();

    return videoPlayer;
  };

  // Module: Video List
  app.videoList = function(config) {
    config        = config || {};
    var videoList = {};

    videoList.vm  = {};

    videoList.NAMESPACE = '_videoList_';

    videoList.vm.init = function() {
      this.callbackKey  = m.prop('processJSON');
      this.currentPage  = m.prop(1);
      this.loaded       = m.prop(false);
      this.loading      = m.prop(false);
      this.url          = m.prop(config.url || '');
      this.videos       = m.prop([]);

      videoList.next.fetch();
    };

    videoList.vm.keyDown = function(event) {
      var keyCode = event.keyCode;

      // arrow keys
      if (keyCode === 39 || keyCode === 40 || keyCode === 37 || keyCode === 38) {
        event.preventDefault();
        event.stopPropagation();

        // down, right arrow
        if (keyCode === 39 || keyCode === 40) {
          if (event.currentTarget.nextSibling) {
            event.currentTarget.nextSibling.focus();
          }
        }
        // up, left arrow
        else if (keyCode === 37 || keyCode === 38) {
          if (event.currentTarget.previousSibling) {
            event.currentTarget.previousSibling.focus();
          }
        }
      }
    };

    videoList.next = {};

    videoList.next.getParams = function(url) {
      var vars = {};

      url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value){
          vars[key] = value;
      });

      return vars;
    };

    videoList.next.get = function(url) {
      var vm = videoList.vm;

      return app.vm.jsonp({ callbackKey: vm.callbackKey(), url: url });
    };

    videoList.next.getElementByTitle = function(element, title) {
      var attributeValue = new RegExp('(^|\\s)' + title + '(\\s|$)', 'i');

      if (attributeValue) {
        var anchorElements = element.getElementsByTagName('a');

        for(var i = 0; i < anchorElements.length; i++) {
          var el        = anchorElements[i];
          var attribute = el.getAttribute && el.getAttribute('title');
          var isString  = ((typeof attribute).toLowerCase() === 'string') && (attribute.length > 0);
          var match     = isString && attributeValue.test(attribute);

          if (match) {
            return el;
          }
        }
      }

      return null;
    };

    videoList.next.videoFactory = function(videos) {
      return videos.map(function(item) {
        return new app.Video(item);
      });
    };

    videoList.next.fetch = function() {
      var url     = videoList.vm.url();
      var promise = videoList.next.get(url);

      videoList.vm.loading(true);

      promise.then(function(promisedData) {
        var result         = promisedData.result;
        var videos         = videoList.next.videoFactory(result.videos);
        var vm             = videoList.vm;
        var videosMerged   = app.array_flatten([vm.videos(), videos]);
        var element        = document.createElement('div');

        vm.loading(false);

        vm.videos(videosMerged);

        element.innerHTML = result.allPages;

        var nextPage = vm.currentPage() + 1;
        var title    = app.sub('Link to page {page}', { page: nextPage });
        var linkPage = videoList.next.getElementByTitle(element, title);

        /*
          HACK ALERT
          ==========
          I don't know how to make the navigation element in WCM reference the
          fidm domain, so I have no choice but to do it here.
        */
        var url      = linkPage ? '//fidm.edu' + linkPage.getAttribute('href') : null;

        videoList.vm.url(url);

        vm.currentPage(nextPage);

        m.redraw();
      }, function(brokenPromise) {
        videoList.vm.loading(false);

        app.error = new Error(brokenPromise);

        m.endComputation();
      });

      return promise;
    };

    videoList.next.view = function() {
      var vm = videoList.vm;

      return m('section.next', {
        onclick: function() {
          if (!vm.loaded()) {
            vm.loaded(true);
          }

          if (!vm.loading()) {
            videoList.next.fetch();
          }
        },
        tabindex: 0,
        style: {
          cursor  : 'pointer',
          display : 'block',
          width   : 'auto'
        }}, [
        m('div', {
          style: {
            outline : '0'
          }
        }, [
          vm.loading() ? m('i.fa.fa-spinner.fa-spin', { style : {
            color: '#333',
            fontSize: '2em'
          }}) : m('button.btn.btn-inverse', 'Show more items')
        ])
      ]);
    };

    videoList.controller = function() {
      this.data = videoList.vm.videos;
    };

    videoList.view = function(controller) {
      var vm   = videoList.vm;
      var data = controller.data();

      return [
        app.vm.header.view(),
        data && data.length ? m('div.videoList', {
            style: { textAlign: 'center' }
          }, [
          data.map(function(video, index) {
            var className = '.card';

            if (index >= 20) {
              className += '.animate';
            }

            var tabindex     = (index === 0) ? 0 : -1;
            var routeToVideo = m.route.bind(m.route, '/video/' + video.id());

            return m('section' + className, {
              key        : videoList.NAMESPACE + index,
              style      : { cursor: 'pointer' },
              tabindex   : tabindex,
              onclick    : routeToVideo,
              onkeydown  : vm.keyDown,
              onkeypress : function(event) {
                var keyCode = event.keyCode;

                if (keyCode === 13) {
                  // enter
                  event.preventDefault();
                  event.stopPropagation();

                  routeToVideo();
                }
              }
            }, [
              m('h4.title',
                {
                  style: {
                    marginTop    : '0px',
                    overflow     : 'hidden',
                    textAlign    : 'left',
                    textOverflow : 'ellipsis',
                    whiteSpace   : 'nowrap'
                  }
                },
                app.strip(video.title())
              ),
              m('div.details', {style: {
                position  : 'relative',
                textAlign : 'left'
              }}, [
                  m('div.thumbnail-container', { style: {
                    display      : 'inline-block',
                    paddingRight : '1em'
                  }}, [
                    m('img.thumbnail', { style: {
                      height       : '70px',
                      marginBottom : 0,
                      textAlign    : 'right',
                      width        : '118px'
                    },
                    src   : video.thumbnail(),
                    width : app.videoWidth
                  }),
                  m('div.duration', { style: {
                    backgroundColor : '#000',
                    bottom          : '6px',
                    color           : '#fff',
                    fontSize        : '11px',
                    fontWeight      : 'bold',
                    left            : '82px',
                    opacity         : 0.75,
                    padding         : '0px 4px',
                    position        : 'absolute'
                  }}, video.duration())
                ]),
                m('div.date-published', { style : {
                  color      : '#999',
                  display    : 'inline-block',
                  paddingTop : '50px'
                }}, video.moment().fromNow())
              ])
            ]);
          }),
          vm.url() ? videoList.next.view() : ''
        ]) : m('div', 'I could not find any videos.')
      ];
    };

    videoList.vm.init();

    return videoList;
  };

  // App View Model
  app.vm = {};

  app.vm.getVideos = function() {
    return app.vm.videoList.vm.videos();
  };

  app.vm.getVideoById = function(id) {
    var videos = app.vm.getVideos();

    for (var index = 0; index < videos.length; index++) {
      var item = videos[index];

      if (item.id() === id) {
        return item;
      }
    }

    return null;
  };

  app.vm.jsonp = function(config) {
    config          = config || {};
    var url         = config.url;
    var callbackKey = config.callbackKey || 'callback';
    var promise     = new Promise(function(resolve, reject) {
      if (!url) {
        reject('no url');
      }
      else if (typeof window[callbackKey] !== 'undefined') {
        reject(Error('callback key ' + callbackKey + ' already exists'));
      }
      else {
        var request = m.request({
          background : true,
          dataType   : 'jsonp',
          method     : config.method || 'GET',
          url        : url
        });

        window[callbackKey] = function(result) {
          resolve({result: result, request: request});
        };
      }
    });

    promise.then(function() {
      delete window[callbackKey];
    });

    return promise;
  };

  // Runtime Developing
  window.app = app;

  // Init app
  app.vm.enableSearch = m.prop(true);
  app.vm.header       = new app.header({
    callbackKey: 'searchJSON',
    searchURL: 'https://fidm.edu/wps/wcm/connect/wmo%20content/en/about/fidm%20video%20gallery?cmpntid=5affc6bf-21e2-4b8a-a660-a4896ebd2a91&source=library&srv=cmpnt&WCM_Page.ResetAll=TRUE&CACHE=NONE&CONTENTCACHE=NONE&CONNECTORCACHE=NONE',
    title: 'FIDM Videos',
    placeholder: 'keywords (e.g. "runway")'
  });
  app.vm.videoPlayer  = new app.videoPlayer();
  app.vm.videoList    = new app.videoList({
    url: 'https://fidm.edu/wps/wcm/connect/wmo%20content/en/about/fidm%20video%20gallery/debut?cmpntid=550064f6-50bb-446e-bd88-52f7d18a7c40&source=library&srv=cmpnt&WCM_Page.ResetAll=TRUE&CACHE=NONE&CONTENTCACHE=NONE&CONNECTORCACHE=NONE'
  });

  // App routing
  m.route.mode = 'search';
  m.route(
    document.getElementById('videoPlayer'),
    '/videos/', {
      '/videos'         : app.vm.videoList,
      '/video/:videoID' : app.vm.videoPlayer
    }
  );

  // Attach FastClick
  window.addEventListener('load', function() {
      app.fastclick.attach(document.body);
  }, false);

})(_, window);