-- Add User_Audit table along with trigger for this table
CREATE TABLE "User_Audit"
(
    operation char(20) NOT NULL,
    timestamp timestamp DEFAULT CURRENT_TIMESTAMP,
    before    JSONB    NOT NULL,
    after     JSONB    NOT NULL
);

CREATE OR REPLACE FUNCTION User_Audit_Trigger() RETURNS TRIGGER AS
$User_Audit$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO "User_Audit" (operation, before, after)
        VALUES ('DELETE', TO_JSONB(old), '"null"');
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO "User_Audit" (operation, before, after)
        VALUES ('INSERT', '"null"', TO_JSONB(new));
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO "User_Audit" (operation, before, after)
        VALUES ('UPDATE', TO_JSONB(old), TO_JSONB(new));
    END IF;
    RETURN NULL;
END;
$User_Audit$ LANGUAGE plpgsql;

CREATE TRIGGER "When_User_Table_Changes"
    AFTER INSERT OR UPDATE OR DELETE
    ON "User"
    FOR EACH ROW
EXECUTE PROCEDURE User_Audit_Trigger();
