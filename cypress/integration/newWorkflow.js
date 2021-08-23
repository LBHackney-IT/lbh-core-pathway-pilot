describe("A new workflow", () => {
  it("", () => {
    cy.visitAsUser("/")

    cy.contains("Workflows")
    cy.contains("Filter and sort")
    cy.contains("Assigned to me (1)")
    // cy.contains("Team (2)")
    cy.contains("All (3)")

    // cy.visitAsApprover("/")

    // cy.visitAs(
    //   `/people/${Cypress.env('ADULT_RECORD_PERSON_ID')}`,
    //   AuthRoles.AdultsGroup
    // );
    // cy.contains('Add something new').click();
    // cy.contains('Add something new').should('be.visible');
    // cy.contains('Document Upload').should('be.visible');
    // cy.contains('Safeguarding Concern').should('be.visible');
    // cy.get("input[placeholder='Search forms...']").type(
    //   'FACE Care and Support Plan'
    // );
    // cy.contains('FACE Care and Support Plan').should('be.visible');
    // cy.contains('Appointeeship').should('not.exist');
    // cy.contains('FACE Care and Support Plan');
  })
})
