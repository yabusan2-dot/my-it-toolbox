const pageFlip = new St.PageFlip(document.getElementById("book"), {
  width: 400,
  height: 400,
  showCover: true,
});

pageFlip.loadFromHTML(document.querySelectorAll(".my-page"));