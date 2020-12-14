/*
* @Author: Just be free
* @Date:   2020-12-14 14:40:46
* @Last Modified by:   Just be free
* @Last Modified time: 2020-12-14 15:00:16
* @E-mail: justbefree@126.com
*/
const bodyParser = require("body-parser");
import { Block } from "../types/block";
import { Transactions } from "../types/transactions";
import { Node } from "../types/node";
import { default as Blockchain } from "./Blockchain";
import { default as express } from "express";
import { v4 as uuidv4 } from 'uuid';
const app = express();
const blockchain = new Blockchain();
app.get("/mine", (req, res) => {
  // 挖矿
  const lastBlock: Block = blockchain.lastBlock();
  const proof: number = blockchain.proofOfWork(lastBlock);
  const transaction: Transactions = { amount: 5, recipient: uuidv4(), sender: "000" };
  blockchain.newTransaction(transaction);
  const previousHash: string = Blockchain.hash(lastBlock);
  const block: Block = blockchain.newBlock(proof, previousHash);
  const response = {
      message: "New Block Forged",
      index: block["index"],
      transactions: block["transactions"],
      proof: block["proof"],
      previousHash: block["previousHash"]
  };
  res.send(response);
});

app.get("/chain", (req, res) => {
  req.accepts('application/json');
  const response = {
    chain: blockchain.getChain(),
    length: blockchain.getChainLength()
  };
  res.send(response);
});

app.post("/transactions/new", bodyParser.json(), (req, res) => {
  const required = ["sender", "recipient", "amount"];
  const transaction: Transactions = req.body;
  let pass: boolean = true;
  let message: string;
  required.forEach(param => {
    if (!(param in transaction)) {
      pass = false;
      message = `${param} is required`;
    }
  });
  if (pass) {
    const index: number = blockchain.newTransaction(transaction);
    message = `Transaction will be added to Block ${index}`;
    res.send({ message });
  } else {
    res.send({ message });
  }
});

app.post("/nodes/register", bodyParser.json(), (req, res) => {
  const nodes: Array<Node> = req.body.nodes;
  let message: string;
  if (!nodes) {
    message = "nodes is required";
  }
  if (!nodes.length) {
    message = "nodes type must be an Array";
  }

  nodes.forEach(node => {
    if (blockchain.isNodeExists(node)) {
      message = `The Node ${node} is already exists`;
    } else {
      blockchain.registerNodes(node);
      message = "New nodes have been added";
    }
  });
  res.send({ message, totalNodes: blockchain.getNodes() });
});


app.get("/nodes/resolve", (req, res) => {
  blockchain.resolveConflicts((chain) => {
    if (chain.isNewChain) {
      res.send({ message: "Our chain was replaced", chain });
    } else {
      res.send({ message: "Our chain is authoritative", chain });
    }
  });
});

app.listen(8001, () => {
  console.log("Server is running at 8001");
});