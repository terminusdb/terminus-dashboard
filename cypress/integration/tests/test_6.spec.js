// delete database
context('delete database', () => {

   beforeEach(() => {
       //connect to server and db
       cy.visit('http://localhost:6363/dashboard');
       cy.get('#terminus-content-viewer')
           .find('table tbody tr td p')
           .contains('database_e2e_test')
           .click().then(() => {
               cy.wait(1000);
           })
   })

   it('delete database', () => {
       cy.wait(1000);
       cy.get('#terminus-content-viewer')
           .find('button')
           .contains('Delete Database')
           .click().then(() => {
               cy.wait(3000);
               alert('deleteDatabase successfully');
           })
     }) // delete database
})
