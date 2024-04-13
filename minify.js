// a
const fs = require("fs").promises;
const path = require("path");
const minifyHTML = require("html-minifier").minify;
const UglifyJS = require("uglify-js");
const CleanCSS = require("clean-css");

const directoryPath = "./public";

async function minifyFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  try {
    let data = await fs.readFile(filePath, "utf8");
    let result;

    switch (ext) {
      case ".html":
        result = minifyHTML(data, {
          removeAttributeQuotes: true,
          collapseWhitespace: true,
          removeComments: true,
          minifyCSS: true,
          minifyJS: true,
        });
        break;
      case ".js":
        result = UglifyJS.minify(data).code;
        break;
      case ".css":
        result = new CleanCSS({}).minify(data).styles;
        break;
      default:
        // console.log(`Skipping file (unsupported type): ${filePath}`);
        return;
    }

    await fs.writeFile(filePath, result, "utf8");
    console.log(`Minified ${filePath}`);
  } catch (err) {
    console.error(`Error minifying file: ${filePath}`, err);
  }
}

async function processDirectory(directory) {
  try {
    const files = await fs.readdir(directory);
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        await processDirectory(filePath);
      } else if (stat.isFile()) {
        await minifyFile(filePath);
      }
    }
  } catch (err) {
    console.error("Error processing directory:", err);
  }
}

processDirectory(directoryPath);
