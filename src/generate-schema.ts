const { glob } = require('glob');
import { appendFileSync, readFileSync, writeFileSync } from 'fs';
import { unlink } from 'fs/promises';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { print } from 'graphql';

// Synchronously get all GraphQL files
const files = glob.sync('src/**/*graphql');

let typesArray: string[] = [];

// Delete existing schema file and create a new one
unlink('schema.graphql')
  .then(() => {
    writeFileSync(
      'schema.graphql', 
      '# generated Schema - do not edit # \n\n', 
      { flag: 'a+' }
    );

    // Read each GraphQL file and push its contents into typesArray
    files.forEach((filePath: string) => {
      const schema = readFileSync(filePath, { encoding: 'utf-8' });
      typesArray.push(schema);
    });

    // Merge type definitions and print the result
    const typeDefs = print(mergeTypeDefs(typesArray));

    // Append merged type definitions to schema file
    appendFileSync('schema.graphql', typeDefs);

    console.info('Graphql schema generated');
  })
  .catch((err) => {
    console.error('Error generating schema:', err);
  });