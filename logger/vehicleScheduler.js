const axios = require("axios");
const Log = require("./log");

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJtbTgzMjNAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwMjIzNCwiaWF0IjoxNzc3NzAxMzM0LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMTUyMjBmZDYtZTJiYS00NTAxLWI5YjUtMDY4ZTA3NWUzZjE1IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoibWFuYXMgbWFoYWphbiIsInN1YiI6IjQxMDVjYWM0LTNiZTItNDQxOS05ZjZhLTJkNzk0MTFiOTZlNiJ9LCJlbWFpbCI6Im1tODMyM0Bzcm1pc3QuZWR1LmluIiwibmFtZSI6Im1hbmFzIG1haGFqYW4iLCJyb2xsTm8iOiJyYTIzMTEwMjYwMjAyNzAiLCJhY2Nlc3NDb2RlIjoiUWticHhIIiwiY2xpZW50SUQiOiI0MTA1Y2FjNC0zYmUyLTQ0MTktOWY2YS0yZDc5NDExYjk2ZTYiLCJjbGllbnRTZWNyZXQiOiJhamt2aGNkSHVCUEVoelFLIn0.rRgmxcCRD0S21oIgBKFnTgzWgDBpB-knpXvpdA8UJ34";

async function getDepots() {
  const res = await axios.get("http://20.207.122.201/evaluation-service/depots", {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  return res.data.depots;
}

async function getVehicles() {
  const res = await axios.get("http://20.207.122.201/evaluation-service/vehicles", {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  return res.data.vehicles;
}

function solve(vehicles, maxHours) {
  const n = vehicles.length;
  const dp = Array.from({ length: n + 1 }, () => Array(maxHours + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { Duration, Impact } = vehicles[i - 1];

    for (let w = 0; w <= maxHours; w++) {
      if (Duration <= w) {
        dp[i][w] = Math.max(
          Impact + dp[i - 1][w - Duration],
          dp[i - 1][w]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  let w = maxHours;
  const selected = [];

  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(vehicles[i - 1]);
      w -= vehicles[i - 1].Duration;
    }
  }

  return selected;
}

async function main() {
  try {
    const depots = await getDepots();
    const vehicles = await getVehicles();

    for (const d of depots) {
      const selected = solve(vehicles, d.MechanicHours);

      Log("backend", "info", "scheduler", `Depot ${d.ID}`);

      Log(
        "backend",
        "info",
        "result",
        JSON.stringify({
          depotId: d.ID,
          selected
        })
      );
    }
  } catch (e) {
    Log("backend", "error", "api", e.response?.data || e.message);
  }
}

main();