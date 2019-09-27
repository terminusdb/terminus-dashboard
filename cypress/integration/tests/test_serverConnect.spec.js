context('check connection', () => {
   beforeEach(() => {
       cy.visit('http://localhost/terminus-javascript-sdk/dist/')
   })

   it('connect with server', () => {
   	   cy.wait(2000)
	   cy.get('#terminus-control-panel').find('a').contains('Change Server').click().then(() => {
	   cy.wait(1000)
		  
	   cy.get('#terminus-content-viewer').find('input[placeholder="Terminus DB URL"]')
		  .focus().type("http://195.201.12.87:6363")

		cy.get('#terminus-content-viewer').find('input[placeholder="Server API Key"]')
		  .focus().type("root")
		  cy.wait(1000)

		cy.get('#terminus-content-viewer').find('button').click()
		 
	   })


	   cy.wait(2000)
	   cy.get('#terminus-control-panel').find('a').contains('Create New Database').click().then(() => {
	   		cy.wait(1000)

	   		const dbName='newDbTest'

	   		cy.get('#terminus-content-viewer').find('input')


	   })


	})

   /*it('create database', () => {
   	   cy.wait(2000)
	   /*cy.get('#terminus-control-panel').find('a').contains('Change Server').click().then(() => {
	   cy.wait(1000)
		  
	   cy.get('#terminus-content-viewer').find('input[placeholder="Terminus DB URL"]')
		  .focus().type("http://195.201.12.87:6363")

		cy.get('#terminus-content-viewer').find('input[placeholder="Server API Key"]')
		  .focus().type("root")
		  cy.wait(1000)

		cy.get('#terminus-content-viewer').find('button').click()
		 
	   })
	})*/


})