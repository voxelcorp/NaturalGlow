//ALL FUNCTIONS RELATED TO GRID NEED TO TRANSFERED TO THIS FILE
//RETRIEVE GRID FROM DB AND DISPLAY

var gridSettings = {
  user: document.getElementById("username"),
  gridOptions: {
    "2x2": {
      class: "twoByTwo",
      images: 4
    },
    "2x1": {
      class: "twoByOne",
      images: 2
    },
    "1x2": {
      class: "oneByTwo",
      images: 2
    },
    "1x1": {
      class: "oneByOne",
      images: 1
    },
    "1x2xST": {
      class: "oneByTwoST",
      images: 3
    },
    "1x2xSB": {
      class: "oneByTwoSB",
      images: 3
    },
    "2x1xSL": {
      class: "twoByOneSL",
      images: 3
    },
    "2x1xSR": {
      class: "twoByOneSR",
      images: 3
    },
  },
  showGridCreate: function () {
    //NEW GRID PATTERN FUNCTIONS
    var gridForm = document.getElementById("newGridForm");
    var sections = document.getElementById("sections");

    //EVENTS
    //Show grid options.
    var gridBtn = document.getElementById("openDesignImages");
    var grids = document.getElementById("gridTypesContent");
    var gridTypes = document.getElementsByClassName("gridType");
    var saveGridBtn = document.getElementById("saveGrid");

    if(gridBtn) {
      gridBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if(grids.classList.contains("fadeIn")) {
          hideDiv(grids);

          for(var i = 0; i < gridTypes.length; i++) {
            gridTypes[i].classList.add("noShow");
          }
        }else {
          openPopup(this, "gridTypesContent");
          showDiv(grids);

          for(var i = 0; i < gridTypes.length; i++) {
            gridTypes[i].classList.remove("noShow");
          }
        }
      });
    }


    //Grid UI.
    for(var i = 0; i < gridTypes.length; i++) {
      gridTypes[i].addEventListener("click", function (e) {
        e.preventDefault();
        var gridRatio = searchElement(this, "input", "gridRatio").value;
        gridSettings.createGrid(gridRatio, gridForm, sections);
        gridBtn.click();
        saveGridBtn.classList.remove("noShow");
      })
    }
  },
  retrieveGrids: async function () {
    var grids = await axios.get('/api/grids')
    .then((data) => {
      if(!data.data) {
        return [];
      }
      return data.data;
    })
    .catch((err) => {
      return err;
    });
    return grids;
  },
  //Shows user all the grids with available space to be jointed with selected cell.
  configEditGridOptions: function () {
    var logged = document.getElementById("loggedInfo");
    var gridCells = document.getElementsByClassName("albumContent");
    var gridsCount = document.getElementsByClassName("gridContainer").length;

    var createCellUI = function () {
      var html = "<div id='editCellUI'>";
      html += "<button name='splitCell' class='iconBtn alignCenter'><span class='material-icons'>call_split</span></button>";
      html += "<button name='removeCell' class='iconBtn alignCenter'><span class='material-icons'>delete</span></button>";
      if(gridsCount > 1) {
        html += "<button name='joinCell' class='iconBtn alignCenter'><span class='material-icons'>call_merge</span></button>";
      }
      html += "<button name='textCell' class='iconBtn alignCenter greenBtn'><span class='material-icons'>text_fields</span></button>";
      html += "<button name='patternCell' class='iconBtn alignCenter greenBtn'><span class='material-icons'>grid_on</span></button>";
      html += "</div>";

      return html;
    }

    var changeCell = async function (cell, url, jointGrid = null) {
      var cellImg = cell.childNodes[0].childNodes[2].childNodes[1].src.split("/")[4]; //Recovers img name from url.
      var grid = cell.parentNode;
      var gridOptions = gridSettings.gridOptions;
      var gridNewPattern = function (grid, patternType) {
        if(!patternType) {
          console.log("missing grid configurations.");
          return;
        }
        if(patternType == "split") {
          var cellDifference = -1;
        }else if(patternType == "joint")  {
          var cellDifference = 1;
        }
        if(grid.childNodes.length < 1) {
          return null;
        }
        for(gridType in gridOptions) {
          if(gridOptions[gridType].images == grid.childNodes.length + cellDifference) {
            return gridOptions[gridType].class;
          }
        }
      }

      var postData = {
        cellID: cell.id,
        cellTitle: cell.classList[1],
        cellImg: cellImg,
        gridID: grid.id,
        gridPattern: gridNewPattern(grid, "split")
      }
      if(jointGrid) {
        postData["jointGridID"] = jointGrid.id;
        postData["gridJointPattern"] = gridNewPattern(jointGrid, "joint");
      }
      await axios.post(url, postData)
      .then((data) => {
        gridSettings.displayGrid();
      })
      .catch((err) => {
        console.log(err);
      });

      for(layout in gridOptions) {
        if(gridOptions[layout].images == grid.childElementCount) {
          grid.className = "";
          grid.classList.add("grid");
          grid.classList.add(gridOptions[layout].class);
          break;
        }
      }
    }

    //JOINT CONFIG
    //When user clicks on a joint button all other grids smaller then 4 will be highlighted.
    var showJointingOptions = function (selectedCell) {
      for(var i = 0; i < gridCells.length; i++) {
        gridCells[i].classList.add("bannedUI");
        if(gridCells[i].parentNode.id != selectedCell.parentNode.id) {
          gridCells[i].parentNode.classList.add("highlightCell");
        }
      }
    }
    //Removes all changes after from jointing UI.
    var hideJointingOptions = function () {
      for(var i = 0; i < gridCells.length; i++) {
        gridCells[i].parentNode.classList.remove("highlightCell");
        gridCells[i].classList.remove("bannedUI");
      }
    }

    //Checks if user clicked on input and updates changes to db.
    var changeCellText = async function (cellText) {
      cellText.innerHTML = "<input type='text' id='cellNewTitle' value='"+cellText.innerHTML+"'>";

      if(cellText.childNodes.length == 1) {
        cellText.childNodes[0].addEventListener("click", async function (e) {
          e.stopImmediatePropagation();
          e.preventDefault();
          this.addEventListener("change", async function (e) {
            var cell = cellText.parentNode.parentNode.parentNode;
            var textChangeRes = await axios.post("/api/cell/gridInfo", {
              infoType: "title",
              cellID: cell.id,
              gridID: cell.parentNode.id,
              cellTitle: cell.classList[1],
              newTitle: this.value
            });
            if(textChangeRes.status == 200) {
              gridSettings.displayGrid();
            }else {
              window.alert("ERROR: " + textChangeRes.statusText);
            }
          });
        });
      }
    }

    //Get options for grid pattern changing.
    var getOptionsPerImage = function (imgNum, currentLayout) {
      var options = [];
      for(option in gridSettings.gridOptions) {
        var currentOption = gridSettings.gridOptions[option];
        if(currentOption.images == imgNum && currentOption.class != currentLayout) {
          options.push(currentOption.class);
        }
      }
      return options;
    }

    var jointingFirstClick = function (e) {
      e.stopImmediatePropagation();
      var selectedCell = this.parentNode.parentNode;
      this.removeEventListener("click", jointingFirstClick);
      document.addEventListener("click", jointingSecondClick(selectedCell, this), {once: true});

      showJointingOptions(selectedCell);
    }

    var jointingSecondClick = function (cell, btn) {
      var insideAction = function insideAction(e) {
        e.preventDefault();
        var clickedElement = e.target;
        var clickedCell = clickedElement.parentNode.parentNode.parentNode;
        //If user clicks on selected cell resets.
        if(clickedCell.parentNode.id == cell.parentNode.id) {
          hideJointingOptions();
          document.removeEventListener("click", insideAction);
          btn.addEventListener("click", jointingFirstClick);
          return;
        }

        //Clicked on "img" or "p" of cell.
        if(clickedCell.classList.contains("albumContent")) {
          var jointingGrid = clickedCell.parentNode;
          changeCell(cell, "/api/cell/joint", jointingGrid);
          return;
        //Clicked on "anchor" of cell.
        }else if(clickedCell.parentNode.classList.contains("albumContent")) {
          var jointingGrid = clickedElement.parentNode.parentNode;
          changeCell(cell, "/api/cell/joint", jointingGrid);
          return;
        }else if(clickedCell.classList.contains("grid")){
          var jointingGrid = clickedCell;
          changeCell(cell, "/api/cell/joint", jointingGrid);
          return;
        }else {
          hideJointingOptions();
          document.removeEventListener("click", insideAction);
          btn.addEventListener("click", jointingFirstClick);
          return;
        }
      }
      return insideAction;
    }

    var addUIEvents = function () {
      var removeCellBtns = document.getElementsByName("removeCell");
      var splitCellBtns = document.getElementsByName("splitCell");
      var joinCellBtns = document.getElementsByName("joinCell");
      var textCellBtns = document.getElementsByName("textCell");
      var patternCellBtns = document.getElementsByName("patternCell");

      for(var i = 0; i < splitCellBtns.length; i++) {
        splitCellBtns[i].addEventListener("click", function (e) {
          changeCell(this.parentNode.parentNode, "/api/cell/split");
        });
      }
      for(var i = 0; i < removeCellBtns.length; i++) {
        removeCellBtns[i].addEventListener("click", function (e) {
          changeCell(this.parentNode.parentNode, "/api/cell/remove");
          gridSettings.displayGrid();
        });
      }
      for(var i = 0; i < joinCellBtns.length; i++) {
        joinCellBtns[i].addEventListener("click", jointingFirstClick);
      }
      //GREEN BTNS
      //TEXT
      for(var i = 0; i < textCellBtns.length; i++) {
        textCellBtns[i].addEventListener("click", function (e) {
          e.stopImmediatePropagation();
          var cell = this.parentNode.parentNode;
          var cellText = cell.childNodes[0].childNodes[2].childNodes[0];
          var defaultCellHTML = cellText.innerHTML;
          //CHECK USER INPUT ACTION
          changeCellText(cellText);
          //Resets Cell if user clicks outside of input.
          document.addEventListener("click", function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();

            cellText.innerHTML = defaultCellHTML;
          }, {once: true});
        });
      }
      //PATTERN
      for(var i = 0; i < patternCellBtns.length; i++) {
        patternCellBtns[i].addEventListener("click", async function (e) {
          var grid = this.parentNode.parentNode.parentNode;
          console.log(grid);
          var gridLayout = grid.classList[1];
          if(gridLayout == "oneByOne" || gridLayout == "twoByTwo") {
            return;
          }

          var options = getOptionsPerImage(grid.childNodes.length, gridLayout);
          if(options.length > 1) {
            var randomOption = getRandomInt(0, grid.childNodes.length -1);
            var nextOption = options[randomOption];
          }else {
            var nextOption = options[0];
          }

          var patternChangesRes = await axios.post("/api/cell/gridInfo", {
            infoType: "pattern",
            gridID: grid.id,
            newPattern: nextOption,
          });
          if(patternChangesRes.status == 200) {
            gridSettings.displayGrid();
          }else {
            window.alert("ERROR: " + patternChangesRes.statusText);
          }

        });
      }
    }

    //EVENTS
    for(var i = 0; i < gridCells.length; i++) {
      gridCells[i].addEventListener("mouseenter", function (e) {
        if(!this.classList.contains("bannedUI")) {
          this.insertAdjacentHTML("beforeend", createCellUI());
          addUIEvents();
        }
      });
      gridCells[i].addEventListener("mouseleave", function (e) {
        let cellUI = document.getElementById("editCellUI");
        if(cellUI) {
          cellUI.remove();
        }
      });
    }
  },
  createGridHTML: function (grids) {
    if(!grids) {
      console.log("missing grids");
      return;
    }
    var html = "";
    //Creates grid box with attached pattern.
    for(var i = 0; i < grids.length; i++) {
      html += "<div class='gridContainer'><div class='grid "+grids[i].pattern+"' id='"+grids[i]._id+"'>";
      for(var x = 0; x < grids[i]["sections"].length; x++) {
        //Creates html for each section inside a grid box.
        var section = grids[i]["sections"][x];
        html += "<div class='albumContent "+section.title+"' id='"+section._id+"'><form method='post' action='/section' class='alignCenter'><input type='hidden' name='sectionTitle' value='"+section.title+"'><input type='hidden' name='sectionId' value='"+section._id+"'><button type='submit' class='alignCenter'><p>"+section.title+"</p><img src='/images/"+section.mainImg+"' class='containImg' loading='lazy'></button></form></div>";
      }
      html += "</div></div>";
    }
    return html;
  },
  displayGrid: function () {
    //Reset sections grid in homepage.
    gridSettings.retrieveGrids().then(function(grids) {
      var sectionsContainer = document.getElementById("sections");
      sectionsContainer.innerHTML = "";

      var gridHTML = gridSettings.createGridHTML(grids);
      sectionsContainer.innerHTML = gridHTML;
      if(gridSettings.user.value == 'admin') {
        gridSettings.configEditGridOptions();
      }
    });
  },
  //create grid html and add required functions to it.
  createGrid: function (gridType, form, content, choosenImg = null, edit = false) {
    var newGrid = document.getElementById("newAlbumGrid");
    if(newGrid) {
      resetForm(form);
      newGrid.remove();
    }
    //HTML GRID
    var html = "<div class='gridContainer' id='newAlbumGrid'><div class='grid "+gridSettings.gridOptions[gridType].class+"'>";
    for(var i = 0; i < gridSettings.gridOptions[gridType].images; i++) {

      if(choosenImg) {
        if(Array.isArray(choosenImg)) {
          for(var x = 0; x < choosenImg.length; x++) {
            html += "<div class='albumContent alignCenter albumBorder'><img src='"+choosenImg[x]+"' class='containImg' loading='lazy'></div>";
          }
          break;
        }else {
          html += "<div class='albumContent alignCenter albumBorder'><img src='"+choosenImg+"' class='containImg' loading='lazy'></div>";
        }
      }else {
        var imgID = "imgFile"+i;
        createNewFileInput(imgID, "imgFile", form);
        html += "<div id='imgContent"+i+"' class='albumContent alignCenter albumBorder'><label for='"+imgID+"' class='material-icons iconBtn'>add_circle_outline</label></div>";
      }
    }
    html += "</div></div>";
    if(choosenImg) {
      return html;
    }
    content.insertAdjacentHTML("beforeend", html);
    //---

    //GRID-CONFIGURATION
    //Store pattern.
    var patternInput = createTextInput("gridPattern", "pattern", form);
    patternInput.value = gridSettings.gridOptions[gridType].class;
    //When a new image is stored preview on grid pattern
    if(!choosenImg) {
      addPreviewImage(form);
    }
  }
};

if(gridSettings.user.value == 'admin') {
  gridSettings.configEditGridOptions();
}
gridSettings.showGridCreate();
