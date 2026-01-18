const { spawn } = require('child_process');
const os = require('os');

/**
 * Automatically opens a file using the system's default viewer
 * Windows = start, macOS = open, Linux = xdg-open
 * @param {string} filePath 
 */
function openFile(filePath) {
  const platform = os.platform();
  let command;
  let args = [];

  if (platform === 'win32') {
    command = 'cmd';
    args = ['/c', 'start', '', filePath]; 
  } else if (platform === 'darwin') {
    command = 'open';
    args = [filePath];
  } else {
    command = 'xdg-open';
    args = [filePath];
  }

  const child = spawn(command, args, { stdio: 'ignore', detached: true });
  child.unref(); 

  child.on('error', (err) => {
    console.error(` Could not open file: ${err.message}`);
  });
}

module.exports = { openFile };
