"use strict";

function paperToHTML(paper) {
  const authorText = paper.authors.map(function(authorId) {
      if (authorId === "me") {
        return `<em class="me">Rob Cornish</em>`;
      } else {
        return authorId;
      }
    }).join(", ") 

  const contentType = paper.arxiv ? "arxiv" : "pdf";
  let contentURL;
  if (contentType === "arxiv") {
    contentURL = `https://arxiv.org/abs/${paper.arxiv}`;
  } else {
    contentURL = `pdf/${paper.id}.pdf`
  }

  const paperInfo = `<em>${(paper.pubinfo || "Preprint")}, ${paper.year.toString()}</em>`;

  const contentLink = `<a href="${contentURL}" target="_blank" class="util">${contentType}</a>`;

  const bibLink = `<a href="#" id="toggle-${paper.id}" class="bibLink util">bib</a>`

  return `
    <li>
      <ul>
        <li><strong>${paper.title}</strong></li>
        <li>${authorText}</li>
        <li>${paperInfo}</li>
      </ul>
      <ul class="paperlinks">
        <li>${contentLink}</li>
        <li>${bibLink}</li>
      </ul>
      <div id="${paper.id}-bib" class="bib-data">
        <div class="copy-bib">
          <a href="#" class="util">Copy to clipboard</a>
        </div>
        <code><pre>${paper.bib}</pre></code>
      </div>
    </li>
  `;
}

// sortDir > 0 to sort papers descending by year
function papersToHTML(papers, sortBy, cmp, sortDir) {
  const [html, _] = papers.reduce(function([html, prevPaper], paper) {
    const sortVal = paper[sortBy];
    const prevSortVal = prevPaper === undefined ? undefined : prevPaper[sortBy];

    let result = "";
    if (prevSortVal === undefined || sortDir * cmp(prevPaper, paper) < 0) {
      result += `<h2>${sortVal}</h2>`
    }
    result += paperToHTML(paper);

    return [html + result, paper];
  }, ["", undefined]);

  return html;
}

function cmpByYear(paper1, paper2) {
  return paper2.year - paper1.year;
}

function cmpByType(paper1, paper2) {
  const order = ["conference", "workshop", "preprint"]
  return order.indexOf(paper1.type) - order.indexOf(paper2.type);
}

function stableSort(arr, cmp, sortDir) {
  arr.sort((a, b) => {
    const result = sortDir * cmp(a, b);
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
  let cmp, altCmp;
  if (window.papersSortBy === "year") {
    cmp = cmpByYear;
    altCmp = cmpByType;
  } else {
    cmp = cmpByType;
    altCmp = cmpByYear;
  }

  stableSort(window.papersData, altCmp, 1);
  stableSort(window.papersData, cmp, window.papersSortDir);

  $("#paperlist").html(papersToHTML(window.papersData, window.papersSortBy, cmp, window.window.papersSortDir));

  $("#paperlist .bibLink").each((i, elt) => {
    const id = elt.id.replace(/^toggle-/, "");

    $(`#${id}-bib`).hide();

    elt.addEventListener("click", e => {
      e.preventDefault();
      $(`#${id}-bib`).toggle();
    });
  });

  $(".bib-data").each((i, elt) => {
    const id = elt.id.replace(/-bib$/, "");
    $(elt).on("click", ".copy-bib a", e => {
      e.preventDefault();
      const text = $(elt).find("pre").html();
      copyToClipboard($.trim(text));
    });
  });
}

function renderSortLinks() {
  const arrow = window.papersSortDir > 0 ? "↓" : "↑";

  ["year", "type"].forEach((sortBy) => {
    const div = $(`#sort-by-${sortBy} .sort-arrow`);
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
  $.get(`bib/${papers[i].id}.bib`, function(text) {
    papers[i].bib = text;
    i += 1;
    if (i < papers.length) {
      addBibLinks(papers, i, cont);
    } else {
      cont(papers);
    }
  }, `text`)
}

$.getJSON("papers.json", function(papers) {
  addBibLinks(papers, 0, (papers) => {
    window.papersData = papers;

    $(`#sort-by-year`).on("click", (e) => {
      e.preventDefault();
      updatePapers("year");
    });

    $(`#sort-by-type`).on("click", (e) => {
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

  this.select = function() {
    this.navLink.classList.add("selected");
    this.main.hidden = false;
  };

  this.unselect = function () {
    this.navLink.classList.remove("selected");
    this.main.hidden = true;
  };
}

var pages = ["about", "papers"].map(function(name) {
    return new Page(name);
});

function navTo(page) {
  pages.forEach(function (otherPage) {
    otherPage.unselect();
  })
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

$("#email").on("click", (e) => {
  e.preventDefault();
  const address = ["rcornish", "@", "robots.", "ox.", "ac.", "uk"].join("");
  $("#email")
    .html(address)
    .attr("href", `mailto:${address}`);
})