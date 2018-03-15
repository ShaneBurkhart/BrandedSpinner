const express = require('express');
const shopifyExpress = require('@shopify/shopify-express');
const { SQLStrategy } = require('@shopify/shopify-express/strategies');
const session = require('express-session');

const {
  SHOPIFY_APP_KEY,
  SHOPIFY_APP_HOST,
  SHOPIFY_APP_SECRET,
  NODE_ENV,
} = process.env;

const knexConfig = {
  client: 'pg',
  version: '10.3',
  connection: {
    host: "pg",
    user: "postgres",
    password: "postgres",
    database: "mydb",
  }
};

const sqlStrategy = new SQLStrategy(knexConfig);
const knex = sqlStrategy.knex;
const app = express();

// Override this function since the library doesn't handle it.
sqlStrategy.storeShop = function storeShop({ shop, accessToken, data = {} }, done) {
  // The unique constraint on the shopify_domain column will ignore duplicates.
  knex.raw(
      `INSERT INTO shops (shopify_domain, access_token) VALUES ('${shop}', '${accessToken}')`
  ).then(result => {
    return done(null, accessToken);
  });
};

// session is necessary for api proxy and auth verification
app.use(session({
  secret: SHOPIFY_APP_SECRET,
  resave: false,
  saveUninitialized: true,
}));

const { routes, middleware: { withShop } } = shopifyExpress({
  shopStore: sqlStrategy,
  host: SHOPIFY_APP_HOST,
  apiKey: SHOPIFY_APP_KEY,
  secret: SHOPIFY_APP_SECRET,
  scope: ['write_script_tags'],
  accessMode: 'offline',
  afterAuth(request, response) {
    const { session: { accessToken, shop } } = request;
    // TODO(shaneburkhart) add script tag to their store if doesn't exist
    // TODO(shaneburkhart) make sure to add a unique identifier
    // install webhooks or hook into your own app here
    return response.redirect('/');
  },
});

app.get('/', function (req, res) { res.redirect('/app'); });
app.get('/install', function (req, res) {
  res.redirect("https://inventoryforecaster.myshopify.com/admin/oauth/authorize?client_id=8abdbbf405d9090fe76a6aa08a95803f&scope=write_script_tags&redirect_uri=http://127.0.0.1:3000/shopify/auth&state=12345");
});

// mounts '/auth' and '/api' off of '/'
app.use('/shopify', routes);

var appRoutes = express.Router();

appRoutes.get('/', function (req, res) {
  // TODO(shaneburkhart) Settings page
  res.send('Hello world!');
});

// shields myAppMiddleware from being accessed without session
app.use('/app', withShop({ authBaseUrl: '/shopify' }), appRoutes);

// TODO(shaneburkhart) route to get form settings
// TODO(shaneburkhart) with request forgery connected to their store name

// TODO(shaneburkhart) form submission route

app.listen(3000, () => console.log('Example app listening on port 3000!'))
