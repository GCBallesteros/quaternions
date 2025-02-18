export const STYLES = {
  logContainer: `
    white-space: pre-wrap; 
    font-family: monospace; 
    border: 1px solid #ccc; 
    padding: 10px; 
    max-height: 300px; 
    overflow-y: auto; 
    background-color: #121212; 
    color: #e0e0e0;
  `,
  nestedContent: `
    margin-left: 16px; 
    border-left: 1px dashed #8a8a8a; 
    padding-left: 8px;
  `,
  colors: {
    leaf: '#00bcd4',
    key: '#8a8a8a',
    intermediate: '#b0b0b0',
    circular: '#ff4081',
  },
};

export const CHUNK_SIZE = 100;
