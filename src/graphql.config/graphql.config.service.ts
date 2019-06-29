import { Injectable } from '@nestjs/common';
import { GqlOptionsFactory, GqlModuleOptions } from '@nestjs/graphql';
import { buildSchemaSync as buildSchemaTypeGraphql, buildTypeDefsAndResolvers } from 'type-graphql';

import { readFileSync } from 'fs';
import * as ws from 'ws';
import { join } from 'path';

import {
  makeRemoteExecutableSchema,
  transformSchema,
  FilterRootFields,
  mergeSchemas,
  makeExecutableSchema
} from 'graphql-tools';
import { HttpLink } from 'apollo-link-http';
import nodeFetch from 'node-fetch';
import { split, from } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { OperationTypeNode, buildSchema as buildSchemaGraphql } from 'graphql';
import { setContext } from 'apollo-link-context';
import { SubscriptionClient, ConnectionContext } from 'subscriptions-transport-ws';
import { CategoryResolver } from '../modules/category/Category.resolver';

const hasuraSchema = readFileSync(join(__dirname, '../../generated', 'remote-schema.gql'), 'utf8');
interface IDefinitionsParams {
  operation?: OperationTypeNode;
  kind: 'OperationDefinition' | 'FragmentDefinition';
}
interface IContext {
  graphqlContext: {
    subscriptionClient: SubscriptionClient,
  };
}
const wsLink = (operation: any, forward: any) => {
  const context = operation.getContext();
  const { graphqlContext: { subscriptionClient } }: IContext = context;
  return subscriptionClient.request(operation);
};

const createRemoteSchema = () => {
  const httpLink = new HttpLink({
    uri: 'https://lucasconstantino.github.io/graphiql-online/',
    fetch: nodeFetch as any,
  });

  const link = split(
    ({ query }) => {
      const { kind, operation }: IDefinitionsParams = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink as any,
    httpLink,
  );

  const buildedHasuraSchema = buildSchemaGraphql(hasuraSchema);
  const remoteExecutableSchema = makeRemoteExecutableSchema({
    // link: from([contextLink, link]),
    link,
    schema: buildedHasuraSchema,
  });

  const transformedSchema = transformSchema(
    remoteExecutableSchema,
    [
      new FilterRootFields((operation, fieldName) => {
        return (operation === 'Mutation') ? false : true; //  && fieldName === 'password'
      }),
    ],
  );
  return transformedSchema;
};

async function generateLocalExecutableSchema() {
  let typeDefs;
  let resolvers;
  try {
    const res = await buildTypeDefsAndResolvers({
      resolvers: [
        CategoryResolver
      ],
      emitSchemaFile: true
    });
    console.log(res.typeDefs);
    typeDefs = res.typeDefs;
    resolvers = res.resolvers;
  } catch (e) {
    console.log('e = ', e);
    throw new Error(e);
  }
  return makeExecutableSchema({ typeDefs, resolvers });
}

@Injectable()
export class GqlConfigService implements GqlOptionsFactory {
  async createGqlOptions(): Promise<GqlModuleOptions> {
    const localeExecutableSchema = await generateLocalExecutableSchema();
    const schema = mergeSchemas({
      schemas: [
        createRemoteSchema(),
        localeExecutableSchema
      ]
    });
    return {
      schema,
      debug: true,
      playground: {
        env: 'development',
        endpoint: '/graphql',
        subscriptionEndpoint: '/subscriptions',
        settings: {
          'general.betaUpdates': false,
          'editor.theme': 'dark' as any,
          'editor.reuseHeaders': true,
          'tracing.hideTracingResponse': true,
          'editor.fontSize': 14,
          // tslint:disable-next-line:quotemark
          'editor.fontFamily': "'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace",
          'request.credentials': 'include',
        },
      },
      tracing: true,
      installSubscriptionHandlers: true,
      introspection: true,
      subscriptions: {
        path: '/subscriptions',
        keepAlive: 10000,
        async onConnect(connectionParams, webSocket: any, context) {
          // TODO: тут нужно передать id и роль hasura
          const subscriptionClient = new SubscriptionClient('ws://lucasconstantino.github.io/graphiql-online/', {
            connectionParams: {
              ...connectionParams,
              ...context.request.headers,
            },
            reconnect: true,
            lazy: true,
          }, ws);

          return {
            subscriptionClient,
          };
        },
        async onDisconnect(webSocket, context: ConnectionContext) {
          const { subscriptionClient } = await context.initPromise;

          if (subscriptionClient) {
            subscriptionClient.close();
          }
        },
      },
      context(context) {
        const ctx = context.req || context.connection.context;
        return {
          ...context,
          ...ctx,
          req: context.req,
          res: context.res
        };
      },
    };
  }
}
