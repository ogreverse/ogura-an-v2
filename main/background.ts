import path from "path";
import { app, ipcMain, Tray, Menu } from "electron";
import serve from "electron-serve";
import { createWindow, notionHandler, openAiHandler } from "./helpers";

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

let isQuitting: boolean = false;

(async () => {
  await app.whenReady();

  // メインウィンドウ作成
  const mainWindow = createWindow("main", {
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    show: false, // 最初は非表示
  });

  notionHandler();
  openAiHandler(mainWindow);

  let port = null;
  if (isProd) {
    await mainWindow.loadURL("app://./home");
  } else {
    port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/word-register`);
    mainWindow.webContents.openDevTools();
  }

  const changePage = (page: string) => {
    // ウィンドウを閉じてからページ遷移して開く
    mainWindow?.close();

    mainWindow?.loadURL(
      port ? `http://localhost:${port}/${page}` : `app://./${page}`,
    );

    mainWindow?.show();
  };

  // システムトレイ設定
  const iconPath = path.join(
    __dirname,
    isProd ? "images" : "../renderer/public/images",
    "icon_tray.png",
  );
  const tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: "ワード登録", click: () => changePage("word-register") },
    {
      label: "終了",
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);
  tray.setToolTip("Ogura AN");
  tray.setContextMenu(contextMenu);

  // ウィンドウが閉じられたときに隠す
  mainWindow.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });
})();
