// to check server connect

context('check connection', () => {
   beforeEach(() => {
       cy.visit('http://localhost:6363/dashboard');
   })

   it('Connect to a Server', () => {
   	   cy.wait(2000);
	   cy.get('#terminus-control-panel')
         .find('a')
         .contains('Change Server')
         .click().then(() => {
	            cy.wait(1000);

                // enter server url
                cy.get('#terminus-content-viewer')
                    .find('input[placeholder="Terminus DB URL"]')
                    .focus().type("http://195.201.12.87:6363");

                // enter key
		        cy.get('#terminus-content-viewer')
                    .find('input[placeholder="Server API Key"]')
		            .focus().type("root");
                cy.wait(1000);

                // click on connect button
		        cy.get('#terminus-content-viewer')
                    .find('button').click().then(() => {
                    alert('connect success');
                })
	   })
   }) // connect to a server
})
