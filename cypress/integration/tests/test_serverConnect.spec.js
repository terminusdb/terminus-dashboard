context('Waiting', () => {
   beforeEach(() => {
       cy.visit('http://localhost/terminus-javascript-sdk/dist/')
   })

   it('connect with server', () => {
   	   //cy.wait(2000)
	  /* cy.get('#terminus-client-btn >a').contains('Change Server').click().then(() => {
		  cy.wait(1000)
		  
		  cy.get('#terminus-content-viewer > input[placeholder="Terminus DB URL"]')
		  .focus().type("http://195.201.12.87:6363")

		  cy.get('#terminus-content-viewer > input[placeholder="Server API Key"]')
		  .focus().type("root")
	   })*/
	})
})