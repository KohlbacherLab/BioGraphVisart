var nodes, edges, path, tracer, nodeVal, outputName, nodeAttributes, 
 graphString, oldMin, oldMax, nodeShapeAttr, shapeNode, ycoord;
var firstTime = true;
var loadGraphCount = 0;
var legendDrawn = false;
var svg;
var  nodesMin = -1;
var nodesMax = 1;
var cy;
var firstShape = true;
var usedShapeAttributes = [];
var getDrpDwnFiles = true;

/* 
create a drop dpwn menu for graphml-files
*/
// function getFilesList(){
//   if(getDrpDwnFiles){
//     var drpFiles = document.getElementById("gfiles");      
//       removeOptions(drpFiles);

//       var sele = document.createElement("OPTION"); 
//       sele.text = "Select .graphml-file";
//       sele.value = "";
//       drpFiles.add(sele);

//     $.get("/foundFiles", function(foundFiles) {
//     // put graphml files into dropdown select object
//       foundFiles.forEach( function (file){
//         filename = file.replace(/\\/g,'/')
//         file = file.replace('..', 'http://127.0.0.1:3000/static')
//         var gf = file;
//         var gfile = document.createElement("OPTION");
//         gfile.text=filename;
//         gfile.value=gf;
//         drpFiles.add(gfile);
//       });
//     });
//   }
//   getDrpDwnFiles = false;
// }


// function checkedBox(){

//   var selectedFile = document.querySelector('input[name="selectedFile"]:checked').value;
//   if(selectedFile === "upload"){
//     document.getElementById('graphName').style.visibility = "visible";
//     document.getElementById('gfiles').remove();
//   }
//   // else if(selectedFile === "database"){
//   //   document.getElementById('gfiles').style.visibility = "visible";
//   //   document.getElementById('graphName').remove();
//   // }
//   document.getElementById('loadGraphml').style.visibility = "visible";
//   document.getElementById('loadGraphml').disabled = false;
//   document.getElementById("upload").disabled = true;
//   // document.getElementById("database").disabled = true;
//   // document.getElementById("start").disabled = true;
// }

/* 
read from grphml - file and initialize cy-object
*/
function readFile() {
  if(shapeNode){
    shapeNode.elements().remove();
  }
  usedShapeAttributes = [];
  nodesMin = -1;
  nodesMax = 1;
  firstTime = true;

  // if(document.getElementById("upload").checked){
    var files = document.getElementById('graphName').files;
    if (!files.length) {
      alert('Please select a file!');
      return;
    }

    var file = files[0];

    if(!file["name"].endsWith("graphml")){
      alert('Please select a .graphml-file.');
      return;
    }
    path = file.name;
    var reader = new FileReader();
    reader.onloadend = function(evt) {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
        var arrayBuffer = evt.target.result;
        graphString = arrayBuffer.split('\n');;
        loadFile();
      }
    };
    reader.readAsText(file);
  // }
  // else if(document.getElementById("database").checked){
  //   path = document.getElementById('gfiles').value;
  //   if(!path.endsWith('.graphml')){
  //     alert('Please give a .graphml-file.');
  //     return;
  //   };
  //   var xmlhttp = new XMLHttpRequest();
  //   xmlhttp.open("GET", path, false);
  //   xmlhttp.send();
  //   if (xmlhttp.status==200) {
  //     graphString = xmlhttp.responseText.split("\n");
  //     loadFile();
  //  } 
  //   else{
  //     alert('Invalid file path.');
  //   return;
  //   }
  // }
}


function loadFile() {
  // put node atttributes into dropdown select object
  var drp = document.getElementById("values");      // node attributes
  drp.style.visibility = "visible";
  removeOptions(drp);
  var drpShapes = document.getElementById("nodeShapesAttr");
  removeOptions(drpShapes);

  var sele = document.createElement("OPTION");    
  sele.text = "Choose node's attribute";
  sele.value = "";
  drp.add(sele);
  
  var seleShapes = document.createElement("OPTION");  // shape attributes
  seleShapes.text = "Choose shape's attribute";
  seleShapes.value = "";
  drpShapes.add(seleShapes);

  var drpShape = document.getElementById("nodeShapes"); // shapes
  removeOptions(drpShape);
  var seleShape = document.createElement("OPTION");
  seleShape.text = "Choose shape";
  seleShape.value = "";
  drpShape.add(seleShape);

  const shapesArray = ["rectangle", "octagon", "rhomboid", "pentagon", "tag"];

  shapesArray.forEach(function(s){
    var nodeShape = s;
    var optnShape = document.createElement("OPTION");
    optnShape.text=nodeShape;
    optnShape.value=nodeShape;
    drpShape.add(optnShape);
  })

  for (var i = 0; i <= graphString.length - 1; i++) {
    if(graphString[i].includes("for=\"node\"") && 
      (graphString[i].includes("attr.type=\"double\"") || 
        (graphString[i].includes("attr.type=\"boolean\"")))){
      var nodeattr = graphString[i].split("attr.name=")[1].split(" ")[0].replace(/"/g, "");
      var optn = document.createElement("OPTION");
      optn.text=nodeattr;
      optn.value=nodeattr;
      drp.add(optn);

      if(graphString[i].includes("attr.type=\"boolean\"")){
        var nodeattrShape = graphString[i].split("attr.name=")[1].split(" ")[0].replace(/"/g, "");
        var optnShape = document.createElement("OPTION");
        optnShape.text=nodeattrShape;
        optnShape.value=nodeattrShape;
        drpShapes.add(optnShape);
      }
    };
    if(graphString[i].includes("<node id=\"n0\">")){
      break;
    };
  };
  loadGraphCount ++;  

};