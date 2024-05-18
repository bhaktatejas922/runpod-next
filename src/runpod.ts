import { GraphQLClient, gql } from 'graphql-request';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from './get_token';
import { NextRequest, NextResponse } from 'next/server';

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

const createGraphQLClient = async () => {
  // Assuming `getToken` is a function that returns the token
  const token = await getToken(); // Implement this function to retrieve the token
  return new GraphQLClient('https://api.runpod.io/graphql', {
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${token}`,
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'origin': 'https://www.runpod.io',
      'referer': 'https://www.runpod.io/',
      'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'x-team-id': 'null',
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

  const client = await createGraphQLClient();

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
      idleTimeout: mergedConfig.idleTimeout,
      locations: mergedConfig.locations,
      name: mergedConfig.endpointName,
      scalerType: mergedConfig.scalerType,
      scalerValue: mergedConfig.scalerValue,
      // templateId: mergedConfig.templateId,
      workersMax: mergedConfig.workersMax,
      workersMin: mergedConfig.workersMin,
      template: {
        containerDiskInGb: 5, // Assuming a default value, adjust as needed
        containerRegistryAuthId: "", // Assuming a default value, adjust as needed
        dockerArgs: "", // Assuming a default value, adjust as needed
        env: [], // Assuming a default value, adjust as needed
        imageName: "runpod-torch-v21", // Assuming a default value, adjust as needed
        startScript: "", // Assuming a default value, adjust as needed
        name: `${mergedConfig.endpointName}__template`, // Assuming a default value, adjust as needed
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
  const client = await createGraphQLClient();

  const query = gql`
    query getEndpoints {
      myself {
        id
        serverlessDiscount {
          discountFactor
          type
          expirationDate
          __typename
        }
        endpoints {
          aiKey
          gpuIds
          allowedCudaVersions
          id
          idleTimeout
          locations
          name
          networkVolumeId
          pods {
            desiredStatus
            __typename
          }
          scalerType
          scalerValue
          templateId
          userId
          workersMax
          workersMin
          gpuCount
          instanceIds
          computeType
          template {
            containerDiskInGb
            containerRegistryAuthId
            dockerArgs
            env {
              key
              value
              __typename
            }
            imageName
            boundEndpointId
            __typename
          }
          executionTimeoutMs
          __typename
        }
        __typename
      }
    }
  `;

  try {
    const response = await client.request(query, {});
    const endpoint = response.myself.endpoints.find((ep: { name: string }) => ep.name === config.endpointName);
    return endpoint;
  } catch (error) {
    console.error('Error checking endpoint:', JSON.stringify(error, null, 2));
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


const routeToRunpod = async (req: NextRequest, res: NextResponse) => {
  const { RUNPOD_API_KEY } = process.env;
  const endpointPath = req.nextUrl.pathname;
  const endpointId = endpointStore[endpointPath];

  console.log(`Request URL: ${req.url}`);
  console.log(`Endpoint Path: ${endpointPath}`);
  console.log(`Retrieved endpointId: ${endpointId}`);
  console.log(`Endpoint Store: ${JSON.stringify(endpointStore)}`);

  if (!RUNPOD_API_KEY || !endpointId) {
    console.error('RUNPOD_API_KEY and endpointId must be defined.');
    return new NextResponse(JSON.stringify({ error: 'RUNPOD_API_KEY and endpointId must be defined.' }), { status: 500 });
  }

  const client = await createGraphQLClient();

  try {
    const variables = { input: await req.json(), endpointId };
    const response = await client.request(runpodQuery, variables);
    return new NextResponse(JSON.stringify(response.runFunction), { status: 200 });
  } catch (error: any) {
    console.error('Error running function:', JSON.stringify(error, null, 2));
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export { createEndpoint, checkEndpoint, routeToRunpod, endpointStore };
