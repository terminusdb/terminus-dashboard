context('check connection', () => {
   beforeEach(() => {
       cy.visit('http://localhost/terminus-dashboard/dist/index.html')
       cy.wait(2000)

       cy.get('#terminus-content-viewer').find('h3').should('contain', 'Connect To Terminus Server').then(()=>{

		   cy.get('#terminus-content-viewer').find('input[placeholder="Terminus DB URL"]')
			.focus().type("http://localhost:6363")

		   cy.get('#terminus-content-viewer').find('input[placeholder="Server API Key"]')
			  .focus().type("root")
			  cy.wait(1000)

			cy.get('#terminus-content-viewer').find('button').click()
		})
   })

  /* it('connect with server', () => {
   	   cy.wait(2000)
	   //cy.get('#terminus-control-panel').find('a').contains('Change Server').click().then(() => {
	   //cy.wait(1000)
		  
	cy.get('#terminus-content-viewer').find('input[placeholder="Terminus DB URL"]')
	.focus().type("http://localhost:6363")

		cy.get('#terminus-content-viewer').find('input[placeholder="Server API Key"]')
		  .focus().type("root")
		  cy.wait(1000)

		cy.get('#terminus-content-viewer').find('button').click()
		 
	   //})

	})*/

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

    it('get and update database Schema', () => {
    	cy.get("table.terminus-db-list").contains('td',dbName).click().then(()=>{
    		cy.wait(1000);

    		cy.get('#terminus-control-panel').contains('a', 'Schema').click().then(()=>{
    		//cy.wait(1000);

	    		cy.get('#terminus-content-viewer').find('pre').should(($pre)=>{
	    			
	    			const cmAtomDoc=$pre.find(`span.cm-atom:contains(<http://localhost:6363/${dbName}/document/>)`);
	    			expect(cmAtomDoc).to.have.length(1);

	    			const cmAtomSchema=$pre.find(`span.cm-atom:contains(<http://localhost:6363/${dbName}/schema#>)`);
	    			expect(cmAtomSchema).to.have.length(1);
	    		})

	    		cy.get('#terminus-content-viewer').find('button.terminus-schema-import_schema').click().then(()=>{

	    			//cy.get('#terminus-content-viewer').find('input.terminus-url-connect').type()
	    			

	    		})





    		})
    	})
    })

    it('delete database', () => {
    	//tr:has(td nobr:contains('Question'))
    	cy.get("table.terminus-db-list").contains('tr',dbName)//.find(`tr:has(td nobr:contains(${dbName}))`)
    	.find('i.terminus-db-list-del-icon').click().then(()=>{
    		cy.wait(2000)

    		cy.get("#terminus-user-messages").should(($div)=>{
    			expect($div, 'text content').to.have.text(`Successfully Deleted Database ${dbName}`)
    		})
    	
    	})

    	cy.on("window:confirm", (str) => {
			 if (str===`Do you want to delete ${dbName} Database?`){
			 	//console.log('test window:confirm');
			 	return true
			 }
		})
    })
})