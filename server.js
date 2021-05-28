require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const cors = require('cors');
const axios = require("axios");
const Pusher = require('pusher')



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
    console.log("WEBHOOK")
    console.log(req.headers)
    console.log(req.body)

    let payload = req.body

    await pusher.trigger("workflow-updates", "workflow-completed", payload)
    workflow_events.unshift(payload)

    
    res.send()
}

app.post("/cci-webhook", handleWebhook)

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