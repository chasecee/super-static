const fs = require("fs").promises;
const path = require("path");
const { PurgeCSS } = require("purgecss");

const directoryPath = "../public";

async function purgeCSSFiles(directory) {
  try {
    const files = await fs.readdir(directory);
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        await purgeCSSFiles(filePath); // Recursively process directories
      } else if (stat.isFile() && path.extname(filePath) === ".css") {
        await purgeCSSFile(filePath); // Purge individual CSS files
      }
    }
  } catch (err) {
    console.error("Error processing directory for CSS purging:", err);
  }
}

async function purgeCSSFile(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const purgeCSSResult = await new PurgeCSS().purge({
      // Include both HTML and JS files in the content array
      content: [
        `${directoryPath}/**/*.html`, // Target HTML files
        `${directoryPath}/**/*.js`, // Target JavaScript files
      ],
      css: [{ raw: data }],
      rejected: true, // This option allows you to see what classes were removed
    });

    if (purgeCSSResult.length > 0 && purgeCSSResult[0].css) {
      await fs.writeFile(filePath, purgeCSSResult[0].css, "utf8");
      console.log(`Purged CSS in ${filePath}`);
    }
  } catch (err) {
    console.error(`Error purging CSS file: ${filePath}`, err);
  }
}

purgeCSSFiles(directoryPath);
