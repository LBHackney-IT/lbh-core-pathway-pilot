describe("New workflow", () => {
  it("can begin a new workflow", () => {
    cy.visitAsUser("/workflows/new?social_care_id=33556688")

    cy.contains("Start a new workflow").should("be.visible")

    cy.contains("What do you want to do?").should("be.visible")
    cy.contains("Start a new assessment").click()

    cy.contains("What type of assessment do you want to start?").should(
      "be.visible"
    )
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

    cy.contains("Ciasom Tesselate").should("be.visible")
    cy.contains("h1", "Mock form").should("be.visible")
    cy.contains("h2", /1. Mock theme$/)
      .parent()
      .within(() => {
        cy.get("li").eq(0).contains("Mock step").should("be.visible")
        cy.get("li").eq(0).contains("To do").should("be.visible")
      })
    cy.contains("h2", /2. Mock theme 2$/)
      .parent()
      .within(() => {
        cy.get("li").eq(0).contains("Mock step 2").should("be.visible")
        cy.get("li").eq(0).contains("To do").should("be.visible")
        cy.get("li").eq(1).contains("Mock step 3").should("be.visible")
        cy.get("li").eq(1).contains("To do").should("be.visible")
      })
  })

  it("can fill in a form using the task list", () => {
    cy.visitAsUser("/?quick_filter=all")

    cy.contains("h1", "Planner").should("be.visible")

    cy.get("main ul")
      .eq(0)
      .within(() => cy.get("li a").first().click())

    cy.contains("Resume").click()

    cy.contains("h1", "Mock form").should("be.visible")

    // Click mock step
    cy.get("ol li ul li span a").first().click()

    cy.contains("h1", "Mock step").should("be.visible")

    cy.contains("Mock question?").type("Some answer")
    cy.contains("Save and continue").click()

    cy.contains("h2", /1. Mock theme$/)
      .parent()
      .within(() => {
        cy.get("li").eq(0).contains("Done").should("be.visible")
      })

    cy.contains("Mock step 2").click()

    cy.contains("h1", "Mock step 2").should("be.visible")

    cy.contains("Mock question 2?").type("Some answer 2")
    cy.contains("Save and continue").click()

    cy.contains("h2", /2. Mock theme 2$/)
      .parent()
      .within(() => {
        cy.get("li").eq(0).contains("Done").should("be.visible")
        cy.get("li").eq(1).contains("To do").should("be.visible")
      })

    cy.contains("Mock step 3").click()

    cy.contains("h1", "Mock step 3").should("be.visible")

    cy.contains("Mock question 3?").type("Some answer 3")
    cy.contains("Save and continue").click()

    cy.contains("h2", /2. Mock theme 2$/)
      .parent()
      .within(() => {
        cy.get("li").eq(0).contains("Done").should("be.visible")
        cy.get("li").eq(1).contains("Done").should("be.visible")
      })

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

  it("can approve a workflow as a manager", () => {
    cy.visitAsApprover("/?quick_filter=all")

    cy.contains("h1", "Planner").should("be.visible")

    cy.get("main ul")
      .eq(1)
      .scrollIntoView()
      .within(() => cy.get("li a").first().click())

    cy.contains("h1", "Mock form").should("be.visible")

    cy.contains("button", "Make a decision").click()

    cy.contains("h2", "Approval").should("be.visible")

    cy.contains("make minor edits").click()

    cy.contains("h1", "Mock form").should("be.visible")
    cy.contains("h2", "Submitted").should("be.visible")

    cy.contains("Mock step").click()

    cy.contains("h1", "Mock step").should("be.visible")

    cy.get("input[name='mock-question']").clear()
    cy.contains("Mock question?").type("Some answer with a minor edit")
    cy.contains("Save and continue").click()

    cy.contains("h1", "Mock form").should("be.visible")

    cy.contains("Return to overview").click()

    cy.contains("h1", "Mock form").should("be.visible")

    cy.contains("button", "Make a decision").click()

    cy.contains("h2", "Approval").should("be.visible")

    cy.contains("Yes, approve and send to QAM").click()
    cy.get("select#panelApproverEmail").select(
      "Fake Panel Approver (fake.panel.approver@hackney.gov.uk)"
    )
    cy.contains("button", "Submit").click()

    cy.contains("Approved by Fake Approver").should("be.visible")
  })

  it("can authorise a workflow as part of panel", () => {
    cy.visitAsPanelApprover("/?quick_filter=all")

    cy.contains("h1", "Planner").should("be.visible")

    cy.get("main ul")
      .eq(2)
      .scrollIntoView()
      .within(() => cy.get("li a").first().click())

    cy.contains("h1", "Mock form for").should("be.visible")

    cy.contains("button", "Make a decision").click()

    cy.contains("h2", "Quality assurance meeting").should("be.visible")

    cy.contains("make minor edits").click()

    cy.contains("h1", "Mock form").should("be.visible")
    cy.contains("h2", "Approved").should("be.visible")

    cy.contains("Mock step").click()

    cy.contains("h1", "Mock step").should("be.visible")

    cy.get("input[name='mock-question']").clear()
    cy.contains("Mock question?").type("Some answer with another minor edit")
    cy.contains("Save and continue").click()

    cy.contains("h1", "Mock form").should("be.visible")

    cy.contains("Return to overview").click()

    cy.contains("h1", "Mock form").should("be.visible")

    cy.contains("button", "Make a decision").click()

    cy.contains("h2", "Quality assurance meeting").should("be.visible")

    cy.contains("Yes, it has been authorised").click()
    cy.contains("button", "Submit").click()

    cy.contains("Authorised by Fake Panel Approver").should("be.visible")
  })
})
