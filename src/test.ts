// runpodRequest.ts

import axios from 'axios';
import { getToken } from './get_token';

const requestData = {
    operationName: "getEndpoints",
    variables: {},
    query: `query getEndpoints {
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
}`
};

const makeRequest = async () => {
    const token = await getToken();
    const config = {
        headers: {
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'authorization': `Bearer ${token}`,
            'content-type': 'application/json',
            'origin': 'https://www.runpod.io',
            'priority': 'u=1, i',
            'referer': 'https://www.runpod.io/',
            'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'x-team-id': 'null'
        }
    };

    try {
        const response = await axios.post('https://api.runpod.io/graphql', requestData, config);
        console.log(response.data);
    } catch (error) {
        console.error('Error:', error);
    }
};

makeRequest();

