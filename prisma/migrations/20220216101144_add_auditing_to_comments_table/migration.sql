-- Add Comment_Audit table along with trigger for this table
CREATE TABLE "Comment_Audit"
(
    operation char(20) NOT NULL,
    timestamp timestamp DEFAULT CURRENT_TIMESTAMP,
    id        text     NOT NULL,
    before    JSONB    NOT NULL,
    after     JSONB    NOT NULL
);

CREATE OR REPLACE FUNCTION Comment_Audit_Trigger() RETURNS TRIGGER AS
$Comment_Audit$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO "Comment_Audit" (operation, id, before, after)
        VALUES ('DELETE', old.id, TO_JSONB(old), '"null"');
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO "Comment_Audit" (operation, id, before, after)
        VALUES ('INSERT', new.id, '"null"', TO_JSONB(new));
    ELSIF (TG_OP = 'UPDATE') THEN
        IF OLD IS DISTINCT FROM NEW THEN
            INSERT INTO "Comment_Audit" (operation, id, before, after)
            VALUES ('UPDATE', old.id, TO_JSONB(old), TO_JSONB(new));
        END IF;
    END IF;
    RETURN NULL;
END;
$Comment_Audit$ LANGUAGE plpgsql;

CREATE TRIGGER "When_Comment_Table_Changes"
    AFTER INSERT OR UPDATE OR DELETE
    ON "Comment"
    FOR EACH ROW
EXECUTE PROCEDURE Comment_Audit_Trigger();
