const dotenv = require("dotenv");
const User = require("../models/userModule.js");
const accountSid = "AC0674ca000f39217b72a903d5f91a9e7c";
const authToken = "700dca5d54cc1e0e3c743823fb940578";
const { google } = require("googleapis");
const axios = require("axios");
const client = require("twilio")(accountSid, authToken);
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

dotenv.config();
const YOUR_DOMAIN = 'http://localhost:3000';
const allKeys= [[process.env.API_KEY_STEFANIA,process.env.API_KEY_DIANA,process.env.API_KEY_CATALINA,
  process.env.API_KEY_GABRIELA],[process.env.CLIENT_SECRET_STEFANIA,process.env.CLIENT_SECRET_DIANA,process.env.CLIENT_SECRET_CATALINA,process.env.CLIENT_SECRET_GABRIELA],[process.env.CLIENT_ID_STEFANIA,process.env.CLIENT_ID_DIANA,process.env.CLIENT_ID_STEFANIA,process.env.CLIENT_ID_GABRIELA]]
let keyIndex=-1;
const setKeyIndex=(req,res) =>{
  res.send(req.body);
  const {keyForSet}=req.body;
  keyIndex=keyForSet

}
const calendar = google.calendar({
  version: "v3",
  auth: allKeys[0][keyIndex],
});
const dayjs = require("dayjs");
var utc = require('dayjs/plugin/utc')


const oauth2ClientGabriela = new google.auth.OAuth2(
  process.env.CLIENT_ID_GABRIELA,
  process.env.CLIENT_SECRET_GABRIELA,
  process.env.REDIRECT_URL_GABRIELA
);

const oauth2ClientStefania = new google.auth.OAuth2(
  process.env.CLIENT_ID_STEFANIA,
  process.env.CLIENT_SECRET_STEFANIA,
  process.env.REDIRECT_URL_STEFANIA
);
const oauth2ClientDiana = new google.auth.OAuth2(
  process.env.CLIENT_ID_DIANA,
  process.env.CLIENT_SECRET_DIANA,
  process.env.REDIRECT_URL_DIANA
);

const oauth2ClientCatalina = new google.auth.OAuth2(
  process.env.CLIENT_ID_CATALINA,
  process.env.CLIENT_SECRET_CATALINA,
  process.env.REDIRECT_URL_CATALINA
);


