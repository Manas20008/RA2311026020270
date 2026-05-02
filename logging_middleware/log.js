const axios = require('axios');

const allowedStacks = ["backend", "frontend"];
const allowedLevels = ["debug", "info", "warn", "error", "fatal"];
const allowedPackages = [
  "cache", "controller", "cron_job", "db", "domain",
  "handler", "repository", "route", "service",
  "auth", "config", "middleware", "utils"
];

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJtbTgzMjNAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwMDE0NSwiaWF0IjoxNzc3Njk5MjQ1LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiYzA5MTdiZmYtZGU0YS00YTcyLTk5MGQtOTliNDk5NzA0ZmQ3IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoibWFuYXMgbWFoYWphbiIsInN1YiI6IjQxMDVjYWM0LTNiZTItNDQxOS05ZjZhLTJkNzk0MTFiOTZlNiJ9LCJlbWFpbCI6Im1tODMyM0Bzcm1pc3QuZWR1LmluIiwibmFtZSI6Im1hbmFzIG1haGFqYW4iLCJyb2xsTm8iOiJyYTIzMTEwMjYwMjAyNzAiLCJhY2Nlc3NDb2RlIjoiUWticHhIIiwiY2xpZW50SUQiOiI0MTA1Y2FjNC0zYmUyLTQ0MTktOWY2YS0yZDc5NDExYjk2ZTYiLCJjbGllbnRTZWNyZXQiOiJhamt2aGNkSHVCUEVoelFLIn0.3wugXFMDymbdQP7Vm7gRW-FpH4EraJII4zM8IStNWhY";

async function Log(stack, level, pkg, message) {
  if (!allowedStacks.includes(stack)) return;
  if (!allowedLevels.includes(level)) return;
  if (!allowedPackages.includes(pkg)) return;

  try {
    await axios.post(
      "http://20.207.122.201/evaluation-service/logs",
      {
        stack: stack,
        level: level,
        package: pkg,
        message: message
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      }
    );
  } catch (e) {}
}

module.exports = Log;