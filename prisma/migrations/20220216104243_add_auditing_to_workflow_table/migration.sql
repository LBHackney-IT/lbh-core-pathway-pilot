-- Add Workflow_Audit table along with trigger for this table
CREATE TABLE "Workflow_Audit"
(
    operation char(20) NOT NULL,
    timestamp timestamp DEFAULT CURRENT_TIMESTAMP,
    id        text     NOT NULL,
    before    JSONB    NOT NULL,
    after     JSONB    NOT NULL
);

CREATE OR REPLACE FUNCTION Workflow_Audit_Trigger() RETURNS TRIGGER AS
$Workflow_Audit$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO "Workflow_Audit" (operation, id, before, after)
        VALUES ('DELETE', old.id, TO_JSONB(old), '"null"');
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO "Workflow_Audit" (operation, id, before, after)
        VALUES ('INSERT', new.id, '"null"', TO_JSONB(new));
    ELSIF (TG_OP = 'UPDATE') THEN
        old."updatedAt" = new."updatedAt";
        IF OLD IS DISTINCT FROM NEW THEN
            INSERT INTO "Workflow_Audit" (operation, id, before, after)
            VALUES ('UPDATE', old.id, TO_JSONB(old), TO_JSONB(new));
        END IF;
    END IF;
    RETURN NULL;
END;
$Workflow_Audit$ LANGUAGE plpgsql;

CREATE TRIGGER "When_Workflow_Table_Changes"
    AFTER INSERT OR UPDATE OR DELETE
    ON "Workflow"
    FOR EACH ROW
EXECUTE PROCEDURE Workflow_Audit_Trigger();
