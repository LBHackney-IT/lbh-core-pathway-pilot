describe("Reassess workflow", () => {
  it("can reassess a workflow", () => {
    cy.visitAsUser("/")

    cy.contains("Workflows").should("be.visible")

    cy.contains("button", /^All/).click()
    cy.get(
      'a[href="/workflows/reassessment-workflow/confirm-personal-details"]'
    ).click()

    cy.contains("Are their personal details still correct?").should(
      "be.visible"
    )
    cy.contains("Name")
      .parent("div.govuk-summary-list__row")
      .within(() => {
        cy.contains("Ciasom Tesselate").should("be.visible")
      })

    cy.contains("Yes, they are correct").click()

    cy.contains("Start a reassessment").should("be.visible")

    cy.contains("Unplanned").click()
    cy.contains("Hospital stay").click()
    cy.contains(
      "How is the care and support working since the last assessment?"
    ).type("Some answer")
    cy.contains("Add person").click()
    cy.contains("Their name").type("John Doe")
    cy.contains("Is a reassessment needed?")
      .parent(".govuk-fieldset")
      .within(() => {
        cy.contains("Yes").click()
      })
    cy.contains("Is a change to the support plan needed?")
      .parent(".govuk-fieldset")
      .within(() => {
        cy.contains("Yes").click()
      })
    cy.contains("Continue to reassessment").click()

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
})
