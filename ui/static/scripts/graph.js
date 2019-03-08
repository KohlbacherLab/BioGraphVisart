/*
  create a graph with Cytoscape
*/

/*
visualize a graph from .graphml-file
*/
// var oncogenes_vogelstein = false;
// var sorafenib_target = false;
// var vcf = false;
// var driver_tag = false;
// var classification = false;
// var classification_set = false;

function visualize() {

  $('#graphName').attr("disabled", true);
  $('#loadGraphml').attr("disabled", true);

  nodeVal = document.getElementById('values').value;

  $('#gfiles').attr("disabled", true);
  // get nodes and edges
  nodeValuesNum = getNodesAndEdges();

  nodeValuesNum = transform01toTF(nodeValuesNum);

  // set min and max for legend
  legendsRange(nodeValuesNum);
  // add nodes and edges to graph
  addNodesAndEdges();

  calculateLayout();

  showLegend();

  document.getElementById('resetLayout').style.visibility = "visible";
  document.getElementById('downloadPart').style.visibility = "visible";

  showMetaInfo();

  activateNodeShapeChange();
}

//initialize legend
/*function createLegend(){
  var defs = svg.append("defs");

  if(nodesMin === "false"){
    svg.append("rect")
    .attr("width", 99)
    .attr("height", 20)
    .style("fill", "#006cf0")
    .attr("x", 0);
     svg.append("rect")
    .attr("width", 99)
    .attr("height", 20)
    .attr("x", 99)
    .style("fill", "#d50000");
  }
  else{
  //Append a linearGradient element to the defs and give it a unique id
  var linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");

  linearGradient.selectAll("stop") 
    .data([                             
        {offset: "0%", color: "#006cf0"}, 
        {offset: "50%", color: "#ffffff"},          
        {offset: "100%", color: "#d50000"}    
      ])                  
    .enter().append("stop")
    .attr("offset", function(d) { return d.offset; }) 
    .attr("stop-color", function(d) { return d.color; });

  svg.append("rect")
  .attr("width", 189)
  .attr("height", 20)
  .style("fill", "url(#linear-gradient)");
}
  if(Number.isFinite(nodesMin)){
    svg.append("text")      
      .attr("x", 94.5 )
      .attr("y", 29 )
      .style("text-anchor", "middle")
      .text("0")
      .attr("id", "mid");
  }

  svg.append("text")      // text label min
        .attr("x", 12 )
        .attr("y", 29 )
        .style("text-anchor", "middle")
        .text(nodesMin)
        .attr("id", 'min');

  svg.append("text")      // text label max
      .attr("x", 179 )
      .attr("y", 29 )
      .style("text-anchor", "middle")
      .text(nodesMax)
      .attr("id",'max');

  svg.append("text")      // text label mid
      .attr("x", 94.5 )
      .attr("y", 50 )
      .style("text-anchor", "middle")
      .text("")
      .attr("id",'legendChanged');
}*/

