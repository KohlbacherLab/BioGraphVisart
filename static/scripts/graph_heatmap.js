/*
  create a graph with Cytoscape
*/
var path;
var nodes;
var colorschemePathsLeft = [];
var colorschemePathsRight = [];
var colorschemePathsMerge = [];
var leftEdges = [];
var rightEdges = [];
/*
visualize a graph from .graphml-file
*/
function visualize(firstTime=false) { 
  nodeVal = document.getElementById('values').value;

  // move edge legend when scrolling
  if(!!right){
    var cys = ['cyLeft', 'cyRight'];
    $(window).scroll(function() {
      if ($(window).scrollTop() >= document.getElementById("right").offsetTop-700 && !!right) {
          $("#legend_heatmap").css({
            "top": document.getElementById("right").offsetTop + "px",
            "left": ($(window).scrollLeft()) + "px",
            "position":"absolute",
            "margin-top":0+"px",
            "margin-left":10+"px"
        });
      }
      else if($(window).scrollTop() <= document.getElementById("left").offsetTop && !!right){
      // if($(window).scrollTop() <= window.innerHeight/2){
        $("#legend_heatmap").css({
          "top": document.getElementById("left").offsetTop +"px",
          "left": ($(window).scrollLeft()) + "px",
          "position":"absolute",
          "margin-top":0+"px",
          "margin-left":10+"px"
        });
      }
    });
  }
  else{
    var cys = ['cyLeft'];
    // document.getElementById("legendGraphsRight").innerHTML="";
    document.getElementById('downloadPartRight').style.visibility = "hidden";
    document.getElementById('resetRight').style.visibility = "hidden";
    document.getElementById('right').style.visibility = "hidden";
    document.getElementById('keggpathwaysRight').style.visibility = "hidden";
  }
  var interactionTypes;
  var leftNodes;
  var leftEdges;
  var rightNodes;
  var rightEdges;
  var graphLeft;
  var graphRight;
  cys.forEach(function(cyO){
    // get nodes and edges 
    if(cyO == 'cyLeft'){
      leftGraph = true;
      graphString = graphStringLeft;
      var leftnodesAndEdges = getNodesAndEdges(graphString, 'left');
      leftNodes = leftnodesAndEdges[0];
      leftEdges = leftnodesAndEdges[1]; 
      var leftNodeValuesNum = leftnodesAndEdges[2];
      interactionTypes = leftnodesAndEdges[3];
      // set min and max for legend  and add nodes and edges to graph
      var leftRange = legendsRange(leftNodeValuesNum);
      var leftNodesMin = leftRange[0];
      var leftNodesMax = leftRange[1];
      graphLeft= createCyObject(cyO, leftNodesMin, leftNodesMax, document.getElementById('values').value);
      addNodesAndEdges(graphLeft, leftNodes, leftEdges, leftFirstTime, leftNodesMin, leftNodesMax);
      document.getElementById('downloadPDF').style.visibility = "visible";
      document.getElementById('outputNameHeatmap').style.visibility = "visible";
      document.getElementById('downloadPDF').disabled = false;
      showConfigurationParts('Left', graphLeft, left);
      showMetaInfo(graphLeft, document.getElementById('values').value);
      // set background layer to hoghlight pathways
      var layerLeft = createLayoutKeggPathways(graphLeft, allPathsLeft, "Left")
      var canvasLeft = layerLeft.getCanvas();
      var ctxLeft = canvasLeft.getContext('2d');
      showKEGGParts('Left', ctxLeft, graphLeft, leftNodes, layerLeft, canvasLeft)

      graphLeft.on('tap', 'node',function(evt){
        highlightNodeTapped(evt.target.data().symbol, graphLeft);
        evt.target.addClass('highlighted');
        if(right){
          highlightNodeTapped(evt.target.data().symbol, graphLeft, graphRight);
        }
      })
      graphLeft.on('tap', function(event){
        var evtTarget = event.target;
        if( evtTarget === graphLeft ){
          graphLeft.$('node').removeClass('highlighted')
          if(right){
            graphRight.$('node').removeClass('highlighted')
          }
        }
      });
    }
    else if(cyO = 'cyRight'){
      leftGraph = false;
      graphString = graphStringRight;
      var rightnodesAndEdges = getNodesAndEdges(graphString, 'right');
      rightNodes = rightnodesAndEdges[0];
      rightEdges = rightnodesAndEdges[1]; 
      var rightNodeValuesNum = rightnodesAndEdges[2];
      var interactionTypesRight = rightnodesAndEdges[3];
      interactionTypes = interactionTypes.add(...interactionTypesRight);
      // set min and max for legend  and add nodes and edges to graph
      var rightRange = legendsRange(rightNodeValuesNum);
      var rightNodesMin = rightRange[0];
      var rightNodesMax = rightRange[1];
      graphRight= createCyObject(cyO, rightNodesMin, rightNodesMax, document.getElementById('values').value);

      addNodesAndEdges(graphRight,rightNodes, rightEdges, rightFirstTime, rightNodesMin, rightNodesMax);
      document.getElementById('cyRight').style.visibility = "visible";
      showConfigurationParts('Right', graphRight, right);
      document.getElementById('right').style.visibility = "visibile";
      document.getElementById('rightID').style.visibility = "visible";
      showMetaInfo(graphRight, document.getElementById('values').value);
      // set background layer to hoghlight pathways
      var layerRight = createLayoutKeggPathways(graphRight, allPathsRight,"Right")
      var canvasRight = layerRight.getCanvas();
      var ctxRight = canvasRight.getContext('2d');
      showKEGGParts('Right',ctxRight, graphRight, rightNodes, layerRight, canvasRight);


      graphRight.on('tap', 'node',function(evt){
        highlightNodeTapped(evt.target.data().symbol, graphLeft, graphRight);
        evt.target.addClass('highlighted');
      })
      graphRight.on('tap', function(event){
          var evtTarget = event.target;
          if( evtTarget === graphRight ){
            graphLeft.$('node').removeClass('highlighted')
            graphRight.$('node').removeClass('highlighted')
          }
        });
    }
  });
  document.getElementById("arrows").innerHTML = "";
  createInteractionLegend(interactionTypes, graphLeft, graphRight);
  if(document.getElementById('nodeShapesAttr')){
    if(!document.getElementById('heatmap_shapes')){
      var shapelegend = document.createElement("div")
      shapelegend.id = "heatmap_shapes";
      shapelegend.visibility = "visible";
      document.getElementById("legend_heatmap").appendChild(shapelegend);
      
    }
    document.getElementById("nodeShapes").onchange=function(){
      changeNodeShapes(graphLeft, 'heatmap_shapes');
      if(graphRight){
        changeNodeShapes(graphRight, 'heatmap_shapes');
      }
    }
    graphLeft.style()
        .selector('node['+document.getElementById('nodeShapesAttr').value+' ="true"]')        
        .style('shape', document.getElementById('nodeShapes').value)
        .update();
    if(graphRight){
      graphRight.style()
        .selector('node['+document.getElementById('nodeShapesAttr').value+' ="true"]')        
        .style('shape', document.getElementById('nodeShapes').value)
        .update();
    }
  }
  if(firstTime && graphRight){
    firstTime = false;
    clickMerge(leftNodes, leftEdges, rightNodes, rightEdges, interactionTypes);
  }
  document.getElementById('legend_heatmap').setAttribute('style','visibility:visible');
  document.getElementById('searchgene').setAttribute('style','visibility:visible');
  document.getElementById('searchbutton').setAttribute('style','visibility:visible');
  document.getElementById('searchbutton').onclick=function(){highlightSearchedGene(graphLeft, graphRight)} 

} 

