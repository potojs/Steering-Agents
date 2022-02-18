const path = require("path");
const { ESBuildMinifyPlugin } = require("esbuild-loader");

module.exports = {
  mode: "production",
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
  entry:  "./src/main.ts",
  optimization: {
    minimizer: [
      new ESBuildMinifyPlugin({
        target: "es2015",
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        include: path.resolve(__dirname, "src"),
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          "style-loader", 
          "css-loader", 
          "sass-loader",
        ],
      },
    ],
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "public"),
  },
};
