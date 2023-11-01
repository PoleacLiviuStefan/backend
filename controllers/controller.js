const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/userModule.js");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const { google } = require("googleapis");
const axios = require("axios");
const client = require("twilio")(accountSid, authToken);
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


const YOUR_DOMAIN = 'http://localhost:3000';
const allKeys= [[process.env.API_KEY_STEFANIA,process.env.API_KEY_DIANA,process.env.API_KEY_CATALINA,
  process.env.API_KEY_GABRIELA,process.env.API_KEY_LORENA],[process.env.CLIENT_SECRET_STEFANIA,process.env.CLIENT_SECRET_DIANA,process.env.CLIENT_SECRET_CATALINA,process.env.CLIENT_SECRET_GABRIELA,process.env.CLIENT_SECRET_LORENA],[process.env.CLIENT_ID_STEFANIA,process.env.CLIENT_ID_DIANA,process.env.CLIENT_ID_STEFANIA,process.env.CLIENT_ID_GABRIELA,process.env.CLIENT_ID_LORENA]]
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

const oauth2ClientLorena = new google.auth.OAuth2(
  process.env.CLIENT_ID_LORENA,
  process.env.CLIENT_SECRET_LORENA,
  process.env.REDIRECT_URL_LORENA
);

const scopes = ["https://www.googleapis.com/auth/calendar"];
const token = "";
const sendVerificationCode = async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }

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
      return res.status(500).json({ message: "Error sending OTP" }); // Send an error response
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
    return res.json({ message: "verify" }); // Send a success response
  } catch (err) {
    console.error(`Error creating user: ${err}`);
    return res.status(500).json({ message: "Error creating user" }); // Send an error response
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
const manipulateDataLorena = async (req, res) => {
  const authorizeUrl = oauth2ClientLorena.generateAuthUrl({
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
const googleRedirectLorena = async (req, res) => {
  const code = req.query.code;

  let { tokens } = await oauth2ClientLorena.getToken(code);
  oauth2ClientLorena.setCredentials(tokens);
  
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
        dateTime: dayjs(selectedDay+1).add(appointmentHour-2,"hour").add(appointmentMinute, "minute").toISOString(),
        timeZone: "Europe/Bucharest"    
      },
      end: {
        dateTime: dayjs(selectedDay+1).add(appointmentHour-2+serviceDurationHour+Math.floor((appointmentMinute+serviceDurationMinute)/60), "hour").add((appointmentMinute+serviceDurationMinute)%60, "minute").toISOString(),
        timeZone: "Europe/Bucharest" 
      },
    },
  });
  await calendar.events.insert({
    calendarId: "primary",
    auth: oauth2ClientLorena,
    requestBody: {
      summary: `Serviciu: ${serviceName}\nNume Client: ${clientName}\nNumarul de telefon Client: ${clientPhoneNumber}`,
      description: `Programarea are loc intre orele: ${appointmentTime}-${appointmentHour+serviceDurationHour+Math.floor((appointmentMinute+serviceDurationMinute)/60)}:${(appointmentMinute+serviceDurationMinute)%60=== 0 ? "00" :(appointmentMinute+serviceDurationMinute)%60} \n Costul este de: ${serviceCost} RON`,
      start: {
        dateTime: dayjs(selectedDay+1).add(appointmentHour-2,"hour").add(appointmentMinute, "minute").toISOString(),
        timeZone: "Europe/Bucharest"    
      },
      end: {
        dateTime: dayjs(selectedDay+1).add(appointmentHour-2+serviceDurationHour+Math.floor((appointmentMinute+serviceDurationMinute)/60), "hour").add((appointmentMinute+serviceDurationMinute)%60, "minute").toISOString(),
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

const allInOne = async (req, res) => {
  const currentDate = dayjs();

  // Calculate one month ago and three months from now
  const oneMonthAgo = currentDate.subtract(1, 'month');
  const threeMonthsFromNow = currentDate.add(3, 'months');
  console.log("oneMonthAgo: ", oneMonthAgo.toISOString());

  try {
    // Call the function to delete all events
    await deleteAllEvents();

    // Array of client objects
    const oauth2Clients = [oauth2ClientStefania, oauth2ClientGabriela, oauth2ClientDiana, oauth2ClientCatalina];

    const allData = [];

    for (const authClient of oauth2Clients) {
      try {
        // Wrap the calendar.events.list function in a Promise
        const eventData = await getEventsAll(authClient, oneMonthAgo, threeMonthsFromNow);
        allData.push(eventData);
        console.log("Events for client: ", authClient, eventData);
      } catch (err) {
        console.error("Error fetching events for client: ", authClient, err);
      }
    }

    // Call eventSchedule and pass the relevant data
    await eventScheduleAll(req, res, allData);
  } catch (err) {
    console.error("Error deleting events:", err);
    res.status(500).send("Error deleting events");
  }
};
const getEventsAll = async (authClient, timeMin, timeMax) => {
  const allEvents = [];

  let pageToken = null;
  do {
    const result = await calendar.events.list({
      calendarId: 'primary',
      auth: authClient,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: 2500, // You can adjust this based on your needs
      pageToken,
    });

    const events = result.data.items;
    if (events) {
      allEvents.push(...events);
    }

    pageToken = result.data.nextPageToken;
  } while (pageToken);

  return allEvents;
};


const eventScheduleAll = async (req, res, allData) => {
  console.log("Scheduling all events to Lorena");

  for (const events of allData) {
    console.log("Events:", events); // Log the entire events array
    for (const event of events) {
      console.log("Event:", event); // Log the entire event object
      const summary = event.summary;
      const description = event.description;
      const start = event.start.dateTime;
      const end = event.end.dateTime;

      console.log(`Summary: ${summary}`);
      console.log(`Description: ${description}`);
      console.log(`Start: ${start}`);
      console.log(`End: ${end}`);

      await calendar.events.insert({
        calendarId: "primary",
        auth: oauth2ClientLorena,
        requestBody: {
          summary: summary,
          description: description,
          start: {
            dateTime: start,
          },
          end: {
            dateTime: end,
          },
        },
      });
      console.log(`Scheduled event to Lorena: ${summary}`);
    }
  }

  res.send("All events scheduled to Lorena");
}
const deleteAllEvents = async () => {
  try {
    // List all events in the calendar
    const response = await calendar.events.list({
      calendarId: 'primary', // Replace with the desired calendar ID
      auth: oauth2ClientLorena,
      maxResults: 2500, // Adjust the number of events per page as needed
    });

    const events = response.data.items;

    if (events.length === 0) {
      console.log('No events to delete.');
      return;
    }

    // Delete each event
    for (const event of events) {
      await calendar.events.delete({
        calendarId: 'primary', // Replace with the desired calendar ID
        auth: oauth2ClientLorena,
        eventId: event.id,
      });
      console.log(`Deleted event: ${event.summary}`);
    }

    console.log('All events deleted.');
  } catch (err) {
    console.error('Error deleting events:', err);
    throw err;
  }
};


const refreshAccessToken = async (oauth2Client) => {
  try {
    const { tokens } = await oauth2Client.getToken(); // Get a new access token
    oauth2Client.setCredentials(tokens);
    console.log(`Refreshed access token for client: ${oauth2Client.credentials.client_id}`);
  } catch (error) {
    console.error(`Error refreshing access token for client ${oauth2Client.credentials.client_id}:`, error);
  }
};

// Call refreshAccessToken for all clients when needed
setInterval(() => {
  if (oauth2ClientGabriela.isTokenExpiring()) {
    refreshAccessToken(oauth2ClientGabriela);
  }

  if (oauth2ClientStefania.isTokenExpiring()) {
    refreshAccessToken(oauth2ClientStefania);
  }
  if (oauth2ClientDiana.isTokenExpiring()) {
    refreshAccessToken(oauth2ClientDiana);
  }
  if (oauth2ClientCatalina.isTokenExpiring()) {
    refreshAccessToken(oauth2ClientCatalina);
  }

  // Add refresh calls for other clients as needed
}, 1000 * 60 * 30); // Check every 30 minutes

// Function to delete all events from a calendar





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
  manipulateDataLorena,
  googleRedirectGabriela,
  googleRedirectStefania,
  googleRedirectDiana,
  googleRedirectCatalina,
  googleRedirectLorena,
  eventScheldule,
  showEvents,
  setKeyIndex,
  checkoutStripe,
  createPaymentIntent,
  configTest,
  allInOne
};