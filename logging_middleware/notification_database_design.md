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


