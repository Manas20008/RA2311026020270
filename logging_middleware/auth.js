const axios = require('axios');

async function getToken() {
  try {
    const res = await axios.post('http://20.207.122.201/evaluation-service/auth', {
      email: "mm8323@srmist.edu.in",
      name: "Manas Mahajan",
      rollNo: "RA2311026020270",
      accessCode: "QkbpxH",
      clientID: "4105cac4-3be2-4419-9f6a-2d79411b96e6",
      clientSecret: "ajkvhcdHuBPEhzQK"
    });

    console.log(res.data);
  } catch (err) {
    console.log(err.response?.data || err.message);
  }
}

getToken();