const scopes = ["https://www.googleapis.com/auth/calendar"];
const token = "";
const sendVerificationCode = async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  } else {
    function generateOTP() {
      const digits = "0123456789";
      let otp = "";
      for (let i = 0; i < 6; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
      }
      return otp;
    }

    async function sendOTP(phoneNumber, otp) {
      try {
        await client.messages.create({
          body: `Your OTP is ${otp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber, // Use the user's phone number
        });
        console.log(`Sent OTP to ${phoneNumber}`);
      } catch (err) {
        console.error(`Error sending OTP: ${err}`);
        res.status(500).json({ message: "Error sending OTP" });
        return; // Return early to prevent further response
      }
    }

    const otp = generateOTP();
    const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);

    try {
      const userDoc = await User.create({
        phoneNumber,
        otp,
        otpExpiration,
      });

      await sendOTP(userDoc.phoneNumber, userDoc.otp);
      res.json({ message: "verify" }); // Send a single response
    } catch (err) {
      console.error(`Error creating user: ${err}`);
      res.status(500).json({ message: "Error creating user" });
    }
  }
};

const verifyOTP = async (req, res) => {
  let { otp } = req.body;
  if (!otp) {
    return res.status(400).json({ message: "OTP is required" });
  }
  try {
    const user = await User.findOne({
      otp,
      otpExpiration: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    res.json({ message: "landingPage" }); // Send a single response
  } catch (err) {
    console.error(`Error verifying OTP: ${err}`);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

const manipulateDataGabriela = async (req, res) => {

  const authorizeUrl = oauth2ClientGabriela.generateAuthUrl({
    acces_type: "offline",
    scope: scopes,
    prompt: 'consent'
  }) 
  res.json({url:authorizeUrl});
};

const manipulateDataStefania = async (req, res) => {
  const authorizeUrl = oauth2ClientStefania.generateAuthUrl({
    acces_type: "offline",
    scope: scopes,
    prompt: 'consent'
  }) 
  res.json({url:authorizeUrl});
};

const manipulateDataDiana = async (req, res) => {
  const authorizeUrl = oauth2ClientDiana.generateAuthUrl({
    acces_type: "offline",
    scope: scopes,
    prompt: 'consent'
  }) 
  res.json({url:authorizeUrl});
};
  

const manipulateDataCatalina = async (req, res) => {
  const authorizeUrl = oauth2ClientCatalina.generateAuthUrl({
    acces_type: "offline",
    scope: scopes,
    prompt: 'consent'
  }) 
  res.json({url:authorizeUrl});
};

const googleRedirectGabriela = async (req, res) => {
  const code = req.query.code;
  
  let { tokens } = await oauth2ClientGabriela.getToken(code);
  console.log(tokens)
  oauth2ClientGabriela.setCredentials(tokens);
  
  res.redirect("http://localhost:3000")
};

const googleRedirectStefania = async (req, res) => {
  const code = req.query.code;

  let { tokens } = await oauth2ClientStefania.getToken(code);

  oauth2ClientStefania.setCredentials(tokens);
  
  res.redirect("http://localhost:3000")
};

const googleRedirectDiana = async (req, res) => {
  const code = req.query.code;

  let { tokens } = await oauth2ClientDiana.getToken(code);
  oauth2ClientDiana.setCredentials(tokens);
  
  res.redirect("http://localhost:3000")
};

const googleRedirectCatalina = async (req, res) => {
  const code = req.query.code;

  let { tokens } = await oauth2ClientCatalina.getToken(code);
  oauth2ClientCatalina.setCredentials(tokens);
  
  res.redirect("http://localhost:3000")
};

const eventScheldule = async (req, res) => {
  console.log("in Manipulate")
  const {clientPhoneNumber,serviceCost,clientName,serviceName,appointmentTime,appointmentDate,serviceDuration}=req.body;
  
  const appointmentMinute=parseInt(appointmentTime[3])*10 + parseInt(appointmentTime[4])
  const appointmentHour=parseInt(appointmentTime[0])*10 + parseInt(appointmentTime[1])
  const serviceDurationHour=parseInt(serviceDuration[0]);
  const serviceDurationMinute=parseInt(serviceDuration[2])*10 + parseInt(serviceDuration[3]);
  const inputDate = new Date(appointmentDate);

  const year = inputDate.getFullYear();
  const month = inputDate.getMonth(); // Months are 0-based (0 for January, 1 for February, etc.)
  const day = inputDate.getDate() ;
  const selectedDay = new Date(year, month, day);
  await calendar.events.insert({
    calendarId: "primary",
    auth: (keyIndex===0 ? oauth2ClientStefania : keyIndex===1 ? oauth2ClientDiana : keyIndex===2 ? oauth2ClientCatalina : keyIndex===3 && oauth2ClientGabriela),
    requestBody: {
      summary: `Serviciu: ${serviceName}\nNume Client: ${clientName}\nNumarul de telefon Client: ${clientPhoneNumber}`,
      description: `Programarea are loc intre orele: ${appointmentTime}-${appointmentHour+serviceDurationHour+Math.floor((appointmentMinute+serviceDurationMinute)/60)}:${(appointmentMinute+serviceDurationMinute)%60=== 0 ? "00" :(appointmentMinute+serviceDurationMinute)%60} \n Costul este de: ${serviceCost} RON`,
      start: {
        dateTime: dayjs(selectedDay).add(appointmentHour,"hour").add(appointmentMinute, "minute").toISOString(),
        timeZone: "Europe/Bucharest"    
      },
      end: {
        dateTime: dayjs(selectedDay).add(appointmentHour+serviceDurationHour+Math.floor((appointmentMinute+serviceDurationMinute)/60), "hour").add((appointmentMinute+serviceDurationMinute)%60, "minute").toISOString(),
        timeZone: "Europe/Bucharest" 
      },
    },
  });
  res.send({
    appService: appointmentHour+6+serviceDurationHour+Math.floor((appointmentMinute+serviceDurationMinute)/60),
    appointmentMinute:appointmentMinute,
    serviceDurationMinute:serviceDurationMinute
  });
};

const showEvents = async (req, res) => {
    console.log((keyIndex===0 ? oauth2ClientStefania.credentials.access_token : keyIndex===1 ? oauth2ClientDiana.credentials.access_token : keyIndex===2 ? oauth2ClientCatalina.credentials.access_token : oauth2ClientGabriela.credentials.access_token ));
    const {minDate}=req.body;
    const dateString = minDate;
const dateArray = dateString.split('-');
const year = parseInt(dateArray[0]);
const month = parseInt(dateArray[1]) - 1; // Months are zero-indexed
const day = parseInt(dateArray[2]);
const date = new Date(year, month, day+1);
const startOfDay = new Date(date);
startOfDay.setHours(-15, 0, 0, 1);

// Set timeMax to the end of the day
const endOfDay = new Date(date);
endOfDay.setHours(8, 59, 59, 999);

  await calendar.events.list(
    {
      calendarId: "primary",
      auth: (keyIndex===0 ? oauth2ClientStefania : keyIndex===1 ? oauth2ClientDiana : keyIndex===2 ? oauth2ClientCatalina : keyIndex===3 && oauth2ClientGabriela ),
      timeMin: dayjs(startOfDay).toISOString(),
      timeMax: dayjs(endOfDay).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    },
    (err, resp) => {
      if (err) return console.log("The API returned an error: " + err);
      res.send(resp.data.items);
    }
  );

};

const checkoutStripe= async (req,res)=>{
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: 'price_1O5FGZCV1XqGrlRb6nU5G2vW',
        quantity: 1,
      },
    ],
    mode: 'payment',
    return_url: `${YOUR_DOMAIN}/success`,
    automatic_tax: {enabled: true},
  });

  res.send({clientSecret: session.client_secret});
}


const createPaymentIntent = async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 10000,
  currency: 'ron',
  automatic_payment_methods: {enabled: true},
    });

    // Send publishable key nd PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
};



const configTest = (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
}

module.exports = {
  sendVerificationCode,
  verifyOTP,
  manipulateDataGabriela,
  manipulateDataStefania,
  manipulateDataDiana,
  manipulateDataCatalina,
  googleRedirectGabriela,
  googleRedirectStefania,
  googleRedirectDiana,
  googleRedirectCatalina,
  eventScheldule,
  showEvents,
  setKeyIndex,
  checkoutStripe,
  createPaymentIntent,
  configTest
};
