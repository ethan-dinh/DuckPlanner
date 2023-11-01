// Function to dynamically adjust column widths
function adjustColumnWidths() {
  const table = document.getElementById("schedulerTable");
  const colgroup = document.getElementById("columnGroup");
  const numColumns = table.rows[0].cells.length;

  // Clear any existing col elements in the colgroup
  while (colgroup.firstChild) {
      colgroup.removeChild(colgroup.firstChild);
  }

  // Assuming the time column (first column) will have a fixed width.
  const timeColumnWidth = "50px"; // Adjust as required
  const otherColumnsWidthPercentage = (100 - (parseFloat(timeColumnWidth) / table.offsetWidth * 100)) / (numColumns - 1);

  // Set the calculated column width for all columns
  for (let i = 0; i < numColumns; i++) {
      const col = document.createElement("col");
      if (i === 0) {
          col.style.width = timeColumnWidth;
      } else {
          col.style.width = `${otherColumnsWidthPercentage}%`;
      }
      colgroup.appendChild(col);
  }
}


// Function to adjust the height of #classCodeTable
function adjustTableHeight() {
  const container = document.getElementById("dynamicHeightContainer");
  const tablePosition = container.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  
  const adjustedHeight = windowHeight - tablePosition.top - 80;
  container.style.height = adjustedHeight + "px";
}
  
// Call the adjustColumnWidths function initially and when the window is resized
window.addEventListener("resize", adjustColumnWidths);
  
// Call the adjustColumnWidths function after the page has loaded
window.addEventListener("load", function () {
  adjustColumnWidths();
});

// Add an event listener to the search input field
const searchInput = document.getElementById("classSearch");
searchInput.addEventListener("input", adjustTableHeight);

// Call the adjustTableHeight function initially and when the window is resized
window.addEventListener("resize", adjustTableHeight);
adjustTableHeight(); // Call it initially
  