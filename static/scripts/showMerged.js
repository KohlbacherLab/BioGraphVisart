function createMerged(){
// cystyle
var cystyle =  [
    {selector: 'node',
        style: {
          width: 50,
          height: 50,
          shape: 'ellipse',
          'background-color': 'white',
          'border-color' : 'black',
          'border-style' : 'solid',
          'border-width' : '2',
          label: 'data(symbol)',
          "text-valign" : "center",
          "text-halign" : "center",
          "font-size" : 12,
          "color":"black"
    }},
	// style edges
	{selector: 'edge',
	    style: {
	      'arrow-scale' : 2,
	      'curve-style' : 'bezier',
	      'font-size':16,
	      'text-rotation':'autorotate',
	      'font-weight':800,
	      'target-arrow-shape' : 'vee' 
    }},
    {selector: 'edge[interaction = \'activation\']',
      style: {
        'target-arrow-shape': 'triangle',
    }},
    {selector: 'edge[interaction = \'expression\']',
      style: {
        'target-arrow-shape': 'triangle',
    }},
    {selector: 'edge[interaction = \'inhibition\']',
      style: {
        'target-arrow-shape': 'tee',
    }},
    {selector: 'edge[interaction = \'repression\']',
      style: {
        'target-arrow-shape': 'tee',
    }},
    {selector: 'edge[interaction = \'binding/association\']',
      style: {
        'target-arrow-shape': 'triangle-cross',
    }},
    {selector: 'edge[interaction = \'dissociation\']',
      style: {
        'target-arrow-shape': 'triangle-cross',
    }},
  	{selector: 'edge[interaction = \'compound\']',
        style: {
          'target-arrow-shape': 'circle',
    }},
  	{selector: 'edge[interaction = \'indirect effect\']',
    	style: {
      	'line-style': 'dotted',
      	'target-arrow-shape': 'triangle'
    }},
  	{selector: 'edge[interaction = \'missing interaction\']',
    	style: {
      	'line-style': 'dashed',
      	'target-arrow-shape': 'triangle'
    }},
    {selector: 'edge[interaction = \'state change\']',
      	style: {
      	  'target-arrow-shape': 'square',
    }},

  	{selector: 'edge[interaction = \'phosphorylation\']',
    	style: {
      	'target-arrow-shape': 'diamond',
      	'target-label':'+p',
      	'target-text-offset':20
    }},
  	{selector: 'edge[interaction = \'dephosphorylation\']',
      style: {
        'target-arrow-shape': 'diamond',
        'target-label':'-p',
      'target-text-offset':20
    }},
  	{selector: 'edge[interaction = \'glycosylation\']',
      style: {
       'target-arrow-shape': 'diamond',
       'target-label':'+g',
      'target-text-offset':20
    }},      
  	{selector: 'edge[interaction = \'ubiquitination\']',
      style: {
        'target-arrow-shape': 'diamond',
        'target-label':'+u',
      'target-text-offset':20
    }},
  	{selector: 'edge[interaction = \'methylation\']',
      style: {
        'target-arrow-shape': 'diamond',
        'target-label':'+m',
      'target-text-offset':20
    }},
    {
      selector: 'node:selected',
      css: {
        'border-width': 10,
        'width':70,
        'height':70
    	}
  	}
	];
	merge_graph = createCyObject('merged_graph', -1,1)
	//buttons: reset, merge, download
  if(!document.getElementById("outputNameMerge")){
	   d3.select('#merged_graph_buttons')  
	     .append('p')

  	  d3.select('#merged_graph_buttons')  
  	  .append('input')
  	  .attr('name', 'outputFileMerge')
  	  .attr('type', 'text')
  	  .attr('maxlength', '512')
  	  .attr('id', 'outputNameMerge')
  	  .attr('value', 'File name')

  	  d3.select('#merged_graph_buttons')  
  	  .append('button')
  	  .attr('type', 'button')
  	  .attr('class', 'butn')
  	  .attr('id','downloadMergePNG')
  	  .text('.png')
  	  .on('click', function(){
	  	
  		  outputName = document.getElementById('outputNameMerge').value;
  	  	  var png64 = merge_graph.png();
  		  $('#downloadPNGMerge').attr('href', png64);
  		  var download = document.createElement('a');
  		  download.href = 'data:image/png;base64;'+png64;
  	    download.download = outputName + '.png';
  		  download.click();
  	  });

  	d3.select('#merged_graph_buttons')  
  	  .append('button')
  	  .attr('type', 'button')
  	  .attr('class', 'butn')
  	  .attr('id','downloadMergeSVG')
  	  .text('.svg')
  	  .on('click', function(){
  	  	outputName = document.getElementById('outputNameMerge').value;
  	  	
  	    var svgContent = merge_graph.svg({scale: 1, full: true});
  		  saveAs(new Blob([svgContent], {type:"image/svg+xml;charset=utf-8"}), outputName +".svg");
  	  });

      d3.select('#merged_graph_buttons')
      .append('button')
      .attr('class', 'butn')
      .attr('id', 'downloadPDF')
      .text('.pdf')
      .on('click', function(){
        const domElement = document.getElementById('body');
        var divHeight = window.innerHeight
        var divWidth = window.innerWidth
        var ratio = divHeight / divWidth;
      
        var doc = new jsPDF("l", "mm", "a4");
        var width = doc.internal.pageSize.getWidth();
        var height = (ratio * width);

        html2canvas($("#body").get(0), { onclone: (document) => {
          document.getElementById('nav').style.visibility = 'hidden'
          document.getElementById('resetMerge').style.visibility = 'hidden'
          document.getElementById('nav').style.visibility = 'hidden';
          document.getElementById('merged_graph_buttons').style.visibility = 'hidden'
          document.getElementById('footer').style.visibility = 'hidden'
          document.getElementById('searchbutn').style.visibility = 'hidden'
          if(document.getElementById('searchgene').value == "Search gene"){
            document.getElementById('searchgene').style.visibility = 'hidden'
          }

        }}).then(function(canvas){
        var imgData = canvas.toDataURL('image/png');

        doc.addImage(imgData, 'PNG', 0, 0, width, height); 
        outputName = document.getElementById('outputNameMerge').value;
        doc.save(outputName + '.pdf');
      })
      })

      // color options dropdown
      var drpColor = document.createElement("select");
      drpColor.id = "selectColorAttribute";
      drpColor.name = "selectColor";
      document.getElementById("merged_graph_buttons").appendChild(drpColor);
      drpColor.style.visibility = "visible";
      drpColor.onchange = createMerged;

      var sele = document.createElement("OPTION");    
      sele.text = "Choose node's attribute";
      sele.value = window.opener.drpValues[0];
      drpColor.add(sele);
      window.opener.drpValues.forEach(function(val){
        var optn = document.createElement("OPTION");
        optn.text=val;
        optn.value=val;
        drpColor.add(optn);
      })

    // node shape drop dpwn
    var nodeShapesAttr = document.createElement("select")
    nodeShapesAttr.id = "nodeShapesAttr"
    nodeShapesAttr.name = "nodeShapesAttr"
    document.getElementById("merged_graph_buttons").appendChild(nodeShapesAttr)
    nodeShapesAttr.onchange = activateShapes;

    var drpShapes = document.getElementById("nodeShapesAttr");
    var seleShapeAttr = document.createElement("OPTION");    
    seleShapeAttr.text = "Select Shape Attribute";
    seleShapeAttr.value = "";
    drpShapes.add(seleShapeAttr);

    shapeAttributes = Array.from(new Set(window.opener.shapeAttributes)); 
    if(shapeAttributes.length > 0){
      shapeAttributes.forEach(function(val){
        var optn = document.createElement("OPTION");
        optn.text=val;
        optn.value=val;
        drpShapes.add(optn);
      })
    }

    var nodeShapes = document.createElement("select")
    nodeShapes.name= "nodeShapes" 
    nodeShapes.id="nodeShapes" 
    document.getElementById("merged_graph_buttons").appendChild(nodeShapes);
    nodeShapes.onchange= changeNodeShapes;
    

    // shapes dropdown
    var drpShape = document.getElementById("nodeShapes");
    drpShape.style.visibility = "hidden";
    var seleShape = document.createElement("OPTION");
    seleShape.text = "Select Shape";
    seleShape.value = "ellipse";
    drpShape.add(seleShape);

    const shapesArray = ["rectangle", "octagon", "rhomboid", "pentagon", "tag"];

    shapesArray.forEach(function(s){
      var nodeShape = s;
      var optnShape = document.createElement("OPTION");
      optnShape.text=nodeShape;
      optnShape.value=nodeShape;
      drpShape.add(optnShape);
    });

      // layout dropdown
    var drpLayout = document.createElement("select");
    drpLayout.id = "selectlayoutMerge";
    drpLayout.name = "selectlayout";
    document.getElementById("merged_graph_buttons").appendChild(drpLayout);
    drpLayout.style.visibility = "visible";
    drpLayout.onchange = changeLayoutMerged;

    var seleLayout = document.createElement("OPTION");
    seleLayout.text = "Select Layout";
    drpLayout.add(seleLayout);

    const layoutArray = ["dagre (default)", "klay", "breadthfirst", "cose-bilkent", "grid"];

    layoutArray.forEach(function(s){
      var graphLayout = s;
      var optnLayout = document.createElement("OPTION");
      optnLayout.text=graphLayout;
      optnLayout.value=graphLayout;
      drpLayout.add(optnLayout);
    });

  var searchgene = document.createElement("input");
    searchgene.id = "searchgene";
    searchgene.value = "Search gene"
    document.getElementById("merged_graph_buttons").appendChild(searchgene);
    searchgene.setAttribute("type", "text");
    searchgene.setAttribute("width", 30);
    var searchbutn = document.createElement("button");
    searchbutn.id = "searchbutn";
    searchbutn.innerHTML = "Search";
    document.getElementById("merged_graph_buttons").appendChild(searchbutn);
    document.getElementById("searchbutn").className = 'butn';  
    searchbutn.onclick = highlightSearchedGene;

}
const nodesEdges = getmergedGraph(window.opener.leftNodes, window.opener.rightNodes, window.opener.leftEdges, window.opener.rightEdges);
  var mergedNodes = nodesEdges[0];
  var mergedEdges = nodesEdges[1];
      merge_graph.add(mergedNodes)
      merge_graph.add(mergedEdges)
      merge_graph.nodes().noOverlap({ padding: 5 });

      // calculate label position for legend and style legend
	  var fontSize = 10;
	  var labelVal = document.getElementById("selectColorAttribute").value;
	  var whitespace = getTextWidth(' ', fontSize +" arial");
    if(mergeMin == 'NaN' && mergeMax == 'NaN'){
      mergeMin = 'false'
      mergeMax = 'true'
    }
	  var minspace = getTextWidth(mergeMin, fontSize +" arial");
	  var valspace = getTextWidth(labelVal, fontSize +" arial");
	  var maxspace = getTextWidth(mergeMax, fontSize +" arial");
	  var neededWhitespace = ((167-(minspace+whitespace+valspace+whitespace+maxspace))/whitespace)/2;
	  if(neededWhitespace <= 0){

	    while(neededWhitespace <= 0){
	      labelVal = labelVal.slice(0, -1);
	      valspace = getTextWidth(labelVal+'...', fontSize +" arial");

	      neededWhitespace = ((167-(minspace+whitespace+valspace+whitespace+maxspace))/whitespace)/2;
	    }
	    labelVal = labelVal+'...';
	  }


      merge_graph.style(cystyle);
      
      merge_graph.on('tap', 'node',function(evt){
	    highlightedNode.getsymbol;
	    highlightedNode.setsymbol = this.data("symbol");
	  })

      // get symbols and values for GA
      symbolsLeft = {};
      window.opener.graphLeft.nodes().forEach(function( ele ){
		  symbolsLeft[ele.data('symbol')]=ele.data('val');
		});


  	var arrLeft = Object.values(symbolsLeft);
  	var filteredLeft = arrLeft.filter(function (el) {
	  return el != null;
	});

    // get symbols and values for GA
    symbolsRight = {};
    window.opener.graphRight.nodes().forEach(function( ele ){
		 symbolsRight[ele.data('symbol')]=ele.data('val');
	});

  	var arrRight = Object.values(symbolsRight);
	var filteredRight = arrRight.filter(function (el) {
	  return el != null;
	});

	// legend node
	if(!isNaN(mergeMin)){
	    merge_graph.$('node[symbol = "legend"]')
	      .style('background-image','data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnOTExIgogICB3aWR0aD0iNTIuOTE2NjY4bW0iCiAgIGhlaWdodD0iMTMuMjI5MTY3bW0iCiAgIHZpZXdCb3g9IjAgMCAyMDAuMDAwMDEgNTAuMDAwMDAzIgogICBzb2RpcG9kaTpkb2NuYW1lPSJsZWdlbmQyLnN2ZyIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC45Mi4yIDVjM2U4MGQsIDIwMTctMDgtMDYiPgogIDxtZXRhZGF0YQogICAgIGlkPSJtZXRhZGF0YTkxNyI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGRlZnMKICAgICBpZD0iZGVmczkxNSI+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIGlkPSJsaW5lYXJHcmFkaWVudDQ4MTEiPgogICAgICA8c3RvcAogICAgICAgICBpZD0ic3RvcDQ4MDkiCiAgICAgICAgIG9mZnNldD0iMCIKICAgICAgICAgc3R5bGU9InN0b3AtY29sb3I6I2Q1MDAwMDtzdG9wLW9wYWNpdHk6MDsiIC8+CiAgICAgIDxzdG9wCiAgICAgICAgIGlkPSJzdG9wNDgwNyIKICAgICAgICAgb2Zmc2V0PSIxIgogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojZDUwMDAwO3N0b3Atb3BhY2l0eToxOyIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIGlkPSJsaW5lYXJHcmFkaWVudDQ3MzEiPgogICAgICA8c3RvcAogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojMDA2Y2YwO3N0b3Atb3BhY2l0eToxOyIKICAgICAgICAgb2Zmc2V0PSIwIgogICAgICAgICBpZD0ic3RvcDQ3MjciIC8+CiAgICAgIDxzdG9wCiAgICAgICAgIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDZjZjA7c3RvcC1vcGFjaXR5OjA7IgogICAgICAgICBvZmZzZXQ9IjEiCiAgICAgICAgIGlkPSJzdG9wNDcyOSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIHhsaW5rOmhyZWY9IiNsaW5lYXJHcmFkaWVudDQ3MzEiCiAgICAgICBpZD0ibGluZWFyR3JhZGllbnQ0NzMzIgogICAgICAgeDE9Ii0wLjE3MjUzNzg5IgogICAgICAgeTE9IjI1LjA0MjMwNyIKICAgICAgIHgyPSIxMDAuMDA3MzEiCiAgICAgICB5Mj0iMjUuMjIyMTYyIgogICAgICAgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiCiAgICAgICBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMTcyNTI4MTMsLTUwLjA0MjMwNSkiIC8+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIHhsaW5rOmhyZWY9IiNsaW5lYXJHcmFkaWVudDQ4MTEiCiAgICAgICBpZD0ibGluZWFyR3JhZGllbnQ0ODEzIgogICAgICAgeDE9IjEwMC43MTk0MiIKICAgICAgIHkxPSI3OC41OTI4ODgiCiAgICAgICB4Mj0iMTk5LjgyMDE0IgogICAgICAgeTI9Ijc4LjA1MzMyMiIKICAgICAgIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIgogICAgICAgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgwLjE3OTg0ODEzLC01My4wNTMzMjIpIiAvPgogIDwvZGVmcz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEiCiAgICAgb2JqZWN0dG9sZXJhbmNlPSIxMCIKICAgICBncmlkdG9sZXJhbmNlPSIxMCIKICAgICBndWlkZXRvbGVyYW5jZT0iMTAiCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAiCiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE2NTYiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iMTE0OCIKICAgICBpZD0ibmFtZWR2aWV3OTEzIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBmaXQtbWFyZ2luLXRvcD0iMCIKICAgICBmaXQtbWFyZ2luLWxlZnQ9IjAiCiAgICAgZml0LW1hcmdpbi1yaWdodD0iMCIKICAgICBmaXQtbWFyZ2luLWJvdHRvbT0iMCIKICAgICBzaG93Ym9yZGVyPSJmYWxzZSIKICAgICB1bml0cz0ibW0iCiAgICAgaW5rc2NhcGU6c25hcC1nbG9iYWw9InRydWUiCiAgICAgaW5rc2NhcGU6bG9ja2d1aWRlcz0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC1ub2Rlcz0idHJ1ZSIKICAgICBpbmtzY2FwZTpzbmFwLW90aGVycz0idHJ1ZSIKICAgICBpbmtzY2FwZTpzbmFwLW9iamVjdC1taWRwb2ludHM9ImZhbHNlIgogICAgIGlua3NjYXBlOnNuYXAtY2VudGVyPSJmYWxzZSIKICAgICBpbmtzY2FwZTpzbmFwLXRleHQtYmFzZWxpbmU9ImZhbHNlIgogICAgIGlua3NjYXBlOnNuYXAtcGFnZT0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC1ncmlkcz0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC10by1ndWlkZXM9ImZhbHNlIgogICAgIGlua3NjYXBlOnpvb209IjUuNTYiCiAgICAgaW5rc2NhcGU6Y3g9Ijk5LjgyMDEzNyIKICAgICBpbmtzY2FwZTpjeT0iMjQuMTAwNzA2IgogICAgIGlua3NjYXBlOndpbmRvdy14PSI0OTgiCiAgICAgaW5rc2NhcGU6d2luZG93LXk9IjEzNyIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIwIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9InN2ZzkxMSIgLz4KICA8cmVjdAogICAgIHN0eWxlPSJvcGFjaXR5OjA7ZmlsbDojZmYwMDAwO2ZpbGwtb3BhY2l0eToxIgogICAgIGlkPSJyZWN0MzI0NCIKICAgICB3aWR0aD0iNTY2IgogICAgIGhlaWdodD0iNjAiCiAgICAgeD0iLTEuMjAxMjQ4MiIKICAgICB5PSI3MjUuNDE1NzEiIC8+CiAgPHJlY3QKICAgICBzdHlsZT0ib3BhY2l0eTowO2ZpbGw6I2ZmMDAwMDtmaWxsLW9wYWNpdHk6MSIKICAgICBpZD0icmVjdDMyNDYiCiAgICAgd2lkdGg9IjkuNjE2NTA0NyIKICAgICBoZWlnaHQ9IjE1My44NjQwNyIKICAgICB4PSIzNjIuODUyMTciCiAgICAgeT0iNTg2LjIxNjY3IiAvPgogIDxyZWN0CiAgICAgc3R5bGU9Im9wYWNpdHk6MDtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjEiCiAgICAgaWQ9InJlY3QzMjQ4IgogICAgIHdpZHRoPSI0NTMuMzQ5NTIiCiAgICAgaGVpZ2h0PSIxNTcuOTg1NDQiCiAgICAgeD0iMi45MjAxMDUiCiAgICAgeT0iNDU3LjA4MDc1IiAvPgogIDxyZWN0CiAgICAgc3R5bGU9Im9wYWNpdHk6MDtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjEiCiAgICAgaWQ9InJlY3QzMjUwIgogICAgIHdpZHRoPSI2OTUuMTM1OTMiCiAgICAgaGVpZ2h0PSIyMDguODE1NTQiCiAgICAgeD0iLTEwOC4zNTY2IgogICAgIHk9IjQzMC45Nzg4MiIgLz4KICA8cmVjdAogICAgIHN0eWxlPSJvcGFjaXR5OjA7ZmlsbDojZmYwMDAwO2ZpbGwtb3BhY2l0eToxIgogICAgIGlkPSJyZWN0MzI1MiIKICAgICB3aWR0aD0iNTcxLjQ5NTEyIgogICAgIGhlaWdodD0iMjc3LjUwNDg1IgogICAgIHg9Ii04LjA3MDE5MDQiCiAgICAgeT0iMTAwNi41OTUzIiAvPgogIDxlbGxpcHNlCiAgICAgc3R5bGU9Im9wYWNpdHk6MDtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjEiCiAgICAgaWQ9InBhdGgzMjU0IgogICAgIGN4PSIxNjAuOTA1NTMiCiAgICAgY3k9IjM4OC4zOTE0OCIKICAgICByeD0iOTcuNTM4ODM0IgogICAgIHJ5PSIxMjUuMDE0NTYiIC8+CiAgPGVsbGlwc2UKICAgICBzdHlsZT0ib3BhY2l0eTowO2ZpbGw6I2ZmMDAwMDtmaWxsLW9wYWNpdHk6MSIKICAgICBpZD0icGF0aDMyNTYiCiAgICAgY3g9IjEwMi41MTk2MSIKICAgICBjeT0iNDMwLjI5MTkzIgogICAgIHJ4PSIyMzYuOTc4MTUiCiAgICAgcnk9IjE3Ni41MzE1NiIgLz4KICA8cmVjdAogICAgIHN0eWxlPSJvcGFjaXR5OjE7ZmlsbDp1cmwoI2xpbmVhckdyYWRpZW50NDczMyk7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm8iCiAgICAgaWQ9InJlY3Q0NzE3IgogICAgIHdpZHRoPSIyMDAiCiAgICAgaGVpZ2h0PSI1MCIKICAgICB4PSIwIgogICAgIHk9Ii01MCIKICAgICB0cmFuc2Zvcm09InNjYWxlKDEsLTEpIiAvPgogIDxyZWN0CiAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOnVybCgjbGluZWFyR3JhZGllbnQ0ODEzKTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgIGlkPSJyZWN0NDgwNSIKICAgICB3aWR0aD0iMjAwIgogICAgIGhlaWdodD0iNTAiCiAgICAgeD0iMCIKICAgICB5PSIwIiAvPgo8L3N2Zz4K')
  }
	if(isNaN(mergeMin)){
		merge_graph.$('node[symbol = "legend"]')
	     .style('background-image','data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpvc2I9Imh0dHA6Ly93d3cub3BlbnN3YXRjaGJvb2sub3JnL3VyaS8yMDA5L29zYiIKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgd2lkdGg9IjE5OS45OTk5OG1tIgogICBoZWlnaHQ9IjUwbW0iCiAgIHZpZXdCb3g9IjAgMCAxOTkuOTk5OTggNTAiCiAgIHZlcnNpb249IjEuMSIKICAgaWQ9InN2ZzgiCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTIuMiA1YzNlODBkLCAyMDE3LTA4LTA2IgogICBzb2RpcG9kaTpkb2NuYW1lPSJsZWdlbmRfYm9vbC5zdmciPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMyIj4KICAgIDxsaW5lYXJHcmFkaWVudAogICAgICAgaWQ9ImxpbmVhckdyYWRpZW50MjI3NSIKICAgICAgIG9zYjpwYWludD0ic29saWQiPgogICAgICA8c3RvcAogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojMDA2Y2YwO3N0b3Atb3BhY2l0eToxOyIKICAgICAgICAgb2Zmc2V0PSIwIgogICAgICAgICBpZD0ic3RvcDIyNzMiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9ImJhc2UiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEuMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6em9vbT0iMS4xODQ1NDk5IgogICAgIGlua3NjYXBlOmN4PSIzNzguMjAyNzQiCiAgICAgaW5rc2NhcGU6Y3k9Ijk0LjQ4ODE4OSIKICAgICBpbmtzY2FwZTpkb2N1bWVudC11bml0cz0ibW0iCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ibGF5ZXIxIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBmaXQtbWFyZ2luLXRvcD0iMCIKICAgICBmaXQtbWFyZ2luLWxlZnQ9IjAiCiAgICAgZml0LW1hcmdpbi1yaWdodD0iMCIKICAgICBmaXQtbWFyZ2luLWJvdHRvbT0iMCIKICAgICBzaG93Ym9yZGVyPSJmYWxzZSIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE0NDAiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iODU1IgogICAgIGlua3NjYXBlOndpbmRvdy14PSIwIgogICAgIGlua3NjYXBlOndpbmRvdy15PSIxIgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjEiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhNSI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICBpbmtzY2FwZTpsYWJlbD0iRWJlbmUgMSIKICAgICBpbmtzY2FwZTpncm91cG1vZGU9ImxheWVyIgogICAgIGlkPSJsYXllcjEiCiAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTUuMjkxNjY2NSwtOC4yMjYxOTI1KSI+CiAgICA8cmVjdAogICAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOiMwMDZjZjA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuMTg3MDg4NjU7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgIGlkPSJyZWN0ODE1IgogICAgICAgd2lkdGg9IjEwMCIKICAgICAgIGhlaWdodD0iNTAiCiAgICAgICB4PSI1LjI5MTY2NjUiCiAgICAgICB5PSI4LjIyNjE5MjUiIC8+CiAgICA8cmVjdAogICAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuMjY0NTgzMzI7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgIGlkPSJyZWN0MjMwNyIKICAgICAgIHdpZHRoPSIxMDAiCiAgICAgICBoZWlnaHQ9IjUwIgogICAgICAgeD0iMTA1LjI5MTY2IgogICAgICAgeT0iOC4yMjYxOTI1IiAvPgogIDwvZz4KPC9zdmc+Cg==')
  }
  	merge_graph.$('node[symbol = "legend"]').style('color', 'black')
		.style('color', 'black')
		.style('background-height',50)
		.style('background-width',200)
		.style('background-position-y','100%')
		.style('shape', 'rectangle')
		.style('width',200)
		.style('height',50)
            .style('label', mergeMin+' '+' '.repeat(neededWhitespace)+ labelVal +' '+' '.repeat(neededWhitespace) + mergeMax)
		.style('border-width',1)
		.style('text-valign' , 'bottom')
		.style('text-max-width', 200)

    // circle nodes only in GA orange
    merge_graph.nodes('[graph="g1"]').style('border-width', 5).style('border-color', '#fdae61');
    merge_graph.nodes('[symbol = "'+window.opener.leftID+'"]').style('border-width', 13).style('width', 50)
    .style('height', 50).style('font-weight', 'bold').style('font-size',16);
    // circle nodes only in GB light blue
    merge_graph.nodes('[graph="g2"]').style('border-width', 5).style('border-color', '#abd9e9');
    merge_graph.nodes('[symbol = "'+window.opener.rightID+'"]').style('border-width', 13)
    .style('width', 50).style('height', 50).style('font-weight', 'bold').style('font-size',16);
    // circle nodes common in both graphs black double line
    merge_graph.nodes('[graph="both"]').style('border-width', 5).style('border-color', 'black');


    // map values to node color for GA
    mapValuestoNodeColor(merge_graph, 'g1', '1', mergeMin, mergeMax, symbolsLeft, document.getElementById("selectColorAttribute").value);

    // map values to node color for GB
    mapValuestoNodeColor(merge_graph, 'g2', '2', mergeMin, mergeMax, symbolsRight, document.getElementById("selectColorAttribute").value);

    // on mpuse-over show value of selected attribute
   let filenameSplitLeft = window.opener.left.split("/")
	 filenameSplitLeft = filenameSplitLeft[filenameSplitLeft.length-1].split('.')[0];

    let filenameSplitRight = window.opener.right.split("/")
    filenameSplitRight = filenameSplitRight[filenameSplitRight.length-1].split('.')[0];
		 
	mergeMousover(merge_graph,'g1', document.getElementById("selectColorAttribute").value, filenameSplitLeft);
	mergeMousover(merge_graph,'g2', document.getElementById("selectColorAttribute").value, filenameSplitRight);

	// createLegendMerge(mergeMin, mergeMax);
    merge_graph.nodes('[graph = "both"]').qtip({       // show node attibute value by mouseover
	    show: {   
	      event: 'mouseover', 
	      solo: true,
	    },
	    content: {text : function(){
        var val = document.getElementById("selectColorAttribute").value;
	      if(!isNaN(parseFloat(this.data(val+'_g2'))) && !isNaN(parseFloat(this.data(val+'_g1')))){
	        return '<b>'+val +' ' +filenameSplitLeft +'</b>: ' + parseFloat(this.data(val+'_g1')).toFixed(2) +
	        '<br><b>'+val +' ' +filenameSplitRight +'</b>: ' + parseFloat(this.data(val+'_g2')).toFixed(2)} //numbers
	      else if(isNaN(parseFloat(this.data(val+'_g2'))) && !isNaN(parseFloat(this.data(val+'_g1')))){
	        return '<b>'+val +' ' +filenameSplitLeft +'</b>: ' + parseFloat(this.data(val+'_g1')).toFixed(2) +
	        '<br><b>'+val +' ' +filenameSplitRight +'</b>: ' + this.data('val_g2')} //numbers
	      else if(!isNaN(parseFloat(this.data(val+'_g2'))) && isNaN(parseFloat(this.data(val+'_g1')))){
	        return '<b>'+val +' ' +filenameSplitLeft +'</b>: ' + this.data(val+'_g1') +
	        '<br><b>'+val +' ' +filenameSplitRight +'</b>: ' + parseFloat(this.data(val+'_g2')).toFixed(2)} //numbers         //bools
	      else{
	      	return '<b>'+val +' </b>: ' + this.data(val+'_g1');
	    }}},
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
	merge_graph.layout({name: 'dagre'}).run();   
	document.getElementById('KEGGpathsButtonMerge').style.visibility ="visible";
	// set background layer to hoghlight pathways
      layerMerge = merge_graph.cyCanvas({
              zIndex: -1,
            });
      canvasMerge = layerMerge.getCanvas();
      ctxMerge = canvasMerge.getContext('2d');
      var bMerge = $.extend( [], document.getElementById('keggpathwaysMerge').firstChild.data ).join("");
      if(bMerge == "Hide KEGG Pathways" && allPathsMerge){
        highlightKEGGpaths(ctxMerge, canvasMerge, graphLeft, layerMerge, "Merge", allPathsMerge, colorschemePathsMerge);
      }
      else if(bMerge == "Show KEGG Pathways" && allPathsMerge){
        document.getElementById('KEGGpathsMerge').style.visibility ="hidden";
      }

	document.getElementById("keggpathwaysMerge").addEventListener('click', function(){listKEGGPathways('Merge', mergedNodes);});
	document.getElementById("keggpathwaysMerge").style.visibility = "visible";
	document.getElementById('KEGGpathsMerge').style.visibility = "visible";

}

var prevLayout = "";
function changeLayoutMerged(){
  var animateLayout = true;
  var selectedLayout = document.getElementById('selectlayoutMerge').value;
  if(prevLayout == selectedLayout){
    animateLayout = false;
  }
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
    merge_graph.layout({
      name:'klay',
      options
    }).run();
  }
  else if(selectedLayout == "breadthfirst"){
    merge_graph.layout({
        name: "breadthfirst",
        spacingFactor: 0.5,
        animate: animateLayout
      }).run();
  }
  else if(selectedLayout == "dagre (default)"){
    merge_graph.layout({
        name: "dagre",
        animate: animateLayout
      }).run();
  }
  else if(selectedLayout == "cose-bilkent"){
    merge_graph.layout({
        name: "cose-bilkent",
        // Gravity range (constant)
        gravityRange: 1.3,
        animate: true
      }).run();
  }
  else if(selectedLayout == "grid"){
    merge_graph.layout({
        name: "grid",
        animate: animateLayout,
        avoidOverlapPadding: 5
      }).run();
  }
  else{
    merge_graph.layout({
        name: "dagre",
        animate: animateLayout
      }).run();
    document.getElementById('selectlayoutMerge').value = "dagre (default)";
  }
  prevLayout = JSON.parse(JSON.stringify(selectedLayout));
}


function highlightSearchedGene(){
  var gene = document.getElementById('searchgene').value;
  if(gene == ""){
    merge_graph.$('node').style("border-width", 5); 
    merge_graph.$('node[id = "l1"]').style("border-width", 1);  
    merge_graph.$('node[id = "g1"]').style("border-width", 13);  
    merge_graph.$('node[id = "g2"]').style("border-width", 13);  
    document.getElementById('searchgene').value = "Search gene"
  }
  else if(merge_graph.$('node[symbol=\''  + gene + '\']').length>0){
    merge_graph.$('node').style("border-width", 5);
    merge_graph.$('node[symbol =\''  + gene + '\']').style("border-width", 10);
    merge_graph.$('node[id = "l1"]').style("border-width", 1);
    merge_graph.$('node[id = "g1"]').style("border-width", 13);  
    merge_graph.$('node[id = "g2"]').style("border-width", 13);  

  }
  else if(merge_graph.$('node[name =\''  + gene + '\']').length>0){
    merge_graph.$('node').style("border-width", 5);
    merge_graph.$('node[name =\''  + gene + '\']').style("border-width", 10);
    merge_graph.$('node[id = "l1"]').style("border-width", 1);
    merge_graph.$('node[id = "g1"]').style("border-width", 13);  
    merge_graph.$('node[id = "g2"]').style("border-width", 13);  

  }
  else{
    document.getElementById('searchgene').value = gene+" not found"
  }
}

