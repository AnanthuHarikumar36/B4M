const dotenv =require("dotenv")
dotenv.config()

const accountSid = process.env.Account_SID;
const authToken = process.env.Auth_Token;
const verifySid = process.env.varify_sid;



const client = require('twilio')(accountSid, authToken);


 const twilioFunctions ={
    client,
    verifySid,
    generateOTP: async (mobNumber, channel) => {
      return client.verify.v2
        .services(verifySid)
        .verifications.create({ to: `+91${mobNumber}`, channel: channel });
    }
  }
 
  module.exports = twilioFunctions
