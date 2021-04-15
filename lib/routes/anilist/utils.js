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

const anilistMDToHTML = (content) => {
    // replace bold
    content = content.replace(/__(.*?)__/g, '<b>$1</b>');
    // replace italics
    content = content.replace(/_(.*?)_/g, '<i>$1</i>');
    // replce horizontal line
    content = content.replace(/\n(\n---|- - -|\*\*\*|\* \* \*)/g, '\n<hr>');
    // replace strong
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // replace emphasis
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // replace center
    content = content.replace(/~~~(.*?)~~~/g, '<center>$1</center>');
    // replace strikethrough
    content = content.replace(/~~(.*?)~~/g, '<strike>$1</strike>');
    // replace quote
    // content = content.replace(/>(.*)/g, '<blockquote>$1</blockquote>')
    // replace fallback text image with link
    content = content.replace(/\[!\[(.*?)\]\((.*?)\)\]\((.*?\.)\)/g, '<a href="$3"><img alt="$1" src="$2" /></a>');
    // replace fallback text image
    content = content.replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" />');
    // replace image with width with link
    content = content.replace(/\[ img(\d{1,4}%?)(.*?)\) \]\((.*?)\)/g, '<a href="$3"><img src="$2" width="$1"/></a>');
    // replace image with link
    content = content.replace(/\[ img\((.*?)\) \]\((.*?)\)/g, '<a href="$2"><img src="$1"/></a>');
    // replace image with width
    content = content.replace(/img(\d{1,4}%?)\((.*?)\)/g, '<img src="$2" width="$1"/>');
    // replace image
    content = content.replace(/img\((.*?)\)/g, '<img src="$1"/>'); // bug with multiple links on same line.
    // replace links
    content = content.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    // replace smallest text
    content = content.replace(/#####(.*?)/g, '<h5>$1</h5>');
    // replace even smaller text
    content = content.replace(/####(.*?)/g, '<h4>$1</h4>');
    // replace smaller text
    content = content.replace(/###(.*?)/g, '<h3>$1</h3>');
    // replace normal text
    content = content.replace(/##(.*?)/g, '<h2>$1</h2>');
    // replace biggest text
    content = content.replace(/#(.*?)/g, '<h1>$1</h1>');
    // replace ~! content !~ spoilers
    content = content.replace(/~!([\s\S]{1,}?)!~/g, '<div rel="spoiler">$1</div>');
    // replace lists
    // content = content.replace(/( .)?(-|\*|\+)(.*)/g, '$1$3');
    // replace code
    // content = content.replace(/`(.*)`/g, '<code>$1</code>');

    // replace img(link)
    return content;
};

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
