import { FastifyWithZod, makeFastify } from '../lib';
import { mockRoutes, TestFilterResponse } from './mockRoute';
import { apiSpec } from './testData';

describe('e2e', () => {
  let mockServer: FastifyWithZod;

  beforeEach(async () => {
    mockServer = await makeFastify(undefined, {
      bodyLimit: 10 * 1024 * 1024, // value in MB
    });
    await mockServer.register(mockRoutes);
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

  /**
   * @target fastifyServer[GET /test-filter] should respond with the correctly parsed querystring
   * @dependencies
   * @scenario
   * - define a mock get route that responds with its request query
   * - send a request to the server
   * - check the result
   * @expected
   * - response status should have been 200
   * - response body should have matched the correctly parsed Filters object
   */
  it('should respond with the correctly parsed querystring', async () => {
    // act
    const result = await mockServer.inject({
      method: 'GET',
      url: `/test-filter?tokenId*=ba&chain=a&chain!=b&sorts=chain-DESC,tokenName&offset=10`,
    });

    // assert
    expect(result.statusCode).toEqual(200);
    expect(result.json()).toEqual(TestFilterResponse);
  });

  /**
   * @target fastifyServer[GET /test-error] should respond with internal server error when response does not match the schema
   * @dependencies
   * @scenario
   * - define a mock get route that responds with an object not matching its response schema
   * - send a request to the server
   * - check the result
   * @expected
   * - response status should have been 500
   * - response body should have been an error with 'Internal server error' message
   */
  it('should respond with internal server error when response does not match the schema', async () => {
    // act
    const result = await mockServer.inject({
      method: 'GET',
      url: '/test-error',
      query: {
        p1: 'test',
      },
    });

    // assert
    expect(result.statusCode).toEqual(500);
    expect(result.json()).toEqual({ message: 'Internal server error' });
  });

  /**
   * @target fastifyServer[GET /test-error] should respond with "Response does not match the schema" error when response does not match the schema and
   * the mapResponseSerializationErrors is set to false
   * @dependencies
   * @scenario
   * - define a mock server instance with mapResponseSerializationErrors option set to false
   * - define a mock get route that responds with an object not matching its response schema
   * - send a request to the server
   * - check the result
   * @expected
   * - response status should have been 500
   * - response body should have been an error with "Response does not match the schema" message
   */
  it('should respond with "Response does not match schema" error when response does not match the schema and the mapResponseSerializationErrors is set to false', async () => {
    // arrange
    mockServer = await makeFastify(undefined, {
      bodyLimit: 10 * 1024 * 1024, // value in MB
      mapResponseSerializationErrors: false,
    });
    await mockServer.register(mockRoutes);

    // act
    const result = await mockServer.inject({
      method: 'GET',
      url: '/test-error',
      query: {
        p1: 'test',
      },
    });

    // assert
    expect(result.statusCode).toEqual(500);
    expect(result.json()).toEqual({
      statusCode: 500,
      code: 'FST_ERR_RESPONSE_SERIALIZATION',
      error: 'Internal Server Error',
      message: 'Response does not match the schema',
    });
  });

  /**
   * @target fastifyServer[GET /test-error] should respond with bad request when request does not match the schema
   * @dependencies
   * @scenario
   * - define a mock get route that responds with an object not matching its response schema
   * - send a request to the server
   * - check the result
   * @expected
   * - response status should have been 400
   * - response body should have been a 'Bad Request' error
   */
  it('should respond with bad request when request does not match the schema', async () => {
    // act
    const result = await mockServer.inject({
      method: 'GET',
      url: '/test-error',
      query: {},
    });

    // assert
    expect(result.statusCode).toEqual(400);
    expect(result.json()).toEqual({
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: 'querystring/p1 Required',
    });
  });
});
