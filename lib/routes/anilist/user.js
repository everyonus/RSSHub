const { apiQueries, getUserID, gotFetch, anilistMDToHTML } = require('./utils');

module.exports = async (ctx) => {
    const userID = isNaN(ctx.params.user) ? await getUserID(ctx.params.user) : ctx.params.user;

    const {
        data: {
            data: {
                Page: { activities: response },
            },
        },
    } = await gotFetch(apiQueries.user[ctx.params.status], { id: userID });

    ctx.state.data = {
        title: `Anilist User ${ctx.params.status}`,
        link: `https://anilist.co/user/${userID}`,
        description: `Recent ${ctx.params.status} to user`,
        language: `en`,
        allowEmpty: false,
        item: response.map((item) => {
            let title;
            let content;
            let author;
            switch (ctx.params.status) {
                // case 'all':
                //   title = ``; {
                //   break;
                // }
                case 'status': {
                    author = item.user.name;
                    title = `${item.user.name} Sent`;
                    content = item.text;
                    break;
                }
                case 'messages': {
                    author = item.messenger;
                    title = `From ${JSON.stringify(item.messenger)} to ${item.user.name}`;
                    content = item.message;
                    break;
                }
                case 'lists': {
                    const progress = item.progress !== null ? `${item.progress} of ` : ``;
                    title = `${item.user.name} ${item.status} ${progress}${item.media.title.userPreferred}`;
                    break;
                }
            }
            // console.log(anilistMDToHTML())
            return {
                title: title,
                author: author,
                description: anilistMDToHTML(content),
                pubDate: new Date(item.createdAt * 1000).toUTCString(),
                guid: item.id + item.createdAt,
                link: `https://anilist.co/activity/${item.id}`,
            };
        }),
    };
};
