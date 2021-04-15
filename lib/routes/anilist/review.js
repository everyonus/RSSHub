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
        title: `Anilist Recent Reviews`,
        link: `https://anilist.co/reviews`,
        description: `Recent reviews`,
        language: `en`,
        allowEmpty: false,
        item: response.map((item) => ({
            title: `Review of ${item.media.title.userPreferred} by ${item.user.name}`,
            author: item.user.name,
            description: item.body,
            pubDate: new Date(item.createdAt * 1000).toUTCString(),
            guid: item.id + item.createdAt,
            link: `https://anilist.co/review/${item.id}`,
        })),
    };
};
