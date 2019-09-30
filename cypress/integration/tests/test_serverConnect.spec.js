//text area create db
//click on the row you select database
//delete db button, alert are you sure to delete the db





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

	})

	const dbName='newDbTest'+Math.floor(Math.random() * 1000);

     it('create database', () => {
   	  cy.get('#terminus-control-panel').find('a').contains('Create New Database').click().then(() => {
	   		cy.wait(1000)

	   	  const dbTitle="test db"
	   	  const dbCommment="test db comment"
 			
	   	  cy.get('#terminus-content-viewer').find('input[placeholder="No spaces or special characters allowed in IDs"]')
		  .focus().type(dbName)

		  cy.get('#terminus-content-viewer').find('input[placeholder="A brief title for the Database"]')
		  .focus().type(dbTitle)

		  cy.get('#terminus-content-viewer').find('textarea[placeholder="A short text describing the database and its purpose"]')
		  .focus().type(dbCommment)

		  cy.get('#terminus-content-viewer').find('button').contains('Create').click().then(()=>{

		  		
		  })


	   })
	})

})