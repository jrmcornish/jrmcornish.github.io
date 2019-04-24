function pubJSONToHTML(json) {
  console.log("HERE");
  var inner = json.publications.map(function(pub) {

    let authorText = pub.authors.map(function(authorId) {
        var website = json.coauthors[authorId].website;
        var author = json.coauthors[authorId].name;
        if (authorId === "me") {
          return `<em>${author}</em>`;
        } else if (website) {
          return `<a href="${website}" target="_blank">${author}</a>`;
        } else {
          return author;
        }
      }).join(", ") 
    
    let contentType = pub.arxiv ? "arxiv" : "pdf";
    let contentLink = `<a href="${pub[contentType]}" target="_blank">${contentType}</a>`;

    let bibLink = `<a href="#">bib</a>`

    return (
      `
      <li>
        <strong>${pub.title}</strong><br>
        ${authorText}<br>
        ${pub.year}<br>
        <ul>
          <li>${contentLink}</li>
          <li>${bibLink}</li>
        </ul>
      </li>
      `
    );
  }).join("");
  return `<ul id="publist">${inner}</ul>`;
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