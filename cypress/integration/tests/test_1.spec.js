// test to create a new database

context('create database', () => {
   beforeEach(() => {
       cy.visit('http://localhost:6363/dashboard');
   })

   // generate random db info
   const dbId       = 'database_e2e_test';
   const dbTitle    = "Test db";
   const dbCommment = "Test db comment";

    it('create database', () => {
        cy.get('#terminus-control-panel')
            .find('a')
            .contains('Create New Database')
            .click().then(() => {
                cy.wait(1000)

                // enter id
                cy.get('#terminus-content-viewer')
                    .find('input[placeholder="No spaces or special characters allowed in IDs"]')
                    .focus().type(dbId);

                // enter db name
                cy.get('#terminus-content-viewer')
                    .find('input[placeholder="A brief title for the Database"]')
                    .focus().type(dbTitle);
                cy.wait(1000);

                // enter db comment
                cy.get('#terminus-content-viewer')
                    .find('textarea[placeholder="A short text describing the database and its purpose"]')
                    .focus().type(dbCommment);
                cy.wait(1000);

                // click on create
                cy.get('#terminus-content-viewer')
                    .find('button').contains('Create').click().then(() => {
                        alert('createDatabase success');
                    })

                cy.wait(2000);
       })
   }) // create database
})
