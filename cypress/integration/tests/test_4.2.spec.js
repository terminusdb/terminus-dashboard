// create documents
context('create document Bruce Lee', () => {
   beforeEach(() => {
       //connect to server and db
       cy.visit('http://localhost:6363/dashboard');
       cy.get('#terminus-content-viewer')
           .find('table tbody tr td p')
           .contains('database_e2e_test')
           .click();
   })
   it('create documents', () => {

       cy.get('.terminus-db-controller')
           .find('a')
           .contains('Document')
           .click().then(() => {

               cy.wait(2000);

               cy.get('.terminus-create-doc')
                  .get('span[class="terminus-class-chooser"]')
                  .find('select')
                  .select('Person').then(() => {

                       cy.wait(1000);

                       // input id
                       cy.get('#terminus-content-viewer')
                           .find('input[class="terminus-object-id-input" ]')
                           .focus().type('doc:BruceLee');

                       // input member of
                       cy.get('#terminus-content-viewer')
                           .find('div[data-property="tcs:member_of"]')
                           .find('input[type="text"]')
                           .focus().type('doc:KarateGroup');
                       cy.wait(1000);

                       // input Label
                       cy.get('#terminus-content-viewer')
                           .find('div[data-property="rdfs:label"]')
                           .find('input[type="text"]')
                           .focus().type('Bruce Lee');
                       cy.wait(1000);

                       // input comment
                       cy.get('#terminus-content-viewer')
                           .find('div[data-property="rdfs:comment"]')
                           .find('textarea')
                           .focus().type('Creating a person Bruce Lee');
                       cy.wait(1000);

                       // input fb
                       cy.get('#terminus-content-viewer')
                           .find('div[data-property="tcs:facebook_page"]')
                           .find('input[type="text"]')
                           .focus().type('https://facebook/BruceLee.555');
                       cy.wait(1000);

                       // input email
                       cy.get('#terminus-content-viewer')
                           .find('div[data-property="tcs:email_address"]')
                           .find('input[type="text"]')
                           .focus().type('bruceLeeKicker@whatever.com');
                       cy.wait(3000);

                       // hit save
                       cy.get('#terminus-content-viewer')
                            .find('button')
                            .contains('Save')
                            .click().then(() => {
                                alert('createDocument Person Bruce Lee success');
                            })
               })
          })
     }) // create document
})
