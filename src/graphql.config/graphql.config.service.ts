import { Injectable } from '@nestjs/common';
import { GqlOptionsFactory, GqlModuleOptions } from '@nestjs/graphql';
import * as ws from 'ws';
import {
  makeRemoteExecutableSchema,
  mergeSchemas,
  introspectSchema
} from 'graphql-tools';
import { HttpLink } from 'apollo-link-http';
import nodeFetch from 'node-fetch';
import { split, from, NextLink, Observable, FetchResult, Operation } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { OperationTypeNode, buildSchema as buildSchemaGraphql, GraphQLSchema, printSchema } from 'graphql';
import { setContext } from 'apollo-link-context';
import { SubscriptionClient, ConnectionContext } from 'subscriptions-transport-ws';
import * as moment from 'moment';
import { extend } from 'lodash';

import { ConfigService } from '../config';

declare const module: any;
interface IDefinitionsParams {
  operation?: OperationTypeNode;
  kind: 'OperationDefinition' | 'FragmentDefinition';
}
interface IContext {
  graphqlContext: {
    subscriptionClient: SubscriptionClient,
  };
}

@Injectable()
export class GqlConfigService implements GqlOptionsFactory {

  private remoteLink: string = 'https://countries.trevorblades.com';

  constructor(
    private readonly config: ConfigService
  ) {}

  async createGqlOptions(): Promise<GqlModuleOptions> {
    const remoteExecutableSchema = await this.createRemoteSchema();

    return {
      autoSchemaFile: 'schema.gql',
      transformSchema: async (schema: GraphQLSchema) => {
        return mergeSchemas({
          schemas: [
            schema,
            remoteExecutableSchema
          ]
        });
      },
      debug: true,
      playground: {
        env: this.config.environment,
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
        onConnect: async (connectionParams, webSocket: any, context) => {
          const subscriptionClient = new SubscriptionClient(this.config.get('HASURA_WS_URI'), {
            connectionParams: {
              ...connectionParams,
              ...context.request.headers
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
        const contextModified: any = {
          userRole: 'anonymous',
          currentUTCTime: moment().utc().format()
        };

        if (context && context.connection && context.connection.context) {
          contextModified.subscriptionClient = context.connection.context.subscriptionClient;
        }

        return contextModified;
      },
    };
  }

  private wsLink(operation: Operation, forward?: NextLink): Observable<FetchResult> | null {
    const context = operation.getContext();
    const { graphqlContext: { subscriptionClient } }: any = context;
    return subscriptionClient.request(operation);
  }

  private async createRemoteSchema(): Promise<GraphQLSchema> {

    const httpLink = new HttpLink({
      uri: this.remoteLink,
      fetch: nodeFetch as any,
    });

    const remoteIntrospectedSchema = await introspectSchema(httpLink);
    const remoteSchema = printSchema(remoteIntrospectedSchema);
    const link = split(
      ({ query }) => {
        const { kind, operation }: IDefinitionsParams = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
      },
      this.wsLink,
      httpLink,
    );

    const contextLink = setContext((request, prevContext) => {
      extend(prevContext.headers, {
        'X-hasura-Role': prevContext.graphqlContext.userRole,
        'X-Hasura-Utc-Time': prevContext.graphqlContext.currentUTCTime,
      });
      return prevContext;
    });

    const buildedHasuraSchema = buildSchemaGraphql(remoteSchema);
    const remoteExecutableSchema = makeRemoteExecutableSchema({
      link: from([contextLink, link]),
      schema: buildedHasuraSchema,
    });

    return remoteExecutableSchema;
  }

}
