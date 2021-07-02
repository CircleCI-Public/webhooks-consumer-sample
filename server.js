require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const cors = require('cors');
const axios = require("axios");
const Pusher = require('pusher')
const crypto = require("crypto")

app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let port = process.env.PORT || "5000";

const pusher = new Pusher({
    appId: "1209282",
    key: "3ad5dab74e212a6a3009",
    secret: "59d30430ab61f90f42ad",
    cluster: "eu",
    useTLS: true
  });


axios.defaults.headers.common['Circle-Token'] = process.env.API_KEY;

const workflow_events = []

const handleWebhook = async (req, res) => {
    console.log("WEBHOOK RECEIVED")
    console.log(req.headers)

    let payload = req.body
    console.log(JSON.stringify(payload))

    // Check signature to verify authenticity of webhook payload
    // Sample signature: 'circleci-signature': 'v1=281d91d308ef7a7e8bd7c7606353d5a2dd8d7c5f01143a98c1e8083e04f861ba',
    let signature = req.headers["circleci-signature"].substring(3)
    const key = "super-secret-1234" // Same string as used in webhook setup
    let testDigest = crypto.createHmac('sha256', key).update(JSON.stringify(payload)).digest('hex')

    if (testDigest !== signature) {
        console.log("Webhook signature not matching")
        console.log(`Signature: ${signature}`)
        console.log(`Test digest: ${testDigest}`)
        res.status(403).send("Invalid signature")
    }

    console.log("Webhook signature and test digest are matching.")
    
    await pusher.trigger("workflow-updates", "workflow-completed", payload)
    workflow_events.unshift(payload)    
    res.send()
}

app.post("/cci-webhook", handleWebhook)
app.post("/", handleWebhook)

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.get("/getworkflows", async (req, res) => {
    console.log(workflow_events)
    res.send(workflow_events)
})

app.listen(port, () => {
    console.log(`App Running at http://localhost:${port}`);
})