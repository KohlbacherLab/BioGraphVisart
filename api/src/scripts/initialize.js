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
var noAttr = false;

/* 
read from grphml - file and initialize cy-object
*/
function readFile(graphXML) {

  // if it is not the first graph read, delete all selectable options
  var myNode = document.getElementById("configPart");
  var domValues = document.getElementById("values");
  if(domValues){  
    domValues.parentNode.removeChild(domValues);}
    var domNodeShapesAttr = document.getElementById("nodeShapesAttr");
  if(domNodeShapesAttr){
    domNodeShapesAttr.parentNode.removeChild(domNodeShapesAttr);}
    var domNodeShapes = document.getElementById("nodeShapes");
  if(domNodeShapes)
    {domNodeShapes.parentNode.removeChild(domNodeShapes);}

  // does no have attribute for coloring/shape?
  noAttr = false;

  if(shapeNode){
    shapeNode.elements().remove();
  }
  usedShapeAttributes = [];
  nodesMin = -1;
  nodesMax = 1;
  firstTime = true;

  graphString = graphXML.split("/");
  loadFile();
}



function loadFile() {

  // put node atttributes into dropdown select object
  var drp = document.createElement("select");
  drp.id = "values";
  drp.name = "values";
  drp.onchange = visualize;
  drp.style.visibility = "visible";
  document.getElementById("configPart").appendChild(drp);
  // node attributes
  var sele = document.createElement("OPTION");
  sele.value =  "";
  sele.text = "Choose node's attribute";
  drp.add(sele);

  // attributes for changing node shape in dropdown
  var drpShapes = document.createElement("select");
  drpShapes.id = "nodeShapesAttr";
  drpShapes.name = "nodeShapesAttr";
  document.getElementById("configPart").appendChild(drpShapes);
  drpShapes.style.visibility = "hidden";

  var seleShapeAttr = document.createElement("OPTION");    
  seleShapeAttr.text = "Choose node's attribute";
  seleShapeAttr.value = "";
  drpShapes.add(seleShapeAttr);

 // shapes dropdown
  var drpShape = document.createElement("select");
  drpShape.id = "nodeShapes";
  drpShape.name = "nodeShapes";
  document.getElementById("configPart").appendChild(drpShape);
  drpShape.style.visibility = "hidden";
  drpShape.onchange = changeNodeShapes;

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

  // no attributes for node coloring/shape
  var noOptn = true;
  var noDrpShapes = true;

  // get attributes for coloring -> double/boolean and shape -> boolean
  for (var i = 0; i <= graphString.length - 1; i++) {
    if(graphString[i].includes("for=\"node\"") && 
      (graphString[i].includes("attr.type=\"double\"") || 
        (graphString[i].includes("attr.type=\"boolean\"")))){
      var nodeattr = graphString[i].split("attr.name=")[1].split(" ")[0].replace(/"/g, "");
      var optn = document.createElement("OPTION");
      optn.text=nodeattr;
      optn.value=nodeattr;
      drp.add(optn);
      noOptn = false;

      if(graphString[i].includes("attr.type=\"boolean\"")){
        var nodeattrShape = graphString[i].split("attr.name=")[1].split(" ")[0].replace(/"/g, "");
        var optnShape = document.createElement("OPTION");
        optnShape.text=nodeattrShape;
        optnShape.value=nodeattrShape;
        drpShapes.add(optnShape);
        noDrpShapes = false;
      }
    };
    // do not search whole file, only header
    if(graphString[i].includes("<node id=\"n0\">")){
      break;
    };
  };

  // if no attributes found for coloring/shape, remove dropdown menus and visualize
  if(noOptn && noDrpShapes){
    noAttr = true;
    drp.parentNode.removeChild(drp);
    drpShapes.parentNode.removeChild(drpShapes);
    drpShape.parentNode.removeChild(drpShape);
    visualize();
  };   
  loadGraphCount ++; 
};