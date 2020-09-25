const electron = require("electron");
const path = require("path");
const url = require("url");
const ipc = electron.ipcMain;

let window;

const createWindow = () => {
  window = new electron.BrowserWindow({
    width: 800,
    height: 500,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      accessibleTitle: "Speech Guru",
      enableRemoteModule: true,
    },
  });

  window.loadURL(
    url.format({
      pathname: path.join(__dirname, "src/index.html"),
    })
  );

  window.on("closed", () => {
    window=null;
  });
  // window.webContents.openDevTools({ mode: "bottom" });
};

electron.app.on("ready", createWindow);

electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipc.on("clear", (event, args) => {
  electron.dialog
    .showMessageBox(window, {
      title: "CLEARING THE TEXT ON THE SPEECH GURU",
      message: "ARE YOU SURE YOU WANT TO CLEAR THE TEXT ON THE SPEECH GURU?",
      buttons: ["Yes", "No", "Cancel"],
      cancelId: 2,
      defaultId: 0,
      noId: 1,
    })
    .then((res) => {
      event.sender.send("clear-response", res);
    });
});

ipc.on("closing-app", (event, args) => {
  electron.dialog
    .showMessageBox(window, {
      title: "CLOSSING THE SPEECH GURU",
      message: "ARE YOU SURE YOU WANT TO CLOSE THE SPEECH GURU?",
      buttons: ["Yes", "No", "Cancel"],
      cancelId: 2,
      defaultId: 0,
      noId: 1,
    })
    .then((res) => {
      if (res.response === 0) {
        electron.app.quit();
      } else {
        electron.app.focus();
      }
    });
});
