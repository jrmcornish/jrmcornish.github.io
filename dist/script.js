"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function paperToHTML(paper) {
  var authorText = paper.authors.map(function (authorId) {
    if (authorId === "me") {
      return "<em class=\"me\">Rob Cornish</em>";
    } else {
      return authorId;
    }
  }).join(", ");

  var contentType = paper.arxiv ? "arxiv" : "pdf";
  var contentURL = void 0;
  if (contentType === "arxiv") {
    contentURL = "https://arxiv.org/abs/" + paper.arxiv;
  } else {
    contentURL = "pdf/" + paper.id + ".pdf";
  }

  var paperInfo = "<em>" + (paper.pubinfo || "Preprint") + ", " + paper.year.toString() + "</em>";

  var contentLink = "<a href=\"" + contentURL + "\" target=\"_blank\" class=\"util\">" + contentType + "</a>";

  var bibLink = "<a href=\"#\" id=\"toggle-" + paper.id + "\" class=\"bibLink util\">bib</a>";

  var codeItem = paper.code ? "<li><a href=\"" + paper.code + "\" target=\"_blank\" class=\"util\">code</a></li>" : "";

  var slidesItem = paper.slides ? "<li><a href=\"pdf/" + paper.id + "_slides.pdf\" target=\"_blank\" class=\"util\">slides</a></li>" : "";

  return "\n    <li>\n      <ul>\n        <li><strong>" + paper.title + "</strong></li>\n        <li>" + authorText + "</li>\n        <li>" + paperInfo + "</li>\n      </ul>\n      <ul class=\"paperlinks\">\n        <li>" + contentLink + "</li>\n        <li>" + bibLink + "</li>\n        " + codeItem + "\n        " + slidesItem + "\n      </ul>\n      <div id=\"" + paper.id + "-bib\" class=\"bib-data\">\n        <div class=\"copy-bib\">\n          <a href=\"#\" class=\"util\">Copy to clipboard</a>\n        </div>\n        <code><pre>" + paper.bib + "</pre></code>\n      </div>\n    </li>\n  ";
}

// sortDir > 0 to sort papers descending by year
function papersToHTML(papers, sortBy, cmp, sortDir) {
  var _papers$reduce = papers.reduce(function (_ref, paper) {
    var _ref2 = _slicedToArray(_ref, 2),
        html = _ref2[0],
        prevPaper = _ref2[1];

    var sortVal = paper[sortBy];
    var prevSortVal = prevPaper === undefined ? undefined : prevPaper[sortBy];

    var result = "";
    if (prevSortVal === undefined || sortDir * cmp(prevPaper, paper) < 0) {
      result += "<h2>" + sortVal + "</h2>";
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
}

// Can only copy from visible elements, so we use this hack
// See here: https://stackoverflow.com/questions/22581345/click-button-copy-to-clipboard-using-jquery#answer-30905277
function copyToClipboard(text) {
  var $temp = $("<textarea>");
  $("body").append($temp);
  $temp.val(text).select();
  document.execCommand("copy");
  $temp.remove();
}

function renderPapers() {
  var cmp = void 0,
      altCmp = void 0;
  if (window.papersSortBy === "year") {
    cmp = cmpByYear;
    altCmp = cmpByType;
  } else {
    cmp = cmpByType;
    altCmp = cmpByYear;
  }

  // stableSort(window.papersData, altCmp, 1);
  stableSort(window.papersData, cmp, window.papersSortDir);

  $("#paperlist").html(papersToHTML(window.papersData, window.papersSortBy, cmp, window.window.papersSortDir));

  $("#paperlist .bibLink").each(function (i, elt) {
    var id = elt.id.replace(/^toggle-/, "");

    $("#" + id + "-bib").hide();

    elt.addEventListener("click", function (e) {
      e.preventDefault();
      $("#" + id + "-bib").toggle();
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
    var div = $("#sort-by-" + sortBy + " .sort-arrow");
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

function addBibLinks(papers, i, cont) {
  $.get("bib/" + papers[i].id + ".bib", function (text) {
    papers[i].bib = text;
    i += 1;
    if (i < papers.length) {
      addBibLinks(papers, i, cont);
    } else {
      cont(papers);
    }
  }, "text");
}

$.getJSON("papers.json", function (papers) {
  addBibLinks(papers, 0, function (papers) {
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
  });
});

////////

function Page(name) {
  this.navLink = document.getElementById("nav-" + name);
  this.main = document.getElementById(name);

  this.select = function () {
    this.navLink.classList.add("selected");
    this.main.hidden = false;
  };

  this.unselect = function () {
    this.navLink.classList.remove("selected");
    this.main.hidden = true;
  };
}

var pages = ["about", "papers"].map(function (name) {
  return new Page(name);
});

function navTo(page) {
  pages.forEach(function (otherPage) {
    otherPage.unselect();
  });
  page.select();
}

pages.forEach(function (page) {
  page.navLink.addEventListener("click", function (e) {
    e.preventDefault();
    navTo(page);
  });
});

navTo(pages[0]);

/////// 

$("#email").on("click", function (e) {
  e.preventDefault();
  var address = ["rcornish", "@", "robots.", "ox.", "ac.", "uk"].join("");
  $("#email").html(address).attr("href", "mailto:" + address);
});