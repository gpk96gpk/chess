const fs = require('fs');

const generateDotFile = (stateChanges) => {
  let dotContent = 'digraph G {\n';

  stateChanges.forEach((change, index) => {
    dotContent += `  ${index} [label="${change}"];\n`;
    if (index > 0) {
      dotContent += `  ${index - 1} -> ${index};\n`;
    }
  });

  dotContent += '}';

  fs.writeFileSync('state_changes.dot', dotContent);
};

// Example state changes
const stateChanges = [
  'Initial State',
  'State 1: count = 1',
  'State 2: count = 2',
  'State 3: count = 3'
];

generateDotFile(stateChanges);