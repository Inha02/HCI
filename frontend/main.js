const { app, BrowserWindow, ipcMain, session, screen } = require("electron");
const path = require("path");

let mainWindow;
let restWindow;
let drowsyWindow;
let blinkToastWindow = null; // 🚀 눈 깜빡임 토스트용 인스턴스 변수 추가

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

// 🚀 [추가] 모니터 바탕화면 기준 전체화면 우측 하단 최상단 윈도우 생성 로직
function createBlinkToastWindow(bpmValue) {
  if (blinkToastWindow) return; // 이미 떠 있는 상태면 무시

  // 메인 디스플레이 크기 및 작업 표시줄 규격 확보
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workArea; 

  const toastWidth = 360;
  const toastHeight = 110;
  const xMargin = 20; 
  const yMargin = 30;

  // 우측 하단 배치 위치 계산 정밀 공식
  const xPos = width - toastWidth - xMargin;
  const yPos = height - toastHeight - yMargin;

  blinkToastWindow = new BrowserWindow({
    width: toastWidth,
    height: toastHeight,
    x: xPos,
    y: yPos,
    frame: false,            // 테두리 및 닫기 바 비활성화
    resizable: false,        // 리사이즈 불가
    alwaysOnTop: true,       // 📌 타 프로그램(크롬, 게임 등) 위로 무조건 뚫고 나옴
    transparent: true,       // 백라운드 알파 투명 투과 허용
    skipTaskbar: true,       // 작업 표시줄에 프로그램 아이콘 생성 방지
    focusable: false,        // 📌 사용자가 타이핑 중인 기존 프로그램의 포커스를 뺏지 않음
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 라우터로 라우팅 주소 연계 및 쿼리 스트링 바인딩
  blinkToastWindow.loadURL(`http://localhost:3000/blink-popup?bpm=${bpmValue}`);

  // 4초 후 자동 페이드아웃 및 윈도우 파괴 소멸
  setTimeout(() => {
    if (blinkToastWindow) {
      blinkToastWindow.close();
    }
  }, 4000);

  blinkToastWindow.on("closed", () => {
    blinkToastWindow = null;
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

// 🚀 [추가] 눈 깜빡임 부족 시스템 최상단 토스트 오픈 수신 이벤트 핸들러
ipcMain.on("open-blink-toast", (event, bpmValue) => {
  if (notificationSettings.blinkAlert === true) {
    console.log(`신호 받음: 전체 모니터 화면 기준 눈 깜빡임 토스트 생성 시작 (BPM: ${bpmValue})`);
    createBlinkToastWindow(bpmValue);
  } else {
    console.log("차단됨: 사용자가 눈 깜빡임 부족 알림 팝업 설정을 껐습니다.");
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});