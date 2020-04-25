import { ifError } from "assert";
import { pipeline } from "stream";
import { rmdirSync, mkdirSync, createWriteStream } from "fs";

import yauzl from "yauzl";

rmdirSync("result", { recursive: true });
mkdirSync("result/expected", { recursive: true });

yauzl.open("compressed.zip", { lazyEntries: true }, (error, zipFile) => {
  ifError(error);
  console.log("start reading zip file");

  zipFile.on("error", ifError);
  zipFile.on("close", () => {
    console.log("finished reading zip file");
  });

  zipFile.readEntry();
  zipFile.on("entry", (entry) => {
    zipFile.openReadStream(entry, (error, readStream) => {
      ifError(error);
      const writeStream = createWriteStream(`result/${entry.fileName}`);

      // writeStream.on("finish", () => {
      //   zipFile.readEntry();
      // });
      // readStream.pipe(writeStream);

      pipeline(readStream, writeStream, (error) => {
        ifError(error);
        zipFile.readEntry();
      });
    });
  });
});
