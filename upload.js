const { PinataSDK } = require("pinata-web3");
const fs = require("fs");
const path = require("path");

const pinata = new PinataSDK({
  pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiZTIyZDA4MC05YzBmLTQzM2ItYmRlNi04YzgxNWMyZTA5NDUiLCJlbWFpbCI6InNhZGlzaC5yYXRpc2Jvbm5lQGVkdS5kZXZpbmNpLmZyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImMyNTg1MDE1OTk5NmNiMTM5NGQzIiwic2NvcGVkS2V5U2VjcmV0IjoiMjUzYmQ2ZGM1YTc1NmE4ZGUzOTQ3M2IxNjczZGY0MjkxOWJiNGIxODU4NmE1NmNkMDNlOGJjNjk4NTFjNzhlMyIsImV4cCI6MTc2OTUxNzY3NX0.ZewzFUneIaBVGVxNBA2bViSULuRcYMFEf5kEpmjmKE8",
  pinataGateway: "white-adorable-limpet-604.mypinata.cloud",
});

async function getMimeType(filePath) {
  const mime = await import("mime");
  return mime.default.getType(filePath) || "application/octet-stream";
}

function getAllFiles(dirPath, excludedDirs = ["node_modules", ".git", ".env"]) {
  let files = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!excludedDirs.includes(entry.name)) {
        files = files.concat(getAllFiles(fullPath, excludedDirs));
      }
    } else {
      files.push(fullPath);
    }
  });

  return files;
}

async function deployWebsite() {
  try {
    const filePaths = getAllFiles("./");

    for (const filePath of filePaths) {
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);
      const mimeType = await getMimeType(filePath);

      const blob = new Blob([fileBuffer], { type: mimeType });

      const upload = await pinata.upload.file(blob, {
        pinataMetadata: { name: fileName },
      });

      console.log(`Uploaded ${fileName}: https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

(async () => {
  await deployWebsite();
})();