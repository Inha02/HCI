const { app, BrowserWindow, ipcMain, session } = require("electron");
const path = require("path");

let mainWindow;
let restWindow;
let drowsyWindow;

let notificationSettings = {
  drowsyPopup: true,
  drowsySound: true,
  blinkAlert: true,
  timer202020: true,
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
      webSecurity: false, // 외부 리소스 접근 및 도메인 변경 허용
    },
  });

  mainWindow.loadURL("http://localhost:3000");
}

function createRestWindow() {
  if (restWindow) return;

  restWindow = new BrowserWindow({
    fullscreen: true,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  restWindow.loadURL("http://localhost:3000/break-popup");

  restWindow.on("closed", () => {
    restWindow = null;
  });
}

function createDrowsyWindow() {
  if (drowsyWindow) return;

  drowsyWindow = new BrowserWindow({
    width: 600,
    height: 450,
    center: true,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      autoplayPolicy: "no-user-gesture-required",
    },
  });

  drowsyWindow.loadURL("http://localhost:3000/drowsy-popup");

  drowsyWindow.on("closed", () => {
    drowsyWindow = null;
    if (mainWindow) {
      mainWindow.webContents.send("drowsy-window-closed");
    }
  });
}

app.whenReady().then(() => {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          // 기존 CSP를 완전히 무시하고 개발 편의를 위해 모든 외부 리소스(스크립트, 스타일, 이미지) 허용
          "Content-Security-Policy": [
            "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;" +
            "script-src * 'unsafe-inline' 'unsafe-eval' data: blob:;" +
            "style-src * 'unsafe-inline' data: blob:;" +
            "connect-src * 'unsafe-inline' 'unsafe-eval';" +
            "img-src * data: blob:;"
          ],
        },
      });
    });
  
    createWindow();
  });

// --- IPC 이벤트 리스너 ---

ipcMain.on("update-notification-setting", (event, { key, value }) => {
  console.log(`[메인 프로세스 수신] ${key} -> ${value}`);
  notificationSettings[key] = value;
});

ipcMain.on("open-rest-window", () => {
  if (notificationSettings.timer202020) {
    console.log("신호 받음: 휴식 팝업창을 엽니다!");
    createRestWindow();
  } else {
    console.log("차단됨: 사용자가 20-20-20 타이머 팝업 설정을 껐습니다.");
  }
});

ipcMain.on("close-rest-window", () => {
  if (restWindow) restWindow.close();
});

ipcMain.on("open-drowsy-window", () => {
  if (notificationSettings.drowsyPopup === true) {
    console.log("신호 받음: 졸음 경고 팝업창을 엽니다!");
    createDrowsyWindow();
  } else {
    console.log("차단됨: 사용자가 졸음 경고 팝업창 설정을 껐습니다.");
    if (mainWindow) {
      mainWindow.webContents.send("drowsy-window-closed");
    }
  }
});

ipcMain.on("close-drowsy-window", () => {
  if (drowsyWindow) {
    drowsyWindow.close();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});