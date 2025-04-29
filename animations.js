document.querySelectorAll(".tabs a").forEach((tab) => {
  tab.addEventListener("click", function () {
    // Removes classname active from all tabs
    document
      .querySelectorAll(".tabs a")
      .forEach((t) => t.classList.remove("active"));
    // Hide all content divs
    document
      .querySelectorAll(".tab-content > div")
      .forEach((div) => (div.style.display = "none"));

    // Adds classname active to clicked tab
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
  const leftImg = document.getElementById("leftImg");
  const rightImg = document.getElementById("rightImg");

  // Animate doors sliding
  leftImg.style.animation = "shakeThenSlide 5s forwards";
  rightImg.style.animation = "rightSlide 5s forwards";

  // After sliding is done (after 5 seconds), start fading out
  setTimeout(() => {
    leftImg.style.transition = "opacity 1s";
    rightImg.style.transition = "opacity 1s";
    leftImg.style.opacity = "0";
    rightImg.style.opacity = "0";
  }, 4000); // start fade after sliding animation finishes

  // After fading is done, remove the overlay completely
  setTimeout(off, 5000);
}
