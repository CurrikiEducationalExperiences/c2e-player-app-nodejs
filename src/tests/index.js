'use strict';

exports.setupIntegrationTest = () => {
  const sequelize = require('./sequelize');
  afterAll(() => sequelize.close());
};

// exports.mockAwsSes = () => {
//   jest.mock('aws-sdk', () => ({
//     config: { update: () => {} },
//     SES: jest.fn(() => ({
//       sendEmail: jest.fn(() => ({
//         promise: jest.fn().mockResolvedValue(true),
//       })),
//     })),
//   }));
// };

exports.mockSequelize = () => {
  jest.mock('./sequelize', () => ({
    define: jest.fn(),
    transaction: jest.fn(() => ({
      commit: jest.fn(),
      rollback: jest.fn(),
    })),
  }));
};
