const fs = require('fs');
const path = require('path');
const { Project, SyntaxKind } = require('ts-morph');

const project = new Project({
  tsConfigFilePath: 'client/tsconfig.json',
  skipFileDependencyResolution: true,
  addFilesFromTsConfig: false,
});

// Add all files in the client directory, excluding node_modules, dist, etc.
const addSourceFiles = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(file)) {
        addSourceFiles(filePath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      project.addSourceFileAtPath(filePath);
    }
  });
};

addSourceFiles(path.join(__dirname, 'client'));

const sourceFiles = project.getSourceFiles();

const hooks = [];
const components = [];
const utilities = [];
const variableUsage = {};
const componentHierarchy = {};

console.log(`Found ${sourceFiles.length} source files.`);

const sanitizeVariableName = (name) => {
  return name.replace(/[\[\]\{\}\(\)\.]/g, '_');
};

sourceFiles.forEach((sourceFile) => {
  console.log(`Analyzing file: ${sourceFile.getFilePath()}`);
  sourceFile.forEachDescendant((node) => {
    console.log(`Node kind: ${node.getKindName()} in file: ${sourceFile.getFilePath()}`);

    if (node.getKind() === SyntaxKind.CallExpression) {
      const callExpression = node.asKind(SyntaxKind.CallExpression);
      if (callExpression) {
        const expression = callExpression.getExpression().getText();
        console.log(`Found CallExpression: ${expression} in file: ${sourceFile.getFilePath()}`);
        if (expression.startsWith('use')) {
          const hookDetails = {
            file: sourceFile.getFilePath(),
            hook: expression,
            line: callExpression.getStartLineNumber(),
          };

          if (expression === 'useState') {
            const variableDeclaration = node.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
            if (variableDeclaration) {
              const variableName = sanitizeVariableName(variableDeclaration.getName());
              hookDetails.variable = variableName;
              variableUsage[variableName] = variableUsage[variableName] || [];
              variableUsage[variableName].push(sourceFile.getFilePath());

              // Capture destructured variables
              const initializer = variableDeclaration.getInitializer();
              if (initializer && initializer.getKind() === SyntaxKind.ArrayLiteralExpression) {
                initializer.getElements().forEach(element => {
                  const elementName = sanitizeVariableName(element.getText());
                  variableUsage[elementName] = variableUsage[elementName] || [];
                  variableUsage[elementName].push(sourceFile.getFilePath());
                });
              }
            }
          } else if (expression === 'useEffect') {
            const dependencies = callExpression.getArguments()[1];
            if (dependencies && dependencies.getKind() === SyntaxKind.ArrayLiteralExpression) {
              hookDetails.dependencies = dependencies.getText();
              dependencies.getElements().forEach(dep => {
                const depName = sanitizeVariableName(dep.getText());
                variableUsage[depName] = variableUsage[depName] || [];
                variableUsage[depName].push(sourceFile.getFilePath());
              });
            }
          }

          hooks.push(hookDetails);
          console.log(`Found hook: ${expression} in file: ${sourceFile.getFilePath()}`);
        }
      }
    }

    if (node.getKind() === SyntaxKind.FunctionDeclaration || node.getKind() === SyntaxKind.ArrowFunction) {
      const identifier = node.getFirstChildByKind(SyntaxKind.Identifier);
      if (identifier) {
        const functionName = identifier.getText();
        console.log(`Found Function: ${functionName} in file: ${sourceFile.getFilePath()}`);
        if (functionName[0] === functionName[0].toUpperCase()) {
          components.push({
            file: sourceFile.getFilePath(),
            component: functionName,
            line: node.getStartLineNumber(),
          });
          console.log(`Found component: ${functionName} in file: ${sourceFile.getFilePath()}`);
        } else {
          utilities.push({
            file: sourceFile.getFilePath(),
            utility: functionName,
            line: node.getStartLineNumber(),
          });
          console.log(`Found utility function: ${functionName} in file: ${sourceFile.getFilePath()}`);
        }
      }
    }

    if (node.getKind() === SyntaxKind.VariableDeclaration) {
      const variableDeclaration = node.asKind(SyntaxKind.VariableDeclaration);
      if (variableDeclaration) {
        const initializer = variableDeclaration.getInitializer();
        if (initializer && (initializer.getKind() === SyntaxKind.FunctionExpression || initializer.getKind() === SyntaxKind.ArrowFunction)) {
          const functionName = variableDeclaration.getName();
          console.log(`Found VariableDeclaration: ${functionName} in file: ${sourceFile.getFilePath()}`);
          if (functionName[0] === functionName[0].toUpperCase()) {
            components.push({
              file: sourceFile.getFilePath(),
              component: functionName,
              line: node.getStartLineNumber(),
            });
            console.log(`Found component: ${functionName} in file: ${sourceFile.getFilePath()}`);
          } else {
            utilities.push({
              file: sourceFile.getFilePath(),
              utility: functionName,
              line: node.getStartLineNumber(),
            });
            console.log(`Found utility function: ${functionName} in file: ${sourceFile.getFilePath()}`);
          }
        }
      }
    }

    // Capture component hierarchy
    if (node.getKind() === SyntaxKind.JsxElement || node.getKind() === SyntaxKind.JsxSelfClosingElement) {
      const tagName = node.getFirstChildByKind(SyntaxKind.Identifier)?.getText();
      if (tagName && tagName[0] === tagName[0].toUpperCase()) {
        const parentComponent = sourceFile.getFilePath();
        componentHierarchy[parentComponent] = componentHierarchy[parentComponent] || [];
        componentHierarchy[parentComponent].push(tagName);
      }
    }

    // Capture variables passed as props
    if (node.getKind() === SyntaxKind.Parameter) {
      const parameter = node.asKind(SyntaxKind.Parameter);
      if (parameter) {
        const parameterName = sanitizeVariableName(parameter.getName());
        variableUsage[parameterName] = variableUsage[parameterName] || [];
        variableUsage[parameterName].push(sourceFile.getFilePath());
        console.log(`Found parameter: ${parameterName} in file: ${sourceFile.getFilePath()}`);
      }
    }
  });
});

console.log('Hooks:', hooks);
console.log('Components:', components);
console.log('Utilities:', utilities);
console.log('Variable Usage:', variableUsage);
console.log('Component Hierarchy:', componentHierarchy);

fs.writeFileSync('hooks.json', JSON.stringify(hooks, null, 2));
fs.writeFileSync('components.json', JSON.stringify(components, null, 2));
fs.writeFileSync('utilities.json', JSON.stringify(utilities, null, 2));
fs.writeFileSync('variableUsage.json', JSON.stringify(variableUsage, null, 2));
fs.writeFileSync('componentHierarchy.json', JSON.stringify(componentHierarchy, null, 2));

console.log('Hooks, components, utilities, variable usage, and component hierarchy have been extracted.');