const { apiQueries, gotFetch } = require('./utils');

module.exports = async (ctx) => {
    const {
        data: {
            data: {
                Page: { reviews: response },
            },
        },
    } = await gotFetch(apiQueries.review);

    ctx.state.data = {
        title: `Anilist Recent Reviews`, // The feed title
        link: `https://anilist.co/reviews`, // The feed link
        description: `Recent reviews`, // The feed description
        language: `en`, // The language of the channel
        allowEmpty: false, // default to false, set to true to allow empty item
        item: response.map((item) => ({
            // An article of the feed
            title: `Review of ${item.media.title.userPreferred} by ${item.user.name}`, //  The article title
            author: item.user.name, // Author of the article
            // category: author, // Article category
            description: item.body, // The article summary or content
            pubDate: new Date(item.createdAt * 1000).toUTCString(), // The article publishing datetime
            guid: item.id + item.createdAt, // The article unique identifier, optional, default to the article link below
            link: `https://anilist.co/review/${item.id}`, // The article link
        })),
    };
};
