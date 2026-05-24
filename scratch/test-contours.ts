import cv from "@techstark/opencv-js";
import sharp from "sharp";
import fs from "fs";

async function main() {
  const buf = fs.readFileSync("./public/test/q6.jpeg");
  const { data, info } = await sharp(buf).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  
  const mat = cv.matFromImageData({
    width: info.width,
    height: info.height,
    data: new Uint8ClampedArray(data)
  });
  
  const gray = new cv.Mat();
  cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
  const resized = new cv.Mat();
  cv.resize(gray, resized, new cv.Size(0, 0), 2, 2, cv.INTER_CUBIC);
  const binary = new cv.Mat();
  cv.threshold(resized, binary, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
  const inverted = new cv.Mat();
  cv.bitwise_not(binary, inverted);
  
  const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(50, 5));
  const dilated = new cv.Mat();
  cv.dilate(inverted, dilated, kernel, new cv.Point(-1, -1), 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
  
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(dilated, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
  
  const rects: {x:number, y:number, w:number, h:number}[] = [];
  for (let i = 0; i < contours.size(); i++) {
    const rect = cv.boundingRect(contours.get(i));
    if (rect.width > 15 && rect.height > 10) {
      rects.push({x: rect.x, y: rect.y, w: rect.width, h: rect.height});
    }
  }
  
  rects.sort((a, b) => {
    if (Math.abs(a.y - b.y) > 20) return a.y - b.y;
    return a.x - b.x;
  });

  console.log("Found", rects.length, "rectangles.");
  for(let i=0; i < Math.min(10, rects.length); i++) {
    console.log(`Rect ${i}: x=${rects[i].x}, y=${rects[i].y}, w=${rects[i].w}, h=${rects[i].h}`);
  }
}
main().catch(console.error);
