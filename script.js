function pubJSONToHTML(json) {
  console.log("HERE");
  var inner = json.publications.map(function(pub) {
    return (
      "<li>" +
      "<strong>" + pub.title + "</strong><br>" +
      pub.authors.map(function(authorId) {
        var website = json.coauthors[authorId].website;
        var author = json.coauthors[authorId].name;
        if (authorId === "me") {
          return "<em>" + author + "</em>";
        } else if (website) {
          return "<a href=\"" + website + "\" target=\"_blank\">" + author + "</a>";
        } else {
          return author;
        }
      }).join(", ") + "<br>" + pub.year + "<br>" +
      "<ul>" +
        (pub.arxiv ? "<a href=\"" + pub.arxiv + "\" target=\"_blank\">arxiv</a>" + "<br>" : "") +
        (pub.pdf ? "<a href=\"" + pub.pdf + "\" target=\"_blank\">pdf</a>" + "<br>" : "") +
      "</ul>" +
      "</li>"
    );
  }).join("");
  return "<ul id=\"publist\">" + inner + "</ul>";
}

$.getJSON("publications.json", function(json) {
  $("main#publications").html(pubJSONToHTML(json));
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

var pages = ["about", "publications"].map(function(name) {
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