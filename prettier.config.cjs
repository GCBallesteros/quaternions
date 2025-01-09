module.exports = {
  semi: true, // Use semicolons at the end of statements
  singleQuote: true, // Use single quotes instead of double quotes
  trailingComma: 'all', // Include trailing commas where valid in ES5 (objects, arrays, etc.)
  printWidth: 80, // Wrap lines that exceed 80 characters
  tabWidth: 2, // Indent lines with 2 spaces
  useTabs: false, // Use spaces for indentation instead of tabs
  arrowParens: 'always', // Always include parentheses around arrow function arguments
  endOfLine: 'lf', // Use linefeed ('\n') as the line break style
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      options: {
        parser: 'typescript',
      },
    },
  ],
};
