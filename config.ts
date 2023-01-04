export default () => ({
  jwt_secret: process.env.SECRET_KEY || 'secret',
});
