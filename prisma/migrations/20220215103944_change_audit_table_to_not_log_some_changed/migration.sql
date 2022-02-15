-- Replace the trigger for user audit with one that will ignore lastSeenAt and updatedAt
CREATE OR REPLACE FUNCTION User_Audit_Trigger() RETURNS TRIGGER AS
$User_Audit$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO "User_Audit" (operation, id, before, after)
        VALUES ('DELETE', old.id, TO_JSONB(old), '"null"');
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO "User_Audit" (operation, id, before, after)
        VALUES ('INSERT', new.id, '"null"', TO_JSONB(new));
    ELSIF (TG_OP = 'UPDATE') THEN
        old."lastSeenAt" = new."lastSeenAt";
        old."updatedAt" = new."updatedAt";
        IF OLD IS DISTINCT FROM NEW THEN
            INSERT INTO "User_Audit" (operation, id, before, after)
            VALUES ('UPDATE', old.id, TO_JSONB(old), TO_JSONB(new));
        END IF;
    END IF;
    RETURN NULL;
END;
$User_Audit$ LANGUAGE plpgsql;
