const { apiQueries, gotFetch } = require('./utils');

module.exports = async (ctx) => {
    const variables = !isNaN(ctx.params.categoryID) ? { id: ctx.params.categoryID } : {};
    const {
        data: {
            data: {
                Page: { threads: response },
            },
        },
    } = await gotFetch(apiQueries.forum.recent, variables);
    ctx.state.data = {
        title: `Anilist New Forum Threads`,
        link: `https://anilist.co/forum/new`,
        description: `Anilist Recent Forum Threads`,
        language: `en`,
        allowEmpty: false,
        item: response.map((item) => ({
            title: item.title,
            author: item.user.name,
            category: item.categories.map((category) => category.name),
            description: item.body,
            pubDate: new Date(item.createdAt * 1000).toUTCString(),
            guid: item.id + item.createdAt,
            link: `https://anilist.co/forum/thread/${item.id}`,
        })),
    };
};
