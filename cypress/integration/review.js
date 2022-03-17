describe("New workflow", () => {
  it("can begin a new workflow", () => {
    cy.visitAsUser("/workflows/new?social_care_id=33556688")

    cy.contains("Start a new workflow").should("be.visible")

    cy.contains("What do you want to do?").should("be.visible")
    cy.contains("Start a review").click()

    cy.contains("What type of assessment do you want to start?").should(
      "not.exist"
    )
    cy.contains("What workflow do you want to review?").should("be.visible")

    cy.get("select[id=workflowId] > option")
    .eq(2)
    .then(element => cy.get('select[id=workflowId]').select(element.val()))
    
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
    cy.contains("Mock form").should("be.visible")
  })
})