//get information of nodes ande edges
function getNodesAndEdges(){
  nodes = [];
  edges = [];
  nodeValuesNum = [];
  sorafenibTargets = [];
  oncogenes = [];
  variants=[];
  varSor = [];
  varOnc = [];
  oncSor = [];
  oncSorVar = [];
  drivers = [];
  driOnc = [];
  driOncSor = [];
  driOncVar = [];
  driOncSorVar = [];
  driSor = [];
  driSorVar = [];
  driVar = [];
  nodeValuesNum = [];
  attributesTypes = {};


  var regExp = /\>([^)]+)\</; // get symbol name between > <

  for (var i = 0; i <= graphString.length - 1; i++) {
    if(graphString[i].includes("attr.type=")){
      //var curAttr = {};
      attributesTypes[graphString[i].split(" ")[3].split("\"")[1]] = graphString[i].split(" ")[6].split("\"")[1];
      //attributesTypes.push(curAttr);
    }
    if(graphString[i].includes("node id")){   // get node id
      var curNode = {};
      curNode.id = graphString[i].split("\"")[1]  ;
      nodes.push({data: curNode});
    }
    if(!isEmpty(curNode)){
      if(graphString[i].includes("symbol\"\>")){  // get symbol of node
        var symbol = regExp.exec(graphString[i])[1];
        curNode.symbol = symbol;
      }
      if(graphString[i].includes("\"v_"+nodeVal+"\"\>")){
        var val = regExp.exec(graphString[i])[1]; // if availabe get node value
        if(!isNaN(parseFloat(val))){
          attrID = graphString[i].split(" ")[7].split("\"")[1];
          currVal = {};
          currVal.val = parseFloat(val);
          currVal.attr = attributesTypes[attrID];;
          nodeValuesNum.push(currVal);
        }
        else if(val === "false" || val === "true"){
          currVal = {};
          currVal.val = val;
          currVal.attr = "boolean";
          nodeValuesNum.push(currVal);
        }
        curNode.val = currVal.val;
      }
      if(graphString[i].includes("v_gene_name")){       // get gene names
        var genename = graphString[i].split("\>")[1].split("\<")[0];
        curNode.genename = genename;
      }
       
      //attributes for icons
      // if(graphString[i].includes("v_oncogenes_vogelstein\">true")){
        // if(oncogenes_vogelstein == false){
        //   var table = document.getElementById("arrows");
        //   var row = table.insertRow(6);
        //   var cell1 = row.insertCell(0);
        //   var cell2 = row.insertCell(1);

        //   cell1.innerHTML = "Oncogenes (Vogelstein)";
        //   cell2.innerHTML = "<img width=\"25\" height=\"20\" src='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjIsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4KCjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0iTGF5ZXJfMSIKICAgeD0iMHB4IgogICB5PSIwcHgiCiAgIHdpZHRoPSIyNDkuMjM1cHgiCiAgIGhlaWdodD0iMjQ5LjIzNnB4IgogICB2aWV3Qm94PSIwIDAgMjQ5LjIzNSAyNDkuMjM2IgogICBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyNDkuMjM1IDI0OS4yMzYiCiAgIHhtbDpzcGFjZT0icHJlc2VydmUiCiAgIHNvZGlwb2RpOmRvY25hbWU9ImRpc2Vhc2VfaWNvbnN2Zy5zdmciCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTIuMiA1YzNlODBkLCAyMDE3LTA4LTA2Ij48bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGExMyI+PHJkZjpSREY+PGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPjxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PjxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz48ZGM6dGl0bGU+PC9kYzp0aXRsZT48L2NjOldvcms+PC9yZGY6UkRGPjwvbWV0YWRhdGE+PGRlZnMKICAgICBpZD0iZGVmczExIiAvPjxzb2RpcG9kaTpuYW1lZHZpZXcKICAgICBwYWdlY29sb3I9IiNmZmZmZmYiCiAgICAgYm9yZGVyY29sb3I9IiM2NjY2NjYiCiAgICAgYm9yZGVyb3BhY2l0eT0iMSIKICAgICBvYmplY3R0b2xlcmFuY2U9IjEwIgogICAgIGdyaWR0b2xlcmFuY2U9IjEwIgogICAgIGd1aWRldG9sZXJhbmNlPSIxMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMCIKICAgICBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTQwNyIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSI4NTYiCiAgICAgaWQ9Im5hbWVkdmlldzkiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIgogICAgIGlua3NjYXBlOnpvb209IjAuOTQ2ODkzNzQiCiAgICAgaW5rc2NhcGU6Y3g9IjEyNC42MTc1IgogICAgIGlua3NjYXBlOmN5PSIxMjQuNjE4IgogICAgIGlua3NjYXBlOndpbmRvdy14PSIzNSIKICAgICBpbmtzY2FwZTp3aW5kb3cteT0iMCIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIwIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9IkxheWVyXzEiIC8+PGcKICAgICBpZD0iZzYiCiAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MSI+PHBhdGgKICAgICAgIGZpbGw9IiNGQkZCRkIiCiAgICAgICBkPSJNMjE4Ljk5MiwxMDcuMTFjMCw1LjcxNy0wLjk0MiwxMS4zNTctMi43NTgsMTYuNzhjLTguNTQsMzguNjQyLTgyLjM5Niw4NS4zODgtODUuNTM3LDg3LjM4ICAgYy0wLjk4MSwwLjYwOS0yLjA4MSwwLjkzLTMuMjAzLDAuOTNjLTEuMTIsMC0yLjI0MS0wLjI4OC0zLjIyMy0wLjkzYy0wLjg0Mi0wLjU1Mi0yMS42NDktMTMuNjgyLTQyLjc0Ni0zMS43MjkgICBjLTIuNTI1LTIuMTgxLTIuNzkxLTUuOTM3LTAuNjcxLTguNDUxYzIuMTcxLTIuNDkzLDUuOTIyLTIuOCw4LjQ1My0wLjY3NmMxNS43MjYsMTMuNDMzLDMxLjYxOSwyNC4yOTYsMzguMjE2LDI4LjY3ICAgYzIyLjE3Ny0xNC40NTcsNzEuMTQ2LTUxLjI1LDc3LjE0Ni03OC4zODZjMS41NjktNC43OTEsMi4yNzUtOS4xNSwyLjI3NS0xMy41NzZjMC0xNS40MDQtOC4zODQtMjkuNjA1LTIxLjg5LTM3LjA0NSAgIGMtMTcuMjQ0LTkuNTY3LTQwLjMyOS01LjE1NS01Mi45NDgsMTAuMDUzYy0yLjI2NywyLjc0OS02LjkzMywyLjc0OS05LjI0MiwwQzExMC4yMSw2NC45MTEsODcuMTQzLDYwLjUzMyw2OS45Miw3MC4wNjIgICBjLTEzLjU0Nyw3LjQ1Ni0yMS45MzQsMjEuNjQ4LTIxLjkzNCwzNy4wMzhjMCw0LjM5NSwwLjc0Myw4Ljc3NCwyLjEzMSwxMy4wMDJjMC44ODgsMy45NTUsMi41OTEsNy44MjYsNC43NTYsMTEuODQyaDM0Ljk4NSAgIGwxMi4wMTUtMjcuNjEyYzEuMDI5LTIuMzYzLDMuNDg1LTMuODUsNi4wMTQtMy41ODVjMi41NzYsMC4yMjUsNC43MjQsMi4wNzcsNS4yOTgsNC41OTNsOC44NDQsMzcuMzkybDExLjQzNy0xOC43NjEgICBjMS4wOC0xLjc3OSwzLjAyMS0yLjg3MSw1LjExOS0yLjg3MWgyMS43MWMzLjMwNCwwLDUuOTkxLDIuNjc2LDUuOTkxLDUuOTk2YzAsMy4zMDQtMi42ODgsNS45OTQtNS45OTEsNS45OTRoLTE4LjM0OCAgIGwtMTcuMjM3LDI4LjMxYy0xLjA5OSwxLjgwNy0zLjAzOCwyLjg4MS01LjA5NiwyLjg4MWMtMC4zMjcsMC0wLjY0NC0wLjAyNC0wLjkzNi0wLjA3Yy0yLjQxNS0wLjM4Ny00LjMxNy0yLjE2Ny00Ljg5Ny00LjUyNiAgIGwtOC4wODMtMzQuMDYxbC02LjM4NiwxNC42OThjLTAuOTU1LDIuMjA5LTMuMTE3LDMuNjA1LTUuNTAzLDMuNjA1SDIzLjkxMmMtMy4yOCwwLTUuOTkzLTIuNjg1LTUuOTkzLTUuOTkyICAgYzAtMy4zMDQsMi43MTMtNS45OTMsNS45OTMtNS45OTNoMTcuNTc2Yy0xLjI0Ni0yLjk3NS0yLjI1NC01Ljg2NC0yLjg3OC04LjY1NmMtMS42NzMtNC44NTItMi41NzktMTAuNS0yLjU3OS0xNi4xODggICBjMC0xOS43NjgsMTAuNzUyLTM3Ljk2OCwyOC4xMjItNDcuNTM4YzIwLjExOC0xMS4xMjcsNDYuNzQtNy42MjksNjMuMzY3LDcuOTkzYzE2LjU3OS0xNS42MjUsNDMuMTgzLTE5LjEyMSw2My4zMzUtNy45OTMgICBDMjA4LjIwMiw2OS4xMTYsMjE4Ljk5Miw4Ny4zMjksMjE4Ljk5MiwxMDcuMTF6IgogICAgICAgaWQ9InBhdGg0IgogICAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MSIgLz48L2c+PC9zdmc+' />";

        //   oncogenes_vogelstein = true;
        //   classification = true;

        // }
        
        // var oncogene = curNode.id;
        // if(oncogene == sorafenibTarget && !oncSor.includes(variant)){
        //   oncSor.push(curNode.id);
        //   sorafenibTargets.pop();
        // }
        // else{
        //   oncogenes.push(oncogene);
        // }
      // }

      // if(graphString[i].includes("\"v_sorafenib_targets\">true")){
      //   if(sorafenib_target == false){
      //     // include icon for sorafenib targets in legend
      //     var table = document.getElementById("arrows");
      //     var row = table.insertRow(6);
      //     var cell1 = row.insertCell(0);
      //     var cell2 = row.insertCell(1);

      //     cell1.innerHTML = "Sorafenib target";
      //     cell2.innerHTML = "<img width=\"25\" height=\"20\" src='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjIsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4KCjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0iTGF5ZXJfMSIKICAgeD0iMHB4IgogICB5PSIwcHgiCiAgIHdpZHRoPSIyNDkuMjM1cHgiCiAgIGhlaWdodD0iMjQ5LjIzNnB4IgogICB2aWV3Qm94PSIwIDAgMjQ5LjIzNSAyNDkuMjM2IgogICBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyNDkuMjM1IDI0OS4yMzYiCiAgIHhtbDpzcGFjZT0icHJlc2VydmUiCiAgIHNvZGlwb2RpOmRvY25hbWU9InBpbGxfaWNvbl9yZWRfMjU2LnN2ZyIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC45Mi4yIDVjM2U4MGQsIDIwMTctMDgtMDYiPjxtZXRhZGF0YQogICAgIGlkPSJtZXRhZGF0YTEzIj48cmRmOlJERj48Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+PGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+PGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPjwvY2M6V29yaz48L3JkZjpSREY+PC9tZXRhZGF0YT48ZGVmcwogICAgIGlkPSJkZWZzMTEiIC8+PHNvZGlwb2RpOm5hbWVkdmlldwogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzY2NjY2NiIKICAgICBib3JkZXJvcGFjaXR5PSIxIgogICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiCiAgICAgZ3JpZHRvbGVyYW5jZT0iMTAiCiAgICAgZ3VpZGV0b2xlcmFuY2U9IjEwIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSI3NzgiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iNDgwIgogICAgIGlkPSJuYW1lZHZpZXc5IgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBpbmtzY2FwZTp6b29tPSIwLjk0Njg5Mzc0IgogICAgIGlua3NjYXBlOmN4PSIxMjQuNjE3NSIKICAgICBpbmtzY2FwZTpjeT0iMTI0LjYxOCIKICAgICBpbmtzY2FwZTp3aW5kb3cteD0iMjIzIgogICAgIGlua3NjYXBlOndpbmRvdy15PSI3NCIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIwIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9IkxheWVyXzEiIC8+PGcKICAgICBpZD0iZzYiCiAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MSI+PHBhdGgKICAgICAgIGZpbGw9IiNGQkZCRkIiCiAgICAgICBkPSJNMTk1LjUxMiw1NC4yOTRjLTguMTQyLTguMTQzLTE4LjgxNS0xMi4yMjYtMjkuNDk0LTEyLjIyNmMtMTAuNjc0LDAtMjEuMzUxLDQuMDgzLTI5LjQ3LDEyLjIyNiAgIEw5NC4zOTYsOTYuNDM4bDAsMGwtNDIuMTQyLDQyLjEzNWMtMTYuMjg3LDE2LjI2Ny0xNi4yODcsNDIuNjgsMC4wMSw1OC45NjVjMTYuMjY2LDE2LjI3OCw0Mi42ODIsMTYuMjc4LDU4Ljk1NiwwbDMzLjE2My0zMy4xNSAgIGw1MS4xMTktNTEuMTE5QzIxMS43NzYsOTYuOTc0LDIxMS43NzYsNzAuNTU5LDE5NS41MTIsNTQuMjk0eiBNMTg2LjUzMiwxMDQuMjgzbC00Mi4xNDgsNDIuMTRMMTAzLjM2NSwxMDUuNGw0Mi4xNDItNDIuMTQgICBjNS40NzMtNS40NzQsMTIuNzY1LTguNTA3LDIwLjQ5Mi04LjUwN2M3Ljc1MSwwLDE1LjA0MiwzLjAzMywyMC41MTgsOC41MDdDMTk3LjgzOCw3NC41NjQsMTk3LjgzOCw5Mi45ODMsMTg2LjUzMiwxMDQuMjgzeiIKICAgICAgIGlkPSJwYXRoNCIKICAgICAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjEiIC8+PC9nPjwvc3ZnPg==' />";
      //     sorafenib_target = true;
      //     classification = true;
      //   }
      //   var sorafenibTarget = curNode.id;
      //   sorafenibTargets.push(sorafenibTarget);
      // }

    // if(graphString[i].includes("v_vcf_Sift\">1") || 
    //   graphString[i].includes("v_vcf_PolyPhen2\">1") || 
    //   graphString[i].includes("v_vcf_MetaLR\">1")){

    //     if(vcf == false){
    //       // include icon for sorafenib targets in legend
    //       var table = document.getElementById("arrows");
    //       var row = table.insertRow(6);
    //       var cell1 = row.insertCell(0);
    //       var cell2 = row.insertCell(1);

    //       cell1.innerHTML = "Variant (PolyPhen2, MetaLR, Sift)";
    //       cell2.innerHTML = "<img width=\"25\" height=\"20\" src='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjIsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4KCjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0iTGF5ZXJfMSIKICAgeD0iMHB4IgogICB5PSIwcHgiCiAgIHdpZHRoPSIyNDkuMjM1cHgiCiAgIGhlaWdodD0iMjQ5LjIzNnB4IgogICB2aWV3Qm94PSIwIDAgMjQ5LjIzNSAyNDkuMjM2IgogICBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyNDkuMjM1IDI0OS4yMzYiCiAgIHhtbDpzcGFjZT0icHJlc2VydmUiCiAgIHNvZGlwb2RpOmRvY25hbWU9InZhcmlhbnRfaWNvbi5zdmciCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTIuMiA1YzNlODBkLCAyMDE3LTA4LTA2Ij48bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGEyMSI+PHJkZjpSREY+PGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPjxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PjxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz48ZGM6dGl0bGUgLz48L2NjOldvcms+PC9yZGY6UkRGPjwvbWV0YWRhdGE+PGRlZnMKICAgICBpZD0iZGVmczE5IiAvPjxzb2RpcG9kaTpuYW1lZHZpZXcKICAgICBwYWdlY29sb3I9IiNmZmZmZmYiCiAgICAgYm9yZGVyY29sb3I9IiM2NjY2NjYiCiAgICAgYm9yZGVyb3BhY2l0eT0iMSIKICAgICBvYmplY3R0b2xlcmFuY2U9IjEwIgogICAgIGdyaWR0b2xlcmFuY2U9IjEwIgogICAgIGd1aWRldG9sZXJhbmNlPSIxMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMCIKICAgICBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTI2NiIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSI4NTYiCiAgICAgaWQ9Im5hbWVkdmlldzE3IgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBpbmtzY2FwZTp6b29tPSIyLjU3OTg4NDEiCiAgICAgaW5rc2NhcGU6Y3g9IjEzNC4xNTU2MiIKICAgICBpbmtzY2FwZTpjeT0iMTQwLjEyMjU3IgogICAgIGlua3NjYXBlOndpbmRvdy14PSI2MiIKICAgICBpbmtzY2FwZTp3aW5kb3cteT0iMCIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIwIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9IkxheWVyXzEiIC8+PGcKICAgICBpZD0iZzYiCiAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MSI+PHBhdGgKICAgICAgIGZpbGw9IiNGQkZCRkIiCiAgICAgICBkPSJNNTMuMjkyLDg3LjYzNWMwLjg4OC0yLjk5NywyLjEwOS01LjY2MSw1LjY2MS01LjY2MWMzLjY2MywwLDQuOTk1LDIuNzc1LDUuNzcxLDUuNjYxbDIxLjQyMSw3NS4xNDIgICBjMC43NzcsMi42NjQtMi4yMiw1LjU1LTUuMzI4LDUuNTVjLTMuNDQxLDAtNS4yMTctMi44ODYtNS45OTQtNS41NWwtNC4xMDYtMTMuMzE5SDQ3LjA3NmwtNC4yMTgsMTMuMzE5ICAgYy0wLjc3NywyLjY2NC0yLjU1Myw1LjU1LTUuOTk0LDUuNTVjLTMuMTA3LDAtNi4xMDQtMi44ODYtNS4zMjgtNS41NUw1My4yOTIsODcuNjM1eiBNNTkuMDYzLDEwOC4yOGgtMC4yMjJsLTguNjU3LDMwLjA3OUg2Ny42MSAgIEw1OS4wNjMsMTA4LjI4eiIKICAgICAgIGlkPSJwYXRoNCIKICAgICAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjEiIC8+PC9nPjxwYXRoCiAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxIgogICAgIGlkPSJwYXRoOCIKICAgICBkPSJtIDE4OS45MjYsMTY4LjM2OCBjIC04LjQxMiwwIC0xMy4yMzUsLTMuMzY1IC0xNi44MjUsLTEwLjY1NiBMIDE2Mi43ODIsMTM2Ljg1IGMgLTEuOTA2LC0zLjgxNCAtMy4wMjgsLTcuNDAzIC0zLjAyOCwtMTEuNzc4IDAsLTQuOTM1IDAuODk3LC03Ljk2MyAzLjE0MSwtMTIuNDUgbCAxMC4zMTksLTIwLjc1MSBjIDMuODEzLC03Ljc0IDguNjM3LC0xMC43NjggMTcuMjc0LC0xMC43NjggaCAxOS4wNjggYyAyLjQ2OCwwIDUuNjA4LDEuMzQ2IDUuNjA4LDUuNjA4IDAsNC4wMzggLTMuMDI5LDUuNjA4IC01LjYwOCw1LjYwOCBoIC0xOC43MzIgYyAtNC44MjMsMCAtNS42MDgsMC40NDkgLTcuNzM5LDQuNzExIGwgLTkuNzU5LDE5LjUxNyBjIC0xLjQ1OCwzLjAyOCAtMi4zNTUsNS4wNDcgLTIuMzU1LDguNTI0IDAsMy4xNDEgMS4wMSw1LjA0OCAyLjM1NSw3Ljc0IGwgOS41MzQsMTkuNDA0IGMgMi4yNDMsNC41OTkgMy4zNjUsNC45MzYgOC40MTMsNC45MzYgaCAxOC4yODMgYyAyLjQ2OCwwIDUuNjA4LDEuMzQ2IDUuNjA4LDUuNjA4IDAsNC4wMzggLTMuMDI5LDUuNjA4IC01LjYwOCw1LjYwOCBoIC0xOS42MyB6IiAvPjxnCiAgICAgaWQ9ImcxNCIKICAgICBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxIj48cGF0aAogICAgICAgZmlsbD0iI0ZCRkJGQiIKICAgICAgIGQ9Ik0xNDguNzM3LDEyNS4wOTlMMTM0LjIsMTQxLjc1N3YtMTIuNDNIOTIuMTU3di04LjQyMUgxMzQuMnYtMTIuNDNMMTQ4LjczNywxMjUuMDk5eiIKICAgICAgIGlkPSJwYXRoMTIiCiAgICAgICBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxIiAvPjwvZz48L3N2Zz4='>";
    //       vcf = true;
    //       classification = true;
    //     }

    //     var variant = curNode.id;
    //     if(variant == sorafenibTarget && !varSor.includes(variant)){
    //       varSor.push(curNode.id);
    //       sorafenibTargets.pop();
    //     }
    //     if(variant == oncogene){
    //       varOnc.push(curNode.id);
    //       oncogenes.pop();
    //     }
    //     if(variant == oncogene && variant == sorafenibTarget && !oncSorVar.includes(variant)){
    //       oncSorVar.push(curNode.id);
    //       sorafenibTargets.pop();
    //       oncogenes.pop();
    //       varSor.pop();
    //       oncSor.pop()
    //     }
    //     else{
    //        variants.push(variant);
    //     }
    //   }
      
    }

    // if(graphString[i].includes("v_drivers_Uniprot\">true") || 
    //   graphString[i].includes("v_drivers_tsgene\">true") || 
    //   graphString[i].includes("v_drivers_vogelstein\">true")||
    //   graphString[i].includes("v_drivers_Rubio-Perez\">true") ||
    //   graphString[i].includes("v_drivers_cosmic\">true")){

    //     if(driver_tag == false){
    //       // include icon for sorafenib targets in legend
    //       var table = document.getElementById("arrows");
    //       var row = table.insertRow(6);
    //       var cell1 = row.insertCell(0);
    //       var cell2 = row.insertCell(1);

    //       cell1.innerHTML = "Driver (Uniprot, tsgene, vogel-<br>stein, Rubio-Perez, cosmic)";
    //       cell2.innerHTML = "<img width=\"25\" height=\"20\" src='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjIsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4KCjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0iTGF5ZXJfMSIKICAgeD0iMHB4IgogICB5PSIwcHgiCiAgIHdpZHRoPSIyNDkuMjM1cHgiCiAgIGhlaWdodD0iMjQ5LjIzNnB4IgogICB2aWV3Qm94PSIwIDAgMjQ5LjIzNSAyNDkuMjM2IgogICBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyNDkuMjM1IDI0OS4yMzYiCiAgIHhtbDpzcGFjZT0icHJlc2VydmUiCiAgIHNvZGlwb2RpOmRvY25hbWU9ImdlbmVfaWNvbi5zdmciCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTIuMiA1YzNlODBkLCAyMDE3LTA4LTA2Ij48bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGExNSI+PHJkZjpSREY+PGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPjxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PjxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz48ZGM6dGl0bGU+PC9kYzp0aXRsZT48L2NjOldvcms+PC9yZGY6UkRGPjwvbWV0YWRhdGE+PGRlZnMKICAgICBpZD0iZGVmczEzIiAvPjxzb2RpcG9kaTpuYW1lZHZpZXcKICAgICBwYWdlY29sb3I9IiNmZmZmZmYiCiAgICAgYm9yZGVyY29sb3I9IiM2NjY2NjYiCiAgICAgYm9yZGVyb3BhY2l0eT0iMSIKICAgICBvYmplY3R0b2xlcmFuY2U9IjEwIgogICAgIGdyaWR0b2xlcmFuY2U9IjEwIgogICAgIGd1aWRldG9sZXJhbmNlPSIxMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMCIKICAgICBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTMzOCIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSI3MzMiCiAgICAgaWQ9Im5hbWVkdmlldzExIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBpbmtzY2FwZTp6b29tPSIwLjk0Njg5Mzc0IgogICAgIGlua3NjYXBlOmN4PSIxMjQuNjE3NSIKICAgICBpbmtzY2FwZTpjeT0iMTI0LjYxOCIKICAgICBpbmtzY2FwZTp3aW5kb3cteD0iODQiCiAgICAgaW5rc2NhcGU6d2luZG93LXk9IjIiCiAgICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMCIKICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJMYXllcl8xIiAvPjxnCiAgICAgaWQ9Imc4IgogICAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjEiPjxnCiAgICAgICBpZD0iZzYiCiAgICAgICBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxIj48cGF0aAogICAgICAgICBmaWxsPSIjRkJGQkZCIgogICAgICAgICBkPSJNMjI1LjE1Miw3NS4wNjVjLTMuNzI4LTAuODMzLTcuNzA4LDEuNzI1LTguNDg0LDUuMTk5Yy0wLjIxNSwwLjgyMi0wLjk5OSwzLjUxNi0yLjg3Niw3LjE0MSAgICBsLTUwLjI3OS01MC4yNzhjNC4xMjktMi4xMDQsNy4wMTYtMi43NzIsNy4wOTMtMi43OTRjOS4xODQtMi4xNTQsNS45MDgtMTYuMDMtMy4yODgtMTMuODU2ICAgIGMtMC41NjksMC4xMzktNTYuMzI0LDE0LjY5NC00Ny4xNjQsOTQuMjhjLTMuNjYtMC4yMzgtNy4zMDgtMC4zNTQtMTAuODg5LTAuMzU0Yy02NS4wMDYsMC04OS44OCw0MC44NTUtOTAuOTAxLDQyLjU3NiAgICBjLTQuODYzLDguMTk3LDcuNDUxLDE1LjA5NiwxMi4yMTYsNy4zMDhjMC4zNzctMC42MTcsMi4zMjgtMy42ODgsNi4yNTEtNy44MzRsNTcuNjg0LDU3LjcwM2MtNC4xMSwzLjg4Ny03LjE4OCw1Ljg1Mi03Ljc3MSw2LjIxICAgIGMtOC4wOTEsNC44MTctMC44NjUsMTYuOTY4LDcuMjM4LDEyLjI2MmMxLjkzOC0xLjE2LDQ3LjE0OS0yOC45MTEsNDIuMjI1LTEwMS44MjVjNTguMjk3LDYuNzY4LDg4LjM5Ni0yMi44MzgsOTQuMzAzLTQ3LjIyMSAgICBDMjMxLjM5Niw3OS43MTQsMjI4LjkyNyw3NS44NjcsMjI1LjE1Miw3NS4wNjV6IE0xMjAuOTM0LDE2MC42MzZsLTMwLjU5Ny0zMC42MDRjOS43NjMtMS40NzksMjAuNjQtMS43NzMsMzEuNDcxLTAuODc1ICAgIEMxMjIuNzI4LDE0MC4xNTcsMTIyLjQzMiwxNTAuNzMyLDEyMC45MzQsMTYwLjYzNnogTTczLjM0LDEzMy44MTFsNDMuNjE3LDQzLjg2OWMtNC4zNjcsMTIuOTMtOS42NjgsMjEuNjE0LTEzLjM5OSwyNS45NjUgICAgTDQ3LjM4LDE0Ny4yNzJDNTcuMDg5LDEzOS4zOTEsNjkuNjc4LDEzNS40NTQsNzMuMzQsMTMzLjgxMXogTTEzMy43NzIsODcuMTg3bDI5Ljg1OSwyOS45NjkgICAgYy04Ljc5NSwwLjg0MS0xOC42NDEsMC41NDYtMjguOTU0LTAuODQyQzEzMy4yNTYsMTA1LjgyMiwxMzIuOTQ4LDk2LjAzMSwxMzMuNzcyLDg3LjE4N3ogTTE4MC44MjcsMTEzLjczMWwtNDMuODEzLTQzLjQ1MyAgICBjMy4xOS0xMC4zMTQsNy43NzMtMTcuNDc3LDEzLjg4Mi0yMy45MTlsNTMuOTE1LDUzLjEyN2wtMC41NzMsMC43MTJDMTk1LjY1OCwxMDguNTA2LDE4NC40ODcsMTEzLjExMSwxODAuODI3LDExMy43MzF6IgogICAgICAgICBpZD0icGF0aDQiCiAgICAgICAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjEiIC8+PC9nPjwvZz48L3N2Zz4='>";
    //       driver_tag = true;
    //       classification = true;
    //     }

    //     var driver = curNode.id;
    //     if(driver == sorafenibTarget && !driSor.includes(driver)){
    //       driSor.push(curNode.id);
    //       sorafenibTargets.pop();
    //     }
    //     if(driver == oncogene && !driOnc.includes(driver)){
    //       driOnc.push(curNode.id);
    //       oncogenes.pop();
    //     }
    //     if(driver == variant && !driVar.includes(driver)){
    //       driVar.push(driver);
    //       variants.pop();
    //     }
    //     if(driver == oncogene && driver == sorafenibTarget && !driOncSor.includes(driver)){
    //       driOncSor.push(curNode.id);
    //       sorafenibTargets.pop();
    //       oncogenes.pop();
    //       driOnc.pop();
    //       driSor.pop();
    //     }
    //     if(driver == oncogene && driver == variant && !driOncVar.includes(driver)){
    //       driOncVar.push(curNode.id);
    //       oncogenes.pop();
    //       variants.pop();
    //       driOnc.pop();
    //       driVar.pop();
    //     }
    //     if(driver == sorafenibTarget && driver == variant && !driSorVar.includes(driver)){
    //       driSorVar.push(curNode.id);
    //       sorafenibTargets.pop();
    //       variants.pop();
    //       driSor.pop();
    //       driVar.pop();
    //     }
    //     if(driver == oncogene && driver == sorafenibTarget && driver == variant && !driOncSorVar.includes(driver)){
    //       driOncSorVar.push(curNode.id);
    //       sorafenibTargets.pop();
    //       oncogenes.pop();
    //       variants.pop();
    //       driSor.pop();
    //       driOnc.pop();
    //       driVar.pop();
    //     }
    //     if(! drivers.includes(driver)){
    //        drivers.push(driver);
    //       }
    //     }
    
    // if(classification == true && classification_set == false){
    //   var table = document.getElementById("arrows");
    //       var row = table.insertRow(5);
    //       var cell1 = row.insertCell(0);

    //       cell1.innerHTML = "<span style=\"font-size:15px\" ><b> Classification</b></span>";

    //       classification_set = true;
    //   }

    if(graphString[i].includes("edge source")){     // get edges
      var curEdge = {};
      s = graphString[i].split("\"")[1];
      t = graphString[i].split("\"")[3];
      curEdge.id = s.concat(t);
      curEdge.source = s;
      curEdge.target = t;
    }
    if(!isEmpty(curEdge)){
      if(graphString[i].includes("e_interaction")){     // get edges interaction type
        var interact = regExp.exec(graphString[i])[1]; 
        curEdge.interaction = interact;
      }
      curEdge.id = curEdge.id +'_'+ curEdge.interaction;
      edges.push({data: curEdge} );
    }
  }
  var legendNode = {};
  legendNode.id = "l1";
  legendNode.symbol = "legend";
  nodes.push({data:legendNode});
  return nodeValuesNum;
}

