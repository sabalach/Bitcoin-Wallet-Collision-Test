const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');
const express = require('express');
const app = express();
const port = 3000;

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bitwallet');



const walletSchema = new mongoose.Schema({
    publicK: String,
    privateK: String,
    bl: Number
});
const Wallet = mongoose.model('Wallet', walletSchema);

const interval = setInterval(async () => {
    const keyPair = bitcoin.ECPair.makeRandom();
    
    const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey })
    // console.log("address " + address);
    
    const wif = keyPair.toWIF();
    // console.log("private key WIF " + wif)
    const pkey = keyPair.toWIF();
    
    const url = `https://blockchain.info/q/addressbalance/${address}`;
    const response = await axios.get(url);
    if(response.data != 0){
        const acc = new Wallet({ publicK: address, privateK: pkey, bl: response.data});
        acc.save(function(err){
            if (err) return console.error(err);
        });
        console.log('has balance');
    } else {
        console.log('no balance');
    }
}, 2000);

app.get('/', async(req, res) => {
    const wallets = await Wallet.find().exec();
    res.send(wallets)
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));