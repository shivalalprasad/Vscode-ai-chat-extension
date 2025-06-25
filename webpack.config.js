const path = require("path")

module.exports = {
  target: "web",
  entry: "./src/webview/index.tsx",
  output: {
    path: path.resolve(__dirname, "out", "webview"),
    filename: "webview.js",
    libraryTarget: "umd",
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  externals: {
    vscode: "commonjs vscode",
  },
  devtool: "source-map",
}
