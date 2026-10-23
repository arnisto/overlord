export default {
  routes: [
    {
      method: 'POST',
      path: '/replies/:id/vote',
      handler: 'api::reply.reply.vote',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
  ],
};
