const got = require('@/utils/got');

const gotFetch = async (data, variables) =>
    await got({
        method: 'POST',
        url: `https://graphql.anilist.co`,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            query: data,
            variables: variables,
        }),
    });

const getUserID = async (username) => {
    const response = await gotFetch(
        `
  query ($name: String) {
    User (name: $name){
      id
    }
  }
`,
        { name: username }
    );
    return response.data.data.User.id;
};
const apiQueries = {
    // id 177542
    user: {
        all: `
      query ($id: Int) {
        Page(perPage: 50) {
          activities(userId: $id, sort: ID_DESC) {
            ... on TextActivity {
              id
              text
              createdAt
              user {
                name
              }
            }
            ... on MessageActivity {
              id
              type
              message
              createdAt
              user: recipient {
                name
              }
              messenger {
                name
              }
            }
            ... on ListActivity {
              id
              status
              progress
              createdAt
              user {
                name
              }
              media {
                id
                title {
                  userPreferred
                }
              }
            }
          }
        }
      } 
    `,
        status: `
        query ($id: Int) {
          Page(perPage: 50) {
            activities(userId: $id, type: TEXT, sort: ID_DESC) {
              ... on TextActivity {
                id
                text
                createdAt
                user {
                  name
                }
              }
            }
          }
        }      
    `,
        messages: `
      query ($id: Int) {
        Page(perPage: 50) {
          activities(userId: $id, type: MESSAGE, sort: ID_DESC) {
            ... on MessageActivity {
              id
              message
              createdAt
              user: recipient {
                name
              }
              messenger {
                name
              }
            }
          }
        }
      }
    `,
        lists: `
      query ($id: Int) {
        Page(perPage: 50) {
          activities(userId: $id, type: MEDIA_LIST, sort: ID_DESC) {
            ... on ListActivity {
              id
              status
              progress
              createdAt
              user {
                id
                name
              }
              media {
                id
                title {
                  userPreferred
                }
              }
            }
          }
        }
      }
    `,
    },
    forum: `

  `,
    review: `

  `,
};

module.exports = {
    apiQueries,
    getUserID,
    gotFetch,
};
