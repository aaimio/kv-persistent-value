import { ThrowableRouter } from 'itty-router-extras';
import {
  createWorkerRequestHandler,
  handle404Request,
  handleAccessTokenRequest,
  handleGetValueRequest,
  handleSetMultipleValuesRequest,
  handleSetValueRequest,
} from './handlers';
import {
  setParsedUrl,
  validateAccessTokenRequest,
  validateGetValueRequest,
  validateSetMultipleValuesRequest,
  validateSetValueRequest,
} from './middleware';

const router = ThrowableRouter();

/**
 * @openapi
 * /values/new_access_token:
 *    get:
 *      description: Generates a new access token
 *      parameters:
 *        - name: x-github-repo
 *          in: header
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Successfully returns an access token
 *        400:
 *          description: Missing x-github-repo header
 */
router.get('/values/new_access_token', validateAccessTokenRequest, handleAccessTokenRequest);

/**
 * @openapi
 * /values/get:
 *    get:
 *      description: Gets a persistent value
 *      parameters:
 *        - name: x-access-token
 *          in: header
 *          required: true
 *          schema:
 *            type: string
 *        - name: key
 *          in: query
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Successfully returns a persistent value
 *        400:
 *          description: Missing key parameter
 *        401:
 *          description: Missing or incorrect x-access-token header
 */
router.get('/values/get', setParsedUrl, validateGetValueRequest, handleGetValueRequest);

/**
 * @openapi
 * /values/set:
 *    post:
 *      description: Sets a persistent value
 *      parameters:
 *        - name: x-access-token
 *          in: header
 *          required: true
 *          schema:
 *            type: string
 *        - name: key
 *          in: query
 *          required: true
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                value:
 *                  type: string
 *      responses:
 *        200:
 *          description: Successfully set a persistent value
 *        400:
 *          description: Missing or incorrect key or value
 *        401:
 *          description: Missing or incorrect x-access-token header
 */
router.post('/values/set', validateSetValueRequest, handleSetValueRequest);

/**
 * @openapi
 * /values/set_multiple:
 *    post:
 *      description: Sets a persistent value
 *      parameters:
 *        - name: x-access-token
 *          in: header
 *          required: true
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              additionalProperties:
 *                type: object
 *      responses:
 *        200:
 *          description: Successfully set multiple persistent values
 *        400:
 *          description: Missing or incorrect value(s)
 *        401:
 *          description: Missing or incorrect x-access-token header
 *        413:
 *          description: Too many values were specified
 */
router.post(
  '/values/set_multiple',
  validateSetMultipleValuesRequest,
  handleSetMultipleValuesRequest
);

router.all('*', handle404Request);

addEventListener('fetch', createWorkerRequestHandler(router));
