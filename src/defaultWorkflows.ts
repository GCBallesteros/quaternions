interface WorkflowExample {
  script: string;
  docLink: string;
}

export const defaultWorkflows: Record<string, WorkflowExample> = {
  'Quaternion Debugging': {
    script: `some script`,
    docLink: 'documentation/workflows/debugging-quaternions.html'
  },
  'Adding Satellites': {
    script: `some other script`,
    docLink: 'documentation/workflows/adding-satellites.html'
  }
};