//transform 0 and 1 as atttributes to true and false
function transform01toTF(nodeValuesNumT){
  // if attributes values are only 0 or 1 make them boolean
  nodeValues = [];
  lenNodeValues = nodeValuesNumT.length;
  // attribute not available 
  if(isEmpty(nodeValuesNumT)){
      return [];
  }
  else if(!isEmpty(nodeValuesNumT)){
    for(var i=0; i < nodeValuesNumT.length; i++){
      attrType = Object.entries(nodeValuesNumT[i])[1][1];
      // boolean attributes and boolean atribtes stored as 0 or 1
      if(attrType == "boolean" ){
          if(Object.entries(nodeValuesNumT[i])[0][1] == 0){
            nodeValues.push("false");
          }
          if(Object.entries(nodeValuesNumT[i])[0][1] == 1){
            nodeValues.push("true"); 
          } 
       // }
        delete nodeValuesNumT[i];  
        lenNodeValues -=1;
      }
      
      // double attributes
      if(attrType === "double"){
        //nodeEntry.data.val = Object.entries(nodeValuesNumT[i])[0][1];
        nodeValues.push(Object.entries(nodeValuesNumT[i])[0][1])
      }
    }
  }
  if(lenNodeValues == 0){
    return ["empty"];
  } 
  
  return nodeValues;
  
}

