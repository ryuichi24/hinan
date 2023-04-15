/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: "com.juniordevmind",
  productName: "Hinan",
  copyright: "Copyright © 2023 ${author}",
  // Whether to package the application’s source code into an archive
  asar: true,
  directories: {
    output: "release/${version}",
  },
  extraMetadata: {
    main: "dist/main/main.js",
  },
  publish: [
    {
      provider: "github",
      owner: "ryuichi24",
      repo: "hinan",
      // to use private repository
      private: true,
      // to publish it to private repsotiry and make it auto updater work as well
      token: process.env.GH_TOKEN,
    },
  ],
  files: ["dist", "node_modules", "package.json"],
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"],
      },
    ],
    artifactName: "${productName}-Windows-${version}-Setup.${ext}",
  },
  mac: {
    target: [
      {
        // "default" produces zip a file along with dmg
        // should be "default" for auto updater
        target: "default",
        arch: ["arm64", "x64"],
      },
    ],
    artifactName: "${productName}-Mac-${version}-Installer.${ext}",
    // name of the certificate to sign the electron app
    // without this, the application cannot be launched in a mac machine
    // and "arm64" and "x64" mac app build will fail
    identity: process.env.CERT_NAME,
  },
  linux: {
    target: ["AppImage", "deb"],
    artifactName: "${productName}-Linux-${version}.${ext}",
  },
};

module.exports = config;
