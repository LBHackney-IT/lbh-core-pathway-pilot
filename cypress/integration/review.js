describe("New workflow", () => {
  it("can begin a new workflow", () => {
    cy.visitAsUser("/workflows/new?social_care_id=33556688")

    cy.contains("Start a new workflow").should("be.visible")

    cy.contains("What do you want to do?").should("be.visible")
    cy.contains("Start a review").click()

    cy.contains("What type of assessment do you want to start?").should(
      "not.exist"
    )
    cy.contains("Which workflow do you want to review?").should("be.visible")

    cy.get("select[id=workflowId").select("review-workflow")

    cy.contains("Please select the type of review you would like to complete").should(
      "not.exist"
    )
    cy.contains("If you have a link to the previous assessment or review, add it here").should(
      "not.exist"
    )

    cy.contains("Continue").click()

    cy.contains("Are their personal details still correct?").should(
      "be.visible"
    )
    cy.contains("Name")
      .parent("div.govuk-summary-list__row")
      .within(() => {
        cy.contains("Ciasom Tesselate").should("be.visible")
      })

    cy.contains("Yes, they are correct").click()

    cy.contains("This is a review").should("be.visible")
    cy.contains("You will not be able to amend the person's").should(
      "be.visible"
    )
    cy.contains("Mock form").should("be.visible")
    cy.get("Mock theme 2").should("not.exist")

    cy.contains("Mock step").click()

    cy.contains("h1", "Ciasom Tesselate").should("be.visible")

    cy.get("input#ro-mock-question").should("be.disabled")
    cy.get("input#ro-mock-question").should("have.value", "Mock answer")
    cy.get("input#mock-question").should("have.value", "")

    cy.contains("Copy all answers").click()

    cy.get("input#mock-question").should("not.be.disabled")
    cy.get("input#mock-question").should("have.value", "Mock answer")
    cy.contains("skip to next steps").should("be.visible")

    cy.contains("Save and continue").click()

    cy.contains("This is a review").should("be.visible")

    cy.contains("h2", "Ready to submit").should("be.visible")

    cy.contains("Continue").click()

    cy.contains("h1", "Next steps and approval").should("be.visible")

    cy.contains("Example next step 2").click()
    cy.contains("6 months from now").click()
    cy.get("select#approverEmail").select(
      "Fake Approver (fake.approver@hackney.gov.uk)"
    )
    cy.contains("Finish and send").click()
  })
})
