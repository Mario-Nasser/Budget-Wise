import swaggerJsDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Budget-Wise API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  // Points at routes inside backEnd/routes/
  apis: ["./routes/*.ts"],
};

export default swaggerJsDoc(swaggerOptions);
