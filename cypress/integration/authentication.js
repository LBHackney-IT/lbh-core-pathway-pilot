describe("visiting the app logged in", () => {
  it("can visit the website without being redirected", () => {
    cy.visitAsUser("/");
    cy.location('hostname').should('eq', 'localhost')
  })
})

describe("visiting the app when not logged in", () => {
  it("redirected to the auth server", () => {
    cy.visit("/", {failOnStatusCode: false});
    cy.location('hostname').should('eq', 'example.com')
  })
})
