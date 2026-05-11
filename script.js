"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var BIBTEX_LOADING_MESSAGE = "Loading...";

function paperToHTML(paper) {
  var authorText = paper.authors.map(function (authorId) {
    if (authorId === "me") {
      return "<em class=\"me\">Rob Cornish</em>";
    } else {
      return authorId;
    }
  }).join(", ");
  var contentType = paper.arxiv ? "arxiv" : "pdf";
  var contentURL;

  if (contentType === "arxiv") {
    contentURL = "https://arxiv.org/abs/".concat(paper.arxiv);
  } else {
    contentURL = "pdf/".concat(paper.id, ".pdf");
  }

  var paperInfo = "<em>".concat(paper.pubinfo || "Preprint", ", ").concat(paper.year.toString(), "</em>");
  var contentLink = "<a href=\"".concat(contentURL, "\" target=\"_blank\" class=\"util\">").concat(contentType, "</a>");
  var bibLink = "<a href=\"#\" id=\"toggle-".concat(paper.id, "\" class=\"bibLink util\">bib</a>");
  var codeItem = paper.code ? "<li><a href=\"".concat(paper.code, "\" target=\"_blank\" class=\"util\">code</a></li>") : "";
  var slidesItem = paper.slides ? "<li><a href=\"pdf/".concat(paper.id, "_slides.pdf\" target=\"_blank\" class=\"util\">slides</a></li>") : "";
  var talkItem = paper.talk ? "<li><a href=\"".concat(paper.talk, "\" target=\"_blank\" class=\"util\">video</a></li>") : "";
  var posterItem = paper.poster ? "<li><a href=\"pdf/".concat(paper.id, "_poster.pdf\" target=\"_blank\" class=\"util\">poster</a></li>") : "";
  return "\n    <li>\n      <ul>\n        <li><strong>".concat(paper.title, "</strong></li>\n        <li>").concat(authorText, "</li>\n        <li>").concat(paperInfo, "</li>\n      </ul>\n      <ul class=\"paperlinks\">\n        <li>").concat(contentLink, "</li>\n        <li>").concat(bibLink, "</li>\n        ").concat(codeItem, "\n        ").concat(slidesItem, "\n        ").concat(talkItem, "\n        ").concat(posterItem, "\n      </ul>\n      <div id=\"").concat(paper.id, "-bib\" class=\"bib-data\">\n        <div class=\"copy-bib\">\n          <a href=\"#\" class=\"util\">Copy to clipboard</a>\n        </div>\n        <code><pre id=\"").concat(paper.id, "-bib-data\">").concat(BIBTEX_LOADING_MESSAGE, "</pre></code>\n      </div>\n    </li>\n  ");
} // sortDir > 0 to sort papers descending by year


function papersToHTML(papers, sortBy, cmp, sortDir) {
  var _papers$reduce = papers.reduce(function (_ref, paper) {
    var _ref2 = _slicedToArray(_ref, 2),
        html = _ref2[0],
        prevPaper = _ref2[1];

    var sortVal = paper[sortBy];
    var prevSortVal = prevPaper === undefined ? undefined : prevPaper[sortBy];
    var result = "";

    if (prevSortVal === undefined || sortDir * cmp(prevPaper, paper) < 0) {
      result += "<h2>".concat(sortVal, "</h2>");
    }

    result += paperToHTML(paper);
    return [html + result, paper];
  }, ["", undefined]),
      _papers$reduce2 = _slicedToArray(_papers$reduce, 2),
      html = _papers$reduce2[0],
      _ = _papers$reduce2[1];

  return html;
}

function cmpByYear(paper1, paper2) {
  return paper2.year - paper1.year;
}

function cmpByType(paper1, paper2) {
  var order = ["conference", "workshop", "preprint"];
  return order.indexOf(paper1.type) - order.indexOf(paper2.type);
}

function stableSort(arr, cmp, sortDir) {
  arr.sort(function (a, b) {
    var result = sortDir * cmp(a, b);

    if (result === 0) {
      return arr.indexOf(a) - arr.indexOf(b);
    }

    return result;
  });
} // Can only copy from visible elements, so we use this hack
// See here: https://stackoverflow.com/questions/22581345/click-button-copy-to-clipboard-using-jquery#answer-30905277


function copyToClipboard(text) {
  var $temp = $("<textarea>");
  $("body").append($temp);
  $temp.val(text).select();
  document.execCommand("copy");
  $temp.remove();
}

function renderPapers() {
  var cmp, altCmp;

  if (window.papersSortBy === "year") {
    cmp = cmpByYear;
    altCmp = cmpByType;
  } else {
    cmp = cmpByType;
    altCmp = cmpByYear;
  } // stableSort(window.papersData, altCmp, 1);


  stableSort(window.papersData, cmp, window.papersSortDir);
  $("#paperlist").html(papersToHTML(window.papersData, window.papersSortBy, cmp, window.window.papersSortDir));
  $("#paperlist .bibLink").each(function (i, elt) {
    var id = elt.id.replace(/^toggle-/, "");
    $("#".concat(id, "-bib")).hide();
    elt.addEventListener("click", function (e) {
      e.preventDefault(); // Lazily load bib data

      var selector = "#".concat(id, "-bib-data");

      if ($(selector).html() === BIBTEX_LOADING_MESSAGE) {
        $.get("bib/".concat(id, ".bib"), "", function (data) {
          return $(selector).html(data);
        }, "text");
      }

      $("#".concat(id, "-bib")).toggle();
    });
  });
  $(".bib-data").each(function (i, elt) {
    var id = elt.id.replace(/-bib$/, "");
    $(elt).on("click", ".copy-bib a", function (e) {
      e.preventDefault();
      var text = $(elt).find("pre").html();
      copyToClipboard($.trim(text));
    });
  });
}

function renderSortLinks() {
  var arrow = window.papersSortDir > 0 ? "↓" : "↑";
  ["year", "type"].forEach(function (sortBy) {
    var div = $("#sort-by-".concat(sortBy, " .sort-arrow"));
    div.html(arrow);

    if (window.papersSortBy === sortBy) {
      div.css("visibility", "visible");
    } else {
      div.css("visibility", "hidden");
    }
  });
}

function setSortBy(sortBy) {
  if (window.papersSortBy === sortBy) {
    window.papersSortDir *= -1;
  } else {
    window.papersSortDir = 1;
  }

  window.papersSortBy = sortBy;
}

function updatePapers(sortBy) {
  setSortBy(sortBy);
  renderSortLinks();
  renderPapers();
}

$.getJSON("papers.json", function (papers) {
  window.papersData = papers;
  $("#sort-by-year").on("click", function (e) {
    e.preventDefault();
    updatePapers("year");
  });
  $("#sort-by-type").on("click", function (e) {
    e.preventDefault();
    updatePapers("type");
  });
  updatePapers("year");
}); ////////
// Navigation code removed - now using separate HTML files
/////// 

$("#email").on("mouseover", function (e) {
  e.preventDefault();
  var address = ["rob", ".", "cornish", "@", "ntu", ".", "edu", ".", "sg"].join("");
  $("#email").attr("href", "mailto:".concat(address));
});