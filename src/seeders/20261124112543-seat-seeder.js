'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const airplaneIds = [1, 2, 3]; // make sure these airplanes already exist

    // Layout: which rows belong to which seat type, and which columns exist
    const layout = [
      { type: 'first-class',      rows: [1, 2],          cols: ['A', 'B', 'E', 'F'] },
      { type: 'business',         rows: [3, 4, 5, 6],    cols: ['A', 'B', 'E', 'F'] },
      { type: 'premium-economy',  rows: [7, 8, 9, 10],   cols: ['A', 'B', 'C', 'D', 'E', 'F'] },
      { type: 'economy',         rows: Array.from({ length: 20 }, (_, i) => i + 11), cols: ['A', 'B', 'C', 'D', 'E', 'F'] },
    ];

    const seats = [];
    const now = new Date();

    for (const airplaneId of airplaneIds) {
      for (const section of layout) {
        for (const row of section.rows) {
          for (const col of section.cols) {
            seats.push({
              airplaneId,
              row,
              col,
              type: section.type,
              createdAt: now,
              updatedAt: now,
            });
          }
        }
      }
    }

    await queryInterface.bulkInsert('Seats', seats, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Seats', null, {});
  },
};