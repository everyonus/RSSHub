const got = require('@/utils/got');

const gotFetch = async (data, variables = {}) =>
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
    const response = await gotFetch(`query ($name: String) {User (name: $name){id}}`, { name: username });
    return response.data.data.User.id;
};

const anilistMDToHTML = (content) =>
    content
        .replace(/\n/g, '<br>') // replace newline
        .replace(/__(.*?)__/g, '<b>$1</b>') // replace bold
        .replace(/_(.*?)_/g, '<i>$1</i>') // replace italics
        .replace(/\n(\n---|- - -|\*\*\*|\* \* \*)/g, '\n<hr>') // replce horizontal line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // replace strong
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // replace emphasis
        .replace(/~~~(.*?)~~~/g, '<center>$1</center>') // replace center
        .replace(/~~(.*?)~~/g, '<strike>$1</strike>') // replace strikethrough
        // .replace(/>(.*)/g, '<blockquote>$1</blockquote>')  // replace quote
        .replace(/\[!\[(.*?)\]\((.*?)\)\]\((.*?\.)\)/g, '<a href="$3"><img alt="$1" src="$2" /></a>') // replace fallback text image with link
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" />') // replace fallback text image
        .replace(/\[ img(\d{1,4}%?)(.*?)\) \]\((.*?)\)/g, '<a href="$3"><img src="$2" width="$1"/></a>') // replace image with width with link
        .replace(/\[ img\((.*?)\) \]\((.*?)\)/g, '<a href="$2"><img src="$1"/></a>') // replace image with link
        .replace(/img(\d{1,4}%?)\((.*?)\)/g, '<img src="$2" width="$1"/>') // replace image with width
        .replace(/img\((.*?)\)/g, '<img src="$1"/>') // replace image
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>') // replace links
        .replace(/#####(.*?)/g, '<h5>$1</h5>') // replace smallest text
        .replace(/####(.*?)/g, '<h4>$1</h4>') // replace even smaller text
        .replace(/###(.*?)/g, '<h3>$1</h3>') // replace smaller text
        .replace(/##(.*?)/g, '<h2>$1</h2>') // replace normal text
        .replace(/#(.*?)/g, '<h1>$1</h1>') // replace biggest text
        .replace(/~!([\s\S]{1,}?)!~/g, '<div rel="spoiler">$1</div>'); // replace spoilers
// .replace(/( .)?(-|\*|\+)(.*)/g, '$1$3')  // replace lists
// .replace(/`(.*)`/g, '<code>$1</code>')  // replace code;

const apiQueries = {
    user: {
        all: `
        query ($id: Int) {
          Page(perPage: 50) {
            activities(userId: $id, sort: ID_DESC) {
              ... on TextActivity {
                id
                text (asHtml: false)
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
                text (asHtml: false)
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
    forum: {
        recent: `
      query ($id: Int) {
        Page(perPage: 50) {
          
          threads (sort: ID_DESC, categoryId: $id) {
            id
            user {
              name
            }
            categories {
              name
            }
            title
            body
            createdAt
          }
        }
      }
      `,
    },
    review: `
    {
      Page(perPage: 50) {
        reviews(sort: ID_DESC) {
          id
          createdAt
          media {
            title {
              userPreferred
            }
          }
          user {
            name
          }
          body
        }
      }
    }
  `,
};

module.exports = {
    apiQueries,
    getUserID,
    gotFetch,
    anilistMDToHTML,
};
