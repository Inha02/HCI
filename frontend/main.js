const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let mainWindow;
let restWindow;
let drowsyWindow; // 졸음 팝업창 변수 추가

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
    },
  });

  mainWindow.loadURL("http://localhost:3000");
}

// --- 눈 휴식 팝업창 생성 함수 ---
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

// --- 졸음 경고 팝업창 생성 함수 추가 ---
function createDrowsyWindow() {
  if (drowsyWindow) return; // 이미 열려있으면 중복 생성 방지

  drowsyWindow = new BrowserWindow({
    width: 600,            // 졸음 팝업은 전체화면 대신 적절한 크기로 설정 (변경 가능)
    height: 450,
    center: true,          // 화면 중앙에 배치
    alwaysOnTop: true,     // 최상단 유지
    frame: false,          // 상단 바 제거
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // React Router의 졸음 팝업 경로 로드
  drowsyWindow.loadURL("http://localhost:3000/drowsy-popup");

  drowsyWindow.on("closed", () => {
    drowsyWindow = null;
    // 창이 닫히면 메인 창에 신호를 보내 FaceMeshManager의 플래그를 리셋하게 함
    if (mainWindow) {
      mainWindow.webContents.send("drowsy-window-closed");
    }
  });
}

// --- IPC 이벤트 리스너 ---

// 눈 휴식 관련
ipcMain.on("open-rest-window", () => {
    console.log("신호 받음: 휴식 팝업창을 엽니다!");
    createRestWindow();
});

ipcMain.on("close-rest-window", () => {
  if (restWindow) restWindow.close();
});

// 졸음 경고 관련 추가
ipcMain.on("open-drowsy-window", () => {
    console.log("신호 받음: 졸음 경고 팝업창을 엽니다!");
    createDrowsyWindow();
});

ipcMain.on("close-drowsy-window", () => {
  if (drowsyWindow) {
    drowsyWindow.close();
  }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});