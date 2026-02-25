import { FastifyWithZod, makeFastify } from '../lib';
import { mockRoutes } from './mockRoute';
import { apiSpec } from './testData';

describe('e2e', () => {
  let mockServer: FastifyWithZod;

  beforeEach(async () => {
    mockServer = await makeFastify();
    await mockServer.register(async () => mockRoutes(mockServer));
  });

  afterEach(async () => {
    await mockServer.close();
  });

  /**
   * @target fastifyServer[POST /mock] should respond with string representation of the bigint fields in the request body
   * @dependencies
   * @scenario
   * - define a mock post route with bigint fields in its request body schema
   * - send the request
   * @expected
   * - response status should have been 200
   * - response should have matched the string representation of the same bigint fields as input
   */
  it('should respond with string representation of the bigint fields in the request body', async () => {
    // act
    const result = await mockServer.inject({
      method: 'POST',
      url: '/mock',
      body: {
        num1: 10_000,
        num2: '999',
        num3: '10100',
      },
    });

    // assert
    expect(result.statusCode).toEqual(200);
    expect(result.json()).toEqual({
      array: [
        {
          num1: '10000',
          num2: '999',
          num3: '10100',
        },
      ],
      sum: '21099',
      type: 'bigint',
    });
  });

  /**
   * @target fastifyServer[POST /mock] should add routes to the swagger doc with support for bigint type
   * @dependencies
   * @scenario
   * - define a mock post route with bigint fields in its request body schema
   * - send a request to get openapi doc
   * @expected
   * - response status should have been 200
   * - response should have matched the correct openapi doc with int64 as type of bigint fields
   */
  it('should add routes to the swagger doc with support for bigint type', async () => {
    // act
    const result = await mockServer.inject({
      method: 'GET',
      url: '/swagger/json',
    });

    // assert
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(JSON.stringify(apiSpec));
  });
});
