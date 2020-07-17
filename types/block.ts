/*
* @Author: Just be free
* @Date:   2020-07-16 14:14:44
* @Last Modified by:   Just be free
* @Last Modified time: 2020-07-16 18:09:01
* @E-mail: justbefree@126.com
*/

import { Transactions } from "./transactions";
export interface Block {
  index: number;
  previousHash: string;
  proof: number;
  timestamp: number;
  transactions: Array<Transactions>;
};