//set legends range by min and max of nodes' attributes
function legendsRange(nodeValuesNum){
  if(!isEmpty(nodeValuesNum)){
    if(!nodeValuesNum.includes("empty")){
      //nodesMin = parseFloat(Math.max.apply(Math,nodeValuesNum).toFixed(2));
      //nodesMax = parseFloat(Math.max.apply(Math,nodeValuesNum).toFixed(2));
      nodesMin = nodeValuesNum.reduce(function(a, b) {
                  return parseFloat(Math.min(a, b).toFixed(2));
                });
      nodesMax = nodeValuesNum.reduce(function(a, b) {
            return parseFloat(Math.max(a, b).toFixed(2));
          });
    if(!firstTime){
      if(nodesMin>oldMin){
        nodesMin = oldMin;
      }
      if(nodesMax<oldMax){
        nodesMax = oldMax;
      }
    }

    if(nodesMin >= 0){
      nodesMin = -1.0;
    }
    if(nodesMax <= 0){
      nodesMax = 1.0;
    }
  }
    else{
      nodesMin = "false";
      nodesMax = "true";
    }
  }
  
  else if(isEmpty(nodeValuesNum)){
    nodesMin = "false";
    nodesMax = "true";
  }

  if((!firstTime && !(nodesMax === oldMax)) || (!firstTime && !(nodesMin === oldMin))){
    oldMax = nodesMax;
    oldMin = nodesMin;
    $("#svgid").empty();
    //createLegend();
     $("#legendChanged").text("Legend\'s limits changed");
  }
  else{
    $("#legendChanged").text("");
  }
}

