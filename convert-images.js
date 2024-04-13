const fs = require("fs").promises;
const path = require("path");
const sharp = require("sharp");

const directoryPath = "./";
let skippedImagesCount = 0;

async function convertImageToWebp(filePath) {
  const newFilePath = filePath.replace(path.extname(filePath), ".webp");
  try {
    if (
      await fs
        .access(newFilePath)
        .then(() => true)
        .catch(() => false)
    ) {
      skippedImagesCount++;
      return;
    }
    await sharp(filePath).toFormat("webp").toFile(newFilePath);
    console.log(`Converted ${filePath} to ${newFilePath}`);
  } catch (err) {
    console.error("Error converting image:", err);
  }
}

async function updateHtmlReferences(filePath) {
  try {
    let data = await fs.readFile(filePath, "utf8");
    const newData = data.replace(/\.(jpg|jpeg|png)/g, ".webp");
    await fs.writeFile(filePath, newData, "utf8");
    console.log(`Updated HTML in ${filePath}`);
  } catch (err) {
    console.error("Error updating HTML file:", err);
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
        const ext = path.extname(file).toLowerCase();
        if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
          await convertImageToWebp(filePath);
        } else if (ext === ".html") {
          await updateHtmlReferences(filePath);
        }
      }
    }
    if (skippedImagesCount > 0) {
      console.log(
        `Skipped ${skippedImagesCount} images since they were already processed.`
      );
    }
  } catch (err) {
    console.error("Error processing directory:", err);
  }
}

processDirectory(directoryPath);
