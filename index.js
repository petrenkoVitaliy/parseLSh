const cheerio = require("cheerio");
const needle = require("needle");
const fs = require("fs");
const util = require("util");
const log_file = fs.createWriteStream(__dirname + "/debug.log", { flags: "w" });
const log_stdout = process.stdout;

const msleep = miliSeconds =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, miliSeconds);

console.log = function(d) {
  log_file.write(util.format(d) + "\n");
  log_stdout.write(util.format(d) + "\n");
};

const saveToFile = imgs => {
  const fileName = "./result5.html";
  const stream = fs.createWriteStream(fileName);
  const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>Document</title>
    </head>
    <body>
      ${imgs}
    </body>
  </html>
  `;

  stream.once("open", function(fd) {
    stream.end(htmlTemplate);
  });
};

const generateUrl = () => {
  const prefix = "https://prnt.sc/";
  // maskEx => a37ej5
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    const randomChar = chars[Math.floor(Math.random() * chars.length)];
    result += randomChar;
  }

  return prefix + result;
};

const generateHtmlImgsList = (pages, urls) => {
  let htmlImgList = "";

  pages.map((page, index) => {
    const fuckJquery = cheerio.load(page.body);

    console.log("----index_" + index);
    console.log("----body");
    console.log(page.body);
    const img = fuckJquery("#screenshot-image");

    htmlImgList += `<div>${index}:</div>`;

    if (img[0]) {
      htmlImgList += `
			<div>
				<a href="${urls[index]}">${urls[index]}</a></div>
			<div>
				<img src="${img[0].attribs.src}" width="777px"/>
			</div>\n`;
    } else {
      console.log("----image");
      console.log(img);
      htmlImgList += `
			<div>
				<a href="${urls[index]}">${urls[index]}</a>
			</div>
			<div>No img</div>\n`;
    }
  });

  return htmlImgList;
};

const startParsing = async count => {
  const queries = [];
  const urls = [];

  for (let i = 0; i < count; i++) {
    const url = generateUrl();

    urls.push(url);

    const req = await needle("get", url);
    console.log(i);
    queries.push(req);
  }

  Promise.all(queries).then(pages => {
    const htmlImgList = generateHtmlImgsList(pages, urls);

    saveToFile(htmlImgList);
  });
};

startParsing(1000);
