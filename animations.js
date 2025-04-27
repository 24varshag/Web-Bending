window.onload = function () {
  on(); // Show overlay
  setTimeout(slideDoors, 500); // Slide doors after a short delay (optional)
};

document.querySelectorAll(".tabs a").forEach((tab) => {
  tab.addEventListener("click", function () {
    // Remove 'active' from all tabs
    document
      .querySelectorAll(".tabs a")
      .forEach((t) => t.classList.remove("active"));
    // Hide all content divs
    document
      .querySelectorAll(".tab-content > div")
      .forEach((div) => (div.style.display = "none"));

    // Add 'active' to clicked tab
    this.classList.add("active");
    // Show corresponding content
    const tabId = this.getAttribute("data-tab");
    document.getElementById(tabId).style.display = "block";
  });
});

function on() {
  document.getElementById("overlay").style.display = "flex";
}

function off() {
  document.getElementById("overlay").style.display = "none";
}

function slideDoors() {
  // moving left door
  document.getElementById("leftImg").style.animation = "shakeThenSlide 5s";
  // moving right door
  document.getElementById("rightImg").style.animation = "rightSlide 5s";
  setTimeout(off, 5000);
}
