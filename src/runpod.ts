import { GraphQLClient, gql } from 'graphql-request';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from './get_token';

interface RunpodConfig {
  apiKey: string;
  endpointName: string;
  gpuIds: string;
  templateId: string;
  idleTimeout?: number;
  locations?: string;
  scalerType?: string;
  scalerValue?: number;
  workersMax?: number;
  workersMin?: number;
}

const defaultConfig: Partial<RunpodConfig> = {
  idleTimeout: 5,
  locations: 'US',
  scalerType: 'QUEUE_DELAY',
  scalerValue: 4,
  workersMax: 3,
  workersMin: 0,
};

const createGraphQLClient = async (apiKey: string) => {
  const token = await getToken();
  return new GraphQLClient('https://api.runpod.io/graphql', {
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${token}`
    },
  });
};

const createEndpoint = async (config: Partial<RunpodConfig>) => {
  const mergedConfig = { ...defaultConfig, ...config };

  if (!mergedConfig.apiKey) {
    console.error('RUNPOD_API_KEY must be specified.');
    throw new Error('RUNPOD_API_KEY must be specified.');
  }

  if (!mergedConfig.endpointName || !mergedConfig.gpuIds || !mergedConfig.templateId) {
    throw new Error('Endpoint name, GPU IDs, and template ID are required.');
  }

  const client = await createGraphQLClient(mergedConfig.apiKey);

  const mutation = gql`
    mutation saveEndpoint($input: EndpointInput!) {
      saveEndpoint(input: $input) {
        gpuIds
        id
        idleTimeout
        locations
        name
        networkVolumeId
        scalerType
        scalerValue
        templateId
        workersMax
        workersMin
      }
    }
  `;

  const variables = {
    input: {
      gpuIds: mergedConfig.gpuIds,
      gpuCount: 1,
      allowedCudaVersions: "",
      idleTimeout: mergedConfig.idleTimeout,
      locations: mergedConfig.locations,
      name: mergedConfig.endpointName,
      networkVolumeId: null,
      scalerType: mergedConfig.scalerType,
      scalerValue: mergedConfig.scalerValue,
      templateId: mergedConfig.templateId,
      workersMax: mergedConfig.workersMax,
      workersMin: mergedConfig.workersMin,
      executionTimeoutMs: 600000,
      template: {
        containerDiskInGb: 5,
        containerRegistryAuthId: "",
        dockerArgs: "",
        env: [],
        imageName: mergedConfig.templateId,
        startScript: "",
        name: `${mergedConfig.endpointName}__template`
      },
    },
  };

  try {
    const response = await client.request(mutation, variables);
    return response.saveEndpoint;
  } catch (error) {
    console.error('Error creating endpoint:', error.response?.errors || error.message);
    throw new Error('Failed to create endpoint');
  }
};

const checkEndpoint = async (config: RunpodConfig) => {
  const client = await createGraphQLClient(config.apiKey);

  const query = gql`
    query {
      myself {
        endpoints {
          id
          name
        }
      }
    }
  `;

  try {
    const response = await client.request(query);
    const endpoint = response.myself.endpoints.find((ep: { name: string }) => ep.name === config.endpointName);
    return endpoint;
  } catch (error) {
    console.error('Error checking endpoint:', error.response?.errors || error.message);
    throw new Error('Failed to check endpoint');
  }
};

const endpointStore: { [key: string]: string } = {};

const runpodQuery = gql`
  mutation runPodFunction($input: JSON!, $endpointId: String!) {
    runFunction(input: $input, endpointId: $endpointId) {
      result
      status
    }
  }
`;

const routeToRunpod = async (req: NextApiRequest, res: NextApiResponse) => {
  const { RUNPOD_API_KEY } = process.env;
  const endpointId = endpointStore[req.url || ''];

  if (!RUNPOD_API_KEY || !endpointId) {
    console.error('RUNPOD_API_KEY and endpointId must be defined.');
    if (!res.headersSent) {
      res.status(500).json({ error: 'RUNPOD_API_KEY and endpointId must be defined.' });
    }
    return;
  }

  const client = await createGraphQLClient(RUNPOD_API_KEY);

  try {
    const variables = { input: req.body, endpointId };
    const response = await client.request(runpodQuery, variables);

    if (!res.headersSent) {
      res.status(200).json(response.runFunction);
    }
  } catch (error: any) {
    console.error('Error running function:', error.response?.errors || error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

export { createEndpoint, checkEndpoint, routeToRunpod, endpointStore };