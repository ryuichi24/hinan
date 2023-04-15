import path from "path";
import { BrowserWindow, Tray, app, nativeTheme } from "electron";
import installExtension, { REDUX_DEVTOOLS } from "electron-devtools-installer";

if (require("electron-squirrel-startup")) {
  app.quit();
}

const isDev = !app.isPackaged;
const isMac = process.platform === "darwin";
const rendererDevServerURL = `http://localhost:${
  process.env.VITE_DEV_SERVER_PORT || 3333
}`;
const rootDir = path.resolve(path.dirname(path.dirname(__dirname)));
const preloadScriptPath = path.resolve(
  rootDir,
  "dist",
  "preload",
  "preload.js",
);
const rendererFilePath = path.resolve(
  rootDir,
  "dist",
  "renderer",
  "index.html",
);

let mainWindow: BrowserWindow | null = null;
/**
 * A tray object must live in a global scope otherwise the tray icon sometimes disappears
 */
let tray: Tray | null = null;
/**
 * It is for quitting the system properly.
 * This tracks the system being requested to quit by the OS or other ways other than clicking the close button
 */
let isAppQuitting = false;

async function main() {
  await app.whenReady();

  createMainWindow().catch(shutDown);
  createTrayIcon();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow().catch(shutDown);
    }
  });

  app.on("before-quit", () => {
    isAppQuitting = true;
    tray?.destroy();
  });

  mainWindow?.on("close", (event: Electron.Event) => {
    if (!isAppQuitting) {
      /**
       * This disable a quit event that is default action on the close event
       */
      event.preventDefault();

      mainWindow?.hide();
      app.dock?.hide();
    }
  });
}

main().catch(shutDown);

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: isDev ? 1820 : 1700,
    height: 1080,
    resizable: isDev,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadScriptPath,
    },
  });

  if (isDev) {
    // mainWindow.webContents.openDevTools();
    await installExtension(REDUX_DEVTOOLS).catch((err) =>
      console.log("An error occurred: ", err),
    );
    await mainWindow.loadURL(rendererDevServerURL);
  } else {
    await mainWindow.loadFile(rendererFilePath);
  }
}

function shutDown(error: Error) {
  console.error(error);
  mainWindow = null;
  process.exit(1);
}

/**
 * A utility function that dynamically builds a path to tray icon
 */
function buildTrayIconPath(os: "mac" | "windows", theme: "white" | "black") {
  const trayIconDirPath = path.resolve(rootDir, "assets", "icons", "tray");
  const ext = os === "mac" ? "png" : "ico";
  return path.resolve(trayIconDirPath, os, theme, `tray-icon-${theme}.${ext}`);
}

function createTrayIcon() {
  let trayIconPath: string;

  if (!isMac) {
    trayIconPath = buildTrayIconPath("windows", "white");
  } else {
    trayIconPath = buildTrayIconPath("mac", "black");
    if (nativeTheme.shouldUseDarkColors === true) {
      trayIconPath = buildTrayIconPath("mac", "white");
    }

    /**
     * This update the tray icon on the system theme change (dark or light mode).
     */
    nativeTheme.on("updated", () => {
      if (nativeTheme.shouldUseDarkColors === true) {
        trayIconPath = buildTrayIconPath("mac", "white");
        tray?.setImage(trayIconPath);
        tray?.setToolTip(app.name);
      } else {
        trayIconPath = buildTrayIconPath("mac", "black");
        tray?.setImage(trayIconPath);
        tray?.setToolTip(app.name);
      }
    });
  }

  const toggleWindow = () => {
    if (mainWindow?.isVisible()) {
      mainWindow?.hide();
      app.dock?.hide();
    } else {
      mainWindow?.show();
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      app.dock?.show();
    }
  };

  tray = new Tray(trayIconPath);
  tray.setToolTip(app.name);
  tray.on("click", toggleWindow);

  /**
   * This enable clicking a tray icon quickly.
   * Electron stops emitting a click event to the system
   * when the tray icon gets clicks more than two times quickly
   */
  tray.setIgnoreDoubleClickEvents(true);
}
