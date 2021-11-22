describe("Browse and inspect workflows", () => {
  it("can show, filter and sort a list of workflows", () => {
    cy.visitAsUser("/?quick_filter=all")

    cy.contains("In progress (0)")
    cy.contains("Waiting for approval (1)")
    cy.contains("Waiting for QAM (0)")
    cy.contains("Completed (2)")

    // filter by assignment
    cy.contains("Me").click()
    cy.contains("Also include things I've interacted with").click()

    cy.contains("Waiting for approval (1)")
    cy.contains("Completed (0)")

    cy.contains("All").click()

    // filter by social care id
    cy.get("input#social-care-id").type("33556688")

    // historic data
    cy.contains("Include historic work from before October 2021").click()
  })

  it("inspect the milestones and revision history of a workflow", () => {
    cy.visitAsUser("/workflows/no-action-workflow")

    cy.contains("h1", "Mock form")
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
    cy.contains("Current version").should("have.attr", "aria-selected", "true")
    cy.contains("example").click()
    cy.get("dl").should("not.exist")
    cy.contains("33% complete · Oldest version").should(
      "have.attr",
      "aria-selected",
      "false"
    )
    cy.contains("33% complete · Oldest version").click()
    cy.contains("Current version").should("have.attr", "aria-selected", "false")
    cy.contains("33% complete · Oldest version").should(
      "have.attr",
      "aria-selected",
      "true"
    )
    cy.get("dl").should("not.exist")
    cy.contains("example").click()
    cy.contains("question one").should("be.visible")

    // diff highlighting
    cy.get("ins")
    cy.get("del")
  })

  it("can assign and reassign a workflow", () => {
    cy.visitAsUser("/?quick_filter=all")

    cy.get("ul li a").first().click()

    cy.contains("Assign someone?").click()

    cy.contains("h2", "Reassign this workflow")

    cy.get("select#teamAssignedTo").select("Case management")
    cy.get("select#assignedTo").select("Fake Approver")
    cy.contains("Save changes").click()

    cy.contains("Assigned to Fake Approver")

    cy.contains("Reassign").click()
    cy.get("select#assignedTo").select("Unassigned")
    cy.contains("Save changes").click()

    cy.contains("Assigned to Case management team")

    cy.contains("Reassign").click()
    cy.get("select#teamAssignedTo").select("Unassigned")
    cy.contains("Save changes").click()

    cy.contains("No one is assigned")

    cy.contains("Assign someone?").click()
    cy.get("select#assignedTo").select("Fake User")
    cy.contains("Save changes").click()
  })
})
