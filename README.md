# RA2311026020270

This repository contains my solution for the backend evaluation task.

I have implemented:
- Logging middleware (used instead of console logs as instructed)
- Vehicle Maintenance Scheduler using API data
- Notification system design (Stage 1 to Stage 4)

## Tech Used
- Node.js
- Axios

## How to Run

1. Install dependencies  
npm install  

2. Generate token  
node auth.js  

3. Run scheduler  
node vehicleScheduler.js  

## Notes
- APIs are protected, so token is required before running anything  
- Logging middleware is used everywhere instead of console.log  
- Data is fetched from given APIs (no database used for scheduler part)

## Project Structure
- auth.js → generates access token  
- register.js → registration details  
- middleware.js → logging middleware  
- log.js → logging function  
- vehicleScheduler.js → main scheduling logic  
- notification_system_design.md → contains all stages  
