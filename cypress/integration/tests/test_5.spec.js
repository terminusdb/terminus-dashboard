// update document
// on clicking on a doc getDocument is also tested
context('update document Jackie Chan', () => {

   beforeEach(() => {
       //connect to server and db
       cy.visit('http://localhost:6363/dashboard');
       cy.get('#terminus-content-viewer')
           .find('table tbody tr td p')
           .contains('database_e2e_test')
           .click().then(() => {
               cy.wait(1000);
               cy.get('#terminus-content-viewer')
                   .find('a')
                   .contains('doc:JackieChan')
                   .click();
                   cy.wait(1000);
           })
   })

   it('update documents', () => {
       cy.wait(1000);
       cy.get('#terminus-content-viewer')
           .find('div[class="terminus-document-controller"]')
           .find('select')
           .select('Edit Document').then(() => {
               cy.wait(1000);

               // update comment
               cy.get('#terminus-content-viewer')
                   .find('div[data-property="rdfs:comment"]')
                   .find('textarea')
                   .focus().clear().type('Updating Jackie Chans info');
               cy.wait(1000);

               // make Jackie Chan friends with Bruce Lee
               cy.get('#terminus-content-viewer')
                   .find('span[class="terminus-object-add-property"]:first') // the first obj header
                   .find('select')
                   .select('Friend').then(() => {
                       cy.wait(1000);

                       // input friend
                       cy.get('#terminus-content-viewer')
                           .find('div[data-property="tcs:friend"]')
                           .find('input[type="text"]')
                           .focus().type('doc:BruceLee');
                       cy.wait(1000);

                   }) // add property

                   // add fb a/c
                   cy.get('#terminus-content-viewer')
                       .find('div[data-property="tcs:facebook_page"]')
                       .find('button')
                       .contains('Add')
                       .click().then(() => {
                            cy.wait(1000);

                            cy.get('#terminus-content-viewer')
                            .find('div[data-property="tcs:facebook_page"]')
                            .find('input[type="text"]:eq(1)')
                            .focus().type('https://facebook.secondProfileForJackie');
                       })
           });

           // hit save
           cy.get('#terminus-content-viewer')
                .find('button')
                .contains('Save')
                .click().then(() => {
                    alert('updatedDocument for Person Jackie Chan success');
           })
     }) // update document
})
