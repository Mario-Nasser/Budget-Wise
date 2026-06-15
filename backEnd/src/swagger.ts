import path from 'path';

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Financial Report API", version: "1.0.0" },
    servers: [{ url: "https://your-vercel-url.vercel.app" }],
  },
  apis: [path.join(__dirname, './routes/*.js')],  // .js for compiled output
};
