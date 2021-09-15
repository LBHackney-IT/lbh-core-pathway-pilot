describe("Browse and inspect workflows", () => {
  it("can show, filter and sort a list of workflows", () => {
    cy.visitAsUser("/")

    cy.contains("Workflows")
    cy.contains("Work assigned to me (1)")
    cy.contains("Team (0)")

    cy.get("div h3").should("have.length", 1)
    cy.contains("All (3)").click()
    cy.get("div h3").should("have.length", 3)

    cy.contains("Filter and sort").click()
    cy.get("select#filter-form").select("Mock form")
    cy.get("select#sort").select("Recently started")

    // filter by status
    cy.get("select#filter-status").select("No action")
    cy.get("div h3").should("have.length", 1)
    cy.contains("Work assigned to me (0)")
    cy.contains("Team (0)")
    cy.contains("All (1)")

    // only reviews and reassessments
    cy.get("input[type=checkbox]").click()
    cy.contains("No results to show")
  })

  it("inspect the milestones and revision history of a workflow", () => {
    cy.visitAsUser("/workflows/no-action-workflow")

    cy.contains("h1", "Mock form for")
    cy.contains("No one is assigned")
    cy.contains("a", "Start reassessment")

    // milestones
    cy.contains("Authorised by Fake User")
    cy.contains("Approved by Fake User")
    cy.contains("Submitted for approval by Fake User")
    cy.contains("Started by Fake User")

    cy.contains("Revisions").click()

    // check that answers are shown
    cy.contains("Current version")
    cy.contains("example")
    cy.contains("question one")
    cy.contains("answer one")

    // check that answers state is persisted across pages
    cy.contains("example").click()
    cy.get("dl").should("not.exist")
    cy.contains("33% complete · Oldest version").click()
    cy.get("dl").should("not.exist")
    cy.contains("example").click()
    cy.get("dl")

    // diff highlighting
    cy.get("ins")
    cy.get("del")
  })

  it("can assign and reassign a workflow", () => {
    cy.visitAsUser("/")

    cy.contains("Assigned to Fake User").parent().contains("Overview").click()

    cy.contains("Reassign").click()

    cy.contains("h2", "Reassign this workflow")

    cy.get("select#teamAssignedTo").select("Access")
    cy.get("select#assignedTo").select(
      "Fake Approver (fake.approver@hackney.gov.uk)"
    )
    cy.contains("Save changes").click()

    cy.contains("Assigned to Fake Approver")

    cy.contains("Reassign").click()
    cy.get("select#assignedTo").select("Unassigned")
    cy.contains("Save changes").click()

    cy.contains("Assigned to Access team")

    cy.contains("Reassign").click()
    cy.get("select#teamAssignedTo").select("Unassigned")
    cy.contains("Save changes").click()

    cy.contains("No one is assigned")

    cy.contains("Assign someone?").click()
    cy.get("select#assignedTo").select("Fake User (fake.user@hackney.gov.uk)")
    cy.contains("Save changes").click()
  })
})
