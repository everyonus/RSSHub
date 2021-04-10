const { apiQueries, getUserID, gotFetch } = require('./utils');

module.exports = async (ctx) => {
    const userID = isNaN(ctx.params.user) ? await getUserID(ctx.params.user) : ctx.params.user;
    // console.log(await utils.getUserID(ctx.params.user))

    const response = await gotFetch(apiQueries.user[ctx.params.status], { id: userID });

    ctx.state.data = {
        title: `Anilist User ${ctx.params.status}`, // The feed title
        link: `https://anilist.co/user/${userID}`, // The feed link
        description: `Recent ${ctx.params.status} to user`, // The feed description
        language: `en`, // The language of the channel
        allowEmpty: false, // default to false, set to true to allow empty item
        item: response.data.data.Page.activities.map((item) => {
            let title;
            switch (ctx.params.status) {
                // case 'all':
                //   title = ``; {
                //   break;
                // }
                case 'status': {
                    title = `${item.user.name} Sent`;
                    break;
                }
                case 'messages': {
                    title = `From ${JSON.stringify(item.messenger)} to ${item.user.name}`;
                    break;
                }
                case 'lists': {
                    const progress = item.progress !== null ? `${item.progress} of ` : ``;
                    title = `${item.user.name} ${item.status} ${progress}${item.media.title.userPreferred}`;
                    break;
                }
            }
            return {
                // An article of the feed
                title: title, //  The article title
                author: item.messenger || item.user.name, // Author of the article
                // category: author, // Article category
                description: item.message || item.text, // The article summary or content
                pubDate: new Date(item.createdAt * 1000).toUTCString(), // The article publishing datetime
                guid: item.id + item.createdAt, // The article unique identifier, optional, default to the article link below
                link: `https://anilist.co/activity/${item.id}`, // The article link
            };
        }),
    };
};
