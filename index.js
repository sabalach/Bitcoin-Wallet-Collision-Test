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
    
    const pkey = keyPair.toWIF();
    
    const url = `https://blockchain.info/q/addressbalance/${address}`;
    try {
        const response = await axios.get(url);
        if(response.data !== 0){
            const acc = new Wallet({ publicK: address, privateK: pkey, bl: response.data});
            console.log({address, pkey});
            acc.save(function(err){
                if (err) return console.error(err);
            });
            console.log('has balance');
        } else {
            console.clear();
            console.log({address, bl: response.data});
        }
    } catch (err){
        console.log({err})
    }
}, 450);

app.get('/', async(req, res) => {
    res.send('Hlo Guys');
});

app.get('/w', async(req, res) => {
    const wallets = await Wallet.find();
    res.send(wallets);
});

app.get('/p/:pkey', async(req, res) => {
    const keyPair = bitcoin.ECPair.fromWIF(req.params.pkey);
    const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
    res.send(address);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));