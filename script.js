"use strict";

function pubJSONToHTML(pubs) {
  var inner = pubs.publications.map(function(pub) {

    let authorText = pub.authors.map(function(authorId) {
        var website = pubs.coauthors[authorId].website;
        var author = pubs.coauthors[authorId].name;
        if (authorId === "me") {
          return `<em>${author}</em>`;
        } else if (website) {
          return `<a href="${website}" target="_blank">${author}</a>`;
        } else {
          return author;
        }
      }).join(", ") 
    
    let contentType = pub.arxiv ? "arxiv" : "pdf";
    let contentURL;
    if (contentType === "arxiv") {
      contentURL = `https://arxiv.org/abs/${pub.arxiv}`;
    } else {
      contentURL = `pdf/${pub.id}.pdf`
    }

    let contentLink = `<a href="${contentURL}" target="_blank">${contentType}</a>`;

    let bibLink = `<a href="#" id="toggle-${pub.id}" class="bibLink">bib</a>`

    return `
      <li>
        <ul class="pubinfo">
          <li><strong>${pub.title}</strong></li>
          <li>${authorText}</li>
          <li>${pub.year}</li>
        </ul>
        <ul class="publinks">
          <li>${contentLink}</li>
          <li>${bibLink}</li>
        </ul>
        <div id="${pub.id}" class="codeblock">
          <code><pre>${pub.bib}</pre></code>
        </div>
      </li>
    `;
  }).join("");
  return `<ul id="publist">${inner}</ul>`;
}

function addBibLinks(pubs, i, cont) {
  $.get(`bib/${pubs.publications[i].id}.bib`, function(text) {
    pubs.publications[i].bib = text;
    i += 1;
    if (i < pubs.publications.length) {
      addBibLinks(pubs, i, cont);
    } else {
      cont(pubs);
    }
  }, `text`)
}

function renderPubs(pubs) {
  $("main#pubs").html(pubJSONToHTML(pubs));

  $("ul#publist .bibLink").each(function (i, elt) {
    let id = elt.id.replace("toggle-", "");
    elt.addEventListener("click", function() {
      $(`ul#publist #${id}`).toggle();
    });
  });
}


$.getJSON("pubs.json", function(pubs) {
  addBibLinks(pubs, 0, renderPubs);
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

var pages = ["about", "pubs"].map(function(name) {
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