// update schema
// on click of import button we make sure getSchema works as well
context('update schema', () => {
   beforeEach(() => {
       //connect to server and db
       cy.visit('http://localhost:6363/dashboard');
       cy.get('#terminus-content-viewer')
           .find('table tbody tr td p')
           .contains('database_e2e_test')
           .click();
   })
   it('update schema', () => {

       cy.get('.terminus-db-controller')
           .find('a')
           .contains('Schema')
           .click().then(() => {

               cy.wait(1000);
               cy.get('#terminus-content-viewer')
                   .find('button')
                   .contains('Edit')
                   .click().then(() => {
                       cy.wait(1000);

                       // use force: true below because the textarea is hidden
                       // and by default Cypress won't interact with hidden elements
                       cy.get('.CodeMirror textarea')
                             .type('test test test test ... \n updating something here ....\n',
                                   {force: true})

                       cy.wait(1000);
                       // click on save
                       cy.get('#terminus-content-viewer')
                           .find('button').contains('Save').click().then(() => {
                               alert('updateSchema success');
                               cy.wait(3000);})
              })
          })
     }) // import schema
})
