const path = require('path');
const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');

let backendProcess;

function startBackend() {
  // Le chemin réel du backend dans l'app packagée
  const backendPath = path.join(process.resourcesPath, 'backend', 'index.js');

  backendProcess = spawn('node', [backendPath], { stdio: 'inherit', shell: true });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend stdout: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend stderr: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

function createWindow() {
  startBackend();

  const win = new BrowserWindow({
    width: 1600,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'assets', process.platform === 'win32' ? 'Logo.ico' : 'Logo.png'),
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
  }

  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') app.quit();
});