/*
  Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 */
function getTextWidth(text, font) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
}

//add nodes and edges to cy-object (update if attribute has changed)
function addNodesAndEdges(){

  cy.add(nodes.concat(edges));

  // calculate label position for legend and style legend
  var fontSize = 10;
  var labelVal = nodeVal;
  var whitespace = getTextWidth(' ', fontSize +" arial");
  var minspace = getTextWidth(nodesMin, fontSize +" arial");
  var valspace = getTextWidth(labelVal, fontSize +" arial");
  var maxspace = getTextWidth(nodesMax, fontSize +" arial");
  var neededWhitespace = ((200-(minspace+whitespace+valspace+whitespace+maxspace))/whitespace)/2;
  if(neededWhitespace <= 0){

    while(neededWhitespace <= 0){
      labelVal = labelVal.slice(0, -1);
      valspace = getTextWidth(labelVal+'...', fontSize +" arial");

      neededWhitespace = ((200-(minspace+whitespace+valspace+whitespace+maxspace))/whitespace)/2;
    }
    labelVal = labelVal+'...';
  }
  
  cy.$('node[id = "l1"]')
    .style('background-image','data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnOTExIgogICB3aWR0aD0iNTIuOTE2NjY4bW0iCiAgIGhlaWdodD0iMTMuMjI5MTY3bW0iCiAgIHZpZXdCb3g9IjAgMCAyMDAuMDAwMDEgNTAuMDAwMDAzIgogICBzb2RpcG9kaTpkb2NuYW1lPSJsZWdlbmQyLnN2ZyIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC45Mi4yIDVjM2U4MGQsIDIwMTctMDgtMDYiPgogIDxtZXRhZGF0YQogICAgIGlkPSJtZXRhZGF0YTkxNyI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGRlZnMKICAgICBpZD0iZGVmczkxNSI+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIGlkPSJsaW5lYXJHcmFkaWVudDQ4MTEiPgogICAgICA8c3RvcAogICAgICAgICBpZD0ic3RvcDQ4MDkiCiAgICAgICAgIG9mZnNldD0iMCIKICAgICAgICAgc3R5bGU9InN0b3AtY29sb3I6I2Q1MDAwMDtzdG9wLW9wYWNpdHk6MDsiIC8+CiAgICAgIDxzdG9wCiAgICAgICAgIGlkPSJzdG9wNDgwNyIKICAgICAgICAgb2Zmc2V0PSIxIgogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojZDUwMDAwO3N0b3Atb3BhY2l0eToxOyIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIGlkPSJsaW5lYXJHcmFkaWVudDQ3MzEiPgogICAgICA8c3RvcAogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojMDA2Y2YwO3N0b3Atb3BhY2l0eToxOyIKICAgICAgICAgb2Zmc2V0PSIwIgogICAgICAgICBpZD0ic3RvcDQ3MjciIC8+CiAgICAgIDxzdG9wCiAgICAgICAgIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDZjZjA7c3RvcC1vcGFjaXR5OjA7IgogICAgICAgICBvZmZzZXQ9IjEiCiAgICAgICAgIGlkPSJzdG9wNDcyOSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIHhsaW5rOmhyZWY9IiNsaW5lYXJHcmFkaWVudDQ3MzEiCiAgICAgICBpZD0ibGluZWFyR3JhZGllbnQ0NzMzIgogICAgICAgeDE9Ii0wLjE3MjUzNzg5IgogICAgICAgeTE9IjI1LjA0MjMwNyIKICAgICAgIHgyPSIxMDAuMDA3MzEiCiAgICAgICB5Mj0iMjUuMjIyMTYyIgogICAgICAgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiCiAgICAgICBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMTcyNTI4MTMsLTUwLjA0MjMwNSkiIC8+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIHhsaW5rOmhyZWY9IiNsaW5lYXJHcmFkaWVudDQ4MTEiCiAgICAgICBpZD0ibGluZWFyR3JhZGllbnQ0ODEzIgogICAgICAgeDE9IjEwMC43MTk0MiIKICAgICAgIHkxPSI3OC41OTI4ODgiCiAgICAgICB4Mj0iMTk5LjgyMDE0IgogICAgICAgeTI9Ijc4LjA1MzMyMiIKICAgICAgIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIgogICAgICAgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgwLjE3OTg0ODEzLC01My4wNTMzMjIpIiAvPgogIDwvZGVmcz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEiCiAgICAgb2JqZWN0dG9sZXJhbmNlPSIxMCIKICAgICBncmlkdG9sZXJhbmNlPSIxMCIKICAgICBndWlkZXRvbGVyYW5jZT0iMTAiCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAiCiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE2NTYiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iMTE0OCIKICAgICBpZD0ibmFtZWR2aWV3OTEzIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBmaXQtbWFyZ2luLXRvcD0iMCIKICAgICBmaXQtbWFyZ2luLWxlZnQ9IjAiCiAgICAgZml0LW1hcmdpbi1yaWdodD0iMCIKICAgICBmaXQtbWFyZ2luLWJvdHRvbT0iMCIKICAgICBzaG93Ym9yZGVyPSJmYWxzZSIKICAgICB1bml0cz0ibW0iCiAgICAgaW5rc2NhcGU6c25hcC1nbG9iYWw9InRydWUiCiAgICAgaW5rc2NhcGU6bG9ja2d1aWRlcz0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC1ub2Rlcz0idHJ1ZSIKICAgICBpbmtzY2FwZTpzbmFwLW90aGVycz0idHJ1ZSIKICAgICBpbmtzY2FwZTpzbmFwLW9iamVjdC1taWRwb2ludHM9ImZhbHNlIgogICAgIGlua3NjYXBlOnNuYXAtY2VudGVyPSJmYWxzZSIKICAgICBpbmtzY2FwZTpzbmFwLXRleHQtYmFzZWxpbmU9ImZhbHNlIgogICAgIGlua3NjYXBlOnNuYXAtcGFnZT0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC1ncmlkcz0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC10by1ndWlkZXM9ImZhbHNlIgogICAgIGlua3NjYXBlOnpvb209IjUuNTYiCiAgICAgaW5rc2NhcGU6Y3g9Ijk5LjgyMDEzNyIKICAgICBpbmtzY2FwZTpjeT0iMjQuMTAwNzA2IgogICAgIGlua3NjYXBlOndpbmRvdy14PSI0OTgiCiAgICAgaW5rc2NhcGU6d2luZG93LXk9IjEzNyIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIwIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9InN2ZzkxMSIgLz4KICA8cmVjdAogICAgIHN0eWxlPSJvcGFjaXR5OjA7ZmlsbDojZmYwMDAwO2ZpbGwtb3BhY2l0eToxIgogICAgIGlkPSJyZWN0MzI0NCIKICAgICB3aWR0aD0iNTY2IgogICAgIGhlaWdodD0iNjAiCiAgICAgeD0iLTEuMjAxMjQ4MiIKICAgICB5PSI3MjUuNDE1NzEiIC8+CiAgPHJlY3QKICAgICBzdHlsZT0ib3BhY2l0eTowO2ZpbGw6I2ZmMDAwMDtmaWxsLW9wYWNpdHk6MSIKICAgICBpZD0icmVjdDMyNDYiCiAgICAgd2lkdGg9IjkuNjE2NTA0NyIKICAgICBoZWlnaHQ9IjE1My44NjQwNyIKICAgICB4PSIzNjIuODUyMTciCiAgICAgeT0iNTg2LjIxNjY3IiAvPgogIDxyZWN0CiAgICAgc3R5bGU9Im9wYWNpdHk6MDtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjEiCiAgICAgaWQ9InJlY3QzMjQ4IgogICAgIHdpZHRoPSI0NTMuMzQ5NTIiCiAgICAgaGVpZ2h0PSIxNTcuOTg1NDQiCiAgICAgeD0iMi45MjAxMDUiCiAgICAgeT0iNDU3LjA4MDc1IiAvPgogIDxyZWN0CiAgICAgc3R5bGU9Im9wYWNpdHk6MDtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjEiCiAgICAgaWQ9InJlY3QzMjUwIgogICAgIHdpZHRoPSI2OTUuMTM1OTMiCiAgICAgaGVpZ2h0PSIyMDguODE1NTQiCiAgICAgeD0iLTEwOC4zNTY2IgogICAgIHk9IjQzMC45Nzg4MiIgLz4KICA8cmVjdAogICAgIHN0eWxlPSJvcGFjaXR5OjA7ZmlsbDojZmYwMDAwO2ZpbGwtb3BhY2l0eToxIgogICAgIGlkPSJyZWN0MzI1MiIKICAgICB3aWR0aD0iNTcxLjQ5NTEyIgogICAgIGhlaWdodD0iMjc3LjUwNDg1IgogICAgIHg9Ii04LjA3MDE5MDQiCiAgICAgeT0iMTAwNi41OTUzIiAvPgogIDxlbGxpcHNlCiAgICAgc3R5bGU9Im9wYWNpdHk6MDtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjEiCiAgICAgaWQ9InBhdGgzMjU0IgogICAgIGN4PSIxNjAuOTA1NTMiCiAgICAgY3k9IjM4OC4zOTE0OCIKICAgICByeD0iOTcuNTM4ODM0IgogICAgIHJ5PSIxMjUuMDE0NTYiIC8+CiAgPGVsbGlwc2UKICAgICBzdHlsZT0ib3BhY2l0eTowO2ZpbGw6I2ZmMDAwMDtmaWxsLW9wYWNpdHk6MSIKICAgICBpZD0icGF0aDMyNTYiCiAgICAgY3g9IjEwMi41MTk2MSIKICAgICBjeT0iNDMwLjI5MTkzIgogICAgIHJ4PSIyMzYuOTc4MTUiCiAgICAgcnk9IjE3Ni41MzE1NiIgLz4KICA8cmVjdAogICAgIHN0eWxlPSJvcGFjaXR5OjE7ZmlsbDp1cmwoI2xpbmVhckdyYWRpZW50NDczMyk7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm8iCiAgICAgaWQ9InJlY3Q0NzE3IgogICAgIHdpZHRoPSIyMDAiCiAgICAgaGVpZ2h0PSI1MCIKICAgICB4PSIwIgogICAgIHk9Ii01MCIKICAgICB0cmFuc2Zvcm09InNjYWxlKDEsLTEpIiAvPgogIDxyZWN0CiAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOnVybCgjbGluZWFyR3JhZGllbnQ0ODEzKTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgIGlkPSJyZWN0NDgwNSIKICAgICB3aWR0aD0iMjAwIgogICAgIGhlaWdodD0iNTAiCiAgICAgeD0iMCIKICAgICB5PSIwIiAvPgo8L3N2Zz4K')
    .style('color', 'black')
    .style('background-height',50)
    .style('background-width',200)
    .style('background-position-y','100%')
    .style('shape', 'rectangle')
    .style('width',200)
    .style('height',50)
    .style('border-width',1)
    .style('label', nodesMin+' '+' '.repeat(neededWhitespace)+ labelVal +' '+' '.repeat(neededWhitespace) + nodesMax, "Arial")
    .style('text-valign' , 'bottom')
    .style('text-max-width', 200)

  for(var i = 0, len = sorafenibTargets.length; i < len; i++){
    n = sorafenibTargets[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
      .style('background-image', pill_black) 
      .style('background-height','40%')
      .style('background-width','40%')
      .style('background-position-y','90%')
      //.style('color','#b8b8b8');
    });
  };

  for(var i = 0, len = oncogenes.length; i < len; i++){
    n = oncogenes[i];
    cy.batch(function(){
      cy.$('node[id=\''+n+'\']')
        .style('background-image', disease_black) 
        .style('background-height','40%')
        .style('background-width','40%')
        .style('background-position-y','90%')
        });
  };
  for(var i = 0, len = variants.length; i < len; i++){
    n = variants[i];
    cy.batch(function(){
      cy.$('node[id=\''+n+'\']')
        .style('background-image', variant_black) 
        .style('background-height','40%')
        .style('background-width','40%')
        .style('background-position-y','90%')
        });
  };

  for(var i = 0, len = varSor.length; i < len; i++){
    n = varSor[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', variant_pill) 
        .style('background-height','40%')
        .style('background-width','50%')
        .style('background-position-y','93%')
        });
  };

  for(var i = 0, len = varOnc.length; i < len; i++){
    n = varOnc[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', variant_disease) 
        .style('background-height','40%')
        .style('background-width','50%')
        .style('background-position-y','93%')
        });
  };

  for(var i = 0, len = oncSor.length; i < len; i++){
    n = oncSor[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', pill_disease) 
        .style('background-height','40%')
        .style('background-width','50%')
        .style('background-position-y','90%')
        });
  };

  for(var i = 0, len = oncSorVar.length; i < len; i++){
    n = oncSorVar[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', pill_disease_variant) 
        .style('background-height','40%')
        .style('background-width','50%')
        .style('background-position-y','90%')
      });
  };

  for(var i = 0, len = drivers.length; i < len; i++){
    n = drivers[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', gene_black) 
        .style('background-height','40%')
        .style('background-width','40%')
        .style('background-position-y','93%')
      });
  };

  for(var i = 0, len = driSor.length; i < len; i++){
    n = driSor[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', gene_pill) 
        .style('background-height','60%')
        .style('background-width','60%')
        .style('background-position-y','93%')
        });
  };

  for(var i = 0, len = driVar.length; i < len; i++){
    n = driVar[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', gene_variant) 
        .style('background-height','60%')
        .style('background-width','60%')
        .style('background-position-y','93%')
        });
  };

  for(var i = 0, len = driOnc.length; i < len; i++){
    n = driOnc[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', gene_disease) 
        .style('background-height','50%')
        .style('background-width','50%')
        .style('background-position-y','99%')
        });
  };

  for(var i = 0, len = driSorVar.length; i < len; i++){
    n = driSorVar[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', gene_variant_pill) 
        .style('background-height','40%')
        .style('background-width','50%')
        .style('background-position-y','90%')
        });
  };

  for(var i = 0, len = driOncVar.length; i < len; i++){
    n = driOncVar[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', gene_variant_disease) 
        .style('background-height','40%')
        .style('background-width','50%')
        .style('background-position-y','90%')
        });
  };
  for(var i = 0, len = driOncSor.length; i < len; i++){
    n = driOncSor[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', gene_pill_disease) 
        .style('background-height','40%')
        .style('background-width','50%')
        .style('background-position-y','90%')
      });
  };
  for(var i = 0, len = driOncSorVar.length; i < len; i++){
    n = driOncSorVar[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', gene_pill_disease_variant) 
        .style('background-height','40%')
        .style('background-width','50%')
        .style('background-position-y','90%')
        });
  };
  // update node values if tracer or values change
  if(!firstTime){
    for(n=0; n < nodes.length; n++){
      cy.batch(function(){
      cy.$('node[id =\''  + nodes[n].data.id + '\']')
        .data('val', nodes[n].data.val)
      });
    }
  }
}

