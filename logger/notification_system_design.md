# Stage 1: API Design

## 1. Core Actions

The system should support:

* Create notification
* Get notifications for a user
* Mark notification as read

---

## 2. REST API Endpoints

### Create Notification

POST /notifications

Request:

```json id="req1"
{
  "studentID": 1042,
  "type": "Placement",
  "message": "Company hiring"
}
```

Response:

```json id="res1"
{
  "id": "uuid",
  "status": "created"
}
```

---

### Get Notifications

GET /notifications?studentID=1042

Response:

```json id="res2"
[
  {
    "id": "uuid",
    "type": "Placement",
    "message": "Company hiring",
    "isRead": false,
    "createdAt": "timestamp"
  }
]
```

---

### Mark as Read

PUT /notifications/{id}/read

Response:

```json id="res3"
{
  "status": "updated"
}
```

---

## 3. Headers

```json id="headers"
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

---

## 4. Real-time Notifications

Use WebSockets for real-time updates.

Flow:

* Backend sends notification
* Client receives instantly

---

## 5. Design Notes

* Use consistent naming
* Keep responses simple
* Ensure secure access using token

# Stage 2: Database Design

## 1. Overview

The database supports storing and retrieving notifications for users with efficient filtering for unread messages and real-time delivery support.

---

## 2. Entities

### 2.1 Users

Stores user information.

Fields:

* id (PK)
* name
* email
* createdAt

---

### 2.2 Notifications

Stores all notifications.

Fields:

* id (PK)
* userId (FK → Users.id)
* type (Placement | Event | Result)
* message
* isRead (boolean)
* createdAt

---

## 3. Relationships

* One User → Many Notifications
* Each Notification belongs to one User

---

## 4. Schema (SQL)

```sql
CREATE TABLE Users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Notifications (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50),
  type VARCHAR(20),
  message TEXT,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id)
);
```

---

## 5. Indexing

* Index on userId → fast retrieval per user
* Index on isRead → fast unread filtering

```sql
CREATE INDEX idx_user ON Notifications(userId);
CREATE INDEX idx_unread ON Notifications(isRead);
```

---

## 6. Design Considerations

* Scalable for large user base
* Optimized read performance
* Supports real-time notification delivery
* Simple schema for fast queries

# Stage 3: Query Optimization

## 1. Given Query

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```

---

## 2. Is this Query Correct?

Yes, logically correct.
It fetches unread notifications of a student in descending order of time.

---

## 3. Why is it Slow?

* No indexing → full table scan
* Large dataset (millions of rows)
* Sorting (ORDER BY) is expensive without index
* Filtering + sorting together increases cost

---

## 4. What Should be Changed?

Add a **composite index**:

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications (studentID, isRead, createdAt DESC);
```

---

## 5. Computation Cost

Before index:

* Time complexity ≈ O(N log N)

After index:

* Time complexity ≈ O(log N)

---

## 6. Should we Add Index on Every Column?

No

Reason:

* Slows down INSERT/UPDATE
* Increases storage
* Most indexes will never be used

---

## 7. Query for Placement Notifications (Last 7 Days)

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE type = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 days';
```
# Stage 4: Performance Optimization & Scaling

## 1. Problem

When the number of users increases, the system may face:

* Slow API responses
* High database load
* Delay in notification delivery

---

## 2. Solutions

### a) Caching

Use Redis to store frequently accessed notifications.

Benefits:

* Faster response time
* Reduces database load

---

### b) Pagination

Instead of fetching all notifications:

Use:

```sql
LIMIT 10 OFFSET 0
```

Benefits:

* Reduces data transfer
* Improves performance

---

### c) Database Indexing

Indexes on:

* studentID
* isRead
* createdAt

Benefits:

* Faster query execution

---

### d) Asynchronous Processing

Use message queues (Kafka / RabbitMQ)

Flow:

* Notification created → pushed to queue
* Worker processes → sends to users

Benefits:

* Handles high traffic
* Non-blocking system

---

### e) Load Balancing

Use multiple backend servers with load balancer.

Benefits:

* Distributes traffic
* Improves availability

---

### f) Horizontal Scaling

Add more servers when load increases.

Benefits:

* System can handle more users

---

## 3. Final Architecture Flow

Client → Load Balancer → Backend Server → Cache (Redis) → Database

Notification Flow:
Backend → Queue → Worker → User (real-time)

---

## 4. Conclusion

The system becomes:

* Scalable
* Fast
* Reliable
* Ready for large number of users

## Stage 5

### Problems in given implementation

The current approach has multiple issues:

- It sends emails sequentially, which is slow for large users (50,000 students)
- If sending email fails midway, some users receive notifications while others don’t
- No retry mechanism is present
- DB write and email sending are tightly coupled
- No fault tolerance or recovery mechanism

Example issue:
If email fails for 200 students, those students will not receive notifications and system does not retry.

---

### Should DB save and email sending happen together?

No.

Saving to DB and sending email should be separated because:
- DB write must always succeed (source of truth)
- Email sending is an external operation and may fail
- If both are tied together, failures will cause inconsistency

---

### Improved Approach

1. First store all notifications in DB
2. Push tasks into a queue (like message queue)
3. Worker services process queue asynchronously
4. Retry failed email deliveries
5. Log failures for monitoring

---

### Revised Pseudocode

function notify_all(student_ids, message):

    for student_id in student_ids:
        save_to_db(student_id, message)

    for student_id in student_ids:
        push_to_queue(student_id, message)


Worker Process:

while true:
    task = get_from_queue()

    try:
        send_email(task.student_id, task.message)
        push_to_app(task.student_id, task.message)
    except:
        retry(task)

---

### Benefits

- Faster execution (parallel processing)
- Reliable (retry mechanism)
- Scalable for large users
- No data loss

## Stage 6

### Approach

Notifications should be sorted based on:
1. Type priority (Placement > Result > Event)
2. Timestamp (latest first)

---

### Priority Mapping

Placement = 3  
Result = 2  
Event = 1  

---

### Logic

1. Fetch notifications from API
2. Assign priority score based on type
3. Sort notifications:
   - First by priority (descending)
   - Then by timestamp (descending)
4. Return top 10 notifications

---

### Code (JavaScript)

const axios = require("axios");

const token = "PASTE_YOUR_TOKEN_HERE";

function getPriority(type) {
    if (type === "Placement") return 3;
    if (type === "Result") return 2;
    return 1;
}

async function main() {
    const res = await axios.get(
        "http://20.207.122.201/evaluation-service/notifications",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const notifications = res.data.notifications;

    const sorted = notifications.sort((a, b) => {
        const p1 = getPriority(a.Type);
        const p2 = getPriority(b.Type);

        if (p1 !== p2) return p2 - p1;

        return new Date(b.Timestamp) - new Date(a.Timestamp);
    });

    const top10 = sorted.slice(0, 10);

    console.log(top10);
}

main();

---

### Handling Continuous Incoming Data

To maintain top 10 efficiently:
- Use a Min Heap of size 10
- Insert new notifications based on priority
- Remove lowest priority item when size exceeds 10

---

### Benefits

- Fast retrieval of important notifications
- Works efficiently even with large data
- Real-time updates possible

