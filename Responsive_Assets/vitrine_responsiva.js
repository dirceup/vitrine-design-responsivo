// Copyright Dirceu Pauka Júnior
// dirceuu@gmail.com

;
var VitrineResponsiva = (
 function(d) {

  // APP
  var
    appid = "14970154949521435dbc6",

    currency_map = {
        "BRL": {abrv: "R$ ", cents: 2, mi: ".", cent: ","}
    },

    tabs_map = {
      "bestsellers": "Mais vendidos",
      "77": "Celular e Smartphone",
      "2852": "TV",
      "6424": "Notebook",
      "3482": "Livros",
      "93": "Câmera Digital",
      "6409": "Jogos",
      "6058": "Videogame",
      "3673": "Refrigerador",
      "138": "Fogão",
      "3671": "Lavadora de Roupas",
      "2858": "Tênis",
      "10232": "Tablet",
      "3694": "Relógio de Pulso",
      "3442": "Perfume",
      "1437": "Bicicleta"
    },
                                  
    default_categories_ids_order = ["bestsellers", 77, 2852, 6424, 3482, 93, 6409, 6058, 3673, 138, 3671, 2858, 10232, 3694, 3442, 1437],

    // todo montar grupos randomicos
    // com 4 produtos mas cada um de um segmento

    // seleção de ofertas

    // 7 segs


    randomize_tabs_til = 4,
    change_tabs_til = 4,

    top_tabs_ids = default_categories_ids_order.slice(0, randomize_tabs_til),
    other_tabs_ids = default_categories_ids_order.slice(randomize_tabs_til),
    // tabs_ids = shuffle(top_tabs_ids).concat(other_tabs_ids),
    tabs_ids = top_tabs_ids.concat(other_tabs_ids),

    client_cache = {},

    suggestion_has_heart_beat = true,
    suggestion_has_heart_beat_keyboard = true,
    delayed_suggestion,
    last_suggestion = "",

    search_has_heart_beat = true,
    delayed_search,

    // suggestion
    hover_suggest,
    has_focus,
    hover_pos,
    max_suggestions = 6,

    // 'global options
    g_country,
    g_source_id,
    g_results,

    // spin.js
    offers_spinner,
    suggestions_spinner,

    // holders
    search_holder,
    suggestions_loading,

    suggestions_holder,
    tabs_holder,
    sidebar,
    offers_holder,
    footer,
    header,
    entry,
    bg_message,
    loading,
    scrollpanel,
    sugst_scroll,

    // pagination
    pagination_previous,
    pagination_next,

    // to load more pages from last BWS call
    last_options,
    last_callback,
    last_method,

    // jsonp configs
    head,
    // 10 seg
    timeout = 10 * 1000,

    // used by simple_json
    json_counter = 0,

    // carousel
    showing_tab = 0,
    ishover = false,

    html_templates = {},

    // ie < 9 sniff
    is_old_ie = '\v' == 'v',

    // how much time mouseover offer
    mouse_over_timeout,

    iscroll,
    iscroll_suggestion,

    has_sidebar,
    has_space_for_pagination,
    has_scrolled,
    has_bws_failed
                                  
  ;


  function $(e) {
    return d.getElementById(e);
  }

  function load(url, uniqueName) {

    var
      script = d.createElement('script'),
      done = false
    ;
    
    script.src = url + uniqueName + ".cb";
    script.async = true;
    script.charset = "utf-8";

    script.onerror = function() {
      clearTimeout(VitrineResponsiva[uniqueName]["timeout"]);
      VitrineResponsiva[uniqueName]["failback"]();
      script.onerror = null;
    }

    script.onload = script.onreadystatechange = function() {

      if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
        done = true;
        script.onload = script.onreadystatechange = null;
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }
    }

    if (!head) {
      head = d.getElementsByTagName('head')[0];
    }

    head.appendChild(script);
  }

  function simple_jsonp(url, params, callbackname, callback, failback) {

    var
      uniqueName = callbackname + "_json" + (++json_counter),
      query = (url.match(/\?/) ? "&" : "?") + paramsToQuery(params)
    ;

    VitrineResponsiva[uniqueName] = {};

    if (typeof(failback) == "function") {
      // this will be used in load() for script.onerror
      VitrineResponsiva[uniqueName]["failback"] = failback;
      VitrineResponsiva[uniqueName]["timeout"] = setTimeout(function() {
        failback();
      }, timeout);
    }

    VitrineResponsiva[uniqueName]["cb"] = function(data) {
      clearTimeout(VitrineResponsiva[uniqueName]["timeout"]);
      callback(data);
      VitrineResponsiva[uniqueName] = null;
      try {
        delete VitrineResponsiva[uniqueName];
      } catch (e) {}
    }

    // se API precisar de um parametro diferente
    load(url + query + "&" + callbackname + "=VitrineResponsiva.", uniqueName);

    return "VitrineResponsiva." + uniqueName;
  }


  function paramsTo(params, prefix, and) {
    var query = [];
    params = params || {};
    for (key in params) {
      if (params.hasOwnProperty(key) && typeof params[key] !== "undefined") {
        query.push(key + "=" + prefix + encodeURIComponent(params[key]) + prefix);
      }
    }
    return query.join(and);
  }


  function paramsToQuery(params) {
    return paramsTo(params, '', '&');
  }


    var getJSON = function(url, successHandler, errorHandler) {
        var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        xhr.open('get', url, true);
        xhr.onreadystatechange = function() {
            var status;
            var data;
            // https://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
            if (xhr.readyState == 4) { // `DONE`
                status = xhr.status;
                if (status == 200) {
                    data = JSON.parse(xhr.responseText);
                    successHandler && successHandler(data);
                } else {
                    errorHandler && errorHandler(status);
                }
            }
        };
        xhr.send();
    }
                                  

  function hasClass(el, cls) {
    return el ? el.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)')) : false;
  }


  function addClass(ele, cls) {
    if (!hasClass(ele, cls)) {
      ele.className += " " + cls;
    }
  }


  function removeClass(ele, cls) {
    if (hasClass(ele, cls)) {
      var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)', 'g');
      ele.className = ele.className.replace(reg, '');
    }
  }


  function shuffle(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x) {};
    return o;
  }


  // function styleFromString(element, string) {
  //   var rules = string.split(';');
  //   for (i=rules.length; i--;) {
  //     var rule = rules[i].split(':');
  //     element.style[rule[0]] = rule[1];
  //   }
  // }


  function is_array(value) {
    return Object.prototype.toString.call(value) === "[object Array]";
  }


  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
      for (var i = (start || 0), j = this.length; i < j; i++) {
        if (this[i] === obj) {
          return i;
        }
      }
      return -1;
    }
  }

                                  
  // cross browser event handling
  function addEvent( el, type, fn ) {
    if ( window.addEventListener ) {
      el.addEventListener( type, fn, false );
    } else if ( window.attachEvent ) {
      el.attachEvent( "on" + type, fn );
    } else {
      var old = el["on" + type];
      el["on" + type] = function() { old(); fn(); };
    }
  }


  function removeElement(element) {
    element && element.parentNode && element.parentNode.removeChild(element);
  }


  function register_template(type, element) {
    html_templates[type] = element.innerHTML;
    removeElement(element.childNodes[0]);
  }


  function render_template(type, object) {
    var template = html_templates[type];
    for (key in object) {
      key_regex = new RegExp("{ " + key + " }", "g");
      template = template.replace(key_regex, object[key]);
    }
    return template;
  }


  function getStyle(oElm, strCssRule) {
    var strValue = "";
    if (oElm && d.defaultView && d.defaultView.getComputedStyle) {
      strValue = d.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
    } else if (oElm.currentStyle) {
      strCssRule = strCssRule.replace(/\-(\w)/g, function(strMatch, p1) {
        return p1.toUpperCase();
      });
      strValue = oElm.currentStyle[strCssRule];
    }
    return strValue;
  }


  function getStyleInt(el, rule) {
    return parseInt(getStyle(el, rule).replace("px", ""));
  }


  function slugify(to_slug) {
    var
    from = 'àáäãâèéëêìíïîòóöôõùúüûñç·/_,:;',
      to = 'aaaaaeeeeiiiiooooouuuunc------',
      i = 0,
      len = from.length,
      str = to_slug.toLowerCase();

    for (; i < len; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    return str.replace(/^\s+|\s+$/g, '') //trim
    .replace(/[^-a-zA-Z0-9\s]+/ig, '')
      .replace(/\s/gi, "-");
  }


  function formatMoney(number, currency) {
    if (number > 0) {
      var
      currency = currency_map[currency],
        n = currency.cents,
        x = 3,
        s = currency.mi,
        c = currency.cent,
        re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = parseInt(number).toFixed(Math.max(0, ~~n));

      return currency.abrv + (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
    } else {
      return "Consulte";
    }
  }


  // hide image and show text larger

  function imageError(el) {
    if (getInternetExplorerVersion() !== 8) {
      el.onerror = null;
      el.onload = null;
      el.src = el.getAttribute('rel');
      addClass(el.parentNode, "imgFailed");
      el.style.marginTop = "-" + el.style.height;
    }
  }


  // we are using this function to
  // change src to URL that was in rel
  // resize image depending on product name height

  function imageLoaded(element) {
    var original = element.getAttribute('data-original');

    if (original !== "{ thumb }" && element.src != original) {

      if (element.offsetHeight > 100) {
        original = original.replace(/T100x100/gi, "T200x200");
      }

//      element.setAttribute('data-', element.src);
      element.src = original;

      element.onload = null;

    }
  }


  // ------------------------------------------------------
  function Lomadee(service, params, callback) {

    var
      key = service + "/" + paramsToQuery(params),
      cached = client_cache[key]
    ;

    if (cached) {

      // has_nextpage = has_nextpagefn(cached);
      callback(cached);

    } else {

      params['sourceId'] = g_source_id;
                                  
      var protocol = ("https:" == window.location.protocol ? "https" : "http");

      var url = protocol + "://sandbox-api.lomadee.com/v2/" + appid + "/" + service + "?" + paramsToQuery(params);

      getJSON(url, function(obj) {
        client_cache[key] = obj;
        callback(obj);
      }, function() {
        document.body.style.display = "none";
      });

    }

  }


  // this function help us to remember last call data
  // to use in loading more itens...

  function onDemandServices(method, params, callback) {
    // inicia loading
    if (offers_spinner) {
      offers_spinner.spin(loading);
    } else {
      offers_spinner = new Spinner({
        color: "#d0d0d0",
        lines: 12
      }).spin(loading);
    }

    last_method = method;
    last_options = params;

    last_callback = function(o) {

      delayedSearchCallback(function() {
        // esconde loading
        offers_spinner.stop();
        callback(o);
      });

    }

    Lomadee(last_method, last_options, last_callback);
  }


  // TODO - executar delayed search no fail do jsonp

  function suggestionSearch(keyword) {

    // heartbeat p/ não executar de novo se ja estiver executando
    // isso faz com que uma segunda request fique no delayed_search
    searchHeartBeat(function() {

      keyword = slugify(keyword);

      if (keyword !== "") {

        onDemandServices("offer/_search", {
          keyword: keyword,
          size: g_results,
          page: 1
        }, function(o) {
          renderOffers(o.offers);
          renderPagination(o.pagination);
        });

      }

    });

  }


  function mouseSugst(type, el, index) {

    var suggestionHolder = el.parentNode.parentNode;

    if (type == 'out') {

      hover_suggest = false;
      el.className = "";

    } else {

      hover_suggest = true;

      if (hover_pos !== -1) {
        var element = suggestionHolder.getElementsByTagName('li')[hover_pos];
        if (element) {
          element.getElementsByTagName('a')[0].className = "";
        }
      }

      el.className = "hover";
      hover_pos = index;

    }

  }


  function selectSugst(el) {
    search_holder.value = el.innerHTML;
    suggestionSearch(el.innerHTML);
    return false;
  }


  function show(el) {
    el.style.display = "block";
  }


  function hide(el) {
    el.style.display = "none";
  }
                         
                         
  function autoCompleteCallback(data) {
    var value = search_holder.value;
    if (value.length == 1) {
      value = value + "%20";
    }

    delayed_suggestionCallback(function() {

      suggestions_spinner.stop();
      hide(suggestions_loading);

      var words = data["keywords"];

      if (words.length > 0 && has_focus) {
        var suggestion = [];
        for (var i = 0; i < words.length && i < max_suggestions; i++) {
          if (words[i] !== value) {
            suggestion.push(render_template("sugst", {
            word: words[i],
            index: i
          }));
          }
        }

        if (words.length == 1 && words[0] == value) {
          suggestionBoxHide();
        } else {
          suggestionBoxShow(suggestion.join(''));
        }
      }

      // usar valor digitado se digitou mais de 4 letras ou não tem autocompletar
      if (value.length > 4 || words[0] == undefined) {
        suggestionSearch(value);
      } else {
        // usa primeiro resultado do autocompletar
        suggestionSearch(words[0]);

        // define o primeiro resultado do autocompletar como "selecionado"
        hover_pos = 0;
        suggestions_holder.getElementsByTagName("a")[hover_pos].className = "hover";
      }

    });
  }


  function suggestionInstant(value) {
    value = slugify(value);

    if (value == '') {
      suggestionBoxHide();
    }

    if (value == '' || value == last_suggestion) {
      delayed_suggestionCallback(function() {});
      return false;
    }

    openTab(0);

    hover_pos = -1;
    last_suggestion = value;

    // inicia loading
    if (suggestions_spinner) {
      suggestions_spinner.spin(suggestions_loading);
    } else {
      suggestions_spinner = new Spinner({
        color: options["search"] || "#d0d0d0",
        lines: 10,
        lenght: 6,
        width: 2,
        radius: 1
      }).spin(suggestions_loading);
    }

    show(suggestions_loading);

    if (value.length == 1) {
      value = value + "%20";
    }
                         
    var subdomain = ("https:" == window.location.protocol ? "sbws" : "bws");
    var protocol = ("https:" == window.location.protocol ? "https:" : "http:");
                         
    var jsonp = document.createElement("script");
    jsonp.src = protocol + "//" + subdomain + ".buscape.com.br/service/autoComplete/mobile/664f4c566e534b707844553d/BR/?format=json&keyword=" + value + "&callback=VitrineResponsiva.autoCompleteCallback";
    document.body.appendChild(jsonp);
                         console.log(protocol);
  }


  // hearbeat = debounce

  // -- search-heartbeat

  function searchHeartBeat(fn) {
    if (search_has_heart_beat) {

      search_has_heart_beat = false;
      fn();

    } else {

      delayed_search = fn;

    }
  }


  function delayedSearchCallback(fn) {
    if (delayed_search) {

      var delayed_buffer = delayed_search;
      delayed_search = null;
      delayed_buffer();

    } else {

      fn();
      search_has_heart_beat = true;
    }
  }
  // -- search-heartbeat

  // --- suggestion-heartbeat

  function suggestionHeartBeat(fn) {
    if (suggestion_has_heart_beat) {

      suggestion_has_heart_beat = false;
      fn();

    } else {

      delayed_suggestion = fn;

    }
  }


  function delayed_suggestionCallback(fn) {
    if (delayed_suggestion) {

      var delayed_buffer = delayed_suggestion;
      delayed_suggestion = null;
      delayed_buffer();

    } else {

      fn();
      suggestion_has_heart_beat = true;

    }
  }

  // -- suggestion-heartbeat

  function suggestionHeartBeatKeyboard(fn) {
    if (suggestion_has_heart_beat_keyboard) {

      suggestion_has_heart_beat_keyboard = false;
      fn();

      setTimeout(function() {
        suggestion_has_heart_beat_keyboard = true;
      }, 200);
    }
  }

  //

  function suggestionBoxCommand(event) {

    if (event.keyCode == 38) {
      event.preventDefault && event.preventDefault();
    }

    if (sugst_scroll.style.display == "block") {

      suggestionHeartBeatKeyboard(function() {

        var elements = suggestions_holder.getElementsByTagName("a");

        if (elements) {
          switch (event.keyCode) {
            // p/ baixo
            case 40:
              if (hover_pos !== -1 && elements[hover_pos]) {
                elements[hover_pos].className = "";
              }

              if ((hover_pos + 1) < elements.length) {
                hover_pos++;
              } else {
                hover_pos = -1;
              }
              break;

              // p/ cima
            case 38:
              if (hover_pos !== -1 && elements[hover_pos]) {
                elements[hover_pos].className = "";
              }

              if (hover_pos > 0) {
                hover_pos--;
              } else {
                hover_pos = elements.length;
              }

              break;

            default:

          }

          if (event.keyCode == 40 || event.keyCode == 38) {

            if (hover_pos !== -1 && elements[hover_pos]) {
              search_holder.value = elements[hover_pos].innerHTML;
              elements[hover_pos].className = "hover";

//              iscroll_suggestion.scrollToElement(elements[hover_pos], 500, 0, -(((windowHeight() - header.offsetHeight) / 2) - 10));
            } else {
              search_holder.value = search_holder.getAttribute('rel');
            }

            suggestionSearch(search_holder.value);

          }

        }

      });

    }
  }


  function suggestionBoxShow(suggestionsContent) {
    hover_pos = -1;
    suggestions_holder.innerHTML = suggestionsContent;
    show(sugst_scroll);
    hide(scrollpanel);
  }


  function suggestionBoxHide() {
    hide(sugst_scroll);
    show(scrollpanel);
    last_suggestion = "";
  }


  function mouseOffer(action, element, id, title) {
    var
      details = element.childNodes[0],
      img = element.childNodes[1];

    if (action) {
      img.style.marginTop = "-" + img.style.height;
      img.style.opacity = "0.15";
      img.style.filter = "alpha(opacity=15)";

      show(details);

      // send to analytics only if more than 500ms over
      mouse_over_timeout = setTimeout(function() {
          analytics("send", "event", "Oferta-Over", id, title);
      }, 500);
    } else {
      if (!hasClass(element, 'imgFailed')) {
        img.style.marginTop = "0";
        hide(details);
      }
      img.style.opacity = "1";
      img.style.filter = "alpha(opacity=100)";

      clearTimeout(mouse_over_timeout);
    }
  }


  function renderOffers(o) {

    if (o && o[0]) {

      var
        render = [],
        expected_length = (g_results < o.length ? g_results : o.length);
    

      for (var i = 0; i < expected_length; i++) {

        var
          abrv = "BRL",
          installment = (o[i].installment && o[i].installment.quantity) ? o[i].installment.quantity + " x " + formatMoney(o[i].installment.value, abrv) : "&nbsp;",
          price = formatMoney(o[i].price, abrv)
        ;
                                  
        if (o[i].product.thumbnail && o[i].product.thumbnail.otherFormats[0]) {
          var thumbnail = o[i].product.thumbnail.otherFormats[0].url;
        } else {
          var thumbnail = o[i].thumbnail;
        }

        // in "link" we treat an issue with yql json when array size is 1
        render.push(render_template("offer", {
          link: o[i].link,
          thumb: thumbnail,
//          details: (price == slice ? "<strong>" + full_price + "</strong> - " : "") + o[i].name,
          "super duper big title product name": o[i].name.replace("Smartphone", ""),
          price: price,
          installment: installment,
          product_id: (o[i].product.id || 0),
          category_id: (o[i].category.id || 0),
          seller: o[i].store.name
        }).replace("data-onload", "onload"));

      }

      hide(bg_message);
//      console.log(render.join(""));
      offers_holder.innerHTML = render.join("");

    } else {
                         
      // não encontrou oferta
                         
      offers_holder.innerHTML = "";
      show(bg_message);
      bg_message.innerHTML = "Nenhum produto encontrado.";

      hide(pagination_previous);
      hide(pagination_next);

    }

  }


  // nova paginação - não fazer cache no dom pq tem client_cache do JSON

  function renderPagination(o) {

//    console.log(o);
    if (!o) {
        return false;
    }
    
    hide(pagination_previous);
    hide(pagination_next);

    if (o.page > 1) {
      show(pagination_previous);
    }

    if (o.totalPage > o.page) {
      show(pagination_next);
    }

  }

  function actionPagination(action) {

    analytics('send', 'event', 'Paginacao', action);
                                  
    if (action == "pre") {
      last_options.page = last_options.page - 1;
    } else {
      last_options.page = last_options.page + 1;
    }
                                  
    onDemandServices(last_method, last_options, last_callback);
                                  
  }


  // desenha menu lateral com "abas" de produtos

  function renderTabs() {

    var
    tabsContent = [];

    for (tab in tabs_ids) {
      // console.log(tabs_ids[tab]);
      // console.log(tabs_map[tabs_ids[tab].toString()]["n"]);
      tabsContent.push(render_template("tab", {
        id: tabs_ids[tab],
        name: tabs_map[tabs_ids[tab].toString()]
      }));
    }

    if (tabs_holder) {
      tabs_holder.innerHTML = tabsContent.join('');
    }

    openTab(tabs_ids[0]);

  }


  // abre uma aba

  function openTab(open_category, from_menu) {

    // clear swipe interval if click comes from menu tabs
    if (from_menu) {
      showing_tab = tabs_ids.indexOf(open_category);
    }

    var
    tabsChilds = tabs_holder ? tabs_holder.getElementsByTagName('li') : [];

    // limpa estilo dos links das abas
    for (var i = 0; i < tabsChilds.length; i++) {
      var
      text = tabsChilds[i].innerText ? tabsChilds[i].innerText : tabsChilds[i].textContent,
        id = tabsChilds[i]["id"].split("tab-")[1];

      text = text.replace(/\n/g, "");

      tabsChilds[i].innerHTML = ["<a onclick='VitrineResponsiva.openTab(\"", id, "\", true);VitrineResponsiva.analytics(\"send\", \"event\", \"Aba\", \"", id, "\", \"", text, "\");return false;' href='#'>", text, "</a>"].join('');
      tabsChilds[i].className = "";
    }

    // define o estilo de ativo da aba que esta aberta
    var tab = $("tab-" + open_category);
    if (tab) {
      tab.className = "current";
      tab.innerHTML = "<span>" + (tab.innerText ? tab.innerText : tab.textContent) + "</span>";
    }

    if (open_category) {
      findTab(open_category);
    }

  }


  // it is not really working :(

  function BWS_failback_failed() {
    hide(window.frameElement);
  }


  // procura no yql e manda renderizar

  function findTab(category) {

    var options = {
      page: 1,
      size: (g_results + 1),
      sourceId: g_source_id
    }

    // console.log(options);

    // hide pagination
    hide(pagination_previous);
    hide(pagination_next);

    // aqui dentro tem cache local
    // (para não bugar no onresize)
    if (category == "bestsellers") {
        var endpoint = "offer/_bestsellers";
    } else {
        var endpoint = "offer/_category/" + category;
    }

    onDemandServices(endpoint, options, function(o) {
//      console.log(o);
      renderOffers(o.offers);
      renderPagination(o.pagination);
    });

  }


  // limit input size to 6 chars as it should be rgb color in hex

  function hex_input(i) {
    return '#' + i.substr(0, 6);
  }


  function resetElementStyle(element) {
    // element.style.lineHeight = null;
    element.style.fontSize = null;
    element.style.width = null;
    element.style.height = null;
  }


  // essa parte roda dentro de um iframe sem src

  function renderWidget(options) {

    var
        custom_css = []
    ;
    
    g_country = options["country"] || "BR",
    g_source_id = options["sourceId"] || "35802480";

//    insertCss("THE_CSS_REPLACE");
    // d.body.innerHTML += 'THE_FRAME_REPLACE';

    search_holder = $("in_sx"),
    suggestions_loading = $("sx-loa"),
    suggestions_holder = $("sugst"),
    tabs_holder = $("aside"),
    sidebar = $("sidebar"),
    scrollpanel = $("scrollpa"),
    sugst_scroll = $("sugst_scroll"),
    offers_holder = $("offer"),
    footer = $("fotr"),
    header = $("headr"),
    entry = $("entry"),
    pagination_previous = $("pre"),
    pagination_next = $("nxt"),
    bg_message = $("msg"),
    loading = $("load");

    search_holder.value = search_holder.getAttribute('placeholder');

    register_template("sugst", suggestions_holder);
    register_template("tab", tabs_holder);

    addEvent(d.body, "mouseover", function() {
      ishover = true;
    });

    addEvent(d.body, "mouseout", function() {
      ishover = false;
    });

    addEvent(search_holder, "keydown", function(event) {
      if (!event) {
        event = window.event;
      }
      suggestionBoxCommand(event);
    });
                                  
    addEvent(search_holder, "keypress", function(event) {
      if (!event) {
        event = window.event;
      }
      suggestionBoxCommand(event);
    });

    addEvent(search_holder, "keyup", function(event) {

      if (!event) {
        event = window.event;
      }

      var donothing = {
        38: true,
        40: true,
        16: true,
        17: true,
        18: true,
        91: true,
        37: true,
        39: true,
        27: true,
        13: true
      };

      // se for alguma tecla diferente de p/ cima, p/ baixo, shift, alt, control, command, esc
      if (!donothing[event.keyCode]) {

        var value = this.value;
        this.setAttribute('rel', value);

        suggestionHeartBeat(function() {
          suggestionInstant(value);
        });

      }

      // esc
      if (event.keyCode == 27 || event.keyCode == 13) {
        search_holder.blur();
        suggestionBoxHide();
      }

      suggestion_has_heart_beat_keyboard = true;
    });

    addEvent(search_holder, "focus", function() {

      if (this.value == this.getAttribute('placeholder')) {
        this.value = "";
      }

      has_focus = true;

      suggestionHeartBeat(function() {
        suggestionInstant(search_holder.value);
      });
    });

    addEvent(search_holder, "blur", function() {
      has_focus = false;

      if (this.value == "") {
        this.value = this.getAttribute('placeholder');
      }

      if (!hover_suggest) {
        suggestionBoxHide();
      }
    });

    addEvent(pagination_previous, "click", function(event) {
      event.preventDefault();
      actionPagination("pre");
      return false;
    });

    addEvent(pagination_next, "click", function(event) {
      event.preventDefault();
      actionPagination("nxt");
      return false;
    });

    // !! render
    // a quantidade de colunas é ajustada no css
    
    var resizeCalc = function() {

      var
        // tamanho da tela
        available_width = windowWidth(),
        available_height = windowHeight(),

        // calcula padding do tabs holder
        sidebar_padding = getStyleInt(sidebar, "padding-top") + getStyleInt(sidebar, "padding-bottom");

      has_sidebar = getStyle(sidebar, "display") !== "none";
      has_space_for_pagination = available_width > 100;

      // use width to define max_suggestions (2 to phones : 6 screen)
      max_suggestions = (available_width <= 320) ? 2 : 6;

      if (available_width <= 363) {
        search_holder.setAttribute('placeholder', "Digite o produto, marca ou modelo.");
      }

      // menos a sidebar (se ela estiver na tela)
      available_width -= (getStyle(sidebar, "display") !== "none" ? sidebar.offsetWidth : 0)

      // menos bordas
      available_height -= 2;

      entry.style.height = available_height + "px";

      // ajusta tamanho da parte scrollavel do menu
      scrollpanel.style.height = (available_height - header.offsetHeight) + "px";

      // ajusta suggestion
      sugst_scroll.style.height = (available_height - header.offsetHeight) + "px";

      // undo any modification in template if its already set
      if (html_templates["offer"]) {
        offers_holder.innerHTML = html_templates["offer"];
      }
      
      var
        product_template = offers_holder.childNodes[0],
        product_width = product_template.offsetWidth
      ;

      // sum product margin in product height
      product_template.style.height = available_height + "px";

      // quantas linhas de produtos cabem?

      // ajusta altura da linha da paginacao
      pagination_next.style.lineHeight = available_height + "px";
      pagination_previous.style.lineHeight = available_height + "px";

      var
        available_space_cols = Math.max(Math.floor(available_width / product_width), 1)
                                  
      ;
//      console.log(available_space_lines);
//      console.log(available_space_cols);

      // usa calculo para saber quantos produtos carregar
      g_results = available_space_cols;

      // se bugar algo para de carregar
      if (!isFinite(g_results)) {
        return false;
      }

      register_template("offer", offers_holder);

      renderTabs();

      d.body.style.visibility = "visible";

    }
                                  
    resizeCalc();

  }


  // Returns the version of Internet Explorer or a -1
  // (indicating the use of another browser).

  function getInternetExplorerVersion() {
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer') {
      var ua = navigator.userAgent;
      var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
      if (re.exec(ua) != null)
        rv = parseFloat(RegExp.$1);
    }
    return rv;
  }


  function windowWidth() {
    if (window.innerWidth) {
      return window.innerWidth;
    } else if (d.documentElement && d.documentElement.clientWidth) {
      return d.documentElement.clientWidth;
    }
  }


  function windowHeight() {
    if (window.innerHeight) {
      return window.innerHeight;
    } else if (d.documentElement && d.documentElement.clientHeight) {
      return d.documentElement.clientHeight;
    }
  }
                                  
                                  
  function analytics(action, type, opt1, opt2, opt3) {
      if (typeof(ga) !== "undefined") {
        ga(action, type, opt1, opt2, opt3);
      }
  }


  return {
        autoCompleteCallback: autoCompleteCallback,
        selectSugst: selectSugst,
        mouseSugst: mouseSugst,
        renderWidget: renderWidget,
        imgLoad: imageLoaded,
        imgErr: imageError,
        mouseOfr: mouseOffer,
        openTab: openTab,
        analytics: analytics
  }

}(document));
              
// include lib/spin.js
