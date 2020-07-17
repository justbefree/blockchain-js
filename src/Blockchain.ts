/*
* @Author: Just be free
* @Date:   2020-07-16 14:06:38
* @Last Modified by:   Just be free
* @Last Modified time: 2020-07-17 18:58:16
* @E-mail: justbefree@126.com
*/
import { default as HttpAsync } from "./http";
import { Transactions } from "../types/transactions";
import { Block } from "../types/block";
import { Node } from "../types/node";
import { Callback } from "../types/callback";
import sha256 from "crypto-js/sha256";
const http = new HttpAsync();
class Blockchain {

  private currentTransactions: Array<Transactions>;
  private chain: Array<Block>;
  private nodes: Array<Node>;
  
  constructor() {
    this.chain = [];
    this.currentTransactions = [];
    this.nodes = [];
    this.newBlock(0, "100");
  }

  public getChain(): Array<Block> {
    return this.chain;
  }
  public getChainLength(): number {
    return this.chain.length;
  }

  public isNodeExists(node: Node): boolean {
    return this.nodes.indexOf(node) > -1;
  }

  public registerNodes(node: Node): void {
    if (!this.isNodeExists(node)) {
      this.nodes.push(node);
    }
  }

  public getNodes(): Array<Node> {
    return this.nodes;
  }

  public newBlock(proof: number, previousHash: string): Block {
    const chainLength: number = this.chain.length;
    const block: Block = {
        index: chainLength + 1,
        timestamp: Date.now(),
        transactions: this.currentTransactions,
        proof: proof,
        previousHash: previousHash || Blockchain.hash(this.chain[chainLength - 1])
    };
    this.currentTransactions = [];
    this.chain.push(block);
    return block;
  }
  static hash(block: Block): string {
    const blockString: string = JSON.stringify(block);
    return sha256(blockString).toString();
  }
  static validProof(lastProof: number, proof: number, lastHash: string): boolean {
    const guess: string = `${lastProof}${proof}${lastHash}`;
    const guessHash: string = sha256(guess).toString();
    // console.log("guessHash----------", guessHash);
    return guessHash.substr(-4) === "0000";
  }
  public proofOfWork(lastBlock): number {
    const lastProof: number = lastBlock["proof"];
    const lastHash: string = Blockchain.hash(lastBlock);
    let proof = 1;
    while(!Blockchain.validProof(lastProof, proof, lastHash)) {
      proof += 1;
    }
    return proof;
  }
  public newTransaction(transaction: Transactions): number {
    this.currentTransactions.push(transaction);
    const block: Block = this.lastBlock();
    return block["index"] + 1;
  }
  public lastBlock(): Block {
    return this.chain[this.chain.length - 1];
  }
  public validChain(chain: Array<Block>): boolean {
    let lastBlock: Block = chain[0];
    let currentIndex: number = 1;
    while (currentIndex < chain.length) {
      let block: Block = chain[currentIndex];
      let lastBlockHash: string = Blockchain.hash(lastBlock);
      if (lastBlockHash !== block["previousHash"] || !Blockchain.validProof(lastBlock["proof"], block["proof"], lastBlockHash)) {
        return false;
      }
      lastBlock = block;
      currentIndex += 1;
    }
    return true;
  }

  private getLongestChain(callback: Callback | null): void {
    const neighbours: Array<Node> = this.nodes;
    let maxLength: number = this.chain.length;
    let newChain: Array<Block> = this.chain;
    let isNewChain: boolean = false;
    Promise.all(neighbours.map(node => http.get(`${node}/chain`))).then(res => {
      res.forEach(chainObjcet => {
        if (chainObjcet.length > maxLength && this.validChain(chainObjcet.chain)) {
          maxLength = chainObjcet.length;
          newChain = chainObjcet.chain;
          isNewChain = true;
        }
      });
      callback({ chain: newChain, isNewChain });
    }).catch(err => {
      callback({ chain: newChain, isNewChain, exceptions: err });
    });
  }

  public resolveConflicts(callback: Callback | null): void {
    this.getLongestChain(callback);
  }
};
export default Blockchain;
