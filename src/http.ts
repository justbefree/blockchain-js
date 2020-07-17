/*
* @Author: Just be free
* @Date:   2020-07-16 16:34:18
* @Last Modified by:   Just be free
* @Last Modified time: 2020-07-17 19:07:20
* @E-mail: justbefree@126.com
*/
import * as http from "http";

class HttpAsync {
  constructor() {}
  public async get(url: string): Promise<any> {
    const promise = new Promise<any>((resolve, reject) => {
      http.get(url, res => {
        const { statusCode } = res;
        if (statusCode !== 200) {
          res.resume();
          reject("Request failed");
        } else {
          res.setEncoding("utf8");
          let rowData: string = "";
          res.on("data", (chunk) => { rowData += chunk; });
          res.on("end", () => {
            try {
              const parsedData = JSON.parse(rowData);
              resolve(parsedData);
            } catch (e) {
              console.error(e);
              reject(e);
            }
          });
        }
      });
    });
    return promise;
  }
};

export default HttpAsync;
