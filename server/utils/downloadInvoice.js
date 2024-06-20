import https from'https';
import fs from 'fs';


const downloadInvoice = async(url,destination,orderId) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);

    https.get(url, response => {
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', error => {
      fs.unlink(destination, () => reject(error));
    });
  });
};
export default downloadInvoice
