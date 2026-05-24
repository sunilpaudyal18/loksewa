import cv from "@techstark/opencv-js";
import sharp from "sharp";
import fs from "fs";

async function main() {
  console.log("OpenCV version:", cv.version);
  
  const buf = fs.readFileSync("./public/test/q6.jpeg");
  const { data, info } = await sharp(buf).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  
  const mat = cv.matFromImageData({
    width: info.width,
    height: info.height,
    data: new Uint8ClampedArray(data)
  });
  
  console.log("Mat size:", mat.cols, "x", mat.rows);
  
  // Grayscale
  const gray = new cv.Mat();
  cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
  
  // Resize 2x
  const resized = new cv.Mat();
  cv.resize(gray, resized, new cv.Size(0, 0), 2, 2, cv.INTER_CUBIC);
  
  // Otsu
  const binary = new cv.Mat();
  cv.threshold(resized, binary, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
  
  console.log("Processed mat size:", binary.cols, "x", binary.rows);
  
  mat.delete();
  gray.delete();
  resized.delete();
  binary.delete();
}
main().catch(console.error);
