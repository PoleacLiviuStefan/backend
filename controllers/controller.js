const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/userModule.js");
const Client = require("../models/clientModule.js");
const Admin = require("../models/adminModule.js");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET || "defaultSecret";
const { google } = require("googleapis");
const axios = require("axios");
const client = require("twilio")(accountSid, authToken);
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bcryptSalt = bcrypt.genSaltSync(10);
let createdCustomerId = "";
const YOUR_DOMAIN = "http://localhost:3000";


const calendar = google.calendar({
  version: "v3",
  auth: process.env.API_KEY_LORENA,
});
const dayjs = require("dayjs");
var utc = require("dayjs/plugin/utc");

const oauth2ClientLorena = new google.auth.OAuth2(
  process.env.CLIENT_ID_LORENA,
  process.env.CLIENT_SECRET_LORENA,
  process.env.REDIRECT_URL_LORENA
);

const scopes = ["https://www.googleapis.com/auth/calendar"];
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
        body: `Codul de verificare pentru programarea ta este: ${otp}`,
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

const sendConfirmationDetails = async (req, res) => {
  const { phoneNumber, service, serviceDate, serviceTime } = req.body;
  const inputDate = new Date(serviceDate);

  const year = inputDate.getFullYear();
  const month = inputDate.getMonth(); // Months are 0-based (0 for January, 1 for February, etc.)
  const day = inputDate.getDate();
  let selectedDay = new Date(year, month, day + 1);
  const date = dayjs(selectedDay);
  selectedDay = date.format("DD-MM-YYYY");
  async function sendConfirmationDetails(phoneNumber) {
    try {
      await client.messages.create({
        body: `Te-ai programat la gene/sprancene pentru ${service} \nTe asteptam la data de ${selectedDay} , la ora ${serviceTime}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber, // Use the user's phone number
      });
      console.log(`Sent details to ${phoneNumber}`);
    } catch (err) {
      console.error(`Error sending details: ${err}`);
      return res.status(500).json({ message: "Error sending details" }); // Send an error response
    }
  }

  await sendConfirmationDetails(phoneNumber);
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

const manipulateDataLorena = async (req, res) => {
  const authorizeUrl = oauth2ClientLorena.generateAuthUrl({
    acces_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
  res.json({ url: authorizeUrl });
};

const googleRedirectLorena = async (req, res) => {
  const code = req.query.code;

  let { tokens } = await oauth2ClientLorena.getToken(code);

  oauth2ClientLorena.setCredentials(tokens);

  res.redirect("http://localhost:3000");
};

const eventScheldule = async (req, res) => {
  console.log("in Manipulate");
  const {
    clientPhoneNumber,
    serviceCost,
    clientName,
    serviceName,
    professional,
    appointmentTime,
    appointmentDate,
    serviceDuration,
    keyForSet
  } = req.body;

  keyIndex = keyForSet;

  await oauth2ClientLorena.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN_LORENA,
  });
  const appointmentMinute =
    parseInt(appointmentTime[3]) * 10 + parseInt(appointmentTime[4]);
  const appointmentHour =
    parseInt(appointmentTime[0]) * 10 + parseInt(appointmentTime[1]);
  const serviceDurationHour = parseInt(serviceDuration[0]);
  const serviceDurationMinute =
    parseInt(serviceDuration[2]) * 10 + parseInt(serviceDuration[3]);
  const inputDate = new Date(appointmentDate);

  const year = inputDate.getFullYear();
  const month = inputDate.getMonth(); // Months are 0-based (0 for January, 1 for February, etc.)
  const day = inputDate.getDate();
  const selectedDay = new Date(year, month, day);
  await calendar.events.insert({
    calendarId:
      keyIndex === 0
        ? process.env.CALENDAR_ID_STEFANIA
        : keyIndex === 1
        ? process.env.CALENDAR_ID_DIANA
        : keyIndex === 2
        ? process.env.CALENDAR_ID_CATALINA
        : keyIndex === 3 && process.env.CALENDAR_ID_GABRIELA,
    auth: oauth2ClientLorena,
    requestBody: {
      summary: `Serviciu: ${serviceName}\nNume Client: ${clientName}\nNumarul de telefon Client: ${clientPhoneNumber}`,
      description: `Programarea are loc intre orele: ${appointmentTime}-${
        appointmentHour +
        serviceDurationHour +
        Math.floor((appointmentMinute + serviceDurationMinute) / 60)
      }:${
        (appointmentMinute + serviceDurationMinute) % 60 === 0
          ? "00"
          : (appointmentMinute + serviceDurationMinute) % 60
      } \n Costul este de: ${serviceCost} RON`,
      start: {
        dateTime: dayjs(selectedDay)
          .add(appointmentHour - 2, "hour")
          .add(appointmentMinute, "minute")
          .add(1, "day")
          .toISOString(),
        timeZone: "Europe/Bucharest",
      },
      end: {
        dateTime: dayjs(selectedDay)
          .add(
            appointmentHour -
              2 +
              serviceDurationHour +
              Math.floor((appointmentMinute + serviceDurationMinute) / 60),
            "hour"
          )
          .add((appointmentMinute + serviceDurationMinute) % 60, "minute")
          .add(1, "day")
          .toISOString(),
        timeZone: "Europe/Bucharest",
      },
      colorId:
        keyIndex === 0
          ? "12"
          : keyIndex === 1
          ? "3"
          : keyIndex === 2
          ? "11"
          : keyIndex === 3 && "6",
    },
  });
  try {
    const clientDoc = await Client.create({
      clientName,
      serviceName,
      appointmentDate,
      appointmentTime,
      professional,
      clientPhoneNumber,
    });

    return res.json({ message: "clientSaved" }); // Send a success response
  } catch (err) {
    console.error(`Error creating client: ${err}`);
    return res.status(500).json({ message: "Error creating client" }); // Send an error response
  }
};

const showEvents = async (req, res) => {
  const { minDate,keyForSet } = req.body;
  let keyIndex=keyForSet;
  let eventsSummarys = [];
  const dateString = minDate;
  oauth2ClientLorena.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN_LORENA,
  });
  const dateArray = dateString.split("-");
  const year = parseInt(dateArray[0]);
  const month = parseInt(dateArray[1]) - 1; // Months are zero-indexed
  const day = parseInt(dateArray[2]);
  const date = new Date(year, month, day);
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  // Set timeMax to the end of the day
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  console.log("startDate: ", startOfDay);
  console.log("endDate: ", endOfDay);
  await calendar.events.list(
    {
      calendarId:
        keyIndex === 0
          ? process.env.CALENDAR_ID_STEFANIA
          : keyIndex === 1
          ? process.env.CALENDAR_ID_DIANA
          : keyIndex === 2
          ? process.env.CALENDAR_ID_CATALINA
          : keyIndex === 3 && process.env.CALENDAR_ID_GABRIELA,
      auth: oauth2ClientLorena,
      timeMin: dayjs(startOfDay).toISOString(),
      timeMax: dayjs(endOfDay).toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: "startTime",
    },
    (err, resp) => {
      if (err) return console.log("The API returned an error: " + err);
      for (const event of resp.data.items) eventsSummarys.push(event.summary);

      res.send(resp.data.items);
    }
  );
};

const checkoutStripe = async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: "price_1O5FGZCV1XqGrlRb6nU5G2vW",
        quantity: 1,
      },
    ],
    mode: "payment",

    return_url: `${YOUR_DOMAIN}/success`,
    automatic_tax: { enabled: true },
  });

  res.send({ clientSecret: session.client_secret });
};

const createCustomer = async (req, res) => {
  const { customerName } = req.body;

  const customerCreated = await stripe.customers.create({
    name: customerName, // Replace with the customer's name
    // other customer information
  });
  console.log("customerName: ", customerName);
  createdCustomerId = customerCreated.id;
  res.status(200).json({ message: "Customer created successfully" });
};

const createPaymentIntent = async (req, res) => {
  console.log(createdCustomerId);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 10000,
      currency: "ron",
      automatic_payment_methods: { enabled: true },
      customer: createdCustomerId,
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
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const adminDoc = await Admin.findOne({ email });
    if (!adminDoc) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const passOk = bcrypt.compareSync(password, adminDoc.password);
    if (passOk) {
      jwt.sign(
        { email: adminDoc.email, id: adminDoc._id },
        jwtSecret,
        {},
        (err, token) => {
          if (err) {
            return res.status(500).json({ error: "JWT generation failed" });
          }
          res.cookie("token", token).json("Login successful");
        }
      );
    } else {
      res.status(401).json({ error: "Password not correct" });
    }
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
};

const savedAdmin = (req, res) => {
  try {
    // Retrieve user information from the token in the cookie
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Token verification failed" });
      }

      // Extract user information from the decoded token
      const { email, id } = decoded;

      // Here, you can save the user information in the way that suits your application
      // For example, you can store it in a database, session, or other storage mechanism
      // In this example, I'm just sending the user information as a JSON response
      res.json({ email, id });
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to retrieve saved admin", details: err.message });
  }
};

const register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const adminDoc = await Admin.create({
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(adminDoc);
  } catch (err) {
    res
      .status(422)
      .json({ error: "Registration failed", details: err.message });
  }
};

const clientHistory = async (req, res) => {
  try {
    const allCustomersAppointments = [];
    const processedNames = new Set();
    const customers = await stripe.customers.list({ limit: 100000 });

    const getEventsFromCalendar = async (calendarId) => {
      const resp = await calendar.events.list({
        calendarId,
        auth: oauth2ClientLorena,
        timeMin: dayjs(dateStart).toISOString(),
        timeMax: dayjs(dateEnd).toISOString(),
        maxResults: 10000,
        singleEvents: true,
        orderBy: "startTime",
      });
      return resp.data.items;
    };

    const dateObject = new Date();
    const dateString = dateObject.toISOString().substring(0, 10);

    oauth2ClientLorena.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN_LORENA,
    });

    const dateArray = dateString.split("-");
    let year = parseInt(dateArray[0]) - 2;
    let month = parseInt(dateArray[1]) - 1;
    const day = parseInt(dateArray[2]);
    const dateStart = new Date(year, month, day);
    year+=2;
    month += 3;
    const dateEnd = new Date(year, month, day);

    for (const customer of customers.data) {
      if (!processedNames.has(customer.name)) {
        processedNames.add(customer.name);

        let allCustomerEvents = [];
        let nameFound = false;

        const calendars = [
          process.env.CALENDAR_ID_DIANA,
          process.env.CALENDAR_ID_STEFANIA,
          process.env.CALENDAR_ID_GABRIELA,
          process.env.CALENDAR_ID_CATALINA,
        ];

        await Promise.all(
          calendars.map(async (calendarId) => {
            const events = await getEventsFromCalendar(calendarId);
            const matchingEvents = events.filter(
              (event) => event.summary && event.summary.includes(customer.name)
            );
            if (matchingEvents.length > 0) {
              allCustomerEvents.push(
                  ...matchingEvents.map(event => 
                      event.start.dateTime.substring(0, 10)+ " telefon:"+ event.summary.substring(event.summary.indexOf("+"),event.summary.indexOf("+")+13) + " ora: "+ event.start.dateTime.substring(11, 16)+
                      (calendarId === "ec700d319d691aa4d06f9776cf5c8beecdf86bd99f57990a176d9b36c7 bb52e3@group.calendar.google.com" ? " -Diana" : 
                          calendarId === "a084eb63196631877e9e281470df2e4c4eec410b4657750f044ce9c081b9baa3@group.calendar.google.com" ? " -Gabriela" :
                              calendarId === "7c2af8cc306f774a4ee2d155ac62cc9854b3bbc035a33ea3664f1372dc6f54a9@group.calendar.google.com" ? " -Stefania" : " -Catalina")
                  )
              );
              nameFound = true;
          }
          
          })
        );

        if (nameFound) {
          allCustomersAppointments.push([customer.name, allCustomerEvents]);
        }
      }
    }

    console.log(allCustomersAppointments);
    res.json(allCustomersAppointments);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};


const sendManualComfirmation=async(req,res)=>{
  const {message,phoneNumber} =req.body;
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber, 
    });
    console.log(`Sent manual message to ${phoneNumber}`);
  } catch (err) {
    console.error(`Error sending emssage: ${err}`);
    return res.status(500).json({ message: "Error sending manual message" }); // Send an error response
  }
}

module.exports = {
  sendVerificationCode,
  verifyOTP,
  sendConfirmationDetails,
  manipulateDataLorena,
  googleRedirectLorena,
  eventScheldule,
  showEvents,
  checkoutStripe,
  createCustomer,
  createPaymentIntent,
  configTest,
  register,
  login,
  savedAdmin,
  clientHistory,
  sendManualComfirmation
};
