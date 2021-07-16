var express = require('express');
var axios = require('axios');
var app = express();
var PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
let userModel = require('./models/User');
mongoose.set('useFindAndModify', false);
// DB Config
const db = require('./config/keys').mongoURI;
mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


// let msg = new userModel({
//     username:'Radhika'
// });
// msg.save()
// .then(doc=>{
//     console.log(doc);
// })
// .then(err=>{
//     console.log(err);
// })



app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ user: 'himanshu' });
});

const headers = {
    'Accept': '*/*',
    'Content-Type': 'application/json',
    'Origin': 'https://console.dialogflow.com',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
    'sec-ch-ua-mobile': '?0'
}

let json = '';

app.post('/', (req, res) => {
    let message = req.body.query.message;
    let sender = req.body.query.sender;
    console.log(message);
    console.log(sender);

    userModel.countDocuments({ donewelcome: sender }, (err,count)=>{
        if(count>0) {
            userModel.countDocuments({ username: sender }, (err, count) => {
                if (count > 0) {
                    if (message.toLowerCase() == '!start') {
                        userModel.findOneAndDelete({ username: sender })
                            .then(response => {
                                console.log(response);
                            })
                            .catch(err => {
                                console.error(err)
                            });
                        res.json({
                            "replies": [
                                {
                                    "message": "Bot: So, you've changed your mind. I like that."
        
                                }
                            ]
                        });
                    }
                    else {
                        res.json({
                            "replies": [
                                {
                                    "message": ""
        
                                }
                            ]
                        });
                    }
                }
                else if (message.toLowerCase() == '!stop') {
                    res.json({
                        "replies": [
                            {
                                "message": "*BOT STOPPED*"
        
                            },
                            {
                                "message": "Start again with !start"
                            }
                        ]
                    });
                    let userdb = new userModel({
                        createdAt: new Date(),
                        username: sender
                    });
                    userdb.save()
                        .then((doc, err) => {
                            if (doc)
                                console.log("user ignored: ", doc);
                            else
                                console.log(err);
                        })
                }
                else {
        
                    axios.post('https://dialogflow.cloud.google.com/v1/integrations/messenger/webhook/98c2feaf-8231-4770-91d3-52910f7ac3a0/sessions/webdemo-74625497-f8b9-42e5-404f-8a7b3f70fd87?platform=webdemo', {
                        "queryInput": { "text": { "text": message, "languageCode": "en" } }
                    }, {
                        headers: headers
                    })
                        .then((response) => {
                            json = response.data.slice(1);
                            json = json.slice(1);
                            json = json.slice(1);
                            json = json.slice(1);
                            json = json.slice(1);
                            json = JSON.parse(json);
        
                            console.log(json.queryResult.fulfillmentText);
                            res.json({
                                "replies": [
                                    {
                                        "message": json.queryResult.fulfillmentText
        
                                    }
                                ]
                            });
                        }, (error) => {
                            console.log(error);
                        })
                }
            })
        }
        else {
            let welcome = new userModel({
                createdAt: new Date(),
                donewelcome:sender
            });
            welcome.save()
            .then((doc,err)=>{
                if(doc)
                console.log(doc)
                else
                console.log(err)
            })
            res.json({
                "replies": [
                    {
                        "message":"Hey there. I'm Angela here. Himanshu's virtual assistant. Himanshu sir will soon check your message, till then you can chat with me ;) and STOP whenever you like by sending !stop (Don't forget the exclamation)"
                    }
                ]
            })
        }
    })



    


});

app.listen(PORT, (err) => {
    if (err)
        console.log(err);
    console.log("Server Listening on PORT ", PORT);
});