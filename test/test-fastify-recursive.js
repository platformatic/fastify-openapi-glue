import { strict as assert } from 'node:assert/strict'
import { test } from 'node:test'
import Fastify from 'fastify'

const opts = {
  schema: {
    body: {
      $id: 'https://example.com/tree',
      type: 'object',
      additionalProperties: false,
      properties: {
        str1: {
          type: 'string',
        },
        obj1: {
          $ref: '#',
        },
      },
      required: ['str1'],
    },
  },
}

test('fastify validation works', async (t) => {
  const fastify = Fastify()

  async function routes (fastify) {
    fastify.post('/', opts, async (request) => {
      assert.deepEqual(
        request.body,
        { str1: 'test data', obj1: { str1: 'test data' } },
        'expected value'
      )
    })
  }
  fastify.register(routes)
  {
    const res = await fastify.inject({
      method: 'POST',
      url: '/',
      payload: {
        str1: 'test data',
        obj1: {
          str1: 'test data',
        },
      },
    })
    assert.equal(res.statusCode, 200, 'expected HTTP code')
  }
  {
    const res = await fastify.inject({
      method: 'GET',
      url: '/blah',
    })
    assert.equal(res.statusCode, 404, 'expected HTTP code')
  }
})
