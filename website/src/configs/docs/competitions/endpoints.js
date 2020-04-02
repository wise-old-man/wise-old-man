export default [
  {
    title: 'Create competition',
    url: '/competitions',
    method: 'DELETE',
    comments: [
      {
        type: 'info',
        content:
          'Praesent consequat justo ac lorem mattis fringilla. Mauris sodales augue nec odio egestas commodo. Mollis velit sed consectetur faucibus. Nulla ut nulla lobortis, elementum quam at, molestie velit.',
      },
      {
        type: 'error',
        content:
          'Hey yo Praesent consequat justo ac lorem mattis fringilla. Mauris sodales augue nec odio egestas commodo. Mollis velit sed consectetur faucibus. Nulla ut nulla lobortis, elementum quam at, molestie velit.',
      },
    ],
    params: [
      {
        field: 'name',
        type: 'string',
        description: 'The name of this competition (5-50 characters)',
      },
    ],
    body: {
      id: 123,
      username: 'Ritzi',
    },
    successResponses: [
      {
        description: 'If the user is new',
        body: {
          id: 5,
          name: 'Hexis Test Bruh',
          createdAt: '2020-03-27T23:15:01.000Z',
          updatedAt: '2020-03-27T23:32:57.000Z',
          members: [
            {
              id: 173,
              username: 'Psikoi',
              type: 'regular',
              lastImportedAt: '2020-03-27T21:56:50.000Z',
              registeredAt: '2020-03-13T23:29:57.000Z',
              updatedAt: '2020-03-27T21:56:50.000Z',
              role: 'leader',
            },
            {
              id: 229,
              username: 'Ritzi',
              type: 'regular',
              lastImportedAt: '2020-03-27T21:51:37.000Z',
              registeredAt: '2020-03-26T19:59:52.000Z',
              updatedAt: '2020-03-27T21:51:37.000Z',
              role: 'member',
            },
          ],
        },
      },
    ],
    errorResponses: [
      {
        description: 'If is wrong id',
        body: {
          message: 'Hey no pls',
        },
      },
    ],
  },
  {
    title: 'Delete competition',
    url: '/competitions',
    method: 'DELETE',
    comments: [
      {
        type: 'info',
        content:
          'Hey bro Praesent consequat justo ac lorem mattis fringilla. Mauris sodales augue nec odio egestas commodo. Mollis velit sed consectetur faucibus. Nulla ut nulla lobortis, elementum quam at, molestie velit.',
      },
      {
        type: 'error',
        content:
          '123 Praesent consequat justo ac lorem mattis fringilla. Mauris sodales augue nec odio egestas commodo. Mollis velit sed consectetur faucibus. Nulla ut nulla lobortis, elementum quam at, molestie velit.',
      },
    ],
    query: [
      {
        field: 'name',
        type: 'string',
        description: 'The name of this competition (5-50 characters)',
      },
    ],
    body: {
      id: 123,
      username: 'Ritzi',
    },
    response: {
      id: 5,
      name: 'Hexis Test Bruh',
      createdAt: '2020-03-27T23:15:01.000Z',
      updatedAt: '2020-03-27T23:32:57.000Z',
      members: [
        {
          id: 173,
          username: 'Psikoi',
          type: 'regular',
          lastImportedAt: '2020-03-27T21:56:50.000Z',
          registeredAt: '2020-03-13T23:29:57.000Z',
          updatedAt: '2020-03-27T21:56:50.000Z',
          role: 'leader',
        },
        {
          id: 229,
          username: 'Ritzi',
          type: 'regular',
          lastImportedAt: '2020-03-27T21:51:37.000Z',
          registeredAt: '2020-03-26T19:59:52.000Z',
          updatedAt: '2020-03-27T21:51:37.000Z',
          role: 'member',
        },
      ],
    },
  },
];
