const axios = require('axios');

async function register() {
  try {
    const res = await axios.post('http://20.207.122.201/evaluation-service/register', {
      email: "mm8323@srmist.edu.in",
      name: "Manas Mahajan",
      mobileNo: "8847463885",
      githubUsername: "Manas20008",
      rollNo: "RA2311026020270",
      accessCode: "QkbpxH"
    });

    console.log(res.data);
  } catch (err) {
    console.log(err.response?.data || err.message);
  }
}

register();