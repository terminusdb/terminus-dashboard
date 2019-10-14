// import schema from 'http://195.201.12.87:6363/docs'
context('import schema', () => {
   beforeEach(() => {
       //connect to server and db
       cy.visit('http://localhost:6363/dashboard');
       cy.get('#terminus-content-viewer')
           .find('table tbody tr td p')
           .contains('database_e2e_test')
           .click();
   })
   it('import schema', () => {
       // populate import schema details
       const schurl = 'http://195.201.12.87:6363/myFirstTerminusDB';
       const key    = 'connectors wanna plans compressed';

       cy.get('.terminus-db-controller')
           .find('a')
           .contains('Schema')
           .click().then(() => {

               cy.wait(1000);
               cy.get('#terminus-content-viewer')
                   .find('button')
                   .contains('Import New Schema')
                   .click().then(() => {
                       cy.wait(1000);
                       // enter url
                       cy.get('#terminus-content-viewer')
                           .find('input[placeholder="Enter URL of DB to import from"]')
                           .focus().type(schurl);

                       cy.wait(1000);
                       // enter api key
                       cy.get('#terminus-content-viewer')
                           .find('input[class="terminus-form-value terminus-input-text terminus-url-key"]')
                           .focus().type(key);

                       // click on create
                       cy.get('#terminus-content-viewer')
                           .find('button').contains('Import').click().then(() => {
                               alert('import schema success');
                               cy.wait(3000);
                           })
              });
          })
     }) // import schema
})
