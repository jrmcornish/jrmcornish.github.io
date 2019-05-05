"use strict";

function papersJSONToHTML(papers) {
  // Stable sort papers by year
  papers.papers.sort((a, b) => {
    let result = b.year - a.year;
    if (result === 0) {
      return papers.papers.indexOf(a) - papers.papers.indexOf(b);
    }
    return result;
  })

  var inner = papers.papers.map(function(paper) {

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

    let paperInfo = `<em>${(paper.paperinfo || "Preprint")}, ${paper.year.toString()}</em>`;

    let contentLink = `<a href="${contentURL}" target="_blank">${contentType}</a>`;

    let bibLink = `<a href="#" id="toggle-${paper.id}" class="bibLink">bib</a>`

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
  }).join("");
  return `<ul id="paperlist">${inner}</ul>`;
}

function addBibLinks(papers, i, cont) {
  $.get(`bib/${papers.papers[i].id}.bib`, function(text) {
    papers.papers[i].bib = text;
    i += 1;
    if (i < papers.papers.length) {
      addBibLinks(papers, i, cont);
    } else {
      cont(papers);
    }
  }, `text`)
}

function renderPapers(papers) {
  $("main#papers").html(papersJSONToHTML(papers));

  $("ul#paperlist .bibLink").each(function (i, elt) {
    let id = elt.id.replace("toggle-", "");
    elt.addEventListener("click", function(e) {
      e.preventDefault();
      $(`#${id}-bib`).toggle();
    });
  });
}


$.getJSON("papers.json", function(papers) {
  addBibLinks(papers, 0, renderPapers);
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

navTo(pages[1]);