function showConfigurationParts(pos, cy, name){
  document.getElementById('reset'+pos).style.visibility = "visible";
  document.getElementById('reset'+pos+'Layout').onclick=function(){resetLayout(cy, pos)}
  document.getElementById('downloadPart'+pos).style.visibility = "visible";
  document.getElementById('download'+pos+'SVG').disabled = false;
  document.getElementById('download'+pos+'PNG').disabled = false;
  document.getElementById('download'+pos+'SVG').onclick = function(){
    downloadSVG(cy, pos, name)
  }
  document.getElementById('download'+pos+'PNG').onclick = function(){
    downloadPNG(cy, pos, name)
  }
  document.getElementById('KEGGpathsButton'+pos).style.visibility ="visible";
  document.getElementById('keggpathways'+pos).style.visibility = "visible";
  document.getElementById("selectlayout"+pos).visibility = "visible";
  document.getElementById("selectlayout"+pos).onchange= function(){changeLayout(cy, pos)}
}

function showKEGGParts(pos, ctx, cy, nodes, layer, canvas){
  document.getElementById("keggpathways"+pos).addEventListener('click', 
    function(){listKEGGPathways(ctx, cy, nodes, layer, canvas, pos);});
  document.getElementById('KEGGpaths'+pos).style.visibility = "visible";

}
//add nodes and edges to cy-object (update if attribute has changed)
function addNodesAndEdges(cyObject, nodes, edges, firstTime, nodesMin, nodesMax){

  if(loadGraphCount > 1){
    cyObject.elements().remove();
    if(cyObject === 'cyLeft'){
      leftFirstTime = false;
    }
    else if(cyObject === 'cyRight'){
      rightFirstTime = false;
    }
    loadGraphCount = 0;
  }
  cyObject.add(nodes);
  cyObject.add(edges);
  cyObject.nodes().noOverlap({ padding: 5 });
  // calculate label position for legend and style legend
  var fontSize = 10;
  calculateLabelColorLegend(nodeVal, fontSize, cyObject, nodesMin, nodesMax);

  addcolorlegend(cyObject)

  cyObject.layout({
    name: 'dagre'
  }).run();
  // update node values if tracer or values change
  if(!firstTime){
    for(n=0; n < nodes.length; n++){
      cyObject.batch(function(){
      cyObject.$('node[id =\''  + nodes[n].data.id + '\']')
        .data('val', nodes[n].data.val)
      });
    }
  }

}

