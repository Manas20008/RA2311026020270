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
