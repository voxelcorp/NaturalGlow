//INGREDIENTS
//GLOBAL VARS
var mongoose = require('mongoose');
var library = require('../controllers/library');
var axios = require('axios');
var Grid = mongoose.model("Grid");

//-----

//FUNCTIONS
var arrangeSections = function (sections, imgs) {
  if(!sections|| !imgs) {
    console.log("corrupted information");
    return [];
  }
  var gridSections = new Array();

  if(Array.isArray(sections)) {
    for(var i = 0; i < sections.length; i++) {
      gridSections.push({
        mainImg: imgs[i],
        title: sections[i]
      });
    }
  }else {
    gridSections.push({
      mainImg: imgs,
      title: sections
    });
  }
  return gridSections;
}

var createNewGrid = async function (req, res) {
  var newGrid = new Grid();
  if(req.body.imgLocation) { //CREATE NEW GRID
    var storedSection = arrangeSections(req.body.name, req.body.imgLocation);
    newGrid.pattern = req.body.pattern;

    for(var i = 0; i < storedSection.length; i++) {
      newGrid.sections.push({
        _id: mongoose.Types.ObjectId(),
        mainImg: storedSection[i].mainImg,
        title: storedSection[i].title,
      });
    }
  }else { //SPLIT EXISITING GRID
    newGrid.pattern = "oneByOne";

    newGrid.sections.push({
      _id: mongoose.Types.ObjectId(req.body.cellID),
      mainImg: req.body.cellImg,
      title: req.body.cellTitle
    });
  }

  newGrid.save(function (err) {
    if(err) {
      console.log(err);
      library.sendJsonResponse(res, 401, err);
      return;
    }
  });
}

var removeSectionFromDb = async function (res, sectionInfo) {
  var findQuery = {"_id": mongoose.Types.ObjectId(sectionInfo.gridID), "sections._id": mongoose.Types.ObjectId(sectionInfo.cellID)};
  var query = {"sections": {"_id": mongoose.Types.ObjectId(sectionInfo.cellID)}};
  return await Grid.findOneAndUpdate(
    findQuery,
    {"$pull": query},
    async function (err, grid) {
      if(err) {
        library.sendJsonResponse(res, 401, err);
        return;
      }
      if(sectionInfo.gridPattern == "undefined" || sectionInfo.gridPattern == null) {
        return await Grid.deleteOne({_id: grid._id});
      }else {
        grid.pattern = sectionInfo.gridPattern;
        return await grid.save();
      }
    }
  );
}

var removeAlbumsFromCell = async function (res, sectionTitle) {
  if(!sectionTitle) {
    library.sendJsonResponse(res, 404, "missing section info.");
    return;
  }
  //FUNCTIONS
  var sendRemovePost = async function (albumToRemove) {
    if(!albumToRemove) {
      return {
        status: 401,
        msg: "missing album to be removed info."
      };
    }
    return await axios.post(library.apiOptions.server+'/api/album/remove', {
      removeBySection: albumToRemove
    });
  }
  //---
  var albums = await axios.get(library.apiOptions.server+'/api/albums/'+sectionTitle);

  if(albums.data) {
    albums = albums.data;
    for(var i = 0; i < albums.length; i++) {
      var albumDeleted = await sendRemovePost(albums[i].section);
      if(albumDeleted.statusCode != 200) {
        library.sendJsonResponse(res, albumDeleted.statusCode, albumDeleted.statusMessage);
        return;
      }
    }
  }
}

var jointSectionToNewGrid = async function (sectionInfo) {
  return await Grid.updateOne(
    {_id: sectionInfo.jointGridID},
    {
      $push: { sections: {
        _id: mongoose.Types.ObjectId(sectionInfo.cellID),
        title: sectionInfo.cellTitle,
        mainImg: sectionInfo.cellImg,
      }},
      $set: {pattern: String(sectionInfo.gridJointPattern)},
    }
  );
}

//-----
//MODULES
module.exports.saveGrid = async function (req, res) {
  try {
    if(!req.body) {
      library.sendJsonResponse(res, 404, "missing info.");
      return;
    }
    createNewGrid(req, res);
    res.redirect("/");
  }
  catch (error) {
    library.sendJsonResponse(res, 401, error);
  }
}

module.exports.getGrids = async function (req, res) {
  var grids = await Grid.find({});
  library.sendJsonResponse(res, 200, grids);
}

module.exports.getSections = async function (req, res) {

  var gridsContent = await Grid.find({});
  var allSections = [];
  if(gridsContent.length > 0) {
    for(sections in gridsContent) {
      for(section in gridsContent[sections].sections);
        let currentSection = gridsContent[sections]["sections"][section];
        allSections.push(currentSection);
    }
  }
  library.sendJsonResponse(res, 200, allSections);
}

//CELLS
module.exports.removeGridCell = async function (req, res) {
  if(!req.body) {
    library.sendJsonResponse(res, 404, "remove failed. missing cell information.");
    return;
  }
  await removeSectionFromDb(res, req.body);
  library.aws.deleteImg(req.body.cellImg);
  removeAlbumsFromCell(res, req.body.cellTitle);
  library.sendJsonResponse(res, 200, "cell Removed!");
}

//Deletes previous recording of cell and creates an identical cell in a new grid pattern.
module.exports.splitGridCell = async function (req, res) {
  if(!req.body) {
    library.sendJsonResponse(res, 404, "remove failed. missing cell information.");
    return;
  }
  await removeSectionFromDb(res, req.body);
  createNewGrid(req, res);
  library.sendJsonResponse(res, 200, "splitted!");
}

module.exports.jointGridCell = async function (req, res) {
  if(!req.body) {
    library.sendJsonResponse(res, 404, "remove failed. missing cell information.");
    return;
  }
  var data = req.body;

  await jointSectionToNewGrid(data);
  await removeSectionFromDb(res, data);
  library.sendJsonResponse(res, 200, "successfull changes!");
}

var changeAlbumsSection = async function (updateData) {
  await Album.updateMany(
    {"section": String(updateData.cellTitle)},
    {"$set": {"section": String(updateData.newTitle)}}
  );
}

module.exports.changeGridInfo = async function (req, res) {
  if(!req.body) {
    library.sendJsonResponse(res, 404, "remove failed. missing cell information.");
    return;
  }
  var data = req.body;

  if(data.infoType == "title") {
    var findQuery = {"_id": mongoose.Types.ObjectId(data.gridID), "sections._id": mongoose.Types.ObjectId(data.cellID)};
    var query = {"sections.$.title": String(data.newTitle)};
    await changeAlbumsSection(data);
  }else if(data.infoType == "pattern"){
    var findQuery = {"_id": mongoose.Types.ObjectId(data.gridID)};
    var query = {"pattern": String(data.newPattern)};
  }
  await Grid.findOneAndUpdate(
    findQuery,
    {"$set": query},
    function (err, grid) {
      if(err) {
        library.sendJsonResponse(res, 401, err);
        return;
      }
      library.sendJsonResponse(res, 200, data);
    }
  );
}

module.exports.patternGridCell = async function (req, res) {
  if(!req.body) {
    library.sendJsonResponse(res, 404, "remove failed. missing cell information.");
    return;
  }
  var data = req.body;

  await Grid.findOneAndUpdate(
    {"_id": mongoose.Types.ObjectId(data.gridID), "sections._id": mongoose.Types.ObjectId(data.cellID)},
    {"$set": {"sections.$.pattern": String(data.newPattern)} },
    function (err, grid) {
      if(err) {
        library.sendJsonResponse(res, 401, err);
        return;
      }
      library.sendJsonResponse(res, 200, data);
    }
  );
}
