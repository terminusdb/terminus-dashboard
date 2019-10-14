// create documents
context('create document KareteGroup', () => {
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
                  .select('Group').then(() => {

                       cy.wait(1000);
                       // input id
                       cy.get('#terminus-content-viewer')
                           .find('input[class="terminus-object-id-input" ]')
                           .focus().type('doc:KarateGroup');

                       // input label
                       cy.get('#terminus-content-viewer')
                           .find('div[data-property="rdfs:label"]')
                           .find('input[type="text"]')
                           .focus().type('KarateGroup');
                       cy.wait(1000);

                       // input comment
                       cy.get('#terminus-content-viewer')
                           .find('div[data-property="rdfs:comment"]')
                           .find('textarea')
                           .focus().type('Creating a group for Karate');
                       cy.wait(1000);

                       // input website
                       cy.get('#terminus-content-viewer')
                           .find('div[data-property="tcs:website"]')
                           .find('input[type="text"]')
                           .focus().type('www.awesomnessKarate.com');
                       cy.wait(1000);

                       // input fb
                       cy.get('#terminus-content-viewer')
                           .find('div[data-property="tcs:facebook_page"]')
                           .find('input[type="text"]')
                           .focus().type('https://facebook/KarateKickAsses');
                       cy.wait(1000);

                       // input email
                       cy.get('#terminus-content-viewer')
                           .find('div[data-property="tcs:email_address"]')
                           .find('input[type="text"]')
                           .focus().type('karateKickers.info@whatever.com');
                       cy.wait(3000);

                       // hit save
                       cy.get('#terminus-content-viewer')
                            .find('button')
                            .contains('Save')
                            .click().then(() => {
                                alert('createDocument Group Karate success');
                            })
               })
          })
     }) // create document
})
