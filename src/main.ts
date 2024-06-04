import * as dotenv from 'dotenv';
import 'reflect-metadata';

import { appModule } from './module';

dotenv.config();

const bootstrap = async () => {
  const { httpServer, server } = await appModule.startApollo();

  if(!process.env.JWT_KEY) {
    throw new Error('Database Error!');
  }

  httpServer.listen(4000, () => {
    console.log(`server is running at http://localhost:4000/graphql/${server.graphqlPath}`)
  });
};

bootstrap();