//calculate graph layout (only once)
function calculateLayout(){

  // calculate layout and legend only once
  if(firstTime){
      firstTime = false;

      cy.layout({
      name: 'dagre',
        // Whether to fit the network view after when done
      fit: true,

      // Padding on fit
      padding: 30
        }).run();
      $('#download').removeAttr('disabled');

      // create Legend
      // svg = d3.select("#legend").append("svg")
      // .attr("id", "svgid");
      // svg.attr("width", 189).attr("height", 60);
      // createLegend();
      oldMin = nodesMin;
      oldMax = nodesMax;

      // mouve legend
      /*var mousePosition;
      var offset = [0,0];
      var isDown = false;

      var leg = document.getElementById('legend');
      leg.addEventListener('mousedown', function(e) {
          isDown = true;
          offset = [
              leg.offsetLeft - e.clientX,
              leg.offsetTop - e.clientY
          ];
        }, true);

      document.addEventListener('mouseup', function() {
          isDown = false;
      }, true);

      document.addEventListener('mousemove', function(event) {
          event.preventDefault();
          if (isDown) {
              mousePosition = {

                  x : event.clientX,
                  y : event.clientY

              };
              leg.style.left = (mousePosition.x + offset[0]) + 'px';
              leg.style.top  = (mousePosition.y + offset[1]) + 'px';
          }
      }, true);*/
  }
}

