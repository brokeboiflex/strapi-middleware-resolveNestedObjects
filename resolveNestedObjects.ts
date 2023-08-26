/**
 * `resolveNestedObjects` middleware
 */

import { Strapi } from "@strapi/strapi";

export default (config, { strapi }: { strapi: Strapi }) => {
  return async (ctx, next) => {
    const { method, originalUrl } = ctx.request;
    const parentObj = ctx.request.body.data;
    const slashCount = (originalUrl.match(/\//g) || []).length;

    if (method === "POST" && originalUrl.includes("/api/")) {
      if (slashCount === 2) {
        try {
          await strapi.db.transaction(async (transaction) => {
            try {
              const split = originalUrl.split("/");
              const contentType = split[2].slice(0, -1);

              // Recursive function to create nested objects and update IDs
              const createNestedObjects = async (data) => {
                for (const key in data) {
                  if (typeof data[key] === "object" && data[key] !== null) {
                    if (Array.isArray(data[key])) {
                      for (let i = 0; i < data[key].length; i++) {
                        const nestedObject = data[key][i];

                        await createNestedObjects(nestedObject);

                        const createdNestedObject = await strapi
                          .service(`api::${key}.${key}`)
                          .create({ data: nestedObject });

                        data[key][i] = createdNestedObject.id;
                      }
                    } else {
                      const nestedObject = data[key];
                      await createNestedObjects(nestedObject);
                      const createdNestedObject = await strapi
                        .service(`api::${key}.${key}`)
                        .create({
                          data: nestedObject,
                        });

                      data[key] = createdNestedObject.id;
                    }
                  }
                }
              };

              // Create nested objects and update IDs
              await createNestedObjects(parentObj);
              await strapi
                .service(`api::${contentType}.${contentType}`)
                .create({
                  data: parentObj,
                });

              await transaction.commit();
              // Respond with a success message
              ctx.status = 200;
              ctx.body = {
                message: "Object and nested objects created successfully.",
              };
            } catch (error) {
              await transaction.rollback(); // Rollback the transaction if there's an error
              ctx.status = 500;
              ctx.body = { data: null, error };
            }
          });
        } catch (error) {
          // Handle errors and provide a suitable response
          ctx.status = 500;
          ctx.body = "Internal Server Error";
        }
      } else {
        ctx.status = 500;
        ctx.body = "Internal Server Error";
      }
    } else if (method === "PUT" && originalUrl.includes("/api/")) {
      if (slashCount === 3) {
        try {
          await strapi.db.transaction(async (transaction) => {
            try {
              // Recursive function to create nested objects and update IDs
              const updateNestedObjects = async (data) => {
                for (const key in data) {
                  if (typeof data[key] === "object" && data[key] !== null) {
                    if (Array.isArray(data[key])) {
                      for (let i = 0; i < data[key].length; i++) {
                        const nestedObject = data[key][i];
                        await updateNestedObjects(nestedObject);
                        const updatedNestedObject = await strapi
                          .service(`api::${key}.${key}`)
                          .update(nestedObject.id, { data: nestedObject });

                        data[key][i] = updatedNestedObject.id;
                      }
                    } else {
                      const nestedObject = data[key];
                      await updateNestedObjects(nestedObject);

                      if (nestedObject.id) {
                        const updatedNestedObject = await strapi
                          .service(`api::${key}.${key}`)
                          .update(nestedObject.id, {
                            data: nestedObject,
                          });

                        data[key] = updatedNestedObject.id;
                      } else {
                        const updatedNestedObject = await strapi
                          .service(`api::${key}.${key}`)
                          .create({
                            data: nestedObject,
                          });

                        data[key] = updatedNestedObject.id;
                      }
                    }
                  }
                }
              };

              // Update nested objects and update IDs
              await updateNestedObjects(parentObj);
              // Update the request body with resolved IDs
              ctx.request.body.data = parentObj;

              await transaction.commit();
              await next();
            } catch (error) {
              console.log(error);

              await transaction.rollback(); // Rollback the transaction if there's an error
              ctx.status = 500;
              ctx.body = { data: null, error };
            }
          });
        } catch (error) {
          // Handle errors and provide a suitable response
          console.error(error);
          ctx.status = 500;
          ctx.body = "Internal Server Error";
        }
      } else {
        ctx.status = 500;
        ctx.body = "Internal Server Errore";
      }
    } else await next();
  };
};
