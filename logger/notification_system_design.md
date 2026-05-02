# Stage 1: Notification System Design

## 1. Overview

The notification system allows students to receive updates related to placements, events, and results in real-time. The system supports creating, fetching, marking, and delivering notifications efficiently.

---

## 2. Core Actions

* Create notification
* Get all notifications for a user
* Get unread notifications
* Mark notification as read
* Send real-time notification

---

## 3. API Endpoints

### 3.1 Create Notification

POST /notifications

Request Body:
{
"userId": "string",
"type": "Placement | Event | Result",
"message": "string"
}

Response:
{
"id": "string",
"status": "created"
}

---

### 3.2 Get All Notifications

GET /notifications?userId=123

Response:
{
"notifications": [
{
"id": "string",
"type": "string",
"message": "string",
"isRead": false,
"timestamp": "datetime"
}
]
}

---

### 3.3 Get Unread Notifications

GET /notifications/unread?userId=123

Response:
{
"notifications": [
{
"id": "string",
"type": "string",
"message": "string",
"isRead": false,
"timestamp": "datetime"
}
]
}

---

### 3.4 Mark as Read

PATCH /notifications/{id}/read

Response:
{
"status": "updated"
}

---

## 4. Headers

All requests include:

Authorization: Bearer <token>
Content-Type: application/json

---

## 5. JSON Schema

Notification Object:
{
"id": "string",
"userId": "string",
"type": "Placement | Event | Result",
"message": "string",
"isRead": false,
"timestamp": "datetime"
}

---

## 6. Real-Time Notification Mechanism

The system uses WebSockets for real-time updates.

* Client establishes a WebSocket connection after login
* Server pushes new notifications instantly
* No need for repeated polling

Alternative:

* Server-Sent Events (SSE) can also be used for one-way updates

---

## 7. Design Considerations

* Scalable for large number of users
* Efficient read/unread filtering
* Minimal latency for real-time delivery
* Stateless REST APIs
