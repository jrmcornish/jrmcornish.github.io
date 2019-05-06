"use strict";

function paperToHTML(paper) {
  let authorText = paper.authors.map(function(authorId) {
      if (authorId === "me") {
        return `<em class="me">Rob Cornish</em>`;
      } else {
        return authorId;
      }
    }).join(", ") 

  let contentType = paper.arxiv ? "arxiv" : "pdf";
  let contentURL;
  if (contentType === "arxiv") {
    contentURL = `https://arxiv.org/abs/${paper.arxiv}`;
  } else {
    contentURL = `pdf/${paper.id}.pdf`
  }

  let paperInfo = `<em>${(paper.pubinfo || "Preprint")}, ${paper.year.toString()}</em>`;

  let contentLink = `<a href="${contentURL}" target="_blank" class="util">${contentType}</a>`;

  let bibLink = `<a href="#" id="toggle-${paper.id}" class="bibLink util">bib</a>`

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
      <div id="${paper.id}-bib" class="codeblock">
        <code><pre>${paper.bib}</pre></code>
      </div>
    </li>
  `;
}

// sortDir > 0 to sort papers descending by year
function papersToHTML(papers, sortBy, cmp, sortDir) {
  let [html, _] = papers.reduce(function([html, prevPaper], paper) {
    let sortVal = paper[sortBy];
    let prevSortVal = prevPaper === undefined ? undefined : prevPaper[sortBy];

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
  let order = ["conference", "workshop", "preprint"]
  return order.indexOf(paper1.type) - order.indexOf(paper2.type);
}

function papersStableSort(cmp) {
  let papers = window.papersData;
  papers.sort((a, b) => {
    let result = window.papersSortDir * cmp(a, b);
    if (result === 0) {
      return papers.indexOf(a) - papers.indexOf(b);
    }
    return result;
  });
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

  papersStableSort(altCmp);
  papersStableSort(cmp);

  $("#paperlist").html(papersToHTML(window.papersData, window.papersSortBy, cmp, window.window.papersSortDir));

  $("#paperlist .bibLink").each(function (i, elt) {
    let id = elt.id.replace("toggle-", "");
    elt.addEventListener("click", function(e) {
      e.preventDefault();
      $(`#${id}-bib`).toggle();
    });
  });
}

function renderSortLinks() {
  ["year", "type"].forEach((sortBy) => {
    let text = `Sort by ${sortBy}`;
    if (window.papersSortBy === sortBy) {
      text += " " + (window.papersSortDir > 0 ? "↓" : "↑");
    }
    $(`#sort-by-${sortBy}`).html(text);
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

    $("#papers").html(`
      <ul id="sort-options">
        <li><a href="#" id="sort-by-year" class="util"></a></li>
        <li><a href="#" id="sort-by-type" class="util"></a></li>
      </ul>
      <ul id="paperlist">
      </ul>
    `);

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
  page.navLink.addEventListener("click", function () {
    navTo(page);
  });
});

navTo(pages[0]);

/////// 

$("#email").on("click", (e) => {
  e.preventDefault();
  let address = ["rcornish", "@", "robots.", "ox.", "ac.", "uk"].join("");
  $("#email")
    .html(address)
    .attr("href", `mailto:${address}`);
})