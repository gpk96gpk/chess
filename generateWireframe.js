const fs = require('fs');
const hooks = require('./hooks.json');
const components = require('./components.json');
const utilities = require('./utilities.json');
const variableUsage = require('./variableUsage.json');
const componentHierarchy = require('./componentHierarchy.json');

const escapeLabel = (label) => {
  return label.replace(/"/g, '\\"');
};

const generateDotFile = (hooks, components, utilities, variableUsage, componentHierarchy) => {
  let dotContent = 'digraph G {\n';
  dotContent += '  rankdir=TB;\n'; // Set the graph direction to top-to-bottom
  dotContent += '  size="50,50!";\n'; // Set a fixed size for the graph
  dotContent += '  ratio=expand;\n'; // Expand the graph to fit the size
  dotContent += '  margin=0;\n'; // Add margin around the graph
  dotContent += '  overlap=false;\n'; // Prevent nodes from overlapping
  dotContent += '  bgcolor="#1e1e1e";\n'; // Set a dark background color
  dotContent += '  node [fontsize=200, width=4, height=3, style="filled,rounded", fillcolor="#2e2e2e", fontcolor=white, fontname="Arial"];\n'; // Default node styles

  // Add map key for colors
  dotContent += '  subgraph cluster_legend {\n';
  dotContent += '    label="Legend";\n';
  dotContent += '    key [label=<<table border="0" cellpadding="2" cellspacing="0" cellborder="0">\n';
  dotContent += '      <tr><td align="right" port="i1">useState:</td><td port="i1" bgcolor="#13EC3D" width="80" height="160"></td></tr>\n';
  dotContent += '      <tr><td align="right" port="i2">useEffect:</td><td port="i2" bgcolor="#ECA913" width="80" height="160"></td></tr>\n';
  dotContent += '    </table>>, shape=none];\n';
  dotContent += '  }\n';

  // Define nodes for components and their variables
  components.forEach((component, index) => {
    const variablesList = Object.keys(variableUsage).filter(variable => variableUsage[variable].includes(component.file));
    let label = component.component;
    if (variablesList.length > 0) {
      const variablesLabel = variablesList.map(variable => 
        `<tr><td port="${variable}" align="left" border="1" sides="tlbr" style="rounded" cellpadding="5">${escapeLabel(variable)}</td></tr>`
      ).join('');
      label = `<<table border="0" cellborder="1" cellspacing="10" cellpadding="10" style="rounded"><tr><td>${component.component}</td></tr>${variablesLabel}</table>>`;
    } else {
      label = `<<table border="0" cellborder="1" cellspacing="10" cellpadding="10" style="rounded"><tr><td>${component.component}</td></tr></table>>`;
    }
    dotContent += `    ${index} [label=${label}, fontsize=200, width=4, height=3, fontStyle=bold, fontname="Arial"];\n`;
  });

  // Define nodes for utility functions and their variables
  utilities.forEach((utility, index) => {
    const variablesList = Object.keys(variableUsage).filter(variable => variableUsage[variable].includes(utility.file));
    let label = utility.utility;
    if (variablesList.length > 0) {
      const variablesLabel = variablesList.map(variable => 
        `<tr><td port="${variable}" align="left" border="1" sides="tlbr" style="rounded" cellpadding="5">${escapeLabel(variable)}</td></tr>`
      ).join('');
      label = `<<table border="0" cellborder="1" cellspacing="10" cellpadding="10" style="rounded"><tr><td>${utility.utility}</td></tr>${variablesLabel}</table>>`;
    } else {
      label = `<<table border="0" cellborder="1" cellspacing="10" cellpadding="10" style="rounded"><tr><td>${utility.utility}</td></tr></table>>`;
    }
    dotContent += `    ${components.length + index} [label=${label}, fontsize=200, width=4, height=3, fontStyle=bold, fontname="Arial"];\n`;
  });

  // Create a unique color for each node (components + utilities)
  const totalNodes = components.length + utilities.length;
  const palette = [
    "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4", "#46f0f0",
    "#f032e6", "#bcf60c", "#fabebe", "#008080", "#e6beff", "#9a6324", "#fffac8",
    "#800000", "#aaffc3", "#808000", "#ffa8b1", "#000075", "#808080"
  ];
  const nodeColors = [];
  for (let i = 0; i < totalNodes; i++) {
    nodeColors.push(palette[i % palette.length]);
  }

  // Add component hierarchy to the graph
  Object.keys(componentHierarchy).forEach((parentComponent) => {
    const parentIndex = components.findIndex(component => component.file === parentComponent);
    if (parentIndex !== -1) {
      componentHierarchy[parentComponent].forEach((childComponent) => {
        const childIndex = components.findIndex(component => component.component === childComponent);
        if (childIndex !== -1) {
          dotContent += `  ${parentIndex} -> ${childIndex} [style=bold, color="#1356EC", fontsize=200, penwidth=60, fontname="Arial"];\n`;
        }
      });
    }
  });

  Object.keys(variableUsage).forEach((variable) => {
    const usageFiles = variableUsage[variable];
    if (usageFiles.length > 1) {
      for (let i = 0; i < usageFiles.length - 1; i++) {
        let sourceIndex = components.findIndex(component => component.file === usageFiles[i]);
        let targetIndex = components.findIndex(component => component.file === usageFiles[i + 1]);
        if (sourceIndex === -1) {
          sourceIndex = components.length + utilities.findIndex(utility => utility.file === usageFiles[i]);
        }
        if (targetIndex === -1) {
          targetIndex = components.length + utilities.findIndex(utility => utility.file === usageFiles[i + 1]);
        }
        if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) {
          // Override edge color for 'isCheck'
          let edgeColor = nodeColors[sourceIndex];
          if (variable === "isCheck") {
            edgeColor = "#FF00FF";
          }
          dotContent += `    ${sourceIndex}:${variable} -> ${targetIndex}:${variable} [label="${variable}", color="${edgeColor}", fontcolor="${edgeColor}", fontname="Arial", style="dashed", fontsize=160, penwidth=25];\n`;
        }
      }
    }
  });
  
  // Add continuous green arrows (solid edges) for variable usage using source node's unique color
  Object.keys(variableUsage).forEach((variable) => {
    const usageFiles = variableUsage[variable];
    if (usageFiles.length > 1) {
      for (let i = 0; i < usageFiles.length - 1; i++) {
        let sourceIndex = components.findIndex(component => component.file === usageFiles[i]);
        let targetIndex = components.findIndex(component => component.file === usageFiles[i + 1]);
        if (sourceIndex === -1) {
          sourceIndex = components.length + utilities.findIndex(utility => utility.file === usageFiles[i]);
        }
        if (targetIndex === -1) {
          targetIndex = components.length + utilities.findIndex(utility => utility.file === usageFiles[i + 1]);
        }
        if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) {
          // Override edge color for 'isCheck'
          let edgeColor = nodeColors[sourceIndex];
          if (variable === "isCheck") {
            edgeColor = "#FF00FF";
          }
          dotContent += `    ${targetIndex}:${variable} -> ${sourceIndex}:${variable} [label="${variable}", color="${edgeColor}", fontcolor="${edgeColor}", fontname="Arial", style="solid", fontsize=160, arrowhead=dot, penwidth=25];\n`;
        }
      }
    }
  });

  dotContent += '}';

  fs.writeFileSync('wireframe.dot', dotContent);
};

generateDotFile(hooks, components, utilities, variableUsage, componentHierarchy);
console.log('Wireframe has been generated.');