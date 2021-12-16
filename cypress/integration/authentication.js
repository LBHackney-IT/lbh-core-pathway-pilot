describe("visiting the app logged in", () => {
  it("can visit the website without being redirected", () => {
    cy.visitAsUser("/");
  })
})

describe("visiting the app when not logged in", () => {
  it("redirected to the auth server", () => {
    cy.visit("/");
    cy.location('host').should('eq', 'example.com')
  })
})
