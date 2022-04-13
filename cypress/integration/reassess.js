describe("Reassess workflow", () => {
  it("can reassess a workflow", () => {
    cy.visitAsUser("/workflows/reassessment-workflow")

    cy.contains("Start reassessment").click()

    cy.contains("Are these resident details correct?").should(
      "be.visible"
    )
    cy.contains("First name")
      .parent("div.govuk-summary-list__row")
      .within(() => {
        cy.contains("Ciasom").should("be.visible")
      })
    cy.contains("Last name")
      .parent("div.govuk-summary-list__row")
      .within(() => {
        cy.contains("Tesselate").should("be.visible")
      })

    cy.contains("Yes, they are correct").click()

    cy.contains("This is a reassessment").should("be.visible")
    cy.contains("Mock form").should("be.visible")

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

    cy.contains("This is a reassessment").should("be.visible")

    cy.contains("Mock step 2").click()

    cy.contains("h1", "Ciasom Tesselate").should("be.visible")

    cy.get("input#mock-question-2").type("Some other answer 2")
    cy.contains("Save and continue").click()

    cy.contains("This is a reassessment").should("be.visible")

    cy.contains("Mock step 3").click()

    cy.contains("h1", "Ciasom Tesselate").should("be.visible")

    cy.get("input#mock-question-3").type("Some other answer 3")
    cy.contains("Save and continue").click()

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
  it("can reassess from a legacy workflow", () => {
    cy.visitAsUser("/workflows/new?social_care_id=33556688")

    cy.contains("Start a new workflow").should("be.visible")

    cy.contains("What do you want to do?").should("be.visible")
    cy.contains("Start a reassessment").click()

    cy.contains("What type of assessment do you want to start?").should(
      "not.exist"
    )
    cy.contains("Which workflow do you want to reassess?").should("be.visible")

    cy.contains(
      "In most cases, this will be the workflow with the most up-to-date support plan for this person."
    ).should("be.visible")
    cy.get("input[id=linkToOriginal]").type("http://www.example.com")

    cy.get("input[id=mock-form]").click()

    cy.contains("Continue").click()

    cy.contains("Are these resident details correct?").should(
      "be.visible"
    )
    cy.contains("First name")
      .parent("div.govuk-summary-list__row")
      .within(() => {
        cy.contains("Ciasom").should("be.visible")
      })
    cy.contains("Last name")
      .parent("div.govuk-summary-list__row")
      .within(() => {
        cy.contains("Tesselate").should("be.visible")
      })

    cy.contains("Yes, they are correct").click()

    cy.contains("This is an unlinked reassessment").should("be.visible")

    cy.contains("Mock form").should("be.visible")

    cy.contains("Mock step").click()

    cy.contains("h1", "Mock step").should("be.visible")

    cy.get("input#mock-question").should("have.value", "")
    cy.get("input#mock-question").should("not.be.disabled")

    cy.contains("Save and continue").click()

    cy.contains("This is an unlinked reassessment").should("be.visible")

    cy.contains("Mock step 2").click()

    cy.contains("h1", "Mock step 2").should("be.visible")

    cy.get("input#mock-question-2").type("Some other answer 2")
    cy.contains("Save and continue").click()

    cy.contains("This is an unlinked reassessment").should("be.visible")

    cy.contains("Mock step 3").click()

    cy.contains("h1", "Mock step 3").should("be.visible")

    cy.get("input#mock-question-3").type("Some other answer 3")
    cy.contains("Save and continue").click()

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
