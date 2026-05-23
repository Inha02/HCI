const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let mainWindow;
let restWindow;
let drowsyWindow; // 졸음 팝업창 변수 추가

// 마이페이지 설정에 맞춰 초기화
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

// --- 졸음 경고 팝업창 생성 함수 ---
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
      // 팝업이 뜨자마자 유저의 클릭 제스처 없이도 wav 효과음이 나도록 허용
      autoplayPolicy: "no-user-gesture-required", 
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

// 마이페이지에서 토글을 조작했을 때 변경된 설정값을 수신하는 리스너
ipcMain.on("update-notification-setting", (event, { key, value }) => {
  console.log(`[메인 프로세스 수신] ${key} -> ${value}`);
  notificationSettings[key] = value;
});

// 눈 휴식 관련 (20-20-20 타이머)
ipcMain.on("open-rest-window", () => {
  // 사용자가 마이페이지에서 '20-20-20 타이머 팝업'을 켰을 때만 실행
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

// 졸음 경고 관련
ipcMain.on("open-drowsy-window", () => {
  // 💡 세분화된 팝업 전용 설정값(drowsyPopup)을 엄격하게 검사합니다.
  if (notificationSettings.drowsyPopup === true) {
    console.log("신호 받음: 졸음 경고 팝업창을 엽니다!");
    createDrowsyWindow();
  } else {
    console.log("차단됨: 사용자가 졸음 경고 팝업창 설정을 껐습니다. (창 생성 패스)");
    
    // 팝업창을 띄우지 않더라도 React의 FaceMeshManager 버퍼가 
    // 막히지 않도록 가짜 종료 신호(drowsy-window-closed)를 곧바로 전송
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

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});