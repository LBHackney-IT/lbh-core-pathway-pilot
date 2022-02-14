# Working with audit tables

We now audit changes in application state using a series of audit tables. 

## Structure

The standard format for these tables is:

| Column      | Type      | Notes                                          |
|-------------|-----------|------------------------------------------------|
| `operation` | Enum      | The SQL operation `INSERT or UPDATE or DELETE` |
| `timestamp` | timestamp | Timestamp of when the change was completed     |
| `before`    | JSON      | representation of the row before changes       |
| `after`     | JSON      | representation of the row after changes        |

```postgresql
CREATE TABLE "%_Audit"
(
    operation char(20) NOT NULL,
    timestamp timestamp DEFAULT CURRENT_TIMESTAMP,
    before    JSONB    NOT NULL,
    after     JSONB    NOT NULL
);
```

## Querying audit tables

If you want to see how a record has changed over time you can run a query along the lines of the example query below.

Query changes to a users name over time.

```postgresql
SELECT 
       UA.timestamp,                        -- Get the timestamp of the change 
       UA.after -> 'name' AS "name"         -- Extract the name of the user from the after audit
FROM "User" U                               -- Select from the main table
JOIN "User_Audit" UA ON U.id = UA.id        -- Join on the id to the accompanying audit table
WHERE U.email = 'fake.user@hackney.gov.uk'; -- Filter the main query by the users email
```
