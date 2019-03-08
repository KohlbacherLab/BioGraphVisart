const cytosnap = require('cytosnap');
const { Graph } = require('../utils/graph.util');

cytosnap.use(['cytoscape-dagre']);

/*

const setDiff = (A, B) => new Set([...A].filter(elem => !B.has(elem)));
const isSubset = (A, B) => setDiff(A, B).size === 0;

const booleanLegendNecessary = (nodes) => {
  const values = new Set(nodes.map(node => node.val));
  const zeroOne = new Set([0, 1]);
  if (isSubset(values, zeroOne)) {
    return true;
  }
  return false;
};

*/

const cytoSnapToPng = async (nodes, edges, nodesMin, nodesMax) => {
  const snap = cytosnap();
  await snap.start();
  const img = await snap.shot({
    elements: nodes.concat(edges),
    layout: {
      name: 'dagre',
    },
    style: [ // style nodes
      {
        selector: 'node',
        style: {
          width: 50,
          height: 50,
          shape: 'ellipse',
          'background-color': 'white',
          'border-color': 'black',
          'border-style': 'solid',
          'border-width': '2',
          label: 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': 10,
        },
      },
      // attributes with numbers
      {
        selector: 'node[val < 0]',
        style: {
          'background-color': `mapData(val, ${nodesMin}, 0, #006cf0, white)`,
          color: 'black',
        },
      },
      {
        selector: `node[val <= ${0.5 * nodesMin}]`,
        style: {
          color: 'white',
        },
      },
      {
        selector: 'node[val > 0]',
        style: {
          'background-color': `mapData(val, 0, ${nodesMax}, white, #d50000)`,
          color: 'black',
        },
      },
      {
        selector: `node[val >= ${0.5 * nodesMax}]`,
        style: {
          color: 'white',
        },
      },
      {
        selector: 'node[val = 0]',
        style: {
          'background-color': 'white',
          color: 'black',
        },
      },
      // attributes with boolean
      {
        selector: 'node[val = "false"]',
        style: {
          'background-color': '#006cf0',
          color: 'white',
        },
      },
      {
        selector: 'node[val = "true"]',
        style: {
          'background-color': '#d50000',
          color: 'white',
        },
      },
      // style edges
      {
        selector: 'edge',
        style: {
          'target-arrow-shape': 'triangle',
          'arrow-scale': 2,
          'curve-style': 'bezier',
        },
      },
      {
        selector: 'edge[interaction = \'compound\']',
        style: {
          'target-arrow-shape': 'triangle-backcurve',
        },
      },
      {
        selector: 'edge[interaction = \'activation\']',
        style: {
          'target-arrow-shape': 'triangle',
        },
      },
      {
        selector: 'edge[interaction = \'expression\']',
        style: {
          'target-arrow-shape': 'triangle-backcurve',
        },
      },
      {
        selector: 'edge[interaction = \'phosphorylation\']',
        style: {
          'target-arrow-shape': 'diamond',
        },
      },
      {
        selector: 'edge[interaction = \'inhibition\']',
        style: {
          'target-arrow-shape': 'tee',
        },
      },
      {
        selector: 'edge[interaction = \'indirect effect\']',
        style: {
          'target-arrow-shape': 'circle',
        },
      },
      {
        selector: 'edge[interaction = \'state change\']',
        style: {
          'target-arrow-shape': 'square',
        },
      },
      {
        selector: 'node[val <0]',
        style: {
          'background-color': `mapData(val, ${nodesMin}, 0, #006cf0, white)`,
          color: 'black',
        },
      },
      {
        selector: `node[val <= ${0.5 * nodesMin}]`,
        style: {
          color: 'white',
        },
      },
      {
        selector: 'node[val >0]',
        style: {
          'background-color': `mapData(val, 0, ${nodesMax}, white, #d50000)`,
          color: 'black',
        },
      },
      {
        selector: `node[val >= ${0.5 * nodesMax}]`,
        style: {
          color: 'white',
        },
      },
      {
        selector: 'node[!val]',
        style: {
          color: 'black',
        },
      },

    ],
    resolvesTo: 'base64',
    format: 'png',
    width: 1200,
    height: 1200,
    background: 'transparent',
  });
  snap.stop(); /* TODO: may be inefficient since cytosnap
  basically launches and closes a browser for every request?... */
  return Buffer.from(img, 'base64');
};

const getPng = async (
  graphmlStr,
  valueAttr = 'v_deregnet_score',
  labelAttr = 'v_symbol',
  interactionAttr = 'e_interaction',
) => {
  const graph = await Graph.fromGraphML(graphmlStr);
  const nodes = graph.getNodesForVisualization(valueAttr, labelAttr);
  const nodesFilteredNaN = nodes.filter(function(node) {if(!isNaN(node.data.val))return node.data.val});
  const edges = graph.getEdgesForVisualization(interactionAttr);
  const nodesMin = parseFloat(Math.min(...nodesFilteredNaN.map(node => node.data.val))).toFixed(2);
  const nodesMax = parseFloat(Math.max(...nodesFilteredNaN.map(node => node.data.val))).toFixed(2);
  return cytoSnapToPng(nodes, edges, nodesMin, nodesMax);
};

module.exports = {
  getPng,
};
