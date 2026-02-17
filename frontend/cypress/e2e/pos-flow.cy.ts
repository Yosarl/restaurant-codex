describe('POS flow', () => {
  it('creates and settles a ticket from UI', () => {
    cy.visit('/pos');
    cy.contains('POS');
    cy.get('input[placeholder="Search name/SKU/barcode"]').type('burger');
    cy.contains('Settle').click();
  });
});
