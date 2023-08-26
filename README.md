# resolveNestedObjects Middleware

The `resolveNestedObjects` middleware is designed to handle resolving and creating nested objects in Strapi. This middleware is particularly useful when dealing with complex data structures and relationships in your API endpoints.

## Assumptions / Prerequisites
CRUD operations in Strapi require strings formated like that: `api::article.article` notice that `article` is **singular**.
This middleware is based on object keys of the parent object, so it requires them to reflect type names of thr nested objects.

For example if you have a parent object `cart` and nested field `content` which is related to object `product` this middleware will not work unless you rename `content` to `product`. 


## Installation

To use the `resolveNestedObjects` middleware, follow these steps:

1. Copy the content of the provided middleware code.

2. Create a new file named `resolveNestedObjects.js` in your Strapi project's `src/middlewares` directory.

3. Paste the copied code into the `resolveNestedObjects.js` file.
  
4. In your Strapi project, navigate to the `config/middleware.ts` file.

5. Register the middleware by adding `global::resolveNestedObjects` to the end of the list:

   ```javascript
   module.exports =  [
     // Other middleware configurations...
     "global::resolveNestedObjects"
   ];
