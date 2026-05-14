const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let mainWindow;
let restWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // React에서 Electron 기능을 쓰기 위해 필요한 설정
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL("http://localhost:3000");
}

// --- 최상위 팝업창 생성 함수 ---
function createRestWindow() {
  if (restWindow) return; // 이미 열려있으면 중복 생성 방지

  restWindow = new BrowserWindow({
    fullscreen: true,       // 전체 화면
    alwaysOnTop: true,      // 다른 모든 창 위에 표시
    frame: false,           // 상단 바 제거
    transparent: true,      // 배경 투명 (선택)
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // React Router의 특정 경로를 로드합니다.
  restWindow.loadURL("http://localhost:3000/break-popup");

  restWindow.on("closed", () => {
    restWindow = null;
  });
}

// --- IPC 통신 리스너 (신호 받기) ---
ipcMain.on("open-rest-window", () => {
    console.log("신호 받음: 팝업창을 엽니다!");
    createRestWindow();
});

ipcMain.on("close-rest-window", () => {
  if (restWindow) {
    restWindow.close();
  }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});