//show meta-information of nodes by mouseover
function showMetaInfo(cyObject, nodeVal){
  cyObject.elements('node').qtip({       // show node attibute value by mouseover
    show: {   
      event: 'mouseover', 
      solo: true,
    },
    content: {text : function(){
      if(!isNaN(parseFloat(this.data('val')))){
        return '<b>'+nodeVal +'</b>: ' + parseFloat(this.data('val')).toFixed(2); } //numbers
      else{
        return '<b>'+nodeVal +'</b>: '+ this.data('val');          //bools
      }
    }},
    position: {
      my: 'top center',
      at: 'bottom center'
    },
    style: {
      classes: 'qtip-bootstrap',
      tip: {
        width: 8,
        height: 8
      }
    },
    });
  cyObject.elements('edge').qtip({       // show node attibute value by mouseover
        show: {   
          event: 'mouseover', 
          solo: true,
        },
        content: {text : function(){
            return '<b>'+this.data()['interaction'] +'</b> ' 
        }},
        position: {
          my: 'top center',
          at: 'bottom center'
        },
        style: {
          classes: 'qtip-bootstrap',
          tip: {
            width: 8,
            height: 8
          }
        },
        });
}


/*
reset view (zoom, position)
*/
function resetLayout(cy, pos){
var animateLayout = true;
  var selectedLayout = document.getElementById('selectlayout' + pos).value;
  if(selectedLayout == "klay"){
    var options = {
      animate: animateLayout, // Whether to transition the node positions
      klay: {
        aspectRatio: 1.49, // The aimed aspect ratio of the drawing, that is the quotient of width by height
        compactComponents: true, // Tries to further compact components (disconnected sub-graphs).
        nodeLayering:'LONGEST_PATH', // Strategy for node layering.
        /* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. 
        The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
        LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
        INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
        thoroughness: 10 // How much effort should be spent to produce a nice layout..
      },
    };
    cy.layout({
      name:'klay',
      options
    }).run();
  }
  else if(selectedLayout == "breadthfirst"){
    cy.layout({
        name: "breadthfirst",
        spacingFactor: 0.5,
        animate: animateLayout
      }).run();
  }
  else if(selectedLayout == "dagre (default)"){
    cy.layout({
        name: "dagre",
        animate: animateLayout
      }).run();
  }
  else if(selectedLayout == "cose-bilkent"){
    cy.layout({
        name: "cose-bilkent",
        // Gravity range (constant)
        gravityRange: 1.3,
        animate: true
      }).run();
  }
  else if(selectedLayout == "grid"){
    cy.layout({
        name: "grid",
        animate: animateLayout,
        avoidOverlapPadding: 5
      }).run();
  }
  else{
    cy.layout({
        name: "dagre",
        animate: animateLayout
      }).run();
    document.getElementById('selectlayout'+pos).value = "dagre (default)";
  }
  if(highlightedNode){
    cy.$('node[symbol="'+highlightedNode+'"]').addClass("highlighted");
  }
};