//show legend
function showLegend(){
  // show legend and update if necessary
  document.getElementById('legend').setAttribute('style','visibility:visible');
  /*if(!isNaN(nodesMin) && (!isNaN(nodesMax)))  {    // numerical attribute
    $("#mid").text("0");
    $("#min").text(nodesMin);
    $("#max").text(nodesMax);

    cy.style()                // update the elements in the graph with the new style
    .selector('node[val <0]')
        .style('background-color', 'mapData(val,'+ nodesMin+', 0, #006cf0, white)').update();
    cy.style()               
    .selector('node[val <0]')
        .style('color', 'black').update();
    cy.style() 
      .selector('node[val <='+0.5*nodesMin+']')
        .style('color', 'white').update();
    cy.style() 
      .selector('node[val >0]')
        .style('background-color', 'mapData(val, 0,'+ nodesMax+', white, #d50000)').update();
    cy.style() 
      .selector('node[val >0]')
        .style('color', 'black').update();
    cy.style() 
      .selector('node[val >='+0.5*nodesMax+']')
        .style('color', 'white').update();
  }
  else{
    $("#mid").text("");         // boolean attribute
  
    $("#min").text(nodesMin);
    $("#max").text(nodesMax);
  }*/
}

//show meta-information of nodes by mouseover
function showMetaInfo(){
  cy.elements('node').qtip({       // show node attibute value by mouseover
    show: {   
      event: 'mouseover', 
      solo: true,
    },
    content: {text : function(){
      if(!isNaN(parseFloat(this.data('val')))){
        return '<b>'+nodeVal +'</b>: ' + parseFloat(this.data('val')).toFixed(2) +
        '<br>' + '<b>gene name</b>: ' + this.data('genename'); } //numbers
      else{
        return '<b>'+nodeVal +'</b>: '+ this.data('val') +
        '<br>' + '<b>gene name</b>: ' + this.data('genename');          //bools
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
}

/* helper functions */
// test if object is empty
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

//remove all options of dropdown
function removeOptions(selectbox){
    var i;
    for(i = selectbox.options.length - 1 ; i >= 0 ; i--)
    {
        selectbox.remove(i);
    }
}

// show drop downs for nodes' shapes attribute and shape itself
function activateNodeShapeChange(){
  document.getElementById('nodeShapesAttr').setAttribute('style','visibility:visible');
  document.getElementById('nodeShapes').setAttribute('style','visibility:visible');
}

/*
  change node shape of nodes with given attribute
*/
function changeNodeShapes(){
  var shapeAttribute = document.getElementById('nodeShapesAttr').value;
  var shape = document.getElementById('nodeShapes').value;

  if(shapeAttribute == "" || shape == ""){
    return;
  }

  // select nodes with given attribute
  var i = 0;
  var id = "";
  while(i < graphString.length){

    if(graphString[i].includes("node id")){   // get node id
      id = graphString[i].split("\"")[1];
    } 
    else if(id != "" && graphString[i].includes('\"v_'+shapeAttribute+'\">true<')){

      cy.style()
        .selector('node[id ="'+id+'"]')        
        .style('shape', shape)
        .update();

    }
    i++;
  }

  // list all shapes already used
  usedShapes = []
  for (var key in usedShapeAttributes) {
    if (Object.prototype.hasOwnProperty.call(usedShapeAttributes, key)) {
        var val = usedShapeAttributes[key];
        usedShapes[val] = key;
    }
  }

  // no shapes have been used so far
  if(isEmpty(usedShapeAttributes)){
    usedShapeAttributes[shapeAttribute] = shape;
     shapeNode = cytoscape({
        container: document.getElementById('legend'),
        layout: {
          name: 'preset'
        },
        style: [
            {selector: 'node',
              style: {
              width: 18,
              height: 18,
              shape: shape,
              'background-color': '#666666',
              label: 'data(id)',
              'font-size': 10
            }
          }
        ]
      });

 
   shapeNode.add({ // node n1
              group: 'nodes', 

              data: { 
                id: shapeAttribute, 
              },
              position: { // the model position of the node (optional on init, mandatory after)
                x: 80,
                y: 50
              },
               locked: true,
            });
   ycoord = 50;
  } 

  // test if shape has been used for another attribute
  else if(Object.keys(usedShapes).includes(shape)){
    if(usedShapes[shape] == shapeAttribute) return;
    var replace = confirm("Shape is already used. Do you want to replace "+usedShapes[shape]+" by "+ shapeAttribute+"?")

    // is shape has been used change previous attributes shape back to ellipse
    if(replace){
      delete(usedShapeAttributes[usedShapes[shape]]);
      ycoord = shapeNode.$('node[id ="'+usedShapes[shape]+'"]').position()['y']-35;
      shapeNode.remove('node[id ="'+usedShapes[shape]+'"]');

      var i = 0;
      var id = "";
      while(i < graphString.length){

        if(graphString[i].includes("node id")){   // get node id
          id = graphString[i].split("\"")[1];
        } 
        else if(id != "" && graphString[i].includes('\"v_'+usedShapes[shape]+'\">true<')){

          cy.style()
            .selector('node[id ="'+id+'"]')        
            .style('shape', 'ellipse')
            .update();

        }
        i++;
      }
    }
    else return;

  }
  
  // update shape of a attribute already used
  if (usedShapeAttributes.hasOwnProperty(shapeAttribute)){
    shapeNode.style()
      .selector('node[id ="'+shapeAttribute+'"]')        
      .style('shape', shape)
      .update();
    usedShapeAttributes[shapeAttribute] = shape;
    usedShapes[shape] = shapeAttribute
  }

  // add new shape and attribute
  else if(!isEmpty(usedShapeAttributes) && !usedShapeAttributes.hasOwnProperty(shapeAttribute)){
    ycoord = ycoord + 35;
    usedShapeAttributes[shapeAttribute] = shape;
    shapeNode.add( { group: "nodes", data: { id: shapeAttribute}, position:{'x':80, 'y':ycoord}});
    shapeNode.style()
        .selector('node[id ="'+shapeAttribute+'"]')        
        .style('shape', shape)
        .update();
  }
}

/* 
  download png of graph
*/
/*function downloadPNG(){
  outputName = document.getElementById('outputName').value;
  var png64 = cy.png();
  $('#downloadPNG').attr('href', png64);
  var download = document.createElement('a');
  download.href = 'data:image/png;base64;'+png64;
  if(outputName != "File name"){
    download.download = outputName + '.png';
  }
  else{
    download.download = path.replace(".graphml", "_") + '_' + nodeVal + '.png';
  }
  download.click();
}*/


function downloadSVG(){
  outputName = document.getElementById('outputName').value;
  var svgContent = cy.svg({scale: 1, full: true});
  if(outputName != "File name"){
    saveAs(new Blob([svgContent], {type:"image/svg+xml;charset=utf-8"}), outputName +".svg");
  }
  else{
     saveAs(new Blob([svgContent], {type:"image/svg+xml;charset=utf-8"}), path.replace(".graphml", "_") + '_' + nodeVal + ".svg");
  }  
  /*if(outputName != "File name"){
    var svgData = $("#svgid")[0].outerHTML;
    var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
    saveAs(svgBlob, outputName +"_legend.svg");
  }
  else{
    var svgData = $("#svgid")[0].outerHTML;
    var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
    saveAs(svgBlob, path.replace(".graphml", "_") + '_' + nodeVal + "legend.svg");
  } */
}


/*
reset view (zoom, position)
*/
function resetLayout(){
  cy.layout({
      name: 'dagre',
    }).run();
};